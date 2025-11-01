import React, { useMemo } from 'react';

const PhaseSummaryDashboard = React.memo(({ 
  phase1Data, 
  phase2Data, 
  phase3Data,
  className = '' 
}) => {

  // Maya Chen 비교 분석 전문성: 핵심 지표 계산
  const dashboardMetrics = useMemo(() => {
    if (!phase1Data || !phase2Data) return null;

    return {
      phase1: {
        title: 'Phase 1: 현재 가치',
        icon: '🎯',
        mainScore: Math.round((
          Object.values(phase1Data.radar5).reduce((sum, val) => sum + val, 0) / 5
        )),
        subtitle: '5축 평균',
        highlight: `최강축: ${getMaxAxis(phase1Data.radar5)}`,
        color: 'var(--dyss-color-primary)'
      },
      phase2: {
        title: 'Phase 2: 성장 궤적',
        icon: '📈',
        mainScore: calculateGrowthRate(phase2Data.bins),
        subtitle: '연평균 성장률',
        highlight: `변곡점: ${countInflections(phase2Data.bins)}개`,
        color: 'var(--dyss-color-primary-400)'
      },
      phase3: {
        title: 'Phase 3: 비교 분석',
        icon: '⚖️',
        mainScore: phase3Data?.competitiveness || 'N/A',
        subtitle: '경쟁력 지수',
        highlight: `미래 잠재력: ${phase3Data?.potential || 'High'}`,
        color: 'var(--dyss-color-primary-300)'
      }
    };
  }, [phase1Data, phase2Data, phase3Data]);

  if (!dashboardMetrics) {
    return (
      <div className={`phase-summary-dashboard loading ${className}`}>
        <div className="dashboard-loading">
          <div className="curator-spinner"></div>
          <p>Phase 통합 분석 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`phase-summary-dashboard ${className}`}>
      <div className="dashboard-header">
        <h3 className="dashboard-title">🎪 CuratorOdyssey 통합 분석 요약</h3>
        <p className="dashboard-subtitle">Phase 1-3 핵심 지표 통합 대시보드</p>
      </div>

      <div className="summary-cards-grid">
        {Object.entries(dashboardMetrics).map(([phase, metrics]) => (
          <div 
            key={phase}
            className="summary-card-enhanced"
            style={{ '--accent-color': metrics.color }}
          >
            <div className="card-header">
              <div className="card-icon">{metrics.icon}</div>
              <div className="card-title-group">
                <h4 className="card-title">{metrics.title}</h4>
                <p className="card-subtitle">{metrics.subtitle}</p>
              </div>
            </div>
            
            <div className="card-main-score">
              {typeof metrics.mainScore === 'number' 
                ? `${metrics.mainScore}${phase === 'phase2' ? '%' : ''}`
                : metrics.mainScore
              }
            </div>
            
            <div className="card-highlight">
              {metrics.highlight}
            </div>
          </div>
        ))}
      </div>

      {/* 통합 인사이트 */}
      <div className="integrated-insights">
        <h4 className="insights-title">💡 통합 인사이트</h4>
        <div className="insights-grid">
          <div className="insight-item">
            <strong>종합 평가:</strong> {getOverallAssessment(dashboardMetrics)}
          </div>
          <div className="insight-item">
            <strong>핵심 강점:</strong> {getKeyStrength(phase1Data)}
          </div>
          <div className="insight-item">
            <strong>성장 전략:</strong> {getGrowthStrategy(phase2Data)}
          </div>
        </div>
      </div>
    </div>
  );
});

// 헬퍼 함수들
const getMaxAxis = (radar5) => {
  return Object.entries(radar5).reduce((max, [axis, score]) => {
    return score > max.score ? { axis, score } : max;
  }, { axis: '', score: 0 }).axis;
};

const calculateGrowthRate = (bins) => {
  if (!bins || bins.length < 2) return 0;
  
  const start = bins[0];
  const end = bins[bins.length - 1];
  const avgStart = (start.institution + start.academic + start.discourse + start.network) / 4;
  const avgEnd = (end.institution + end.academic + end.discourse + end.network) / 4;
  
  return Math.round(((avgEnd - avgStart) / end.t) * 100) / 100;
};

const countInflections = (bins) => {
  if (!bins || bins.length < 3) return 0;
  
  let inflections = 0;
  for (let i = 1; i < bins.length - 1; i++) {
    const prev = bins[i-1];
    const curr = bins[i];
    const next = bins[i+1];
    
    const avgPrev = (prev.institution + prev.academic + prev.discourse + prev.network) / 4;
    const avgCurr = (curr.institution + curr.academic + curr.discourse + curr.network) / 4;
    const avgNext = (next.institution + next.academic + next.discourse + next.network) / 4;
    
    if ((avgCurr - avgPrev) * (avgNext - avgCurr) < 0) {
      inflections++;
    }
  }
  
  return inflections;
};

const getOverallAssessment = (metrics) => {
  const phase1Score = metrics.phase1.mainScore;
  
  if (phase1Score >= 90) return '최상급 작가';
  if (phase1Score >= 80) return '상급 작가';
  if (phase1Score >= 70) return '성장 잠재력 작가';
  return '신진 작가';
};

const getKeyStrength = (phase1Data) => {
  const radar5 = phase1Data.radar5;
  const maxAxis = Object.entries(radar5).reduce((max, [axis, score]) => {
    return score > max.score ? { axis, score } : max;
  }, { axis: '', score: 0 });

  const axisNames = {
    'I': '기관전시',
    'F': '페어', 
    'A': '시상',
    'M': '미디어',
    'Sedu': '교육'
  };

  return axisNames[maxAxis.axis] || '종합 역량';
};

const getGrowthStrategy = (phase2Data) => {
  const growthRate = calculateGrowthRate(phase2Data.bins);
  
  if (growthRate > 5) return '가속 성장 전략';
  if (growthRate > 3) return '안정적 확장 전략';
  return '기반 강화 전략';
};

export default PhaseSummaryDashboard;

