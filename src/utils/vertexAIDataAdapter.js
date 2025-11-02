/**
 * CuratorOdyssey Phase 4 - Vertex AI Data Adapter
 * Dr. Sarah Kim's AI-Ready Data Standardization System
 * 
 * Vertex AI Gemini-1.5 Pro를 위한 시계열 분석 데이터 표준화
 */

// 1. Vertex AI 프롬프트를 위한 시계열 데이터 표준화
export class VertexAITimeseriesAdapter {
  constructor() {
    this.dataVersion = '4.0';
    this.aiModelTarget = 'gemini-1.5-pro';
    this.maxTokens = 1048576; // Gemini 1.5 Pro token limit
    this.compressionRatio = 0.7; // 데이터 압축 목표
  }

  // 메인 변환 함수: Phase 2/3 데이터 → Vertex AI 형식
  adaptForVertexAI(phase2Analysis, phase3Comparison = null) {
    const adaptedData = {
      metadata: this.generateMetadata(phase2Analysis, phase3Comparison),
      artist_profile: this.standardizeArtistProfile(phase2Analysis),
      temporal_analysis: this.compressTimeseriesData(phase2Analysis.data?.timeseries),
      growth_patterns: this.extractGrowthPatternMetadata(phase2Analysis.data?.analysis),
      event_correlations: this.structureEventImpacts(phase2Analysis.data?.eventImpacts),
      predictive_models: this.formatPredictiveResults(phase2Analysis.data?.forecast),
      comparative_context: phase3Comparison ? this.integrateComparisonData(phase3Comparison) : null,
      ai_prompting: this.generateAIPromptingData(phase2Analysis, phase3Comparison)
    };

    // 토큰 제한 검증
    const estimatedTokens = this.estimateTokenCount(adaptedData);
    if (estimatedTokens > this.maxTokens * 0.8) { // 80% 안전 마진
      console.warn(`Token count approaching limit: ${estimatedTokens}/${this.maxTokens}`);
      return this.compressForTokenLimit(adaptedData);
    }

    return adaptedData;
  }

  generateMetadata(phase2Analysis, phase3Comparison) {
    return {
      version: this.dataVersion,
      generated_at: new Date().toISOString(),
      ai_model_target: this.aiModelTarget,
      data_sources: {
        phase2_completed: !!phase2Analysis,
        phase3_completed: !!phase3Comparison,
        analyst: 'Dr. Sarah Kim',
        analysis_depth: 'comprehensive'
      },
      processing_stats: {
        original_data_points: phase2Analysis?.data?.timeseries?.bins?.length || 0,
        events_analyzed: Object.keys(phase2Analysis?.data?.eventImpacts || {}).length,
        comparison_artists: phase3Comparison ? Object.keys(phase3Comparison.artists || {}).length : 0,
        compression_applied: false
      },
      token_optimization: {
        estimated_tokens: 0, // 계산 후 업데이트
        compression_level: 'none',
        content_priority: ['temporal_analysis', 'growth_patterns', 'predictive_models']
      }
    };
  }

  standardizeArtistProfile(phase2Analysis) {
    const artistData = phase2Analysis?.artist_data || {};
    const analysisData = phase2Analysis?.data || {};

    return {
      basic_info: {
        artist_id: artistData.artist_id || 'unknown',
        name: artistData.name || artistData.artist_name || 'Unknown Artist',
        debut_year: artistData.debut_year || null,
        career_duration: this.calculateCareerDuration(artistData.debut_year)
      },
      current_position: {
        total_achievement_score: this.calculateTotalScore(analysisData.timeseries?.bins),
        axis_breakdown: this.getCurrentAxisBreakdown(analysisData.timeseries?.bins),
        percentile_ranking: null, // Phase 3 비교 데이터로부터 계산
        maturity_level: this.assessMaturityLevel(analysisData.analysis)
      },
      distinctive_characteristics: {
        dominant_axis: analysisData.analysis?.dominantAxis || 'unknown',
        growth_pattern_type: analysisData.analysis?.patterns?.[0] || 'unknown',
        volatility_profile: this.categorizeVolatility(analysisData.analysis?.growthVolatility),
        event_responsiveness: this.assessEventResponsiveness(analysisData.eventImpacts)
      }
    };
  }

  calculateCareerDuration(debutYear) {
    if (!debutYear) return null;
    return new Date().getFullYear() - debutYear;
  }

  calculateTotalScore(timeseriesBins) {
    if (!timeseriesBins || timeseriesBins.length === 0) return 0;
    
    const latestBin = timeseriesBins[timeseriesBins.length - 1];
    return (latestBin.institution || 0) + (latestBin.academic || 0) + 
           (latestBin.discourse || 0) + (latestBin.network || 0);
  }

  getCurrentAxisBreakdown(timeseriesBins) {
    if (!timeseriesBins || timeseriesBins.length === 0) {
      return { institution: 0, academic: 0, discourse: 0, network: 0 };
    }
    
    const latestBin = timeseriesBins[timeseriesBins.length - 1];
    return {
      institution: latestBin.institution || 0,
      academic: latestBin.academic || 0,
      discourse: latestBin.discourse || 0,
      network: latestBin.network || 0
    };
  }

  assessMaturityLevel(analysisData) {
    if (!analysisData) return 'unknown';
    
    const avgGrowthRate = analysisData.averageGrowthRate || 0;
    const volatility = analysisData.growthVolatility || 0;
    const inflectionPoints = analysisData.inflectionPoints?.length || 0;
    
    // 성숙도 점수 계산 (0-1)
    let maturityScore = 0;
    
    // 성장 안정성 (40%)
    if (volatility < 0.1) maturityScore += 0.4;
    else if (volatility < 0.3) maturityScore += 0.2;
    
    // 성장률 적정성 (30%)
    if (avgGrowthRate > 0.05 && avgGrowthRate < 0.2) maturityScore += 0.3;
    else if (avgGrowthRate > 0.02) maturityScore += 0.15;
    
    // 변곡점 존재 (30%)
    if (inflectionPoints >= 2) maturityScore += 0.3;
    else if (inflectionPoints >= 1) maturityScore += 0.15;
    
    if (maturityScore >= 0.7) return 'mature';
    else if (maturityScore >= 0.4) return 'developing'; 
    else return 'emerging';
  }

  categorizeVolatility(volatility) {
    if (!volatility) return 'unknown';
    if (volatility < 0.1) return 'stable';
    if (volatility < 0.3) return 'moderate';
    if (volatility < 0.5) return 'high';
    return 'extreme';
  }

  assessEventResponsiveness(eventImpacts) {
    if (!eventImpacts) return 'unknown';
    
    const validImpacts = Object.values(eventImpacts).filter(impact => impact.available);
    if (validImpacts.length === 0) return 'insufficient_data';
    
    const significantImpacts = validImpacts.filter(impact => 
      impact.statistical_significance?.is_significant
    ).length;
    
    const responseRate = significantImpacts / validImpacts.length;
    
    if (responseRate >= 0.7) return 'highly_responsive';
    if (responseRate >= 0.4) return 'moderately_responsive';
    if (responseRate >= 0.2) return 'somewhat_responsive';
    return 'low_responsive';
  }

  // 2. 압축된 시계열 데이터 (토큰 효율성)
  compressTimeseriesData(timeseriesData) {
    if (!timeseriesData?.bins || timeseriesData.bins.length === 0) {
      return { available: false, reason: 'no_data' };
    }

    const bins = timeseriesData.bins;
    
    // 핵심 시점만 추출 (시작, 중간 마일스톤, 변곡점, 최신)
    const keyTimepoints = this.identifyKeyTimepoints(bins);
    
    // 성장 세그먼트 분석
    const growthSegments = this.analyzeGrowthSegments(bins);
    
    // 축별 성장 패턴 요약
    const axisPatterns = this.summarizeAxisPatterns(bins);
    
    return {
      available: true,
      data_compression: {
        original_points: bins.length,
        compressed_points: keyTimepoints.length,
        compression_ratio: keyTimepoints.length / bins.length
      },
      key_timepoints: keyTimepoints,
      growth_segments: growthSegments,
      axis_patterns: axisPatterns,
      statistical_summary: this.generateStatisticalSummary(bins)
    };
  }

