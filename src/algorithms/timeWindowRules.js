/**
 * CuratorOdyssey Time Window Rules Implementation Guide
 * Dr. Sarah Kim's Temporal Analysis Expertise
 * 
 * 1016blprint.md Section 1.3 시간창 규칙 100% 정확 구현
 * P1의 fnBatchTimeseries 및 fnBatchComparePairs를 위한 완전한 가이드
 */

// =====================================================
// ⏰ 축별 시간창 규칙 (1016blprint.md 전역 규칙 정확 준수)
// =====================================================

export const TIME_WINDOW_RULES = {
  // Dr. Sarah Kim의 시간적 분석 전문성 기반 규칙 해석
  axis_specifications: {
    담론: {
      rule: '담론=24개월',
      description: '최근 24개월간의 대중적 담론 활동만 고려',
      mathematical_implementation: {
        window_size: 24, // months
        weight_distribution: 'uniform',
        cutoff_logic: 'hard_cutoff_24m',
        
        code_implementation: `
        const apply담론TimeWindow = (measures, referenceDate = new Date()) => {
          const cutoffDate = new Date(referenceDate);
          cutoffDate.setMonth(cutoffDate.getMonth() - 24);
          
          // 24개월 내 measures만 필터링
          const validMeasures = measures.filter(measure => {
            const measureEndDate = parseMeasureTimeWindow(measure.time_window).end_date;
            return measureEndDate >= cutoffDate;
          });
          
          // 균등 가중치 적용
          const totalScore = validMeasures.reduce((sum, measure) => 
            sum + (measure.value_normalized || 0), 0
          );
          
          return {
            score: totalScore,
            measures_count: validMeasures.length,
            time_window_applied: '24months',
            cutoff_date: cutoffDate.toISOString(),
            methodology: 'uniform_weight_recent_24m'
          };
        };
        `
      },
      
      rationale: '담론은 트렌드성이 강해 최근성이 중요, 24개월이 적정 기억 주기'
    },

    제도: {
      rule: '제도=10년(최근 5년 가중 1.0/이전 5년 0.5)',
      description: '최근 5년은 1.0 가중치, 이전 5년은 0.5 가중치 적용',
      mathematical_implementation: {
        window_size: 120, // months (10 years)
        weight_distribution: 'recent_5y_1.0_previous_5y_0.5',
        decay_function: 'step_function',
        
        code_implementation: `
        const apply제도TimeWindow = (measures, referenceDate = new Date()) => {
          const recent5yDate = new Date(referenceDate);
          recent5yDate.setFullYear(recent5yDate.getFullYear() - 5);
          
          const cutoff10yDate = new Date(referenceDate);
          cutoff10yDate.setFullYear(cutoff10yDate.getFullYear() - 10);
          
          // 시간대별 분류
          const recent5yMeasures = measures.filter(measure => {
            const measureEndDate = parseMeasureTimeWindow(measure.time_window).end_date;
            return measureEndDate >= recent5yDate;
          });
          
          const previous5yMeasures = measures.filter(measure => {
            const measureEndDate = parseMeasureTimeWindow(measure.time_window).end_date;
            return measureEndDate >= cutoff10yDate && measureEndDate < recent5yDate;
          });
          
          // 가중치 적용
          const recentScore = recent5yMeasures.reduce((sum, measure) => 
            sum + (measure.value_normalized || 0) * 1.0, 0
          );
          
          const previousScore = previous5yMeasures.reduce((sum, measure) =>
            sum + (measure.value_normalized || 0) * 0.5, 0
          );
          
          return {
            score: recentScore + previousScore,
            recent_5y: {
              score: recentScore,
              count: recent5yMeasures.length,
              weight: 1.0
            },
            previous_5y: {
              score: previousScore / 0.5, // 원래 값으로 복원하여 표시
              weighted_score: previousScore,
              count: previous5yMeasures.length,
              weight: 0.5
            },
            time_window_applied: '10y(1.0/0.5)',
            methodology: 'weighted_recent_emphasis'
          };
        };
        `
      },
      
      rationale: '제도적 성취는 누적성과 최근성 모두 중요, 시간가중 적용으로 균형 확보'
    },

    학술: {
      rule: '학술=누적+최근 5년 가중',
      description: '전체 누적 점수에 최근 5년 30% 추가 가산',
      mathematical_implementation: {
        window_size: 'unlimited', // 누적
        boost_window: 60, // months (recent 5 years)
        boost_coefficient: 0.3,
        
        code_implementation: `
        const apply학술TimeWindow = (measures, referenceDate = new Date()) => {
          const recent5yDate = new Date(referenceDate);
          recent5yDate.setFullYear(recent5yDate.getFullYear() - 5);
          
          // 전체 누적 점수
          const allMeasures = measures.filter(m => m.axis === '학술');
          const cumulativeScore = allMeasures.reduce((sum, measure) => 
            sum + (measure.value_normalized || 0), 0
          );
          
          // 최근 5년 추가 가산
          const recent5yMeasures = allMeasures.filter(measure => {
            const measureEndDate = parseMeasureTimeWindow(measure.time_window).end_date;
            return measureEndDate >= recent5yDate;
          });
          
          const recentBoost = recent5yMeasures.reduce((sum, measure) =>
            sum + (measure.value_normalized || 0), 0
          ) * 0.3; // 30% 가산
          
          return {
            score: cumulativeScore + recentBoost,
            cumulative: {
              score: cumulativeScore,
              count: allMeasures.length
            },
            recent_boost: {
              base_score: recentBoost / 0.3, // 원래 값
              boost_score: recentBoost,
              count: recent5yMeasures.length,
              coefficient: 0.3
            },
            time_window_applied: 'cumulative+5y_boost',
            methodology: 'cumulative_with_recent_emphasis'
          };
        };
        `
      },
      
      rationale: '학술적 성취는 누적성이 중요하나, 최근 활동의 현재성도 고려 필요'
    },

    네트워크: {
      rule: '네트워크=누적',
      description: '모든 시점의 네트워크 관계를 누적하여 계산',
      mathematical_implementation: {
        window_size: 'unlimited',
        weight_distribution: 'equal_all_time',
        decay_function: 'none',
        
        code_implementation: `
        const apply네트워크TimeWindow = (measures) => {
          // 모든 네트워크 관련 measures 누적
          const networkMeasures = measures.filter(m => m.axis === '네트워크');
          
          const totalScore = networkMeasures.reduce((sum, measure) =>
            sum + (measure.value_normalized || 0), 0
          );
          
          return {
            score: totalScore,
            measures_count: networkMeasures.length,
            time_window_applied: 'cumulative',
            methodology: 'full_career_network_accumulation',
            network_metadata: {
              relationships_formed: networkMeasures.length,
              network_diversity: calculateNetworkDiversity(networkMeasures),
              strength_distribution: analyzeNetworkStrength(networkMeasures)
            }
          };
        };
        `
      },
      
      rationale: '네트워크는 관계의 누적이며, 과거 관계도 현재 가치에 지속적 기여'
    }
  }
};

