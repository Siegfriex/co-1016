/**
 * CuratorOdyssey Phase 2 - Advanced Chart Synchronization System
 * Dr. Sarah Kim's Dual-Chart State Management Hook
 * 
 * EventTimeline ↔ StackedAreaChart 완벽 동기화
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export const useChartSynchronization = (timeseriesData, events = []) => {
  // 통합 상태 관리
  const [synchronizedState, setSynchronizedState] = useState({
    // 시간 관련 상태
    timeRange: [0, 20],
    hoveredTime: null,
    selectedTimeRange: null,
    
    // 이벤트 관련 상태  
    hoveredEvent: null,
    selectedEvent: null,
    
    // 줌/팬 상태
    zoomLevel: 1,
    panOffset: 0,
    
    // 차트별 상태
    chartStates: {
      stackedArea: {
        isReady: false,
        lastUpdate: null,
        renderTime: null
      },
      eventTimeline: {
        isReady: false,
        lastUpdate: null,
        renderTime: null
      }
    }
  });

  // 성능 추적을 위한 ref
  const performanceRef = useRef({
    lastSyncTime: Date.now(),
    syncOperations: 0,
    averageSyncTime: 0
  });

  // 디바운스를 위한 ref
  const debounceRef = useRef({
    timeHover: null,
    eventHover: null,
    zoomPan: null
  });

  // 1. 시간 호버 동기화 (디바운스 적용)
  const handleTimeHover = useCallback((timeData) => {
    if (debounceRef.current.timeHover) {
      clearTimeout(debounceRef.current.timeHover);
    }
    
    debounceRef.current.timeHover = setTimeout(() => {
      const startTime = performance.now();
      
      setSynchronizedState(prev => {
        const newState = {
          ...prev,
          hoveredTime: timeData?.t || null,
          hoveredEvent: null // 시간 호버 시 이벤트 호버 해제
        };
        
        // 성능 추적
        const syncTime = performance.now() - startTime;
        performanceRef.current.lastSyncTime = syncTime;
        performanceRef.current.syncOperations++;
        performanceRef.current.averageSyncTime = 
          (performanceRef.current.averageSyncTime * (performanceRef.current.syncOperations - 1) + syncTime) 
          / performanceRef.current.syncOperations;
        
        return newState;
      });
    }, 16); // 60fps 기준
  }, []);

  // 2. 이벤트 호버 동기화
  const handleEventHover = useCallback((eventId) => {
    if (debounceRef.current.eventHover) {
      clearTimeout(debounceRef.current.eventHover);
    }
    
    debounceRef.current.eventHover = setTimeout(() => {
      setSynchronizedState(prev => {
        const hoveredEvent = eventId ? events.find(e => e.id === eventId) : null;
        
        return {
          ...prev,
          hoveredEvent: eventId,
          hoveredTime: hoveredEvent ? hoveredEvent.t : prev.hoveredTime
        };
      });
    }, 8); // 이벤트 호버는 더 빠른 응답
  }, [events]);

  // 3. 시간 범위 변경 (줌/팬) 동기화
  const handleTimeRangeChange = useCallback((newRange, source = 'manual') => {
    if (debounceRef.current.zoomPan) {
      clearTimeout(debounceRef.current.zoomPan);
    }
    
    debounceRef.current.zoomPan = setTimeout(() => {
      setSynchronizedState(prev => {
        const [start, end] = newRange;
        const duration = end - start;
        const center = (start + end) / 2;
        
        // 유효성 검사
        if (start < 0 || end > 25 || start >= end) {
          console.warn('Invalid time range:', newRange);
          return prev;
        }
        
        return {
          ...prev,
          timeRange: [start, end],
          zoomLevel: 20 / duration, // 기본 20년 대비 줌 레벨
          panOffset: center - 10, // 기본 중심점(10년) 대비 오프셋
          selectedTimeRange: source === 'selection' ? newRange : null
        };
      });
    }, 32); // 줌/팬은 적당한 디바운스
  }, []);

  // 4. 이벤트 선택 동기화
  const handleEventSelect = useCallback((event) => {
    setSynchronizedState(prev => ({
      ...prev,
      selectedEvent: event,
      hoveredTime: event ? event.t : null,
      // 선택된 이벤트 주변으로 시간 범위 조정
      timeRange: event ? [
        Math.max(0, event.t - 3),
        Math.min(20, event.t + 3)
      ] : prev.timeRange
    }));
  }, []);

  // 5. 차트 상태 업데이트 (렌더링 완료 시점 추적)
  const updateChartState = useCallback((chartType, stateUpdate) => {
    setSynchronizedState(prev => ({
      ...prev,
      chartStates: {
        ...prev.chartStates,
        [chartType]: {
          ...prev.chartStates[chartType],
          ...stateUpdate,
          lastUpdate: Date.now()
        }
      }
    }));
  }, []);

  // 6. 양방향 동기화 감지 및 처리
  useEffect(() => {
    // 두 차트가 모두 준비되었을 때 초기 동기화
    const { stackedArea, eventTimeline } = synchronizedState.chartStates;
    
    if (stackedArea.isReady && eventTimeline.isReady) {
      // 초기 시간 범위 설정
      if (timeseriesData?.bins?.length > 0) {
        const minTime = Math.min(...timeseriesData.bins.map(d => d.t));
        const maxTime = Math.max(...timeseriesData.bins.map(d => d.t));
        
        setSynchronizedState(prev => ({
          ...prev,
          timeRange: [minTime, maxTime]
        }));
      }
    }
  }, [synchronizedState.chartStates, timeseriesData]);

  // 7. 성능 모니터링
  const getPerformanceStats = useCallback(() => {
    return {
      lastSyncTime: performanceRef.current.lastSyncTime,
      totalSyncOperations: performanceRef.current.syncOperations,
      averageSyncTime: performanceRef.current.averageSyncTime,
      isOptimal: performanceRef.current.averageSyncTime < 16 // 60fps 기준
    };
  }, []);

  // 8. 줌 인/아웃 헬퍼 함수들
  const zoomIn = useCallback((factor = 0.5) => {
    const [start, end] = synchronizedState.timeRange;
    const center = (start + end) / 2;
    const newDuration = (end - start) * factor;
    
    handleTimeRangeChange([
      center - newDuration / 2,
      center + newDuration / 2
    ], 'zoom');
  }, [synchronizedState.timeRange, handleTimeRangeChange]);

  const zoomOut = useCallback((factor = 2) => {
    const [start, end] = synchronizedState.timeRange;
    const center = (start + end) / 2;
    const newDuration = (end - start) * factor;
    
    handleTimeRangeChange([
      Math.max(0, center - newDuration / 2),
      Math.min(20, center + newDuration / 2)
    ], 'zoom');
  }, [synchronizedState.timeRange, handleTimeRangeChange]);

  const panLeft = useCallback((amount = 2) => {
    const [start, end] = synchronizedState.timeRange;
    const duration = end - start;
    
    handleTimeRangeChange([
      Math.max(0, start - amount),
      Math.max(duration, end - amount)
    ], 'pan');
  }, [synchronizedState.timeRange, handleTimeRangeChange]);

  const panRight = useCallback((amount = 2) => {
    const [start, end] = synchronizedState.timeRange;
    const duration = end - start;
    
    handleTimeRangeChange([
      Math.min(20 - duration, start + amount),
      Math.min(20, end + amount)
    ], 'pan');
  }, [synchronizedState.timeRange, handleTimeRangeChange]);

  // 9. 리셋 함수
  const resetView = useCallback(() => {
    setSynchronizedState(prev => ({
      ...prev,
      timeRange: [0, 20],
      hoveredTime: null,
      hoveredEvent: null,
      selectedEvent: null,
      selectedTimeRange: null,
      zoomLevel: 1,
      panOffset: 0
    }));
  }, []);

  // 10. 이벤트 필터링 (현재 시간 범위 기준)
  const getVisibleEvents = useCallback(() => {
    const [start, end] = synchronizedState.timeRange;
    return events.filter(event => event.t >= start && event.t <= end);
  }, [events, synchronizedState.timeRange]);

  // Clean up
  useEffect(() => {
    return () => {
      Object.values(debounceRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  return {
    // 상태
    synchronizedState,
    
    // 이벤트 핸들러
    onTimeHover: handleTimeHover,
    onEventHover: handleEventHover,
    onTimeRangeChange: handleTimeRangeChange,
    onEventSelect: handleEventSelect,
    updateChartState,
    
    // 줌/팬 컨트롤
    zoomIn,
    zoomOut,
    panLeft,
    panRight,
    resetView,
    
    // 유틸리티
    getVisibleEvents,
    getPerformanceStats,
    
    // 개별 상태 접근자 (편의성)
    timeRange: synchronizedState.timeRange,
    hoveredTime: synchronizedState.hoveredTime,
    hoveredEvent: synchronizedState.hoveredEvent,
    selectedEvent: synchronizedState.selectedEvent,
    zoomLevel: synchronizedState.zoomLevel
  };
};

export default useChartSynchronization;

