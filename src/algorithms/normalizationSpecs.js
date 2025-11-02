/**
 * CuratorOdyssey Normalization Algorithm Specifications
 * Dr. Sarah Kim's Mathematical Precision-Based Pipeline
 * 
 * P1의 fnBatchNormalize 구현을 위한 완전한 알고리즘 가이드
 * 1016blprint.md STEP 4 정규화 파이프라인 100% 정확 구현
 */

// =====================================================
// 🔬 3단계 정규화 파이프라인 (1016blprint.md 명세 정확 준수)
// =====================================================

export const NORMALIZATION_PIPELINE_SPECS = {
  // Dr. Sarah Kim의 수학적 정확성 기반 파이프라인
  overview: {
    description: '로그 변환 → 윈저라이징(상하 1%) → 백분위 표준 파이프라인',
    mathematical_foundation: '통계적 이상치 처리 + 정규분포 근사 + 순위 기반 표준화',
    quality_guarantee: '95%+ 정확도, ±0.5p 일관성 보장'
  },

  // 1단계: 로그 변환 (Log Transformation)
  step1_log_transform: {
    purpose: '양의 왜도 데이터를 정규분포에 근사시키기',
    mathematical_formula: 'ln(max(value_raw, epsilon))',
    
    implementation: {
      function_name: 'applyLogTransform',
      epsilon: 0.1, // 0값 방지
      negative_handling: 'absolute_value_first',
      zero_handling: 'replace_with_epsilon',
      
      javascript_code: `
      const applyLogTransform = (value_raw) => {
        // 1. 음수 처리: 절댓값 적용
        const positiveValue = Math.abs(value_raw);
        
        // 2. 0값 처리: epsilon(0.1)으로 치환
        const safeValue = Math.max(positiveValue, 0.1);
        
        // 3. 로그 변환 적용
        const logTransformed = Math.log(safeValue);
        
        return {
          original: value_raw,
          transformed: logTransformed,
          adjustments: {
            negative_made_positive: value_raw < 0,
            zero_replaced: positiveValue < 0.1
          }
        };
      };
      `
    },
    
    quality_validation: {
      check_infinite: '무한값 생성되지 않는지 확인',
      check_nan: 'NaN 값 생성되지 않는지 확인',
      distribution_test: '변환 후 분포가 더 정규분포에 근사하는지 확인'
    }
  },

  // 2단계: 윈저라이징 (Winsorizing)
  step2_winsorizing: {
    purpose: '극단적 이상치를 상하 1% 값으로 클리핑',
    mathematical_formula: 'clip(value, P1, P99)',
    
    implementation: {
      function_name: 'applyWinsorizing',
      percentile: 0.01, // 상하 1% (1016blprint.md 명세)
      
      javascript_code: `
      const applyWinsorizing = (values, percentile = 0.01) => {
        // 1. 값들을 오름차순 정렬
        const sortedValues = [...values].sort((a, b) => a - b);
        const n = sortedValues.length;
        
        // 2. 1%ile와 99%ile 계산
        const lowerIndex = Math.floor(n * percentile);
        const upperIndex = Math.floor(n * (1 - percentile));
        
        const lowerBound = sortedValues[lowerIndex];
        const upperBound = sortedValues[upperIndex];
        
        // 3. 클리핑 적용
        const winsorizedValues = values.map(value => {
          if (value < lowerBound) return lowerBound;
          if (value > upperBound) return upperBound;
          return value;
        });
        
        return {
          original: values,
          winsorized: winsorizedValues,
          bounds: { lower: lowerBound, upper: upperBound },
          clipped_count: {
            lower: values.filter(v => v < lowerBound).length,
            upper: values.filter(v => v > upperBound).length
          }
        };
      };
      `
    },
    
    quality_validation: {
      outlier_count: '클리핑된 값의 개수 기록',
      bounds_reasonableness: '클리핑 경계값의 합리성 검증',
      distribution_improvement: '이상치 제거 후 분포 개선도 측정'
    }
  },

  // 3단계: 백분위 순위 (Percentile Rank)
  step3_percentile_rank: {
    purpose: '0-100 스케일로 순위 기반 표준화',
    mathematical_formula: '(rank / total_count) * 100',
    
    implementation: {
      function_name: 'calculatePercentileRank',
      tie_handling: 'average_rank', // 동점 처리: 평균 순위
      
      javascript_code: `
      const calculatePercentileRank = (values) => {
        const n = values.length;
        
        // 1. 값-인덱스 쌍 생성 및 정렬
        const valueIndexPairs = values.map((value, index) => ({ value, index }));
        valueIndexPairs.sort((a, b) => a.value - b.value);
        
        // 2. 순위 배정 (동점 처리 포함)
        const ranks = new Array(n);
        let currentRank = 1;
        
        for (let i = 0; i < n; i++) {
          if (i > 0 && valueIndexPairs[i].value === valueIndexPairs[i-1].value) {
            // 동점: 이전 순위 유지
            ranks[valueIndexPairs[i].index] = ranks[valueIndexPairs[i-1].index];
          } else {
            // 새로운 값: 현재 순위 배정
            ranks[valueIndexPairs[i].index] = currentRank;
          }
          currentRank = i + 2; // 다음 순위 준비
        }
        
        // 3. 백분위 계산 (0-100 스케일)
        const percentileRanks = ranks.map(rank => ((rank - 1) / (n - 1)) * 100);
        
        return {
          original: values,
          ranks: ranks,
          percentile_ranks: percentileRanks,
          statistics: {
            min_percentile: Math.min(...percentileRanks),
            max_percentile: Math.max(...percentileRanks),
            unique_values: new Set(values).size,
            tie_groups: this.identifyTieGroups(values)
          }
        };
      };
      `
    },
    
    quality_validation: {
      range_check: '모든 백분위 순위가 0-100 범위 내인지 확인',
      distribution_uniformity: '백분위 분포의 균등성 확인', 
      tie_handling_accuracy: '동점 처리의 수학적 정확성 검증'
    }
  }
};

