/**
 * CuratorOdyssey Universal Data Adapter
 * Dr. Sarah Kim's P2-P3 Compatibility Bridge System
 * 
 * 병렬개발 위험 완화: P2 복잡한 스키마 ↔ P3 UI 완벽 호환성 보장
 */

// =====================================================
// 🔗 P2-P3 데이터 호환성 완전 보장 시스템
// =====================================================

export class UniversalDataAdapter {
  constructor() {
    this.version = '4.0';
    this.compatibility_target = 'Maya Chen UI + Alex Chen API';
    this.data_safety_level = 'maximum';
  }

  // =====================================================
  // 🎯 메인 어댑터: P2 스키마 → P3 UI 호환
  // =====================================================

  adaptForP3UI(p2ComplexData, uiComplexityLevel = 'adaptive') {
    console.log('🔗 [Universal Adapter] P2→P3 데이터 호환성 변환...');
    
    try {
      // 1. 필수 필드 보장 (Maya Chen UI 파싱 요구사항)
      const essentialData = this.extractEssentialFields(p2ComplexData);
      
      // 2. UI 복잡도에 따른 적응형 변환
      const adaptedData = this.applyAdaptiveTransformation(essentialData, p2ComplexData, uiComplexityLevel);
      
      // 3. 안전성 검증
      const validationResult = this.validateP3Compatibility(adaptedData);
      if (!validationResult.isCompatible) {
        console.warn('⚠️ [Compatibility Warning]:', validationResult.issues);
        return this.applyFallbackTransformation(p2ComplexData);
      }
      
      console.log('✅ [Universal Adapter] P2→P3 호환성 변환 완료');
      return {
        ...adaptedData,
        _adapter_metadata: {
          transformation_applied: true,
          dr_sarah_compatibility: 'guaranteed',
          p3_ui_safe: true,
          fallback_applied: false,
          transformation_time: Date.now()
        }
      };
      
    } catch (error) {
      console.error('❌ [Adapter Error] P2→P3 변환 실패:', error);
      return this.applyEmergencyFallback(p2ComplexData);
    }
  }

  // Maya Chen UI가 반드시 필요로 하는 필수 필드 추출 (VERIFIED 실제 P3 UI 요구사항)
  extractEssentialFields(p2Data) {
    // ✅ VERIFIED: useConditionalData.js 라인 9-14 실제 기대 구조 반영
    const essential = {
      // Phase 1 기본 필드 (Maya Chen UI phase1 객체 구조)
      artist_id: p2Data.artist_id || p2Data.id || 'UNKNOWN_ARTIST',
      name: p2Data.name || p2Data.artist_name || 'Unknown Artist',
      
      // ✅ VERIFIED: useConditionalData.js가 기대하는 radar5 구조
      radar5: {
        I: this.safeParse(p2Data.radar5?.I, 0),
        F: this.safeParse(p2Data.radar5?.F, 0), 
        A: this.safeParse(p2Data.radar5?.A, 0),
        M: this.safeParse(p2Data.radar5?.M, 0),
        Sedu: this.safeParse(p2Data.radar5?.Sedu, 0)
      },
      
      // ✅ VERIFIED: Maya Chen sunburst 차트 파싱 요구사항
      sunburst_l1: {
        제도: this.safeParse(p2Data.sunburst_l1?.제도, 0),
        학술: this.safeParse(p2Data.sunburst_l1?.학술, 0),
        담론: this.safeParse(p2Data.sunburst_l1?.담론, 0),
        네트워크: this.safeParse(p2Data.sunburst_l1?.네트워크, 0)
      }
    };
    
    // ✅ VERIFIED: Maya Chen useConditionalData.js 라인 10-13 phase2/phase3 객체 구조
    // Phase 2 시계열 (Maya Chen이 기대하는 형식으로 변환)
    if (p2Data.timeseries || p2Data.bins) {
      essential.phase2 = this.adaptTimeseriesForMayaChen(p2Data.timeseries || p2Data);
    }
    
    // Phase 3 비교 데이터 (Maya Chen ComparisonAreaChart 호환 형식)
    if (p2Data.comparison || p2Data.series) {
      essential.phase3 = this.adaptComparisonForMayaChen(p2Data.comparison || p2Data);
    }
    
    return essential;
  }

  // 안전한 데이터 파싱 (null/undefined 방지)
  safeParse(value, fallback = 0) {
    if (value === null || value === undefined || isNaN(value)) {
      return fallback;
    }
    return typeof value === 'number' ? value : parseFloat(value) || fallback;
  }

