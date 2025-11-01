// CuratorOdyssey Phase 1 목업 데이터

export const mockArtistSummary = {
  artist_id: "ARTIST_0005",
  name: "양혜규",
  radar5: {
    I: 97.5,    // Institution (기관전시)
    F: 90.0,    // Fair (페어)  
    A: 92.0,    // Award (시상)
    M: 86.0,    // Media (미디어)
    Sedu: 9.8   // Seduction (교육)
  },
  sunburst_l1: {
    제도: 91.2,
    학술: 88.0, 
    담론: 86.0,
    네트워크: 90.0
  },
  weights_version: "AHP_v1",
  updated_at: "2024-10-16T00:00:00Z"
};

export const mockSunburstData = {
  name: "양혜규",
  children: [
    {
      name: "제도",
      axis: "INST",
      value: 91.2,
      children: [
        {
          name: "기관 전시",
          value: 62.5,
          children: [
            {
              name: "Tier-S 기관 전시",
              metric_code: "EXH_FREQ_TIER_S",
              value: 42.5,
              tooltip: {
                unit: "count",
                time_window: "10y(1.0/0.5)",
                normalization: "pct",
                weight: 0.50,
                source_id: "SRC_MOMA_2020",
                priority: 1,
                method_version: "AHP_v1",
                capture_hash: "sha256:abc123..."
              },
              children: [
                {
                  name: "MoMA 개인전",
                  metric_code: "EXH_MOMA_SOLO",
                  value: 25.0,
                  tooltip: {
                    unit: "count",
                    time_window: "10y(1.0/0.5)",
                    normalization: "pct", 
                    weight: 0.60,
                    source_id: "SRC_MOMA_2020",
                    priority: 1,
                    method_version: "AHP_v1"
                  }
                },
                {
                  name: "Tate Modern 기획전",
                  metric_code: "EXH_TATE_GROUP",
                  value: 17.5,
                  tooltip: {
                    unit: "count",
                    time_window: "10y(1.0/0.5)",
                    normalization: "pct",
                    weight: 0.40,
                    source_id: "SRC_TATE_2019",
                    priority: 1,
                    method_version: "AHP_v1"
                  }
                }
              ]
            },
            {
              name: "Tier-A 기관 전시",
              metric_code: "EXH_FREQ_TIER_A",
              value: 20.0,
              tooltip: {
                unit: "count",
                time_window: "10y(1.0/0.5)",
                normalization: "pct",
                weight: 0.30,
                source_id: "SRC_TATE_2019",
                priority: 1,
                method_version: "AHP_v1"
              },
              children: [
                {
                  name: "국립현대미술관",
                  value: 12.0
                },
                {
                  name: "리움미술관",
                  value: 8.0
                }
              ]
            }
          ]
        },
        {
          name: "국제 페어/비엔날레",
          value: 28.7,
          children: [
            {
              name: "베니스 비엔날레",
              value: 18.7
            },
            {
              name: "카셀 도큐멘타",
              value: 10.0
            }
          ]
        }
      ]
    },
    {
      name: "학술",
      axis: "SCHL", 
      value: 88.0,
      children: [
        {
          name: "논문/연구",
          value: 50.0,
          children: [
            {
              name: "A&HCI 논문",
              value: 30.0
            },
            {
              name: "단행본 수록",
              value: 20.0
            }
          ]
        },
        {
          name: "모노그래프",
          value: 38.0,
          children: [
            {
              name: "해외 출간",
              value: 25.0
            },
            {
              name: "국내 출간", 
              value: 13.0
            }
          ]
        }
      ]
    },
    {
      name: "담론",
      axis: "DISC",
      value: 86.0,
      children: [
        {
          name: "언론 보도",
          value: 45.0,
          children: [
            {
              name: "해외 주요 매체",
              value: 28.0
            },
            {
              name: "국내 주요 매체",
              value: 17.0
            }
          ]
        },
        {
          name: "온라인 담론",
          value: 41.0,
          children: [
            {
              name: "소셜 미디어",
              value: 24.0
            },
            {
              name: "아트 블로그",
              value: 17.0
            }
          ]
        }
      ]
    },
    {
      name: "네트워크",
      axis: "NET",
      value: 90.0,
      children: [
        {
          name: "협업 관계",
          value: 55.0,
          children: [
            {
              name: "큐레이터 네트워크",
              value: 32.0
            },
            {
              name: "작가 간 협업",
              value: 23.0
            }
          ]
        },
        {
          name: "기관 관계",
          value: 35.0,
          children: [
            {
              name: "뮤지엄 관계", 
              value: 20.0
            },
            {
              name: "갤러리 관계",
              value: 15.0
            }
          ]
        }
      ]
    }
  ]
};

