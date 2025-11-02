// CuratorOdyssey Express 로컬 서버 API 테스트
// P1 Alex Chen - 실제 작동 검증

const axios = require('axios');

const BASE_URL = 'http://localhost:5003'; // Express 서버 포트

console.log('🚀 CuratorOdyssey Express 로컬 서버 API 테스트 시작');
console.log(`📡 테스트 대상: ${BASE_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testHealthCheck() {
  try {
    console.log('\n🔍 1. Health Check 테스트...');
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check 성공:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health Check 실패:', error.message);
    return false;
  }
}

async function testArtistSummary() {
  try {
    console.log('\n👨‍🎨 2. Artist Summary 테스트...');
    const response = await axios.get(`${BASE_URL}/api/artist/ARTIST_0005/summary`);
    console.log('✅ Artist Summary 성공:', {
      name: response.data.name,
      radar5: response.data.radar5,
      data_source: response.data.data_source || 'unknown'
    });
    return true;
  } catch (error) {
    console.log('❌ Artist Summary 실패:', error.message);
    return false;
  }
}

async function testTimeseries() {
  try {
    console.log('\n📈 3. Timeseries 테스트...');
    const response = await axios.get(`${BASE_URL}/api/artist/ARTIST_0005/timeseries/제도`);
    console.log('✅ Timeseries 성공:', {
      artist_name: response.data.artist_name,
      axis: response.data.axis,
      bins_count: response.data.bins?.length || 0,
      data_source: response.data.data_source || 'unknown'
    });
    return true;
  } catch (error) {
    console.log('❌ Timeseries 실패:', error.message);
    return false;
  }
}

async function testAIReport() {
  try {
    console.log('\n🤖 4. AI Report 생성 테스트...');
    const artistData = {
      name: "양혜규",
      radar5: { I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8 },
      sunburst_l1: { 제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0 }
    };
    
    const response = await axios.post(`${BASE_URL}/api/report/generate`, {
      artistA_data: artistData
    });
    
    console.log('✅ AI Report 성공:', {
      success: response.data.success,
      model: response.data.model,
      report_length: response.data.report?.length || 0,
      timestamp: response.data.timestamp
    });
    return true;
  } catch (error) {
    console.log('❌ AI Report 실패:', error.message);
    return false;
  }
}

async function testAllEndpoints() {
  console.log('🔧 P1 Alex Chen - Express 로컬 서버 검증');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = {
    healthCheck: await testHealthCheck(),
    artistSummary: await testArtistSummary(),
    timeseries: await testTimeseries(),
    aiReport: await testAIReport()
  };
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 테스트 결과 요약:');
  console.log(`✅ 성공: ${successCount}/${totalTests}`);
  console.log(`❌ 실패: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('🎉 모든 API 엔드포인트가 정상 작동합니다!');
    console.log('🚀 Express 로컬 서버 준비 완료');
  } else {
    console.log('⚠️  일부 API에 문제가 있습니다. 로그를 확인하세요.');
  }
  
  return results;
}

// 테스트 실행
testAllEndpoints().catch(console.error);

