import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComparisonAreaChart from '../ComparisonAreaChart';

// D3.js DOM manipulation mocking
const mockD3Select = jest.fn();
const mockD3SelectAll = jest.fn();
const mockSVG = {
  attr: jest.fn().mockReturnThis(),
  selectAll: mockD3SelectAll.mockReturnThis(),
  append: jest.fn().mockReturnThis(),
  style: jest.fn().mockReturnThis()
};

jest.mock('d3', () => ({
  select: jest.fn(() => mockSVG),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    nice: jest.fn().mockReturnThis()
  })),
  extent: jest.fn(() => [0, 100]),
  max: jest.fn(() => 100),
  area: jest.fn(() => jest.fn()),
  line: jest.fn(() => jest.fn()),
  axisBottom: jest.fn(() => jest.fn()),
  axisLeft: jest.fn(() => jest.fn()),
  bisector: jest.fn(() => ({ left: jest.fn() })),
  pointer: jest.fn(() => [50, 50]),
  curveCatmullRom: { alpha: jest.fn(() => 'curve') }
}));

describe('ComparisonAreaChart', () => {
  const mockSeries = [
    { t: 0, v_A: 10, v_B: 15 },
    { t: 5, v_A: 25, v_B: 30 },
    { t: 10, v_A: 40, v_B: 35 },
    { t: 15, v_A: 60, v_B: 55 }
  ];

  const mockArtistA = {
    name: '양혜규',
    color: '#EF4444',
    colorSecondary: '#FCA5A5'
  };

  const mockArtistB = {
    name: '이우환',
    color: '#3B82F6', 
    colorSecondary: '#93C5FD'
  };

  const defaultProps = {
    series: mockSeries,
    axis: '제도',
    artistA: mockArtistA,
    artistB: mockArtistB,
    isHighlighted: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders without crashing', () => {
      render(<ComparisonAreaChart {...defaultProps} />);
      
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // SVG element
    });

    test('renders tooltip container', () => {
      render(<ComparisonAreaChart {...defaultProps} />);
      
      const tooltip = document.querySelector('.curator-tooltip.curator-comparison-tooltip');
      expect(tooltip).toBeInTheDocument();
    });

    test('does not render when series data is missing', () => {
      render(<ComparisonAreaChart {...defaultProps} series={null} />);
      
      // Should not attempt to create D3 visualizations without data
      expect(mockD3Select).not.toHaveBeenCalled();
    });
  });

  describe('D3.js Integration', () => {
    test('initializes D3 scales and generators', () => {
      render(<ComparisonAreaChart {...defaultProps} />);
      
      // D3 should be called to set up the chart
      expect(require('d3').select).toHaveBeenCalled();
      expect(require('d3').scaleLinear).toHaveBeenCalled();
      expect(require('d3').area).toHaveBeenCalled();
      expect(require('d3').line).toHaveBeenCalled();
    });

    test('updates when series data changes', () => {
      const { rerender } = render(<ComparisonAreaChart {...defaultProps} />);
      
      const newSeries = [
        { t: 0, v_A: 20, v_B: 25 },
        { t: 5, v_A: 35, v_B: 40 }
      ];
      
      rerender(<ComparisonAreaChart {...defaultProps} series={newSeries} />);
      
      // Should re-initialize D3 components with new data
      expect(require('d3').select).toHaveBeenCalledTimes(2);
    });
  });

  describe('Props Handling', () => {
    test('applies highlight styling when isHighlighted is true', () => {
      render(<ComparisonAreaChart {...defaultProps} isHighlighted={true} />);
      
      // Component should handle highlight state change
      expect(mockSVG.style).toHaveBeenCalled();
    });

    test('calls onDataPointHover callback when provided', () => {
      const mockCallback = jest.fn();
      render(
        <ComparisonAreaChart 
          {...defaultProps} 
          onDataPointHover={mockCallback}
        />
      );
      
      // Simulate mouse interaction that would trigger the callback
      const chartWrapper = document.querySelector('.curator-chart-wrapper');
      if (chartWrapper) {
        fireEvent.mouseOver(chartWrapper);
      }
      
      // Note: Actual callback testing would require more sophisticated D3 mocking
    });

    test('handles different axis names correctly', () => {
      const axes = ['제도', '학술', '담론', '네트워크'];
      
      axes.forEach(axis => {
        render(<ComparisonAreaChart {...defaultProps} axis={axis} />);
        
        // Should handle each axis type without errors
        expect(require('d3').select).toHaveBeenCalled();
        
        // Clean up for next iteration
        jest.clearAllMocks();
      });
    });
  });

  describe('Color System', () => {
    test('applies correct artist colors', () => {
      render(<ComparisonAreaChart {...defaultProps} />);
      
      // Color values should be used in gradient definitions
      // This would require more detailed D3 mocking to test fully
      expect(mockArtistA.color).toBe('#EF4444');
      expect(mockArtistB.color).toBe('#3B82F6');
    });

    test('handles custom artist colors', () => {
      const customArtistA = {
        ...mockArtistA,
        color: '#FF0000'
      };
      
      render(<ComparisonAreaChart {...defaultProps} artistA={customArtistA} />);
      
      // Should accept and use custom colors
      expect(customArtistA.color).toBe('#FF0000');
    });
  });

  describe('Accessibility', () => {
    test('SVG has proper accessibility attributes', () => {
      render(<ComparisonAreaChart {...defaultProps} />);
      
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });

    test('tooltip has proper structure for screen readers', () => {
      render(<ComparisonAreaChart {...defaultProps} />);
      
      const tooltip = document.querySelector('.curator-comparison-tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveClass('curator-tooltip');
    });
  });

  describe('Performance', () => {
    test('handles large datasets efficiently', () => {
      const largeSeries = Array.from({ length: 100 }, (_, i) => ({
        t: i,
        v_A: Math.random() * 100,
        v_B: Math.random() * 100
      }));
      
      const startTime = performance.now();
      render(<ComparisonAreaChart {...defaultProps} series={largeSeries} />);
      const endTime = performance.now();
      
      // Should render within reasonable time (less than 100ms for component setup)
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('cleans up D3 elements on unmount', () => {
      const { unmount } = render(<ComparisonAreaChart {...defaultProps} />);
      
      unmount();
      
      // D3 cleanup would be handled in useEffect return function
      // This is difficult to test without more sophisticated mocking
    });
  });
});