// Phase 2: 완전한 20년 시계열 데이터 (Dr. Sarah Kim's Temporal Analysis)
export const mockTimeseriesData = {
  artist_id: "ARTIST_0005",
  artist_name: "양혜규",
  debut_year: 2003,
  bins: [
    // 초기 기반 구축기 (0-5년): 네트워크 중심 성장
    { t: 0, institution: 2.1, academic: 1.8, discourse: 3.2, network: 8.4 },
    { t: 1, institution: 3.7, academic: 2.9, discourse: 5.1, network: 12.3 },
    { t: 2, institution: 5.2, academic: 4.1, discourse: 7.8, network: 16.9 },
    { t: 3, institution: 8.4, academic: 6.7, discourse: 11.2, network: 22.1 },
    { t: 4, institution: 12.8, academic: 9.4, discourse: 14.6, network: 28.3 },
    { t: 5, institution: 18.5, academic: 13.2, discourse: 18.9, network: 35.1 },
    
    // 돌파구 시기 (6-10년): 제도권 진입과 학술적 인정
    { t: 6, institution: 26.7, academic: 19.8, discourse: 24.1, network: 42.8 },
    { t: 7, institution: 37.2, academic: 28.4, discourse: 31.6, network: 51.2 },
    { t: 8, institution: 52.4, academic: 39.7, discourse: 42.3, network: 58.9 }, // 베니스 비엔날레 효과
    { t: 9, institution: 69.8, academic: 52.1, discourse: 55.7, network: 67.4 },
    { t: 10, institution: 75.3, academic: 61.9, discourse: 64.2, network: 74.8 },
    
    // 성숙기 (11-15년): 담론 확산과 국제적 위상
    { t: 11, institution: 78.6, academic: 69.3, discourse: 71.8, network: 79.2 },
    { t: 12, institution: 82.1, academic: 74.7, discourse: 77.4, network: 82.8 },
    { t: 13, institution: 85.7, academic: 79.2, discourse: 81.3, network: 85.6 },
    { t: 14, institution: 88.3, academic: 82.8, discourse: 84.1, network: 87.9 },
    { t: 15, institution: 90.1, academic: 85.7, discourse: 86.2, network: 89.4 },
    
    // 현재-미래 (16-20년): 안정화와 새로운 도전
    { t: 16, institution: 91.2, academic: 87.4, discourse: 87.8, network: 90.3 },
    { t: 17, institution: 92.1, academic: 88.9, discourse: 88.9, network: 91.1 },
    { t: 18, institution: 92.8, academic: 90.1, discourse: 89.7, network: 91.8 },
    { t: 19, institution: 93.4, academic: 91.2, discourse: 90.4, network: 92.3 },
    { t: 20, institution: 94.0, academic: 92.1, discourse: 91.0, network: 92.8 }
  ],
  version: "AHP_v1",
  processed_at: "2024-10-16T00:00:00Z"
};

