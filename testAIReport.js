// AI 보고서 API 테스트 (POST 요청)
const axios = require('axios');

const testAIReport = async () => {
  try {
    console.log('🤖 AI 보고서 API 테스트 시작...');
    
    const testData = {
      artistA_data: {
        name: "양혜규",
        radar5: { I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8 },
        sunburst_l1: { 제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0 }
      }
    };
    
    const response = await axios.post('http://127.0.0.1:5003/api/report/generate', testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ AI 보고서 API 테스트 성공!');
    console.log('📊 응답 데이터:', {
      success: response.data.success,
      model: response.data.model,
      report_length: response.data.report?.length || 0,
      timestamp: response.data.timestamp
    });
    
    console.log('\n📄 생성된 보고서 미리보기:');
    console.log(response.data.report?.substring(0, 200) + '...');
    
    return true;
    
  } catch (error) {
    console.error('❌ AI 보고서 API 테스트 실패:', error.message);
    return false;
  }
};

testAIReport();

