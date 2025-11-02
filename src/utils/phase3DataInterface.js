/**
 * CuratorOdyssey Phase 2→3 Data Interface
 * Dr. Sarah Kim's Advanced Data Bridge for Comparative Analysis
 * 
 * Phase 2 분석 결과를 Phase 3 비교 시스템으로 전달하는 표준화된 인터페이스
 */

// 1. Phase 3 연동을 위한 표준화된 아티스트 프로필
export class ArtistComparisonProfile {
  constructor(artistData, analysisResults) {
    this.artist_id = artistData.artist_id;
    this.name = artistData.name || artistData.artist_name;
    this.debut_year = artistData.debut_year;
    this.generated_at = new Date().toISOString();
    this.phase2_version = '2.0';
    
    // Phase 2 분석 결과 통합
    this.processAnalysisResults(analysisResults);
  }

  processAnalysisResults(results) {
    // 성장 패턴 요약
    this.growth_pattern = {
      type: results.analysis?.patterns?.[0] || 'unknown',
      confidence: results.analysis?.averageGrowthRate || 0,
      dominant_axis: results.analysis?.dominantAxis || 'unknown',
      average_growth_rate: results.analysis?.averageGrowthRate || 0,
      volatility: results.analysis?.growthVolatility || 0,
      inflection_points_count: results.analysis?.inflectionPoints?.length || 0
    };

    // 시계열 요약 (비교 분석용)
    this.trajectory_summary = this.createTrajectorySummary(results.timeseries);
    
    // 이벤트 영향 요약
    this.event_impact_summary = this.createEventImpactSummary(results.eventImpacts);
    
    // 성장 단계 분류 (Phase 3 비교를 위한 표준화)
    this.growth_phases = this.classifyGrowthPhases(results.timeseries);
    
    // 예측 데이터
    this.forecast_data = results.forecast || null;
    
    // 비교 분석용 핵심 지표
    this.key_metrics = this.extractKeyMetrics(results);
  }

  createTrajectorySummary(timeseriesData) {
    if (!timeseriesData?.bins || timeseriesData.bins.length === 0) {
      return { available: false };
    }

    const bins = timeseriesData.bins;
    const summary = {
      available: true,
      total_duration: Math.max(...bins.map(d => d.t)) - Math.min(...bins.map(d => d.t)),
      data_points: bins.length,
      
      // 시작/끝 값
      start_values: {
        t: bins[0].t,
        institution: bins[0].institution || 0,
        academic: bins[0].academic || 0,
        discourse: bins[0].discourse || 0,
        network: bins[0].network || 0,
        total: (bins[0].institution || 0) + (bins[0].academic || 0) + 
               (bins[0].discourse || 0) + (bins[0].network || 0)
      },
      
      end_values: {
        t: bins[bins.length - 1].t,
        institution: bins[bins.length - 1].institution || 0,
        academic: bins[bins.length - 1].academic || 0,
        discourse: bins[bins.length - 1].discourse || 0,
        network: bins[bins.length - 1].network || 0,
        total: (bins[bins.length - 1].institution || 0) + (bins[bins.length - 1].academic || 0) + 
               (bins[bins.length - 1].discourse || 0) + (bins[bins.length - 1].network || 0)
      },
      
      // 축별 성장률
      axis_growth_rates: {
        institution: this.calculateAxisGrowthRate(bins, 'institution'),
        academic: this.calculateAxisGrowthRate(bins, 'academic'),
        discourse: this.calculateAxisGrowthRate(bins, 'discourse'),
        network: this.calculateAxisGrowthRate(bins, 'network')
      },
      
      // 비교 분석용 정규화된 궤적 (0-1 스케일)
      normalized_trajectory: this.createNormalizedTrajectory(bins),
      
      // 시간대별 주요 마일스톤
      milestones: this.extractMilestones(bins)
    };

    return summary;
  }

  calculateAxisGrowthRate(bins, axis) {
    if (bins.length < 2) return 0;
    
    const startValue = bins[0][axis] || 0;
    const endValue = bins[bins.length - 1][axis] || 0;
    const duration = bins[bins.length - 1].t - bins[0].t;
    
    if (startValue <= 0 || duration <= 0) return 0;
    
    // 연평균 성장률 (CAGR)
    return Math.pow(endValue / startValue, 1 / duration) - 1;
  }