// =====================================================
// 🔄 데뷔년 기준 상대 시간축 변환 (Phase 2 핵심)
// =====================================================

export const RELATIVE_TIME_AXIS_SYSTEM = {
  // Dr. Sarah Kim의 시간적 분석 혁신
  conceptual_framework: {
    purpose: '모든 아티스트를 동일한 커리어 단계 기준으로 비교 분석',
    innovation: '절대 년도 → 상대 시간으로 변환하여 공정한 성장 패턴 비교',
    phase2_integration: 'StackedAreaChart에서 t=0 기준 시계열 시각화',
    phase3_integration: '아티스트 간 동일 커리어 단계 비교 분석'
  },

  conversion_algorithm: {
    base_formula: 't_relative = t_absolute - debut_year',
    
    detailed_implementation: `
    const convertToRelativeTimeAxis = async (artistId, timeseriesData) => {
      // 1. 아티스트 데뷔년 조회
      const artistDoc = await db.collection('entities').doc(artistId).get();
      const debutYear = artistDoc.data().debut_year;
      
      if (!debutYear) {
        throw new Error(\`Artist \${artistId} debut year not found\`);
      }
      
      // 2. 시계열 데이터 변환
      const convertedBins = timeseriesData.bins.map(bin => {
        const absoluteYear = bin.year || bin.t_absolute;
        const relativeTime = absoluteYear - debutYear;
        
        return {
          ...bin,
          t: relativeTime, // Phase 2 시각화용 상대 시간
          t_absolute: absoluteYear, // 원본 보존
          t_relative: relativeTime, // 명시적 상대 시간
          career_context: {
            phase: categorizeCareerPhase(relativeTime),
            decade: Math.floor(relativeTime / 10),
            significance: assessCareerSignificance(relativeTime, bin.v)
          }
        };
      });
      
      // 3. 시간순 정렬 보장
      convertedBins.sort((a, b) => a.t - b.t);
      
      return {
        artist_id: artistId,
        debut_year: debutYear,
        bins: convertedBins,
        conversion_metadata: {
          total_career_span: Math.max(...convertedBins.map(b => b.t)) - Math.min(...convertedBins.map(b => b.t)),
          data_points: convertedBins.length,
          career_phases_covered: [...new Set(convertedBins.map(b => b.career_context.phase))],
          conversion_quality: validateConversionQuality(convertedBins)
        }
      };
    };
    
    const categorizeCareerPhase = (relativeYear) => {
      if (relativeYear <= 3) return 'debut';
      if (relativeYear <= 8) return 'emerging';  
      if (relativeYear <= 15) return 'established';
      if (relativeYear <= 25) return 'mature';
      return 'legacy';
    };
    
    const assessCareerSignificance = (relativeYear, value) => {
      // Dr. Sarah Kim의 커리어 단계별 성취 기준
      const phaseExpectations = {
        debut: { low: 0, medium: 10, high: 25 },
        emerging: { low: 15, medium: 40, high: 70 },
        established: { low: 50, medium: 80, high: 120 },
        mature: { low: 80, medium: 150, high: 250 },
        legacy: { low: 150, medium: 300, high: 500 }
      };
      
      const phase = categorizeCareerPhase(relativeYear);
      const expectations = phaseExpectations[phase];
      
      if (value >= expectations.high) return 'exceptional';
      if (value >= expectations.medium) return 'above_average';
      if (value >= expectations.low) return 'average';
      return 'below_average';
    };
    `
  }
};