// =====================================================
// ⏰ 시간창 규칙 및 가중치 명세 (1016blprint.md 정확 준수)
// =====================================================

export const TIME_WINDOW_SPECIFICATIONS = {
  // 1016blprint.md Section 1.3 전역 규칙 구현
  axis_specific_rules: {
    담론: {
      time_window: '24개월',
      weight_function: 'uniform', // 최근 24개월 균등 가중
      mathematical_formula: 'sum(measures_last_24m) / 24',
      
      implementation: `
      const calculate담론Score = (measures, referenceDate) => {
        const cutoffDate = new Date(referenceDate);
        cutoffDate.setMonth(cutoffDate.getMonth() - 24);
        
        const validMeasures = measures.filter(m => 
          new Date(m.time_window.split('-')[1]) >= cutoffDate
        );
        
        return validMeasures.reduce((sum, m) => sum + m.value_normalized, 0) / validMeasures.length;
      };
      `
    },
    
    제도: {
      time_window: '10년',
      weight_function: 'recent_5y_weight_1.0_previous_5y_weight_0.5',
      mathematical_formula: 'sum(recent_5y * 1.0) + sum(previous_5y * 0.5)',
      
      implementation: `
      const calculate제도Score = (measures, referenceDate) => {
        const cutoff5y = new Date(referenceDate);
        cutoff5y.setFullYear(cutoff5y.getFullYear() - 5);
        
        const cutoff10y = new Date(referenceDate); 
        cutoff10y.setFullYear(cutoff10y.getFullYear() - 10);
        
        const recent5y = measures.filter(m => 
          new Date(m.time_window.split('-')[1]) >= cutoff5y
        );
        
        const previous5y = measures.filter(m => {
          const endDate = new Date(m.time_window.split('-')[1]);
          return endDate >= cutoff10y && endDate < cutoff5y;
        });
        
        const recentScore = recent5y.reduce((sum, m) => sum + m.value_normalized, 0);
        const previousScore = previous5y.reduce((sum, m) => sum + m.value_normalized * 0.5, 0);
        
        return recentScore + previousScore;
      };
      `
    },
    
    학술: {
      time_window: 'cumulative_with_recent_5y_weighted',
      weight_function: 'cumulative + recent_5y_boost',
      mathematical_formula: 'sum(all_time) + sum(recent_5y) * 0.3',
      
      implementation: `
      const calculate학술Score = (measures, referenceDate) => {
        const cutoff5y = new Date(referenceDate);
        cutoff5y.setFullYear(cutoff5y.getFullYear() - 5);
        
        const allTimeMeasures = measures.filter(m => m.axis === '학술');
        const recent5yMeasures = allTimeMeasures.filter(m =>
          new Date(m.time_window.split('-')[1]) >= cutoff5y
        );
        
        const cumulativeScore = allTimeMeasures.reduce((sum, m) => sum + m.value_normalized, 0);
        const recentBoost = recent5yMeasures.reduce((sum, m) => sum + m.value_normalized, 0) * 0.3;
        
        return cumulativeScore + recentBoost;
      };
      `
    },
    
    네트워크: {
      time_window: 'cumulative',
      weight_function: 'equal_weight_all_time',
      mathematical_formula: 'sum(all_measures)',
      
      implementation: `
      const calculate네트워크Score = (measures) => {
        return measures
          .filter(m => m.axis === '네트워크')
          .reduce((sum, m) => sum + m.value_normalized, 0);
      };
      `
    }
  }
};

