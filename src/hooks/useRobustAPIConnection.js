import { useState, useEffect, useCallback } from 'react';

// Maya Chen 방어적 연동 시스템 - P1/P2 시스템 헬스체크

const useRobustAPIConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    p1_backend: 'unknown',      // P1 백엔드 API 상태
    p2_database: 'unknown',     // P2 데이터베이스 품질
    overall_health: 'checking',
    last_check: null
  });

  const [apiPerformance, setApiPerformance] = useState({
    average_response_time: null,
    success_rate: null,
    error_patterns: []
  });

  // P1 API 헬스체크 (연동 전 필수)
  const checkP1APIHealth = useCallback(async () => {
    console.log('🔍 P1 백엔드 시스템 헬스체크 시작...');
    
    const healthChecks = {
      summary: testEndpoint('/api/artist/ARTIST_0005/summary', 'GET'),
      sunburst: testEndpoint('/api/artist/ARTIST_0005/sunburst', 'GET'),  
      timeseries: testEndpoint('/api/artist/ARTIST_0005/timeseries/제도', 'GET'),
      comparison: testEndpoint('/api/compare/ARTIST_0005/ARTIST_0003/담론', 'GET'),
      ai_report: testEndpoint('/api/report/generate', 'POST', {
        artistA_data: { name: "테스트" }
      })
    };

    try {
      const startTime = performance.now();
      const results = await Promise.allSettled(Object.entries(healthChecks).map(
        async ([name, testPromise]) => {
          const result = await testPromise;
          return { name, success: result.success, responseTime: result.responseTime };
        }
      ));
      const endTime = performance.now();

      const successCount = results.filter(r => r.value?.success).length;
      const totalTests = results.length;
      const successRate = (successCount / totalTests) * 100;
      
      const p1Status = successRate >= 80 ? 'healthy' : 
                       successRate >= 40 ? 'partial' : 'failed';

      console.log(`📊 P1 헬스체크 결과: ${successCount}/${totalTests} (${successRate.toFixed(0)}%)`);
      
      setApiPerformance({
        average_response_time: endTime - startTime,
        success_rate: successRate,
        error_patterns: results.filter(r => !r.value?.success).map(r => r.value?.name)
      });

      return p1Status;

    } catch (error) {
      console.error('❌ P1 헬스체크 전체 실패:', error);
      return 'failed';
    }
  }, []);

  // P2 데이터 품질 검증
  const verifyP2DataQuality = useCallback(async () => {
    console.log('🔍 P2 데이터베이스 품질 검증 시작...');
    
    try {
      // P2 품질 지표 확인 (실제로는 P2 API 또는 직접 Firestore 확인)
      const qualityCheckUrl = '/api/admin/data-quality-status'; // P2가 구현할 예정
      
      const qualityCheck = await fetch(qualityCheckUrl).catch(() => ({
        ok: false,
        status: 503,
        statusText: 'P2 Quality API Not Available'
      }));

      if (qualityCheck.ok) {
        const qualityData = await qualityCheck.json();
        
        const p2Status = qualityData.overall_score >= 0.95 ? 'excellent' :
                         qualityData.overall_score >= 0.85 ? 'good' : 
                         'needs_improvement';

        console.log(`📊 P2 품질 검증 결과: ${qualityData.overall_score} (${p2Status})`);
        return p2Status;
        
      } else {
        console.log('ℹ️ P2 품질 API 아직 미구현, 기본값 사용');
        return 'assumed_good'; // P2 구현 전까지 기본값
      }

    } catch (error) {
      console.warn('⚠️ P2 품질 검증 실패:', error.message);
      return 'unknown';
    }
  }, []);

  // 전체 시스템 상태 체크
  const checkOverallHealth = useCallback(async () => {
    console.log('🏥 전체 시스템 헬스체크 실행...');
    
    const [p1Status, p2Status] = await Promise.all([
      checkP1APIHealth(),
      verifyP2DataQuality()
    ]);

    const overallHealth = 
      (p1Status === 'healthy' && ['excellent', 'good'].includes(p2Status)) ? 'ready' :
      (p1Status === 'partial' || p2Status === 'assumed_good') ? 'partial' :
      'not_ready';

    setConnectionStatus({
      p1_backend: p1Status,
      p2_database: p2Status,
      overall_health: overallHealth,
      last_check: new Date().toISOString()
    });

    console.log(`🎯 전체 시스템 상태: ${overallHealth}`, {
      p1: p1Status,
      p2: p2Status
    });

    return { p1Status, p2Status, overallHealth };
  }, [checkP1APIHealth, verifyP2DataQuality]);

  // 적응형 데이터 로딩 (시스템 상태에 따라)
  const adaptiveLoad = useCallback(async (dataType, params) => {
    const { overall_health, p1_backend } = connectionStatus;

    if (overall_health === 'ready' && p1_backend === 'healthy') {
      console.log(`🚀 적응형 로딩: 실제 API 사용 (${dataType})`);
      return loadFromAPI(dataType, params);
      
    } else if (overall_health === 'partial') {
      console.log(`⚡ 적응형 로딩: 하이브리드 모드 (${dataType})`);
      return loadFromHybrid(dataType, params);
      
    } else {
      console.log(`🎭 적응형 로딩: 목업 모드 (${dataType})`);
      return loadFromMock(dataType, params);
    }
  }, [connectionStatus]);

  // 주기적 헬스체크 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkOverallHealth();
      }
    }, 30000);

    // 초기 체크
    checkOverallHealth();

    return () => clearInterval(interval);
  }, [checkOverallHealth]);

  return {
    connectionStatus,
    apiPerformance,
    checkP1APIHealth,
    verifyP2DataQuality,
    checkOverallHealth,
    adaptiveLoad,
    isReady: connectionStatus.overall_health === 'ready',
    canUseAPI: ['healthy', 'partial'].includes(connectionStatus.p1_backend)
  };
};

