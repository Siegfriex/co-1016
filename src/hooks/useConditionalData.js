import { useState, useEffect, useCallback } from 'react';
import useDataSource from './useDataSource';

// Maya Chen 조건부 데이터 로딩 훅
// 데이터 소스 모드에 따라 적절한 데이터 제공

const useConditionalData = (artistId, mode = 'mock') => {
  const { dataProvider, currentMode, isTransitioning, capabilities } = useDataSource(mode);
  const [data, setData] = useState({
    phase1: null,
    phase2: null,
    phase3: null,
    phase4: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 전체 데이터 로딩 (Phase 1-3 통합)
  const loadAllData = useCallback(async () => {
    if (!artistId || !dataProvider) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`📊 통합 데이터 로딩 시작 (${currentMode} 모드)`);
      
      // Phase별 병렬 데이터 로딩
      const [phase1Summary, sunburstData, timeseriesData, comparisonData] = await Promise.all([
        dataProvider.getArtistSummary(artistId),
        dataProvider.getSunburstData(artistId),
        dataProvider.getTimeseriesData(artistId),
        dataProvider.getComparisonData(artistId, 'ARTIST_0003', 'all') // 기본 비교 대상
      ]);

      setData({
        phase1: {
          summary: phase1Summary,
          sunburst: sunburstData
        },
        phase2: timeseriesData,
        phase3: comparisonData,
        phase4: {
          integratedAnalysis: true,
          dataSource: currentMode,
          capabilities: capabilities
        }
      });

      setLastUpdated(new Date().toISOString());
      console.log(`✅ 통합 데이터 로딩 완료 (${currentMode} 모드)`);

    } catch (err) {
      setError(`데이터 로딩 실패 (${currentMode} 모드): ${err.message}`);
      console.error('❌ 통합 데이터 로딩 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [artistId, dataProvider, currentMode, capabilities]);

  // 특정 Phase 데이터 갱신
  const refreshPhaseData = useCallback(async (phaseNumber) => {
    if (!dataProvider) return;

    try {
      console.log(`🔄 Phase ${phaseNumber} 데이터 갱신`);

      switch (phaseNumber) {
        case 1:
          const [summary, sunburst] = await Promise.all([
            dataProvider.getArtistSummary(artistId),
            dataProvider.getSunburstData(artistId)
          ]);
          setData(prev => ({
            ...prev,
            phase1: { summary, sunburst }
          }));
          break;

        case 2:
          const timeseries = await dataProvider.getTimeseriesData(artistId);
          setData(prev => ({
            ...prev,
            phase2: timeseries
          }));
          break;

        case 3:
          const comparison = await dataProvider.getComparisonData(artistId, 'ARTIST_0003', 'all');
          setData(prev => ({
            ...prev,
            phase3: comparison
          }));
          break;

        default:
          console.warn('⚠️ 알 수 없는 Phase:', phaseNumber);
      }

      setLastUpdated(new Date().toISOString());
      console.log(`✅ Phase ${phaseNumber} 데이터 갱신 완료`);

    } catch (error) {
      console.error(`❌ Phase ${phaseNumber} 갱신 실패:`, error);
    }
  }, [dataProvider, artistId]);

  // AI 보고서 생성
  const generateReport = useCallback(async (template = 'comprehensive') => {
    if (!dataProvider || !data.phase1) {
      throw new Error('데이터가 로딩되지 않음');
    }

    console.log(`🤖 AI 보고서 생성 (${template} 템플릿)`);

    try {
      const reportData = {
        name: data.phase1.summary.name,
        phase1: data.phase1.summary,
        phase2: data.phase2,
        phase3: data.phase3
      };

      return await dataProvider.generateAIReport(reportData, template);
    } catch (error) {
      console.error('❌ AI 보고서 생성 실패:', error);
      throw error;
    }
  }, [dataProvider, data]);

  // 데이터 검증
  const validateData = useCallback(() => {
    const validation = {
      phase1: {
        available: !!data.phase1,
        complete: data.phase1?.summary && data.phase1?.sunburst,
        quality: data.phase1 ? 'Good' : 'Missing'
      },
      phase2: {
        available: !!data.phase2,
        complete: data.phase2?.bins?.length > 0,
        quality: data.phase2?.bins?.length > 10 ? 'Good' : 'Limited'
      },
      phase3: {
        available: !!data.phase3,
        complete: data.phase3?.axesData?.length === 4,
        quality: data.phase3?.axesData?.length === 4 ? 'Good' : 'Incomplete'
      }
    };

    return validation;
  }, [data]);

  // 초기 로딩 및 모드 변경시 데이터 로딩
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    data,
    loading: loading || isTransitioning,
    error,
    lastUpdated,
    currentMode,
    isTransitioning,
    capabilities,
    
    // 액션
    loadAllData,
    refreshPhaseData,
    generateReport,
    validateData,
    
    // 상태 정보
    isReady: !loading && !error && data.phase1,
    dataQuality: validateData()
  };
};

// 헬퍼 함수
const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export default useConditionalData;

