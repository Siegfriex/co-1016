// CuratorOdyssey Vertex AI 백엔드 Cloud Function
// 종합 보고서 생성을 위한 서버사이드 AI 호출

const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const { VertexAI } = require('@google-cloud/vertexai');

// Vertex AI 클라이언트 초기화
const vertexAI = new VertexAI({
  project: 'co-1016',
  location: 'asia-northeast3'
});

/**
 * 종합 보고서 생성 Cloud Function
 * POST /api/ai/vertex-generate
 */
exports.generateComprehensiveReport = onRequest(async (req, res) => {
  // CORS 헤더 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { prompt, model = 'gemini-1.5-pro', reportType = 'comprehensive' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: '프롬프트가 제공되지 않았습니다.',
        code: 'MISSING_PROMPT'
      });
    }

    logger.info('Vertex AI 종합 보고서 생성 요청', {
      model,
      reportType,
      promptLength: prompt.length
    });

    // Gemini 모델 초기화
    const model_instance = vertexAI.getGenerativeModel({
      model: model,
      generation_config: {
        max_output_tokens: reportType === 'comprehensive' ? 3000 : 
                           reportType === 'executive' ? 1000 : 1500,
        temperature: 0.7,
        top_p: 0.9
      }
    });

    // AI 분석 실행
    const startTime = Date.now();
    const result = await model_instance.generateContent(prompt);
    const endTime = Date.now();

    const response = result.response;
    const content = response.text();

    // 사용량 통계 기록
    const usage = {
      input_tokens: prompt.length / 4, // 대략적 토큰 계산
      output_tokens: content.length / 4,
      total_tokens: (prompt.length + content.length) / 4,
      processing_time_ms: endTime - startTime
    };

    logger.info('Vertex AI 응답 성공', {
      model,
      reportType,
      usage,
      contentLength: content.length
    });

    return res.status(200).json({
      success: true,
      content: content,
      model: `vertex-ai-${model}`,
      reportType: reportType,
      usage: usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Vertex AI 호출 실패', {
      error: error.message,
      stack: error.stack,
      model,
      reportType
    });

    return res.status(500).json({
      success: false,
      error: 'AI 분석 중 오류가 발생했습니다.',
      code: 'VERTEX_AI_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Vertex AI 상태 확인 엔드포인트
 * GET /api/ai/vertex-health
 */
exports.checkVertexHealth = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  try {
    // 간단한 테스트 호출
    const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const testResult = await model.generateContent('테스트');

    return res.status(200).json({
      status: 'healthy',
      model: 'gemini-1.5-pro',
      timestamp: new Date().toISOString(),
      test_response_length: testResult.response.text().length
    });

  } catch (error) {
    logger.error('Vertex AI 헬스체크 실패', error);

    return res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 배치 분석 함수 (여러 작가 동시 처리)
 * POST /api/ai/batch-analyze
 */
exports.batchAnalyzeArtists = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  try {
    const { artists, analysisType = 'phase1' } = req.body;

    if (!artists || !Array.isArray(artists)) {
      return res.status(400).json({
        error: '작가 배열이 제공되지 않았습니다.',
        code: 'MISSING_ARTISTS'
      });
    }

    const results = [];
    const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    for (const artistData of artists) {
      try {
        const prompt = buildAnalysisPrompt(artistData, analysisType);
        const result = await model.generateContent(prompt);
        
        results.push({
          artist_id: artistData.artist_id,
          artist_name: artistData.name,
          success: true,
          analysis: result.response.text(),
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        results.push({
          artist_id: artistData.artist_id,
          artist_name: artistData.name,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }

      // API 레이트 리미트 방지 (1초 대기)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return res.status(200).json({
      success: true,
      total_artists: artists.length,
      successful_analyses: results.filter(r => r.success).length,
      failed_analyses: results.filter(r => !r.success).length,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('배치 분석 실패', error);
    return res.status(500).json({
      success: false,
      error: '배치 분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 프롬프트 생성 헬퍼 함수
function buildAnalysisPrompt(artistData, analysisType) {
  const basePrompt = `CuratorOdyssey ${analysisType.toUpperCase()} 분석:

작가: ${artistData.name}
5축 데이터: I${artistData.radar5?.I || 0} F${artistData.radar5?.F || 0} A${artistData.radar5?.A || 0} M${artistData.radar5?.M || 0} S${artistData.radar5?.Sedu || 0}
4축 기반: 제도${artistData.sunburst_l1?.제도 || 0} 학술${artistData.sunburst_l1?.학술 || 0} 담론${artistData.sunburst_l1?.담론 || 0} 네트워크${artistData.sunburst_l1?.네트워크 || 0}`;

  switch (analysisType) {
    case 'comprehensive':
      return `${basePrompt}

종합 분석 보고서 생성:
1. Executive Summary (3-4문장)
2. 현재 가치 구성 분석 (강점/약점, 균형도)
3. 시장 포지셔닝 (동급 작가 대비 위치)
4. 성장 잠재력 평가 (단기/중기 전망)
5. 전략적 제언 (실행 가능한 액션플랜)
6. 리스크 요인 (주요 위험 요소 및 대응방안)

한국어 마크다운 형식, 1500-2000자, 데이터 기반 구체적 근거 제시:`;

    case 'executive':
      return `${basePrompt}

Executive Summary 생성 (경영진 대상):
- 핵심 성과 지표 요약
- 시장 내 포지셔닝
- 주요 리스크 및 기회
- 전략적 권고사항

한국어 800-1000자, 간결하고 임팩트 있게:`;

    case 'investment':
      return `${basePrompt}

Investment Briefing 생성 (투자자 대상):
- 투자 가치 평가
- 성장 잠재력 분석
- ROI 예상 및 리스크 매트릭스
- 포트폴리오 권장사항

한국어 1000-1200자, 투자 관점 중심:`;

    default:
      return basePrompt + '\n\n전문적인 분석을 제공해주세요.';
  }
}

module.exports = {
  generateComprehensiveReport: exports.generateComprehensiveReport,
  checkVertexHealth: exports.checkVertexHealth,
  batchAnalyzeArtists: exports.batchAnalyzeArtists
};
