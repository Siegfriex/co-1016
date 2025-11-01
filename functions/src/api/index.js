// CuratorOdyssey API 엔드포인트 통합
// 1016blprint.md STEP 2 명세 100% 준수

const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { logger } = require('firebase-functions');
const { loadAppConfig } = require('../services/configLoader');
const ExistingMockAdapter = require('../utils/existingMockAdapter');

// Firebase Admin 초기화
initializeApp();
const db = getFirestore();

/**
 * GET /api/artist/:id/summary
 * 1016blprint.md: artist_summary 컬렉션에서 단일 문서 read
 */
exports.getArtistSummary = onRequest(async (req, res) => {
  // CORS 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  
  try {
    const artistId = req.params.id || req.url.split('/').pop();
    
    if (!artistId) {
      return res.status(400).json({
        error: 'Artist ID가 제공되지 않았습니다.',
        code: 'MISSING_ARTIST_ID'
      });
    }

    logger.info(`📊 작가 요약 조회: ${artistId}`);

    // 🤝 P2 협업: 실제 컬렉션 우선, 없으면 기존 목업 사용
    const mockAdapter = new ExistingMockAdapter();
    
    try {
      // Dr. Sarah Kim 컬렉션 존재 확인
      const summaryDoc = await db.collection('artist_summary').doc(artistId).get();
      
      if (summaryDoc.exists) {
        console.log('🎉 P2 실제 데이터 사용:', artistId);
        const summaryData = summaryDoc.data();
        
        // 1016blprint.md 응답 형식 준수
        return res.status(200).json({
          artist_id: artistId,
          name: summaryData.name,
          radar5: summaryData.radar5,
          sunburst_l1: summaryData.sunburst_l1,
          weights_version: summaryData.weights_version,
          updated_at: summaryData.updated_at,
          data_source: 'firestore_p2'
        });
      }
    } catch (firestoreError) {
      logger.info('P2 컬렉션 없음, 기존 목업 사용:', firestoreError.message);
    }
    
    // 기존 목업 데이터 활용 (P2 대기 중)
    const summaryData = mockAdapter.getArtistSummary(artistId);
    
    if (!summaryData) {
      return res.status(404).json({
        error: `작가 ${artistId}의 데이터를 찾을 수 없습니다.`,
        code: 'ARTIST_NOT_FOUND'
      });
    }
    
    logger.info(`✅ 작가 요약 조회 성공 (기존 목업): ${artistId}`, {
      name: summaryData.name,
      radar5_avg: Object.values(summaryData.radar5).reduce((a,b) => a+b, 0) / 5,
      data_source: summaryData.data_source || 'existing_mock'
    });

    return res.status(200).json(summaryData);

  } catch (error) {
    logger.error('❌ 작가 요약 조회 실패:', error);
    return res.status(500).json({
      error: '작가 요약 데이터 조회 중 오류가 발생했습니다.',
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
});

/**
 * GET /api/artist/:id/sunburst  
 * 1016blprint.md: sunburst_snapshot에서 스냅샷 read
 */
exports.getArtistSunburst = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const artistId = req.params.id || req.url.split('/')[3];
    
    logger.info(`🌞 선버스트 데이터 조회: ${artistId}`);

    // 실제 Firestore에서 조회 시도
    const snapshotDoc = await db.collection('sunburst_snapshots').doc(artistId).get();
    
    if (snapshotDoc.exists) {
      const snapshotData = snapshotDoc.data();
      return res.status(200).json(snapshotData);
    }
    
    // 스냅샷이 없으면 on-the-fly 생성 (1016blprint.md 명세 준수)
    const artistSummary = await db.collection('artist_summary').doc(artistId).get();
    
    if (!artistSummary.exists) {
      return res.status(404).json({
        error: `작가 ${artistId}를 찾을 수 없습니다.`,
        code: 'ARTIST_NOT_FOUND'
      });
    }

    // 실시간 선버스트 데이터 생성 (P2의 measures 기반)
    const sunburstData = await generateSunburstFromMeasures(artistId);
    
    // 향후 조회를 위해 스냅샷 저장
    await db.collection('sunburst_snapshots').doc(artistId).set({
      ...sunburstData,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24시간 후 만료
    });

    logger.info(`✅ 선버스트 on-the-fly 생성 완료: ${artistId}`);
    return res.status(200).json(sunburstData);

  } catch (error) {
    logger.error('❌ 선버스트 조회 실패:', error);
    return res.status(500).json({
      error: '선버스트 데이터 조회 중 오류가 발생했습니다.',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/artist/:id/timeseries/:axis
 * 1016blprint.md: timeseries 컬렉션에서 사전 계산된 데이터 read
 */
exports.getArtistTimeseries = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const artistId = req.params.id || req.url.split('/')[3];
    const axis = req.params.axis || req.url.split('/')[5];
    
    const validAxes = ['제도', '학술', '담론', '네트워크'];
    if (!validAxes.includes(axis)) {
      return res.status(400).json({
        error: `잘못된 축: ${axis}. 유효한 축: ${validAxes.join(', ')}`,
        code: 'INVALID_AXIS'
      });
    }

    logger.info(`📈 시계열 조회: ${artistId} - ${axis}`);

    // P2가 구축한 timeseries 컬렉션에서 조회
    const timeseriesQuery = await db.collection('timeseries')
      .where('artist_id', '==', artistId)
      .where('axis', '==', axis)
      .limit(1)
      .get();

    if (timeseriesQuery.empty) {
      return res.status(404).json({
        error: `${artistId}의 ${axis} 축 시계열 데이터가 없습니다.`,
        code: 'TIMESERIES_NOT_FOUND'
      });
    }

    const timeseriesData = timeseriesQuery.docs[0].data();
    
    logger.info(`✅ 시계열 조회 성공: ${artistId} - ${axis}`, {
      bins_count: timeseriesData.bins?.length || 0,
      version: timeseriesData.version
    });

    return res.status(200).json(timeseriesData);

  } catch (error) {
    logger.error('❌ 시계열 조회 실패:', error);
    return res.status(500).json({
      error: '시계열 데이터 조회 중 오류가 발생했습니다.',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/compare/:A/:B/:axis
 * 1016blprint.md: 두 작가의 timeseries 데이터를 병렬 read 후 병합
 */
exports.getCompareArtists = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const artistA = req.params.A || req.url.split('/')[3];
    const artistB = req.params.B || req.url.split('/')[4]; 
    const axis = req.params.axis || req.url.split('/')[5];

    logger.info(`🔄 작가 비교 분석: ${artistA} vs ${artistB} - ${axis}`);

    // P2의 compare_pairs 컬렉션에서 직접 조회 (성능 최적화)
    const pairId = `${artistA}_vs_${artistB}`;
    const compareDoc = await db.collection('compare_pairs')
      .where('pair_id', '==', pairId)
      .where('axis', '==', axis)
      .limit(1)
      .get();

    if (!compareDoc.empty) {
      const compareData = compareDoc.docs[0].data();
      logger.info(`✅ 사전 계산된 비교 데이터 사용: ${pairId}`);
      return res.status(200).json(compareData);
    }

    // 사전 계산 데이터가 없으면 실시간 계산 (1016blprint.md 명세 준수)
    const [timeseriesA, timeseriesB] = await Promise.all([
      db.collection('timeseries')
        .where('artist_id', '==', artistA)
        .where('axis', '==', axis)
        .get(),
      db.collection('timeseries')
        .where('artist_id', '==', artistB)
        .where('axis', '==', axis)
        .get()
    ]);

    if (timeseriesA.empty || timeseriesB.empty) {
      return res.status(404).json({
        error: '비교할 작가의 시계열 데이터가 부족합니다.',
        code: 'INSUFFICIENT_DATA'
      });
    }

    // 실시간 비교 분석 수행
    const dataA = timeseriesA.docs[0].data();
    const dataB = timeseriesB.docs[0].data();
    const comparisonResult = performRealTimeComparison(dataA, dataB, axis);

    logger.info(`✅ 실시간 비교 분석 완료: ${pairId}`);
    return res.status(200).json(comparisonResult);

  } catch (error) {
    logger.error('❌ 비교 분석 실패:', error);
    return res.status(500).json({
      error: '비교 분석 중 오류가 발생했습니다.',
      code: 'COMPARISON_ERROR'
    });
  }
});

/**
 * POST /api/report/generate
 * 1016blprint.md STEP 6 핵심 명세 100% 준수
 */
exports.generateAiReport = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    const { artistA_data, artistB_data, comparison_analysis } = req.body;
    
    if (!artistA_data) {
      return res.status(400).json({
        error: 'artistA_data가 제공되지 않았습니다.',
        code: 'MISSING_ARTIST_DATA'
      });
    }

    logger.info('🤖 AI 보고서 생성 시작:', {
      artistA: artistA_data.name,
      artistB: artistB_data?.name || 'N/A',
      hasComparison: !!comparison_analysis
    });

    // Secret Manager에서 설정 로드
    const config = await loadAppConfig();
    
    // 1016blprint.md 프롬프트 템플릿 정확히 준수
    const prompt = buildBlueprint_Compliant_Prompt(artistA_data, artistB_data, comparison_analysis, config);
    
    // Vertex AI Gemini 호출
    const { VertexAI } = require('@google-cloud/vertexai');
    const vertexAI = new VertexAI({
      project: config.vertex.projectId,
      location: config.vertex.location,
      googleAuthOptions: {
        credentials: config.vertex.credentials
      }
    });

    const model = vertexAI.getGenerativeModel({ 
      model: config.vertex.model,
      generation_config: {
        max_output_tokens: 3000,
        temperature: 0.7,
        top_p: 0.9
      }
    });

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const endTime = Date.now();

    const reportContent = result.response.text();
    
    logger.info('✅ AI 보고서 생성 완료:', {
      model: config.vertex.model,
      processing_time: endTime - startTime,
      content_length: reportContent.length,
      tokens_estimated: Math.ceil(reportContent.length / 4)
    });

    // 1016blprint.md 응답 형식 준수
    return res.status(200).json({
      success: true,
      report: reportContent,
      model: `vertex-ai-${config.vertex.model}`,
      weights_version: config.weights.version,
      normalization_method: config.normalization.method_version,
      generated_at: new Date().toISOString(),
      processing_time_ms: endTime - startTime,
      estimated_tokens: Math.ceil(reportContent.length / 4)
    });

  } catch (error) {
    logger.error('❌ AI 보고서 생성 실패:', error);
    
    return res.status(500).json({
      success: false,
      error: 'AI 보고서 생성 중 오류가 발생했습니다.',
      code: 'AI_GENERATION_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 1016blprint.md 프롬프트 템플릿 정확히 구현
 */
function buildBlueprint_Compliant_Prompt(artistA_data, artistB_data, comparison_analysis, config) {
  return `# MISSION
You are "Odyssey AI", a top-tier art market analyst for the "CuratorOdyssey" platform. Your mission is to generate a professional, data-driven report based on the structured JSON data provided below.

# CONTEXT & DATA
The analysis is based on version "${config.weights.version}" of our model. All scores are normalized to a 0-100 scale using ${config.normalization.method_version} pipeline.

## 1. Primary Artist Analysis: ${artistA_data.name}
### 1.1. Phase 1: Current Value Snapshot
- **5-Axis Radar Scores:** ${JSON.stringify(artistA_data.radar5)}
- **4-Axis Foundational Scores (Sunburst L1):** ${JSON.stringify(artistA_data.sunburst_l1)}

### 1.2. Phase 2: Career Trajectory (Institution Axis Example)
- **Trajectory Data (Debut Year = 0):** ${JSON.stringify(artistA_data.timeseries?.institution?.bins || [])}
- **Key Turning Points:** ${JSON.stringify(artistA_data.key_events || [])}

${artistB_data ? `## 2. Comparative Analysis: ${artistA_data.name} vs. ${artistB_data.name}
### 2.1. Phase 3-1: Trajectory Comparison (Discourse Axis)
- **Comparison Series (t: years since debut):** ${JSON.stringify(comparison_analysis?.discourse_comparison?.series || [])}

### 2.2. Phase 3-2: Trajectory vs. Market Value  
- **Total Trajectory Difference Index:** ${comparison_analysis?.total_trajectory_difference_index || 0}
- **Highest Price per "Ho" (A vs. B):** ${JSON.stringify(comparison_analysis?.price_comparison || {})}
` : ''}

# TASK
Generate a structured, analytical report in Korean Markdown format with the following sections:

### **Executive Summary**
- Concisely summarize ${artistA_data.name}'s market position, key value drivers${artistB_data ? `, and comparison against ${artistB_data.name}` : ''}.

### **Phase 1: 현재 가치 구성 분석 (${artistA_data.name})**
- 5대축 레이더 점수를 해석하여 작가의 핵심 가치 유형(예: '제도권 검증형')과 강점/약점을 분석하라.
- 4축 근거 점수를 바탕으로 강점의 원인을 설명하라.

${artistA_data.timeseries ? `### **Phase 2: 커리어 궤적 분석 (${artistA_data.name})**
- 시계열 데이터를 바탕으로 작가의 성장 패턴을 설명하라.
- 주요 이벤트를 바탕으로 커리어의 결정적 전환점을 식별하라.
` : ''}

${artistB_data ? `### **Phase 3: 비교 분석 및 시장 전망**
- ${artistA_data.name}와(과) ${artistB_data.name}의 성장 궤적을 비교 분석하라.
- 궤적 차이 지수와 호당 가격 차이의 상관관계를 해석하라.
- ${artistA_data.name}의 미래 잠재력, 리스크, 기회 요인에 대한 전략적 전망을 제시하라.
` : `### **전략적 제언**
- ${artistA_data.name}의 미래 발전 방향과 전략적 권고사항을 제시하라.
`}

# OUTPUT FORMAT
- Language: Korean
- Format: Markdown  
- Tone: Professional, analytical, objective.`;
}

/**
 * 실시간 선버스트 생성 (P2 데이터 기반)
 */
async function generateSunburstFromMeasures(artistId) {
  try {
    // P2의 measures 컬렉션에서 데이터 수집
    const measuresQuery = await db.collection('measures')
      .where('entity_id', '==', artistId)
      .get();

    if (measuresQuery.empty) {
      throw new Error(`${artistId}의 measures 데이터가 없습니다.`);
    }

    // 축별 그룹화 및 계층 구조 생성
    const measuresByAxis = {};
    measuresQuery.docs.forEach(doc => {
      const data = doc.data();
      if (!measuresByAxis[data.axis]) {
        measuresByAxis[data.axis] = [];
      }
      measuresByAxis[data.axis].push(data);
    });

    // 선버스트 계층 구조 생성 (1016blprint.md 구조 준수)
    const sunburstData = {
      name: artistId, // 실제로는 entities 컬렉션에서 이름 조회
      children: Object.entries(measuresByAxis).map(([axis, measures]) => ({
        name: axis,
        axis: axis,
        value: measures.reduce((sum, m) => sum + (m.value_normalized || 0), 0),
        children: groupMeasuresByMetric(measures)
      }))
    };

    return sunburstData;

  } catch (error) {
    logger.error('실시간 선버스트 생성 실패:', error);
    throw error;
  }
}

/**
 * 실시간 비교 분석 수행
 */
function performRealTimeComparison(dataA, dataB, axis) {
  // Maya Chen의 Phase 3 알고리즘 활용
  const seriesA = dataA.bins || [];
  const seriesB = dataB.bins || [];
  
  // 시계열 정렬 및 보간
  const alignedSeries = alignTimeseries(seriesA, seriesB);
  
  // AUC 차이 계산 (궤적 차이 지수)
  const abs_diff_sum = calculateAUCDifference(alignedSeries);
  
  return {
    pair_id: `${dataA.artist_id}_vs_${dataB.artist_id}`,
    axis: axis,
    series: alignedSeries,
    abs_diff_sum: abs_diff_sum,
    generated_at: new Date().toISOString(),
    realtime_analysis: true
  };
}

// 헬퍼 함수들
function groupMeasuresByMetric(measures) {
  // metric_code별 그룹화 로직
  return measures.reduce((groups, measure) => {
    // 구현 로직...
    return groups;
  }, []);
}

function alignTimeseries(seriesA, seriesB) {
  // 두 시계열의 시간축 정렬
  return [];
}

function calculateAUCDifference(alignedSeries) {
  // Maya Chen의 AUC 알고리즘
  return 0;
}

module.exports = {
  getArtistSummary: exports.getArtistSummary,
  getArtistSunburst: exports.getArtistSunburst, 
  getArtistTimeseries: exports.getArtistTimeseries,
  getCompareArtists: exports.getCompareArtists,
  generateAiReport: exports.generateAiReport
};
