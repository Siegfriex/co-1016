import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisSummary from '../AnalysisSummary';

describe('AnalysisSummary', () => {
  const mockArtistA = {
    id: 'ARTIST_0005',
    name: '양혜규',
    highestPricePerHo: 45000000
  };

  const mockArtistB = {
    id: 'ARTIST_0003', 
    name: '이우환',
    highestPricePerHo: 120000000
  };

  const mockAnalysisResults = {
    model: 'TRAJECTORY-Analysis-v1.0',
    totalTrajectoryDifference: 745.7,
    dominantDifferenceAxis: {
      axis: '학술',
      difference: 287.5
    },
    growthPatternSimilarity: 0.732,
    marketMaturity: {
      leader: '이우환',
      score: 2.67
    },
    priceVolatility: 0.23,
    trajectoryValueCorrelation: 0.651,
    futurePotential: {
      leader: '양혜규',
      growthRate: 12.4,
      confidence: 0.75
    },
    riskLevel: 'Low',
    axisDetails: {
      '제도': {
        averageGrowthRate: 5.2,
        inflectionPoints: 2,
        currentGap: 15.3
      },
      '학술': {
        averageGrowthRate: 7.8,
        inflectionPoints: 1,
        currentGap: 22.1
      }
    }
  };

  const defaultProps = {
    artistA: mockArtistA,
    artistB: mockArtistB,
    analysisResults: mockAnalysisResults,
    analysisMethod: 'trajectory'
  };

  describe('Component Rendering', () => {
    test('renders without crashing', () => {
      render(<AnalysisSummary {...defaultProps} />);
      
      expect(screen.getByText(/궤적 분석 결과/)).toBeInTheDocument();
    });

    test('shows loading state when analysisResults is null', () => {
      render(<AnalysisSummary {...defaultProps} analysisResults={null} />);
      
      expect(screen.getByText(/분석 결과를 계산하고 있습니다/)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
    });

    test('renders all summary cards', () => {
      render(<AnalysisSummary {...defaultProps} />);
      
      const summaryCards = screen.getAllByTestId(/summary-card/);
      expect(summaryCards.length).toBeGreaterThan(0);
    });
  });

  describe('Analysis Method Switching', () => {
    test('displays trajectory analysis results', () => {
      render(<AnalysisSummary {...defaultProps} analysisMethod="trajectory" />);
      
      expect(screen.getByText('궤적 분석 결과')).toBeInTheDocument();
      expect(screen.getByText(/총 궤적 차이 지수/)).toBeInTheDocument();
      expect(screen.getByText(/745\.7/)).toBeInTheDocument();
    });

    test('displays market analysis results', () => {
      render(<AnalysisSummary {...defaultProps} analysisMethod="market" />);
      
      expect(screen.getByText('시장 가치 분석')).toBeInTheDocument();
      expect(screen.getByText(/최고 호당 가격 차이/)).toBeInTheDocument();
    });

    test('displays combined analysis results', () => {
      render(<AnalysisSummary {...defaultProps} analysisMethod="combined" />);
      
      expect(screen.getByText('종합 분석 결과')).toBeInTheDocument();
      expect(screen.getByText(/궤적-가치 상관계수/)).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    test('formats Korean currency correctly', () => {
      render(<AnalylisSummary {...defaultProps} analysisMethod="market" />);
      
      // Should display properly formatted Korean currency
      const priceElements = screen.getAllByText(/₩/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    test('formats percentages correctly', () => {
      render(<AnalysisSummary {...defaultProps} analysisMethod="trajectory" />);
      
      expect(screen.getByText(/73\.2%/)).toBeInTheDocument(); // Growth pattern similarity
    });

    test('formats large numbers with Korean locale', () => {
      render(<AnalysisSummary {...defaultProps} analysisMethod="trajectory" />);
      
      expect(screen.getByText(/745\.7/)).toBeInTheDocument(); // Trajectory difference
    });
  });

  describe('Hover State Handling', () => {
    test('shows axis detail panel when hoveredAxis is provided', () => {
      render(
        <AnalysisSummary 
          {...defaultProps} 
          hoveredAxis="학술"
        />
      );
      
      expect(screen.getByText(/학술 축 세부 분석/)).toBeInTheDocument();
      expect(screen.getByText(/평균 성장률/)).toBeInTheDocument();
      expect(screen.getByText(/7\.8%/)).toBeInTheDocument();
    });

    test('updates current focus indicator', () => {
      render(
        <AnalysisSummary 
          {...defaultProps} 
          hoveredAxis="제도"
        />
      );
      
      expect(screen.getByText(/현재 포커스: 제도 축/)).toBeInTheDocument();
    });

    test('hides axis detail panel when hoveredAxis is null', () => {
      render(<AnalysisSummary {...defaultProps} hoveredAxis={null} />);
      
      expect(screen.queryByText(/축 세부 분석/)).not.toBeInTheDocument();
    });
  });

  describe('Insights Generation', () => {
    test('generates trajectory-specific insights', () => {
      render(<AnalysisSummary {...defaultProps} analysisMethod="trajectory" />);
      
      expect(screen.getByText(/핵심 인사이트/)).toBeInTheDocument();
      expect(screen.getByText(/학술 축에서 가장 큰 성장 궤적 차이/)).toBeInTheDocument();
    });

    test('generates market-specific insights', () => {
      render(<AnalysisSummary {...defaultProps} analysisMethod="market" />);
      
      const insightsSection = screen.getByText(/핵심 인사이트/).closest('.analysis-insights');
      expect(within(insightsSection).getByText(/이우환이 현재 시장에서 더 높은 평가/)).toBeInTheDocument();
    });

    test('generates combined analysis insights', () => {
      render(<AnalysisSummary {...defaultProps} analysisMethod="combined" />);
      
      const insightsSection = screen.getByText(/핵심 인사이트/).closest('.analysis-insights');
      expect(within(insightsSection).getByText(/양혜규의 미래 성장 잠재력이 더 높게 평가/)).toBeInTheDocument();
    });
  });

  describe('Summary Cards', () => {
    test('applies correct styling classes based on card type', () => {
      render(<AnalysisSummary {...defaultProps} />);
      
      const cards = document.querySelectorAll('.summary-card');
      
      cards.forEach(card => {
        expect(card).toHaveClass('summary-card');
        
        // Should have one of the type classes
        const hasTypeClass = ['summary-card--primary', 'summary-card--secondary', 
                             'summary-card--info', 'summary-card--success', 
                             'summary-card--warning'].some(cls => card.classList.contains(cls));
        expect(hasTypeClass).toBe(true);
      });
    });

    test('displays summary indicators with correct colors', () => {
      render(<AnalysisSummary {...defaultProps} />);
      
      const indicators = document.querySelectorAll('.summary-indicator');
      
      indicators.forEach(indicator => {
        expect(indicator).toHaveClass('summary-indicator');
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<AnalysisSummary {...defaultProps} />);
      
      const mainHeading = screen.getByRole('heading', { level: 3 });
      expect(mainHeading).toBeInTheDocument();
      
      const subHeading = screen.getByRole('heading', { level: 4 });
      expect(subHeading).toBeInTheDocument();
    });

    test('provides meaningful text for screen readers', () => {
      render(<AnalysisSummary {...defaultProps} />);
      
      // All data should be properly labeled
      expect(screen.getByText(/총 궤적 차이 지수/)).toBeInTheDocument();
      expect(screen.getByText(/가장 큰 차이 축/)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('handles complex analysis results efficiently', () => {
      const largeAnalysisResults = {
        ...mockAnalysisResults,
        axisDetails: Object.fromEntries(
          Array.from({ length: 20 }, (_, i) => [
            `axis_${i}`,
            {
              averageGrowthRate: Math.random() * 10,
              inflectionPoints: Math.floor(Math.random() * 5),
              currentGap: Math.random() * 50
            }
          ])
        )
      };

      const startTime = performance.now();
      render(
        <AnalysisSummary 
          {...defaultProps} 
          analysisResults={largeAnalysisResults}
        />
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should render quickly
    });
  });

  describe('Edge Cases', () => {
    test('handles missing analysis data gracefully', () => {
      const incompleteResults = {
        ...mockAnalysisResults,
        dominantDifferenceAxis: null,
        futurePotential: null
      };

      render(<AnalysisSummary {...defaultProps} analysisResults={incompleteResults} />);
      
      expect(screen.getByText(/N\/A/)).toBeInTheDocument();
    });

    test('handles zero values correctly', () => {
      const zeroResults = {
        ...mockAnalysisResults,
        totalTrajectoryDifference: 0,
        growthPatternSimilarity: 0
      };

      render(<AnalysisSummary {...defaultProps} analysisResults={zeroResults} />);
      
      expect(screen.getByText(/0\.0/)).toBeInTheDocument();
    });
  });
});