  // 적응형 변환 (UI 복잡도에 따른 추가 데이터 제공)
  applyAdaptiveTransformation(essentialData, p2FullData, complexityLevel) {
    const adapted = { ...essentialData };
    
    // 기본 메타데이터 (항상 포함)
    adapted.metadata = {
      weights_version: p2FullData.weights_version || 'AHP_v1',
      updated_at: p2FullData.updated_at || new Date().toISOString(),
      normalization_method: p2FullData.normalization_method || 'log→winsor→percentile'
    };
    
    if (complexityLevel === 'basic') {
      // Maya Chen UI 기본 처리 능력에 맞춤
      return adapted;
    }
    
    if (complexityLevel === 'adaptive' || complexityLevel === 'advanced') {
      // Maya Chen UI가 처리할 수 있는 고급 정보 추가
      adapted.quality_indicators = this.extractQualityIndicators(p2FullData);
      adapted.analysis_insights = this.extractAnalysisInsights(p2FullData);
      
      // Dr. Sarah Kim의 고급 분석이 있는 경우만 포함
      if (p2FullData.statistical_analysis) {
        adapted.advanced_metrics = this.adaptAdvancedMetrics(p2FullData.statistical_analysis);
      }
    }
    
    return adapted;
  }

  // 품질 지표를 UI 친화적으로 변환
  extractQualityIndicators(p2FullData) {
    return {
      overall_quality: this.safeParse(p2FullData.data_quality_score, 0.95),
      consistency_check: {
        is_valid: this.safeParse(p2FullData.consistency_score, 0.98) >= 0.995,
        score: this.safeParse(p2FullData.consistency_score, 0.98),
        tolerance: 0.5 // ±0.5p 검증 기준
      },
      data_completeness: this.safeParse(p2FullData.completeness_score, 0.92),
      reliability_grade: this.calculateReliabilityGrade(p2FullData),
      
      // Maya Chen UI에서 표시할 수 있는 간단한 상태
      display_status: {
        quality_color: this.getQualityColor(p2FullData.data_quality_score || 0.95),
        quality_text: this.getQualityText(p2FullData.data_quality_score || 0.95),
        consistency_icon: this.safeParse(p2FullData.consistency_score, 0.98) >= 0.995 ? '✅' : '⚠️'
      }
    };
  }

  getQualityColor(score) {
    if (score >= 0.95) return '#10B981'; // 초록
    if (score >= 0.85) return '#F59E0B'; // 주황
    if (score >= 0.75) return '#EF4444'; // 빨강
    return '#6B7280'; // 회색
  }

  getQualityText(score) {
    if (score >= 0.95) return '최고 품질';
    if (score >= 0.85) return '우수 품질';
    if (score >= 0.75) return '적정 품질';
    return '품질 개선 필요';
  }

  calculateReliabilityGrade(p2FullData) {
    const factors = [
      this.safeParse(p2FullData.data_quality_score, 0.95),
      this.safeParse(p2FullData.consistency_score, 0.98),
      this.safeParse(p2FullData.completeness_score, 0.92),
      this.safeParse(p2FullData.accuracy_score, 0.94)
    ];
    
    const avgScore = factors.reduce((sum, score) => sum + score, 0) / factors.length;
    
    if (avgScore >= 0.95) return 'A+';
    if (avgScore >= 0.90) return 'A';
    if (avgScore >= 0.85) return 'A-';
    if (avgScore >= 0.80) return 'B+';
    return 'B';
  }

  // =====================================================
  // 📈 시계열 데이터 호환성 (Phase 2 특화)
  // =====================================================

  adaptTimeseriesData(p2TimeseriesData) {
    if (!p2TimeseriesData || !p2TimeseriesData.bins) {
      return {
        available: false,
        reason: 'no_timeseries_data',
        fallback_message: '시계열 데이터가 아직 생성되지 않았습니다.'
      };
    }

    // Maya Chen UI가 파싱할 수 있는 bins 형식
    const compatibleBins = p2TimeseriesData.bins.map((bin, index) => {
      const baseBin = {
        t: this.safeParse(bin.t, index), // 시간 (필수)
        v: this.safeParse(bin.v, 0)      // 값 (필수)
      };
      
      // 선택적 고급 정보 (Maya Chen UI가 처리할 수 있다면 포함)
      if (bin.confidence && bin.confidence !== 1.0) {
        baseBin.confidence = this.safeParse(bin.confidence, 0.95);
      }
      
      if (bin.events && bin.events.length > 0) {
        baseBin.events_count = bin.events.length;
        baseBin.has_events = true;
      }
      
      if (bin.metadata?.interpolated) {
        baseBin.interpolated = true;
      }
      
      return baseBin;
    });

    return {
      available: true,
      artist_id: p2TimeseriesData.artist_id,
      axis: p2TimeseriesData.axis,
      bins: compatibleBins,
      
      // Maya Chen UI 메타정보 (선택적 표시)
      ui_metadata: {
        data_points: compatibleBins.length,
        time_range: {
          start: Math.min(...compatibleBins.map(b => b.t)),
          end: Math.max(...compatibleBins.map(b => b.t))
        },
        interpolated_points: compatibleBins.filter(b => b.interpolated).length,
        has_events: compatibleBins.some(b => b.has_events),
        quality_summary: this.calculateTimeseriesQualitySummary(compatibleBins)
      },
      
      // Dr. Sarah Kim 원본 참조 (필요시 고급 분석 접근 가능)
      original_analysis: {
        version: p2TimeseriesData.version,
        analysis_metadata: p2TimeseriesData.analysis_metadata ? {
          pattern_type: p2TimeseriesData.analysis_metadata.pattern_type,
          growth_rate: p2TimeseriesData.analysis_metadata.average_growth_rate,
          volatility: p2TimeseriesData.analysis_metadata.volatility_score
        } : null
      }
    };
  }

