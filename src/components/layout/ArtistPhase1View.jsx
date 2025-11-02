import React, { useState, useEffect } from 'react';
import ArtistRadarChart from '../charts/ArtistRadarChart';
import SunburstChart from '../charts/SunburstChart';
import LoadingSkeleton from '../charts/LoadingSkeleton';
import AIInsightsPanel from '../ai/AIInsightsPanel';
import ReportTypeSelector from '../report/ReportTypeSelector';
import { mockArtistSummary, mockSunburstData } from '../../utils/mockData';
import '../../styles/report.css';

const ArtistPhase1View = ({ artistId = "ARTIST_0005", onDrilldownToPhase2 }) => {
  const [artistData, setArtistData] = useState(null);
  const [sunburstData, setSunburstData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredAxis, setHoveredAxis] = useState(null);
  const [showReportSelector, setShowReportSelector] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  // 데이터 로딩 시뮬레이션
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 실제로는 API 호출:
        // const summaryResponse = await fetch(`/api/artist/${artistId}/summary`);
        // const sunburstResponse = await fetch(`/api/artist/${artistId}/sunburst`);
        
        // 목업 데이터 사용 (1초 지연으로 로딩 시뮬레이션)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setArtistData(mockArtistSummary);
        setSunburstData(mockSunburstData);
        setError(null);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [artistId]);

  // 레이더 차트 축 호버 핸들러
  const handleRadarAxisHover = (mappedAxis) => {
    setHoveredAxis(mappedAxis);
  };

  // 선버스트 세그먼트 호버 핸들러
  const handleSunburstSegmentHover = (axisName) => {
    // 추후 확장 가능
  };

  // 보고서 생성 핸들러
  const handleReportGenerated = (reportData) => {
    setGeneratedReport(reportData);
    console.log('📊 새 보고서 생성됨:', reportData.type);
  };

  // 고급 보고서 모드 토글
  const toggleAdvancedReporting = () => {
    setShowReportSelector(!showReportSelector);
    setGeneratedReport(null);
  };

  // 선버스트 클릭 핸들러 (Phase 2 드릴다운)
  const handleSunburstClick = (segmentData) => {
    if (onDrilldownToPhase2) {
      // 부드러운 전환 애니메이션
      const sunburstContainer = document.querySelector('.curator-phase1-grid');
      if (sunburstContainer) {
        sunburstContainer.style.transform = 'scale(0.95)';
        sunburstContainer.style.opacity = '0.8';
        sunburstContainer.style.transition = 'all 0.3s ease-out';
        
        setTimeout(() => {
          onDrilldownToPhase2(artistId);
        }, 300);
      } else {
        onDrilldownToPhase2(artistId);
      }
    }
  };

  if (loading) {
    return (
      <div className="curator-app">
        <div className="dyss-container">
          <div className="curator-artist-header">
            <div className="curator-skeleton curator-skeleton--title"></div>
            <div className="curator-skeleton curator-skeleton--title" style={{width: '40%', height: '20px', marginTop: '12px'}}></div>
          </div>
          
          <div className="curator-phase1-grid">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="curator-app">
      <div className="dyss-container">
        {/* 아티스트 헤더 */}
        <div className="curator-artist-header curator-animate-fade-in">
          <h1 className="curator-artist-name">{artistData.name}</h1>
          <h2 className="curator-phase-title">Phase 1</h2>
          <p className="curator-phase-subtitle">성공은 어떤 모습인가?</p>
        </div>

        {/* Phase 1 차트 그리드 */}
        <div className="curator-phase1-grid">
          {/* 레이더 차트 (5축 요약) */}
          <div className="curator-chart-container curator-animate-fade-in curator-animate-delay-100">
            <h3 className="curator-chart-title">
              5대축 가치 요약 (Artist Snapshot)
            </h3>
            <ArtistRadarChart 
              data={artistData.radar5}
              onAxisHover={handleRadarAxisHover}
            />
          </div>

          {/* 선버스트 차트 (4축 근거) */}
          <div className="curator-chart-container curator-animate-fade-in curator-animate-delay-200">
            <h3 className="curator-chart-title">
              4축 근거 데이터 (Underlying Evidence)
            </h3>
            <SunburstChart 
              data={sunburstData}
              highlightedAxis={hoveredAxis}
              onSegmentHover={handleSunburstSegmentHover}
              onSegmentClick={handleSunburstClick}
            />
          </div>
        </div>

        {/* AI 인사이트 패널 또는 고급 보고서 */}
        <div className="curator-animate-fade-in curator-animate-delay-400">
          {!showReportSelector ? (
            <>
              <AIInsightsPanel 
                artistData={{
                  name: artistData.name,
                  radar5: artistData.radar5, 
                  sunburst_l1: artistData.sunburst_l1
                }}
                phase={1}
              />
              
              {/* 고급 보고서 버튼 */}
              <div className="advanced-report-toggle">
                <button 
                  onClick={toggleAdvancedReporting}
                  className="advanced-report-button"
                >
                  📊 고급 AI 보고서 생성
                </button>
                <p className="advanced-report-description">
                  Executive Summary, Technical Deep-dive, Investment Briefing
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="report-section-header">
                <button 
                  onClick={toggleAdvancedReporting}
                  className="back-to-insights-button"
                >
                  ← 기본 인사이트로 돌아가기
                </button>
              </div>
              
              <ReportTypeSelector 
                artistData={{
                  name: artistData.name,
                  radar5: artistData.radar5,
                  sunburst_l1: artistData.sunburst_l1
                }}
                onReportGenerated={handleReportGenerated}
              />
            </>
          )}
        </div>

        {/* 메타정보 표시 */}
        <div className="curator-metadata curator-animate-fade-in curator-animate-delay-500">
          <div className="curator-chart-container" style={{textAlign: 'center', padding: 'var(--dyss-space-6)'}}>
            <p style={{
              fontSize: 'var(--dyss-font-size-sm)', 
              color: 'var(--dyss-color-text-secondary)',
              margin: '0'
            }}>
              <strong>Analysis Version:</strong> {artistData.weights_version || 'AHP_v1'} • 
              <strong> Updated:</strong> {new Date(artistData.updated_at || Date.now()).toLocaleDateString('ko-KR')} •
              <strong> Normalization:</strong> Log→Winsor→Percentile •
              <strong> AI:</strong> GPT-4 Enhanced
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistPhase1View;