// Phase 2: 상세 커리어 이벤트 타임라인 (영향도 분석 포함)
export const mockCareerEvents = [
  {
    id: "E001",
    t: 1,
    title: "첫 개인전 '익숙한 것들의 변주'",
    type: "전시",
    org: "갤러리 현대",
    venue: "서울",
    impact_level: "medium",
    description: "작가로서의 정체성 확립",
    year: 2004
  },
  {
    id: "E002", 
    t: 3,
    title: "국제 그룹전 참가",
    type: "전시",
    org: "아시아 소사이어티",
    venue: "뉴욕",
    impact_level: "high",
    description: "국제 무대 데뷔",
    year: 2006
  },
  {
    id: "E003",
    t: 5,
    title: "첫 모노그래프 출간",
    type: "출간",
    org: "현실문화",
    venue: "서울", 
    impact_level: "medium",
    description: "학술적 기반 마련",
    year: 2008
  },
  {
    id: "E004",
    t: 8,
    title: "베니스 비엔날레 한국관 참가",
    type: "비엔날레",
    org: "베니스 비엔날레",
    venue: "베니스",
    impact_level: "high",
    description: "국제적 인지도 급상승의 결정적 계기",
    year: 2011
  },
  {
    id: "E005",
    t: 10,
    title: "아시아 태평양 예술상 수상",
    type: "수상",
    org: "아시아문화재단",
    venue: "도쿄",
    impact_level: "high",
    description: "아시아 지역 대표 작가로 위상 확립",
    year: 2013
  },
  {
    id: "E006",
    t: 12,
    title: "MoMA 컬렉션 입고",
    type: "협업",
    org: "뉴욕현대미술관",
    venue: "뉴욕",
    impact_level: "high",
    description: "글로벌 컬렉션 진입",
    year: 2015
  },
  {
    id: "E007",
    t: 14,
    title: "Tate Modern 대형 개인전",
    type: "전시",
    org: "테이트 모던",
    venue: "런던",
    impact_level: "high", 
    description: "유럽 주요 기관에서의 개인전",
    year: 2017
  },
  {
    id: "E008",
    t: 16,
    title: "서울시립미술관 대규모 회고전",
    type: "전시",
    org: "서울시립미술관",
    venue: "서울",
    impact_level: "high",
    description: "국내 커리어의 정점",
    year: 2019
  },
  {
    id: "E009",
    t: 18,
    title: "국제 큐레이터 워크샵 교육",
    type: "교육",
    org: "국제문화재단",
    venue: "서울",
    impact_level: "medium",
    description: "교육자로서의 새로운 역할",
    year: 2021
  },
  {
    id: "E010",
    t: 20,
    title: "디지털 아트 플랫폼 런칭",
    type: "협업",
    org: "테크 스타트업",
    venue: "서울",
    impact_level: "medium",
    description: "새로운 매체로의 확장",
    year: 2023
  }
];

// Phase 3 비교 분석용 목업 데이터
export const mockComparisonData = {
  artistA: { 
    id: 'ARTIST_0005',
    name: '양혜규',
    debut_year: 1999,
    highestPricePerHo: 45000000,
    total_score: 91.2
  },
  artistB: { 
    id: 'ARTIST_0003',
    name: '이우환', 
    debut_year: 1968,
    highestPricePerHo: 120000000,
    total_score: 88.7
  },
  axesData: [
    {
      axis: '제도',
      series: [
        { t: 0, v_A: 5.2, v_B: 12.1 },
        { t: 5, v_A: 18.7, v_B: 28.4 },
        { t: 10, v_A: 42.3, v_B: 48.7 },
        { t: 15, v_A: 67.8, v_B: 71.2 },
        { t: 20, v_A: 85.4, v_B: 87.9 },
        { t: 24, v_A: 91.2, v_B: 89.1 }
      ],
      trajectoryDifference: 156.8
    },
    {
      axis: '학술',
      series: [
        { t: 0, v_A: 8.1, v_B: 15.7 },
        { t: 5, v_A: 15.2, v_B: 32.8 },
        { t: 10, v_A: 28.9, v_B: 52.1 },
        { t: 15, v_A: 45.7, v_B: 68.4 },
        { t: 20, v_A: 65.3, v_B: 79.7 },
        { t: 24, v_A: 88.0, v_B: 85.2 }
      ],
      trajectoryDifference: 287.5
    },
    {
      axis: '담론',
      series: [
        { t: 0, v_A: 2.3, v_B: 8.9 },
        { t: 5, v_A: 12.8, v_B: 18.6 },
        { t: 10, v_A: 35.4, v_B: 31.7 },
        { t: 15, v_A: 58.2, v_B: 52.1 },
        { t: 20, v_A: 74.6, v_B: 69.8 },
        { t: 24, v_A: 86.0, v_B: 78.4 }
      ],
      trajectoryDifference: 98.3
    },
    {
      axis: '네트워크',
      series: [
        { t: 0, v_A: 4.7, v_B: 18.2 },
        { t: 5, v_A: 14.1, v_B: 35.9 },
        { t: 10, v_A: 31.8, v_B: 56.3 },
        { t: 15, v_A: 52.4, v_B: 71.8 },
        { t: 20, v_A: 71.9, v_B: 82.7 },
        { t: 24, v_A: 90.0, v_B: 88.5 }
      ],
      trajectoryDifference: 203.1
    }
  ],
  metadata: {
    totalDataPoints: 24,
    comparisonModel: 'AHP-Trajectory v2.1',
    lastUpdated: '2024-10-16T00:00:00Z'
  }
};