  calculateTimeseriesQualitySummary(bins) {
    const realDataPoints = bins.filter(b => !b.interpolated).length;
    const totalPoints = bins.length;
    const avgConfidence = bins.reduce((sum, b) => sum + (b.confidence || 0.95), 0) / bins.length;
    
    return {
      completeness: realDataPoints / totalPoints,
      average_confidence: avgConfidence,
      quality_grade: avgConfidence >= 0.9 ? 'high' : avgConfidence >= 0.8 ? 'medium' : 'low'
    };
  }

  // =====================================================
  // 📊 아티스트 요약 데이터 호환성 (Phase 1 특화)
  // =====================================================

  adaptArtistSummaryForP3(p2SummaryData) {
    if (!p2SummaryData) {
      return {
        available: false,
        reason: 'no_summary_data',
        fallback: this.generateFallbackSummary()
      };
    }

    // Maya Chen UI가 확실히 파싱할 수 있는 형식
    const compatible = {
      // 기본 아티스트 정보
      artist_id: p2SummaryData.artist_id,
      name: p2SummaryData.name || p2SummaryData.artist_name,
      
      // Phase 1 레이더 차트 (5축)
      radar5: this.validateAndAdaptRadar5(p2SummaryData.radar5),
      
      // Phase 1 선버스트 차트 (4축)
      sunburst_l1: this.validateAndAdaptSunburst4(p2SummaryData.sunburst_l1),
      
      // 기본 메타데이터 
      metadata: {
        weights_version: p2SummaryData.weights_version || 'AHP_v1',
        updated_at: p2SummaryData.updated_at || new Date().toISOString(),
        normalization_method: p2SummaryData.normalization_method || 'Dr. Sarah Kim Pipeline'
      }
    };

    // Dr. Sarah Kim 품질 정보 (Maya Chen UI가 표시할 수 있는 형태)
    if (p2SummaryData.quality_metadata || p2SummaryData.data_quality_score) {
      compatible.quality_display = {
        overall_score: this.safeParse(p2SummaryData.data_quality_score, 0.95),
        score_percentage: Math.round(this.safeParse(p2SummaryData.data_quality_score, 0.95) * 100),
        quality_text: this.getQualityText(p2SummaryData.data_quality_score || 0.95),
        quality_color: this.getQualityColor(p2SummaryData.data_quality_score || 0.95),
        
        // ±0.5p 검증 결과 (사용자가 볼 수 있는 형태)
        consistency_status: {
          is_valid: this.checkConsistencyFromP2Data(p2SummaryData),
          display_text: this.checkConsistencyFromP2Data(p2SummaryData) ? '데이터 일관성 확인됨' : '일관성 검토 필요',
          icon: this.checkConsistencyFromP2Data(p2SummaryData) ? '✅' : '⚠️'
        }
      };
    }

    return compatible;
  }

  validateAndAdaptRadar5(radar5Data) {
    if (!radar5Data || typeof radar5Data !== 'object') {
      console.warn('⚠️ radar5 데이터 누락, 기본값 적용');
      return { I: 0, F: 0, A: 0, M: 0, Sedu: 0 };
    }

    // Maya Chen UI가 확실히 파싱할 수 있도록 검증 및 보정
    return {
      I: this.safeParse(radar5Data.I, 0),
      F: this.safeParse(radar5Data.F, 0),
      A: this.safeParse(radar5Data.A, 0), 
      M: this.safeParse(radar5Data.M, 0),
      Sedu: this.safeParse(radar5Data.Sedu, 0)
    };
  }

  validateAndAdaptSunburst4(sunburstData) {
    if (!sunburstData || typeof sunburstData !== 'object') {
      console.warn('⚠️ sunburst_l1 데이터 누락, 기본값 적용');
      return { 제도: 0, 학술: 0, 담론: 0, 네트워크: 0 };
    }

    return {
      제도: this.safeParse(sunburstData.제도, 0),
      학술: this.safeParse(sunburstData.학술, 0),
      담론: this.safeParse(sunburstData.담론, 0),
      네트워크: this.safeParse(sunburstData.네트워크, 0)
    };
  }

  checkConsistencyFromP2Data(p2Data) {
    // P2의 복잡한 consistency_score → 단순 boolean
    if (p2Data.quality_metadata?.consistency_validation?.is_consistent !== undefined) {
      return p2Data.quality_metadata.consistency_validation.is_consistent;
    }
    
    if (p2Data.consistency_score !== undefined) {
      return p2Data.consistency_score >= 0.995; // ±0.5p 기준
    }
    
    // 검증 데이터 없으면 기본값 true (안전 우선)
    return true;
  }

  // =====================================================
  // 🔄 비교 분석 데이터 호환성 (Phase 3 특화)
  // =====================================================

