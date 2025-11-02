// 빠른 API 테스트 (간단 버전)
const axios = require('axios');

const testAPI = async () => {
  const baseUrl = 'http://127.0.0.1:5003/api';
  
  try {
    console.log('🧪 빠른 API 테스트 시작...');
    console.log(`📡 Base URL: ${baseUrl}`);
    
    // 1. 헬스체크
    console.log('\n🔍 헬스체크 테스트...');
    const healthResponse = await axios.get(`${baseUrl}/healthCheck`);
    console.log('✅ 헬스체크 성공:', healthResponse.data);
    
    // 2. 작가 요약 테스트  
    console.log('\n👨‍🎨 작가 요약 테스트...');
    const summaryResponse = await axios.get(`${baseUrl}/getArtistSummary`, {
      params: { id: 'ARTIST_0005' }
    });
    console.log('✅ 작가 요약 성공:', {
      name: summaryResponse.data.name,
      radar_avg: Object.values(summaryResponse.data.radar5).reduce((a,b) => a+b, 0) / 5
    });
    
    // 3. AI 보고서 테스트
    console.log('\n🤖 AI 보고서 테스트...');
    const reportResponse = await axios.post(`${baseUrl}/generateAiReport`, {
      artistA_data: {
        name: "테스트 작가",
        radar5: { I: 80, F: 70, A: 60, M: 50, Sedu: 40 },
        sunburst_l1: { 제도: 75, 학술: 65, 담론: 55, 네트워크: 70 }
      }
    });
    console.log('✅ AI 보고서 성공:', {
      success: reportResponse.data.success,
      model: reportResponse.data.model,
      report_length: reportResponse.data.report?.length || 0
    });
    
    console.log('\n🎉 모든 핵심 API 테스트 성공!');
    
    return {
      success: true,
      tests_passed: 3,
      tests_total: 3,
      success_rate: '100%'
    };
    
  } catch (error) {
    console.error('\n❌ API 테스트 실패:', error.message);
    
    return {
      success: false,
      error: error.message,
      response_status: error.response?.status || 'Network Error'
    };
  }
};

// 즉시 실행
testAPI()
  .then(result => {
    console.log('\n📊 최종 결과:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 테스트 실행 실패:', error);
    process.exit(1);
  });
