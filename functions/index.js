// CuratorOdyssey Cloud Functions - 실제 작동 우선 간단 구현
// Alex Chen - 이론보다 실제 작동에 집중

const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Firebase 초기화
initializeApp();
const db = getFirestore();

// 기존 완벽한 목업 데이터 직접 활용 (P2 침범 방지)
const mockArtistData = {
  'ARTIST_0005': {
    artist_id: "ARTIST_0005",
    name: "양혜규",
    radar5: { I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8 },
    sunburst_l1: { 제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0 },
    weights_version: "AHP_v1",
    updated_at: "2024-10-16T00:00:00Z"
  },
  'ARTIST_0003': {
    artist_id: "ARTIST_0003", 
    name: "이우환",
    radar5: { I: 92.5, F: 85.0, A: 87.0, M: 81.0, Sedu: 14.8 },
    sunburst_l1: { 제도: 86.2, 학술: 83.0, 담론: 81.0, 네트워크: 85.0 },
    weights_version: "AHP_v1",
    updated_at: "2024-10-16T00:00:00Z"
  }
};

// 응답 래퍼 헬퍼 함수 (API 스펙 준수)
function wrapResponse(data, meta = {}) {
  return {
    data: data,
    meta: {
      hits: Array.isArray(data) ? data.length : (data ? 1 : 0),
      response_time: Date.now(),
      ...meta
    }
  };
}

// 📊 GET /api/artist/:id/summary (1016blprint.md STEP 2)
exports.getArtistSummary = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    // Path parameter 파싱: Firebase Hosting rewrites는 /api/artist/*/summary 패턴 사용
    // 쿼리 스트링 제거 후 파싱
    const urlParts = req.url.split('?')[0].split('/').filter(part => part);
    // URL 구조: ['api', 'artist', '{id}', 'summary']
    const artistId = urlParts[2] || req.query.id || req.query.artistId || 'ARTIST_0005';
    console.log(`👨‍🎨 작가 요약 요청: ${artistId}`);
    
    // 🤝 Dr. Sarah Kim 존중: P2 컬렉션 우선 확인
    try {
      const p2Doc = await db.collection('artist_summary').doc(artistId).get();
      if (p2Doc.exists) {
        console.log('🎉 P2 실제 데이터 사용');
        const firestoreData = p2Doc.data();
        return res.status(200).json(wrapResponse(firestoreData, {
          source: 'firestore'
        }));
      }
    } catch (p2Error) {
      console.log('⏳ P2 대기 중 - 기존 목업 사용');
    }
    
    // 기존 목업 데이터 사용
    const data = mockArtistData[artistId];
    
    if (!data) {
      return res.status(404).json({ 
        error: `작가 ${artistId}를 찾을 수 없습니다.`,
        available_artists: Object.keys(mockArtistData)
      });
    }
    
    console.log(`✅ 성공: ${data.name} (기존 목업)`);
    return res.status(200).json(wrapResponse(data, {
      source: 'mock'
    }));
    
  } catch (error) {
    console.error('❌ API 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 📈 GET /api/artist/:id/timeseries/:axis (FR-P2-TIM-001)
exports.getArtistTimeseries = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    // Path parameter 파싱: Firebase Hosting rewrites는 /api/artist/*/timeseries/* 패턴 사용
    // 쿼리 스트링 제거 후 파싱
    const urlParts = req.url.split('?')[0].split('/').filter(part => part);
    // URL 구조: ['api', 'artist', '{id}', 'timeseries', '{axis}']
    const artistId = urlParts[2] || req.query.id || req.query.artistId || 'ARTIST_0005';
    const axis = urlParts[4] || req.query.axis || '제도';
    
    // 입력 검증
    if (!artistId || !axis) {
      return res.status(400).json({ 
        error: 'Missing required parameters: id and axis',
        code: 'ERR_MISSING_PARAMS'
      });
    }
    
    // artist_id 패턴 검증
    if (!/^ARTIST_\d{4}$/.test(artistId)) {
      return res.status(400).json({ 
        error: 'Invalid artist_id format. Expected pattern: ARTIST_XXXX',
        code: 'ERR_INVALID_ARTIST_ID'
      });
    }
    
    // axis enum 검증
    const validAxes = ['제도', '학술', '담론', '네트워크'];
    if (!validAxes.includes(axis)) {
      return res.status(400).json({ 
        error: `Invalid axis. Expected one of: ${validAxes.join(', ')}`,
        code: 'ERR_INVALID_AXIS'
      });
    }
    
    console.log(`📈 시계열 요청: ${artistId} - ${axis}`);
    
    // Firestore에서 timeseries 데이터 조회
    try {
      const timeseriesId = `${artistId}_${axis}`;
      const timeseriesDoc = await db.collection('timeseries')
        .doc(timeseriesId)
        .get();
      
      if (timeseriesDoc.exists) {
        const data = timeseriesDoc.data();
        console.log(`✅ Firestore 시계열 데이터 사용: ${timeseriesId}`);
        
        // 응답 형식 문서 스펙 준수
        return res.status(200).json(wrapResponse({
          artist_id: data.artist_id || artistId,
          axis: data.axis || axis,
          bins: data.bins || [],
          window_applied: data.window_applied || {
            type: "10y_weighted",
            boost: 1.0
          },
          version: data.version || "v1.0"
        }, {
          source: 'firestore',
          hits: data.bins?.length || 0
        }));
      }
    } catch (firestoreError) {
      console.log('⏳ Firestore 조회 실패, 목업 데이터 사용:', firestoreError.message);
    }
    
    // Firestore 데이터가 없을 경우 목업 데이터 반환 (임시)
    // TODO: 배치 함수(fnBatchTimeseries) 실행 후 제거 필요
    console.log('⚠️ Firestore 데이터 없음, 목업 데이터 반환');
    const timeseriesData = {
      artist_id: artistId,
      axis: axis,
      bins: [
        { t: 0, v: 12.5 },
        { t: 5, v: 34.7 },
        { t: 10, v: 67.2 },
        { t: 15, v: 88.4 },
        { t: 20, v: 94.0 }
      ],
      window_applied: {
        type: "10y_weighted",
        boost: 1.0
      },
      version: "v1.0"
    };
    
    return res.status(200).json(wrapResponse(timeseriesData, {
      source: 'mock',
      hits: timeseriesData.bins.length,
      _mock_data: true
    }));
    
  } catch (error) {
    console.error('❌ 시계열 API 오류:', error);
    return res.status(500).json({ 
      error: 'Timeseries retrieval error',
      code: 'ERR_TIMESERIES_RETRIEVAL',
      message: error.message
    });
  }
});