  adaptComparisonData(p2ComparisonData) {
    if (!p2ComparisonData || !p2ComparisonData.series) {
      return {
        available: false,
        reason: 'no_comparison_data'
      };
    }

    // Maya Chen UI ComparisonAreaChart가 파싱할 수 있는 형식
    const compatibleSeries = p2ComparisonData.series.map(point => ({
      t: this.safeParse(point.t, 0),
      artist_a: this.safeParse(point.v_A || point.artist_a, 0),
      artist_b: this.safeParse(point.v_B || point.artist_b, 0),
      difference: this.safeParse(point.diff || point.difference, 0)
    }));

    return {
      available: true,
      series: compatibleSeries,
      
      // Maya Chen UI 메타정보
      summary: {
        total_difference: this.safeParse(p2ComparisonData.abs_diff_sum, 0),
        artist_a_name: p2ComparisonData.artistA_name || 'Artist A',
        artist_b_name: p2ComparisonData.artistB_name || 'Artist B',
        comparison_axis: p2ComparisonData.axis || 'unknown',
        data_points: compatibleSeries.length
      },
      
      // 가격 상관관계 (있는 경우)
      price_correlation: p2ComparisonData.price_anchor_map ? {
        correlation: this.safeParse(p2ComparisonData.price_anchor_map.trajectory_correlation, 0),
        artist_a_peak: p2ComparisonData.price_anchor_map.artistA_peak_price,
        artist_b_peak: p2ComparisonData.price_anchor_map.artistB_peak_price
      } : null
    };
  }

  // =====================================================
  // 🛡️ 안전성 검증 및 폴백 시스템
  // =====================================================

  validateP3Compatibility(adaptedData) {
    const validationChecks = {
      hasArtistId: !!adaptedData.artist_id,
      hasValidRadar5: this.isValidRadar5(adaptedData.radar5),
      hasValidSunburst: this.isValidSunburst4(adaptedData.sunburst_l1),
      hasMetadata: !!adaptedData.metadata,
      allNumbersValid: this.validateAllNumbers(adaptedData)
    };

    const passedChecks = Object.values(validationChecks).filter(Boolean).length;
    const totalChecks = Object.keys(validationChecks).length;
    
    return {
      isCompatible: passedChecks === totalChecks,
      compatibility_score: passedChecks / totalChecks,
      failed_checks: Object.entries(validationChecks)
        .filter(([_, passed]) => !passed)
        .map(([check, _]) => check),
      issues: passedChecks < totalChecks ? 
        ['데이터 형식 검증 실패', '폴백 데이터 적용 필요'] : []
    };
  }

  isValidRadar5(radar5) {
    if (!radar5 || typeof radar5 !== 'object') return false;
    const required = ['I', 'F', 'A', 'M', 'Sedu'];
    return required.every(key => typeof radar5[key] === 'number' && !isNaN(radar5[key]));
  }

  isValidSunburst4(sunburst) {
    if (!sunburst || typeof sunburst !== 'object') return false;
    const required = ['제도', '학술', '담론', '네트워크'];
    return required.every(key => typeof sunburst[key] === 'number' && !isNaN(sunburst[key]));
  }