// =====================================================
// 🎯 가중치 시스템 상세 명세 (1016blprint.md weights 컬렉션)
// =====================================================

export const WEIGHTS_SYSTEM_SPECIFICATIONS = {
  // AHP(Analytic Hierarchy Process) 가중치 체계
  ahp_methodology: {
    version: 'AHP_v1',
    description: '계층분석법 기반 전문가 판단 가중치',
    consistency_requirement: 'CR < 0.1 (10% 이하)',
    
    weight_categories: {
      radar5_weights: {
        purpose: '5축 레이더 차트 가중치',
        target_collection: 'artist_summary.radar5',
        weights: {
          I: { weight: 0.35, description: 'Institution - 기관전시 (최고 중요도)' },
          F: { weight: 0.25, description: 'Fair - 페어 참가' },
          A: { weight: 0.20, description: 'Award - 시상 수상' },
          M: { weight: 0.15, description: 'Media - 미디어 노출' },
          Sedu: { weight: 0.05, description: 'Seduction - 교육 활동' }
        }
      },
      
      sunburst4_weights: {
        purpose: '4축 선버스트 기반 가중치',
        target_collection: 'artist_summary.sunburst_l1',
        weights: {
          제도: { weight: 0.30, description: '제도적 인정 및 공식적 성취' },
          학술: { weight: 0.25, description: '학술적 연구 및 이론적 기여' },
          담론: { weight: 0.25, description: '대중적 담론 및 문화적 영향' },
          네트워크: { weight: 0.20, description: '관계적 자본 및 협업 네트워크' }
        }
      }
    }
  },

  // Dr. Sarah Kim의 가중치 최적화 전문성
  weight_optimization: {
    calibration_method: 'expert_consensus + empirical_validation',
    
    calibration_algorithm: `
    const calibrateWeights = async (weightVersion = 'AHP_v1') => {
      // 1. 기존 가중치 로드
      const currentWeights = await loadWeightsFromCollection(weightVersion);
      
      // 2. 실제 데이터로 가중치 검증
      const sampleArtists = await getSampleArtists(30); // 30명 샘플
      const consistencyResults = [];
      
      for (const artist of sampleArtists) {
        const consistency = await validateArtistConsistency(artist, currentWeights);
        consistencyResults.push(consistency);
      }
      
      // 3. ±0.5p 위반 사례 분석
      const violations = consistencyResults.filter(r => !r.is_consistent);
      console.log(\`일관성 위반: \${violations.length}/\${sampleArtists.length}\`);
      
      // 4. 가중치 미세 조정 (필요시)
      if (violations.length > sampleArtists.length * 0.05) { // 5% 초과 위반
        const optimizedWeights = optimizeWeightsForConsistency(currentWeights, violations);
        return optimizedWeights;
      }
      
      return currentWeights;
    };
    
    const validateArtistConsistency = async (artistId, weights) => {
      const measures = await getArtistMeasures(artistId);
      
      // 레이더 5축 계산 (가중치 적용)
      const radar5Calculated = calculateRadar5WithWeights(measures, weights.radar5_weights);
      
      // 선버스트 4축 기반 계산
      const sunburst4Base = calculateSunburst4Base(measures, weights.sunburst4_weights);
      const radar5FromSunburst = mapSunburstToRadar(sunburst4Base, weights);
      
      // 일관성 검증 (±0.5p)
      const difference = Math.abs(
        sumRadarScores(radar5Calculated) - sumRadarScores(radar5FromSunburst)
      );
      
      return {
        artist_id: artistId,
        is_consistent: difference <= 0.5,
        difference: difference,
        tolerance: 0.5,
        radar5_calculated: radar5Calculated,
        radar5_from_sunburst: radar5FromSunburst
      };
    };
    `
  }
};

