// CuratorOdyssey AI 프롬프트 템플릿 모음
// 최적화된 프롬프트로 토큰 사용량 절약 및 응답 품질 향상

export const PHASE1_ANALYSIS_PROMPT = {
  system: `CuratorOdyssey의 아트마켓 분석 전문가로서, 객관적 데이터에 기반한 통찰력 있는 분석을 제공합니다. 

분석 원칙:
- 수치 데이터를 활용한 구체적 근거 제시
- 균형잡힌 시각으로 강점/약점 동시 분석  
- 실행 가능한 전략적 제언 포함
- 한국 아트 씬 맥락 반영`,

  template: (artistData) => `**작가 분석 요청**: ${artistData.name}

**데이터**:
5축: I${artistData.radar5.I} F${artistData.radar5.F} A${artistData.radar5.A} M${artistData.radar5.M} S${artistData.radar5.Sedu}
4축: 제도${artistData.sunburst_l1.제도} 학술${artistData.sunburst_l1.학술} 담론${artistData.sunburst_l1.담론} 네트워크${artistData.sunburst_l1.네트워크}

**분석 구조**:
1. 가치구성 특징 (2문장)
2. 균형도 분석 (2문장) 
3. 시장 포지셔닝 (2문장)
4. 발전 제언 (2문장)

한국어 800자 이내, 수치 근거 필수:`
};

export const PHASE1_INSIGHTS_VARIANTS = {
  detailed: (artistData) => `${artistData.name} 작가의 심층 가치 분석:

**현재 성취 수준**: 
- 기관전시(${artistData.radar5.I}) 페어(${artistData.radar5.F}) 시상(${artistData.radar5.A}) 미디어(${artistData.radar5.M}) 교육(${artistData.radar5.Sedu})
- 기반 구조: 제도${artistData.sunburst_l1.제도} 학술${artistData.sunburst_l1.학술} 담론${artistData.sunburst_l1.담론} 네트워크${artistData.sunburst_l1.네트워크}

**전문가 분석 요청**:
- 핵심 경쟁력과 차별화 요소는?
- 현재 수준에서 예상되는 시장 반응은?
- 단기(1년) 중기(3년) 발전 로드맵은?
- 글로벌 진출 가능성과 전략은?

구체적 데이터 인용하며 한국어로 답변:`,

  comparative: (artistData) => `아트마켓 벤치마킹 분석:

${artistData.name}: I${artistData.radar5.I} F${artistData.radar5.F} A${artistData.radar5.A} M${artistData.radar5.M} S${artistData.radar5.Sedu}

**동일 세대 아티스트와 비교하여**:
- 어떤 축이 상대적 강점/약점인가?
- 성장 패턴의 특이점은?
- 시장 내 차별화 포인트는?
- 향후 경쟁 우위 지속 가능성은?

데이터 기반 객관적 분석, 800자:`,

  strategic: (artistData) => `${artistData.name} 전략 컨설팅:

**현황**: 평균 ${Object.values(artistData.radar5).reduce((a,b)=>a+b,0)/5} | 최고 ${Math.max(...Object.values(artistData.radar5))} | 최저 ${Math.min(...Object.values(artistData.radar5))}

**전략 과제**:
1. 약점 축 집중 개발 vs 강점 축 극대화 - 어느 것이 효율적?
2. 국내 vs 해외 - 차기 확장 우선순위는?
3. 단독 vs 협업 - 최적 성장 방식은?
4. 단기 성과 vs 장기 기반 - 투자 배분은?

실행 가능한 액션플랜 중심 답변:`
};

export const ERROR_FALLBACK_PROMPTS = {
  networkError: (artistData) => `네트워크 연결 문제로 AI 분석을 완료할 수 없었습니다. 
${artistData.name} 작가의 기본 데이터 분석을 제공합니다.`,

  apiLimitExceeded: (artistData) => `일일 AI 분석 한도에 도달했습니다. 
${artistData.name} 작가의 통계 기반 인사이트를 제공합니다.`,

  invalidData: (artistData) => `제공된 데이터에 불완전한 부분이 있습니다. 
사용 가능한 데이터를 바탕으로 ${artistData.name} 작가의 기본 분석을 제공합니다.`
};

export const PROMPT_OPTIMIZATION_CONFIG = {
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0.1,
  presencePenalty: 0.1
};

// 프롬프트 품질 체크 함수
export function validatePromptTemplate(template, artistData) {
  const rendered = typeof template === 'function' ? template(artistData) : template;
  
  const checks = {
    hasArtistName: rendered.includes(artistData.name),
    hasDataValues: Object.values(artistData.radar5).some(val => rendered.includes(val.toString())),
    isReasonableLength: rendered.length > 100 && rendered.length < 2000,
    hasStructure: rendered.includes('분석') || rendered.includes('**'),
    koreanLanguage: /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(rendered)
  };
  
  const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length;
  
  return {
    score: score,
    checks: checks,
    valid: score >= 0.8,
    rendered: rendered
  };
}

// 사용 예시 및 테스트용
export const SAMPLE_ARTIST_DATA = {
  name: "테스트 작가",
  radar5: {
    I: 85.0,
    F: 72.5,
    A: 68.0,
    M: 79.0,
    Sedu: 45.0
  },
  sunburst_l1: {
    제도: 78.5,
    학술: 65.0,
    담론: 72.0,
    네트워크: 81.5
  }
};
