// CuratorOdyssey React 앱 API 연동 테스트
// P1 Alex Chen - 프론트엔드-백엔드 통합 검증

const axios = require('axios');

const REACT_APP_URL = 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:5003';

console.log('⚛️  React 앱 API 연동 테스트');
console.log(`📱 React 앱: ${REACT_APP_URL}`);
console.log(`🔌 API 서버: ${API_BASE_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testReactAppAccess() {
  try {
    console.log('\n🌐 1. React 앱 접근 테스트...');
    const startTime = Date.now();
    const response = await axios.get(REACT_APP_URL);
    const endTime = Date.now();
    
    console.log('   ✅ React 앱 접근 성공:', {
      status: response.status,
      response_time: `${endTime - startTime}ms`,
      content_type: response.headers['content-type'],
      content_length: response.data.length
    });
    
    // HTML 내용 확인
    const htmlContent = response.data;
    const hasReactRoot = htmlContent.includes('id="root"');
    const hasTitle = htmlContent.includes('CuratorOdyssey');
    
    console.log('   📄 HTML 구조 확인:', {
      has_react_root: hasReactRoot,
      has_title: hasTitle,
      is_spa: htmlContent.includes('react-scripts')
    });
    
    return { success: true, response_time: endTime - startTime };
  } catch (error) {
    console.log('   ❌ React 앱 접근 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAPIIntegration() {
  try {
    console.log('\n🔌 2. API 연동 테스트...');
    
    // React 앱에서 사용할 API 엔드포인트들을 실제로 테스트
    const apiTests = [
      {
        name: 'Health Check',
        url: `${API_BASE_URL}/api/health`,
        method: 'GET'
      },
      {
        name: 'Artist Summary',
        url: `${API_BASE_URL}/api/artist/ARTIST_0005/summary`,
        method: 'GET'
      },
      {
        name: 'Timeseries (제도)',
        url: `${API_BASE_URL}/api/artist/ARTIST_0005/timeseries/제도`,
        method: 'GET'
      },
      {
        name: 'AI Report Generation',
        url: `${API_BASE_URL}/api/report/generate`,
        method: 'POST',
        data: {
          artistA_data: {
            name: "양혜규",
            radar5: { I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8 },
            sunburst_l1: { 제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0 }
          }
        }
      }
    ];
    
    const results = {};
    
    for (const test of apiTests) {
      try {
        const startTime = Date.now();
        let response;
        
        if (test.method === 'GET') {
          response = await axios.get(test.url);
        } else if (test.method === 'POST') {
          response = await axios.post(test.url, test.data);
        }
        
        const endTime = Date.now();
        
        results[test.name] = {
          success: true,
          response_time: endTime - startTime,
          status: response.status,
          data_keys: Object.keys(response.data || {}).length
        };
        
        console.log(`   ✅ ${test.name}: ${endTime - startTime}ms, ${response.status}`);
        
      } catch (error) {
        results[test.name] = {
          success: false,
          error: error.message,
          status: error.response?.status
        };
        
        console.log(`   ❌ ${test.name}: ${error.response?.status || 'ERROR'} - ${error.message}`);
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.log('   ❌ API 연동 테스트 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCORSConfiguration() {
  try {
    console.log('\n🌐 3. CORS 설정 테스트...');
    
    // CORS 헤더 확인
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    const headers = response.headers;
    
    const corsHeaders = {
      'access-control-allow-origin': headers['access-control-allow-origin'],
      'access-control-allow-methods': headers['access-control-allow-methods'],
      'access-control-allow-headers': headers['access-control-allow-headers']
    };
    
    console.log('   ✅ CORS 헤더 확인:', corsHeaders);
    
    const corsConfigured = corsHeaders['access-control-allow-origin'] === '*';
    console.log(`   ${corsConfigured ? '✅' : '❌'} CORS 설정: ${corsConfigured ? '적절히 구성됨' : '문제 있음'}`);
    
    return { success: corsConfigured, corsHeaders };
  } catch (error) {
    console.log('   ❌ CORS 테스트 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testDataFlow() {
  try {
    console.log('\n📊 4. 데이터 플로우 테스트...');
    
    // 1. 작가 요약 데이터 가져오기
    const summaryResponse = await axios.get(`${API_BASE_URL}/api/artist/ARTIST_0005/summary`);
    const artistData = summaryResponse.data;
    
    console.log('   📥 작가 데이터 수신:', {
      name: artistData.name,
      radar5_keys: Object.keys(artistData.radar5 || {}),
      sunburst_l1_keys: Object.keys(artistData.sunburst_l1 || {})
    });
    
    // 2. 시계열 데이터 가져오기
    const timeseriesResponse = await axios.get(`${API_BASE_URL}/api/artist/ARTIST_0005/timeseries/제도`);
    const timeseriesData = timeseriesResponse.data;
    
    console.log('   📈 시계열 데이터 수신:', {
      axis: timeseriesData.axis,
      bins_count: timeseriesData.bins?.length || 0,
      version: timeseriesData.version
    });
    
    // 3. AI 보고서 생성 (실제 데이터 사용)
    const aiResponse = await axios.post(`${API_BASE_URL}/api/report/generate`, {
      artistA_data: artistData
    });
    
    console.log('   🤖 AI 보고서 생성:', {
      success: aiResponse.data.success,
      model: aiResponse.data.model,
      report_length: aiResponse.data.report?.length || 0
    });
    
    // 4. 데이터 일관성 검증
    const dataConsistency = {
      artist_name_match: artistData.name === '양혜규',
      radar5_complete: Object.keys(artistData.radar5 || {}).length === 5,
      sunburst_l1_complete: Object.keys(artistData.sunburst_l1 || {}).length === 4,
      timeseries_valid: (timeseriesData.bins || []).length > 0,
      ai_report_generated: aiResponse.data.success
    };
    
    console.log('   🔍 데이터 일관성 검증:', dataConsistency);
    
    const allConsistent = Object.values(dataConsistency).every(Boolean);
    console.log(`   ${allConsistent ? '✅' : '❌'} 데이터 일관성: ${allConsistent ? '모든 데이터가 일관됨' : '일부 데이터 불일치'}`);
    
    return { success: allConsistent, dataConsistency };
  } catch (error) {
    console.log('   ❌ 데이터 플로우 테스트 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function runReactAppTests() {
  console.log('🔧 P1 Alex Chen - React 앱 통합 검증');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = {
    reactAppAccess: await testReactAppAccess(),
    apiIntegration: await testAPIIntegration(),
    corsConfiguration: await testCORSConfiguration(),
    dataFlow: await testDataFlow()
  };
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 React 앱 통합 테스트 결과:');
  console.log(`✅ 성공: ${successCount}/${totalTests}`);
  console.log(`❌ 실패: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('🎉 React 앱과 API가 완벽하게 연동됩니다!');
    console.log('🚀 프론트엔드-백엔드 통합 준비 완료');
  } else {
    console.log('⚠️  일부 통합에 문제가 있습니다. 로그를 확인하세요.');
  }
  
  return results;
}

// 테스트 실행
runReactAppTests().catch(console.error);

