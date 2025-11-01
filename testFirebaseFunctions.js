// Firebase Functions 에뮬레이터 AI 보고서 테스트
const axios = require('axios');

const testFirebaseFunctions = async () => {
  try {
    console.log('🔥 Firebase Functions AI 보고서 테스트...');
    
    const testData = {
      artistA_data: {
        name: "양혜규",
        radar5: { I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8 },
        sunburst_l1: { 제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0 }
      }
    };
    
    const response = await axios.post(
      'http://127.0.0.1:5002/demo-no-project/us-central1/generateAiReport',
      testData,
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );
    
    console.log('✅ Firebase Functions AI 보고서 성공!');
    console.log('📊 응답:', {
      success: response.data.success,
      model: response.data.model,
      report_length: response.data.report?.length || 0
    });
    
    console.log('📄 보고서 미리보기:');
    console.log(response.data.report?.substring(0, 200) + '...');
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase Functions 테스트 실패:', error.message);
    return false;
  }
};

testFirebaseFunctions();

