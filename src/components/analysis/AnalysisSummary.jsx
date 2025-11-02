import React, { useMemo } from 'react';

const AnalysisSummary = React.memo(({ 
  artistA, 
  artistB, 
  analysisResults, 
  analysisMethod = 'trajectory',
  hoveredAxis 
}) => {
  
  // 분석 결과별 시각화 데이터
  const summaryData = useMemo(() => {
    if (!analysisResults) return null;

    const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);
    const formatCurrency = (num) => new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);

    return {
      trajectory: {
        title: '궤적 분석 결과',
        items: [
          {
            label: '총 궤적 차이 지수',
            value: formatNumber(analysisResults.totalTrajectoryDifference.toFixed(1)),
            description: '4개 축의 성장 경로(AUC) 차이의 총합',
            type: 'primary'
          },
          {
            label: '가장 큰 차이 축',
            value: analysisResults.dominantDifferenceAxis?.axis || 'N/A',
            description: `차이: ${analysisResults.dominantDifferenceAxis?.difference?.toFixed(1) || 'N/A'}`,
            type: 'info'
          },
          {
            label: '성장 패턴 유사도',
            value: `${(analysisResults.growthPatternSimilarity * 100).toFixed(1)}%`,
            description: '두 작가의 전체적인 성장 패턴 일치도',
            type: 'secondary'
          }
        ]
      },
      market: {
        title: '시장 가치 분석',
        items: [
          {
            label: '최고 호당 가격 차이',
            value: formatCurrency(Math.abs((artistA?.highestPricePerHo || 0) - (artistB?.highestPricePerHo || 0))),
            description: `${artistA?.name || 'N/A'}: ${formatCurrency(artistA?.highestPricePerHo || 0)} | ${artistB?.name || 'N/A'}: ${formatCurrency(artistB?.highestPricePerHo || 0)}`,
            type: 'primary'
          },
          {
            label: '시장 성숙도',
            value: analysisResults.marketMaturity?.leader || 'N/A',
            description: `시장 선도 작가 (${analysisResults.marketMaturity?.score?.toFixed(2) || 'N/A'} 배 차이)`,
            type: 'info'
          },
          {
            label: '가격 변동성',
            value: `${(analysisResults.priceVolatility * 100).toFixed(1)}%`,
            description: '최근 5년간 평균 가격 변동률',
            type: 'secondary'
          }
        ]
      },
      combined: {
        title: '종합 분석 결과',
        items: [
          {
            label: '궤적-가치 상관계수',
            value: analysisResults.trajectoryValueCorrelation?.toFixed(3) || 'N/A',
            description: '커리어 궤적과 시장 가치 간의 상관관계',
            type: 'primary'
          },
          {
            label: '미래 성장 잠재력',
            value: analysisResults.futurePotential?.leader || 'N/A',
            description: `예상 성장률: ${analysisResults.futurePotential?.growthRate?.toFixed(1) || 'N/A'}%`,
            type: 'success'
          },
          {
            label: '투자 리스크 레벨',
            value: analysisResults.riskLevel || 'N/A',
            description: '포트폴리오 다변화 권장도',
            type: analysisResults.riskLevel === 'High' ? 'warning' : 'info'
          }
        ]
      }
    };
  }, [analysisResults, artistA, artistB]);

  // 인사이트 생성 메모이제이션 (Hooks 규칙: early return 전에 호출)
  const insights = useMemo(() => {
    if (!analysisResults) return [];
    
    const insightList = [];
    const method = analysisMethod;

    if (method === 'trajectory') {
      if (analysisResults.dominantDifferenceAxis) {
        insightList.push(`${analysisResults.dominantDifferenceAxis.axis} 축에서 가장 큰 성장 궤적 차이를 보입니다.`);
      }
      
      if (analysisResults.growthPatternSimilarity > 0.7) {
        insightList.push(`두 작가의 성장 패턴이 ${(analysisResults.growthPatternSimilarity * 100).toFixed(0)}% 유사하여, 동일한 전략이 효과적일 가능성이 높습니다.`);
      } else {
        insightList.push(`서로 다른 성장 경로를 보이므로, 차별화된 전략이 필요합니다.`);
      }
    }

    if (method === 'market') {
      const priceLeader = artistA?.highestPricePerHo > artistB?.highestPricePerHo ? artistA?.name : artistB?.name;
      if (priceLeader) {
        insightList.push(`${priceLeader}이 현재 시장에서 더 높은 평가를 받고 있습니다.`);
      }
    }

    if (method === 'combined') {
      if (analysisResults.futurePotential?.leader) {
        insightList.push(`종합 분석 결과, ${analysisResults.futurePotential.leader}의 미래 성장 잠재력이 더 높게 평가됩니다.`);
      }
    }

    return insightList;
  }, [analysisResults, artistA, artistB, analysisMethod]);

  if (!summaryData || !analysisResults) {
    return (
      <div className="curator-chart-container curator-analysis-summary">
        <h3 className="curator-chart-title">🔍 분석 결과</h3>
        <div className="curator-loading">
          <div className="curator-spinner"></div>
          <div>분석 결과를 계산하고 있습니다...</div>
        </div>
      </div>
    );
  }

  const currentData = summaryData[analysisMethod];

  return (
    <div className="curator-chart-container curator-analysis-summary">
      <h3 className="curator-chart-title">
        🔍 {currentData.title}
        {hoveredAxis && (
          <span className="current-focus">
            • 현재 포커스: {hoveredAxis} 축
          </span>
        )}
      </h3>
      
      <div className="analysis-summary-grid">
        {currentData.items.map((item, index) => (
          <div 
            key={index}
            className={`summary-card summary-card--${item.type} curator-animate-fade-in curator-animate-delay-${100 + (index * 50)}`}
          >
            <div className="summary-header">
              <span className="summary-label">{item.label}</span>
              <div className={`summary-indicator summary-indicator--${item.type}`}></div>
            </div>
            
            <div className="summary-value">{item.value}</div>
            
            <div className="summary-description">
              {item.description}
            </div>
          </div>
        ))}
      </div>

      {/* 상세 인사이트 섹션 */}
      <div className="analysis-insights">
        <h4 className="insights-title">💡 핵심 인사이트</h4>
        <div className="insights-content">
          {insights.map((insight, index) => (
            <div key={index} className="insight-item">
              <span className="insight-bullet">•</span>
              <span className="insight-text">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 축별 세부 분석 (호버시 표시) */}
      {hoveredAxis && analysisResults.axisDetails && (
        <div className="axis-detail-panel curator-animate-fade-in">
          <h4 className="axis-detail-title">{hoveredAxis} 축 세부 분석</h4>
          <div className="axis-metrics">
            <div className="metric-row">
              <span>평균 성장률:</span>
              <span>{analysisResults.axisDetails[hoveredAxis]?.averageGrowthRate?.toFixed(2) || 'N/A'}% / 년</span>
            </div>
            <div className="metric-row">
              <span>변곡점 수:</span>
              <span>{analysisResults.axisDetails[hoveredAxis]?.inflectionPoints || 'N/A'}개</span>
            </div>
            <div className="metric-row">
              <span>현재 격차:</span>
              <span>{analysisResults.axisDetails[hoveredAxis]?.currentGap?.toFixed(1) || 'N/A'} 포인트</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AnalysisSummary;
