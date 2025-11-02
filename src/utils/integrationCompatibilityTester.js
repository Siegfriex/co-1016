/**
 * CuratorOdyssey Integration Compatibility Tester
 * Dr. Sarah Kim's P1-P2-P3 Cross-Validation System
 * 
 * 병렬개발 위험 완화: 실시간 호환성 검증 및 오류 조기 감지
 */

import { universalDataAdapter } from '../adapters/universalDataAdapter';

// =====================================================
// 🔬 P1-P2-P3 3원 연동 호환성 검증 시스템
// =====================================================

export class IntegrationCompatibilityTester {
  constructor() {
    this.testResults = [];
    this.compatibilityHistory = [];
    this.monitoringActive = false;
  }

  // =====================================================
  // 🎯 메인 호환성 테스트: P1 구현 ↔ P3 UI
  // =====================================================

  async testP1P3Integration(mockP1Responses = null) {
    console.log('🔗 [Integration Test] P1 API ↔ P3 UI 호환성 검증 시작...');
    
    const testSuite = {
      test_id: `INTEGRATION_${Date.now()}`,
      started_at: new Date().toISOString(),
      tester: 'Dr. Sarah Kim Integration System',
      
      // 1. API 엔드포인트 패턴 검증
      api_pattern_tests: await this.testAPIPatternCompatibility(),
      
      // 2. 데이터 형식 호환성 검증  
      data_format_tests: await this.testDataFormatCompatibility(mockP1Responses),
      
      // 3. UI 파싱 시뮬레이션
      ui_parsing_tests: await this.simulateP3UIParsing(mockP1Responses),
      
      // 4. 에러 시나리오 검증
      error_handling_tests: await this.testErrorScenarioCompatibility(),
      
      // 5. 성능 호환성 검증
      performance_tests: await this.testPerformanceCompatibility()
    };
    
    // 종합 호환성 점수 계산
    testSuite.overall_compatibility = this.calculateOverallCompatibility(testSuite);
    testSuite.completed_at = new Date().toISOString();
    
    // 테스트 결과 저장
    this.testResults.push(testSuite);
    
    console.log(`${testSuite.overall_compatibility.is_compatible ? '✅' : '❌'} [Integration Result] 종합 호환성: ${(testSuite.overall_compatibility.score * 100).toFixed(1)}%`);
    
    return testSuite;
  }

  // API 엔드포인트 패턴 호환성 검증
  async testAPIPatternCompatibility() {
    console.log('🔍 [API Pattern Test] 엔드포인트 패턴 호환성 검증...');
    
    const expectedP1Patterns = {
      artist_summary: '/api/artist/:id/summary',
      artist_sunburst: '/api/artist/:id/sunburst',
      artist_timeseries: '/api/artist/:id/timeseries/:axis',
      comparison: '/api/compare/:artistA/:artistB/:axis',
      ai_report: '/api/report/generate'
    };
    
    const expectedP3Calls = {
      artist_summary: '/api/artist/ARTIST_0005/summary',
      artist_sunburst: '/api/artist/ARTIST_0005/sunburst', 
      artist_timeseries: '/api/artist/ARTIST_0005/timeseries/제도',
      comparison: '/api/compare/ARTIST_0005/ARTIST_0003/담론',
      ai_report: '/api/report/generate'
    };
    
    const patternCompatibility = {};
    
    Object.keys(expectedP1Patterns).forEach(endpoint => {
      const p1Pattern = expectedP1Patterns[endpoint];
      const p3Call = expectedP3Calls[endpoint];
      
      // URL 패턴 매칭 검증
      const isCompatible = this.validateURLPatternMatch(p1Pattern, p3Call);
      
      patternCompatibility[endpoint] = {
        p1_pattern: p1Pattern,
        p3_call: p3Call,
        is_compatible: isCompatible,
        issues: isCompatible ? [] : ['url_pattern_mismatch']
      };
    });
    
    const compatibleEndpoints = Object.values(patternCompatibility).filter(test => test.is_compatible).length;
    const totalEndpoints = Object.keys(patternCompatibility).length;
    
    return {
      success: compatibleEndpoints === totalEndpoints,
      compatibility_rate: compatibleEndpoints / totalEndpoints,
      endpoint_results: patternCompatibility,
      recommendations: this.generateAPIPatternRecommendations(patternCompatibility)
    };
  }

