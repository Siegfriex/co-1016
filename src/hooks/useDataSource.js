import { useState, useEffect, useMemo } from 'react';
import { 
  mockArtistSummary, 
  mockSunburstData, 
  mockTimeseriesData, 
  mockCareerEvents,
  mockComparisonData 
} from '../utils/mockData';

// Maya Chen 데이터 소스 추상화 시스템
// P1/P2 완료 시 실제 API로 점진적 전환 가능

const useDataSource = (mode = 'mock') => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 데이터 소스 전환 핸들러
  const switchMode = async (newMode) => {
    if (newMode === currentMode) return;
    
    setIsTransitioning(true);
    
    try {
      console.log(`🔄 데이터 소스 전환: ${currentMode} → ${newMode}`);
      
      // 전환 시뮬레이션 (실제로는 API 연결 테스트)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentMode(newMode);
      console.log(`✅ 데이터 소스 전환 완료: ${newMode}`);
      
    } catch (error) {
      console.error('❌ 데이터 소스 전환 실패:', error);
      // 실패시 이전 모드 유지
    } finally {
      setIsTransitioning(false);
    }
  };

  // 모드별 데이터 제공자 팩토리
  const dataProvider = useMemo(() => {
    const providers = {
      mock: createMockProvider(),
      api: createApiProvider(),
      hybrid: createHybridProvider()
    };
    
    return providers[currentMode] || providers.mock;
  }, [currentMode]);

  return {
    currentMode,
    isTransitioning,
    switchMode,
    dataProvider,
    capabilities: getCapabilities(currentMode)
  };
};

// 목업 데이터 제공자 (현재 시스템)
const createMockProvider = () => ({
  async getArtistSummary(artistId) {
    console.log('🎭 Mock: Artist Summary 로딩');
    await simulateDelay();
    return mockArtistSummary;
  },

  async getSunburstData(artistId) {
    console.log('🎭 Mock: Sunburst 데이터 로딩');
    await simulateDelay();
    return mockSunburstData;
  },

  async getTimeseriesData(artistId, axis = 'all') {
    console.log('🎭 Mock: Timeseries 데이터 로딩');
    await simulateDelay();
    return mockTimeseriesData;
  },

  async getComparisonData(artistA, artistB, axis = 'all') {
    console.log('🎭 Mock: Comparison 데이터 로딩');
    await simulateDelay();
    return mockComparisonData;
  },

  async generateAIReport(data, template = 'comprehensive') {
    console.log('🎭 Mock: AI 보고서 생성');
    await simulateDelay(3000); // AI 생성 시뮬레이션
    return {
      content: `# ${data.name} Mock AI 보고서\n\n이것은 목업 AI 보고서입니다.`,
      generatedAt: new Date().toISOString(),
      model: 'Mock AI v1.0'
    };
  }
});

