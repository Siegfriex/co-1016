/**
 * CuratorOdyssey Phase 2 - Advanced Performance Profiler
 * Dr. Sarah Kim's Real-time Performance Measurement System
 * 
 * Chrome DevTools 기반 실측 성능 지표 수집
 */

class PerformanceProfiler {
  constructor() {
    this.metrics = {};
    this.observers = [];
    this.renderTimings = {};
    this.memoryBaseline = null;
    
    // Performance Observer 설정
    this.initializeObservers();
    
    // Memory baseline 설정
    if ('memory' in performance) {
      this.memoryBaseline = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        timestamp: Date.now()
      };
    }
  }

  // Performance Observers 초기화
  initializeObservers() {
    try {
      // Navigation timing (페이지 로드)
      if ('PerformanceObserver' in window) {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.metrics.pageLoad = {
                domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                loadComplete: entry.loadEventEnd - entry.loadEventStart,
                total: entry.loadEventEnd - entry.fetchStart
              };
            }
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);

        // Measure entries (커스텀 측정)
        const measureObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.startsWith('curator-')) {
              this.metrics[entry.name] = entry.duration;
            }
          }
        });
        measureObserver.observe({ entryTypes: ['measure'] });
        this.observers.push(measureObserver);

        // Layout Shift (CLS)
        const layoutShiftObserver = new PerformanceObserver((list) => {
          let cumulativeScore = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cumulativeScore += entry.value;
            }
          }
          this.metrics.cumulativeLayoutShift = cumulativeScore;
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      }
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  // 차트 렌더링 시간 측정 시작
  startRenderMeasurement(chartType) {
    const markName = `curator-${chartType}-render-start`;
    performance.mark(markName);
    this.renderTimings[chartType] = { startMark: markName };
    
    // 메모리 사용량 측정 시작
    if ('memory' in performance) {
      this.renderTimings[chartType].memoryStart = performance.memory.usedJSHeapSize;
    }
    
    console.log(`🔬 [Performance] ${chartType} 렌더링 측정 시작`);
  }

  // 차트 렌더링 시간 측정 종료
  endRenderMeasurement(chartType) {
    const endMarkName = `curator-${chartType}-render-end`;
    const measureName = `curator-${chartType}-render-duration`;
    
    performance.mark(endMarkName);
    
    try {
      performance.measure(measureName, this.renderTimings[chartType].startMark, endMarkName);
      
      const measure = performance.getEntriesByName(measureName)[0];
      const renderTime = measure.duration;
      
      // 메모리 사용량 측정
      let memoryUsage = null;
      if ('memory' in performance && this.renderTimings[chartType].memoryStart) {
        const memoryEnd = performance.memory.usedJSHeapSize;
        memoryUsage = {
          used: memoryEnd - this.renderTimings[chartType].memoryStart,
          total: performance.memory.usedJSHeapSize,
          limit: performance.memory.totalJSHeapSize
        };
      }
      
      // 결과 저장
      this.metrics[`${chartType}_render_time`] = renderTime;
      if (memoryUsage) {
        this.metrics[`${chartType}_memory_usage`] = memoryUsage;
      }
      
      console.log(`✅ [Performance] ${chartType} 렌더링 완료: ${renderTime.toFixed(2)}ms`);
      if (memoryUsage) {
        console.log(`📊 [Memory] ${chartType} 메모리 사용: ${(memoryUsage.used / 1024 / 1024).toFixed(2)}MB`);
      }
      
      return { renderTime, memoryUsage };
    } catch (error) {
      console.error('Performance measurement error:', error);
      return null;
    }
  }

  // 인터랙션 응답 시간 측정
  measureInteraction(interactionType, callback) {
    const startTime = performance.now();
    
    const wrappedCallback = (...args) => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.metrics[`${interactionType}_response_time`] = responseTime;
      console.log(`⚡ [Interaction] ${interactionType} 응답 시간: ${responseTime.toFixed(2)}ms`);
      
      if (callback) {
        return callback(...args);
      }
    };
    
    return wrappedCallback;
  }

  // 실시간 메모리 모니터링
  getMemoryStats() {
    if (!('memory' in performance)) {
      return { available: false };
    }
    
    const current = performance.memory;
    const baseline = this.memoryBaseline;
    
    return {
      available: true,
      current: {
        used: current.usedJSHeapSize,
        total: current.totalJSHeapSize,
        limit: current.jsHeapSizeLimit
      },
      growth: baseline ? {
        absolute: current.usedJSHeapSize - baseline.usedJSHeapSize,
        relative: ((current.usedJSHeapSize - baseline.usedJSHeapSize) / baseline.usedJSHeapSize) * 100,
        duration: Date.now() - baseline.timestamp
      } : null,
      formatted: {
        used: `${(current.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(current.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(current.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
        percentage: `${((current.usedJSHeapSize / current.totalJSHeapSize) * 100).toFixed(1)}%`
      }
    };
  }

  // 성능 보고서 생성
  generateReport() {
    const memoryStats = this.getMemoryStats();
    
    const report = {
      timestamp: new Date().toISOString(),
      phase: 'Phase 2 - Temporal Analysis',
      measurements: this.metrics,
      memory: memoryStats,
      recommendations: this.generateRecommendations()
    };
    
    console.group('🔬 Dr. Sarah Kim\'s Performance Report');
    console.log('측정 시점:', report.timestamp);
    console.log('성능 지표:', report.measurements);
    console.log('메모리 상태:', report.memory);
    console.log('최적화 권장사항:', report.recommendations);
    console.groupEnd();
    
    return report;
  }

  // 최적화 권장사항 생성
  generateRecommendations() {
    const recommendations = [];
    
    // 렌더링 시간 분석
    Object.entries(this.metrics).forEach(([key, value]) => {
      if (key.endsWith('_render_time')) {
        const chartType = key.replace('_render_time', '');
        
        if (value > 300) {
          recommendations.push({
            type: 'performance',
            severity: 'high',
            chart: chartType,
            issue: `렌더링 시간 과다 (${value.toFixed(2)}ms > 300ms)`,
            solution: 'Canvas fallback 또는 데이터 샘플링 적용 권장'
          });
        } else if (value > 200) {
          recommendations.push({
            type: 'performance',
            severity: 'medium', 
            chart: chartType,
            issue: `렌더링 시간 주의 (${value.toFixed(2)}ms)`,
            solution: 'D3 최적화 또는 애니메이션 단순화 검토'
          });
        }
      }
    });

    // 메모리 사용량 분석
    if (this.metrics.memory && this.metrics.memory.used > 100 * 1024 * 1024) { // 100MB
      recommendations.push({
        type: 'memory',
        severity: 'high',
        issue: `메모리 사용량 과다 (${(this.metrics.memory.used / 1024 / 1024).toFixed(2)}MB)`,
        solution: '데이터 정리, 이벤트 리스너 제거, 메모리 누수 점검'
      });
    }

    // 인터랙션 응답성 분석
    Object.entries(this.metrics).forEach(([key, value]) => {
      if (key.endsWith('_response_time') && value > 16) { // 60fps 기준
        recommendations.push({
          type: 'interaction',
          severity: value > 50 ? 'high' : 'medium',
          issue: `인터랙션 지연 (${value.toFixed(2)}ms > 16ms)`,
          solution: 'debouncing, throttling, 또는 Web Workers 활용 권장'
        });
      }
    });

    return recommendations;
  }

  // 실시간 모니터링 시작
  startRealTimeMonitoring(interval = 5000) {
    const monitor = setInterval(() => {
      const memoryStats = this.getMemoryStats();
      const report = {
        timestamp: Date.now(),
        memory: memoryStats.formatted,
        metrics: Object.keys(this.metrics).length
      };
      
      // 메모리 증가 경고
      if (memoryStats.growth && memoryStats.growth.relative > 50) {
        console.warn(`⚠️ [Memory Alert] ${memoryStats.growth.relative.toFixed(1)}% 증가 감지`);
      }
      
      // 브라우저 DevTools에 전송 (개발 모드에서)
      if (process.env.NODE_ENV === 'development') {
        window.__CURATOR_PERFORMANCE__ = report;
      }
    }, interval);
    
    return monitor;
  }

  // Clean up
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = {};
  }
}

// 전역 인스턴스 생성
export const performanceProfiler = new PerformanceProfiler();

// React Hook for Performance Monitoring
export const usePerformanceMonitoring = (componentName) => {
  const [performanceData, setPerformanceData] = React.useState(null);
  
  React.useEffect(() => {
    performanceProfiler.startRenderMeasurement(componentName);
    
    return () => {
      const result = performanceProfiler.endRenderMeasurement(componentName);
      setPerformanceData(result);
    };
  }, [componentName]);
  
  return performanceData;
};

// 유틸리티 함수들
export const measureAsync = async (name, asyncOperation) => {
  performanceProfiler.startRenderMeasurement(name);
  try {
    const result = await asyncOperation();
    performanceProfiler.endRenderMeasurement(name);
    return result;
  } catch (error) {
    performanceProfiler.endRenderMeasurement(name);
    throw error;
  }
};

export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return function PerformanceTrackedComponent(props) {
    const performanceData = usePerformanceMonitoring(componentName);
    
    return React.createElement(WrappedComponent, {
      ...props,
      __performanceData: performanceData
    });
  };
};

export default performanceProfiler;

