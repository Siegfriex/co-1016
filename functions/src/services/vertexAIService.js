// CuratorOdyssey Vertex AI 서비스
// P1 Alex Chen - 실제 Vertex AI Gemini 연동

const { VertexAI } = require('@google-cloud/vertexai');

class VertexAIService {
  constructor() {
    this.projectId = 'co-1016';
    this.location = 'asia-northeast3';
    this.model = 'gemini-1.5-pro';
    
    // 서비스 계정 인증 (환경변수 또는 기본 인증)
    this.vertexAI = new VertexAI({
      project: this.projectId,
      location: this.location
    });
    
    this.modelInstance = this.vertexAI.getGenerativeModel({
      model: this.model,
      generation_config: {
        max_output_tokens: 3000,
        temperature: 0.7,
        top_p: 0.9
      }
    });
  }

  /**
   * 1016blprint.md 명세 준수 AI 보고서 생성
   */
  async generateComprehensiveReport(artistA_data, artistB_data = null, comparison_analysis = null) {
    try {
      console.log('🤖 Vertex AI Gemini 호출 시작:', {
        artistA: artistA_data.name,
        artistB: artistB_data?.name || 'N/A',
        hasComparison: !!comparison_analysis
      });

      const prompt = this.build1016BlueprintPrompt(artistA_data, artistB_data, comparison_analysis);
      
      const startTime = Date.now();
      const result = await this.modelInstance.generateContent(prompt);
      const endTime = Date.now();
      
      const reportContent = result.response.text();
      
      console.log('✅ Vertex AI Gemini 호출 성공:', {
        model: this.model,
        processing_time: endTime - startTime,
        content_length: reportContent.length,
        tokens_estimated: Math.ceil(reportContent.length / 4)
      });

      return {
        success: true,
        report: reportContent,
        model: `vertex-ai-${this.model}`,
        weights_version: 'AHP_v1',
        normalization_method: 'log_winsor_percentile_v1',
        generated_at: new Date().toISOString(),
        processing_time_ms: endTime - startTime,
        estimated_tokens: Math.ceil(reportContent.length / 4)
      };

    } catch (error) {
      console.error('❌ Vertex AI 호출 실패:', error);
      
      // 폴백: 기본 템플릿 사용
      return this.generateFallbackReport(artistA_data, artistB_data);
    }
  }

  /**
   * 1016blprint.md 프롬프트 템플릿 정확히 구현
   */
  build1016BlueprintPrompt(artistA_data, artistB_data, comparison_analysis) {
    return `# MISSION
You are "Odyssey AI", a top-tier art market analyst for the "CuratorOdyssey" platform. Your mission is to generate a professional, data-driven report based on the structured JSON data provided below.

# CONTEXT & DATA
The analysis is based on version "AHP_v1" of our model. All scores are normalized to a 0-100 scale using log_winsor_percentile_v1 pipeline.

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
   * Vertex AI 실패 시 폴백 보고서
   */
  generateFallbackReport(artistA_data, artistB_data) {
    const report = `# 📊 ${artistA_data.name} AI 분석 보고서 (기본 템플릿)

## Executive Summary
${artistA_data.name} 작가는 현재 다양한 영역에서 우수한 성과를 보이고 있습니다.

## 현재 가치 구성 분석
### 5축 레이더 분석
- **기관전시(I)**: ${artistA_data.radar5?.I || 0}점
- **페어(F)**: ${artistA_data.radar5?.F || 0}점  
- **시상(A)**: ${artistA_data.radar5?.A || 0}점
- **미디어(M)**: ${artistA_data.radar5?.M || 0}점
- **교육(Sedu)**: ${artistA_data.radar5?.Sedu || 0}점

### 4축 기반 구조
- **제도**: ${artistA_data.sunburst_l1?.제도 || 0}점
- **학술**: ${artistA_data.sunburst_l1?.학술 || 0}점
- **담론**: ${artistA_data.sunburst_l1?.담론 || 0}점
- **네트워크**: ${artistA_data.sunburst_l1?.네트워크 || 0}점

## 전략적 제언
지속적인 성장과 발전이 기대됩니다. 특히 강점 영역을 중심으로 한 확장 전략을 권장합니다.

---
*생성 시각: ${new Date().toISOString()} | 모델: 기본 템플릿 (Vertex AI 연동 대기)*`;

    return {
      success: true,
      report: report,
      model: 'fallback-template',
      weights_version: 'AHP_v1',
      normalization_method: 'log_winsor_percentile_v1',
      generated_at: new Date().toISOString(),
      processing_time_ms: 0,
      estimated_tokens: 0,
      fallback_used: true
    };
  }

  /**
   * Vertex AI 연결 상태 확인
   */
  async checkHealth() {
    try {
      const testPrompt = "Hello, this is a health check. Please respond with 'OK'.";
      const result = await this.modelInstance.generateContent(testPrompt);
      
      return {
        status: 'healthy',
        model: this.model,
        project: this.projectId,
        location: this.location,
        response: result.response.text().substring(0, 100)
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        model: this.model,
        project: this.projectId,
        location: this.location
      };
    }
  }
}

module.exports = VertexAIService;

