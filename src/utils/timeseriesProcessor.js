/**
 * CuratorOdyssey Phase 2 - 시계열 데이터 처리 엔진
 * Dr. Sarah Kim's Advanced Temporal Analytics System
 * 
 * 데뷔년 기준 상대 시간축, 누적 스택 계산, 성장 패턴 분석
 */

import * as d3 from 'd3';

// 1. 데뷔년 기준 상대 시간축 변환
export const normalizeTimeAxis = (timeseriesData, debutYear) => {
  if (!timeseriesData || !timeseriesData.bins) return null;

  return {
    ...timeseriesData,
    bins: timeseriesData.bins.map(point => ({
      ...point,
      t: point.year ? point.year - debutYear : point.t, // 절대년도 → 상대시간 변환
      relativeYear: point.year ? point.year - debutYear : point.t
    })).sort((a, b) => a.t - b.t) // 시간순 정렬 보장
  };
};

// 2. 4축 누적 스택 데이터 계산 (D3 Stack Layout 전처리)
export const calculateStackedData = (timeseriesData) => {
  if (!timeseriesData || !timeseriesData.bins) return null;

  // 4축 데이터 정규화
  const processedBins = timeseriesData.bins.map(point => ({
    t: point.t,
    제도: point.institution || point.inst || 0,
    학술: point.academic || point.schl || 0,
    담론: point.discourse || point.disc || 0,
    네트워크: point.network || point.net || 0
  }));

  // 누적 스택 계산을 위한 D3 Stack Layout 적용
  const stack = d3.stack()
    .keys(['네트워크', '담론', '학술', '제도']) // 안정성 순서 (하단부터)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  const stackedData = stack(processedBins);

  return {
    raw: processedBins,
    stacked: stackedData,
    maxValue: d3.max(stackedData[stackedData.length - 1], d => d[1])
  };
};

// 3. 성장 패턴 분석 (변곡점 감지, 성장률 계산)
export const analyzeGrowthPatterns = (timeseriesData) => {
  if (!timeseriesData || !timeseriesData.bins || timeseriesData.bins.length < 3) {
    return { patterns: [], inflectionPoints: [], growthRates: {} };
  }

  const bins = timeseriesData.bins;
  const totalValues = bins.map(d => 
    (d.institution || 0) + (d.academic || 0) + (d.discourse || 0) + (d.network || 0)
  );

  // 성장률 계산 (구간별)
  const growthRates = [];
  for (let i = 1; i < bins.length; i++) {
    const prev = totalValues[i - 1];
    const curr = totalValues[i];
    const timeDiff = bins[i].t - bins[i - 1].t;
    
    if (prev > 0 && timeDiff > 0) {
      growthRates.push({
        period: [bins[i - 1].t, bins[i].t],
        rate: ((curr - prev) / prev) / timeDiff, // 연평균 성장률
        absoluteGrowth: curr - prev
      });
    }
  }

  // 변곡점 감지 (2차 미분 기반)
  const inflectionPoints = [];
  if (growthRates.length >= 2) {
    for (let i = 1; i < growthRates.length; i++) {
      const prevRate = growthRates[i - 1].rate;
      const currRate = growthRates[i].rate;
      const acceleration = currRate - prevRate;
      
      // 가속도 변화가 임계값을 초과하면 변곡점으로 인식
      if (Math.abs(acceleration) > 0.1) {
        inflectionPoints.push({
          t: growthRates[i].period[0],
          type: acceleration > 0 ? '가속' : '감속',
          magnitude: Math.abs(acceleration),
          value: totalValues[i]
        });
      }
    }
  }

  // 성장 패턴 분류
  const averageGrowthRate = d3.mean(growthRates, d => d.rate) || 0;
  const growthVolatility = d3.deviation(growthRates, d => d.rate) || 0;

  let primaryPattern = '안정성장';
  if (averageGrowthRate > 0.3) primaryPattern = '급속성장';
  else if (averageGrowthRate < 0.05) primaryPattern = '정체';
  else if (growthVolatility > 0.2) primaryPattern = '변동성장';

  // 축별 기여도 분석
  const axisContributions = {
    제도: d3.mean(bins, d => d.institution || 0),
    학술: d3.mean(bins, d => d.academic || 0),
    담론: d3.mean(bins, d => d.discourse || 0),
    네트워크: d3.mean(bins, d => d.network || 0)
  };

  const dominantAxis = Object.entries(axisContributions)
    .sort(([,a], [,b]) => b - a)[0][0];

  return {
    patterns: [primaryPattern],
    inflectionPoints,
    growthRates,
    averageGrowthRate,
    growthVolatility,
    dominantAxis,
    axisContributions
  };
};