  createNormalizedTrajectory(bins) {
    // Phase 3 비교를 위한 표준화된 궤적 생성
    const maxValues = {
      institution: Math.max(...bins.map(d => d.institution || 0)),
      academic: Math.max(...bins.map(d => d.academic || 0)),
      discourse: Math.max(...bins.map(d => d.discourse || 0)),
      network: Math.max(...bins.map(d => d.network || 0))
    };

    const totalMax = Math.max(...bins.map(d => 
      (d.institution || 0) + (d.academic || 0) + (d.discourse || 0) + (d.network || 0)
    ));

    return bins.map(bin => ({
      t: bin.t,
      relative_time: bin.t / Math.max(...bins.map(d => d.t)), // 0-1 정규화
      normalized_values: {
        institution: maxValues.institution > 0 ? (bin.institution || 0) / maxValues.institution : 0,
        academic: maxValues.academic > 0 ? (bin.academic || 0) / maxValues.academic : 0,
        discourse: maxValues.discourse > 0 ? (bin.discourse || 0) / maxValues.discourse : 0,
        network: maxValues.network > 0 ? (bin.network || 0) / maxValues.network : 0
      },
      normalized_total: totalMax > 0 ? 
        ((bin.institution || 0) + (bin.academic || 0) + (bin.discourse || 0) + (bin.network || 0)) / totalMax : 0,
      axis_contributions: this.calculateAxisContributions(bin)
    }));
  }

  calculateAxisContributions(bin) {
    const total = (bin.institution || 0) + (bin.academic || 0) + 
                  (bin.discourse || 0) + (bin.network || 0);
    
    if (total === 0) return { institution: 0, academic: 0, discourse: 0, network: 0 };
    
    return {
      institution: (bin.institution || 0) / total,
      academic: (bin.academic || 0) / total,
      discourse: (bin.discourse || 0) / total,
      network: (bin.network || 0) / total
    };
  }

  extractMilestones(bins) {
    const milestones = [];
    
    // 각 축에서 50% 도달 시점
    ['institution', 'academic', 'discourse', 'network'].forEach(axis => {
      const maxValue = Math.max(...bins.map(d => d[axis] || 0));
      const halfwayPoint = maxValue * 0.5;
      
      const milestone = bins.find(bin => (bin[axis] || 0) >= halfwayPoint);
      if (milestone) {
        milestones.push({
          type: `${axis}_halfway`,
          time: milestone.t,
          value: milestone[axis] || 0,
          description: `${axis} 축 50% 달성`
        });
      }
    });

    // 총합 기준 주요 마일스톤 (25%, 50%, 75%)
    const totalValues = bins.map(d => 
      (d.institution || 0) + (d.academic || 0) + (d.discourse || 0) + (d.network || 0)
    );
    const maxTotal = Math.max(...totalValues);
    
    [0.25, 0.5, 0.75].forEach(threshold => {
      const targetValue = maxTotal * threshold;
      const milestone = bins.find((bin, i) => totalValues[i] >= targetValue);
      
      if (milestone) {
        milestones.push({
          type: `total_${threshold * 100}percent`,
          time: milestone.t,
          value: totalValues[bins.indexOf(milestone)],
          description: `총 성취도 ${threshold * 100}% 달성`
        });
      }
    });

    return milestones.sort((a, b) => a.time - b.time);
  }

  createEventImpactSummary(eventImpacts) {
    if (!eventImpacts || Object.keys(eventImpacts).length === 0) {
      return { available: false };
    }

    const validImpacts = Object.values(eventImpacts).filter(impact => impact.available);
    
    if (validImpacts.length === 0) {
      return { available: false };
    }

    // 고영향 이벤트 식별 (효과 크기 0.5 이상)
    const highImpactEvents = validImpacts.filter(impact => 
      impact.effect_size?.cohen_d && Math.abs(impact.effect_size.cohen_d) >= 0.5
    );

    // 통계적 유의한 이벤트
    const significantEvents = validImpacts.filter(impact => 
      impact.statistical_significance?.is_significant
    );

    // 축별 영향 패턴 분석
    const axisImpactPatterns = this.analyzeAxisImpactPatterns(validImpacts);

    return {
      available: true,
      total_events_analyzed: validImpacts.length,
      high_impact_events: highImpactEvents.length,
      statistically_significant: significantEvents.length,
      
      // 평균 영향도
      average_impact_metrics: {
        mean_effect_size: this.calculateMeanMetric(validImpacts, 'effect_size.cohen_d'),
        mean_growth_acceleration: this.calculateMeanMetric(validImpacts, 'growth_impact.growth_acceleration'),
        mean_causality_score: this.calculateMeanMetric(validImpacts, 'causality_score')
      },
      
      // 축별 영향 패턴
      axis_impact_patterns: axisImpactPatterns,
      
      // 최고 영향 이벤트
      top_impact_event: this.findTopImpactEvent(validImpacts),
      
      // 영향 지속성
      impact_persistence: this.calculateOverallPersistence(validImpacts)
    };
  }