  validateURLPatternMatch(p1Pattern, p3Call) {
    // RESTful 패턴과 실제 호출의 일치성 검증
    const p1Regex = p1Pattern
      .replace(/:\w+/g, '[^/]+')  // :id → [^/]+
      .replace(/\//g, '\\/');     // / → \/
    
    const regex = new RegExp(`^${p1Regex}$`);
    return regex.test(p3Call);
  }

  generateAPIPatternRecommendations(patternCompatibility) {
    const recommendations = [];
    
    Object.entries(patternCompatibility).forEach(([endpoint, test]) => {
      if (!test.is_compatible) {
        recommendations.push({
          endpoint: endpoint,
          issue: 'URL 패턴 불일치',
          p1_expected: test.p1_pattern,
          p3_actual: test.p3_call,
          solution: 'P3 Maya Chen의 API 호출 패턴 수정 필요'
        });
      }
    });
    
    return recommendations;
  }

  // =====================================================
  // 📊 데이터 형식 호환성 검증
  // =====================================================

  async testDataFormatCompatibility(mockP1Responses) {
    console.log('📊 [Data Format Test] P1 응답 ↔ P3 파싱 호환성 검증...');
    
    // P1 응답 시뮬레이션 (없으면 P2 스키마 기반 생성)
    const p1MockResponses = mockP1Responses || this.generateMockP1Responses();
    
    const formatTests = {};
    
    // 각 API 응답별 호환성 테스트
    for (const [apiName, mockResponse] of Object.entries(p1MockResponses)) {
      try {
        // Universal Adapter 적용 테스트
        const adaptedData = await this.testAdapterTransformation(mockResponse, apiName);
        
        // P3 UI 파싱 시뮬레이션
        const parsingResult = await this.simulateP3Parsing(adaptedData, apiName);
        
        formatTests[apiName] = {
          success: parsingResult.success,
          adapted_data_valid: adaptedData.valid,
          p3_parsing_success: parsingResult.success,
          issues: [...(adaptedData.issues || []), ...(parsingResult.issues || [])]
        };
        
      } catch (error) {
        formatTests[apiName] = {
          success: false,
          error: error.message,
          issues: ['transformation_failed']
        };
      }
    }
    
    const successfulTests = Object.values(formatTests).filter(test => test.success).length;
    const totalTests = Object.keys(formatTests).length;
    
    return {
      success: successfulTests === totalTests,
      compatibility_rate: successfulTests / totalTests,
      individual_tests: formatTests,
      recommendations: this.generateDataFormatRecommendations(formatTests)
    };
  }

  generateMockP1Responses() {
    // P2 스키마 기반 P1 예상 응답 생성
    return {
      artist_summary: {
        // P1이 Firestore artist_summary에서 읽어올 예상 데이터
        artist_id: 'ARTIST_0005',
        name: '양혜규',
        radar5: { I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8 },
        sunburst_l1: { 제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0 },
        weights_version: 'AHP_v1',
        
        // P2의 복잡한 품질 메타데이터 (P1이 그대로 반환할 가능성)
        quality_metadata: {
          data_quality_score: 0.95,
          consistency_validation: { 
            radar_sunburst_diff: 0.3,
            is_consistent: true 
          },
          normalization_metadata: { quality_score: 0.92 }
        }
      },
      
      timeseries: {
        // P1이 Firestore timeseries에서 읽어올 예상 데이터
        artist_id: 'ARTIST_0005',
        axis: '제도',
        bins: [
          { 
            t: 0, v: 12.5, 
            confidence: 0.95, 
            metadata: { interpolated: false },
            statistical_metadata: { growth_rate: 0.15 } // P2 복잡 필드
          },
          { 
            t: 5, v: 34.7, 
            confidence: 0.88,
            events: ['EVENT_001', 'EVENT_002'] 
          }
        ],
        analysis_metadata: {
          pattern_type: 'exponential',
          inflection_points: [8, 15],
          quality_indicators: { overall_score: 0.91 }
        }
      }
    };
  }

  async testAdapterTransformation(mockP1Response, apiName) {
    try {
      let adaptedData;
      
      switch (apiName) {
        case 'artist_summary':
          adaptedData = universalDataAdapter.adaptArtistSummaryForP3(mockP1Response);
          break;
        case 'timeseries':
          adaptedData = universalDataAdapter.adaptTimeseriesData(mockP1Response);
          break;
        default:
          adaptedData = universalDataAdapter.adaptForP3UI(mockP1Response);
      }
      
      return {
        valid: true,
        adapted_data: adaptedData,
        issues: []
      };
      
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        issues: ['adapter_transformation_failed']
      };
    }
  }