// 헬퍼 함수들
const testEndpoint = async (url, method = 'GET', body = null) => {
  const startTime = performance.now();
  
  try {
    const options = {
      method,
      headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
      ...(body && { body: JSON.stringify(body) })
    };
    
    const response = await fetch(url, options);
    const endTime = performance.now();
    
    return {
      success: response.ok,
      status: response.status,
      responseTime: endTime - startTime,
      url: url
    };
    
  } catch (error) {
    const endTime = performance.now();
    
    return {
      success: false,
      error: error.message,
      responseTime: endTime - startTime,
      url: url
    };
  }
};

const loadFromAPI = async (dataType, params) => {
  // 실제 P1 API 호출
  const apiProvider = createApiProvider();
  
  switch (dataType) {
    case 'summary':
      return await apiProvider.getArtistSummary(params.artistId);
    case 'timeseries':
      return await apiProvider.getTimeseriesData(params.artistId, params.axis);
    case 'comparison':
      return await apiProvider.getComparisonData(params.artistA, params.artistB, params.axis);
    case 'ai_report':
      return await apiProvider.generateAIReport(params.data, params.template);
    default:
      throw new Error(`알 수 없는 데이터 타입: ${dataType}`);
  }
};

const loadFromHybrid = async (dataType, params) => {
  // API 시도 후 실패시 목업 폴백
  try {
    return await loadFromAPI(dataType, params);
  } catch (error) {
    console.log(`⚡ 하이브리드 모드: API 실패, 목업으로 폴백 (${dataType})`);
    return loadFromMock(dataType, params);
  }
};

const loadFromMock = async (dataType, params) => {
  // 목업 데이터 반환 (현재 시스템)
  const mockProvider = createMockProvider();
  
  switch (dataType) {
    case 'summary':
      return await mockProvider.getArtistSummary(params.artistId);
    case 'timeseries':
      return await mockProvider.getTimeseriesData(params.artistId, params.axis);
    case 'comparison':
      return await mockProvider.getComparisonData(params.artistA, params.artistB, params.axis);
    case 'ai_report':
      return await mockProvider.generateAIReport(params.data, params.template);
    default:
      return null;
  }
};

export default useRobustAPIConnection;

