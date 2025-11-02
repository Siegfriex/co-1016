import React, { useState, useEffect, useMemo } from 'react';
import StackedAreaChart from '../charts/StackedAreaChart';
import EventTimeline from '../charts/EventTimeline';
import LoadingSkeleton from '../charts/LoadingSkeleton';
import { mockTimeseriesData, mockCareerEvents } from '../../utils/mockData';
import { processTimeseriesData } from '../../utils/timeseriesProcessor';
import useChartSynchronization from '../../hooks/useChartSynchronization';
import { performanceProfiler } from '../../utils/performanceProfiler';

const ArtistPhase2View = ({ artistId = "ARTIST_0005", onBackToPhase1, onDrilldownToPhase3 }) => {
  const [timeseriesData, setTimeseriesData] = useState(null);
  const [careerEvents, setCareerEvents] = useState([]);
  const [processedAnalysis, setProcessedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisInsights, setAnalysisInsights] = useState(null);

  // 📊 Advanced Chart Synchronization System (Dr. Sarah Kim v2.0)
  const {
    synchronizedState,
    onTimeHover,
    onEventHover,
    onTimeRangeChange,
    onEventSelect,
    updateChartState,
    zoomIn,
    zoomOut,
    resetView,
    getVisibleEvents,
    getPerformanceStats
  } = useChartSynchronization(timeseriesData, careerEvents);

  // 데이터 로딩 및 처리
  useEffect(() => {
    const loadAndProcessData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 실제로는 API 호출:
        // const timeseriesResponse = await fetch(`/api/artist/${artistId}/timeseries`);
        // const eventsResponse = await fetch(`/api/artist/${artistId}/events`);
        
        // 목업 데이터 사용 (1초 지연으로 로딩 시뮬레이션)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTimeseriesData(mockTimeseriesData);
        setCareerEvents(mockCareerEvents);

        // 데이터 처리 파이프라인 실행
        const processed = processTimeseriesData(
          mockTimeseriesData, 
          mockCareerEvents, 
          mockTimeseriesData.debut_year
        );

        if (processed.processed) {
          setProcessedAnalysis(processed.data);
          
          // 주요 인사이트 추출
          const insights = generateInsights(processed.data);
          setAnalysisInsights(insights);
          
          // 성능 프로파일링 시작
          performanceProfiler.startRealTimeMonitoring(5000);
          
          // 차트 상태 초기화
          updateChartState('stackedArea', { isReady: true });
          updateChartState('eventTimeline', { isReady: true });
        } else {
          throw new Error(processed.error || '데이터 처리 실패');
        }

      } catch (err) {
        setError('시계열 데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Phase 2 data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAndProcessData();
  }, [artistId]);

  // 시계열 차트 데이터 메모화
  const chartData = useMemo(() => {
    if (!processedAnalysis?.timeseries) return null;
    
    return {
      bins: processedAnalysis.timeseries.bins
    };
  }, [processedAnalysis]);

  // 이벤트 영향도 분석 데이터 메모화
  const impactAnalysis = useMemo(() => {
    return processedAnalysis?.eventImpacts || {};
  }, [processedAnalysis]);

  // 📈 Enhanced Interaction Handlers (Dr. Sarah Kim v2.0)
  const handleTimeHover = (timeData) => {
    onTimeHover(timeData);
  };

  const handleEventHover = (eventId) => {
    onEventHover(eventId);
  };

  const handleEventClick = (event) => {
    onEventSelect(event);
    // Phase 3 드릴다운 (비교 분석)으로 확장 가능
  };

  const handlePhase3Drilldown = () => {
    if (onDrilldownToPhase3) {
      onDrilldownToPhase3(artistId);
    }
  };

  // 인사이트 생성 함수
  const generateInsights = (analysisData) => {
    const { analysis, eventImpacts, forecast } = analysisData;
    
    return {
      primaryPattern: analysis.patterns[0] || '안정성장',
      dominantAxis: analysis.dominantAxis || '제도',
      keyInflectionPoints: analysis.inflectionPoints?.slice(0, 3) || [],
      highImpactEvents: Object.entries(eventImpacts)
        .filter(([, impact]) => impact.growth_acceleration > 0.2)
        .sort(([, a], [, b]) => b.growth_acceleration - a.growth_acceleration)
        .slice(0, 3)
        .map(([eventId, impact]) => {
          const event = careerEvents.find(e => e.id === eventId);
          return { event, impact };
        }),
      futureOutlook: forecast?.forecasts?.[0] || null,
      averageGrowthRate: analysis.averageGrowthRate || 0
    };
  };

  if (loading) {
    return (
      <div className="curator-app">
        <div className="dyss-container">
          <div className="curator-artist-header">
            <div className="curator-skeleton curator-skeleton--title"></div>
            <div className="curator-skeleton curator-skeleton--title" style={{width: '60%', height: '20px', marginTop: '12px'}}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--dyss-space-6)', marginBottom: 'var(--dyss-space-8)' }}>
            <LoadingSkeleton type="skeleton" />
            <LoadingSkeleton type="skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="curator-app">
        <div className="dyss-container">
          <div className="curator-error">
            <div className="curator-error-icon">⚠️</div>
            <h3 className="curator-error-title">데이터 로딩 오류</h3>
            <p className="curator-error-message">{error}</p>
            <button 
              onClick={onBackToPhase1}
              style={{ marginTop: 'var(--dyss-space-4)', padding: 'var(--dyss-space-3) var(--dyss-space-6)' }}
            >
              Phase 1로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="curator-app">
      <div className="dyss-container">
        {/* Phase 2 헤더 */}
        <div className="curator-artist-header curator-animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--dyss-space-4)' }}>
            <button 
              onClick={onBackToPhase1}
              style={{ 
                background: 'none', 
                border: '2px solid var(--dyss-color-primary)',
                borderRadius: 'var(--dyss-radius-full)',
                padding: 'var(--dyss-space-2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px'
              }}
            >
              ←
            </button>
            <div>
              <h1 className="curator-artist-name">{timeseriesData.artist_name}</h1>
              <h2 className="curator-phase-title">Phase 2</h2>
              <p className="curator-phase-subtitle">성공은 시간에 따라 어떻게 구축되는가?</p>
            </div>
          </div>
        </div>

        {/* 주요 인사이트 요약 */}
        {analysisInsights && (
          <div className="curator-chart-container curator-animate-fade-in curator-animate-delay-100" 
               style={{ marginBottom: 'var(--dyss-space-6)' }}>
            <h3 className="curator-chart-title">🔍 성장 패턴 분석 결과</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--dyss-space-4)',
              padding: 'var(--dyss-space-4)'
            }}>
              <div className="insight-card">
                <h4 style={{ color: 'var(--dyss-color-primary)', margin: 0, fontSize: 'var(--dyss-font-size-sm)' }}>
                  성장 패턴
                </h4>
                <p style={{ fontSize: 'var(--dyss-font-size-lg)', fontWeight: '600', margin: '4px 0' }}>
                  {analysisInsights.primaryPattern}
                </p>
                <small style={{ color: 'var(--dyss-color-text-secondary)' }}>
                  평균 연 성장률: +{(analysisInsights.averageGrowthRate * 100).toFixed(1)}%
                </small>
              </div>
              
              <div className="insight-card">
                <h4 style={{ color: 'var(--dyss-color-primary)', margin: 0, fontSize: 'var(--dyss-font-size-sm)' }}>
                  주도 축
                </h4>
                <p style={{ fontSize: 'var(--dyss-font-size-lg)', fontWeight: '600', margin: '4px 0' }}>
                  {analysisInsights.dominantAxis}
                </p>
                <small style={{ color: 'var(--dyss-color-text-secondary)' }}>
                  가치 구축의 핵심 동력
                </small>
              </div>

              <div className="insight-card">
                <h4 style={{ color: 'var(--dyss-color-primary)', margin: 0, fontSize: 'var(--dyss-font-size-sm)' }}>
                  변곡점
                </h4>
                <p style={{ fontSize: 'var(--dyss-font-size-lg)', fontWeight: '600', margin: '4px 0' }}>
                  {analysisInsights.keyInflectionPoints.length}개 발견
                </p>
                <small style={{ color: 'var(--dyss-color-text-secondary)' }}>
                  주요 성장 전환점 식별
                </small>
              </div>

              <div className="insight-card">
                <h4 style={{ color: 'var(--dyss-color-primary)', margin: 0, fontSize: 'var(--dyss-font-size-sm)' }}>
                  고영향 이벤트
                </h4>
                <p style={{ fontSize: 'var(--dyss-font-size-lg)', fontWeight: '600', margin: '4px 0' }}>
                  {analysisInsights.highImpactEvents.length}개 분석
                </p>
                <small style={{ color: 'var(--dyss-color-text-secondary)' }}>
                  성장 가속화 기여 이벤트
                </small>
              </div>
            </div>
          </div>
        )}

        {/* 시계열 누적 영역 차트 */}
        <div className="curator-chart-container curator-animate-fade-in curator-animate-delay-200">
          <h3 className="curator-chart-title">
            📈 4축 누적 성장 궤적 (데뷔년 기준)
          </h3>
          {chartData && (
            <StackedAreaChart 
              data={chartData}
              events={getVisibleEvents()}
              timeRange={synchronizedState.timeRange}
              hoveredTime={synchronizedState.hoveredTime}
              hoveredEvent={synchronizedState.hoveredEvent}
              onTimeHover={handleTimeHover}
              onEventHover={handleEventHover}
              onTimeRangeChange={onTimeRangeChange}
              width={800}
              height={400}
              performanceMode={getPerformanceStats().averageSyncTime > 16}
            />
          )}
          
          {/* 시간대별 상세 정보 (호버 시 표시) - Enhanced */}
          {synchronizedState.hoveredTime !== null && processedAnalysis && (
            <div style={{
              marginTop: 'var(--dyss-space-4)',
              padding: 'var(--dyss-space-4)',
              background: 'var(--dyss-color-bg-secondary)',
              borderRadius: 'var(--dyss-radius-lg)',
              border: '1px solid var(--dyss-color-primary-200)'
            }}>
              <h4 style={{ margin: 0, color: 'var(--dyss-color-primary)' }}>
                +{synchronizedState.hoveredTime}년 시점 분석
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--dyss-space-2)' }}>
                <div>
                  <small style={{ color: 'var(--dyss-color-text-secondary)' }}>동기화 성능</small>
                  <p style={{ margin: '2px 0', fontSize: 'var(--dyss-font-size-sm)' }}>
                    평균 응답: {getPerformanceStats().averageSyncTime?.toFixed(1)}ms
                  </p>
                </div>
                <div>
                  <small style={{ color: 'var(--dyss-color-text-secondary)' }}>표시 범위</small>
                  <p style={{ margin: '2px 0', fontSize: 'var(--dyss-font-size-sm)' }}>
                    +{synchronizedState.timeRange[0]}~{synchronizedState.timeRange[1]}년
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 이벤트 타임라인 */}
        <div className="curator-chart-container curator-animate-fade-in curator-animate-delay-300"
             style={{ marginTop: 'var(--dyss-space-6)' }}>
          <h3 className="curator-chart-title">
            🎯 커리어 이벤트 타임라인 & 영향 분석
          </h3>
          <EventTimeline 
            events={getVisibleEvents()}
            timeRange={synchronizedState.timeRange}
            hoveredTime={synchronizedState.hoveredTime}
            hoveredEvent={synchronizedState.hoveredEvent}
            selectedEvent={synchronizedState.selectedEvent}
            onEventHover={handleEventHover}
            onEventClick={handleEventClick}
            onTimeRangeChange={onTimeRangeChange}
            impactAnalysis={impactAnalysis}
            width={800}
            height={120}
          />
          
          {/* 🎛️ Zoom/Pan Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--dyss-space-2)',
            marginTop: 'var(--dyss-space-4)',
            padding: 'var(--dyss-space-3)',
            background: 'var(--dyss-color-bg-secondary)',
            borderRadius: 'var(--dyss-radius-lg)'
          }}>
            <button onClick={() => zoomIn()} style={controlButtonStyle}>🔍 Zoom In</button>
            <button onClick={() => zoomOut()} style={controlButtonStyle}>🔍 Zoom Out</button>
            <button onClick={() => resetView()} style={controlButtonStyle}>🔄 Reset View</button>
            {onDrilldownToPhase3 && (
              <button onClick={handlePhase3Drilldown} style={{...controlButtonStyle, backgroundColor: 'var(--dyss-color-primary)', color: 'white'}}>
                📊 Compare with Others (Phase 3)
              </button>
            )}
          </div>
        </div>

        {/* 고영향 이벤트 상세 분석 */}
        {analysisInsights?.highImpactEvents?.length > 0 && (
          <div className="curator-chart-container curator-animate-fade-in curator-animate-delay-400"
               style={{ marginTop: 'var(--dyss-space-6)' }}>
            <h3 className="curator-chart-title">
              🚀 성장 가속화 이벤트 분석
            </h3>
            <div style={{ display: 'grid', gap: 'var(--dyss-space-4)' }}>
              {analysisInsights.highImpactEvents.map(({ event, impact }, index) => (
                <div key={event.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--dyss-space-4)',
                  background: 'var(--dyss-color-bg-secondary)',
                  borderRadius: 'var(--dyss-radius-lg)',
                  border: '1px solid var(--dyss-color-primary-200)'
                }}>
                  <div style={{ 
                    minWidth: '60px',
                    textAlign: 'center',
                    color: 'var(--dyss-color-primary)',
                    fontWeight: '600'
                  }}>
                    +{event.t}년
                  </div>
                  <div style={{ flex: 1, marginLeft: 'var(--dyss-space-4)' }}>
                    <h4 style={{ margin: 0, fontSize: 'var(--dyss-font-size-base)' }}>
                      {event.title}
                    </h4>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: 'var(--dyss-font-size-sm)',
                      color: 'var(--dyss-color-text-secondary)'
                    }}>
                      {event.description}
                    </p>
                  </div>
                  <div style={{ 
                    minWidth: '120px',
                    textAlign: 'right',
                    color: impact.growth_acceleration > 0.3 ? '#10B981' : '#F59E0B',
                    fontWeight: '600'
                  }}>
                    +{(impact.growth_acceleration * 100).toFixed(1)}% 가속화
                    <div style={{ 
                      fontSize: 'var(--dyss-font-size-xs)',
                      color: 'var(--dyss-color-text-tertiary)'
                    }}>
                      주요 축: {impact.primary_axis}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 성장 예측 및 제안 */}
        {analysisInsights?.futureOutlook && (
          <div className="curator-chart-container curator-animate-fade-in curator-animate-delay-500"
               style={{ marginTop: 'var(--dyss-space-6)' }}>
            <h3 className="curator-chart-title">
              🔮 미래 성장 전망 & 전략적 제안
            </h3>
            <div style={{
              padding: 'var(--dyss-space-6)',
              background: 'linear-gradient(135deg, var(--dyss-color-primary-50), var(--dyss-color-bg-primary))',
              borderRadius: 'var(--dyss-radius-xl)',
              border: '1px solid var(--dyss-color-primary-200)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--dyss-space-8)' }}>
                <div>
                  <h4 style={{ color: 'var(--dyss-color-primary)', margin: '0 0 12px 0' }}>
                    예측 시나리오
                  </h4>
                  <p style={{ fontSize: 'var(--dyss-font-size-lg)', fontWeight: '600', margin: '8px 0' }}>
                    {analysisInsights.futureOutlook.scenario.toUpperCase()}: {analysisInsights.futureOutlook.description}
                  </p>
                  <p style={{ color: 'var(--dyss-color-text-secondary)', margin: 0 }}>
                    3년 후 예상 점수: {analysisInsights.futureOutlook.projectedValue?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--dyss-color-primary)', margin: '0 0 12px 0' }}>
                    전략적 제안
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--dyss-color-text-secondary)' }}>
                    <li>현재 주도축({analysisInsights.dominantAxis}) 지속 강화</li>
                    <li>고영향 이벤트 패턴 재현 전략 수립</li>
                    <li>성장 둔화 구간 대비 다각화 전략</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 메타정보 */}
        <div className="curator-metadata curator-animate-fade-in curator-animate-delay-600">
          <div className="curator-chart-container" style={{textAlign: 'center', padding: 'var(--dyss-space-6)'}}>
            <p style={{
              fontSize: 'var(--dyss-font-size-sm)', 
              color: 'var(--dyss-color-text-secondary)',
              margin: '0'
            }}>
              <strong>Analysis Model:</strong> Dr. Sarah Kim's Temporal Analytics v2.0 • 
              <strong> Processed:</strong> {processedAnalysis?.metadata?.processedPoints || 0} data points • 
              <strong> Events Analyzed:</strong> {processedAnalysis?.metadata?.eventsAnalyzed || 0} • 
              <strong> Debut Year Base:</strong> {timeseriesData?.debut_year || 2003}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistPhase2View;
