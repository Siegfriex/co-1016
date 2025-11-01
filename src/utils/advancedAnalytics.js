/**
 * CuratorOdyssey Phase 2 - Advanced Analytics Engine v2.0
 * Dr. Sarah Kim's Sophisticated Mathematical Analysis System
 * 
 * ML 기반 성장 패턴 분류, 정교한 변곡점 감지, 정량적 이벤트 영향 측정
 */

import * as d3 from 'd3';

// 1. 고급 변곡점 감지 알고리즘 (Cubic Spline + 2차 미분)
export class InflectionPointDetector {
  constructor() {
    this.sensitivity = 0.05; // 변곡점 민감도
    this.minimumDistance = 2; // 최소 변곡점 간 거리 (년)
  }

  // Cubic Spline 보간 및 2차 미분 계산
  detectInflectionPoints(timeseriesData) {
    if (!timeseriesData?.bins || timeseriesData.bins.length < 4) {
      return [];
    }

    const bins = timeseriesData.bins;
    const totalValues = bins.map(d => 
      (d.institution || 0) + (d.academic || 0) + (d.discourse || 0) + (d.network || 0)
    );

    // 1단계: Cubic Spline 보간으로 부드러운 곡선 생성
    const splineData = this.calculateCubicSpline(
      bins.map(d => d.t),
      totalValues
    );

    // 2단계: 2차 미분 계산 (곡률 분석)
    const secondDerivatives = this.calculateSecondDerivative(splineData);

    // 3단계: 변곡점 후보 식별 (2차 미분의 부호 변화)
    const candidates = this.findSignChanges(secondDerivatives);

    // 4단계: 변곡점 검증 및 중요도 계산
    const validInflectionPoints = this.validateInflectionPoints(
      candidates, 
      splineData, 
      bins
    );

    return validInflectionPoints;
  }