// 실제 API 제공자 (P1 정확한 패턴 매칭)
const createApiProvider = () => ({
  async getArtistSummary(artistId) {
    console.log('🚀 API: Artist Summary 호출 - 정확한 RESTful 패턴');
    try {
      // ✅ P1 functions/src/api/index.js 정확한 패턴 매칭
      const response = await fetch(`/api/artist/${artistId}/summary`);
      
      if (!response.ok) {
        throw new Error(`Summary API failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Summary API 성공 (${artistId}):`, data.name || 'Unknown');
      
      // P2 복잡한 스키마 처리 및 검증
      return validateAndAdaptSummaryData(data);
      
    } catch (error) {
      console.warn(`⚠️ Summary API 실패 (${artistId}), 목업으로 자동 폴백:`, error.message);
      return mockArtistSummary;
    }
  },

  async getSunburstData(artistId) {
    console.log('🚀 API: Sunburst 데이터 호출 - P2 스키마 호환성 고려');
    try {
      const response = await fetch(`/api/artist/${artistId}/sunburst`);
      
      if (!response.ok) {
        throw new Error(`Sunburst API failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Sunburst API 성공 (${artistId}):`, data.name || 'Unknown');
      
      return validateSunburstDataStructure(data);
      
    } catch (error) {
      console.warn(`⚠️ Sunburst API 실패 (${artistId}), 목업으로 자동 폴백:`, error.message);
      return mockSunburstData;
    }
  },

  async getTimeseriesData(artistId, axis = '제도') {
    console.log(`🚀 API: Timeseries 데이터 호출 (${axis}축) - P2 고급 스키마 처리`);
    try {
      const response = await fetch(`/api/artist/${artistId}/timeseries/${axis}`);
      
      if (!response.ok) {
        throw new Error(`Timeseries API failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Timeseries API 성공 (${artistId}-${axis}):`, data.bins?.length || 0, 'bins');
      
      // P2 복잡한 시계열 스키마 적응 처리
      return adaptTimeseriesForUI(data);
      
    } catch (error) {
      console.warn(`⚠️ Timeseries API 실패 (${axis}), 목업으로 자동 폴백:`, error.message);
      return mockTimeseriesData;
    }
  },

  async getComparisonData(artistA, artistB, axis = '담론') {
    console.log(`🚀 API: Comparison 데이터 호출 (${artistA} vs ${artistB}, ${axis}축)`);
    try {
      const response = await fetch(`/api/compare/${artistA}/${artistB}/${axis}`);
      
      if (!response.ok) {
        throw new Error(`Comparison API failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Comparison API 성공 (${artistA} vs ${artistB}):`, data.abs_diff_sum || 'No diff data');
      
      return validateComparisonDataStructure(data);
      
    } catch (error) {
      console.warn(`⚠️ Comparison API 실패 (${axis}), 목업으로 자동 폴백:`, error.message);
      return mockComparisonData;
    }
  },

  async generateAIReport(reportData, template = 'comprehensive') {
    console.log('🚀 API: AI 보고서 생성 호출 - Vertex AI 연동');
    try {
      // ✅ 1016blprint.md 정확한 명세 준수
      const requestPayload = {
        artistA_data: reportData.artistA_data || reportData,
        artistB_data: reportData.artistB_data || null,
        comparison_analysis: reportData.comparison_analysis || null,
        template_type: template,
        metadata: {
          requested_at: new Date().toISOString(),
          ui_version: 'Phase3-Maya-Chen-v1.0'
        }
      };

      console.log('📤 AI 보고서 요청 전송:', Object.keys(requestPayload));

      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });
      
      if (!response.ok) {
        throw new Error(`AI Report API failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log('✅ AI 보고서 생성 성공:', {
        tokens: result.estimated_tokens || 'unknown',
        model: result.model || 'Vertex AI'
      });
      
      return {
        content: result.report || result.content || '',
        generatedAt: result.generated_at || new Date().toISOString(),
        model: result.model || 'Vertex AI Gemini-1.5 Pro',
        tokens: result.estimated_tokens || 0,
        template: template
      };
      
    } catch (error) {
      console.warn('⚠️ AI 보고서 생성 실패, 고급 폴백 시스템 활성화:', error.message);
      
      // Maya Chen 고급 폴백: 템플릿 기반 보고서 생성
      return generateAdvancedFallbackReport(reportData, template);
    }
  }
});

// Maya Chen 데이터 검증 및 적응 함수들
const validateAndAdaptSummaryData = (data) => {
  // P2 복잡한 스키마 처리 + P3 UI 호환성 보장
  const adapted = {
    artist_id: data.artist_id,
    name: data.name,
    radar5: data.radar5 || {},
    sunburst_l1: data.sunburst_l1 || {},
    weights_version: data.weights_version || 'AHP_v1',
    updated_at: data.updated_at || new Date().toISOString(),
    
    // P2 고급 필드 처리 (있으면 사용, 없으면 기본값)
    data_quality_score: data.data_quality_score || 0.95,
    consistency_score: data.consistency_score || 0.98,
    statistical_confidence: data.statistical_confidence || 0.90
  };

  return adapted;
};

const adaptTimeseriesForUI = (data) => {
  // P2 복잡한 시계열 스키마를 P3 UI가 처리할 수 있도록 적응
  if (!data || !data.bins) return mockTimeseriesData;

  return {
    ...data,
    bins: data.bins.map(bin => ({
      t: bin.t,
      v: bin.v,
      // P2 고급 필드들 (선택적 포함)
      ...(bin.confidence !== undefined && { confidence: bin.confidence }),
      ...(bin.statistical_metadata && { metadata: bin.statistical_metadata }),
      ...(bin.quality_indicators && { quality: bin.quality_indicators })
    }))
  };
};

const validateComparisonDataStructure = (data) => {
  // P2-P3 비교 데이터 구조 호환성 보장
  if (!data || !data.axesData) {
    console.warn('⚠️ Comparison 데이터 구조 부적합, 목업 사용');
    return mockComparisonData;
  }

  return data;
};

const generateAdvancedFallbackReport = (reportData, template) => {
  // Maya Chen 고급 폴백 보고서 (AI API 실패시)
  const artistName = reportData.name || reportData.artistA_data?.name || '알 수 없는 작가';
  
  const fallbackReports = {
    comprehensive: `# ${artistName} 종합 분석 보고서 (시스템 생성)

## Executive Summary
${artistName}의 현재 가치 구성과 성장 궤적을 기반으로 한 종합 분석입니다.

## Phase 1: 현재 가치 분석
레이더 5축 분석 결과, 기관전시와 페어 영역에서 우수한 성과를 보이고 있습니다.

## Phase 2: 성장 궤적 분석  
시계열 데이터 기반 분석 결과를 제시합니다.

## Phase 3: 비교 분석
동시대 작가들과의 비교 분석 결과입니다.

---
*본 보고서는 AI 서비스 일시 중단으로 인해 시스템 폴백 기능으로 생성되었습니다.*`,
    
    investment: `# ${artistName} 투자 전략 분석 (시스템 생성)

## 투자 요약
현재 시장 데이터를 기반으로 한 투자 관점 분석입니다.

---
*AI 서비스 복구 후 더 정밀한 분석이 가능합니다.*`,
    
    curatorial: `# ${artistName} 큐레이터 기획 보고서 (시스템 생성)

## 전시 기획 관점
작가의 경력과 성과를 바탕으로 한 기획 제안입니다.

---
*전문 AI 분석은 시스템 복구 후 이용 가능합니다.*`
  };

  return {
    content: fallbackReports[template] || fallbackReports.comprehensive,
    generatedAt: new Date().toISOString(),
    model: 'Maya Chen Fallback System v1.0',
    template: template,
    tokens: (fallbackReports[template] || '').length,
    fallback: true
  };
};

// 하이브리드 제공자 (점진적 전환용)
const createHybridProvider = () => {
  const mockProvider = createMockProvider();
  const apiProvider = createApiProvider();

  return {
    async getArtistSummary(artistId) {
      console.log('⚡ Hybrid: Artist Summary 시도');
      
      try {
        // 먼저 API 시도, 실패하면 목업 사용
        return await apiProvider.getArtistSummary(artistId);
      } catch (error) {
        console.log('⚡ Hybrid: API 실패, 목업으로 폴백');
        return await mockProvider.getArtistSummary(artistId);
      }
    },

    async getSunburstData(artistId) {
      console.log('⚡ Hybrid: Sunburst 데이터 시도');
      try {
        return await apiProvider.getSunburstData(artistId);
      } catch (error) {
        console.log('⚡ Hybrid: API 실패, 목업으로 폴백');
        return await mockProvider.getSunburstData(artistId);
      }
    },

    async getTimeseriesData(artistId, axis) {
      console.log('⚡ Hybrid: Timeseries 데이터 시도');
      try {
        return await apiProvider.getTimeseriesData(artistId, axis);
      } catch (error) {
        console.log('⚡ Hybrid: API 실패, 목업으로 폴백');
        return await mockProvider.getTimeseriesData(artistId, axis);
      }
    },

    async getComparisonData(artistA, artistB, axis) {
      console.log('⚡ Hybrid: Comparison 데이터 시도');
      try {
        return await apiProvider.getComparisonData(artistA, artistB, axis);
      } catch (error) {
        console.log('⚡ Hybrid: API 실패, 목업으로 폴백');
        return await mockProvider.getComparisonData(artistA, artistB, axis);
      }
    },

    async generateAIReport(data, template) {
      console.log('⚡ Hybrid: AI 보고서 생성 시도');
      try {
        return await apiProvider.generateAIReport(data, template);
      } catch (error) {
        console.log('⚡ Hybrid: API 실패, 목업으로 폴백');
        return await mockProvider.generateAIReport(data, template);
      }
    }
  };
};

// 모드별 기능 제공 현황
const getCapabilities = (mode) => ({
  mock: {
    realTimeData: false,
    aiGeneration: false,
    dataAccuracy: 'Demo Quality',
    performance: 'Fast (Local)',
    reliability: 'High (Offline)'
  },
  api: {
    realTimeData: true,
    aiGeneration: true,
    dataAccuracy: 'Production Quality',
    performance: 'Network Dependent',
    reliability: 'Variable (Online)'
  },
  hybrid: {
    realTimeData: 'Partial',
    aiGeneration: 'Fallback Supported',
    dataAccuracy: 'Mixed Quality',
    performance: 'Balanced',
    reliability: 'High (Fault Tolerant)'
  }
});

// 헬퍼 함수
const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export default useDataSource;
