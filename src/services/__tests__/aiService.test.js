// CuratorOdyssey AI Service 테스트
// Jest + React Testing Library

import aiService from '../aiService';
import { SAMPLE_ARTIST_DATA } from '../../prompts/phase1Templates';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }));
});

describe('AIService', () => {
  beforeEach(() => {
    // 테스트 전 초기화
    jest.clearAllMocks();
    
    // 환경변수 모킹
    process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
    process.env.REACT_APP_OPENAI_MODEL = 'gpt-4';
    process.env.REACT_APP_AI_MAX_RETRIES = '2';
    process.env.REACT_APP_AI_TIMEOUT = '5000';
  });

  afterEach(() => {
    delete process.env.REACT_APP_OPENAI_API_KEY;
    delete process.env.REACT_APP_OPENAI_MODEL;
    delete process.env.REACT_APP_AI_MAX_RETRIES;
    delete process.env.REACT_APP_AI_TIMEOUT;
  });

  describe('generatePhase1Insights', () => {
    test('성공적인 AI 분석 완료', async () => {
      // OpenAI 응답 모킹
      const mockResponse = {
        choices: [{
          message: {
            content: `## 📊 테스트 작가 Phase 1 분석

### 🎯 가치 구성의 특징
기관전시(85.0점)와 네트워크(81.5점)에서 강세를 보이며, 제도권 인정과 인맥 구축이 뛰어납니다. 교육(45.0점) 영역이 상대적 약점으로 나타나 균형적 발전이 필요합니다.

### ⚖️ 균형도 분석
최고점과 최저점의 격차가 40점으로 다소 불균형한 모습입니다. 4축 선버스트에서는 네트워크(81.5점)가 가장 견고한 기반을 형성하고 있습니다.

### 🎪 시장 포지셔닝  
평균 69.9점으로 아시아 주요 작가 수준의 성과를 달성했습니다. 기관전시와 네트워크 측면의 뛰어난 성과가 주요 경쟁력으로 작용합니다.

### 💡 발전 제언
교육 영역 집중 개발을 통해 추가적인 도약이 가능합니다. 특히 취약 영역의 단계적 보완에 집중하면 더욱 균형잡힌 포트폴리오 구축이 기대됩니다.`
          }
        }]
      };

      // aiService.openai가 존재하도록 모킹
      aiService.openai = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockResponse)
          }
        }
      };

      const result = await aiService.generatePhase1Insights(SAMPLE_ARTIST_DATA);

      expect(result.success).toBe(true);
      expect(result.insights).toContain('테스트 작가');
      expect(result.model).toBe('gpt-4');
      expect(result.analysisType).toBe('phase1');
      expect(result.artist).toBe(SAMPLE_ARTIST_DATA.name);
    });

    test('API 키 없을 때 폴백 분석 실행', async () => {
      // API 키 제거
      delete process.env.REACT_APP_OPENAI_API_KEY;
      
      // aiService 재초기화
      aiService.openai = null;

      const result = await aiService.generatePhase1Insights(SAMPLE_ARTIST_DATA);

      expect(result.success).toBe(true);
      expect(result.model).toBe('fallback');
      expect(result.fallbackUsed).toBe(true);
      expect(result.statistics).toBeDefined();
      expect(result.statistics.average).toBe('69.9');
    });

    test('OpenAI API 에러 시 폴백 처리', async () => {
      // API 에러 모킹
      aiService.openai = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API quota exceeded'))
          }
        }
      };

      const result = await aiService.generatePhase1Insights(SAMPLE_ARTIST_DATA);

      expect(result.success).toBe(true);
      expect(result.model).toBe('fallback');
      expect(result.fallbackUsed).toBe(true);
      expect(result.insights).toContain('데이터 기반');
    });

    test('잘못된 데이터 처리', async () => {
      const invalidData = {
        name: '',
        radar5: {},
        sunburst_l1: {}
      };

      const result = await aiService.generatePhase1Insights(invalidData);
      
      expect(result.success).toBe(true);
      expect(result.fallbackUsed).toBe(true);
    });
  });

  describe('buildPhase1Prompt', () => {
    test('프롬프트 올바른 생성', () => {
      const prompt = aiService.buildPhase1Prompt(SAMPLE_ARTIST_DATA);

      expect(prompt).toContain(SAMPLE_ARTIST_DATA.name);
      expect(prompt).toContain('85.0'); // I축 점수
      expect(prompt).toContain('78.5'); // 제도 점수
      expect(prompt).toContain('분석 요청');
      expect(prompt).toContain('응답 형식');
    });
  });

  describe('getAxisName', () => {
    test('축 코드 한국어 변환', () => {
      expect(aiService.getAxisName('I')).toBe('기관전시');
      expect(aiService.getAxisName('F')).toBe('페어');
      expect(aiService.getAxisName('A')).toBe('시상');
      expect(aiService.getAxisName('M')).toBe('미디어');
      expect(aiService.getAxisName('Sedu')).toBe('교육');
      expect(aiService.getAxisName('Unknown')).toBe('Unknown');
    });
  });

  describe('generateFallbackInsights', () => {
    test('통계 기반 인사이트 생성', () => {
      const result = aiService.generateFallbackInsights(SAMPLE_ARTIST_DATA);

      expect(result.success).toBe(true);
      expect(result.model).toBe('fallback');
      expect(result.fallbackUsed).toBe(true);
      expect(result.statistics).toBeDefined();
      
      // 통계 값 검증
      expect(result.statistics.average).toBe('69.9');
      expect(result.statistics.max).toBe(85.0);
      expect(result.statistics.min).toBe(45.0);
      expect(result.statistics.strengths).toContain('기관전시');
      expect(result.statistics.weaknesses).toContain('교육');
    });

    test('인사이트 텍스트 구조 검증', () => {
      const result = aiService.generateFallbackInsights(SAMPLE_ARTIST_DATA);

      expect(result.insights).toContain('## 📊');
      expect(result.insights).toContain('### 🎯 가치 구성의 특징');
      expect(result.insights).toContain('### ⚖️ 균형도 분석');
      expect(result.insights).toContain('### 🎪 시장 포지셔닝');
      expect(result.insights).toContain('### 💡 발전 제언');
    });
  });

  describe('checkConnection', () => {
    test('API 키 없을 때 연결 실패', async () => {
      aiService.openai = null;
      
      const result = await aiService.checkConnection();
      
      expect(result.connected).toBe(false);
      expect(result.reason).toBe('API 키 미설정');
    });

    test('API 정상 연결', async () => {
      aiService.openai = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: '테스트' } }]
            })
          }
        }
      };

      const result = await aiService.checkConnection();
      
      expect(result.connected).toBe(true);
      expect(result.model).toBe('gpt-4');
    });
  });
});

// 통합 테스트용 헬퍼
export const createMockArtistData = (overrides = {}) => ({
  ...SAMPLE_ARTIST_DATA,
  ...overrides
});

export const expectValidInsights = (result) => {
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.insights).toBeTruthy();
  expect(result.timestamp).toBeTruthy();
  expect(result.analysisType).toBe('phase1');
  expect(result.artist).toBeTruthy();
};