// 🤖 POST /api/report/generate (1016blprint.md STEP 6) - Vertex AI 실제 연동
exports.generateAiReport = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  
  try {
    console.log('🤖 AI 보고서 생성 요청 (Vertex AI 연동)');
    
    const { artistA_data, artistB_data, comparison_analysis } = req.body;
    
    if (!artistA_data) {
      return res.status(400).json({ 
        error: 'artistA_data가 필요합니다.',
        example: { artistA_data: { name: "작가명", radar5: {}, sunburst_l1: {} }}
      });
    }
    
    // Vertex AI 서비스 초기화 및 호출
    const VertexAIService = require('./src/services/vertexAIService');
    const vertexAI = new VertexAIService();
    
    console.log(`🚀 Vertex AI Gemini 호출 시작: ${artistA_data.name}`);
    
    const result = await vertexAI.generateComprehensiveReport(
      artistA_data, 
      artistB_data, 
      comparison_analysis
    );
    
    console.log(`✅ AI 보고서 생성 완료: ${artistA_data.name}`, {
      model: result.model,
      processing_time: result.processing_time_ms,
      tokens: result.estimated_tokens,
      fallback_used: result.fallback_used || false
    });
        
    return res.status(200).json(wrapResponse(result, {
      source: 'vertex_ai',
      model: result.model,
      processing_time: result.processing_time_ms,
      tokens: result.estimated_tokens
    }));
        
  } catch (error) {
    console.error('❌ AI 보고서 오류:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 🔍 헬스체크 (기본 + Vertex AI)
exports.healthCheck = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    // Vertex AI 헬스체크
    const VertexAIService = require('./src/services/vertexAIService');
    const vertexAI = new VertexAIService();
    const vertexHealth = await vertexAI.checkHealth();
    
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      available_endpoints: [
        'getArtistSummary',
        'getArtistTimeseries', 
        'generateAiReport',
        'healthCheck'
      ],
      p2_collaboration_ready: true,
      vertex_ai: vertexHealth
    });
  } catch (error) {
    console.error('❌ 헬스체크 오류:', error);
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      available_endpoints: [
        'getArtistSummary',
        'getArtistTimeseries', 
        'generateAiReport',
        'healthCheck'
      ],
      p2_collaboration_ready: true,
      vertex_ai: {
        status: 'error',
        error: error.message
      }
    });
  }
});