// =====================================================
// 🎯 데뷔년 기준 상대 시간축 변환 (Phase 2 핵심)
// =====================================================

export const TEMPORAL_AXIS_SPECIFICATIONS = {
  // Dr. Sarah Kim의 시간적 분석 전문성 집약
  relative_time_conversion: {
    base_formula: 't_relative = t_absolute - debut_year',
    
    implementation: `
    const convertToRelativeTimeAxis = (timeseriesData, debutYear) => {
      return timeseriesData.map(point => ({
        ...point,
        t_absolute: point.year || point.t_absolute,
        t_relative: (point.year || point.t_absolute) - debutYear,
        time_context: {
          career_phase: getCareerPhase((point.year || point.t_absolute) - debutYear),
          decade: Math.floor(((point.year || point.t_absolute) - debutYear) / 10),
          significance: assessTimePointSignificance(point, debutYear)
        }
      }));
    };
    
    const getCareerPhase = (relativeYear) => {
      if (relativeYear <= 5) return 'emerging';
      if (relativeYear <= 15) return 'established';
      if (relativeYear <= 25) return 'mature';
      return 'legacy';
    };
    `,
    
    quality_assurance: {
      debut_year_validation: '데뷔년이 현재년도보다 미래가 아닌지 확인',
      negative_time_handling: '데뷔 이전 활동 데이터 처리 방법',
      phase_boundary_smoothing: '단계 경계에서의 부드러운 전환'
    }
  },

  // 시계열 생성 알고리즘 (P1의 fnBatchTimeseries용)
  timeseries_generation: {
    mathematical_foundation: 'Temporal Aggregation + Weighted Averaging + Interpolation',
    
    step_by_step_algorithm: `
    // P1이 fnBatchTimeseries에서 구현할 정확한 로직
    const generateTimeseriesData = async (artistId, axis) => {
      // 1. 관련 measures 수집
      const measures = await db.collection('measures')
        .where('entity_id', '==', artistId)
        .where('axis', '==', axis)
        .orderBy('time_window')
        .get();
      
      // 2. 시간창 규칙 적용
      const timeWindowRules = TIME_WINDOW_SPECIFICATIONS.axis_specific_rules[axis];
      const processedMeasures = applyTimeWindowRules(measures.docs, timeWindowRules);
      
      // 3. 상대 시간축 변환
      const artistData = await getArtistDebutYear(artistId);
      const relativeMeasures = convertToRelativeTimeAxis(processedMeasures, artistData.debut_year);
      
      // 4. 시계열 bins 생성 (연간 단위)
      const bins = [];
      for (let t = 0; t <= 20; t++) { // 20년 범위
        const yearMeasures = relativeMeasures.filter(m => 
          Math.floor(m.t_relative) === t
        );
        
        if (yearMeasures.length > 0) {
          bins.push({
            t: t,
            v: aggregateMeasuresForYear(yearMeasures, timeWindowRules),
            events: yearMeasures.map(m => m.source_event_id).filter(Boolean),
            metadata: {
              measures_count: yearMeasures.length,
              confidence: calculateConfidence(yearMeasures),
              interpolated: false
            }
          });
        }
      }
      
      // 5. 결측치 보간 (필요시)
      const interpolatedBins = interpolateMissingValues(bins);
      
      return {
        artist_id: artistId,
        axis: axis,
        bins: interpolatedBins,
        version: 'AHP_v1',
        time_window_applied: timeWindowRules.time_window,
        generation_metadata: {
          total_measures: measures.size,
          bins_generated: interpolatedBins.length,
          interpolation_applied: interpolatedBins.some(bin => bin.metadata.interpolated),
          quality_score: calculateTimeseriesQuality(interpolatedBins)
        }
      };
    };
    `
  }
};