// 궤적-가치 분석 계산 함수
export const calculateTrajectoryAnalysis = (axesData, artistA, artistB, method = 'trajectory') => {
  // 각 축별 궤적 차이 계산 (Area Under Curve 방식)
  const axesWithCalculatedDifferences = axesData.map(axis => {
    if (!axis.trajectoryDifference) {
      // 궤적 차이 계산 로직 구현
      const artistAData = axis.series_A || [];
      const artistBData = axis.series_B || [];
      
      if (artistAData.length === 0 || artistBData.length === 0) {
        return { ...axis, trajectoryDifference: 0 };
      }
      
      // Area Under Curve (AUC) 방식으로 궤적 차이 계산
      const aucDifference = calculateAUCDifference(artistAData, artistBData);
      
      return { 
        ...axis, 
        trajectoryDifference: Math.abs(aucDifference),
        calculation_method: 'AUC_difference',
        data_points_A: artistAData.length,
        data_points_B: artistBData.length
      };
    }
    return axis;
  });
  
  // 총 궤적 차이 계산
  const totalTrajectoryDifference = axesWithCalculatedDifferences.reduce((sum, axis) => {
    return sum + (axis.trajectoryDifference || 0);
  }, 0);

  // 가장 큰 차이를 보이는 축 식별
  const dominantDifferenceAxis = axesWithCalculatedDifferences.reduce((max, current) => {
    return (current.trajectoryDifference || 0) > (max.trajectoryDifference || 0) ? current : max;
  });

  // 성장 패턴 유사도 계산 (피어슨 상관계수)
  const growthPatternSimilarity = calculateCorrelation(axesData);

  // 시장 가치 분석
  const marketAnalysis = {
    priceDifference: Math.abs(artistA.highestPricePerHo - artistB.highestPricePerHo),
    priceRatio: Math.max(artistA.highestPricePerHo, artistB.highestPricePerHo) / 
                Math.min(artistA.highestPricePerHo, artistB.highestPricePerHo),
    marketLeader: artistA.highestPricePerHo > artistB.highestPricePerHo ? artistA.name : artistB.name
  };

  // 궤적-가치 상관관계
  const trajectoryValueCorrelation = totalTrajectoryDifference / marketAnalysis.priceDifference * 100000;

  // 미래 성장 잠재력 (간단한 휴리스틱)
  const futurePotential = predictFuturePotential(axesData, artistA, artistB);

  // 축별 세부 분석
  const axisDetails = {};
  axesData.forEach(axis => {
    axisDetails[axis.axis] = {
      averageGrowthRate: calculateAverageGrowthRate(axis.series),
      inflectionPoints: countInflectionPoints(axis.series),
      currentGap: Math.abs(
        axis.series[axis.series.length - 1].v_A - 
        axis.series[axis.series.length - 1].v_B
      ),
      volatility: calculateVolatility(axis.series)
    };
  });

  return {
    model: `${method.toUpperCase()}-Analysis-v1.0`,
    totalTrajectoryDifference,
    dominantDifferenceAxis,
    growthPatternSimilarity,
    marketMaturity: {
      leader: marketAnalysis.marketLeader,
      score: marketAnalysis.priceRatio
    },
    priceVolatility: 0.23, // 목업 값
    trajectoryValueCorrelation,
    futurePotential,
    riskLevel: trajectoryValueCorrelation > 0.5 ? 'Low' : 'High',
    axisDetails,
    timestamp: new Date().toISOString()
  };
};

// AUC (Area Under Curve) 차이 계산 헬퍼 함수
const calculateAUCDifference = (seriesA, seriesB) => {
  if (!seriesA || !seriesB || seriesA.length === 0 || seriesB.length === 0) {
    return 0;
  }
  
  // 두 시계열을 동일한 시간 범위로 정규화
  const normalizedData = normalizeTimeSeries(seriesA, seriesB);
  
  // 각 시계열의 AUC 계산
  const aucA = calculateAUC(normalizedData.seriesA);
  const aucB = calculateAUC(normalizedData.seriesB);
  
  // 차이 반환
  return aucA - aucB;
};