// 📊 GET /api/artist/:id/sunburst (P3 Maya Chen용)
exports.getArtistSunburst = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    // Path parameter 파싱: Firebase Hosting rewrites는 /api/artist/*/sunburst 패턴 사용
    // 쿼리 스트링 제거 후 파싱
    const urlParts = req.url.split('?')[0].split('/').filter(part => part);
    // URL 구조: ['api', 'artist', '{id}', 'sunburst']
    const artistId = urlParts[2] || req.query.id || req.query.artistId || 'ARTIST_0005';
    console.log(`🌅 선버스트 데이터 요청: ${artistId}`);
    
    // P2 데이터 우선 확인
    try {
      const p2Doc = await db.collection('artist_sunburst').doc(artistId).get();
      if (p2Doc.exists) {
        console.log('🎉 P2 선버스트 데이터 사용');
        const firestoreData = p2Doc.data();
        return res.status(200).json(wrapResponse(firestoreData, {
          source: 'firestore'
        }));
      }
    } catch (p2Error) {
      console.log('⏳ P2 대기 중 - 목업 선버스트 사용');
    }
    
    // 목업 선버스트 데이터 (P3 UI 호환)
    const artist = mockArtistData[artistId];
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    const sunburstData = {
      artist_id: artistId,
      name: artist.name,
      sunburst_l1: artist.sunburst_l1,
      sunburst_l2: {
        제도: {
          기관전시: Math.round(artist.sunburst_l1.제도 * 0.7),
          페어: Math.round(artist.sunburst_l1.제도 * 0.3)
        },
        학술: {
          수상: Math.round(artist.sunburst_l1.학술 * 0.6),
          논문: Math.round(artist.sunburst_l1.학술 * 0.4)
        },
        담론: {
          미디어: Math.round(artist.sunburst_l1.담론 * 0.8),
          비평: Math.round(artist.sunburst_l1.담론 * 0.2)
        },
        네트워크: {
          협업: Math.round(artist.sunburst_l1.네트워크 * 0.5),
          멘토링: Math.round(artist.sunburst_l1.네트워크 * 0.5)
        }
      },
      weights_version: artist.weights_version,
      updated_at: artist.updated_at,
      _p3_ui_compatible: true
    };
    
    console.log('✅ 선버스트 데이터 반환 완료');
    return res.status(200).json(wrapResponse(sunburstData, {
      source: 'mock'
    }));
    
  } catch (error) {
    console.error('❌ 선버스트 오류:', error);
    return res.status(500).json({ error: 'Sunburst data error' });
  }
});