// 4. 이벤트 영향도 분석 (전후 비교, 지연 효과)
export const analyzeEventImpact = (timeseriesData, events) => {
  if (!timeseriesData || !events || events.length === 0) return {};

  const bins = timeseriesData.bins;
  const impactAnalysis = {};

  events.forEach(event => {
    const eventTime = event.t;
    
    // 이벤트 전후 데이터 추출 (기본 2년 윈도우)
    const preWindow = 2;
    const postWindow = 3;
    
    const prePeriod = bins.filter(d => 
      d.t >= (eventTime - preWindow) && d.t < eventTime
    );
    const postPeriod = bins.filter(d => 
      d.t > eventTime && d.t <= (eventTime + postWindow)
    );

    if (prePeriod.length === 0 || postPeriod.length === 0) {
      impactAnalysis[event.id] = { 
        growth_acceleration: 0, 
        confidence: 'low',
        reason: 'insufficient_data' 
      };
      return;
    }

    // 이벤트 전후 성장률 계산
    const preAvg = d3.mean(prePeriod, d => 
      (d.institution || 0) + (d.academic || 0) + (d.discourse || 0) + (d.network || 0)
    );
    const postAvg = d3.mean(postPeriod, d => 
      (d.institution || 0) + (d.academic || 0) + (d.discourse || 0) + (d.network || 0)
    );

    const growthAcceleration = preAvg > 0 ? (postAvg - preAvg) / preAvg : 0;

    // 축별 영향 분석
    const axisImpacts = {};
    ['institution', 'academic', 'discourse', 'network'].forEach(axis => {
      const preAxisAvg = d3.mean(prePeriod, d => d[axis] || 0);
      const postAxisAvg = d3.mean(postPeriod, d => d[axis] || 0);
      axisImpacts[axis] = preAxisAvg > 0 ? (postAxisAvg - preAxisAvg) / preAxisAvg : 0;
    });

    const primaryAxis = Object.entries(axisImpacts)
      .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))[0][0];

    // 상관계수 계산 (이벤트와 성장의 연관성)
    const correlationWindow = bins.filter(d => 
      d.t >= (eventTime - 1) && d.t <= (eventTime + 2)
    );
    
    let correlationCoefficient = 0;
    if (correlationWindow.length > 2) {
      const distances = correlationWindow.map(d => Math.abs(d.t - eventTime));
      const values = correlationWindow.map(d => 
        (d.institution || 0) + (d.academic || 0) + (d.discourse || 0) + (d.network || 0)
      );
      
      // 피어슨 상관계수 근사
      correlationCoefficient = -d3.mean(distances.map((dist, i) => dist * values[i])) || 0;
    }

    impactAnalysis[event.id] = {
      growth_acceleration: growthAcceleration,
      primary_axis: {
        institution: '제도',
        academic: '학술', 
        discourse: '담론',
        network: '네트워크'
      }[primaryAxis] || '전체',
      axis_impacts: {
        제도: axisImpacts.institution || 0,
        학술: axisImpacts.academic || 0,
        담론: axisImpacts.discourse || 0,
        네트워크: axisImpacts.network || 0
      },
      duration_months: postWindow * 12,
      correlation_coefficient: correlationCoefficient,
      confidence: Math.abs(growthAcceleration) > 0.1 ? 'high' : 'medium'
    };
  });

  return impactAnalysis;
};

// 5. 데이터 보간 및 스무딩 (결측치 처리)
export const interpolateTimeseries = (timeseriesData, targetResolution = 1) => {
  if (!timeseriesData || !timeseriesData.bins) return timeseriesData;

  const bins = [...timeseriesData.bins].sort((a, b) => a.t - b.t);
  const minTime = Math.min(...bins.map(d => d.t));
  const maxTime = Math.max(...bins.map(d => d.t));
  
  // 목표 해상도로 시간 격자 생성
  const timeGrid = [];
  for (let t = minTime; t <= maxTime; t += targetResolution) {
    timeGrid.push(t);
  }

  // 축별 보간 함수 생성
  const axes = ['institution', 'academic', 'discourse', 'network'];
  const interpolators = {};
  
  axes.forEach(axis => {
    const validPoints = bins
      .filter(d => d[axis] !== undefined && d[axis] !== null)
      .map(d => [d.t, d[axis]]);
    
    if (validPoints.length >= 2) {
      interpolators[axis] = d3.scaleLinear()
        .domain(validPoints.map(d => d[0]))
        .range(validPoints.map(d => d[1]));
    }
  });

  // 보간된 데이터 생성
  const interpolatedBins = timeGrid.map(t => {
    const interpolated = { t };
    
    axes.forEach(axis => {
      if (interpolators[axis]) {
        interpolated[axis] = interpolators[axis](t);
      } else {
        interpolated[axis] = 0;
      }
    });
    
    return interpolated;
  });

  return {
    ...timeseriesData,
    bins: interpolatedBins,
    interpolated: true,
    originalPoints: bins.length,
    interpolatedPoints: interpolatedBins.length
  };
};