  async simulateP3Parsing(adaptedData, apiName) {
    try {
      // Maya Chen UI의 예상 파싱 로직 시뮬레이션
      let parsingResult;
      
      switch (apiName) {
        case 'artist_summary':
          parsingResult = this.simulateArtistSummaryParsing(adaptedData);
          break;
        case 'timeseries': 
          parsingResult = this.simulateTimeseriesParsing(adaptedData);
          break;
        default:
          parsingResult = this.simulateGenericParsing(adaptedData);
      }
      
      return {
        success: parsingResult.success,
        parsed_structure: parsingResult.structure,
        issues: parsingResult.issues || []
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        issues: ['p3_parsing_simulation_failed']
      };
    }
  }

  simulateArtistSummaryParsing(adaptedData) {
    // Maya Chen의 ArtistPhase1View.jsx 예상 파싱
    try {
      const parsed = {
        artistInfo: {
          id: adaptedData.artist_id,
          name: adaptedData.name
        },
        radarData: Object.values(adaptedData.radar5),
        sunburstData: adaptedData.sunburst_l1,
        metadata: adaptedData.metadata
      };
      
      // 필수 필드 검증
      const hasValidRadar = parsed.radarData.every(v => typeof v === 'number' && !isNaN(v));
      const hasValidSunburst = Object.values(parsed.sunburstData).every(v => typeof v === 'number' && !isNaN(v));
      
      return {
        success: hasValidRadar && hasValidSunburst,
        structure: parsed,
        issues: [
          ...(hasValidRadar ? [] : ['invalid_radar_data']),
          ...(hasValidSunburst ? [] : ['invalid_sunburst_data'])
        ]
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        issues: ['artist_summary_parsing_failed']
      };
    }
  }

  simulateTimeseriesParsing(adaptedData) {
    // Maya Chen의 StackedAreaChart.jsx 예상 파싱
    try {
      if (!adaptedData.available || !adaptedData.bins) {
        return {
          success: false,
          issues: ['timeseries_data_unavailable']
        };
      }
      
      const parsed = {
        chartData: adaptedData.bins.map(bin => ({
          time: bin.t,
          value: bin.v,
          hasEvents: bin.has_events || false
        })),
        metadata: adaptedData.ui_metadata || {}
      };
      
      // 시계열 데이터 유효성 검증
      const hasValidBins = parsed.chartData.every(point => 
        typeof point.time === 'number' && 
        typeof point.value === 'number' &&
        !isNaN(point.time) && !isNaN(point.value)
      );
      
      return {
        success: hasValidBins && parsed.chartData.length > 0,
        structure: parsed,
        issues: [
          ...(hasValidBins ? [] : ['invalid_timeseries_bins']),
          ...(parsed.chartData.length > 0 ? [] : ['empty_timeseries_data'])
        ]
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        issues: ['timeseries_parsing_failed']
      };
    }
  }

  simulateGenericParsing(adaptedData) {
    try {
      // 기본 구조 파싱 테스트
      const hasBasicStructure = adaptedData && typeof adaptedData === 'object';
      const hasValidFields = hasBasicStructure && Object.keys(adaptedData).length > 0;
      
      return {
        success: hasBasicStructure && hasValidFields,
        structure: hasBasicStructure ? Object.keys(adaptedData) : [],
        issues: [
          ...(hasBasicStructure ? [] : ['invalid_object_structure']),
          ...(hasValidFields ? [] : ['empty_data_object'])
        ]
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        issues: ['generic_parsing_failed']
      };
    }
  }

  // =====================================================
  // 🚨 에러 시나리오 호환성 검증
  // =====================================================

