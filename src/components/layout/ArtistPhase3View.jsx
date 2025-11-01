import React, { useState, useEffect, useMemo } from 'react';
import ComparisonAreaChart from '../charts/ComparisonAreaChart';
import AnalysisSummary from '../analysis/AnalysisSummary';
import ArtistSelector from '../ui/ArtistSelector';
import LoadingSkeleton from '../charts/LoadingSkeleton';
import ErrorBoundary from '../common/ErrorBoundary';
import { mockComparisonData, calculateTrajectoryAnalysis } from '../../utils/mockData';

const ArtistPhase3View = () => {
  const [selectedArtists, setSelectedArtists] = useState({
    artistA: "ARTIST_0005", // 양혜규
    artistB: "ARTIST_0003"  // 이우환
  });
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredAxis, setHoveredAxis] = useState(null);
  const [analysisMethod, setAnalysisMethod] = useState('trajectory'); // trajectory | market | combined

  // 데이터 로딩 및 분석 계산
  useEffect(() => {
    const loadComparisonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 실제로는 여러 API 호출:
        // const axisPromises = ['제도', '학술', '담론', '네트워크'].map(axis =>
        //   fetch(`/api/compare/${selectedArtists.artistA}/${selectedArtists.artistB}/${axis}`)
        // );
        // const responses = await Promise.all(axisPromises);

        // 목업 데이터 사용
        await new Promise(resolve => setTimeout(resolve, 1200));
        setComparisonData(mockComparisonData);
      } catch (err) {
        setError('비교 데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Comparison Data Loading Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComparisonData();
  }, [selectedArtists]);

  // 분석 결과 계산 (메모이제이션)
  const analysisResults = useMemo(() => {
    if (!comparisonData) return null;
    
    return calculateTrajectoryAnalysis(
      comparisonData.axesData,
      comparisonData.artistA,
      comparisonData.artistB,
      analysisMethod
    );
  }, [comparisonData, analysisMethod]);

  // 아티스트 선택 핸들러
  const handleArtistChange = (position, artistId) => {
    setSelectedArtists(prev => ({
      ...prev,
      [position]: artistId
    }));
  };

  // 분석 방법 변경 핸들러
  const handleAnalysisMethodChange = (method) => {
    setAnalysisMethod(method);
  };

  if (loading) {
    return (
      <div className="curator-app">
        <div className="dyss-container">
          <div className="curator-artist-header">
            <div className="curator-skeleton curator-skeleton--title"></div>
            <div className="curator-skeleton curator-skeleton--title" style={{width: '60%', height: '20px', marginTop: '12px'}}></div>
          </div>
          
          <div className="curator-phase3-grid">
            {[1,2,3,4].map(i => (
              <LoadingSkeleton key={i} type="skeleton" />
            ))}
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
            <h3 className="curator-error-title">비교 분석 오류</h3>
            <p className="curator-error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="curator-app">
        <div className="dyss-container">
          {/* 헤더 섹션 */}
          <div className="curator-artist-header curator-animate-fade-in">
            <div className="curator-phase3-header">
              <h1 className="curator-artist-name">
                <span className="artist-a-color">{comparisonData.artistA.name}</span>
                <span className="vs-separator"> vs </span>
                <span className="artist-b-color">{comparisonData.artistB.name}</span>
              </h1>
              <h2 className="curator-phase-title">Phase 3</h2>
              <p className="curator-phase-subtitle">다음 성공은 누구인가?</p>
            </div>
            
            {/* 아티스트 선택기 */}
            <div className="curator-controls curator-animate-fade-in curator-animate-delay-100">
              <ArtistSelector 
                selectedArtists={selectedArtists}
                onChange={handleArtistChange}
              />
              
              {/* 분석 방법 토글 */}
              <div className="analysis-method-selector">
                <label>분석 방법:</label>
                <div className="method-buttons">
                  {[
                    { key: 'trajectory', label: '궤적 분석' },
                    { key: 'market', label: '시장 가치' },
                    { key: 'combined', label: '종합 분석' }
                  ].map(method => (
                    <button
                      key={method.key}
                      className={`method-btn ${analysisMethod === method.key ? 'active' : ''}`}
                      onClick={() => handleAnalysisMethodChange(method.key)}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 스몰 멀티플 비교 차트 그리드 */}
          <div className="curator-phase3-grid">
            {comparisonData.axesData.map((axisData, index) => (
              <div 
                key={axisData.axis}
                className={`curator-chart-container curator-animate-fade-in curator-animate-delay-${200 + (index * 100)}`}
                onMouseEnter={() => setHoveredAxis(axisData.axis)}
                onMouseLeave={() => setHoveredAxis(null)}
              >
                <h3 className="curator-chart-title">
                  <span className="axis-icon">{getAxisIcon(axisData.axis)}</span>
                  {axisData.axis} 축 성장 궤적
                  <span className="chart-meta">
                    궤적 차이: {axisData.trajectoryDifference?.toFixed(1) || 'N/A'}
                  </span>
                </h3>
                
                <ComparisonAreaChart
                  series={axisData.series}
                  axis={axisData.axis}
                  artistA={{
                    name: comparisonData.artistA.name,
                    color: '#EF4444', // 빨간색 계열
                    colorSecondary: '#FCA5A5'
                  }}
                  artistB={{
                    name: comparisonData.artistB.name,
                    color: '#3B82F6', // 파란색 계열
                    colorSecondary: '#93C5FD'
                  }}
                  isHighlighted={hoveredAxis === axisData.axis}
                />
              </div>
            ))}
          </div>

          {/* 종합 분석 요약 */}
          <div className="curator-analysis-section curator-animate-fade-in curator-animate-delay-600">
            <AnalysisSummary 
              artistA={comparisonData.artistA}
              artistB={comparisonData.artistB}
              analysisResults={analysisResults}
              analysisMethod={analysisMethod}
              hoveredAxis={hoveredAxis}
            />
          </div>

          {/* 메타데이터 */}
          <div className="curator-metadata curator-animate-fade-in curator-animate-delay-700">
            <div className="curator-chart-container" style={{textAlign: 'center', padding: 'var(--dyss-space-4)'}}>
              <p style={{
                fontSize: 'var(--dyss-font-size-sm)', 
                color: 'var(--dyss-color-text-secondary)',
                margin: '0'
              }}>
                <strong>Comparison Model:</strong> {analysisResults?.model || 'Trajectory-Value AHP v1'} • 
                <strong> Sample Size:</strong> {comparisonData.metadata?.totalDataPoints || 'N/A'} data points •
                <strong> Updated:</strong> {new Date().toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// 헬퍼 함수
const getAxisIcon = (axis) => {
  const icons = {
    '제도': '🏛️',
    '학술': '📚', 
    '담론': '💬',
    '네트워크': '🌐'
  };
  return icons[axis] || '📊';
};

export default ArtistPhase3View;