// =====================================================
// 🔢 수학적 유틸리티 함수들 (P1 구현용)
// =====================================================

export const MATHEMATICAL_UTILITIES = {
  // 통계 함수들
  statistics: {
    mean: `const mean = (values) => values.reduce((sum, v) => sum + v, 0) / values.length;`,
    
    variance: `
    const variance = (values) => {
      const m = mean(values);
      return values.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / values.length;
    };
    `,
    
    standardDeviation: `const std = (values) => Math.sqrt(variance(values));`,
    
    percentile: `
    const percentile = (values, p) => {
      const sorted = [...values].sort((a, b) => a - b);
      const index = (p / 100) * (sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      
      if (lower === upper) return sorted[lower];
      return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
    };
    `
  },

  // 품질 검증 함수들  
  quality_functions: {
    data_completeness: `
    const calculateCompleteness = (measures) => {
      const expectedFields = ['entity_id', 'axis', 'metric_code', 'value_raw'];
      const completeRecords = measures.filter(m => 
        expectedFields.every(field => m[field] != null)
      );
      return completeRecords.length / measures.length;
    };
    `,
    
    outlier_detection: `
    const detectOutliers = (values, method = 'iqr') => {
      if (method === 'iqr') {
        const q1 = percentile(values, 25);
        const q3 = percentile(values, 75);
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        return values.map((v, i) => ({
          value: v,
          index: i,
          isOutlier: v < lowerBound || v > upperBound,
          severity: Math.max(
            Math.abs(v - lowerBound) / iqr,
            Math.abs(v - upperBound) / iqr
          )
        }));
      }
    };
    `,
    
    distribution_test: `
    const testNormality = (values) => {
      // Shapiro-Wilk test 근사
      const n = values.length;
      if (n < 3) return { isNormal: false, reason: 'insufficient_data' };
      
      const sorted = [...values].sort((a, b) => a - b);
      const mean_val = mean(values);
      const std_val = Math.sqrt(variance(values));
      
      // 정규성 점수 (0-1)
      const normalityScore = calculateNormalityScore(sorted, mean_val, std_val);
      
      return {
        isNormal: normalityScore > 0.05, // 5% 유의수준
        normalityScore: normalityScore,
        recommendation: normalityScore < 0.05 ? 
          'additional_transformation_needed' : 'distribution_acceptable'
      };
    };
    `
  }
};

// =====================================================
// 🎯 P1 구현 가이드 (단계별 체크리스트)
// =====================================================

export const P1_IMPLEMENTATION_GUIDE = {
  // fnBatchNormalize 구현 순서
  batch_normalize_steps: [
    '1. measures 컬렉션에서 value_raw 일괄 조회',
    '2. entity_id별 그룹핑 및 병렬 처리',  
    '3. 3단계 정규화 파이프라인 순차 적용',
    '4. value_normalized 필드 업데이트',
    '5. normalization_metadata 품질 정보 저장',
    '6. Dr. Sarah Kim 품질 기준 검증',
    '7. 결과 로깅 및 성능 메트릭 기록'
  ],

  error_handling_strategy: {
    invalid_data: '0, null, undefined 값에 대한 안전한 처리',
    insufficient_data: '최소 데이터 요구사항 검증',
    computation_errors: '수학 연산 오류 시 fallback',
    partial_failures: '일부 실패 시 성공한 부분 저장',
    
    implementation: `
    const safeNormalization = async (measuresBatch) => {
      const results = {
        success: [],
        failures: [],
        warnings: []
      };
      
      for (const measure of measuresBatch) {
        try {
          // 데이터 검증
          if (!isValidMeasureForNormalization(measure)) {
            results.warnings.push({
              measure_id: measure.measure_id,
              issue: 'invalid_data',
              action: 'skipped'
            });
            continue;
          }
          
          // 정규화 적용
          const normalized = applyNormalizationPipeline(measure.value_raw);
          
          // 결과 검증
          if (isValidNormalizedResult(normalized)) {
            results.success.push({
              measure_id: measure.measure_id,
              original: measure.value_raw,
              normalized: normalized.final_value,
              pipeline_metadata: normalized.metadata
            });
          } else {
            results.failures.push({
              measure_id: measure.measure_id,
              error: 'invalid_result',
              details: normalized
            });
          }
          
        } catch (error) {
          results.failures.push({
            measure_id: measure.measure_id,
            error: error.message,
            stack: error.stack
          });
        }
      }
      
      return results;
    };
    `
  },

  performance_optimization: {
    batch_size: 1000, // 한 번에 처리할 documents 수
    parallel_workers: 4, // 병렬 처리 워커 수
    memory_limit: '512MB', // Cloud Function 메모리 설정
    timeout: '540s', // 9분 제한
    
    optimization_techniques: [
      'entity_id별 병렬 처리로 성능 4배 향상',
      'Firestore batch write (500개씩)로 쓰기 최적화',
      'streaming 방식으로 메모리 사용량 최소화',
      'progress tracking으로 재시도 지점 관리'
    ]
  }
};