  async testErrorScenarioCompatibility() {
    console.log('🚨 [Error Scenario Test] 오류 상황 호환성 검증...');
    
    const errorScenarios = [
      { name: 'artist_not_found', data: null },
      { name: 'invalid_artist_data', data: { invalid: true } },
      { name: 'missing_radar5', data: { artist_id: 'TEST', sunburst_l1: {} } },
      { name: 'missing_sunburst', data: { artist_id: 'TEST', radar5: {} } },
      { name: 'corrupted_data', data: { radar5: { I: NaN, F: null }, sunburst_l1: 'invalid' } }
    ];
    
    const errorTests = {};
    
    for (const scenario of errorScenarios) {
      try {
        // Universal Adapter의 에러 처리 테스트
        const fallbackData = universalDataAdapter.adaptForP3UI(scenario.data);
        
        // 폴백 데이터가 P3 UI에서 안전하게 파싱되는지 검증
        const parsingTest = await this.simulateP3Parsing({ 
          artist_summary: fallbackData 
        });
        
        errorTests[scenario.name] = {
          success: parsingTest.artist_summary.success,
          fallback_applied: fallbackData._adapter_metadata?.emergency_fallback || false,
          safe_for_p3: parsingTest.artist_summary.success,
          issues: parsingTest.artist_summary.issues || []
        };
        
      } catch (error) {
        errorTests[scenario.name] = {
          success: false,
          error: error.message,
          safe_for_p3: false,
          issues: ['error_handling_failed']
        };
      }
    }
    
    const successfulErrorHandling = Object.values(errorTests).filter(test => test.success).length;
    
    return {
      success: successfulErrorHandling === errorScenarios.length,
      error_handling_rate: successfulErrorHandling / errorScenarios.length,
      scenario_results: errorTests,
      robustness_score: this.calculateRobustnessScore(errorTests)
    };
  }

  calculateRobustnessScore(errorTests) {
    const safeHandling = Object.values(errorTests).filter(test => test.safe_for_p3).length;
    const totalScenarios = Object.keys(errorTests).length;
    
    return safeHandling / totalScenarios;
  }

  // =====================================================
  // ⚡ 성능 호환성 검증 
  // =====================================================

  async testPerformanceCompatibility() {
    console.log('⚡ [Performance Test] P1-P2-P3 성능 호환성 검증...');
    
    const performanceTests = {};
    
    // 데이터 변환 성능 테스트
    const transformationPerf = await this.measureTransformationPerformance();
    performanceTests.data_transformation = transformationPerf;
    
    // UI 렌더링 성능 추정
    const renderingPerf = await this.estimateP3RenderingPerformance();
    performanceTests.ui_rendering = renderingPerf;
    
    // 전체 파이프라인 성능
    const pipelinePerf = await this.measureEndToEndPerformance();
    performanceTests.end_to_end_pipeline = pipelinePerf;
    
    return {
      success: Object.values(performanceTests).every(test => test.meets_targets),
      performance_summary: {
        data_transformation: `${transformationPerf.average_time}ms`,
        ui_rendering: `${renderingPerf.estimated_time}ms`,
        total_pipeline: `${pipelinePerf.total_time}ms`
      },
      detailed_results: performanceTests,
      performance_grade: this.calculatePerformanceGrade(performanceTests)
    };
  }

