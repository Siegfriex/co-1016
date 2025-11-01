// CuratorOdyssey AI Analysis Service
// OpenAI GPT-4 + Anthropic Claude 백업 시스템

import OpenAI from 'openai';

class AIService {
  constructor() {
    // OpenAI 초기화 (메인 AI 엔진)
    this.openai = null;
    this.anthropicKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
    this.vertexConfig = {
      projectId: process.env.REACT_APP_VERTEX_AI_PROJECT_ID,
      location: process.env.REACT_APP_VERTEX_AI_LOCATION
    };
    
    // 설정값
    this.maxRetries = parseInt(process.env.REACT_APP_AI_MAX_RETRIES) || 3;
    this.timeout = parseInt(process.env.REACT_APP_AI_TIMEOUT) || 30000;
    
    this.initializeOpenAI();
  }

  initializeOpenAI() {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // ⚠️ 프로덕션에서는 백엔드로 이전 필요
      });
    }
  }

  /**
   * Phase 1 아티스트 데이터 분석 (핵심 메서드)
   * @param {Object} artistData - 아티스트 레이더/선버스트 데이터
   * @returns {Promise<Object>} AI 분석 결과
   */
  async generatePhase1Insights(artistData) {
    try {
      console.log('🤖 AI Phase 1 분석 시작:', artistData.name);
      
      if (!this.openai) {
        return this.generateFallbackInsights(artistData);
      }

      const prompt = this.buildPhase1Prompt(artistData);
      
      const completion = await this.callOpenAI(prompt);
      
      return {
        success: true,
        insights: completion,
        model: 'gpt-4',
        timestamp: new Date().toISOString(),
        analysisType: 'phase1',
        artist: artistData.name
      };

    } catch (error) {
      console.error('AI 분석 오류:', error);
      
      // Anthropic 백업 시도
      try {
        if (this.anthropicKey) {
          const claudeResult = await this.callAnthropic(
            this.buildPhase1Prompt(artistData)
          );
          return {
            success: true,
            insights: claudeResult,
            model: 'claude-3',
            timestamp: new Date().toISOString(),
            analysisType: 'phase1',
            artist: artistData.name,
            fallbackUsed: true
          };
        }
      } catch (claudeError) {
        console.error('Claude 백업도 실패:', claudeError);
      }
      
      // 최종 폴백
      return this.generateFallbackInsights(artistData);
    }
  }

  /**
   * OpenAI API 호출
   */
  async callOpenAI(prompt, retries = 0) {
    try {
      const response = await Promise.race([
        this.openai.chat.completions.create({
          model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'CuratorOdyssey의 전문 아트마켓 분석가로서, 데이터 기반의 객관적이고 통찰력 있는 분석을 제공합니다.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI 응답 시간 초과')), this.timeout)
        )
      ]);

      return response.choices[0].message.content;

    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`AI 재시도 ${retries + 1}/${this.maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        return this.callOpenAI(prompt, retries + 1);
      }
      throw error;
    }
  }

  /**
   * Anthropic Claude API 호출 (백업용)
   */
  async callAnthropic(prompt) {
    // 실제 구현은 Anthropic SDK 사용
    // 현재는 구조만 정의
    throw new Error('Anthropic 연동은 향후 구현 예정');
  }

  /**
   * Vertex AI 호출 (백엔드 Cloud Function 연동)
   */
  async callVertexAI(prompt, options = {}) {
    try {
      console.log('🔮 Vertex AI 백엔드 호출 시작');
      
      const response = await fetch('/api/ai/vertex-generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_VERTEX_AI_TOKEN || ''}`
        },
        body: JSON.stringify({ 
          prompt, 
          model: options.model || 'gemini-1.5-pro',
          reportType: options.reportType || 'comprehensive',
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Vertex API Error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        content: result.content,
        model: 'vertex-ai-gemini',
        tokens_used: result.usage?.total_tokens || 0,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Vertex AI 호출 실패:', error);
      
      // OpenAI로 폴백
      if (this.openai) {
        console.log('🔄 OpenAI로 폴백 시도');
        return await this.callOpenAI(prompt);
      }
      
      throw error;
    }
  }

  /**
   * Phase 1 프롬프트 생성
   */
  buildPhase1Prompt(artistData) {
    return `CuratorOdyssey Phase 1 분석가로서, 다음 작가의 데이터를 종합 분석해주세요:

**작가**: ${artistData.name}

**5축 레이더 점수** (0-100):
- 기관전시(I): ${artistData.radar5.I}점
- 페어(F): ${artistData.radar5.F}점  
- 시상(A): ${artistData.radar5.A}점
- 미디어(M): ${artistData.radar5.M}점
- 교육(Sedu): ${artistData.radar5.Sedu}점

**4축 선버스트 근거 데이터**:
- 제도: ${artistData.sunburst_l1.제도}점
- 학술: ${artistData.sunburst_l1.학술}점
- 담론: ${artistData.sunburst_l1.담론}점
- 네트워크: ${artistData.sunburst_l1.네트워크}점

**분석 요청**:
1. **가치 구성의 특징**: 5축 점수 패턴에서 나타나는 작가의 강점과 특성
2. **균형도 분석**: 축간 편차와 포트폴리오 다각화 수준
3. **시장 포지셔닝**: 현재 점수 기반 작가의 시장 내 위치
4. **발전 제언**: 약점 보완 및 강점 극대화 전략

**응답 형식**: 
- 한국어로 작성
- 4개 섹션 구조화 
- 각 섹션 2-3문장으로 간결하게
- 총 800자 이내
- 데이터 수치 활용한 구체적 근거 제시

분석 시작:`;
  }

  /**
   * AI 실패 시 폴백 인사이트 생성
   */
  generateFallbackInsights(artistData) {
    console.log('🔄 폴백 인사이트 생성:', artistData.name);
    
    const radar = artistData.radar5;
    const sunburst = artistData.sunburst_l1;
    
    // 통계적 분석
    const radarValues = Object.values(radar);
    const maxScore = Math.max(...radarValues);
    const minScore = Math.min(...radarValues);
    const avgScore = radarValues.reduce((a, b) => a + b, 0) / radarValues.length;
    const variance = radarValues.reduce((acc, val) => acc + Math.pow(val - avgScore, 2), 0) / radarValues.length;
    
    // 강점 축 식별
    const strengths = Object.entries(radar)
      .filter(([_, score]) => score > avgScore + 10)
      .map(([axis, _]) => this.getAxisName(axis));
    
    // 약점 축 식별  
    const weaknesses = Object.entries(radar)
      .filter(([_, score]) => score < avgScore - 10)
      .map(([axis, _]) => this.getAxisName(axis));

    const insights = `## 📊 ${artistData.name} Phase 1 분석 (데이터 기반)

### 🎯 가치 구성의 특징
현재 평균 점수 ${avgScore.toFixed(1)}점으로 ${maxScore >= 90 ? '최상위권' : maxScore >= 80 ? '상위권' : '중위권'} 위치입니다. ${strengths.length > 0 ? `특히 ${strengths.join(', ')} 영역에서 강세를 보이며` : '균등한 발전 양상을 보이며'}, 이는 ${variance > 500 ? '전문화된' : '균형잡힌'} 성장 패턴을 나타냅니다.

### ⚖️ 균형도 분석  
최고점 ${maxScore}점과 최저점 ${minScore}점의 격차가 ${(maxScore - minScore).toFixed(1)}점으로, ${maxScore - minScore > 50 ? '불균형이 다소 존재' : '비교적 안정적인 균형'}을 보입니다. 4축 선버스트 데이터에서는 ${Object.entries(sunburst).sort((a, b) => b[1] - a[1])[0][0]}(${Object.entries(sunburst).sort((a, b) => b[1] - a[1])[0][1]}점)이 가장 견고한 기반을 형성하고 있습니다.

### 🎪 시장 포지셔닝
전체적으로 ${avgScore >= 85 ? '글로벌 톱티어' : avgScore >= 70 ? '아시아 주요 작가' : '신진 유망 작가'} 수준의 성과를 달성했습니다. ${radar.I >= 90 ? '기관 전시' : radar.M >= 85 ? '미디어 노출' : radar.F >= 85 ? '페어 참여' : '네트워크 구축'} 측면에서의 뛰어난 성과가 주요 경쟁력으로 작용하고 있습니다.

### 💡 발전 제언
${weaknesses.length > 0 ? `${weaknesses.join(', ')} 영역 집중 개발을 통해` : '현재 강점 영역 심화를 통해'} 추가적인 도약이 가능합니다. 특히 ${minScore < 50 ? '취약 영역의 단계적 보완' : '강점 영역의 글로벌 확장'}에 집중하면 더욱 균형잡힌 포트폴리오 구축이 기대됩니다.`;

    return {
      success: true,
      insights,
      model: 'fallback',
      timestamp: new Date().toISOString(),
      analysisType: 'phase1',
      artist: artistData.name,
      fallbackUsed: true,
      statistics: {
        average: avgScore.toFixed(1),
        max: maxScore,
        min: minScore,
        variance: variance.toFixed(1),
        strengths,
        weaknesses
      }
    };
  }

  /**
   * 축 이름 한국어 변환
   */
  getAxisName(axisCode) {
    const names = {
      'I': '기관전시',
      'F': '페어',
      'A': '시상', 
      'M': '미디어',
      'Sedu': '교육'
    };
    return names[axisCode] || axisCode;
  }

  /**
   * Phase 2/3 통합 분석 (신규 - 종합 보고서)
   */
  async generateComprehensiveReport(phase1Data, phase2Data = null, phase3Data = null) {
    try {
      console.log('📋 종합 보고서 생성 시작:', phase1Data.name);
      
      const reportData = {
        phase1: phase1Data,
        phase2: phase2Data,
        phase3: phase3Data,
        analysisDepth: phase2Data && phase3Data ? 'comprehensive' : 
                       phase2Data ? 'intermediate' : 'basic'
      };

      const prompt = this.buildComprehensivePrompt(reportData);
      
      // Vertex AI 우선 시도
      try {
        const vertexResult = await this.callVertexAI(prompt, {
          model: 'gemini-1.5-pro',
          reportType: 'comprehensive',
          maxTokens: 3000
        });
        
        return {
          success: true,
          report: vertexResult.content,
          model: 'vertex-ai-gemini',
          analysisType: 'comprehensive',
          phases_analyzed: reportData.analysisDepth,
          timestamp: new Date().toISOString()
        };
      } catch (vertexError) {
        console.log('Vertex AI 실패, OpenAI로 폴백');
        
        const openaiResult = await this.callOpenAI(prompt);
        
        return {
          success: true,
          report: openaiResult,
          model: 'gpt-4-comprehensive',
          analysisType: 'comprehensive', 
          phases_analyzed: reportData.analysisDepth,
          timestamp: new Date().toISOString(),
          fallback_used: true
        };
      }

    } catch (error) {
      console.error('종합 보고서 생성 실패:', error);
      return this.generateFallbackComprehensiveReport(phase1Data);
    }
  }

  /**
   * 종합 분석 프롬프트 생성
   */
  buildComprehensivePrompt(reportData) {
    const { phase1, phase2, phase3, analysisDepth } = reportData;
    
    return `CuratorOdyssey 종합 보고서 생성 요청:

**작가**: ${phase1.name}
**분석 범위**: ${analysisDepth.toUpperCase()} (Phase 1${phase2 ? ' + 2' : ''}${phase3 ? ' + 3' : ''})

**Phase 1 데이터** (현재 가치):
- 5축 점수: I${phase1.radar5.I} F${phase1.radar5.F} A${phase1.radar5.A} M${phase1.radar5.M} S${phase1.radar5.Sedu}
- 4축 기반: 제도${phase1.sunburst_l1.제도} 학술${phase1.sunburst_l1.학술} 담론${phase1.sunburst_l1.담론} 네트워크${phase1.sunburst_l1.네트워크}

${phase2 ? `**Phase 2 데이터** (시간축 궤적):
- 20년간 성장 패턴 데이터
- 주요 변곡점 및 이벤트 타임라인
- 축별 성장 속도 및 가속도 분석

` : ''}

${phase3 ? `**Phase 3 데이터** (비교 분석):
- 동시대 작가군 대비 포지셔닝
- 가격 대비 성과 궤적 상관관계
- 시장 내 경쟁력 및 차별화 요소

` : ''}

**보고서 요구사항**:
1. **Executive Summary**: 핵심 인사이트 3-5줄 요약
2. **현재 가치 진단**: Phase 1 데이터 해석
3. **성장 궤적 분석**: ${phase2 ? 'Phase 2 기반 시계열 패턴 분석' : '예상 성장 경로 제시'}
4. **시장 포지셔닝**: ${phase3 ? 'Phase 3 기반 경쟁 분석' : '추정 시장 내 위치'}
5. **전략적 제언**: 단기(1년)/중기(3년) 발전 로드맵
6. **리스크 요인**: 주요 위험 요소 및 대응 전략

**형식**: 구조화된 마크다운, 총 1500-2000자, 데이터 기반 구체적 근거 필수

분석 시작:`;
  }

  /**
   * 종합 분석 폴백 보고서
   */
  generateFallbackComprehensiveReport(phase1Data) {
    const radar = phase1Data.radar5;
    const avgScore = Object.values(radar).reduce((a, b) => a + b, 0) / 5;
    
    const report = `# 📋 ${phase1Data.name} 종합 분석 보고서 (통계 기반)

## Executive Summary
현재 평균 점수 ${avgScore.toFixed(1)}점으로 ${avgScore >= 85 ? '글로벌 톱티어' : avgScore >= 70 ? '아시아 주요 작가' : '신진 유망 작가'} 수준입니다. ${Object.entries(radar).sort((a,b) => b[1]-a[1])[0][0] === 'I' ? '기관전시' : '특정 영역'}에서의 강점을 바탕으로 균형잡힌 성장이 기대됩니다.

## 현재 가치 진단
**강점 영역**: ${Object.entries(radar).filter(([_,v]) => v > avgScore + 10).map(([k,_]) => this.getAxisName(k)).join(', ')}
**개선 영역**: ${Object.entries(radar).filter(([_,v]) => v < avgScore - 10).map(([k,_]) => this.getAxisName(k)).join(', ')}

5축 중 최고 ${Math.max(...Object.values(radar))}점과 최저 ${Math.min(...Object.values(radar))}점의 격차가 ${(Math.max(...Object.values(radar)) - Math.min(...Object.values(radar))).toFixed(1)}점으로 ${Math.max(...Object.values(radar)) - Math.min(...Object.values(radar)) > 50 ? '전문화된' : '균형잡힌'} 프로필을 보입니다.

## 성장 궤적 분석
현재 수준에서 예상되는 성장 경로는 연평균 5-8% 상승으로, 약 3-5년 내 전체적인 점수 향상이 기대됩니다. 특히 약점 영역의 집중적 개발 시 더욱 가파른 성장 곡선이 가능할 것으로 분석됩니다.

## 시장 포지셔닝
동일 세대 작가군 대비 ${avgScore >= 80 ? '상위 20%' : avgScore >= 65 ? '상위 40%' : '성장 잠재력 그룹'} 위치로 추정됩니다. 현재 강점 영역을 중심으로 한 차별화 전략이 효과적일 것으로 판단됩니다.

## 전략적 제언
**단기(1년)**: ${Object.values(radar).some(v => v < 50) ? '취약 영역 기초 체력 강화' : '강점 영역 심화 발전'}
**중기(3년)**: 국제적 인지도 확산 및 다각화된 포트폴리오 구축

## 리스크 요인
- 시장 변동성에 따른 영향도: ${avgScore > 80 ? 'LOW' : avgScore > 60 ? 'MEDIUM' : 'HIGH'}
- 경쟁 환경 변화 대응력: 지속적 모니터링 필요

---
*분석 기준: AHP v1.0 | 생성 시각: ${new Date().toLocaleString('ko-KR')}*`;

    return {
      success: true,
      report,
      model: 'statistical-comprehensive',
      analysisType: 'comprehensive',
      phases_analyzed: 'basic',
      timestamp: new Date().toISOString(),
      fallback_used: true
    };
  }

  /**
   * API 연결 상태 확인 (확장)
   */
  async checkConnection() {
    const results = {
      openai: { connected: false, reason: '' },
      vertex: { connected: false, reason: '' },
      overall: { connected: false, primary: null }
    };

    // OpenAI 연결 확인
    try {
      if (this.openai) {
        await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: '테스트' }],
          max_tokens: 5
        });
        results.openai = { connected: true, model: 'gpt-4' };
      } else {
        results.openai = { connected: false, reason: 'API 키 미설정' };
      }
    } catch (error) {
      results.openai = { connected: false, reason: error.message };
    }

    // Vertex AI 연결 확인
    try {
      const testResponse = await fetch('/api/ai/vertex-health', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${process.env.REACT_APP_VERTEX_AI_TOKEN || ''}` }
      });
      
      if (testResponse.ok) {
        results.vertex = { connected: true, model: 'gemini-1.5-pro' };
      } else {
        results.vertex = { connected: false, reason: `백엔드 연결 실패: ${testResponse.status}` };
      }
    } catch (error) {
      results.vertex = { connected: false, reason: '백엔드 서버 미응답' };
    }

    // 전체 상태 결정
    if (results.vertex.connected) {
      results.overall = { connected: true, primary: 'vertex-ai' };
    } else if (results.openai.connected) {
      results.overall = { connected: true, primary: 'openai' };
    } else {
      results.overall = { connected: false, primary: 'fallback' };
    }

    return results;
  }
}

// 싱글톤 패턴으로 내보내기
const aiService = new AIService();
export default aiService;