// 📊 GET /api/compare/:artistA/:artistB/:axis (FR-P3-CMP-001)
exports.getCompareArtists = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    // Path parameter 파싱: Firebase Hosting rewrites는 /api/compare/*/*/* 패턴 사용
    // 쿼리 스트링 제거 후 파싱
    const urlParts = req.url.split('?')[0].split('/').filter(part => part);
    // URL 구조: ['api', 'compare', '{artistA}', '{artistB}', '{axis}']
    const artistA = urlParts[2] || req.params.artistA;
    const artistB = urlParts[3] || req.params.artistB;
    const axis = urlParts[4] || req.query.axis || req.params.axis || 'all';
    const forceCompute = req.query.compute === 'true';
    
    // 입력 검증
    if (!artistA || !artistB) {
      return res.status(400).json({ 
        error: 'Missing required parameters: artistA and artistB',
        code: 'ERR_MISSING_PARAMS'
      });
    }
    
    // artist_id 패턴 검증
    if (!/^ARTIST_\d{4}$/.test(artistA) || !/^ARTIST_\d{4}$/.test(artistB)) {
      return res.status(400).json({ 
        error: 'Invalid artist_id format. Expected pattern: ARTIST_XXXX',
        code: 'ERR_INVALID_ARTIST_ID'
      });
    }
    
    // axis enum 검증 (all이 아닌 경우)
    if (axis !== 'all') {
      const validAxes = ['제도', '학술', '담론', '네트워크'];
      if (!validAxes.includes(axis)) {
        return res.status(400).json({ 
          error: `Invalid axis. Expected one of: ${validAxes.join(', ')}, or 'all'`,
          code: 'ERR_INVALID_AXIS'
        });
      }
    }
    
    console.log(`⚖️ 아티스트 비교 요청: ${artistA} vs ${artistB} (${axis})`);
    
    // P2 비교 데이터 우선 확인 (forceCompute가 false인 경우)
    if (!forceCompute) {
      try {
        const pairId = axis === 'all' 
          ? `${artistA}_vs_${artistB}` 
          : `${artistA}_vs_${artistB}_${axis}`;
        const p2Doc = await db.collection('compare_pairs').doc(pairId).get();
        
        if (p2Doc.exists) {
          const cachedData = p2Doc.data();
          console.log('🎉 P2 비교 데이터 사용 (캐시)');
          
          // 문서 스펙에 맞는 응답 형식으로 변환
          const firestoreData = {
            pair_id: cachedData.pair_id || pairId,
            axis: cachedData.axis || axis,
            series: cachedData.series || [],
            metrics: cachedData.metrics || {
              correlation: cachedData.correlation || null,
              abs_diff_sum: cachedData.abs_diff_sum || 0,
              auc: cachedData.auc || null
            },
            cached: true,
            computed_at: cachedData.computed_at || cachedData.calculated_at || new Date().toISOString()
          };
          return res.status(200).json(wrapResponse(firestoreData, {
            source: 'firestore',
            cache_hit: true
          }));
        }
      } catch (p2Error) {
        console.log('⏳ P2 대기 중 - 실시간 계산:', p2Error.message);
      }
    }
    
    // 목업 비교 데이터 생성 (임시, 실제로는 timeseries 데이터로 계산 필요)
    const artistAData = mockArtistData[artistA];
    const artistBData = mockArtistData[artistB];
    
    if (!artistAData || !artistBData) {
      return res.status(404).json({ 
        error: 'One or both artists not found',
        code: 'ERR_ARTIST_NOT_FOUND'
      });
    }
    
    // 문서 스펙에 맞는 응답 형식으로 변환
    // TODO: 실제 timeseries 데이터로 series 계산 필요
    const series = [
      { t: 0, v_A: 0.1, v_B: 0.2, diff: -0.1 },
      { t: 5, v_A: 0.45, v_B: 0.5, diff: -0.05 },
      { t: 10, v_A: 0.7, v_B: 0.75, diff: -0.05 }
    ];
    
    const comparisonData = {
      pair_id: `${artistA}_vs_${artistB}${axis !== 'all' ? `_${axis}` : ''}`,
      axis: axis,
      series: series,
      metrics: {
        correlation: 0.85,
        abs_diff_sum: series.reduce((sum, item) => sum + Math.abs(item.diff), 0),
        auc: 0.78
      },
      cached: false,
      computed_at: new Date().toISOString()
    };
    
    console.log('✅ 비교 데이터 반환 완료 (실시간 계산)');
    return res.status(200).json(wrapResponse(comparisonData, {
      source: 'mock',
      cache_hit: false,
      _mock_data: true
    }));
    
  } catch (error) {
    console.error('❌ 비교 분석 오류:', error);
    return res.status(500).json({ 
      error: 'Comparison analysis error',
      code: 'ERR_COMPARISON_ANALYSIS',
      message: error.message
    });
  }
});

// 제거됨: POST /api/ai/vertex-generate
// 제거됨: GET /api/ai/vertex-health
// 이 엔드포인트들은 문서에 정의되지 않았으며, 다른 엔드포인트로 통합되었습니다.
// 내부 로직은 functions/src/services/vertexAIService.js에서 계속 사용 가능합니다.

console.log('🚀 CuratorOdyssey Functions 완전 구현 로드 완료');
console.log('📡 활성 엔드포인트: getArtistSummary, getArtistSunburst, getArtistTimeseries, getCompareArtists, generateAiReport, healthCheck');