  calculateMeanMetric(impacts, metricPath) {
    const values = impacts
      .map(impact => this.getNestedProperty(impact, metricPath))
      .filter(value => typeof value === 'number' && !isNaN(value));
    
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  analyzeAxisImpactPatterns(impacts) {
    const axisPatterns = {
      institution: { total_impact: 0, event_count: 0, avg_impact: 0 },
      academic: { total_impact: 0, event_count: 0, avg_impact: 0 },
      discourse: { total_impact: 0, event_count: 0, avg_impact: 0 },
      network: { total_impact: 0, event_count: 0, avg_impact: 0 }
    };

    impacts.forEach(impact => {
      if (impact.axis_specific_impact) {
        Object.entries(impact.axis_specific_impact).forEach(([axis, data]) => {
          if (axisPatterns[axis] && typeof data.relative_change === 'number') {
            axisPatterns[axis].total_impact += Math.abs(data.relative_change);
            axisPatterns[axis].event_count++;
          }
        });
      }
    });

    // 평균 영향도 계산
    Object.values(axisPatterns).forEach(pattern => {
      pattern.avg_impact = pattern.event_count > 0 ? 
        pattern.total_impact / pattern.event_count : 0;
    });

    return axisPatterns;
  }

  findTopImpactEvent(impacts) {
    if (impacts.length === 0) return null;

    const sortedByImpact = impacts.sort((a, b) => {
      const aScore = Math.abs(a.effect_size?.cohen_d || 0);
      const bScore = Math.abs(b.effect_size?.cohen_d || 0);
      return bScore - aScore;
    });

    const topEvent = sortedByImpact[0];
    return {
      event_id: topEvent.event_id,
      event_type: topEvent.event_type,
      effect_size: topEvent.effect_size?.cohen_d || 0,
      growth_acceleration: topEvent.growth_impact?.growth_acceleration || 0,
      statistical_significance: topEvent.statistical_significance?.is_significant || false
    };
  }

  calculateOverallPersistence(impacts) {
    const persistenceScores = impacts
      .map(impact => impact.temporal_pattern?.effect_persistence || 0)
      .filter(score => score > 0);
    
    return persistenceScores.length > 0 ? 
      persistenceScores.reduce((sum, score) => sum + score, 0) / persistenceScores.length : 0;
  }

  classifyGrowthPhases(timeseriesData) {
    if (!timeseriesData?.bins || timeseriesData.bins.length < 6) {
      return { available: false };
    }

    const bins = timeseriesData.bins;
    const duration = Math.max(...bins.map(d => d.t)) - Math.min(...bins.map(d => d.t));
    
    // 성장 단계를 3등분으로 나누어 분석
    const phaseLength = duration / 3;
    const phases = {
      early: { start: 0, end: phaseLength },
      middle: { start: phaseLength, end: phaseLength * 2 },
      late: { start: phaseLength * 2, end: duration }
    };

    const phaseAnalysis = {};

    Object.entries(phases).forEach(([phaseName, timeRange]) => {
      const phaseBins = bins.filter(bin => 
        bin.t >= timeRange.start && bin.t <= timeRange.end
      );

      if (phaseBins.length >= 2) {
        phaseAnalysis[phaseName] = {
          duration: timeRange.end - timeRange.start,
          data_points: phaseBins.length,
          growth_rate: this.calculatePhaseGrowthRate(phaseBins),
          dominant_axis: this.findDominantAxis(phaseBins),
          average_values: this.calculatePhaseAverages(phaseBins),
          volatility: this.calculatePhaseVolatility(phaseBins)
        };
      }
    });

    return {
      available: true,
      total_duration: duration,
      phases: phaseAnalysis,
      dominant_phase: this.findDominantPhase(phaseAnalysis)
    };
  }

  calculatePhaseGrowthRate(phaseBins) {
    if (phaseBins.length < 2) return 0;
    
    const startTotal = this.getBinTotal(phaseBins[0]);
    const endTotal = this.getBinTotal(phaseBins[phaseBins.length - 1]);
    const duration = phaseBins[phaseBins.length - 1].t - phaseBins[0].t;
    
    if (startTotal <= 0 || duration <= 0) return 0;
    
    return (endTotal - startTotal) / (startTotal * duration);
  }

  getBinTotal(bin) {
    return (bin.institution || 0) + (bin.academic || 0) + 
           (bin.discourse || 0) + (bin.network || 0);
  }

  findDominantAxis(phaseBins) {
    const axisTotals = {
      institution: 0,
      academic: 0,
      discourse: 0,
      network: 0
    };

    phaseBins.forEach(bin => {
      axisTotals.institution += bin.institution || 0;
      axisTotals.academic += bin.academic || 0;
      axisTotals.discourse += bin.discourse || 0;
      axisTotals.network += bin.network || 0;
    });

    return Object.entries(axisTotals)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  calculatePhaseAverages(phaseBins) {
    const totals = {
      institution: 0,
      academic: 0,
      discourse: 0,
      network: 0
    };

    phaseBins.forEach(bin => {
      totals.institution += bin.institution || 0;
      totals.academic += bin.academic || 0;
      totals.discourse += bin.discourse || 0;
      totals.network += bin.network || 0;
    });

    const count = phaseBins.length;
    return {
      institution: count > 0 ? totals.institution / count : 0,
      academic: count > 0 ? totals.academic / count : 0,
      discourse: count > 0 ? totals.discourse / count : 0,
      network: count > 0 ? totals.network / count : 0
    };
  }

  calculatePhaseVolatility(phaseBins) {
    const totalValues = phaseBins.map(bin => this.getBinTotal(bin));
    const mean = totalValues.reduce((sum, val) => sum + val, 0) / totalValues.length;
    const variance = totalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / totalValues.length;
    return Math.sqrt(variance);
  }

  findDominantPhase(phaseAnalysis) {
    if (Object.keys(phaseAnalysis).length === 0) return null;

    // 성장률이 가장 높은 단계를 주도적 단계로 선정
    const sortedPhases = Object.entries(phaseAnalysis)
      .sort(([,a], [,b]) => b.growth_rate - a.growth_rate);

    return sortedPhases[0][0];
  }

  extractKeyMetrics(results) {
    return {
      // 성장 지표
      growth_metrics: {
        total_growth: this.trajectory_summary.available ? 
          (this.trajectory_summary.end_values.total - this.trajectory_summary.start_values.total) : 0,
        growth_consistency: 1 - (this.growth_pattern.volatility || 0),
        growth_acceleration: results.analysis?.averageGrowthRate || 0
      },
      
      // 다양성 지표
      diversification_metrics: {
        axis_balance: this.calculateAxisBalance(),
        specialization_index: this.calculateSpecializationIndex(),
        portfolio_entropy: this.calculatePortfolioEntropy()
      },
      
      // 이벤트 반응성
      event_responsiveness: {
        high_impact_ratio: this.event_impact_summary.available ? 
          this.event_impact_summary.high_impact_events / Math.max(this.event_impact_summary.total_events_analyzed, 1) : 0,
        average_response_strength: this.event_impact_summary.average_impact_metrics?.mean_effect_size || 0,
        adaptation_speed: this.event_impact_summary.average_impact_metrics?.mean_causality_score || 0
      },
      
      // 예측 가능성
      predictability_score: Math.max(
        results.analysis?.growthRates?.reduce((max, rate) => Math.max(max, Math.abs(rate.rate || 0)), 0) || 0
      ),
      
      // 종합 성숙도
      maturity_score: this.calculateMaturityScore(results)
    };
  }

  calculateAxisBalance() {
    if (!this.trajectory_summary.available) return 0;
    
    const endContributions = Object.values(
      this.calculateAxisContributions(this.trajectory_summary.end_values)
    );
    
    // Gini 계수의 역수 (1에 가까울수록 균형적)
    const giniCoeff = this.calculateGiniCoefficient(endContributions);
    return 1 - giniCoeff;
  }

  calculateGiniCoefficient(values) {
    const sortedValues = [...values].sort((a, b) => a - b);
    const n = sortedValues.length;
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
      sum += (2 * (i + 1) - n - 1) * sortedValues[i];
    }
    
    const mean = sortedValues.reduce((a, b) => a + b, 0) / n;
    return sum / (n * mean * n);
  }

  calculateSpecializationIndex() {
    if (!this.trajectory_summary.available) return 0;
    
    const contributions = Object.values(
      this.calculateAxisContributions(this.trajectory_summary.end_values)
    );
    
    // Herfindahl-Hirschman Index
    return contributions.reduce((sum, contrib) => sum + contrib * contrib, 0);
  }

  calculatePortfolioEntropy() {
    if (!this.trajectory_summary.available) return 0;
    
    const contributions = Object.values(
      this.calculateAxisContributions(this.trajectory_summary.end_values)
    );
    
    // Shannon entropy
    return -contributions.reduce((sum, contrib) => {
      return contrib > 0 ? sum + contrib * Math.log2(contrib) : sum;
    }, 0);
  }

  calculateMaturityScore(results) {
    let maturityScore = 0;
    
    // 성장 안정성 (30%)
    const growthStability = 1 - Math.min(this.growth_pattern.volatility || 0, 1);
    maturityScore += growthStability * 0.3;
    
    // 이벤트 대응력 (25%)
    const eventResponsiveness = this.key_metrics.event_responsiveness.average_response_strength || 0;
    maturityScore += Math.min(eventResponsiveness, 1) * 0.25;
    
    // 다각화 수준 (25%)
    const diversification = this.key_metrics.diversification_metrics.axis_balance || 0;
    maturityScore += diversification * 0.25;
    
    // 성장 지속성 (20%)
    const sustainability = Math.min(this.key_metrics.growth_metrics.growth_consistency || 0, 1);
    maturityScore += sustainability * 0.2;
    
    return Math.min(maturityScore, 1);
  }

  // Phase 3용 데이터 익스포트
  exportForPhase3() {
    return {
      profile_id: `${this.artist_id}_phase2_profile`,
      artist_info: {
        id: this.artist_id,
        name: this.name,
        debut_year: this.debut_year
      },
      
      // 비교 분석에 필수적인 표준화된 데이터
      comparison_data: {
        normalized_trajectory: this.trajectory_summary.normalized_trajectory,
        growth_phases: this.growth_phases,
        key_metrics: this.key_metrics,
        growth_pattern: this.growth_pattern,
        milestones: this.trajectory_summary.milestones
      },
      
      // 세부 분석 결과 (참조용)
      detailed_analysis: {
        trajectory_summary: this.trajectory_summary,
        event_impact_summary: this.event_impact_summary,
        forecast_data: this.forecast_data
      },
      
      // 메타데이터
      metadata: {
        generated_at: this.generated_at,
        phase2_version: this.phase2_version,
        data_quality_score: this.calculateDataQualityScore()
      }
    };
  }

  calculateDataQualityScore() {
    let score = 0;
    
    // 데이터 포인트 충분성
    if (this.trajectory_summary.available && this.trajectory_summary.data_points >= 10) {
      score += 0.3;
    }
    
    // 이벤트 분석 가용성
    if (this.event_impact_summary.available) {
      score += 0.3;
    }
    
    // 성장 단계 분석 가용성
    if (this.growth_phases.available) {
      score += 0.2;
    }
    
    // 예측 데이터 가용성
    if (this.forecast_data) {
      score += 0.2;
    }
    
    return score;
  }
}

// 2. 다작가 비교를 위한 표준화된 데이터 컨테이너
export class MultiArtistComparisonDataset {
  constructor() {
    this.artists = new Map();
    this.comparison_matrix = null;
    this.clustering_results = null;
    this.benchmark_statistics = null;
    this.created_at = new Date().toISOString();
  }