// =====================================================
// 📊 시계열 집계 알고리즘 (P1의 fnBatchTimeseries용)
// =====================================================

export const TIMESERIES_AGGREGATION_SPECS = {
  // Dr. Sarah Kim의 시계열 분석 전문성 집약
  aggregation_methodology: {
    temporal_resolution: 'annual', // 연간 단위 bins
    aggregation_period: 'career_start_to_present',
    max_career_span: 30, // years
    
    step_by_step_algorithm: `
    // P1이 fnBatchTimeseries에서 구현할 정확한 로직
    const generateArtistTimeseries = async (artistId, axis) => {
      console.log(\`📊 [Dr.Sarah+P1] \${artistId} \${axis}축 시계열 생성 시작...\`);
      
      try {
        // 1. 아티스트 기본 정보 및 measures 수집
        const [artistDoc, measuresSnapshot] = await Promise.all([
          db.collection('entities').doc(artistId).get(),
          db.collection('measures')
            .where('entity_id', '==', artistId)
            .where('axis', '==', axis)
            .orderBy('time_window')
            .get()
        ]);
        
        if (!artistDoc.exists) {
          throw new Error(\`Artist \${artistId} not found\`);
        }
        
        const debutYear = artistDoc.data().debut_year;
        const measures = measuresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 2. 시간창 규칙 적용
        const timeWindowRule = TIME_WINDOW_RULES.axis_specifications[axis];
        const weightedMeasures = await applyTimeWindowRule(measures, timeWindowRule);
        
        // 3. 연도별 집계
        const yearlyBins = [];
        const currentYear = new Date().getFullYear();
        
        for (let year = debutYear; year <= currentYear; year++) {
          const relativeTime = year - debutYear;
          
          // 해당 연도에 영향을 주는 measures 필터링
          const yearMeasures = filterMeasuresForYear(weightedMeasures, year, timeWindowRule);
          
          if (yearMeasures.length > 0) {
            const aggregatedValue = aggregateMeasuresForYear(yearMeasures, timeWindowRule);
            const eventsForYear = await getEventsForYear(artistId, year);
            
            yearlyBins.push({
              t: relativeTime,
              v: aggregatedValue.score,
              events: eventsForYear.map(e => e.event_id),
              metadata: {
                measures_count: yearMeasures.length,
                confidence: calculateAggregationConfidence(yearMeasures),
                time_window_applied: timeWindowRule.rule,
                aggregation_method: aggregatedValue.methodology
              }
            });
          }
        }
        
        // 4. 결측치 보간 (필요시)
        const interpolatedBins = interpolateMissingYears(yearlyBins, debutYear, currentYear);
        
        // 5. 시계열 메타데이터 생성
        const analysisMetadata = generateTimeseriesAnalysisMetadata(interpolatedBins, axis);
        
        return {
          timeseries_id: \`\${artistId}_\${axis}\`,
          artist_id: artistId,
          axis: axis,
          bins: interpolatedBins,
          version: 'AHP_v1',
          time_window_applied: timeWindowRule.rule,
          last_calculated: new Date(),
          analysis_metadata: analysisMetadata
        };
        
      } catch (error) {
        console.error(\`❌ [Dr.Sarah+P1] 시계열 생성 오류: \${error.message}\`);
        throw error;
      }
    };
    `
  },

  // 집계 품질 보장
  aggregation_quality: {
    confidence_calculation: `
    const calculateAggregationConfidence = (measures) => {
      let confidenceFactors = [];
      
      // 데이터 양 (30%)
      const dataVolume = Math.min(measures.length / 10, 1); // 10개 이상이면 만점
      confidenceFactors.push({ factor: 'data_volume', score: dataVolume, weight: 0.3 });
      
      // 출처 다양성 (25%)
      const uniqueSources = new Set(measures.map(m => m.source_id)).size;
      const sourceDiversity = Math.min(uniqueSources / 5, 1); // 5개 이상 출처면 만점
      confidenceFactors.push({ factor: 'source_diversity', score: sourceDiversity, weight: 0.25 });
      
      // 시간적 분포 (25%)
      const temporalSpread = assessTemporalSpread(measures);
      confidenceFactors.push({ factor: 'temporal_spread', score: temporalSpread, weight: 0.25 });
      
      // 정규화 품질 (20%)
      const avgNormalizationQuality = measures.reduce((sum, m) => 
        sum + (m.normalization_metadata?.quality_score || 0.5), 0
      ) / measures.length;
      confidenceFactors.push({ factor: 'normalization_quality', score: avgNormalizationQuality, weight: 0.2 });
      
      // 가중 평균 계산
      const totalScore = confidenceFactors.reduce((sum, f) => sum + f.score * f.weight, 0);
      
      return {
        overall_confidence: totalScore,
        factor_breakdown: confidenceFactors,
        confidence_level: totalScore >= 0.8 ? 'high' : 
                         totalScore >= 0.6 ? 'medium' : 
                         totalScore >= 0.4 ? 'low' : 'very_low'
      };
    };
    `
  }
};