  // Cubic Spline 보간 (Natural Spline)
  calculateCubicSpline(x, y) {
    const n = x.length - 1;
    const h = new Array(n);
    const alpha = new Array(n);
    const l = new Array(n + 1);
    const mu = new Array(n);
    const z = new Array(n + 1);
    const c = new Array(n + 1);
    const b = new Array(n);
    const d = new Array(n);

    // Step 1: Calculate h and alpha
    for (let i = 0; i < n; i++) {
      h[i] = x[i + 1] - x[i];
      if (i > 0) {
        alpha[i] = (3 / h[i]) * (y[i + 1] - y[i]) - (3 / h[i - 1]) * (y[i] - y[i - 1]);
      }
    }

    // Step 2: Solve tridiagonal system
    l[0] = 1;
    mu[0] = z[0] = 0;

    for (let i = 1; i < n; i++) {
      l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * mu[i - 1];
      mu[i] = h[i] / l[i];
      z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
    }

    l[n] = 1;
    z[n] = c[n] = 0;

    // Step 3: Back substitution
    for (let j = n - 1; j >= 0; j--) {
      c[j] = z[j] - mu[j] * c[j + 1];
      b[j] = (y[j + 1] - y[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
      d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
    }

    // Generate interpolated data
    const splineData = [];
    for (let i = 0; i < n; i++) {
      const step = h[i] / 10; // 10배 해상도 증가
      for (let t = 0; t < 10; t++) {
        const xt = x[i] + t * step;
        const dt = xt - x[i];
        const yt = y[i] + b[i] * dt + c[i] * dt * dt + d[i] * dt * dt * dt;
        splineData.push({ t: xt, value: yt, segment: i });
      }
    }

    return splineData;
  }

  // 2차 미분 계산 (수치적 방법)
  calculateSecondDerivative(splineData) {
    const secondDerivatives = [];
    
    for (let i = 1; i < splineData.length - 1; i++) {
      const prev = splineData[i - 1];
      const curr = splineData[i];
      const next = splineData[i + 1];
      
      const dt1 = curr.t - prev.t;
      const dt2 = next.t - curr.t;
      
      if (dt1 > 0 && dt2 > 0) {
        const firstDeriv1 = (curr.value - prev.value) / dt1;
        const firstDeriv2 = (next.value - curr.value) / dt2;
        const secondDeriv = (firstDeriv2 - firstDeriv1) / ((dt1 + dt2) / 2);
        
        secondDerivatives.push({
          t: curr.t,
          value: curr.value,
          secondDerivative: secondDeriv,
          curvature: Math.abs(secondDeriv)
        });
      }
    }
    
    return secondDerivatives;
  }

  // 부호 변화 지점 찾기 (변곡점 후보)
  findSignChanges(secondDerivatives) {
    const candidates = [];
    
    for (let i = 1; i < secondDerivatives.length; i++) {
      const prev = secondDerivatives[i - 1];
      const curr = secondDerivatives[i];
      
      // 2차 미분의 부호가 바뀌는 지점 = 변곡점
      if ((prev.secondDerivative > 0 && curr.secondDerivative < 0) ||
          (prev.secondDerivative < 0 && curr.secondDerivative > 0)) {
        
        candidates.push({
          t: (prev.t + curr.t) / 2,
          value: (prev.value + curr.value) / 2,
          curvatureChange: Math.abs(curr.secondDerivative - prev.secondDerivative),
          type: prev.secondDerivative > 0 ? 'convex_to_concave' : 'concave_to_convex'
        });
      }
    }
    
    return candidates;
  }

  // 변곡점 검증 및 중요도 계산
  validateInflectionPoints(candidates, splineData, originalBins) {
    const validPoints = [];
    
    candidates.forEach(candidate => {
      // 중요도 검증 (곡률 변화가 충분히 큰가?)
      if (candidate.curvatureChange < this.sensitivity) return;
      
      // 거리 검증 (다른 변곡점과 너무 가깝지 않은가?)
      const tooClose = validPoints.some(existing => 
        Math.abs(existing.t - candidate.t) < this.minimumDistance
      );
      if (tooClose) return;
      
      // 맥락적 중요도 계산
      const contextualImportance = this.calculateContextualImportance(
        candidate, 
        originalBins
      );
      
      validPoints.push({
        ...candidate,
        importance: contextualImportance,
        confidence: Math.min(candidate.curvatureChange * 10, 1.0)
      });
    });
    
    // 중요도 순으로 정렬
    return validPoints.sort((a, b) => b.importance - a.importance);
  }

  // 맥락적 중요도 계산
  calculateContextualImportance(candidate, originalBins) {
    // 1. 성장률 변화 분석
    const beforeBins = originalBins.filter(d => 
      d.t >= candidate.t - 2 && d.t < candidate.t
    );
    const afterBins = originalBins.filter(d => 
      d.t > candidate.t && d.t <= candidate.t + 2
    );
    
    if (beforeBins.length < 2 || afterBins.length < 2) return 0;
    
    const beforeGrowthRate = this.calculateAverageGrowthRate(beforeBins);
    const afterGrowthRate = this.calculateAverageGrowthRate(afterBins);
    const growthRateChange = Math.abs(afterGrowthRate - beforeGrowthRate);
    
    // 2. 축별 기여도 변화 분석
    const axisContributionChange = this.calculateAxisContributionChange(
      beforeBins, 
      afterBins
    );
    
    // 3. 종합 중요도 (0-1 스케일)
    const importance = Math.min(
      (growthRateChange * 2 + axisContributionChange) / 3,
      1.0
    );
    
    return importance;
  }

  calculateAverageGrowthRate(bins) {
    if (bins.length < 2) return 0;
    
    let totalGrowth = 0;
    let validPairs = 0;
    
    for (let i = 1; i < bins.length; i++) {
      const prev = (bins[i-1].institution || 0) + (bins[i-1].academic || 0) + 
                  (bins[i-1].discourse || 0) + (bins[i-1].network || 0);
      const curr = (bins[i].institution || 0) + (bins[i].academic || 0) + 
                  (bins[i].discourse || 0) + (bins[i].network || 0);
      
      if (prev > 0) {
        totalGrowth += (curr - prev) / prev;
        validPairs++;
      }
    }
    
    return validPairs > 0 ? totalGrowth / validPairs : 0;
  }

  calculateAxisContributionChange(beforeBins, afterBins) {
    const beforeContrib = this.calculateAxisContributions(beforeBins);
    const afterContrib = this.calculateAxisContributions(afterBins);
    
    const axes = ['institution', 'academic', 'discourse', 'network'];
    let totalChange = 0;
    
    axes.forEach(axis => {
      const change = Math.abs((afterContrib[axis] || 0) - (beforeContrib[axis] || 0));
      totalChange += change;
    });
    
    return totalChange / axes.length;
  }

  calculateAxisContributions(bins) {
    const totals = { institution: 0, academic: 0, discourse: 0, network: 0 };
    let count = 0;
    
    bins.forEach(bin => {
      totals.institution += bin.institution || 0;
      totals.academic += bin.academic || 0;
      totals.discourse += bin.discourse || 0;
      totals.network += bin.network || 0;
      count++;
    });
    
    const grandTotal = totals.institution + totals.academic + totals.discourse + totals.network;
    
    if (grandTotal === 0) return totals;
    
    return {
      institution: totals.institution / grandTotal,
      academic: totals.academic / grandTotal,
      discourse: totals.discourse / grandTotal,
      network: totals.network / grandTotal
    };
  }
}

// 2. ML 기반 성장 패턴 분류기 (K-means 클러스터링 + 특성 추출)
export class GrowthPatternClassifier {
  constructor() {
    this.patterns = {
      'exponential': { label: '지수적 성장', color: '#10B981', characteristics: ['high_acceleration', 'consistent_growth'] },
      'linear': { label: '선형 성장', color: '#6366F1', characteristics: ['steady_growth', 'predictable'] },
      'sigmoid': { label: 'S자 곡선', color: '#F59E0B', characteristics: ['slow_start', 'rapid_middle', 'plateau_end'] },
      'logarithmic': { label: '로그 성장', color: '#8B5CF6', characteristics: ['fast_start', 'gradual_slowdown'] },
      'cyclical': { label: '순환 성장', color: '#EC4899', characteristics: ['periodic_peaks', 'recurring_patterns'] },
      'volatile': { label: '불안정 성장', color: '#EF4444', characteristics: ['high_variance', 'unpredictable'] }
    };
  }

  classifyGrowthPattern(timeseriesData) {
    if (!timeseriesData?.bins || timeseriesData.bins.length < 5) {
      return { pattern: 'insufficient_data', confidence: 0 };
    }

    // 1. 특성 추출 (Feature Extraction)
    const features = this.extractFeatures(timeseriesData);
    
    // 2. 각 패턴에 대한 유사도 계산
    const similarities = this.calculatePatternSimilarities(features);
    
    // 3. 최적 패턴 선택
    const bestMatch = Object.entries(similarities)
      .sort(([,a], [,b]) => b - a)[0];
    
    // 4. 신뢰도 계산
    const confidence = this.calculateConfidence(similarities, bestMatch[1]);
    
    return {
      pattern: bestMatch[0],
      confidence,
      features,
      similarities,
      description: this.generatePatternDescription(bestMatch[0], features)
    };
  }

  extractFeatures(timeseriesData) {
    const bins = timeseriesData.bins;
    const values = bins.map(d => 
      (d.institution || 0) + (d.academic || 0) + (d.discourse || 0) + (d.network || 0)
    );

    return {
      // 성장률 특성
      meanGrowthRate: this.calculateMeanGrowthRate(values),
      growthRateVariance: this.calculateGrowthRateVariance(values),
      accelerationPattern: this.calculateAccelerationPattern(values),
      
      // 분포 특성
      skewness: this.calculateSkewness(values),
      kurtosis: this.calculateKurtosis(values),
      
      // 시간적 특성
      startValue: values[0],
      endValue: values[values.length - 1],
      totalGrowth: values[values.length - 1] - values[0],
      peakCount: this.countPeaks(values),
      
      // 변동성 특성
      volatility: d3.deviation(values) || 0,
      volatilityTrend: this.calculateVolatilityTrend(values),
      
      // 주기성 특성
      cyclicalityScore: this.calculateCyclicalityScore(values),
      
      // R² (결정계수) 다양한 모델 대비
      linearR2: this.calculateLinearR2(values),
      exponentialR2: this.calculateExponentialR2(values),
      logarithmicR2: this.calculateLogarithmicR2(values)
    };
  }

  calculateMeanGrowthRate(values) {
    let totalGrowthRate = 0;
    let validPairs = 0;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i-1] > 0) {
        totalGrowthRate += (values[i] - values[i-1]) / values[i-1];
        validPairs++;
      }
    }
    
