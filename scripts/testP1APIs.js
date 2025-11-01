// CuratorOdyssey P1 API 실제 연결 테스트
// P1 Alex Chen - 4개 핵심 API 엔드포인트 완전 검증

const axios = require('axios');

const BASE_URL = 'http://localhost:5003';

console.log('🚀 P1 API 실제 연결 테스트');
console.log(`📡 테스트 대상: ${BASE_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testHealthCheck() {
  try {
    console.log('\n🔍 1. Health Check API 테스트...');
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}/api/health`);
    const endTime = Date.now();
    
    console.log('   ✅ Health Check 성공:', {
      status: response.data.status,
      response_time: `${endTime - startTime}ms`,
      endpoints: response.data.available_endpoints?.length || 0,
      p1_implementation: response.data.p1_alex_chen_implementation,
      p2_ready: response.data.p2_collaboration_ready
    });
    
    return { success: true, response_time: endTime - startTime };
  } catch (error) {
    console.log('   ❌ Health Check 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testArtistSummary() {
  try {
    console.log('\n👨‍🎨 2. Artist Summary API 테스트...');
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}/api/artist/ARTIST_0005/summary`);
    const endTime = Date.now();
    
    console.log('   ✅ Artist Summary 성공:', {
      artist_name: response.data.name,
      response_time: `${endTime - startTime}ms`,
      radar5_scores: response.data.radar5,
      sunburst_l1_scores: response.data.sunburst_l1,
      data_source: response.data.data_source || 'unknown',
      weights_version: response.data.weights_version
    });
    
    // 레이더 점수 검증
    const radarAvg = Object.values(response.data.radar5).reduce((a,b) => a+b, 0) / 5;
    console.log(`   📊 레이더 평균 점수: ${radarAvg.toFixed(1)}점`);
    
    return { success: true, response_time: endTime - startTime, radar_avg: radarAvg };
  } catch (error) {
    console.log('   ❌ Artist Summary 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testTimeseries() {
  try {
    console.log('\n📈 3. Timeseries API 테스트...');
    const axes = ['제도', '학술', '담론', '네트워크'];
    const results = {};
    
    for (const axis of axes) {
      const startTime = Date.now();
      const response = await axios.get(`${BASE_URL}/api/artist/ARTIST_0005/timeseries/${axis}`);
      const endTime = Date.now();
      
      results[axis] = {
        success: true,
        response_time: endTime - startTime,
        bins_count: response.data.bins?.length || 0,
        data_source: response.data.data_source || 'unknown'
      };
      
      console.log(`   ✅ ${axis}축: ${response.data.bins?.length || 0}개 빈, ${endTime - startTime}ms`);
    }
    
    return { success: true, results };
  } catch (error) {
    console.log('   ❌ Timeseries 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAIReport() {
  try {
    console.log('\n🤖 4. AI Report Generation API 테스트...');
    
    const artistData = {
      name: "양혜규",
      radar5: { I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8 },
      sunburst_l1: { 제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0 },
      timeseries: {
        institution: {
          bins: [
            { t: 0, v: 2.1 },
            { t: 5, v: 18.5 },
            { t: 10, v: 75.3 },
            { t: 15, v: 90.1 },
            { t: 20, v: 94.0 }
          ]
        }
      },
      key_events: [
        { year: 2003, event: "데뷔 및 첫 개인전", impact: "초기 활동 시작" },
        { year: 2008, event: "베니스 비엔날레 참여", impact: "국제적 인지도 상승" },
        { year: 2012, event: "테이트 모던 개인전", impact: "주요 기관 인정" },
        { year: 2018, event: "카셀 도쿠멘타 참여", impact: "담론적 영향력 확대" },
        { year: 2022, event: "MoMA 개인전", impact: "최고 권위 기관 진입" }
      ]
    };
    
    const startTime = Date.now();
    const response = await axios.post(`${BASE_URL}/api/report/generate`, {
      artistA_data: artistData
    });
    const endTime = Date.now();
    
    console.log('   ✅ AI Report 생성 성공:', {
      success: response.data.success,
      model: response.data.model,
      response_time: `${endTime - startTime}ms`,
      report_length: response.data.report?.length || 0,
      processing_time: response.data.processing_time_ms || (endTime - startTime),
      estimated_tokens: response.data.estimated_tokens || 0,
      weights_version: response.data.weights_version,
      normalization_method: response.data.normalization_method
    });
    
    // 보고서 내용 일부 출력
    if (response.data.report) {
      console.log('   📄 생성된 보고서 미리보기:');
      console.log('   ' + '─'.repeat(50));
      console.log('   ' + response.data.report.substring(0, 200).replace(/\n/g, '\n   ') + '...');
      console.log('   ' + '─'.repeat(50));
    }
    
    return {
      success: true,
      response_time: endTime - startTime,
      model: response.data.model,
      report_length: response.data.report?.length || 0
    };
  } catch (error) {
    console.log('   ❌ AI Report 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCompareArtists() {
  try {
    console.log('\n🔄 5. Compare Artists API 테스트...');
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}/api/compare/ARTIST_0005/ARTIST_0003/담론`);
    const endTime = Date.now();
    
    console.log('   ✅ Compare Artists 성공:', {
      pair_id: response.data.pair_id,
      axis: response.data.axis,
      response_time: `${endTime - startTime}ms`,
      series_count: response.data.series?.length || 0,
      abs_diff_sum: response.data.abs_diff_sum,
      data_source: response.data.data_source || 'unknown'
    });
    
    return { success: true, response_time: endTime - startTime };
  } catch (error) {
    console.log('   ❌ Compare Artists 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function runP1APITests() {
  console.log('🔧 P1 Alex Chen - API 연결 검증');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = {
    healthCheck: await testHealthCheck(),
    artistSummary: await testArtistSummary(),
    timeseries: await testTimeseries(),
    aiReport: await testAIReport(),
    compareArtists: await testCompareArtists()
  };
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 P1 API 테스트 결과 요약:');
  console.log(`✅ 성공: ${successCount}/${totalTests}`);
  console.log(`❌ 실패: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('🎉 모든 P1 API가 정상 작동합니다!');
    console.log('🚀 프로덕션 배포 준비 완료');
  } else {
    console.log('⚠️  일부 API에 문제가 있습니다. 로그를 확인하세요.');
  }
  
  // 성능 통계
  const responseTimes = Object.values(results)
    .filter(r => r.response_time)
    .map(r => r.response_time);
  
  if (responseTimes.length > 0) {
    const avgResponseTime = responseTimes.reduce((a,b) => a+b, 0) / responseTimes.length;
    console.log(`📈 평균 응답 시간: ${avgResponseTime.toFixed(1)}ms`);
  }
  
  return results;
}

// 테스트 실행
runP1APITests().catch(console.error);