// =====================================================
// 📈 결측치 보간 및 품질 관리 (Dr. Sarah Kim 전문성)
// =====================================================

export const INTERPOLATION_AND_QUALITY = {
  // 지능형 결측치 보간
  interpolation_strategy: {
    method: 'adaptive_interpolation',
    description: '패턴 기반 적응형 보간 (선형/곡선 자동 선택)',
    
    implementation: `
    const interpolateMissingYears = (bins, debutYear, currentYear) => {
      const interpolatedBins = [...bins];
      
      // 연속된 년도 체크
      for (let year = debutYear; year <= currentYear; year++) {
        const relativeTime = year - debutYear;
        const existingBin = bins.find(bin => bin.t === relativeTime);
        
        if (!existingBin) {
          // 보간 필요
          const interpolatedValue = calculateInterpolatedValue(bins, relativeTime);
          
          interpolatedBins.push({
            t: relativeTime,
            v: interpolatedValue.value,
            events: [],
            metadata: {
              measures_count: 0,
              confidence: interpolatedValue.confidence,
              interpolated: true,
              interpolation_method: interpolatedValue.method,
              source_points: interpolatedValue.source_points
            }
          });
        }
      }
      
      // 시간순 재정렬
      return interpolatedBins.sort((a, b) => a.t - b.t);
    };
    
    const calculateInterpolatedValue = (existingBins, targetTime) => {
      // 전후 데이터 포인트 찾기
      const beforePoints = existingBins.filter(bin => bin.t < targetTime);
      const afterPoints = existingBins.filter(bin => bin.t > targetTime);
      
      if (beforePoints.length === 0 && afterPoints.length === 0) {
        return { value: 0, confidence: 0, method: 'no_data' };
      }
      
      // 선형 보간 vs 곡선 보간 자동 선택
      const useLinear = shouldUseLinearInterpolation(beforePoints, afterPoints);
      
      if (useLinear) {
        return linearInterpolation(beforePoints, afterPoints, targetTime);
      } else {
        return splineInterpolation(existingBins, targetTime);
      }
    };
    `
  },

  // 시계열 품질 평가
  quality_assessment: {
    quality_score_calculation: `
    const calculateTimeseriesQuality = (bins) => {
      let qualityFactors = [];
      
      // 데이터 완성도 (40%)
      const completeness = bins.filter(bin => !bin.metadata.interpolated).length / bins.length;
      qualityFactors.push({ factor: 'completeness', score: completeness, weight: 0.4 });
      
      // 시간적 일관성 (30%)
      const temporalConsistency = assessTemporalConsistency(bins);
      qualityFactors.push({ factor: 'temporal_consistency', score: temporalConsistency, weight: 0.3 });
      
      // 성장 패턴 합리성 (20%)
      const patternReasonableness = assessGrowthPatternReasonableness(bins);
      qualityFactors.push({ factor: 'pattern_reasonableness', score: patternReasonableness, weight: 0.2 });
      
      // 신뢰도 일관성 (10%)
      const avgConfidence = bins.reduce((sum, bin) => sum + (bin.metadata.confidence || 0), 0) / bins.length;
      qualityFactors.push({ factor: 'confidence_consistency', score: avgConfidence, weight: 0.1 });
      
      const totalScore = qualityFactors.reduce((sum, f) => sum + f.score * f.weight, 0);
      
      return {
        overall_quality: totalScore,
        quality_grade: totalScore >= 0.9 ? 'A+' :
                      totalScore >= 0.8 ? 'A' :
                      totalScore >= 0.7 ? 'B+' :
                      totalScore >= 0.6 ? 'B' : 'C',
        factor_breakdown: qualityFactors,
        recommendations: generateQualityRecommendations(qualityFactors)
      };
    };
    `
  }
};