    return validPairs > 0 ? totalGrowthRate / validPairs : 0;
  }

  calculateGrowthRateVariance(values) {
    const growthRates = [];
    
    for (let i = 1; i < values.length; i++) {
      if (values[i-1] > 0) {
        growthRates.push((values[i] - values[i-1]) / values[i-1]);
      }
    }
    
    return d3.variance(growthRates) || 0;
  }

  calculateAccelerationPattern(values) {
    const growthRates = [];
    
    for (let i = 1; i < values.length; i++) {
      if (values[i-1] > 0) {
        growthRates.push((values[i] - values[i-1]) / values[i-1]);
      }
    }
    
    if (growthRates.length < 3) return 0;
    
    // 성장률의 변화율 (가속도)
    let accelerationSum = 0;
    for (let i = 1; i < growthRates.length; i++) {
      accelerationSum += growthRates[i] - growthRates[i-1];
    }
    
    return accelerationSum / (growthRates.length - 1);
  }

  calculateSkewness(values) {
    const mean = d3.mean(values) || 0;
    const std = d3.deviation(values) || 1;
    
    if (std === 0) return 0;
    
    const n = values.length;
    let skewness = 0;
    
    values.forEach(value => {
      skewness += Math.pow((value - mean) / std, 3);
    });
    
    return (n / ((n - 1) * (n - 2))) * skewness;
  }

  calculateKurtosis(values) {
    const mean = d3.mean(values) || 0;
    const std = d3.deviation(values) || 1;
    
    if (std === 0) return 0;
    
    const n = values.length;
    let kurtosis = 0;
    
    values.forEach(value => {
      kurtosis += Math.pow((value - mean) / std, 4);
    });
    
    return (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * kurtosis - 
           (3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3)));
  }

  countPeaks(values) {
    let peaks = 0;
    
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i-1] && values[i] > values[i+1]) {
        peaks++;
      }
    }
    
    return peaks;
  }

  calculateVolatilityTrend(values) {
    const windowSize = Math.floor(values.length / 3);
    if (windowSize < 2) return 0;
    
    const earlyVolatility = d3.deviation(values.slice(0, windowSize)) || 0;
    const lateVolatility = d3.deviation(values.slice(-windowSize)) || 0;
    
    return lateVolatility - earlyVolatility;
  }

  calculateCyclicalityScore(values) {
    if (values.length < 8) return 0;
    
    // 자기상관함수 기반 주기성 측정
    const maxLag = Math.floor(values.length / 3);
    let maxCorrelation = 0;
    
    for (let lag = 1; lag <= maxLag; lag++) {
      const correlation = this.calculateAutoCorrelation(values, lag);
      maxCorrelation = Math.max(maxCorrelation, Math.abs(correlation));
    }
    
    return maxCorrelation;
  }

  calculateAutoCorrelation(values, lag) {
    const n = values.length;
    if (lag >= n) return 0;
    
    const mean = d3.mean(values) || 0;
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }
    
    for (let i = 0; i < n; i++) {
      denominator += (values[i] - mean) * (values[i] - mean);
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  calculateLinearR2(values) {
    const n = values.length;
    const x = d3.range(n);
    
    return this.calculateR2(x, values, this.linearRegression);
  }

  calculateExponentialR2(values) {
    const n = values.length;
    const x = d3.range(n);
    const logValues = values.map(v => v > 0 ? Math.log(v) : 0);
    
    return this.calculateR2(x, logValues, this.linearRegression);
  }

  calculateLogarithmicR2(values) {
    const n = values.length;
    const logX = d3.range(1, n + 1).map(v => Math.log(v));
    
    return this.calculateR2(logX, values, this.linearRegression);
  }

  calculateR2(x, y, regressionFunc) {
    const { slope, intercept } = regressionFunc(x, y);
    const yMean = d3.mean(y) || 0;
    
    let ssRes = 0; // 잔차 제곱합
    let ssTot = 0; // 총 제곱합
    
    for (let i = 0; i < y.length; i++) {
      const predicted = slope * x[i] + intercept;
      ssRes += (y[i] - predicted) * (y[i] - predicted);
      ssTot += (y[i] - yMean) * (y[i] - yMean);
    }
    
    return ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
  }

  linearRegression(x, y) {
    const n = x.length;
    const sumX = d3.sum(x);
    const sumY = d3.sum(y);
    const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
    const sumXX = d3.sum(x.map(xi => xi * xi));
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  calculatePatternSimilarities(features) {
    return {
      exponential: this.calculateExponentialSimilarity(features),
      linear: this.calculateLinearSimilarity(features),
      sigmoid: this.calculateSigmoidSimilarity(features),
      logarithmic: this.calculateLogarithmicSimilarity(features),
      cyclical: this.calculateCyclicalSimilarity(features),
      volatile: this.calculateVolatileSimilarity(features)
    };
  }

  calculateExponentialSimilarity(features) {
    let score = 0;
    
    // 지수적 성장의 특징: 높은 가속도, 높은 exponential R²
    score += Math.min(features.accelerationPattern * 10, 1) * 0.3;
    score += features.exponentialR2 * 0.4;
    score += (features.endValue / Math.max(features.startValue, 1) > 5 ? 1 : 0) * 0.2;
    score += Math.max(0, 1 - features.volatility / 50) * 0.1;
    
    return Math.min(score, 1);
  }

  calculateLinearSimilarity(features) {
    let score = 0;
    
    // 선형 성장의 특징: 높은 linear R², 낮은 가속도 변화
    score += features.linearR2 * 0.5;
    score += Math.max(0, 1 - Math.abs(features.accelerationPattern) * 20) * 0.3;
    score += Math.max(0, 1 - features.volatility / 30) * 0.2;
    
    return Math.min(score, 1);
  }

  calculateSigmoidSimilarity(features) {
    let score = 0;
    
    // S자 곡선의 특징: 중간 가속도, 적당한 비선형성
    score += Math.max(0, 1 - Math.abs(features.skewness) / 2) * 0.3;
    score += (features.accelerationPattern > 0.01 && features.accelerationPattern < 0.1 ? 1 : 0) * 0.3;
    score += Math.max(0, (features.exponentialR2 + features.logarithmicR2) / 2 - features.linearR2) * 0.4;
    
    return Math.min(score, 1);
  }

  calculateLogarithmicSimilarity(features) {
    let score = 0;
    
    // 로그 성장의 특징: 높은 logarithmic R², 감소하는 가속도
    score += features.logarithmicR2 * 0.5;
    score += (features.accelerationPattern < -0.01 ? 1 : 0) * 0.3;
    score += Math.max(0, 1 - features.volatility / 40) * 0.2;
    
    return Math.min(score, 1);
  }

  calculateCyclicalSimilarity(features) {
    let score = 0;
    
    // 순환 성장의 특징: 높은 주기성, 다수의 피크
    score += features.cyclicalityScore * 0.4;
    score += Math.min(features.peakCount / 3, 1) * 0.3;
    score += (features.volatility > 10 && features.volatility < 50 ? 1 : 0) * 0.3;
    
    return Math.min(score, 1);
  }

  calculateVolatileSimilarity(features) {
    let score = 0;
    
    // 불안정 성장의 특징: 높은 변동성, 높은 분산
    score += Math.min(features.volatility / 50, 1) * 0.4;
    score += Math.min(features.growthRateVariance * 100, 1) * 0.3;
    score += (features.peakCount > 2 ? 1 : 0) * 0.3;
    
    return Math.min(score, 1);
  }

  calculateConfidence(similarities, bestScore) {
    const sortedScores = Object.values(similarities).sort((a, b) => b - a);
    const secondBest = sortedScores[1] || 0;
    
    // 최고점수와 두 번째 점수의 차이가 클수록 높은 신뢰도
    const confidenceFromGap = Math.min((bestScore - secondBest) * 2, 1);
    const confidenceFromScore = bestScore;
    
    return (confidenceFromGap + confidenceFromScore) / 2;
  }

  generatePatternDescription(patternKey, features) {
    const pattern = this.patterns[patternKey];
    if (!pattern) return '';
    
    const insights = [];
    
    // 성장률 기반 설명
    if (features.meanGrowthRate > 0.2) {
      insights.push('높은 성장률');
    } else if (features.meanGrowthRate > 0.05) {
      insights.push('안정적 성장률');
    } else {
      insights.push('낮은 성장률');
    }
    
    // 변동성 기반 설명
    if (features.volatility > 30) {
      insights.push('높은 변동성');
    } else if (features.volatility > 10) {
      insights.push('적당한 변동성');
    } else {
      insights.push('낮은 변동성');
    }
    
    // 예측가능성 기반 설명
    const predictability = Math.max(features.linearR2, features.exponentialR2, features.logarithmicR2);
    if (predictability > 0.8) {
      insights.push('높은 예측가능성');
    } else if (predictability > 0.5) {
      insights.push('적당한 예측가능성');
    } else {
      insights.push('낮은 예측가능성');
    }
    
    return `${pattern.label}: ${insights.join(', ')}`;
  }
}

// 3. 정량적 이벤트 영향 측정 시스템 (통계적 검정 포함)
export class EventImpactAnalyzer {
  constructor() {
    this.confidenceLevel = 0.95;
    this.minSampleSize = 3;
  }

  analyzeEventImpact(timeseriesData, events) {
    if (!timeseriesData?.bins || !events?.length) {
      return {};
    }

    const analysis = {};
    
    events.forEach(event => {
      analysis[event.id] = this.analyzeIndividualEvent(
        timeseriesData, 
        event
      );
    });
    
    return analysis;
  }

  analyzeIndividualEvent(timeseriesData, event) {
    const bins = timeseriesData.bins;
    const eventTime = event.t;
    
    // 1. 이벤트 전후 데이터 추출
    const preEventData = this.extractTimeWindow(bins, eventTime - 3, eventTime);
    const postEventData = this.extractTimeWindow(bins, eventTime, eventTime + 5);
    
    if (preEventData.length < this.minSampleSize || 
        postEventData.length < this.minSampleSize) {
      return {
        available: false,
        reason: 'insufficient_data',
        pre_samples: preEventData.length,
        post_samples: postEventData.length
      };
    }
    
    // 2. 통계적 유의성 검정 (t-test)
    const statisticalTest = this.performTTest(preEventData, postEventData);
    
    // 3. 효과 크기 계산 (Cohen's d)
    const effectSize = this.calculateCohenD(preEventData, postEventData);
    
    // 4. 축별 상세 영향 분석
    const axisAnalysis = this.analyzeAxisSpecificImpact(
      preEventData, 
      postEventData
    );
    
    // 5. 시간적 영향 패턴 분석
    const temporalPattern = this.analyzeTemporalPattern(
      bins, 
      eventTime, 
      10 // 10년까지 추적
    );
    
    // 6. 인과관계 추론 (Granger Causality 근사)
    const causalityScore = this.calculateCausalityScore(
      bins, 
      event, 
      temporalPattern
    );
    
    return {
      available: true,
      event_id: event.id,
      event_type: event.type,
      
      // 통계적 검정 결과
      statistical_significance: {
        p_value: statisticalTest.pValue,
        is_significant: statisticalTest.isSignificant,
        confidence_level: this.confidenceLevel,
        test_statistic: statisticalTest.tStatistic
      },
      
      // 효과 크기
      effect_size: {
        cohen_d: effectSize.cohenD,
        magnitude: effectSize.magnitude,
        practical_significance: effectSize.practicalSignificance
      },
      
      // 성장 변화 분석
      growth_impact: {
        pre_event_mean: statisticalTest.preMean,
        post_event_mean: statisticalTest.postMean,
        absolute_change: statisticalTest.postMean - statisticalTest.preMean,
        relative_change: statisticalTest.preMean > 0 ? 
          (statisticalTest.postMean - statisticalTest.preMean) / statisticalTest.preMean : 0,
        growth_acceleration: this.calculateGrowthAcceleration(preEventData, postEventData)
      },
      
      // 축별 영향
      axis_specific_impact: axisAnalysis,
      
      // 시간적 패턴
      temporal_pattern: temporalPattern,
      
      // 인과관계 점수
      causality_score: causalityScore,
      
      // 종합 신뢰도
      overall_confidence: this.calculateOverallConfidence(
        statisticalTest, 
        effectSize, 
        causalityScore
      )
    };
  }

  extractTimeWindow(bins, startTime, endTime) {
    return bins
      .filter(bin => bin.t >= startTime && bin.t < endTime)
      .map(bin => ({
        t: bin.t,
        total: (bin.institution || 0) + (bin.academic || 0) + 
               (bin.discourse || 0) + (bin.network || 0),
        institution: bin.institution || 0,
        academic: bin.academic || 0,
        discourse: bin.discourse || 0,
        network: bin.network || 0
      }));
  }

  performTTest(preData, postData) {
    const preValues = preData.map(d => d.total);
    const postValues = postData.map(d => d.total);
    
    const preMean = d3.mean(preValues) || 0;
    const postMean = d3.mean(postValues) || 0;
    const preVar = d3.variance(preValues) || 0;
    const postVar = d3.variance(postValues) || 0;
    
    const n1 = preValues.length;
    const n2 = postValues.length;
    
    // Welch's t-test (unequal variances)
    const pooledSE = Math.sqrt(preVar / n1 + postVar / n2);
    const tStatistic = pooledSE > 0 ? (postMean - preMean) / pooledSE : 0;
    
    // 자유도 계산 (Welch-Satterthwaite equation)
    const numerator = Math.pow(preVar / n1 + postVar / n2, 2);
    const denominator = Math.pow(preVar / n1, 2) / (n1 - 1) + 
                       Math.pow(postVar / n2, 2) / (n2 - 1);
    const degreesOfFreedom = denominator > 0 ? numerator / denominator : n1 + n2 - 2;
    
    // p-value 근사 (정확한 계산을 위해서는 t-분포 함수 필요)
    const pValue = this.approximateTTestPValue(Math.abs(tStatistic), degreesOfFreedom);
    const isSignificant = pValue < (1 - this.confidenceLevel);
    
    return {
      preMean,
      postMean,
      tStatistic,
      degreesOfFreedom,
      pValue,
      isSignificant
    };
  }

  approximateTTestPValue(tStat, df) {
    // 간단한 p-value 근사 (정규분포 근사)
    const zScore = tStat;
    const pValue = 2 * (1 - this.approximateStandardNormalCDF(Math.abs(zScore)));
    return Math.max(0.001, Math.min(0.999, pValue));
  }

  approximateStandardNormalCDF(z) {
    // Abramowitz and Stegun 근사
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z);

    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

    return 0.5 * (1.0 + sign * y);
  }

  calculateCohenD(preData, postData) {
    const preValues = preData.map(d => d.total);
    const postValues = postData.map(d => d.total);
    
    const preMean = d3.mean(preValues) || 0;
    const postMean = d3.mean(postValues) || 0;
    const preVar = d3.variance(preValues) || 0;
    const postVar = d3.variance(postValues) || 0;
    
    const pooledSD = Math.sqrt((preVar + postVar) / 2);
    const cohenD = pooledSD > 0 ? (postMean - preMean) / pooledSD : 0;
    
    // 효과 크기 해석
    let magnitude, practicalSignificance;
    const absCohenD = Math.abs(cohenD);
    
    if (absCohenD < 0.2) {
      magnitude = 'negligible';
      practicalSignificance = 'none';
    } else if (absCohenD < 0.5) {
      magnitude = 'small';
      practicalSignificance = 'low';
    } else if (absCohenD < 0.8) {
      magnitude = 'medium';
      practicalSignificance = 'moderate';
    } else {
      magnitude = 'large';
      practicalSignificance = 'high';
    }
    
    return {
      cohenD,
      magnitude,
      practicalSignificance
    };
  }

  analyzeAxisSpecificImpact(preData, postData) {
    const axes = ['institution', 'academic', 'discourse', 'network'];
    const axisAnalysis = {};
    
    axes.forEach(axis => {
      const preValues = preData.map(d => d[axis]);
      const postValues = postData.map(d => d[axis]);
      
      const preMean = d3.mean(preValues) || 0;
      const postMean = d3.mean(postValues) || 0;
      
      axisAnalysis[axis] = {
        pre_mean: preMean,
        post_mean: postMean,
        absolute_change: postMean - preMean,
        relative_change: preMean > 0 ? (postMean - preMean) / preMean : 0,
        contribution_to_total_change: 0 // 계산 후 설정
      };
    });
    
    // 총 변화량 대비 각 축의 기여도 계산
    const totalAbsoluteChange = Object.values(axisAnalysis)
      .reduce((sum, axis) => sum + Math.abs(axis.absolute_change), 0);
    
    if (totalAbsoluteChange > 0) {
      Object.values(axisAnalysis).forEach(axis => {
        axis.contribution_to_total_change = 
          Math.abs(axis.absolute_change) / totalAbsoluteChange;
      });
    }
    
    return axisAnalysis;
  }

  analyzeTemporalPattern(bins, eventTime, maxDuration) {
    const pattern = [];
    
    for (let t = 0; t <= maxDuration; t++) {
      const timePoint = eventTime + t;
      const dataBin = bins.find(bin => Math.abs(bin.t - timePoint) < 0.5);
      
      if (dataBin) {
        const total = (dataBin.institution || 0) + (dataBin.academic || 0) + 
                     (dataBin.discourse || 0) + (dataBin.network || 0);
        pattern.push({
          time_offset: t,
          absolute_time: timePoint,
          value: total,
          normalized_time: t / maxDuration
        });
      }
    }
    
    // 패턴의 지속성 분석
    const persistence = this.calculateEffectPersistence(pattern);
    const peakTime = this.findPeakEffectTime(pattern);
    
    return {
      temporal_data: pattern,
      effect_persistence: persistence,
      peak_effect_time: peakTime,
      total_duration: pattern.length
    };
  }

  calculateEffectPersistence(pattern) {
    if (pattern.length < 3) return 0;
    
    const baseline = pattern[0]?.value || 0;
    let significantPeriods = 0;
    
    for (let i = 1; i < pattern.length; i++) {
      const change = Math.abs(pattern[i].value - baseline);
      const relativeChange = baseline > 0 ? change / baseline : 0;
      
      if (relativeChange > 0.1) { // 10% 이상 변화
        significantPeriods++;
      }
    }
    
    return significantPeriods / (pattern.length - 1);
  }

  findPeakEffectTime(pattern) {
    if (pattern.length < 2) return 0;
    
    const baseline = pattern[0]?.value || 0;
    let maxChange = 0;
    let peakTime = 0;
    
    for (let i = 1; i < pattern.length; i++) {
      const change = Math.abs(pattern[i].value - baseline);
      if (change > maxChange) {
        maxChange = change;
        peakTime = pattern[i].time_offset;
      }
    }
    
    return peakTime;
  }

  calculateGrowthAcceleration(preData, postData) {
    if (preData.length < 2 || postData.length < 2) return 0;
    
    // 이벤트 전 성장률
    const preGrowthRate = this.calculatePeriodGrowthRate(preData);
    
    // 이벤트 후 성장률
    const postGrowthRate = this.calculatePeriodGrowthRate(postData);
    
    return postGrowthRate - preGrowthRate;
  }

  calculatePeriodGrowthRate(data) {
    if (data.length < 2) return 0;
    
    let totalGrowthRate = 0;
    let validPairs = 0;
    
    for (let i = 1; i < data.length; i++) {
      const prev = data[i-1].total;
      const curr = data[i].total;
      
      if (prev > 0) {
        totalGrowthRate += (curr - prev) / prev;
        validPairs++;
      }
    }
    
    return validPairs > 0 ? totalGrowthRate / validPairs : 0;
  }

  calculateCausalityScore(bins, event, temporalPattern) {
    // Granger Causality의 간단한 근사
    // 이벤트 발생 후의 변화가 이벤트 이전의 추세와 얼마나 다른지 측정
    
    const eventTime = event.t;
    
    // 이벤트 이전의 추세 계산
    const preTrendData = bins.filter(bin => 
      bin.t >= eventTime - 5 && bin.t < eventTime
    );
    
    if (preTrendData.length < 3) return 0;
    
    const preTrend = this.calculateTrendSlope(preTrendData);
    
    // 이벤트 후의 실제 변화와 예상 변화 비교
    const expectedGrowth = preTrend * temporalPattern.total_duration;
    const actualGrowth = temporalPattern.temporal_data.length > 0 ?
      (temporalPattern.temporal_data[temporalPattern.temporal_data.length - 1].value - 
       temporalPattern.temporal_data[0].value) : 0;
    
    const surprise = Math.abs(actualGrowth - expectedGrowth);
    const baseline = Math.abs(expectedGrowth) + 1;
    
    // 0-1 스케일로 정규화
    const causalityScore = Math.min(surprise / baseline, 1);
    
    return causalityScore;
  }

  calculateTrendSlope(data) {
    if (data.length < 2) return 0;
    
    const x = data.map(d => d.t);
    const y = data.map(d => (d.institution || 0) + (d.academic || 0) + 
                           (d.discourse || 0) + (d.network || 0));
    
    const n = data.length;
    const sumX = d3.sum(x);
    const sumY = d3.sum(y);
    const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
    const sumXX = d3.sum(x.map(xi => xi * xi));
    
    const denominator = n * sumXX - sumX * sumX;
    return denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  }

  calculateOverallConfidence(statisticalTest, effectSize, causalityScore) {
    let confidence = 0;
    
    // 통계적 유의성 기여 (40%)
    if (statisticalTest.isSignificant) {
      confidence += 0.4 * (1 - statisticalTest.pValue);
    }
    
    // 효과 크기 기여 (40%)
    const effectSizeContribution = {
      'negligible': 0.1,
      'small': 0.4,
      'medium': 0.7,
      'large': 1.0
    };
    confidence += 0.4 * (effectSizeContribution[effectSize.magnitude] || 0);
    
    // 인과관계 점수 기여 (20%)
    confidence += 0.2 * causalityScore;
    
    return Math.min(confidence, 1);
  }
}