  addArtist(artistProfile) {
    if (!(artistProfile instanceof ArtistComparisonProfile)) {
      throw new Error('Invalid artist profile format');
    }
    
    this.artists.set(artistProfile.artist_id, artistProfile.exportForPhase3());
    this.invalidateComputedResults();
  }

  addMultipleArtists(artistProfiles) {
    artistProfiles.forEach(profile => this.addArtist(profile));
  }

  invalidateComputedResults() {
    this.comparison_matrix = null;
    this.clustering_results = null;
    this.benchmark_statistics = null;
  }

  generateComparisonMatrix() {
    const artistIds = Array.from(this.artists.keys());
    const matrix = {};
    
    artistIds.forEach(idA => {
      matrix[idA] = {};
      artistIds.forEach(idB => {
        if (idA !== idB) {
          matrix[idA][idB] = this.calculatePairwiseSimilarity(idA, idB);
        } else {
          matrix[idA][idB] = 1.0;
        }
      });
    });
    
    this.comparison_matrix = matrix;
    return matrix;
  }

  calculatePairwiseSimilarity(artistIdA, artistIdB) {
    const artistA = this.artists.get(artistIdA);
    const artistB = this.artists.get(artistIdB);
    
    if (!artistA || !artistB) return 0;
    
    // 다차원적 유사도 계산
    const similarities = {
      growth_pattern: this.compareGrowthPatterns(
        artistA.comparison_data.growth_pattern,
        artistB.comparison_data.growth_pattern
      ),
      trajectory: this.compareTrajectories(
        artistA.comparison_data.normalized_trajectory,
        artistB.comparison_data.normalized_trajectory
      ),
      key_metrics: this.compareKeyMetrics(
        artistA.comparison_data.key_metrics,
        artistB.comparison_data.key_metrics
      ),
      milestones: this.compareMilestones(
        artistA.comparison_data.milestones,
        artistB.comparison_data.milestones
      )
    };
    
    // 가중 평균 (궤적 40%, 성장패턴 30%, 핵심지표 20%, 마일스톤 10%)
    return similarities.trajectory * 0.4 +
           similarities.growth_pattern * 0.3 +
           similarities.key_metrics * 0.2 +
           similarities.milestones * 0.1;
  }