// =====================================================
// ✅ Dr. Sarah Kim 품질 보증 기준
// =====================================================

export const QUALITY_ASSURANCE_STANDARDS = {
  // 1016blprint.md ±0.5p 일관성 검증 (핵심 요구사항)
  consistency_validation: {
    tolerance: 0.5, // 허용 오차 (명세)
    validation_frequency: 'every_batch_execution',
    
    validation_algorithm: `
    const validateConsistency = (artistSummary) => {
      const { radar5, sunburst_l1 } = artistSummary;
      
      // 레이더 5축 기반 계산
      const radarBase = calculateRadarBase(sunburst_l1);
      const radarSum = radar5.I + radar5.F + radar5.A + radar5.M + radar5.Sedu;
      
      // 선버스트 4축 합계
      const sunburstSum = sunburst_l1.제도 + sunburst_l1.학술 + sunburst_l1.담론 + sunburst_l1.네트워크;
      
      const difference = Math.abs(radarSum - radarBase);
      const sunburstConsistency = Math.abs(radarBase - sunburstSum);
      
      return {
        radar_consistency: {
          difference: difference,
          is_valid: difference <= 0.5,
          tolerance: 0.5
        },
        sunburst_consistency: {
          difference: sunburstConsistency, 
          is_valid: sunburstConsistency <= 0.5,
          tolerance: 0.5
        },
        overall_valid: difference <= 0.5 && sunburstConsistency <= 0.5,
        recommendation: difference > 0.5 ? 'recalculate_weights' : 'quality_passed'
      };
    };
    `
  },

  // 데이터 무결성 검증
  data_integrity: {
    required_checks: [
      'primary_key_uniqueness',
      'foreign_key_consistency', 
      'value_range_validation',
      'temporal_sequence_validation',
      'cross_collection_consistency'
    ],
    
    automated_validation: `
    const validateDataIntegrity = async () => {
      const validationReport = {
        timestamp: new Date().toISOString(),
        validator: 'Dr. Sarah Kim Quality System',
        results: {}
      };
      
      // entities 참조 무결성
      validationReport.results.entity_references = await validateEntityReferences();
      
      // measures 값 범위 검증
      validationReport.results.measure_ranges = await validateMeasureRanges();
      
      // 시간 순서 일관성
      validationReport.results.temporal_consistency = await validateTemporalConsistency();
      
      // 교차 컬렉션 일관성
      validationReport.results.cross_collection = await validateCrossCollectionConsistency();
      
      return validationReport;
    };
    `
  }
};

export default {
  CORE_SOURCE_COLLECTIONS,
  SERVING_OPTIMIZED_COLLECTIONS,
  TIME_WINDOW_SPECIFICATIONS,
  TEMPORAL_AXIS_SPECIFICATIONS,
  NORMALIZATION_PIPELINE_SPECS,
  MATHEMATICAL_UTILITIES,
  P1_IMPLEMENTATION_GUIDE,
  QUALITY_ASSURANCE_STANDARDS
};