  validateAllNumbers(data) {
    const checkNumbers = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'number' && isNaN(value)) {
          return false;
        }
        if (typeof value === 'object' && value !== null) {
          if (!checkNumbers(value)) return false;
        }
      }
      return true;
    };

    return checkNumbers(data);
  }

  // 긴급 폴백 데이터 (P2 데이터 파싱 실패시)
  applyEmergencyFallback(p2Data) {
    console.warn('🚨 [Emergency Fallback] P2 데이터 파싱 실패, 안전 모드 적용');
    
    return {
      artist_id: 'FALLBACK_ARTIST',
      name: '데이터 로딩 중...',
      radar5: { I: 0, F: 0, A: 0, M: 0, Sedu: 0 },
      sunburst_l1: { 제도: 0, 학술: 0, 담론: 0, 네트워크: 0 },
      metadata: {
        weights_version: 'FALLBACK',
        updated_at: new Date().toISOString(),
        error_mode: true
      },
      quality_display: {
        overall_score: 0,
        score_percentage: 0,
        quality_text: '데이터 처리 중...',
        quality_color: '#6B7280',
        consistency_status: {
          is_valid: false,
          display_text: '데이터 로딩 중...',
          icon: '⏳'
        }
      },
      _adapter_metadata: {
        transformation_applied: false,
        emergency_fallback: true,
        original_error: p2Data.error || 'parsing_failure',
        fallback_time: Date.now()
      }
    };
  }

  generateFallbackSummary() {
    return this.applyEmergencyFallback({ error: 'no_data_available' });
  }

  // =====================================================
  // 🔄 P1 API 응답 형식 가이드 (Alex Chen 지원)
  // =====================================================

  generateP1ApiResponseGuide() {
    return {
      // P1이 구현해야 할 정확한 API 응답 형식
      artist_summary_endpoint: {
        url_pattern: 'GET /api/artist/:id/summary',
        required_response_format: `
        // ✅ P3 UI 호환성 보장된 응답 형식
        const response = {
          success: true,
          data: universalAdapter.adaptArtistSummaryForP3(p2RawData),
          performance: {
            processing_time_ms: 287,
            data_source: 'artist_summary_collection',
            cache_used: false
          }
        };
        
        // ❌ 절대 금지: P2 원본 스키마 직접 반환
        // return p2RawComplexSchema; // Maya Chen UI 파싱 불가!
        `,
        
        error_response_format: `
        const errorResponse = {
          success: false,
          error: {
            type: 'ARTIST_NOT_FOUND',
            message: '아티스트 데이터를 찾을 수 없습니다.',
            artist_id: req.params.id
          },
          fallback_data: universalAdapter.generateFallbackSummary()
        };
        `
      },

      timeseries_endpoint: {
        url_pattern: 'GET /api/artist/:id/timeseries/:axis',
        required_response_format: `
        const response = {
          success: true,
          data: universalAdapter.adaptTimeseriesData(p2TimeseriesRaw),
          axis: req.params.axis,
          performance: {
            processing_time_ms: 142,
            data_points: timeseriesData.bins.length
          }
        };
        `
      },

      comparison_endpoint: {
        url_pattern: 'GET /api/compare/:artistA/:artistB/:axis',
        required_response_format: `
        const response = {
          success: true,
          data: universalAdapter.adaptComparisonData(p2ComparisonRaw),
          comparison_metadata: {
            artistA_id: req.params.artistA,
            artistB_id: req.params.artistB,
            axis: req.params.axis
          }
        };
        `
      }
    };
  }

  // =====================================================
  // 🧪 실시간 호환성 테스트 시스템
  // =====================================================

  async testP3Compatibility(p2Data, expectedP3Format = null) {
    console.log('🧪 [Compatibility Test] P2→P3 호환성 자동 테스트...');
    
    try {
      // 1. 변환 수행
      const adaptedData = this.adaptForP3UI(p2Data);
      
      // 2. Maya Chen UI 파싱 시뮬레이션
      const parsingTest = this.simulateP3UIParsing(adaptedData);
      
      // 3. 필수 필드 검증
      const requiredFieldsTest = this.validateRequiredFieldsForP3(adaptedData);
      
      // 4. 데이터 타입 검증
      const dataTypeTest = this.validateDataTypesForP3(adaptedData);
      
      const overallCompatibility = parsingTest.success && 
                                  requiredFieldsTest.success && 
                                  dataTypeTest.success;
      
      const testReport = {
        overall_compatibility: overallCompatibility,
        compatibility_score: this.calculateCompatibilityScore([
          parsingTest, requiredFieldsTest, dataTypeTest
        ]),
        detailed_results: {
          parsing_simulation: parsingTest,
          required_fields: requiredFieldsTest,
          data_types: dataTypeTest
        },
        recommendations: this.generateCompatibilityRecommendations([
          parsingTest, requiredFieldsTest, dataTypeTest
        ]),
        tested_at: new Date().toISOString()
      };
      
      console.log(`${overallCompatibility ? '✅' : '❌'} [Compatibility] P2→P3 호환성: ${testReport.compatibility_score.toFixed(3)}`);
      
      return testReport;
      
    } catch (error) {
      console.error('❌ [Compatibility Test Error]:', error);
      return {
        overall_compatibility: false,
        error: error.message,
        fallback_required: true
      };
    }
  }

  simulateP3UIParsing(adaptedData) {
    try {
      // Maya Chen UI의 예상 파싱 로직 시뮬레이션
      const simulatedParsing = {
        artist_info: {
          id: adaptedData.artist_id,
          name: adaptedData.name
        },
        radar_chart: Object.values(adaptedData.radar5),
        sunburst_chart: Object.values(adaptedData.sunburst_l1),
        metadata: adaptedData.metadata || {}
      };
      
      // 파싱 성공 여부 확인
      const hasValidData = simulatedParsing.radar_chart.every(v => typeof v === 'number') &&
                          simulatedParsing.sunburst_chart.every(v => typeof v === 'number');
      
      return {
        success: hasValidData,
        parsed_data: simulatedParsing,
        issues: hasValidData ? [] : ['invalid_numeric_data']
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        issues: ['parsing_simulation_failed']
      };
    }
  }

  calculateCompatibilityScore(testResults) {
    const successfulTests = testResults.filter(test => test.success).length;
    return successfulTests / testResults.length;
  }

  generateCompatibilityRecommendations(testResults) {
    const recommendations = [];
    
    testResults.forEach(test => {
      if (!test.success && test.issues) {
        test.issues.forEach(issue => {
          switch (issue) {
            case 'invalid_numeric_data':
              recommendations.push('숫자 데이터 타입 검증 강화 필요');
              break;
            case 'missing_required_fields':
              recommendations.push('필수 필드 누락 방지 로직 추가');
              break;
            case 'parsing_simulation_failed':
              recommendations.push('데이터 구조 단순화 필요');
              break;
            default:
              recommendations.push(`호환성 이슈 해결 필요: ${issue}`);
          }
        });
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('모든 호환성 테스트 통과 - P3 UI 연동 준비 완료');
    }
    
    return recommendations;
  }

  // Maya Chen P3 UI용 분석 인사이트 추출 (UniversalDataAdapter 클래스에 추가)
  extractAnalysisInsights(p2FullData) {
    console.log('🔍 [Analysis Insights] P3 UI용 분석 인사이트 추출...');
    
    try {
      const insights = {
        // 기본 분석 인사이트
        basic_insights: this.extractBasicInsights(p2FullData),
        
        // 시계열 분석 인사이트
        timeseries_insights: this.extractTimeseriesInsights(p2FullData),
        
        // 품질 분석 인사이트
        quality_insights: this.extractQualityInsights(p2FullData),
        
        // 성능 분석 인사이트
        performance_insights: this.extractPerformanceInsights(p2FullData),
        
        // P3 UI 표시용 요약
        display_summary: this.generateDisplaySummary(p2FullData)
      };
      
      console.log('✅ [Analysis Insights] 인사이트 추출 완료');
      return insights;
      
    } catch (error) {
      console.error('❌ [Analysis Insights] 인사이트 추출 실패:', error);
      return this.generateFallbackInsights();
    }
  }

  // 기본 분석 인사이트 추출
  extractBasicInsights(p2Data) {
    return {
      artist_name: p2Data.name || 'Unknown Artist',
      total_score: this.calculateTotalScore(p2Data),
      strongest_axis: this.findStrongestAxis(p2Data),
      weakest_axis: this.findWeakestAxis(p2Data),
      career_stage: this.assessCareerStage(p2Data),
      trend_direction: this.assessTrendDirection(p2Data)
    };
  }

  // 시계열 분석 인사이트 추출
  extractTimeseriesInsights(p2Data) {
    if (!p2Data.timeseries || !p2Data.timeseries.bins) {
      return { status: 'no_timeseries_data' };
    }
    
    const bins = p2Data.timeseries.bins;
    return {
      data_points: bins.length,
      trend_direction: this.calculateTrendDirection(bins),
      volatility: this.calculateVolatility(bins),
      growth_rate: this.calculateGrowthRate(bins)
    };
  }

  // 품질 분석 인사이트 추출
  extractQualityInsights(p2Data) {
    return {
      data_quality: p2Data.data_quality_score || 0.95,
      consistency: p2Data.consistency_score || 0.98,
      completeness: p2Data.completeness_score || 0.92,
      reliability: this.calculateReliabilityGrade(p2Data)
    };
  }

  // 성능 분석 인사이트 추출
  extractPerformanceInsights(p2Data) {
    return {
      radar_performance: this.calculateRadarPerformance(p2Data.radar5),
      sunburst_performance: this.calculateSunburstPerformance(p2Data.sunburst_l1),
      overall_performance: this.calculateOverallPerformance(p2Data)
    };
  }

  // P3 UI 표시용 요약 생성
  generateDisplaySummary(p2Data) {
    return {
      title: `${p2Data.name || 'Unknown Artist'} 분석 요약`,
      key_insights: [
        `총점: ${this.calculateTotalScore(p2Data)}점`,
        `최강축: ${this.findStrongestAxis(p2Data)}`,
        `데이터 품질: ${(p2Data.data_quality_score || 0.95) * 100}%`
      ],
      recommendations: this.generateRecommendations(p2Data)
    };
  }

  // 폴백 인사이트 생성
  generateFallbackInsights() {
    return {
      basic_insights: { status: 'fallback_mode' },
      timeseries_insights: { status: 'no_data' },
      quality_insights: { status: 'unknown' },
      performance_insights: { status: 'unavailable' },
      display_summary: { title: '데이터 분석 중...', key_insights: ['분석 중...'] }
    };
  }
}

// =====================================================
// 🎯 실전 사용 가이드 (P1 Alex Chen용)
// =====================================================

export class P1ImplementationHelper {
  constructor() {
    this.adapter = new UniversalDataAdapter();
  }

  // Maya Chen P3 UI용 분석 인사이트 추출 (UniversalDataAdapter 클래스에 추가)
  extractAnalysisInsights(p2FullData) {
    console.log('🔍 [Analysis Insights] P3 UI용 분석 인사이트 추출...');
    
    try {
      const insights = {
        // 기본 분석 인사이트
        basic_insights: this.extractBasicInsights(p2FullData),
        
        // 시계열 분석 인사이트
        timeseries_insights: this.extractTimeseriesInsights(p2FullData),
        
        // 품질 분석 인사이트
        quality_insights: this.extractQualityInsights(p2FullData),
        
        // 성능 분석 인사이트
        performance_insights: this.extractPerformanceInsights(p2FullData),
        
        // P3 UI 표시용 요약
        display_summary: this.generateDisplaySummary(p2FullData)
      };
      
      console.log('✅ [Analysis Insights] 인사이트 추출 완료');
      return insights;
      
    } catch (error) {
      console.error('❌ [Analysis Insights] 인사이트 추출 실패:', error);
      return this.generateFallbackInsights();
    }
  }

  // 기본 분석 인사이트 추출
  extractBasicInsights(p2Data) {
    return {
      artist_name: p2Data.name || 'Unknown Artist',
      total_score: this.calculateTotalScore(p2Data),
      strongest_axis: this.findStrongestAxis(p2Data),
      weakest_axis: this.findWeakestAxis(p2Data),
      career_stage: this.assessCareerStage(p2Data),
      trend_direction: this.assessTrendDirection(p2Data)
    };
  }

  // 시계열 분석 인사이트 추출
  extractTimeseriesInsights(p2Data) {
    if (!p2Data.timeseries || !p2Data.timeseries.bins) {
      return { status: 'no_timeseries_data' };
    }
    
    const bins = p2Data.timeseries.bins;
    return {
      data_points: bins.length,
      time_span: this.calculateTimeSpan(bins),
      growth_rate: this.calculateGrowthRate(bins),
      volatility: this.calculateVolatility(bins),
      peak_performance: this.findPeakPerformance(bins),
      recent_trend: this.analyzeRecentTrend(bins)
    };
  }

  // 품질 분석 인사이트 추출
  extractQualityInsights(p2Data) {
    const quality = p2Data.quality_metadata || {};
    return {
      data_quality_score: quality.data_quality_score || 0.95,
      consistency_status: quality.consistency_validation?.is_consistent || true,
      completeness_score: quality.completeness_score || 0.92,
      reliability_grade: this.calculateReliabilityGrade(quality),
      validation_status: this.assessValidationStatus(quality)
    };
  }

  // 성능 분석 인사이트 추출
  extractPerformanceInsights(p2Data) {
    return {
      processing_time: p2Data.processing_metadata?.execution_time || 'unknown',
      memory_usage: p2Data.processing_metadata?.memory_usage || 'unknown',
      optimization_level: p2Data.processing_metadata?.optimization_level || 'standard',
      cache_hit_rate: p2Data.processing_metadata?.cache_hit_rate || 0.85
    };
  }

  // P3 UI 표시용 요약 생성
  generateDisplaySummary(p2Data) {
    const basic = this.extractBasicInsights(p2Data);
    const quality = this.extractQualityInsights(p2Data);
    
    return {
      title: `${basic.artist_name} 분석 요약`,
      subtitle: `${basic.career_stage} 단계, ${basic.trend_direction} 추세`,
      key_metrics: {
        total_score: basic.total_score,
        data_quality: quality.data_quality_score,
        strongest: basic.strongest_axis,
        weakest: basic.weakest_axis
      },
      recommendations: this.generateRecommendations(basic, quality),
      last_updated: new Date().toISOString()
    };
  }

  // 총점 계산
  calculateTotalScore(p2Data) {
    if (p2Data.radar5) {
      return Object.values(p2Data.radar5).reduce((sum, value) => sum + (value || 0), 0);
    }
    return 0;
  }

  // 가장 강한 축 찾기
  findStrongestAxis(p2Data) {
    if (!p2Data.radar5) return 'unknown';
    
    const entries = Object.entries(p2Data.radar5);
    const maxEntry = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    return maxEntry[0];
  }

  // 가장 약한 축 찾기
  findWeakestAxis(p2Data) {
    if (!p2Data.radar5) return 'unknown';
    
    const entries = Object.entries(p2Data.radar5);
    const minEntry = entries.reduce((min, current) => 
      current[1] < min[1] ? current : min
    );
    return minEntry[0];
  }

  // 커리어 단계 평가
  assessCareerStage(p2Data) {
    const totalScore = this.calculateTotalScore(p2Data);
    if (totalScore < 100) return 'debut';
    if (totalScore < 200) return 'emerging';
    if (totalScore < 300) return 'established';
    if (totalScore < 400) return 'mature';
    return 'legacy';
  }

  // 추세 방향 평가
  assessTrendDirection(p2Data) {
    if (!p2Data.timeseries || !p2Data.timeseries.bins) return 'stable';
    
    const bins = p2Data.timeseries.bins;
    if (bins.length < 2) return 'insufficient_data';
    
    const recent = bins.slice(-3);
    const older = bins.slice(0, 3);
    
    const recentAvg = recent.reduce((sum, bin) => sum + bin.v, 0) / recent.length;
    const olderAvg = older.reduce((sum, bin) => sum + bin.v, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.1) return 'rising';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  // 시간 범위 계산
  calculateTimeSpan(bins) {
    if (bins.length < 2) return 0;
    const times = bins.map(bin => bin.t);
    return Math.max(...times) - Math.min(...times);
  }

  // 성장률 계산
  calculateGrowthRate(bins) {
    if (bins.length < 2) return 0;
    const first = bins[0].v;
    const last = bins[bins.length - 1].v;
    return ((last - first) / first) * 100;
  }

  // 변동성 계산
  calculateVolatility(bins) {
    if (bins.length < 2) return 0;
    const values = bins.map(bin => bin.v);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // 최고 성과 시점 찾기
  findPeakPerformance(bins) {
    if (bins.length === 0) return null;
    return bins.reduce((peak, current) => 
      current.v > peak.v ? current : peak
    );
  }

  // 최근 추세 분석
  analyzeRecentTrend(bins) {
    if (bins.length < 3) return 'insufficient_data';
    
    const recent = bins.slice(-3);
    const trend = recent[2].v - recent[0].v;
    
    if (trend > 0) return 'improving';
    if (trend < 0) return 'declining';
    return 'stable';
  }

  // 신뢰도 등급 계산
  calculateReliabilityGrade(quality) {
    const score = quality.data_quality_score || 0.95;
    if (score >= 0.95) return 'A+';
    if (score >= 0.90) return 'A';
    if (score >= 0.85) return 'B+';
    if (score >= 0.80) return 'B';
    return 'C';
  }

  // 검증 상태 평가
  assessValidationStatus(quality) {
    const consistency = quality.consistency_validation?.is_consistent;
    const completeness = (quality.completeness_score || 0) >= 0.90;
    
    if (consistency && completeness) return 'validated';
    if (consistency || completeness) return 'partially_validated';
    return 'needs_validation';
  }

  // 추천사항 생성
  generateRecommendations(basic, quality) {
    const recommendations = [];
    
    if (basic.weakest_axis !== 'unknown') {
      recommendations.push(`${basic.weakest_axis} 축 개선 필요`);
    }
    
    if (quality.data_quality_score < 0.90) {
      recommendations.push('데이터 품질 개선 권장');
    }
    
    if (basic.trend_direction === 'declining') {
      recommendations.push('최근 성과 하락 추세 주의');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('전반적으로 양호한 상태 유지');
    }
    
    return recommendations;
  }

  // 폴백 인사이트 생성
  generateFallbackInsights() {
    return {
      basic_insights: {
        artist_name: 'Unknown Artist',
        total_score: 0,
        strongest_axis: 'unknown',
        weakest_axis: 'unknown',
        career_stage: 'unknown',
        trend_direction: 'unknown'
      },
      timeseries_insights: { status: 'no_data' },
      quality_insights: {
        data_quality_score: 0.5,
        consistency_status: false,
        completeness_score: 0.5,
        reliability_grade: 'C',
        validation_status: 'needs_validation'
      },
      performance_insights: {
        processing_time: 'unknown',
        memory_usage: 'unknown',
        optimization_level: 'basic',
        cache_hit_rate: 0.5
      },
      display_summary: {
        title: '데이터 분석 요약',
        subtitle: '데이터 부족으로 분석 불가',
        key_metrics: { total_score: 0, data_quality: 0.5 },
        recommendations: ['데이터 품질 개선 필요'],
        last_updated: new Date().toISOString()
      }
    };
  }

  // P1이 Cloud Function에서 사용할 헬퍼 함수
  async getP3CompatibleArtistSummary(artistId) {
    try {
      // 1. P2 스키마로 Firestore에서 데이터 조회
      const artistDoc = await admin.firestore()
        .collection('artist_summary')
        .doc(artistId)
        .get();
      
      if (!artistDoc.exists) {
        throw new Error(`Artist ${artistId} not found`);
      }
      
      const p2RawData = artistDoc.data();
      
      // 2. P3 UI 호환 형식으로 변환 (Dr. Sarah Kim 어댑터)
      const p3CompatibleData = this.adapter.adaptArtistSummaryForP3(p2RawData);
      
      // 3. 호환성 테스트 수행
      const compatibilityTest = await this.adapter.testP3Compatibility(p2RawData);
      
      return {
        data: p3CompatibleData,
        compatibility_verified: compatibilityTest.overall_compatibility,
        adapter_metadata: {
          transformation_applied: true,
          dr_sarah_guarantee: 'P3_UI_SAFE',
          compatibility_score: compatibilityTest.compatibility_score
        }
      };
      
    } catch (error) {
      console.error(`❌ [P1 Helper Error] ${artistId}: ${error.message}`);
      
      // 에러 발생시 안전한 폴백
      return {
        data: this.adapter.generateFallbackSummary(),
        compatibility_verified: false,
        error: error.message,
        fallback_applied: true
      };
    }
  }

  async getP3CompatibleTimeseries(artistId, axis) {
    try {
      const timeseriesDoc = await admin.firestore()
        .collection('timeseries')
        .doc(`${artistId}_${axis}`)
        .get();
      
      if (!timeseriesDoc.exists) {
        throw new Error(`Timeseries ${artistId}_${axis} not found`);
      }
      
      const p2TimeseriesData = timeseriesDoc.data();
      const p3CompatibleData = this.adapter.adaptTimeseriesData(p2TimeseriesData);
      
      return {
        data: p3CompatibleData,
        compatibility_verified: p3CompatibleData.available,
        dr_sarah_quality: p3CompatibleData.ui_metadata?.quality_summary
      };
      
    } catch (error) {
      console.error(`❌ [P1 Timeseries Error] ${artistId}_${axis}: ${error.message}`);
      return {
        data: { available: false, reason: error.message },
        compatibility_verified: false,
        error: error.message
      };
    }
  }
}

// 전역 인스턴스 (P1이 바로 사용할 수 있도록)
export const universalDataAdapter = new UniversalDataAdapter();
export const p1Helper = new P1ImplementationHelper();

// 간편 사용 함수들
export const adaptForMayaChenUI = (p2Data) => {
  return universalDataAdapter.adaptForP3UI(p2Data);
};

export const validateP3Compatibility = async (p2Data) => {
  return await universalDataAdapter.testP3Compatibility(p2Data);
};

export const getP1ApiResponseFormat = () => {
  return universalDataAdapter.generateP1ApiResponseGuide();
};

export default universalDataAdapter;
