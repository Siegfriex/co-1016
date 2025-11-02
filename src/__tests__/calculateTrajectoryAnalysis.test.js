import { 
  calculateTrajectoryAnalysis,
  mockComparisonData,
  standardDeviation,
  pearsonCorrelation 
} from '../utils/mockData';

describe('Phase 3 Statistical Analysis Functions - Professional Grade Tests', () => {
  let mockAxesData;
  let mockArtistA;
  let mockArtistB;

  beforeEach(() => {
    mockAxesData = [
      {
        axis: '제도',
        series: [
          { t: 0, v_A: 5.2, v_B: 12.1 },
          { t: 5, v_A: 18.7, v_B: 28.4 },
          { t: 10, v_A: 42.3, v_B: 48.7 },
          { t: 15, v_A: 67.8, v_B: 71.2 },
          { t: 20, v_A: 85.4, v_B: 87.9 }
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
          { t: 20, v_A: 65.3, v_B: 79.7 }
        ],
        trajectoryDifference: 287.5
      }
    ];

    mockArtistA = { name: '양혜규', highestPricePerHo: 45000000 };
    mockArtistB = { name: '이우환', highestPricePerHo: 120000000 };
  });

  describe('calculateTrajectoryAnalysis - Mathematical Precision', () => {
    test('should calculate total trajectory difference with AUC precision', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      expect(result.totalTrajectoryDifference).toBe(444.3); // 156.8 + 287.5
      expect(typeof result.totalTrajectoryDifference).toBe('number');
      expect(result.totalTrajectoryDifference).toBeGreaterThan(0);
    });

    test('should identify dominant difference axis mathematically', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      expect(result.dominantDifferenceAxis.axis).toBe('학술');
      expect(result.dominantDifferenceAxis.trajectoryDifference).toBe(287.5);
      
      // 검증: 실제로 가장 큰 차이인지 확인
      const maxDiff = Math.max(...mockAxesData.map(a => a.trajectoryDifference));
      expect(result.dominantDifferenceAxis.trajectoryDifference).toBe(maxDiff);
    });

    test('should calculate market analysis with proper ratios', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      expect(result.marketMaturity.leader).toBe('이우환');
      
      const expectedRatio = 120000000 / 45000000; // 2.666...
      expect(result.marketMaturity.score).toBeCloseTo(expectedRatio, 2);
      expect(result.marketMaturity.score).toBeGreaterThan(1);
    });

    test('should calculate growth pattern similarity using Pearson correlation', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      expect(result.growthPatternSimilarity).toBeGreaterThanOrEqual(0);
      expect(result.growthPatternSimilarity).toBeLessThanOrEqual(1);
      expect(typeof result.growthPatternSimilarity).toBe('number');
      expect(Number.isFinite(result.growthPatternSimilarity)).toBe(true);
    });

    test('should assign risk level based on scientific correlation thresholds', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      expect(['Low', 'High']).toContain(result.riskLevel);
      
      // 과학적 기준: 상관관계 > 0.5면 Low Risk
      const expectedRisk = result.trajectoryValueCorrelation > 0.5 ? 'Low' : 'High';
      expect(result.riskLevel).toBe(expectedRisk);
    });

    test('should include comprehensive axis details with statistical measures', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      expect(result.axisDetails).toHaveProperty('제도');
      expect(result.axisDetails).toHaveProperty('학술');
      
      // 각 축별 세부 통계 검증
      Object.values(result.axisDetails).forEach(details => {
        expect(details).toHaveProperty('averageGrowthRate');
        expect(details).toHaveProperty('inflectionPoints');
        expect(details).toHaveProperty('currentGap');
        expect(details).toHaveProperty('volatility');
        
        expect(typeof details.averageGrowthRate).toBe('number');
        expect(typeof details.inflectionPoints).toBe('number');
        expect(details.inflectionPoints).toBeGreaterThanOrEqual(0);
      });
    });

    test('should handle different analysis methods with consistent model versioning', () => {
      const trajectoryResult = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB, 'trajectory');
      const marketResult = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB, 'market');
      const combinedResult = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB, 'combined');

      expect(trajectoryResult.model).toBe('TRAJECTORY-Analysis-v1.0');
      expect(marketResult.model).toBe('MARKET-Analysis-v1.0');
      expect(combinedResult.model).toBe('COMBINED-Analysis-v1.0');
      
      // 모든 결과에 타임스탬프 포함 확인
      expect(trajectoryResult.timestamp).toBeDefined();
      expect(marketResult.timestamp).toBeDefined();
      expect(combinedResult.timestamp).toBeDefined();
    });
  });

  describe('Statistical Helper Functions - Mathematical Accuracy', () => {
    test('standardDeviation should calculate correctly for known datasets', () => {
      const testData = [1, 2, 3, 4, 5];
      const result = standardDeviation(testData);
      
      // 수학적 정확성: sqrt((2-3)² + (4-3)² + ... / 5) = sqrt(2) ≈ 1.414
      expect(result).toBeCloseTo(1.414, 2);
    });

    test('pearsonCorrelation should return correct values for known relationships', () => {
      const perfectCorrelation = [1, 2, 3, 4, 5];
      const perfectAntiCorrelation = [5, 4, 3, 2, 1];
      const noCorrelation = [1, 3, 2, 5, 4];
      
      expect(pearsonCorrelation(perfectCorrelation, perfectCorrelation)).toBeCloseTo(1, 3);
      expect(pearsonCorrelation(perfectCorrelation, perfectAntiCorrelation)).toBeCloseTo(-1, 3);
      expect(Math.abs(pearsonCorrelation(perfectCorrelation, noCorrelation))).toBeLessThan(0.8);
    });

    test('should handle edge cases gracefully without NaN', () => {
      const emptyAxesData = [];
      const result = calculateTrajectoryAnalysis(emptyAxesData, mockArtistA, mockArtistB);
      
      expect(result.totalTrajectoryDifference).toBe(0);
      expect(result.axisDetails).toEqual({});
      expect(Number.isNaN(result.growthPatternSimilarity)).toBe(false);
    });

    test('should handle identical data series without division by zero', () => {
      const identicalData = [
        {
          axis: '제도',
          series: [
            { t: 0, v_A: 50, v_B: 50 },
            { t: 5, v_A: 50, v_B: 50 },
            { t: 10, v_A: 50, v_B: 50 }
          ],
          trajectoryDifference: 0
        }
      ];
      
      const result = calculateTrajectoryAnalysis(identicalData, mockArtistA, mockArtistB);
      
      expect(Number.isFinite(result.growthPatternSimilarity)).toBe(true);
      expect(Number.isFinite(result.totalTrajectoryDifference)).toBe(true);
    });

    test('should maintain mathematical consistency across multiple calls', () => {
      const result1 = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      const result2 = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      // 동일한 입력에 대해 항상 동일한 결과
      expect(result1.totalTrajectoryDifference).toBe(result2.totalTrajectoryDifference);
      expect(result1.dominantDifferenceAxis.axis).toBe(result2.dominantDifferenceAxis.axis);
      expect(result1.marketMaturity.score).toBe(result2.marketMaturity.score);
    });
  });

  describe('Business Logic Validation - Maya Chen Expertise', () => {
    test('future potential prediction should be logically consistent', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      expect(result.futurePotential).toHaveProperty('leader');
      expect(result.futurePotential).toHaveProperty('growthRate');
      expect(result.futurePotential).toHaveProperty('confidence');
      
      expect(['양혜규', '이우환']).toContain(result.futurePotential.leader);
      expect(result.futurePotential.confidence).toBeGreaterThan(0);
      expect(result.futurePotential.confidence).toBeLessThanOrEqual(1);
    });

    test('trajectory value correlation should make business sense', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      expect(typeof result.trajectoryValueCorrelation).toBe('number');
      expect(Number.isFinite(result.trajectoryValueCorrelation)).toBe(true);
      
      // 비즈니스 로직: 궤적 차이가 클수록 가치 차이도 클 것으로 예상
      expect(result.trajectoryValueCorrelation).toBeGreaterThan(0);
    });

    test('should provide complete axis analysis for comparative insights', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      // Maya Chen 비교 분석 전문성: 모든 축에 대한 세부 분석 필수
      mockAxesData.forEach(axis => {
        const details = result.axisDetails[axis.axis];
        expect(details).toBeDefined();
        
        // 비즈니스 인텔리전스를 위한 필수 지표들
        expect(details.averageGrowthRate).toBeGreaterThanOrEqual(0);
        expect(details.currentGap).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(details.inflectionPoints)).toBe(true);
      });
    });
  });

  describe('Mock Data Integrity - Production Readiness', () => {
    test('mockComparisonData should follow 1016blprint.md schema', () => {
      expect(mockComparisonData).toHaveProperty('artistA');
      expect(mockComparisonData).toHaveProperty('artistB');
      expect(mockComparisonData).toHaveProperty('axesData');
      expect(mockComparisonData).toHaveProperty('metadata');
      
      // 블루프린트 준수: 4축 시스템
      expect(mockComparisonData.axesData).toBeInstanceOf(Array);
      expect(mockComparisonData.axesData.length).toBe(4);
      
      // 필수 축 검증
      const requiredAxes = ['제도', '학술', '담론', '네트워크'];
      const actualAxes = mockComparisonData.axesData.map(a => a.axis);
      requiredAxes.forEach(axis => {
        expect(actualAxes).toContain(axis);
      });
    });

    test('each axis data should have proper time series structure', () => {
      mockComparisonData.axesData.forEach(axis => {
        expect(axis).toHaveProperty('axis');
        expect(axis).toHaveProperty('series');
        expect(axis).toHaveProperty('trajectoryDifference');
        
        expect(axis.series).toBeInstanceOf(Array);
        expect(axis.series.length).toBeGreaterThan(0);
        
        axis.series.forEach(dataPoint => {
          expect(dataPoint).toHaveProperty('t');
          expect(dataPoint).toHaveProperty('v_A');
          expect(dataPoint).toHaveProperty('v_B');
          
          // 데이터 품질 검증
          expect(typeof dataPoint.t).toBe('number');
          expect(typeof dataPoint.v_A).toBe('number');
          expect(typeof dataPoint.v_B).toBe('number');
          
          expect(dataPoint.t).toBeGreaterThanOrEqual(0);
          expect(dataPoint.v_A).toBeGreaterThanOrEqual(0);
          expect(dataPoint.v_B).toBeGreaterThanOrEqual(0);
        });
      });
    });

    test('should maintain chronological order in time series', () => {
      mockComparisonData.axesData.forEach(axis => {
        for (let i = 1; i < axis.series.length; i++) {
          expect(axis.series[i].t).toBeGreaterThan(axis.series[i-1].t);
        }
      });
    });
  });

  describe('Performance and Edge Cases - Production Grade', () => {
    test('should handle large datasets efficiently', () => {
      const largeMockData = Array.from({ length: 100 }, (_, i) => ({
        axis: `axis_${i}`,
        series: Array.from({ length: 50 }, (_, j) => ({
          t: j,
          v_A: Math.random() * 100,
          v_B: Math.random() * 100
        })),
        trajectoryDifference: Math.random() * 500
      }));

      const startTime = performance.now();
      const result = calculateTrajectoryAnalysis(largeMockData, mockArtistA, mockArtistB);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 100ms 내 완료
      expect(result).toBeDefined();
      expect(result.totalTrajectoryDifference).toBeGreaterThan(0);
    });

    test('should handle extreme market values without overflow', () => {
      const extremeArtistA = { ...mockArtistA, highestPricePerHo: 1000000000000 }; // 1조
      const extremeArtistB = { ...mockArtistB, highestPricePerHo: 1 };
      
      const result = calculateTrajectoryAnalysis(mockAxesData, extremeArtistA, extremeArtistB);
      
      expect(Number.isFinite(result.marketMaturity.score)).toBe(true);
      expect(result.marketMaturity.score).toBeGreaterThan(0);
    });

    test('should provide meaningful results for similar artists', () => {
      const similarArtists = {
        artistA: { name: 'Artist A', highestPricePerHo: 50000000 },
        artistB: { name: 'Artist B', highestPricePerHo: 52000000 }
      };
      
      const result = calculateTrajectoryAnalysis(mockAxesData, similarArtists.artistA, similarArtists.artistB);
      
      expect(result.riskLevel).toBeDefined();
      expect(result.futurePotential).toBeDefined();
      expect(Math.abs(result.marketMaturity.score - 1)).toBeLessThan(0.1); // 비슷한 시장 가치
    });
  });

  describe('Maya Chen Business Intelligence Validation', () => {
    test('should provide actionable insights for gallery curation', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      // 갤러리 기획자를 위한 의사결정 지원 데이터
      expect(result.futurePotential.leader).toBeDefined();
      expect(result.riskLevel).toBeDefined();
      expect(result.dominantDifferenceAxis).toBeDefined();
      
      // 투자 포트폴리오 최적화를 위한 지표
      expect(result.trajectoryValueCorrelation).toBeDefined();
      expect(result.priceVolatility).toBeDefined();
    });

    test('should support collector decision making with market insights', () => {
      const result = calculateTrajectoryAnalysis(mockAxesData, mockArtistA, mockArtistB);
      
      // 컬렉터를 위한 시장 분석
      expect(result.marketMaturity.leader).toBeDefined();
      expect(result.marketMaturity.score).toBeGreaterThan(0);
      
      // 가격 상승 잠재력 분석  
      expect(result.futurePotential.growthRate).toBeDefined();
      expect(result.futurePotential.confidence).toBeGreaterThan(0);
      expect(result.futurePotential.confidence).toBeLessThanOrEqual(1);
    });
  });
});
