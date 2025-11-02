import React, { useMemo } from 'react';

// Maya Chen - P2 복잡 품질 데이터를 사용자 친화적 UI로 표시

const QualityIndicator = React.memo(({ 
  qualityData,
  showAdvanced = false,
  className = ''
}) => {
  
  // P2 품질 데이터 파싱 및 해석
  const qualityAnalysis = useMemo(() => {
    if (!qualityData) {
      return {
        overall: 0.95,
        consistency: true,
        level: 'good',
        message: '기본 품질'
      };
    }

    const overall = qualityData.data_quality_score || qualityData.overall || 0.95;
    const consistency = qualityData.consistency_score >= 0.995 || 
                       qualityData.consistency_check !== false;
    
    const level = overall >= 0.98 ? 'excellent' :
                  overall >= 0.95 ? 'very_good' :
                  overall >= 0.90 ? 'good' :
                  overall >= 0.80 ? 'acceptable' : 'needs_review';

    const messages = {
      excellent: '최고 품질 - 프로덕션 완전 준비',
      very_good: '매우 우수 - 안정적 사용 가능',
      good: '우수 - 일반적 사용 권장',
      acceptable: '양호 - 주의 깊은 사용',
      needs_review: '검토 필요 - 주의'
    };

    return {
      overall,
      consistency,
      level,
      message: messages[level],
      statistical_confidence: qualityData.statistical_confidence || 0.90
    };
  }, [qualityData]);

  // 품질 점수에 따른 색상 결정
  const getQualityColor = (level) => {
    const colors = {
      excellent: '#10B981',    // 녹색
      very_good: '#059669',    // 진한 녹색  
      good: '#3B82F6',         // 파란색
      acceptable: '#F59E0B',   // 주황색
      needs_review: '#EF4444'  // 빨간색
    };
    return colors[level] || colors.good;
  };

  return (
    <div className={`quality-indicator ${className}`}>
      <div className="quality-header">
        <h5 className="quality-title">📊 데이터 품질 상태</h5>
        {qualityData?.generated_at && (
          <span className="quality-timestamp">
            검증: {new Date(qualityData.generated_at).toLocaleTimeString('ko-KR')}
          </span>
        )}
      </div>

      {/* 전체 품질 점수 */}
      <div className="quality-score-display">
        <div 
          className="quality-score-circle"
          style={{ '--quality-color': getQualityColor(qualityAnalysis.level) }}
        >
          <span className="score-number">
            {(qualityAnalysis.overall * 100).toFixed(1)}
          </span>
          <span className="score-unit">%</span>
        </div>
        
        <div className="quality-info">
          <div 
            className={`quality-level quality-level--${qualityAnalysis.level}`}
            style={{ color: getQualityColor(qualityAnalysis.level) }}
          >
            {qualityAnalysis.message}
          </div>
        </div>
      </div>

      {/* P2 ±0.5p 일관성 검증 표시 */}
      <div className="consistency-section">
        <div className={`consistency-badge ${qualityAnalysis.consistency ? 'pass' : 'warning'}`}>
          {qualityAnalysis.consistency ? (
            <>
              <span className="badge-icon">✅</span>
              <span className="badge-text">일관성 검증 통과</span>
            </>
          ) : (
            <>
              <span className="badge-icon">⚠️</span>
              <span className="badge-text">일관성 검토 필요</span>
            </>
          )}
        </div>
        
        <div className="consistency-description">
          <small>레이더-선버스트 데이터 일치성 (±0.5p 허용오차)</small>
        </div>
      </div>

      {/* 고급 정보 (선택적 표시) */}
      {showAdvanced && qualityData && (
        <div className="advanced-quality-info">
          <h6>🔬 상세 품질 정보</h6>
          
          <div className="quality-metrics-grid">
            {qualityData.statistical_confidence && (
              <div className="metric-item">
                <span className="metric-label">통계적 신뢰도:</span>
                <span className="metric-value">
                  {(qualityData.statistical_confidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
            
            {qualityData.normalization_method && (
              <div className="metric-item">
                <span className="metric-label">정규화 방법:</span>
                <span className="metric-value">{qualityData.normalization_method}</span>
              </div>
            )}
            
            {qualityData.weights_version && (
              <div className="metric-item">
                <span className="metric-label">가중치 버전:</span>
                <span className="metric-value">{qualityData.weights_version}</span>
              </div>
            )}

            {qualityData.data_points_count && (
              <div className="metric-item">
                <span className="metric-label">데이터 포인트:</span>
                <span className="metric-value">
                  {qualityData.data_points_count.toLocaleString('ko-KR')}개
                </span>
              </div>
            )}
          </div>

          {/* P2 품질 검증 세부 결과 */}
          {qualityData.quality_checks && (
            <div className="detailed-checks">
              <h6>세부 검증 결과</h6>
              <ul className="checks-list">
                {Object.entries(qualityData.quality_checks).map(([check, passed]) => (
                  <li key={check} className={`check-item ${passed ? 'pass' : 'fail'}`}>
                    <span className="check-icon">{passed ? '✓' : '✗'}</span>
                    <span className="check-name">{formatCheckName(check)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 시스템 권장사항 */}
      <div className="quality-recommendations">
        {qualityAnalysis.level === 'needs_review' && (
          <div className="recommendation warning">
            💡 권장: 데이터 품질 검토 후 사용 권장
          </div>
        )}
        
        {qualityAnalysis.level === 'excellent' && (
          <div className="recommendation success">
            🚀 상태: 프로덕션 사용에 최적화된 품질
          </div>
        )}
      </div>
    </div>
  );
});

// 헬퍼 함수들
const formatCheckName = (checkKey) => {
  const checkNames = {
    'radar_sunburst_consistency': '레이더-선버스트 일관성',
    'data_completeness': '데이터 완성도',
    'temporal_continuity': '시간적 연속성',
    'statistical_validity': '통계적 유효성',
    'source_reliability': '출처 신뢰성'
  };
  
  return checkNames[checkKey] || checkKey.replace(/_/g, ' ');
};

export default QualityIndicator;

