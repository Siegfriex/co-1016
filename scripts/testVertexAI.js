// CuratorOdyssey Vertex AI 실제 호출 테스트
// P1 Alex Chen - Vertex AI Gemini 연동 검증

const axios = require('axios');

const BASE_URL = 'http://localhost:5003';

console.log('🤖 CuratorOdyssey Vertex AI 실제 호출 테스트');
console.log(`📡 테스트 대상: ${BASE_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testVertexAIReport() {
  try {
    console.log('\n🚀 Vertex AI Gemini 실제 호출 테스트...');
    
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
    
    console.log('✅ Vertex AI 호출 성공:', {
      success: response.data.success,
      model: response.data.model,
      report_length: response.data.report?.length || 0,
      processing_time: response.data.processing_time_ms || (endTime - startTime),
      estimated_tokens: response.data.estimated_tokens || 0,
      fallback_used: response.data.fallback_used || false,
      weights_version: response.data.weights_version,
      normalization_method: response.data.normalization_method
    });
    
    // 보고서 내용 일부 출력
    if (response.data.report) {
      console.log('\n📄 생성된 보고서 미리보기:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(response.data.report.substring(0, 500) + '...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    return {
      success: true,
      model: response.data.model,
      isVertexAI: response.data.model.includes('vertex-ai'),
      processing_time: response.data.processing_time_ms || (endTime - startTime),
      tokens: response.data.estimated_tokens || 0
    };
    
  } catch (error) {
    console.log('❌ Vertex AI 호출 실패:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testVertexAIHealth() {
  try {
    console.log('\n🔍 Vertex AI 헬스체크 테스트...');
    
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    if (response.data.vertex_ai) {
      console.log('✅ Vertex AI 헬스체크 성공:', response.data.vertex_ai);
      return {
        success: true,
        status: response.data.vertex_ai.status,
        model: response.data.vertex_ai.model,
        project: response.data.vertex_ai.project,
        location: response.data.vertex_ai.location
      };
    } else {
      console.log('⚠️  Vertex AI 헬스체크 정보 없음');
      return { success: false, error: 'No vertex_ai info' };
    }
    
  } catch (error) {
    console.log('❌ Vertex AI 헬스체크 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function runVertexAITests() {
  console.log('🔧 P1 Alex Chen - Vertex AI 연동 검증');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = {
    healthCheck: await testVertexAIHealth(),
    aiReport: await testVertexAIReport()
  };
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Vertex AI 테스트 결과 요약:');
  
  if (results.healthCheck.success) {
    console.log(`✅ 헬스체크: ${results.healthCheck.status} (${results.healthCheck.model})`);
  } else {
    console.log(`❌ 헬스체크: ${results.healthCheck.error}`);
  }
  
  if (results.aiReport.success) {
    console.log(`✅ AI 보고서: ${results.aiReport.model} (${results.aiReport.processing_time}ms, ${results.aiReport.tokens} tokens)`);
    
    if (results.aiReport.isVertexAI) {
      console.log('🎉 Vertex AI Gemini 실제 연동 성공!');
    } else {
      console.log('⚠️  폴백 템플릿 사용 (Vertex AI 연결 실패)');
    }
  } else {
    console.log(`❌ AI 보고서: ${results.aiReport.error}`);
  }
  
  return results;
}

// 테스트 실행
runVertexAITests().catch(console.error);