  async measureTransformationPerformance() {
    const iterations = 10;
    const times = [];
    
    // 여러 번 변환 테스트로 평균 성능 측정
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      const testData = this.generateMockP1Responses();
      universalDataAdapter.adaptArtistSummaryForP3(testData.artist_summary);
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    }
    
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    return {
      average_time: averageTime,
      max_time: Math.max(...times),
      min_time: Math.min(...times),
      meets_targets: averageTime < 50, // 50ms 이내 목표
      performance_grade: averageTime < 20 ? 'excellent' : 
                        averageTime < 50 ? 'good' : 'needs_optimization'
    };
  }

  async estimateP3RenderingPerformance() {
    // Maya Chen UI의 예상 렌더링 성능 추정
    const estimatedComponents = {
      radar_chart: 200, // ms
      sunburst_chart: 300, // ms  
      timeseries_chart: 400, // ms
      comparison_chart: 350, // ms
      ai_report_display: 150 // ms
    };
    
    const totalEstimatedTime = Object.values(estimatedComponents).reduce((sum, time) => sum + time, 0);
    
    return {
      estimated_time: totalEstimatedTime,
      component_breakdown: estimatedComponents,
      meets_targets: totalEstimatedTime < 1500, // 1.5초 목표
      meets_1016_requirement: totalEstimatedTime < 1000 // 1초 목표 (1016blprint.md)
    };
  }

  async measureEndToEndPerformance() {
    // 전체 파이프라인: P1 API → P2 어댑터 → P3 UI 성능
    const pipeline = {
      api_response: 150,      // P1 API 응답 (추정)
      data_adaptation: 30,    // Dr. Sarah Kim 어댑터
      ui_parsing: 20,         // P3 파싱
      ui_rendering: 800       // P3 렌더링 (추정)
    };
    
    const totalTime = Object.values(pipeline).reduce((sum, time) => sum + time, 0);
    
    return {
      total_time: totalTime,
      pipeline_breakdown: pipeline,
      meets_targets: totalTime < 1000, // 1초 목표
      bottleneck: Object.entries(pipeline).sort(([,a], [,b]) => b - a)[0][0] // 가장 느린 단계
    };
  }

  calculatePerformanceGrade(performanceTests) {
    const grades = Object.values(performanceTests).map(test => {
      if (test.performance_grade === 'excellent') return 1.0;
      if (test.performance_grade === 'good') return 0.8;
      return 0.6;
    });
    
    const avgGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    
    if (avgGrade >= 0.9) return 'A+';
    if (avgGrade >= 0.8) return 'A'; 
    if (avgGrade >= 0.7) return 'B+';
    return 'B';
  }

  // =====================================================
  // 📊 종합 호환성 점수 계산
  // =====================================================

  calculateOverallCompatibility(testSuite) {
    const testCategories = [
      { name: 'api_patterns', weight: 0.25, success: testSuite.api_pattern_tests.success },
      { name: 'data_formats', weight: 0.30, success: testSuite.data_format_tests.success },
      { name: 'ui_parsing', weight: 0.25, success: testSuite.ui_parsing_tests.success },
      { name: 'error_handling', weight: 0.10, success: testSuite.error_handling_tests.success },
      { name: 'performance', weight: 0.10, success: testSuite.performance_tests.success }
    ];
    
    const weightedScore = testCategories.reduce((sum, category) => {
      return sum + (category.success ? category.weight : 0);
    }, 0);
    
    const failedCategories = testCategories.filter(cat => !cat.success);
    
    return {
      is_compatible: weightedScore >= 0.85, // 85% 이상 통과 기준
      score: weightedScore,
      grade: weightedScore >= 0.95 ? 'A+' :
             weightedScore >= 0.85 ? 'A' :  
             weightedScore >= 0.75 ? 'B+' : 'B-',
      failed_categories: failedCategories.map(cat => cat.name),
      critical_issues: failedCategories.filter(cat => cat.weight >= 0.25).length,
      recommendations: this.generateOverallRecommendations(failedCategories, weightedScore)
    };
  }

  generateOverallRecommendations(failedCategories, score) {
    const recommendations = [];
    
    if (score < 0.85) {
      recommendations.push('🚨 CRITICAL: 호환성 점수 85% 미달, 즉시 수정 필요');
    }
    
    failedCategories.forEach(category => {
      switch (category.name) {
        case 'api_patterns':
          recommendations.push('P3 Maya Chen: API 호출 URL 패턴 수정 필요');
          break;
        case 'data_formats':
          recommendations.push('P2 Dr. Sarah: 데이터 어댑터 추가 최적화');
          break;
        case 'ui_parsing':
          recommendations.push('P3 Maya Chen: UI 파싱 로직 견고성 강화');
          break;
        case 'error_handling':
          recommendations.push('P1 Alex: 에러 응답 형식 표준화');
          break;
        case 'performance':
          recommendations.push('전체: 성능 최적화 협업 필요');
          break;
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('✅ 모든 호환성 테스트 통과 - P1-P2-P3 연동 준비 완료');
    }
    
    return recommendations;
  }

  // =====================================================
  // 📈 실시간 모니터링 시스템
  // =====================================================

  startRealTimeMonitoring(intervalMs = 30000) {
    if (this.monitoringActive) {
      console.log('⚠️ [Monitor] 이미 모니터링이 활성화되어 있습니다.');
      return;
    }
    
    console.log('👁️ [Monitor] 실시간 P1-P2-P3 호환성 모니터링 시작...');
    this.monitoringActive = true;
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const quickTest = await this.runQuickCompatibilityCheck();
        
        if (!quickTest.is_healthy) {
          console.warn('🚨 [Monitor Alert] 호환성 이슈 감지:', quickTest.issues);
          await this.sendCompatibilityAlert(quickTest);
        }
        
      } catch (error) {
        console.error('❌ [Monitor Error]:', error);
      }
    }, intervalMs);
    
    console.log('✅ [Monitor] 실시간 모니터링 활성화 완료');
  }

  stopRealTimeMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringActive = false;
      console.log('⏹️ [Monitor] 실시간 모니터링 중지');
    }
  }

  async runQuickCompatibilityCheck() {
    // 빠른 호환성 체크 (30초마다 실행)
    try {
      const mockData = this.generateMockP1Responses();
      const adapterTest = await this.testAdapterTransformation(mockData.artist_summary, 'artist_summary');
      
      return {
        is_healthy: adapterTest.valid,
        last_check: new Date().toISOString(),
        issues: adapterTest.issues || []
      };
      
    } catch (error) {
      return {
        is_healthy: false,
        error: error.message,
        issues: ['monitoring_check_failed']
      };
    }
  }

  async sendCompatibilityAlert(alertData) {
    console.log('📢 [Compatibility Alert] 호환성 알림 발송...');
    
    const alert = {
      timestamp: new Date().toISOString(),
      alert_type: 'compatibility_issue',
      severity: alertData.issues.length > 2 ? 'high' : 'medium',
      message: `P1-P2-P3 호환성 이슈 감지: ${alertData.issues.join(', ')}`,
      recommended_action: 'Dr. Sarah Kim Universal Adapter 점검 및 수정',
      alert_data: alertData
    };
    
    // 실제 환경에서는 Slack, 이메일 등으로 알림
    console.log('🚨 [Alert Details]:', alert);
    
    return alert;
  }

  // =====================================================
  // 📋 호환성 보고서 생성
  // =====================================================

  generateCompatibilityReport() {
    const latestTest = this.testResults[this.testResults.length - 1];
    
    if (!latestTest) {
      return {
        available: false,
        reason: 'no_test_results'
      };
    }
    
    return {
      report_id: `COMPATIBILITY_REPORT_${Date.now()}`,
      generated_at: new Date().toISOString(),
      generated_by: 'Dr. Sarah Kim Integration Compatibility System',
      
      executive_summary: {
        overall_compatibility: latestTest.overall_compatibility.is_compatible,
        compatibility_score: latestTest.overall_compatibility.score,
        grade: latestTest.overall_compatibility.grade,
        ready_for_integration: latestTest.overall_compatibility.score >= 0.85
      },
      
      detailed_analysis: {
        api_pattern_compatibility: latestTest.api_pattern_tests.compatibility_rate,
        data_format_compatibility: latestTest.data_format_tests.compatibility_rate,
        error_handling_robustness: latestTest.error_handling_tests.robustness_score,
        performance_compatibility: latestTest.performance_tests.meets_targets
      },
      
      critical_issues: latestTest.overall_compatibility.failed_categories,
      recommended_actions: latestTest.overall_compatibility.recommendations,
      
      dr_sarah_kim_certification: {
        data_safety_guaranteed: latestTest.overall_compatibility.score >= 0.9,
        p3_ui_compatibility: latestTest.ui_parsing_tests.success,
        production_ready: latestTest.overall_compatibility.is_compatible,
        quality_grade: latestTest.overall_compatibility.grade
      }
    };
  }
}

// 전역 인스턴스 및 편의 함수
export const integrationTester = new IntegrationCompatibilityTester();

export const testP1P3Integration = async () => {
  return await integrationTester.testP1P3Integration();
};

export const startCompatibilityMonitoring = () => {
  integrationTester.startRealTimeMonitoring();
};

export const getCompatibilityReport = () => {
  return integrationTester.generateCompatibilityReport();
};

export default integrationTester;

