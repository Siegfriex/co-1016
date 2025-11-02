// CuratorOdyssey 로컬 테스트 서버 (Firebase 인증 문제 우회)
// Alex Chen - 실제 작동 검증 우선

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 기존 완벽한 목업 데이터 활용 (P2 침범 방지)
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

// 📊 GET /api/artist/:id/summary 
app.get('/api/artist/:id/summary', (req, res) => {
  const artistId = req.params.id;
  console.log(`👨‍🎨 작가 요약 요청: ${artistId}`);
  
  const data = mockArtistData[artistId];
  
  if (!data) {
    return res.status(404).json({ 
      error: `작가 ${artistId}를 찾을 수 없습니다.`,
      available_artists: Object.keys(mockArtistData)
    });
  }
  
  console.log(`✅ 성공: ${data.name}`);
  res.json(data);
});

// 📈 GET /api/artist/:id/timeseries/:axis
app.get('/api/artist/:id/timeseries/:axis', (req, res) => {
  const { id, axis } = req.params;
  console.log(`📈 시계열 요청: ${id} - ${axis}`);
  
  const artistName = mockArtistData[id]?.name || '알 수 없음';
  
  const timeseriesData = {
    artist_id: id,
    artist_name: artistName,
    axis: axis,
    bins: [
      { t: 0, v: 12.5 },
      { t: 5, v: 34.7 },
      { t: 10, v: 67.2 },
      { t: 15, v: 88.4 },
      { t: 20, v: 94.0 }
    ],
    version: "AHP_v1",
    data_source: "existing_mock"
  };
  
  console.log(`✅ 시계열 성공: ${artistName}`);
  res.json(timeseriesData);
});

// 🔄 GET /api/compare/:A/:B/:axis
app.get('/api/compare/:A/:B/:axis', (req, res) => {
  const { A, B, axis } = req.params;
  console.log(`🔄 비교 분석 요청: ${A} vs ${B} - ${axis}`);
  
  const comparisonData = {
    pair_id: `${A}_vs_${B}`,
    axis: axis,
    series: [
      { t: 0, artist_a: 5.2, artist_b: 8.1 },
      { t: 5, artist_a: 28.9, artist_b: 22.6 },
      { t: 10, artist_a: 67.3, artist_b: 51.7 },
      { t: 15, artist_a: 86.0, artist_b: 69.2 }
    ],
    abs_diff_sum: 24.7,
    data_source: "existing_mock"
  };
  
  console.log(`✅ 비교 분석 성공: ${A} vs ${B}`);
  res.json(comparisonData);
});

// 🤖 POST /api/report/generate (1016blprint.md 핵심) - Vertex AI 실제 연동
app.post('/api/report/generate', async (req, res) => {
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
    const VertexAIService = require('./functions/src/services/vertexAIService');
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
        
    return res.status(200).json(result);
        
  } catch (error) {
    console.error('❌ AI 보고서 오류:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 🔍 헬스체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    available_endpoints: [
      'GET /api/artist/:id/summary',
      'GET /api/artist/:id/timeseries/:axis',
      'GET /api/compare/:A/:B/:axis',
      'POST /api/report/generate',
      'GET /api/health'
    ],
    p1_alex_chen_implementation: 'working',
    p2_collaboration_ready: true
  });
});

// 서버 시작
const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log('🚀 CuratorOdyssey 로컬 API 서버 시작!');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log('🧪 테스트 URL:');
  console.log(`  ✅ 헬스체크: http://localhost:${PORT}/api/health`);
  console.log(`  👨‍🎨 작가 요약: http://localhost:${PORT}/api/artist/ARTIST_0005/summary`);
  console.log(`  📈 시계열: http://localhost:${PORT}/api/artist/ARTIST_0005/timeseries/제도`);
  console.log(`  🤖 AI 보고서: POST http://localhost:${PORT}/api/report/generate`);
  console.log('');
  console.log('🎯 테스트 명령어:');
  console.log('  node scripts/quickTest.js');
});