  compareGrowthPatterns(patternA, patternB) {
    if (!patternA || !patternB) return 0;
    
    // 패턴 타입 일치 여부
    const typeMatch = patternA.type === patternB.type ? 1 : 0;
    
    // 수치적 특성 비교
    const confidenceDiff = 1 - Math.abs((patternA.confidence || 0) - (patternB.confidence || 0));
    const growthRateDiff = 1 - Math.abs((patternA.average_growth_rate || 0) - (patternB.average_growth_rate || 0));
    const volatilityDiff = 1 - Math.abs((patternA.volatility || 0) - (patternB.volatility || 0));
    
    return (typeMatch * 0.4 + confidenceDiff * 0.2 + growthRateDiff * 0.3 + volatilityDiff * 0.1);
  }

  compareTrajectories(trajectoryA, trajectoryB) {
    if (!trajectoryA || !trajectoryB || trajectoryA.length === 0 || trajectoryB.length === 0) {
      return 0;
    }
    
    // Dynamic Time Warping의 간단한 근사
    const minLength = Math.min(trajectoryA.length, trajectoryB.length);
    let totalSimilarity = 0;
    
    for (let i = 0; i < minLength; i++) {
      const pointA = trajectoryA[i];
      const pointB = trajectoryB[i];
      
      const totalDiff = Math.abs(pointA.normalized_total - pointB.normalized_total);
      const axisSimilarity = this.compareAxisContributions(
        pointA.axis_contributions,
        pointB.axis_contributions
      );
      
      const pointSimilarity = (1 - totalDiff) * 0.6 + axisSimilarity * 0.4;
      totalSimilarity += pointSimilarity;
    }
    
    return totalSimilarity / minLength;
  }