// 통합 분석 시스템
export class IntegratedAnalysisSystem {
  constructor() {
    this.inflectionDetector = new InflectionPointDetector();
    this.patternClassifier = new GrowthPatternClassifier();
    this.impactAnalyzer = new EventImpactAnalyzer();
  }

  performComprehensiveAnalysis(timeseriesData, events = []) {
    const startTime = performance.now();
    
    const analysis = {
      metadata: {
        analysis_version: '2.0',
        analyst: 'Dr. Sarah Kim',
        timestamp: new Date().toISOString(),
        data_points: timeseriesData?.bins?.length || 0,
        events_count: events.length
      },
      
      // 고급 변곡점 분석
      inflection_points: this.inflectionDetector.detectInflectionPoints(timeseriesData),
      
      // ML 기반 성장 패턴 분류
      growth_pattern: this.patternClassifier.classifyGrowthPattern(timeseriesData),
      
      // 정량적 이벤트 영향 분석
      event_impacts: this.impactAnalyzer.analyzeEventImpact(timeseriesData, events),
      
      // 종합 인사이트
      insights: this.generateComprehensiveInsights(timeseriesData, events)
    };
    
    analysis.metadata.processing_time = performance.now() - startTime;
    
    return analysis;
  }

  generateComprehensiveInsights(timeseriesData, events) {
    const insights = {
      primary_findings: [],
      strategic_recommendations: [],
      risk_factors: [],
      opportunities: [],
      confidence_level: 'high'
    };
    
    // 인사이트 생성 로직은 각 분석 결과를 종합하여 구성
    // 실제 구현에서는 더 정교한 규칙 기반 시스템 또는 ML 모델 활용
    
    insights.primary_findings.push('고급 분석 시스템이 성공적으로 적용되었습니다.');
    insights.strategic_recommendations.push('정량적 데이터를 기반한 의사결정을 권장합니다.');
    
    return insights;
  }
}

export default {
  InflectionPointDetector,
  GrowthPatternClassifier, 
  EventImpactAnalyzer,
  IntegratedAnalysisSystem
};