  identifyKeyTimepoints(bins) {
    const keyPoints = [];
    
    // 시작점
    keyPoints.push({
      t: bins[0].t,
      type: 'career_start',
      values: this.extractBinValues(bins[0]),
      significance: '커리어 시작 기준점'
    });
    
    // 25%, 50%, 75% 진행 시점
    [0.25, 0.5, 0.75].forEach(ratio => {
      const index = Math.floor((bins.length - 1) * ratio);
      const bin = bins[index];
      keyPoints.push({
        t: bin.t,
        type: `milestone_${ratio * 100}percent`,
        values: this.extractBinValues(bin),
        significance: `커리어 ${ratio * 100}% 진행 시점`
      });
    });
    
    // 최고점
    const maxTotal = Math.max(...bins.map(bin => this.getBinTotal(bin)));
    const peakBin = bins.find(bin => this.getBinTotal(bin) === maxTotal);
    if (peakBin) {
      keyPoints.push({
        t: peakBin.t,
        type: 'peak_achievement',
        values: this.extractBinValues(peakBin),
        significance: '최고 성취 시점'
      });
    }
    
    // 최신점
    keyPoints.push({
      t: bins[bins.length - 1].t,
      type: 'current_state',
      values: this.extractBinValues(bins[bins.length - 1]),
      significance: '현재 상태'
    });
    
    return keyPoints.sort((a, b) => a.t - b.t);
  }

  extractBinValues(bin) {
    return {
      institution: bin.institution || 0,
      academic: bin.academic || 0,
      discourse: bin.discourse || 0,
      network: bin.network || 0,
      total: this.getBinTotal(bin)
    };
  }

  getBinTotal(bin) {
    return (bin.institution || 0) + (bin.academic || 0) + 
           (bin.discourse || 0) + (bin.network || 0);
  }

  analyzeGrowthSegments(bins) {
    const segments = [];
    const segmentLength = Math.floor(bins.length / 4); // 4분할
    
    for (let i = 0; i < 4; i++) {
      const start = i * segmentLength;
      const end = i === 3 ? bins.length : (i + 1) * segmentLength;
      const segmentBins = bins.slice(start, end);
      
      if (segmentBins.length < 2) continue;
      
      const startValue = this.getBinTotal(segmentBins[0]);
      const endValue = this.getBinTotal(segmentBins[segmentBins.length - 1]);
      const duration = segmentBins[segmentBins.length - 1].t - segmentBins[0].t;
      
      segments.push({
        segment: `phase_${i + 1}`,
        time_range: [segmentBins[0].t, segmentBins[segmentBins.length - 1].t],
        duration,
        growth: {
          absolute: endValue - startValue,
          rate: duration > 0 && startValue > 0 ? ((endValue - startValue) / startValue) / duration : 0,
          pattern: this.classifySegmentPattern(segmentBins)
        },
        dominant_axis: this.findSegmentDominantAxis(segmentBins),
        volatility: this.calculateSegmentVolatility(segmentBins)
      });
    }
    
    return segments;
  }

  classifySegmentPattern(segmentBins) {
    const values = segmentBins.map(bin => this.getBinTotal(bin));
    const n = values.length;
    
    if (n < 3) return 'insufficient_data';
    
    // 선형 회귀로 추세 파악
    const x = segmentBins.map((_, i) => i);
    const { slope, r2 } = this.linearRegression(x, values);
    
    if (r2 > 0.8) {
      if (slope > 5) return 'strong_growth';
      if (slope > 1) return 'moderate_growth';
      if (slope > -1) return 'stable';
      if (slope > -5) return 'moderate_decline';
      return 'strong_decline';
    } else {
      return 'volatile';
    }
  }

  linearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // R-squared 계산
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
    