  compareAxisContributions(contribA, contribB) {
    if (!contribA || !contribB) return 0;
    
    const axes = ['institution', 'academic', 'discourse', 'network'];
    let totalDiff = 0;
    
    axes.forEach(axis => {
      const diff = Math.abs((contribA[axis] || 0) - (contribB[axis] || 0));
      totalDiff += diff;
    });
    
    return 1 - (totalDiff / axes.length);
  }

  compareKeyMetrics(metricsA, metricsB) {
    if (!metricsA || !metricsB) return 0;
    
    const comparisons = [];
    
    // 성장 지표 비교
    if (metricsA.growth_metrics && metricsB.growth_metrics) {
      const growthSim = 1 - Math.abs(
        (metricsA.growth_metrics.growth_acceleration || 0) - 
        (metricsB.growth_metrics.growth_acceleration || 0)
      );
      comparisons.push(growthSim);
    }
    
    // 다양성 지표 비교
    if (metricsA.diversification_metrics && metricsB.diversification_metrics) {
      const diversSim = 1 - Math.abs(
        (metricsA.diversification_metrics.axis_balance || 0) - 
        (metricsB.diversification_metrics.axis_balance || 0)
      );
      comparisons.push(diversSim);
    }
    
    // 성숙도 비교
    const maturitySim = 1 - Math.abs(
      (metricsA.maturity_score || 0) - (metricsB.maturity_score || 0)
    );
    comparisons.push(maturitySim);
    
    return comparisons.length > 0 ? 
      comparisons.reduce((sum, sim) => sum + sim, 0) / comparisons.length : 0;
  }