// 시계열 정규화 (동일한 시간 범위로 맞춤)
const normalizeTimeSeries = (seriesA, seriesB) => {
  const allTimes = [...new Set([
    ...seriesA.map(d => d.t || d.time || d.year),
    ...seriesB.map(d => d.t || d.time || d.year)
  ])].sort((a, b) => a - b);
  
  const normalizedA = allTimes.map(time => {
    const dataPoint = seriesA.find(d => (d.t || d.time || d.year) === time);
    return {
      t: time,
      v: dataPoint ? (dataPoint.v || dataPoint.value || 0) : 0
    };
  });
  
  const normalizedB = allTimes.map(time => {
    const dataPoint = seriesB.find(d => (d.t || d.time || d.year) === time);
    return {
      t: time,
      v: dataPoint ? (dataPoint.v || dataPoint.value || 0) : 0
    };
  });
  
  return { seriesA: normalizedA, seriesB: normalizedB };
};

// AUC 계산 (사다리꼴 공식 사용)
const calculateAUC = (series) => {
  if (series.length < 2) return 0;
  
  let auc = 0;
  for (let i = 1; i < series.length; i++) {
    const timeDiff = series[i].t - series[i-1].t;
    const avgValue = (series[i].v + series[i-1].v) / 2;
    auc += timeDiff * avgValue;
  }
  
  return auc;
};

// 헬퍼 함수들
const calculateCorrelation = (axesData) => {
  // 간단한 상관관계 계산 (실제로는 더 정교한 알고리즘 필요)
  const similarities = axesData.map(axis => {
    const seriesA = axis.series.map(d => d.v_A);
    const seriesB = axis.series.map(d => d.v_B);
    return pearsonCorrelation(seriesA, seriesB);
  });
  
  return similarities.reduce((sum, r) => sum + Math.abs(r), 0) / similarities.length;
};

export const pearsonCorrelation = (x, y) => {
  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  return numerator / Math.sqrt(denomX * denomY);
};

const predictFuturePotential = (axesData, artistA, artistB) => {
  // 최근 성장률 기반 단순 예측
  const recentGrowthA = calculateRecentGrowth(axesData, 'v_A');
  const recentGrowthB = calculateRecentGrowth(axesData, 'v_B');
  
  if (recentGrowthA > recentGrowthB) {
    return {
      leader: artistA.name,
      growthRate: recentGrowthA,
      confidence: 0.75
    };
  } else {
    return {
      leader: artistB.name,
      growthRate: recentGrowthB,
      confidence: 0.75
    };
  }
};

const calculateRecentGrowth = (axesData, valueKey) => {
  const recentPeriods = 3; // 최근 3 구간
  let totalGrowth = 0;
  
  axesData.forEach(axis => {
    const series = axis.series;
    if (series.length >= recentPeriods) {
      const recent = series.slice(-recentPeriods);
      const growth = (recent[recent.length - 1][valueKey] - recent[0][valueKey]) / recent[0][valueKey];
      totalGrowth += growth;
    }
  });
  
  return (totalGrowth / axesData.length) * 100;
};

const calculateAverageGrowthRate = (series) => {
  if (series.length < 2) return 0;
  
  let totalGrowth = 0;
  let count = 0;
  
  for (let i = 1; i < series.length; i++) {
    const growthA = (series[i].v_A - series[i-1].v_A) / (series[i].t - series[i-1].t);
    const growthB = (series[i].v_B - series[i-1].v_B) / (series[i].t - series[i-1].t);
    totalGrowth += (growthA + growthB) / 2;
    count++;
  }
  
  return count > 0 ? totalGrowth / count : 0;
};

const countInflectionPoints = (series) => {
  // 간단한 변곡점 감지 (실제로는 더 정교한 알고리즘 필요)
  let inflections = 0;
  
  for (let i = 1; i < series.length - 1; i++) {
    const prev = series[i-1];
    const curr = series[i];
    const next = series[i+1];
    
    // A와 B 모두에 대해 변곡점 체크
    const isInflectionA = (curr.v_A - prev.v_A) * (next.v_A - curr.v_A) < 0;
    const isInflectionB = (curr.v_B - prev.v_B) * (next.v_B - curr.v_B) < 0;
    
    if (isInflectionA || isInflectionB) inflections++;
  }
  
  return inflections;
};

const calculateVolatility = (series) => {
  // 변동성 계산 (표준편차 기반)
  const valuesA = series.map(d => d.v_A);
  const valuesB = series.map(d => d.v_B);
  
  const stdA = standardDeviation(valuesA);
  const stdB = standardDeviation(valuesB);
  
  return (stdA + stdB) / 2;
};

export const standardDeviation = (values) => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
};