// =====================================================
// 🔧 P1 구현을 위한 유틸리티 함수들
// =====================================================

export const UTILITY_FUNCTIONS = {
  // 시간창 파싱
  time_window_parser: `
  const parseMeasureTimeWindow = (timeWindow) => {
    // "2019-2024" 형태 파싱
    const [startYear, endYear] = timeWindow.split('-').map(Number);
    
    return {
      start_date: new Date(startYear, 0, 1),
      end_date: new Date(endYear, 11, 31),
      duration_months: (endYear - startYear + 1) * 12,
      duration_years: endYear - startYear + 1
    };
  };
  `,

  // 이벤트 연결
  event_linking: `
  const getEventsForYear = async (artistId, year) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const eventsSnapshot = await db.collection('events')
      .where('entity_participants', 'array-contains', artistId)
      .where('start_date', '>=', startDate)
      .where('start_date', '<=', endDate)
      .get();
      
    return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  `,

  // 성능 최적화
  batch_processing: `
  const processBatchWithPerformanceOptimization = async (artistIds, axis, batchSize = 10) => {
    const results = [];
    
    for (let i = 0; i < artistIds.length; i += batchSize) {
      const batch = artistIds.slice(i, i + batchSize);
      
      console.log(\`🔄 [Batch \${Math.floor(i/batchSize) + 1}] Processing \${batch.length} artists...\`);
      
      // 병렬 처리
      const batchPromises = batch.map(artistId => 
        generateArtistTimeseries(artistId, axis).catch(error => ({
          artist_id: artistId,
          error: error.message,
          success: false
        }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // 메모리 관리를 위한 잠시 대기
      if (i + batchSize < artistIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  };
  `
};

// =====================================================
// 📋 P1 구현 체크리스트 및 검증 기준
// =====================================================

export const P1_IMPLEMENTATION_CHECKLIST = {
  fnBatchNormalize_requirements: [
    '✅ measures 컬렉션에서 value_raw 일괄 조회',
    '✅ 3단계 정규화 파이프라인 정확 구현',
    '✅ value_normalized 필드 batch update',
    '✅ normalization_metadata 품질 정보 저장',
    '✅ 에러 처리 및 부분 성공 지원',
    '✅ Cloud Function 메모리/시간 제한 준수'
  ],

  fnBatchTimeseries_requirements: [
    '✅ 축별 시간창 규칙 정확 적용',
    '✅ 데뷔년 기준 상대 시간축 변환',
    '✅ 연도별 집계 및 이벤트 연결',
    '✅ 결측치 보간 및 품질 평가',
    '✅ timeseries 컬렉션 생성/업데이트',
    '✅ Dr. Sarah Kim 분석 메타데이터 포함'
  ],

  performance_targets: {
    processing_speed: '아티스트 1명당 < 2초',
    memory_efficiency: '< 512MB 사용',
    error_rate: '< 1% 실패율',
    data_quality: '> 95% 품질 점수'
  },

  validation_criteria: {
    mathematical_accuracy: 'Dr. Sarah Kim 수식 100% 정확 구현',
    specification_compliance: '1016blprint.md 명세 100% 준수',
    performance_requirement: '성능 목표 달성',
    error_robustness: '모든 예외 상황 안전 처리'
  }
};

export default {
  TIME_WINDOW_RULES,
  RELATIVE_TIME_AXIS_SYSTEM,  
  WEIGHTS_SYSTEM_SPECIFICATIONS,
  TIMESERIES_AGGREGATION_SPECS,
  INTERPOLATION_AND_QUALITY,
  UTILITY_FUNCTIONS,
  P1_IMPLEMENTATION_CHECKLIST
};