  compareMilestones(milestonesA, milestonesB) {
    if (!milestonesA || !milestonesB) return 0;
    
    // 마일스톤 달성 시기의 유사성 비교
    const milestoneTypes = ['total_25percent', 'total_50percent', 'total_75percent'];
    let similarities = [];
    
    milestoneTypes.forEach(type => {
      const milestoneA = milestonesA.find(m => m.type === type);
      const milestoneB = milestonesB.find(m => m.type === type);
      
      if (milestoneA && milestoneB) {
        const timeDiff = Math.abs(milestoneA.time - milestoneB.time);
        const maxTime = Math.max(milestoneA.time, milestoneB.time);
        const similarity = maxTime > 0 ? 1 - (timeDiff / maxTime) : 1;
        similarities.push(similarity);
      }
    });
    
    return similarities.length > 0 ? 
      similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length : 0;
  }

  // Phase 3으로 완전한 데이터셋 전달
  exportForPhase3() {
    return {
      dataset_id: `multi_artist_comparison_${Date.now()}`,
      created_at: this.created_at,
      artist_count: this.artists.size,
      
      artists: Object.fromEntries(this.artists),
      comparison_matrix: this.comparison_matrix || this.generateComparisonMatrix(),
      
      dataset_statistics: {
        average_similarity: this.calculateAveragesimilarity(),
        similarity_distribution: this.calculateSimilarityDistribution(),
        diversity_index: this.calculateDiversityIndex()
      },
      
      ready_for_phase3: true
    };
  }

  calculateAverageS

imilarity() {
    if (!this.comparison_matrix) this.generateComparisonMatrix();
    
    const similarities = [];
    Object.values(this.comparison_matrix).forEach(row => {
      Object.values(row).forEach(similarity => {
        if (similarity !== 1.0) { // 자기 자신과의 비교 제외
          similarities.push(similarity);
        }
      });
    });
    
    return similarities.length > 0 ? 
      similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length : 0;
  }

  calculateSimilarityDistribution() {
    if (!this.comparison_matrix) this.generateComparisonMatrix();
    
    const similarities = [];
    Object.values(this.comparison_matrix).forEach(row => {
      Object.values(row).forEach(similarity => {
        if (similarity !== 1.0) {
          similarities.push(similarity);
        }
      });
    });
    
    const bins = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const distribution = bins.slice(0, -1).map((bin, i) => {
      const count = similarities.filter(sim => 
        sim >= bin && sim < bins[i + 1]
      ).length;
      return { range: `${bin}-${bins[i + 1]}`, count, percentage: count / similarities.length };
    });
    
    return distribution;
  }

  calculateDiversityIndex() {
    if (!this.comparison_matrix) this.generateComparisonMatrix();
    
    const avgSimilarity = this.calculateAverageS

imilarity();
    return 1 - avgSimilarity; // 평균 유사도가 낮을수록 다양성이 높음
  }
}

// 3. 통합 Phase 3 데이터 준비 함수
export const preparePhase3Data = (artistAnalysisResults, additionalArtists = []) => {
  // 메인 아티스트 프로필 생성
  const mainProfile = new ArtistComparisonProfile(
    artistAnalysisResults.artist_data,
    artistAnalysisResults.analysis_results
  );
  
  // 다작가 데이터셋 생성
  const dataset = new MultiArtistComparisonDataset();
  dataset.addArtist(mainProfile);
  
  // 추가 아티스트들 추가 (실제로는 데이터베이스나 API에서 로드)
  additionalArtists.forEach(artistData => {
    const profile = new ArtistComparisonProfile(artistData.info, artistData.results);
    dataset.addArtist(profile);
  });
  
  return dataset.exportForPhase3();
};

export default {
  ArtistComparisonProfile,
  MultiArtistComparisonDataset,
  preparePhase3Data
};