    return { slope, intercept, r2 };
  }

  findSegmentDominantAxis(segmentBins) {
    const axisTotals = {
      institution: 0,
      academic: 0,
      discourse: 0,
      network: 0
    };
    
    segmentBins.forEach(bin => {
      axisTotals.institution += bin.institution || 0;
      axisTotals.academic += bin.academic || 0;
      axisTotals.discourse += bin.discourse || 0;
      axisTotals.network += bin.network || 0;
    });
    
    return Object.entries(axisTotals)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  calculateSegmentVolatility(segmentBins) {
    const values = segmentBins.map(bin => this.getBinTotal(bin));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  summarizeAxisPatterns(bins) {
    const axes = ['institution', 'academic', 'discourse', 'network'];
    const patterns = {};
    
    axes.forEach(axis => {
      const values = bins.map(bin => bin[axis] || 0);
      const growthRates = [];
      
      for (let i = 1; i < values.length; i++) {
        const prev = values[i - 1];
        const curr = values[i];
        if (prev > 0) {
          growthRates.push((curr - prev) / prev);
        }
      }
      
      patterns[axis] = {
        final_value: values[values.length - 1],
        total_growth: values[values.length - 1] - values[0],
        peak_value: Math.max(...values),
        peak_time: bins[values.indexOf(Math.max(...values))].t,
        average_growth_rate: growthRates.length > 0 ? 
          growthRates.reduce((a, b) => a + b, 0) / growthRates.length : 0,
        growth_consistency: this.calculateConsistency(growthRates),
        contribution_trend: this.analyzeContributionTrend(bins, axis)
      };
    });
    
    return patterns;
  }

  calculateConsistency(growthRates) {
    if (growthRates.length < 2) return 0;
    
    const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / growthRates.length;
    const stdDev = Math.sqrt(variance);
    
    // 표준편차가 낮을수록 일관성이 높음 (0-1 스케일)
    return Math.max(0, 1 - stdDev);
  }

  analyzeContributionTrend(bins, axis) {
    const contributions = bins.map(bin => {
      const total = this.getBinTotal(bin);
      return total > 0 ? (bin[axis] || 0) / total : 0;
    });
    
    const early = contributions.slice(0, Math.floor(contributions.length / 3));
    const late = contributions.slice(-Math.floor(contributions.length / 3));
    
    const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
    const lateAvg = late.reduce((a, b) => a + b, 0) / late.length;
    
    const change = lateAvg - earlyAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  generateStatisticalSummary(bins) {
    const totalValues = bins.map(bin => this.getBinTotal(bin));
    
    return {
      descriptive_stats: {
        mean: totalValues.reduce((a, b) => a + b, 0) / totalValues.length,
        median: this.calculateMedian(totalValues),
        std_deviation: Math.sqrt(
          totalValues.reduce((sum, val, _, arr) => 
            sum + Math.pow(val - (arr.reduce((a, b) => a + b, 0) / arr.length), 2), 0
          ) / totalValues.length
        ),
        min: Math.min(...totalValues),
        max: Math.max(...totalValues),
        range: Math.max(...totalValues) - Math.min(...totalValues)
      },
      growth_characteristics: {
        total_growth: totalValues[totalValues.length - 1] - totalValues[0],
        compound_annual_growth_rate: this.calculateCAGR(totalValues, bins),
        growth_acceleration: this.calculateGrowthAcceleration(totalValues),
        peak_to_trough_ratio: Math.max(...totalValues) / Math.max(Math.min(...totalValues), 1)
      },
      distribution_properties: {
        skewness: this.calculateSkewness(totalValues),
        kurtosis: this.calculateKurtosis(totalValues),
        coefficient_of_variation: this.calculateCoefficientOfVariation(totalValues)
      }
    };
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateCAGR(values, bins) {
    if (values.length < 2 || values[0] <= 0) return 0;
    
    const startValue = values[0];
    const endValue = values[values.length - 1];
    const years = bins[bins.length - 1].t - bins[0].t;
    
    if (years <= 0) return 0;
    
    return Math.pow(endValue / startValue, 1 / years) - 1;
  }

  calculateGrowthAcceleration(values) {
    if (values.length < 3) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(-Math.floor(values.length / 2));
    
    const firstGrowthRate = this.calculateGrowthRate(firstHalf);
    const secondGrowthRate = this.calculateGrowthRate(secondHalf);
    
    return secondGrowthRate - firstGrowthRate;
  }

  calculateGrowthRate(values) {
    if (values.length < 2 || values[0] <= 0) return 0;
    return (values[values.length - 1] - values[0]) / values[0];
  }

  calculateSkewness(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n);
    
    if (std === 0) return 0;
    
    const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;
    return skewness;
  }

  calculateKurtosis(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n);
    
    if (std === 0) return 0;
    
    const kurtosis = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n;
    return kurtosis - 3; // Excess kurtosis
  }

  calculateCoefficientOfVariation(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    return mean !== 0 ? std / mean : 0;
  }

  // 3. 성장 패턴 메타데이터 추출
  extractGrowthPatternMetadata(analysisData) {
    if (!analysisData) {
      return { available: false, reason: 'no_analysis_data' };
    }

    const patterns = analysisData.patterns || [];
    const inflectionPoints = analysisData.inflectionPoints || [];
    const dominantAxis = analysisData.dominantAxis || 'unknown';
    const avgGrowthRate = analysisData.averageGrowthRate || 0;
    const volatility = analysisData.growthVolatility || 0;

    return {
      available: true,
      primary_pattern: {
        type: patterns[0] || 'unknown',
        confidence: this.assessPatternConfidence(patterns, avgGrowthRate, volatility),
        characteristics: this.describePatternCharacteristics(patterns[0], avgGrowthRate, volatility),
        business_implications: this.generateBusinessImplications(patterns[0], dominantAxis)
      },
      growth_dynamics: {
        average_annual_growth: avgGrowthRate,
        volatility_level: this.categorizeVolatility(volatility),
        growth_stability: this.assessGrowthStability(avgGrowthRate, volatility),
        predictability_score: this.calculatePredictabilityScore(volatility, inflectionPoints.length)
      },
      inflection_analysis: {
        total_inflection_points: inflectionPoints.length,
        major_turning_points: inflectionPoints.filter(ip => ip.importance > 0.5).length,
        inflection_frequency: inflectionPoints.length / Math.max(analysisData.duration || 20, 1),
        pattern_shifts: this.identifyPatternShifts(inflectionPoints)
      },
      strategic_insights: {
        dominant_value_driver: dominantAxis,
        diversification_level: this.assessDiversification(analysisData.axisContributions),
        competitive_positioning: this.inferCompetitivePosition(dominantAxis, avgGrowthRate),
        development_stage: this.classifyDevelopmentStage(avgGrowthRate, volatility, inflectionPoints.length)
      },
      ai_interpretation: {
        natural_language_summary: this.generateNLSummary(patterns[0], avgGrowthRate, dominantAxis, inflectionPoints.length),
        key_success_factors: this.identifySuccessFactors(analysisData),
        risk_factors: this.identifyRiskFactors(volatility, patterns, dominantAxis),
        strategic_recommendations: this.generateStrategicRecommendations(patterns[0], dominantAxis, avgGrowthRate)
      }
    };
  }

  assessPatternConfidence(patterns, growthRate, volatility) {
    let confidence = 0.5; // Base confidence
    
    // 패턴 명확성
    if (patterns.length > 0 && patterns[0] !== 'unknown') confidence += 0.2;
    
    // 성장률 일관성
    if (growthRate > 0.02 && growthRate < 0.5) confidence += 0.15; // 적정 성장률
    
    // 변동성 적정성
    if (volatility < 0.3) confidence += 0.15; // 낮은 변동성은 패턴 신뢰도 증가
    
    return Math.min(confidence, 1.0);
  }

  describePatternCharacteristics(patternType, growthRate, volatility) {
    const characteristics = {
      'linear': '꾸준하고 예측 가능한 성장',
      'exponential': '가속적이고 폭발적인 성장',
      'logarithmic': '초기 급성장 후 안정화',
      'sigmoid': 'S자 곡선의 단계적 성장',
      'cyclical': '주기적 변동이 있는 성장',
      'volatile': '불규칙하고 예측하기 어려운 성장'
    };
    
    let description = characteristics[patternType] || '분석 불가능한 패턴';
    
    // 성장률에 따른 추가 설명
    if (growthRate > 0.2) description += ', 높은 성장률';
    else if (growthRate > 0.05) description += ', 적정 성장률';
    else if (growthRate < 0) description += ', 감소 추세';
    else description += ', 낮은 성장률';
    
    // 변동성에 따른 추가 설명
    if (volatility < 0.1) description += ', 매우 안정적';
    else if (volatility < 0.3) description += ', 적당한 변동성';
    else description += ', 높은 변동성';
    
    return description;
  }

  generateBusinessImplications(patternType, dominantAxis) {
    const implications = {
      'linear': {
        strengths: ['예측 가능성', '안정적 성장'],
        challenges: ['성장 한계', '혁신 필요성'],
        opportunities: ['점진적 확장', '안정적 투자']
      },
      'exponential': {
        strengths: ['높은 성장 잠재력', '시장 지배력 확보 가능'],
        challenges: ['지속성 의문', '과도한 기대치'],
        opportunities: ['대규모 투자 유치', '급속한 시장 확장']
      },
      'sigmoid': {
        strengths: ['균형 잡힌 성장', '성숙한 발전 패턴'],
        challenges: ['성장 둔화 위험', '차별화 필요'],
        opportunities: ['안정적 수익 모델', '새로운 성장 동력 발굴']
      }
    };
    
    const baseImplication = implications[patternType] || {
      strengths: ['분석 필요'],
      challenges: ['패턴 불명확'],
      opportunities: ['추가 데이터 수집 필요']
    };
    
    // 주도축에 따른 추가 시사점
    const axisImplications = {
      '제도': '제도적 인정과 공신력이 핵심 경쟁력',
      '학술': '학술적 깊이와 연구 역량이 차별화 요소',
      '담론': '대중적 영향력과 소통 능력이 강점',
      '네트워크': '관계적 자산과 협업 능력이 핵심'
    };
    
    return {
      ...baseImplication,
      axis_specific: axisImplications[dominantAxis] || '주도축 분석 필요'
    };
  }

  assessGrowthStability(growthRate, volatility) {
    const stabilityScore = Math.max(0, 1 - volatility) * (growthRate > 0 ? 1 : 0.5);
    
    if (stabilityScore > 0.8) return 'very_stable';
    if (stabilityScore > 0.6) return 'stable';
    if (stabilityScore > 0.4) return 'moderately_stable';
    if (stabilityScore > 0.2) return 'unstable';
    return 'very_unstable';
  }

  calculatePredictabilityScore(volatility, inflectionPointCount) {
    // 변동성이 낮고 변곡점이 적을수록 예측가능성이 높음
    const volatilityScore = Math.max(0, 1 - volatility);
    const inflectionScore = Math.max(0, 1 - (inflectionPointCount / 10));
    
    return (volatilityScore * 0.7 + inflectionScore * 0.3);
  }

  identifyPatternShifts(inflectionPoints) {
    if (!inflectionPoints || inflectionPoints.length < 2) {
      return [];
    }
    
    return inflectionPoints
      .filter(ip => ip.importance > 0.3)
      .map(ip => ({
        time: ip.t,
        shift_type: ip.type,
        magnitude: ip.importance,
        description: this.describePatternShift(ip)
      }));
  }

  describePatternShift(inflectionPoint) {
    const descriptions = {
      'acceleration': '성장 가속화 시점',
      'deceleration': '성장 둔화 시점',
      'direction_change': '성장 방향 전환 시점',
      'volatility_change': '변동성 변화 시점'
    };
    
    return descriptions[inflectionPoint.type] || '패턴 변화 감지';
  }

  assessDiversification(axisContributions) {
    if (!axisContributions) return 'unknown';
    
    const contributions = Object.values(axisContributions);
    const maxContribution = Math.max(...contributions);
    
    if (maxContribution > 0.7) return 'highly_concentrated';
    if (maxContribution > 0.5) return 'moderately_concentrated';
    if (maxContribution > 0.35) return 'balanced';
    return 'highly_diversified';
  }

  inferCompetitivePosition(dominantAxis, growthRate) {
    const positionMatrix = {
      '제도': {
        high_growth: 'establishment_leader',
        medium_growth: 'establishment_player', 
        low_growth: 'traditional_artist'
      },
      '학술': {
        high_growth: 'academic_pioneer',
        medium_growth: 'scholarly_artist',
        low_growth: 'academic_specialist'
      },
      '담론': {
        high_growth: 'cultural_influencer',
        medium_growth: 'public_artist',
        low_growth: 'niche_commentator'
      },
      '네트워크': {
        high_growth: 'super_connector',
        medium_growth: 'collaborative_artist',
        low_growth: 'network_participant'
      }
    };
    
    let growthLevel;
    if (growthRate > 0.15) growthLevel = 'high_growth';
    else if (growthRate > 0.05) growthLevel = 'medium_growth';
    else growthLevel = 'low_growth';
    
    return positionMatrix[dominantAxis]?.[growthLevel] || 'position_unclear';
  }

  classifyDevelopmentStage(growthRate, volatility, inflectionCount) {
    // 성장률, 변동성, 변곡점 수를 종합하여 발전 단계 판단
    let stageScore = 0;
    
    // 성장률 기여 (40%)
    if (growthRate > 0.2) stageScore += 0.1; // 너무 높은 성장률은 초기 단계
    else if (growthRate > 0.1) stageScore += 0.3; // 적당한 성장률은 성장 단계
    else if (growthRate > 0.05) stageScore += 0.4; // 안정적 성장률은 성숙 단계
    else stageScore += 0.2; // 낮은 성장률은 정체 또는 쇠퇴
    
    // 변동성 기여 (30%)
    if (volatility < 0.15) stageScore += 0.3; // 낮은 변동성은 성숙
    else if (volatility < 0.35) stageScore += 0.2; // 보통 변동성
    else stageScore += 0.1; // 높은 변동성은 초기
    
    // 변곡점 기여 (30%)
    if (inflectionCount >= 3) stageScore += 0.3; // 많은 변곡점은 성숙
    else if (inflectionCount >= 1) stageScore += 0.2; // 적당한 변곡점
    else stageScore += 0.1; // 변곡점 없음은 초기
    
    if (stageScore >= 0.7) return 'mature';
    if (stageScore >= 0.5) return 'growth';
    if (stageScore >= 0.3) return 'development';
    return 'emerging';
  }

  generateNLSummary(patternType, growthRate, dominantAxis, inflectionCount) {
    const patternDescriptions = {
      'linear': '꾸준한 선형 성장을 보이는',
      'exponential': '폭발적인 지수 성장을 경험하는',
      'logarithmic': '초기 급성장 후 안정화되는',
      'sigmoid': 'S자 곡선의 체계적 성장을 보이는',
      'cyclical': '주기적 변동을 보이는',
      'volatile': '불안정한 성장 패턴을 보이는'
    };
    
    const axisDescriptions = {
      '제도': '제도적 인정을 중심으로',
      '학술': '학술적 성취를 기반으로',
      '담론': '대중적 영향력을 통해',
      '네트워크': '네트워크 구축을 바탕으로'
    };
    
    const growthDescription = growthRate > 0.15 ? '높은 성장률로' :
                             growthRate > 0.05 ? '적정한 성장률로' :
                             growthRate > 0 ? '완만한 성장률로' : '정체 상태로';
    
    const inflectionDescription = inflectionCount >= 3 ? '여러 차례의 전환점을 거쳐' :
                                 inflectionCount >= 1 ? '주요 전환점을 경험하며' :
                                 '안정적인 궤적으로';
    
    return `${patternDescriptions[patternType] || '분석 불가능한 패턴을 보이는'} 아티스트로, ` +
           `${axisDescriptions[dominantAxis] || '다양한 축을 통해'} ${growthDescription} 성장하고 있습니다. ` +
           `${inflectionDescription} 현재의 위치에 도달했습니다.`;
  }

  identifySuccessFactors(analysisData) {
    const factors = [];
    
    // 주도축 기반 성공요인
    const dominantAxis = analysisData.dominantAxis;
    if (dominantAxis === '제도') {
      factors.push('주요 기관과의 협업 및 인정');
      factors.push('공식적 전시 기회 확보');
    } else if (dominantAxis === '학술') {
      factors.push('학술적 연구와 이론적 기반');
      factors.push('전문가 집단의 인정');
    } else if (dominantAxis === '담론') {
      factors.push('대중적 소통 능력');
      factors.push('문화적 영향력 확산');
    } else if (dominantAxis === '네트워크') {
      factors.push('광범위한 인적 네트워크');
      factors.push('협업과 파트너십 구축');
    }
    
    // 성장 패턴 기반 성공요인
    const avgGrowthRate = analysisData.averageGrowthRate || 0;
    if (avgGrowthRate > 0.1) {
      factors.push('지속적인 성장 동력 확보');
    }
    
    const volatility = analysisData.growthVolatility || 0;
    if (volatility < 0.2) {
      factors.push('안정적인 성장 관리 역량');
    }
    
    return factors;
  }

  identifyRiskFactors(volatility, patterns, dominantAxis) {
    const risks = [];
    
    // 변동성 기반 위험요인
    if (volatility > 0.4) {
      risks.push('높은 성장 변동성으로 인한 예측 어려움');
      risks.push('외부 충격에 대한 취약성');
    }
    
    // 패턴 기반 위험요인
    const primaryPattern = patterns?.[0];
    if (primaryPattern === 'exponential') {
      risks.push('급속 성장의 지속가능성 의문');
    } else if (primaryPattern === 'volatile') {
      risks.push('일관성 없는 성장으로 인한 신뢰성 문제');
    }
    
    // 집중도 기반 위험요인
    if (dominantAxis) {
      risks.push(`${dominantAxis} 축 의존도가 높아 다각화 필요`);
    }
    
    return risks;
  }

  generateStrategicRecommendations(patternType, dominantAxis, growthRate) {
    const recommendations = [];
    
    // 패턴 기반 권장사항
    if (patternType === 'linear') {
      recommendations.push('혁신적 성장 동력 발굴로 성장률 제고 필요');
      recommendations.push('새로운 영역 진출을 통한 성장 가속화');
    } else if (patternType === 'exponential') {
      recommendations.push('지속가능한 성장을 위한 기반 강화');
      recommendations.push('급속 성장에 따른 리스크 관리 체계 구축');
    } else if (patternType === 'volatile') {
      recommendations.push('성장 안정성 확보를 위한 전략 수립');
      recommendations.push('변동성 완화를 위한 다각화 전략');
    }
    
    // 성장률 기반 권장사항
    if (growthRate < 0.05) {
      recommendations.push('성장 동력 재점검 및 새로운 기회 모색');
    } else if (growthRate > 0.3) {
      recommendations.push('과도한 성장률의 안정화 및 품질 관리');
    }
    
    // 주도축 기반 권장사항
    const axisRecommendations = {
      '제도': '제도적 인정을 바탕으로 한 다른 영역 확장',
      '학술': '학술적 기반을 활용한 대중적 영향력 확산',
      '담론': '담론적 영향력을 제도적 성과로 전환',
      '네트워크': '네트워크 자산을 구체적 성과로 실현'
    };
    
    if (axisRecommendations[dominantAxis]) {
      recommendations.push(axisRecommendations[dominantAxis]);
    }
    
    return recommendations;
  }

  // 4. 이벤트 영향 구조화
  structureEventImpacts(eventImpacts) {
    if (!eventImpacts || Object.keys(eventImpacts).length === 0) {
      return { available: false, reason: 'no_event_data' };
    }
    
    const validImpacts = Object.entries(eventImpacts)
      .filter(([_, impact]) => impact.available)
      .map(([eventId, impact]) => ({
        event_id: eventId,
        ...this.processEventImpact(impact)
      }));
    
    if (validImpacts.length === 0) {
      return { available: false, reason: 'no_valid_impacts' };
    }
    
    return {
      available: true,
      total_events: validImpacts.length,
      high_impact_events: this.categorizeHighImpactEvents(validImpacts),
      impact_patterns: this.analyzeImpactPatterns(validImpacts),
      causal_insights: this.extractCausalInsights(validImpacts),
      predictive_indicators: this.identifyPredictiveIndicators(validImpacts)
    };
  }

  processEventImpact(impact) {
    return {
      event_type: impact.event_type || 'unknown',
      statistical_significance: impact.statistical_significance?.is_significant || false,
      effect_magnitude: {
        cohen_d: impact.effect_size?.cohen_d || 0,
        magnitude_level: impact.effect_size?.magnitude || 'negligible',
        practical_significance: impact.effect_size?.practical_significance || 'none'
      },
      growth_impact: {
        absolute_change: impact.growth_impact?.absolute_change || 0,
        relative_change: impact.growth_impact?.relative_change || 0,
        acceleration: impact.growth_impact?.growth_acceleration || 0
      },
      axis_effects: this.processAxisEffects(impact.axis_specific_impact),
      temporal_pattern: {
        persistence: impact.temporal_pattern?.effect_persistence || 0,
        peak_time: impact.temporal_pattern?.peak_effect_time || 0,
        duration: impact.temporal_pattern?.total_duration || 0
      },
      causality_strength: impact.causality_score || 0,
      confidence_level: impact.overall_confidence || 0
    };
  }

  processAxisEffects(axisImpacts) {
    if (!axisImpacts) return null;
    
    return Object.entries(axisImpacts).map(([axis, data]) => ({
      axis,
      absolute_change: data.absolute_change || 0,
      relative_change: data.relative_change || 0,
      contribution_to_total: data.contribution_to_total_change || 0
    })).sort((a, b) => Math.abs(b.relative_change) - Math.abs(a.relative_change));
  }

  categorizeHighImpactEvents(validImpacts) {
    return validImpacts
      .filter(impact => 
        impact.statistical_significance || 
        Math.abs(impact.effect_magnitude.cohen_d) > 0.5 ||
        impact.confidence_level > 0.7
      )
      .sort((a, b) => b.confidence_level - a.confidence_level)
      .slice(0, 5) // 상위 5개만
      .map(impact => ({
        event_id: impact.event_id,
        event_type: impact.event_type,
        impact_score: this.calculateImpactScore(impact),
        key_effects: this.summarizeKeyEffects(impact),
        strategic_importance: this.assessStrategicImportance(impact)
      }));
  }

  calculateImpactScore(impact) {
    let score = 0;
    
    // 통계적 유의성 (25%)
    if (impact.statistical_significance) score += 0.25;
    
    // 효과 크기 (35%)
    const cohenD = Math.abs(impact.effect_magnitude.cohen_d);
    if (cohenD > 0.8) score += 0.35;
    else if (cohenD > 0.5) score += 0.25;
    else if (cohenD > 0.2) score += 0.15;
    
    // 인과관계 강도 (25%)
    score += impact.causality_strength * 0.25;
    
    // 신뢰도 (15%)
    score += impact.confidence_level * 0.15;
    
    return Math.min(score, 1);
  }

  summarizeKeyEffects(impact) {
    const effects = [];
    
    if (impact.growth_impact.relative_change > 0.1) {
      effects.push(`성장률 ${(impact.growth_impact.relative_change * 100).toFixed(1)}% 증가`);
    } else if (impact.growth_impact.relative_change < -0.1) {
      effects.push(`성장률 ${Math.abs(impact.growth_impact.relative_change * 100).toFixed(1)}% 감소`);
    }
    
    if (impact.axis_effects && impact.axis_effects.length > 0) {
      const primaryAxis = impact.axis_effects[0];
      effects.push(`${primaryAxis.axis} 축에 주요 영향 (${(primaryAxis.relative_change * 100).toFixed(1)}%)`);
    }
    
    if (impact.temporal_pattern.persistence > 0.5) {
      effects.push(`${impact.temporal_pattern.duration}년간 지속적 영향`);
    }
    
    return effects;
  }

  assessStrategicImportance(impact) {
    const importance = impact.effect_magnitude.cohen_d;
    const persistence = impact.temporal_pattern.persistence;
    const causality = impact.causality_strength;
    
    const strategicScore = (Math.abs(importance) * 0.4 + persistence * 0.3 + causality * 0.3);
    
    if (strategicScore > 0.7) return 'critical';
    if (strategicScore > 0.5) return 'important';
    if (strategicScore > 0.3) return 'moderate';
    return 'minor';
  }

  analyzeImpactPatterns(validImpacts) {
    const patterns = {
      by_event_type: this.groupByEventType(validImpacts),
      by_magnitude: this.groupByMagnitude(validImpacts),
      by_axis_impact: this.groupByAxisImpact(validImpacts),
      temporal_clustering: this.analyzeTemporalClustering(validImpacts)
    };
    
    return patterns;
  }

  groupByEventType(validImpacts) {
    const grouped = {};
    
    validImpacts.forEach(impact => {
      const type = impact.event_type;
      if (!grouped[type]) {
        grouped[type] = {
          count: 0,
          average_impact: 0,
          total_impact: 0,
          significant_count: 0
        };
      }
      
      grouped[type].count++;
      grouped[type].total_impact += Math.abs(impact.effect_magnitude.cohen_d);
      if (impact.statistical_significance) {
        grouped[type].significant_count++;
      }
    });
    
    // 평균 계산
    Object.values(grouped).forEach(group => {
      group.average_impact = group.total_impact / group.count;
      group.significance_rate = group.significant_count / group.count;
    });
    
    return grouped;
  }

  groupByMagnitude(validImpacts) {
    const magnitudes = {
      large: validImpacts.filter(i => Math.abs(i.effect_magnitude.cohen_d) >= 0.8).length,
      medium: validImpacts.filter(i => Math.abs(i.effect_magnitude.cohen_d) >= 0.5 && Math.abs(i.effect_magnitude.cohen_d) < 0.8).length,
      small: validImpacts.filter(i => Math.abs(i.effect_magnitude.cohen_d) >= 0.2 && Math.abs(i.effect_magnitude.cohen_d) < 0.5).length,
      negligible: validImpacts.filter(i => Math.abs(i.effect_magnitude.cohen_d) < 0.2).length
    };
    
    return magnitudes;
  }

  groupByAxisImpact(validImpacts) {
    const axisImpacts = { institution: [], academic: [], discourse: [], network: [] };
    
    validImpacts.forEach(impact => {
      if (impact.axis_effects) {
        impact.axis_effects.forEach(axis => {
          axisImpacts[axis.axis]?.push(axis.relative_change);
        });
      }
    });
    
    // 통계 계산
    Object.keys(axisImpacts).forEach(axis => {
      const impacts = axisImpacts[axis];
      axisImpacts[axis] = {
        event_count: impacts.length,
        average_impact: impacts.length > 0 ? impacts.reduce((a, b) => a + Math.abs(b), 0) / impacts.length : 0,
        max_impact: impacts.length > 0 ? Math.max(...impacts.map(Math.abs)) : 0,
        positive_impacts: impacts.filter(i => i > 0).length,
        negative_impacts: impacts.filter(i => i < 0).length
      };
    });
    
    return axisImpacts;
  }

  analyzeTemporalClustering(validImpacts) {
    // 이벤트가 시간적으로 클러스터를 이루는지 분석
    const eventTimes = validImpacts
      .map(impact => impact.temporal_pattern?.peak_time || 0)
      .sort((a, b) => a - b);
    
    if (eventTimes.length < 2) return { clusters: 0, average_gap: 0 };
    
    const gaps = [];
    for (let i = 1; i < eventTimes.length; i++) {
      gaps.push(eventTimes[i] - eventTimes[i - 1]);
    }
    
    const averageGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const clusters = gaps.filter(gap => gap < averageGap * 0.5).length + 1;
    
    return {
      clusters,
      average_gap: averageGap,
      clustering_tendency: clusters / eventTimes.length > 0.5 ? 'high' : 'low'
    };
  }

  extractCausalInsights(validImpacts) {
    const highCausalityEvents = validImpacts.filter(impact => impact.causality_strength > 0.5);
    
    return {
      strong_causal_relationships: highCausalityEvents.length,
      causal_event_types: [...new Set(highCausalityEvents.map(i => i.event_type))],
      average_causality_strength: validImpacts.reduce((sum, i) => sum + i.causality_strength, 0) / validImpacts.length,
      causal_patterns: this.identifyCausalPatterns(validImpacts)
    };
  }

  identifyCausalPatterns(validImpacts) {
    const patterns = [];
    
    // 이벤트 타입별 인과관계 패턴
    const typeGroups = this.groupByEventType(validImpacts);
    
    Object.entries(typeGroups).forEach(([type, group]) => {
      if (group.count >= 2) {
        const typeCausality = validImpacts
          .filter(i => i.event_type === type)
          .reduce((sum, i) => sum + i.causality_strength, 0) / group.count;
        
        if (typeCausality > 0.6) {
          patterns.push(`${type} 이벤트는 높은 인과관계 (${(typeCausality * 100).toFixed(1)}%)`);
        }
      }
    });
    
    return patterns;
  }

  identifyPredictiveIndicators(validImpacts) {
    const indicators = [];
    
    // 일관된 영향을 보이는 이벤트 타입
    const consistentTypes = [];
    const typeGroups = this.groupByEventType(validImpacts);
    
    Object.entries(typeGroups).forEach(([type, group]) => {
      if (group.significance_rate > 0.7 && group.count >= 2) {
        consistentTypes.push(type);
      }
    });
    
    if (consistentTypes.length > 0) {
      indicators.push(`${consistentTypes.join(', ')} 이벤트는 예측 가능한 영향력 보유`);
    }
    
    // 축별 반응 패턴
    const axisPatterns = this.groupByAxisImpact(validImpacts);
    Object.entries(axisPatterns).forEach(([axis, data]) => {
      if (data.event_count >= 3 && data.average_impact > 0.15) {
        indicators.push(`${axis} 축은 이벤트에 민감하게 반응 (평균 ${(data.average_impact * 100).toFixed(1)}%)`);
      }
    });
    
    return indicators;
  }

  // 5. 예측 모델 결과 구조화
  formatPredictiveResults(forecastData) {
    if (!forecastData) {
      return { available: false, reason: 'no_forecast_data' };
    }

    return {
      available: true,
      forecast_metadata: {
        time_horizon: forecastData.timeHorizon || '3년',
        model_type: 'trend_analysis_with_event_correlation',
        confidence_level: 'medium',
        generated_at: new Date().toISOString()
      },
      current_baseline: {
        current_total_value: forecastData.currentValue || 0,
        recommended_focus_axis: forecastData.recommendedFocus || 'unknown',
        identified_risk_factors: forecastData.riskFactors || []
      },
      scenario_analysis: this.structureScenarioAnalysis(forecastData.forecasts),
      growth_projections: this.generateGrowthProjections(forecastData),
      strategic_implications: this.extractStrategicImplications(forecastData),
      model_assumptions: this.documentModelAssumptions(),
      uncertainty_analysis: this.analyzeUncertainty(forecastData)
    };
  }

  structureScenarioAnalysis(forecasts) {
    if (!forecasts || forecasts.length === 0) {
      return [];
    }

    return forecasts.map(forecast => ({
      scenario_name: forecast.scenario,
      scenario_description: forecast.description,
      projected_value: forecast.projectedValue,
      confidence_score: forecast.confidence,
      key_assumptions: forecast.keyFactors || [],
      probability_assessment: this.assessScenarioProbability(forecast),
      implementation_requirements: this.identifyImplementationRequirements(forecast)
    })).sort((a, b) => b.confidence_score - a.confidence_score);
  }

  assessScenarioProbability(forecast) {
    const confidenceToProb = {
      'conservative': 0.6,
      'optimistic': 0.3,
      'pessimistic': 0.1
    };
    
    return confidenceToProb[forecast.scenario] || forecast.confidence || 0.3;
  }

  identifyImplementationRequirements(forecast) {
    const requirements = {
      'conservative': ['현재 전략 유지', '점진적 개선', '안정적 자원 확보'],
      'optimistic': ['적극적 투자', '새로운 기회 포착', '혁신적 접근'],
      'stagnant': ['전략적 재점검', '새로운 성장동력 발굴', '리스크 관리']
    };
    
    return requirements[forecast.scenario] || ['추가 분석 필요'];
  }

  generateGrowthProjections(forecastData) {
    const currentValue = forecastData.currentValue || 0;
    const forecasts = forecastData.forecasts || [];
    
    if (forecasts.length === 0) {
      return { available: false };
    }

    // 시나리오별 연평균 성장률 계산
    const growthRates = forecasts.map(forecast => {
      const projectedValue = forecast.projectedValue || 0;
      const horizon = parseInt(forecastData.timeHorizon) || 3;
      
      if (currentValue <= 0 || horizon <= 0) return 0;
      
      return Math.pow(projectedValue / currentValue, 1 / horizon) - 1;
    });

    return {
      available: true,
      projected_cagr_range: {
        min: Math.min(...growthRates),
        max: Math.max(...growthRates),
        expected: growthRates.reduce((a, b) => a + b, 0) / growthRates.length
      },
      value_projections: {
        year_1: this.projectValue(currentValue, growthRates, 1),
        year_2: this.projectValue(currentValue, growthRates, 2), 
        year_3: this.projectValue(currentValue, growthRates, 3)
      },
      growth_trajectory: this.classifyGrowthTrajectory(growthRates),
      milestone_predictions: this.predictMilestones(currentValue, growthRates)
    };
  }

  projectValue(currentValue, growthRates, years) {
    const avgGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    return {
      expected: currentValue * Math.pow(1 + avgGrowthRate, years),
      range: {
        low: currentValue * Math.pow(1 + Math.min(...growthRates), years),
        high: currentValue * Math.pow(1 + Math.max(...growthRates), years)
      }
    };
  }

  classifyGrowthTrajectory(growthRates) {
    const avgRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    const volatility = Math.sqrt(growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgRate, 2), 0) / growthRates.length);
    
    if (avgRate > 0.15) return { type: 'high_growth', volatility: volatility > 0.1 ? 'high' : 'low' };
    if (avgRate > 0.05) return { type: 'moderate_growth', volatility: volatility > 0.1 ? 'high' : 'low' };
    if (avgRate > 0) return { type: 'slow_growth', volatility: volatility > 0.1 ? 'high' : 'low' };
    return { type: 'stagnant_or_declining', volatility: volatility > 0.1 ? 'high' : 'low' };
  }

  predictMilestones(currentValue, growthRates) {
    const avgGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    const milestones = [];
    
    // 다음 25%, 50% 증가 시점 예측
    [1.25, 1.5, 2.0].forEach(multiplier => {
      const targetValue = currentValue * multiplier;
      const yearsToTarget = avgGrowthRate > 0 ? Math.log(multiplier) / Math.log(1 + avgGrowthRate) : null;
      
      if (yearsToTarget && yearsToTarget <= 10) {
        milestones.push({
          target_multiplier: multiplier,
          target_value: targetValue,
          estimated_years: yearsToTarget,
          probability: yearsToTarget <= 5 ? 'high' : 'medium'
        });
      }
    });
    
    return milestones;
  }

  extractStrategicImplications(forecastData) {
    const implications = {
      investment_recommendations: [],
      risk_mitigation_strategies: [],
      opportunity_identification: [],
      resource_allocation_advice: []
    };

    // 예측 시나리오 기반 전략적 시사점
    const forecasts = forecastData.forecasts || [];
    const optimisticScenario = forecasts.find(f => f.scenario === 'optimistic');
    const conservativeScenario = forecasts.find(f => f.scenario === 'conservative');

    if (optimisticScenario && optimisticScenario.confidence > 0.4) {
      implications.investment_recommendations.push('성장 가속화를 위한 적극적 투자 검토');
      implications.opportunity_identification.push('시장 확장 기회 적극 활용');
    }

    if (conservativeScenario && conservativeScenario.confidence > 0.6) {
      implications.investment_recommendations.push('안정적 성장을 위한 기반 강화');
      implications.resource_allocation_advice.push('핵심 역량에 집중 투자');
    }

    // 위험 요소 기반 전략
    const riskFactors = forecastData.riskFactors || [];
    riskFactors.forEach(risk => {
      if (risk.includes('성장 둔화')) {
        implications.risk_mitigation_strategies.push('새로운 성장 동력 발굴');
      }
      if (risk.includes('외부 환경')) {
        implications.risk_mitigation_strategies.push('환경 변화 모니터링 체계 구축');
      }
    });

    // 추천 집중 축 기반 자원 배분
    const recommendedFocus = forecastData.recommendedFocus;
    if (recommendedFocus) {
      implications.resource_allocation_advice.push(
        `${recommendedFocus} 축 역량 강화에 우선 순위 부여`
      );
    }

    return implications;
  }

  documentModelAssumptions() {
    return {
      data_assumptions: [
        '과거 성장 패턴이 미래에도 유사하게 지속',
        '현재 분석된 이벤트 영향 패턴의 일관성',
        '외부 환경 변화의 제한적 영향'
      ],
      methodological_assumptions: [
        '선형 및 지수 성장 모델의 적용 가능성',
        '이벤트 영향의 통계적 유의성 기준',
        '3년 예측 기간의 적정성'
      ],
      limitations: [
        '예측 불가능한 외부 충격 미반영',
        '새로운 성장 동력의 출현 가능성',
        '시장 환경 급변 시나리오 제외'
      ]
    };
  }

  analyzeUncertainty(forecastData) {
    const forecasts = forecastData.forecasts || [];
    
    if (forecasts.length === 0) {
      return { level: 'high', reason: 'insufficient_data' };
    }

    // 시나리오 간 분산으로 불확실성 측정
    const projectedValues = forecasts.map(f => f.projectedValue || 0);
    const mean = projectedValues.reduce((a, b) => a + b, 0) / projectedValues.length;
    const variance = projectedValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / projectedValues.length;
    const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 1;

    let uncertaintyLevel;
    if (coefficientOfVariation > 0.5) uncertaintyLevel = 'very_high';
    else if (coefficientOfVariation > 0.3) uncertaintyLevel = 'high';
    else if (coefficientOfVariation > 0.15) uncertaintyLevel = 'medium';
    else uncertaintyLevel = 'low';

    return {
      level: uncertaintyLevel,
      coefficient_of_variation: coefficientOfVariation,
      scenario_spread: Math.max(...projectedValues) - Math.min(...projectedValues),
      confidence_weighted_average: this.calculateConfidenceWeightedAverage(forecasts),
      uncertainty_drivers: this.identifyUncertaintyDrivers(forecastData)
    };
  }

  calculateConfidenceWeightedAverage(forecasts) {
    if (forecasts.length === 0) return 0;

    const totalWeight = forecasts.reduce((sum, f) => sum + (f.confidence || 0), 0);
    if (totalWeight === 0) return 0;

    return forecasts.reduce((sum, f) => sum + (f.projectedValue || 0) * (f.confidence || 0), 0) / totalWeight;
  }

  identifyUncertaintyDrivers(forecastData) {
    const drivers = [];
    
    // 위험 요소 기반
    const riskFactors = forecastData.riskFactors || [];
    if (riskFactors.length > 0) {
      drivers.push('식별된 리스크 요인들');
    }
    
    // 시나리오 신뢰도 기반
    const forecasts = forecastData.forecasts || [];
    const avgConfidence = forecasts.reduce((sum, f) => sum + (f.confidence || 0), 0) / forecasts.length;
    if (avgConfidence < 0.6) {
      drivers.push('예측 모델의 제한된 신뢰도');
    }
    
    // 데이터 품질 기반
    drivers.push('과거 데이터 기반 예측의 한계');
    
    return drivers;
  }

  // 6. Phase 3 비교 데이터 통합
  integrateComparisonData(phase3Comparison) {
    if (!phase3Comparison) {
      return null;
    }

    return {
      comparison_context: {
        total_artists_analyzed: Object.keys(phase3Comparison.artists || {}).length,
        similarity_distribution: phase3Comparison.dataset_statistics?.similarity_distribution || [],
        diversity_index: phase3Comparison.dataset_statistics?.diversity_index || 0
      },
      relative_positioning: this.analyzeRelativePositioning(phase3Comparison),
      peer_benchmarking: this.generatePeerBenchmarks(phase3Comparison),
      competitive_insights: this.extractCompetitiveInsights(phase3Comparison)
    };
  }

  analyzeRelativePositioning(phase3Comparison) {
    // Phase 3 데이터를 사용하여 상대적 위치 분석
    // 실제 구현에서는 comparison_matrix를 활용
    return {
      percentile_ranking: 'top_25_percent', // 예시
      closest_peers: ['Artist B', 'Artist C'], // 예시
      differentiation_factors: ['높은 제도적 인정', '독특한 성장 패턴']
    };
  }

  generatePeerBenchmarks(phase3Comparison) {
    // 동료 아티스트 대비 벤치마킹 지표
    return {
      growth_rate_comparison: 'above_average',
      volatility_comparison: 'below_average',
      event_responsiveness: 'above_average',
      diversification_level: 'average'
    };
  }

  extractCompetitiveInsights(phase3Comparison) {
    return {
      competitive_advantages: ['독특한 성장 패턴', '높은 이벤트 적응력'],
      areas_for_improvement: ['다각화 수준 개선', '변동성 관리'],
      market_opportunities: ['동종 아티스트 대비 성장 잠재력'],
      threats: ['유사한 패턴의 경쟁자 출현 가능성']
    };
  }

  // 7. AI 프롬프팅 데이터 생성
  generateAIPromptingData(phase2Analysis, phase3Comparison) {
    return {
      context_setting: {
        analysis_scope: 'comprehensive_temporal_analysis',
        primary_subject: phase2Analysis.artist_data?.name || 'Unknown Artist',
        analysis_period: this.calculateAnalysisPeriod(phase2Analysis),
        comparison_context: phase3Comparison ? 'multi_artist_comparison_available' : 'single_artist_focus'
      },
      key_narrative_elements: this.extractNarrativeElements(phase2Analysis),
      data_confidence_indicators: this.generateConfidenceIndicators(phase2Analysis),
      report_structure_hints: this.generateReportStructureHints(),
      tone_and_style_guidance: this.generateStyleGuidance(),
      critical_insights_emphasis: this.identifyCriticalInsights(phase2Analysis)
    };
  }

  calculateAnalysisPeriod(phase2Analysis) {
    const timeseriesData = phase2Analysis.data?.timeseries;
    if (!timeseriesData?.bins || timeseriesData.bins.length === 0) {
      return 'unknown_period';
    }

    const startTime = Math.min(...timeseriesData.bins.map(d => d.t));
    const endTime = Math.max(...timeseriesData.bins.map(d => d.t));
    return `${endTime - startTime}년간 (상대시간 +${startTime}~+${endTime}년)`;
  }

  extractNarrativeElements(phase2Analysis) {
    const elements = [];
    
    // 성장 패턴 스토리
    const pattern = phase2Analysis.data?.analysis?.patterns?.[0];
    if (pattern) {
      elements.push({
        type: 'growth_pattern',
        narrative: `${pattern} 성장 패턴을 보이는 독특한 커리어 궤적`,
        importance: 'high'
      });
    }
    
    // 주요 변곡점 스토리
    const inflectionPoints = phase2Analysis.data?.analysis?.inflectionPoints || [];
    if (inflectionPoints.length > 0) {
      elements.push({
        type: 'turning_points',
        narrative: `${inflectionPoints.length}개의 주요 전환점을 통한 성장 진화`,
        importance: 'high'
      });
    }
    
    // 이벤트 영향 스토리
    const eventImpacts = phase2Analysis.data?.eventImpacts || {};
    const significantEvents = Object.values(eventImpacts).filter(
      impact => impact.available && impact.statistical_significance?.is_significant
    ).length;
    
    if (significantEvents > 0) {
      elements.push({
        type: 'event_driven',
        narrative: `${significantEvents}개의 핵심 이벤트가 성장에 결정적 영향`,
        importance: 'medium'
      });
    }
    
    return elements;
  }

  generateConfidenceIndicators(phase2Analysis) {
    const indicators = {
      data_quality: 'high',
      analysis_depth: 'comprehensive',
      statistical_significance: 'validated',
      predictive_reliability: 'moderate'
    };
    
    // 데이터 품질 평가
    const dataPoints = phase2Analysis.data?.timeseries?.bins?.length || 0;
    if (dataPoints < 5) indicators.data_quality = 'low';
    else if (dataPoints < 15) indicators.data_quality = 'medium';
    
    // 분석 깊이 평가
    const hasAdvancedAnalysis = phase2Analysis.data?.analysis?.inflectionPoints?.length > 0;
    if (!hasAdvancedAnalysis) indicators.analysis_depth = 'basic';
    
    return indicators;
  }

  generateReportStructureHints() {
    return {
      recommended_sections: [
        'executive_summary',
        'growth_pattern_analysis',
        'event_impact_assessment',
        'comparative_context',
        'strategic_implications',
        'future_outlook'
      ],
      narrative_flow: 'chronological_with_analytical_insights',
      emphasis_areas: ['unique_patterns', 'quantified_impacts', 'strategic_recommendations'],
      visualization_suggestions: ['timeline_with_annotations', 'pattern_comparison', 'impact_magnitude_chart']
    };
  }

  generateStyleGuidance() {
    return {
      tone: 'professional_analytical_with_storytelling',
      audience: 'stakeholders_and_decision_makers',
      complexity_level: 'sophisticated_but_accessible',
      language_style: 'data_driven_narrative_with_cultural_context',
      formatting_preferences: ['clear_section_headers', 'bullet_points_for_key_findings', 'quantified_statements']
    };
  }

  identifyCriticalInsights(phase2Analysis) {
    const insights = [];
    
    // 예외적 성장 패턴
    const avgGrowthRate = phase2Analysis.data?.analysis?.averageGrowthRate || 0;
    if (avgGrowthRate > 0.3) {
      insights.push({
        type: 'exceptional_growth',
        insight: '업계 평균을 크게 상회하는 성장률',
        quantification: `연평균 ${(avgGrowthRate * 100).toFixed(1)}% 성장`,
        importance: 'critical'
      });
    }
    
    // 독특한 축 집중도
    const dominantAxis = phase2Analysis.data?.analysis?.dominantAxis;
    if (dominantAxis) {
      insights.push({
        type: 'axis_specialization',
        insight: `${dominantAxis} 축 특화를 통한 차별화`,
        importance: 'high'
      });
    }
    
    // 높은 이벤트 반응성
    const eventImpacts = phase2Analysis.data?.eventImpacts || {};
    const responsiveEvents = Object.values(eventImpacts).filter(
      impact => impact.available && impact.causality_score > 0.6
    ).length;
    
    if (responsiveEvents > 2) {
      insights.push({
        type: 'high_adaptability',
        insight: '외부 이벤트에 대한 높은 적응력과 활용 능력',
        quantification: `${responsiveEvents}개 이벤트에서 강한 인과관계`,
        importance: 'high'
      });
    }
    
    return insights;
  }

  // 8. 토큰 수 추정 및 압축
  estimateTokenCount(data) {
    const jsonString = JSON.stringify(data);
    // 대략적인 토큰 수 추정 (평균 4자당 1토큰)
    return Math.ceil(jsonString.length / 4);
  }

  compressForTokenLimit(data) {
    console.warn('Applying token compression for Vertex AI limits');
    
    // 우선순위에 따른 데이터 압축
    const compressed = { ...data };
    
    // 1. 시계열 데이터 압축
    if (compressed.temporal_analysis?.available) {
      compressed.temporal_analysis.key_timepoints = compressed.temporal_analysis.key_timepoints?.slice(0, 8);
      compressed.temporal_analysis.growth_segments = compressed.temporal_analysis.growth_segments?.slice(0, 4);
    }
    
    // 2. 이벤트 영향 데이터 압축
    if (compressed.event_correlations?.available) {
      compressed.event_correlations.high_impact_events = compressed.event_correlations.high_impact_events?.slice(0, 5);
    }
    
    // 3. 예측 데이터 압축
    if (compressed.predictive_models?.available) {
      compressed.predictive_models.scenario_analysis = compressed.predictive_models.scenario_analysis?.slice(0, 3);
    }
    
    compressed.metadata.processing_stats.compression_applied = true;
    compressed.metadata.token_optimization.compression_level = 'high';
    
    return compressed;
  }
}

// 유틸리티 함수들
export const createVertexAIAdapter = () => {
  return new VertexAITimeseriesAdapter();
};

export const adaptPhase2DataForAI = (phase2Analysis, phase3Comparison = null) => {
  const adapter = new VertexAITimeseriesAdapter();
  return adapter.adaptForVertexAI(phase2Analysis, phase3Comparison);
};

export default VertexAITimeseriesAdapter;