// 6. 성장 예측 힌트 생성 (3-5년 전망)
export const generateGrowthForecast = (timeseriesData, growthAnalysis) => {
  if (!timeseriesData || !growthAnalysis) return null;

  const { growthRates, dominantAxis, averageGrowthRate } = growthAnalysis;
  const lastPoint = timeseriesData.bins[timeseriesData.bins.length - 1];
  
  if (!lastPoint) return null;

  // 최근 3년 성장 트렌드 분석
  const recentGrowth = growthRates.slice(-3);
  const trendSlope = recentGrowth.length > 1 ? 
    (recentGrowth[recentGrowth.length - 1].rate - recentGrowth[0].rate) / recentGrowth.length : 0;

  // 예측 시나리오 생성
  const forecasts = [];
  const currentTotal = (lastPoint.institution || 0) + (lastPoint.academic || 0) + 
                     (lastPoint.discourse || 0) + (lastPoint.network || 0);

  // 보수적 시나리오 (현재 성장률 유지)
  forecasts.push({
    scenario: 'conservative',
    description: '현재 성장률 유지',
    projectedValue: currentTotal * (1 + averageGrowthRate * 3),
    confidence: 0.7,
    keyFactors: [dominantAxis + ' 축 지속 성장']
  });

  // 낙관적 시나리오 (성장 가속화)
  if (trendSlope > 0) {
    forecasts.push({
      scenario: 'optimistic',
      description: '성장 가속화 지속',
      projectedValue: currentTotal * (1 + (averageGrowthRate + trendSlope) * 3),
      confidence: 0.5,
      keyFactors: ['새로운 기회 창출', dominantAxis + ' 축 확장']
    });
  }

  // 정체 시나리오
  forecasts.push({
    scenario: 'stagnant', 
    description: '성장 둔화',
    projectedValue: currentTotal * (1 + averageGrowthRate * 0.5 * 3),
    confidence: 0.6,
    keyFactors: ['시장 포화', '경쟁 심화']
  });

  return {
    timeHorizon: '3년',
    currentValue: currentTotal,
    forecasts,
    recommendedFocus: dominantAxis,
    riskFactors: trendSlope < -0.1 ? ['성장 둔화 신호'] : ['외부 환경 변화']
  };
};

// 7. 통합 데이터 처리 파이프라인 
export const processTimeseriesData = (rawData, events = [], debutYear) => {
  try {
    // 1단계: 시간축 정규화
    const normalizedData = normalizeTimeAxis(rawData, debutYear);
    if (!normalizedData) throw new Error('시간축 정규화 실패');

    // 2단계: 데이터 보간
    const interpolatedData = interpolateTimeseries(normalizedData, 0.5);

    // 3단계: 스택 데이터 계산
    const stackedData = calculateStackedData(interpolatedData);

    // 4단계: 성장 패턴 분석
    const growthAnalysis = analyzeGrowthPatterns(interpolatedData);

    // 5단계: 이벤트 영향 분석
    const eventImpactAnalysis = analyzeEventImpact(interpolatedData, events);

    // 6단계: 미래 예측
    const growthForecast = generateGrowthForecast(interpolatedData, growthAnalysis);

    return {
      processed: true,
      timestamp: new Date().toISOString(),
      data: {
        timeseries: interpolatedData,
        stacked: stackedData,
        analysis: growthAnalysis,
        eventImpacts: eventImpactAnalysis,
        forecast: growthForecast
      },
      metadata: {
        originalPoints: rawData?.bins?.length || 0,
        processedPoints: interpolatedData?.bins?.length || 0,
        eventsAnalyzed: events?.length || 0,
        processingTime: Date.now()
      }
    };

  } catch (error) {
    console.error('Timeseries processing error:', error);
    return {
      processed: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  normalizeTimeAxis,
  calculateStackedData, 
  analyzeGrowthPatterns,
  analyzeEventImpact,
  interpolateTimeseries,
  generateGrowthForecast,
  processTimeseriesData
};
