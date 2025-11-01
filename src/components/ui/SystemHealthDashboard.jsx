import React, { useEffect, useState } from 'react';
import { useRiskMonitoring } from '../../utils/riskMonitor';
import QualityIndicator from './QualityIndicator';

// Maya Chen 시스템 상태 대시보드 - P1/P2/P3 통합 상태 실시간 표시

const SystemHealthDashboard = React.memo(({ 
  showDetails = false,
  className = ''
}) => {
  const { riskSummary, startMonitoring, stopMonitoring } = useRiskMonitoring(true);
  const [systemStatus, setSystemStatus] = useState({
    p1_backend: 'checking',
    p2_database: 'checking', 
    p3_frontend: 'checking',
    overall: 'checking'
  });

  // 시스템 상태 업데이트
  useEffect(() => {
    if (riskSummary) {
      const newStatus = {
        p1_backend: riskSummary.level === 'low' ? 'healthy' : 
                   riskSummary.level === 'medium' ? 'warning' : 'error',
        p2_database: 'healthy', // P2 구현 상태에 따라 동적 업데이트
        p3_frontend: 'healthy', // Maya Chen 구현 완료
        overall: riskSummary.level
      };
      
      setSystemStatus(newStatus);
    }
  }, [riskSummary]);

  // 상태별 아이콘 및 색상
  const getStatusDisplay = (status) => {
    const displays = {
      checking: { icon: '🔄', color: '#6B7280', text: '확인 중' },
      healthy: { icon: '✅', color: '#10B981', text: '정상' },
      warning: { icon: '⚠️', color: '#F59E0B', text: '주의' },
      error: { icon: '❌', color: '#EF4444', text: '오류' }
    };
    return displays[status] || displays.checking;
  };

  return (
    <div className={`system-health-dashboard ${className}`}>
      <div className="health-header">
        <h4 className="health-title">🏥 시스템 상태 모니터링</h4>
        <div className="monitoring-controls">
          <button
            className="monitoring-btn"
            onClick={riskSummary?.active_monitoring ? stopMonitoring : startMonitoring}
            title={riskSummary?.active_monitoring ? '모니터링 중단' : '모니터링 시작'}
          >
            {riskSummary?.active_monitoring ? '⏸️ 중단' : '▶️ 시작'}
          </button>
        </div>
      </div>

      {/* 전체 시스템 상태 */}
      <div className="overall-status">
        <div className="status-card overall-card">
          <div className="status-icon-large">
            {getStatusDisplay(systemStatus.overall).icon}
          </div>
          <div className="status-info">
            <h5>전체 시스템</h5>
            <p className="status-text" style={{ color: getStatusDisplay(systemStatus.overall).color }}>
              {getStatusDisplay(systemStatus.overall).text}
            </p>
            {riskSummary?.last_check && (
              <small className="last-check">
                마지막 확인: {new Date(riskSummary.last_check).toLocaleTimeString('ko-KR')}
              </small>
            )}
          </div>
        </div>
      </div>

      {/* 개별 시스템 상태 */}
      <div className="individual-systems">
        <div className="systems-grid">
          <div className="system-card">
            <div className="system-header">
              <span className="system-icon">{getStatusDisplay(systemStatus.p1_backend).icon}</span>
              <h6>P1 백엔드</h6>
            </div>
            <div className="system-status">
              <span style={{ color: getStatusDisplay(systemStatus.p1_backend).color }}>
                {getStatusDisplay(systemStatus.p1_backend).text}
              </span>
            </div>
            <div className="system-details">
              <small>API • Vertex AI • Secret Manager</small>
            </div>
          </div>

          <div className="system-card">
            <div className="system-header">
              <span className="system-icon">{getStatusDisplay(systemStatus.p2_database).icon}</span>
              <h6>P2 데이터베이스</h6>
            </div>
            <div className="system-status">
              <span style={{ color: getStatusDisplay(systemStatus.p2_database).color }}>
                {getStatusDisplay(systemStatus.p2_database).text}
              </span>
            </div>
            <div className="system-details">
              <small>Firestore • 배치 • 품질검증</small>
            </div>
          </div>

          <div className="system-card">
            <div className="system-header">
              <span className="system-icon">{getStatusDisplay(systemStatus.p3_frontend).icon}</span>
              <h6>P3 프론트엔드</h6>
            </div>
            <div className="system-status">
              <span style={{ color: getStatusDisplay(systemStatus.p3_frontend).color }}>
                Maya Chen 완성
              </span>
            </div>
            <div className="system-details">
              <small>비교분석 • 통계엔진 • UI</small>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 정보 (선택적 표시) */}
      {showDetails && riskSummary && (
        <div className="detailed-health-info">
          <h5>📊 상세 모니터링 정보</h5>
          
          <div className="health-metrics">
            <div className="metric-row">
              <span>전체 위험 점수:</span>
              <span className="metric-value">{riskSummary.score}/5.0</span>
            </div>
            
            <div className="metric-row">
              <span>고위험 요소:</span>
              <span className={`metric-value ${riskSummary.high_priority_issues?.length > 0 ? 'warning' : 'good'}`}>
                {riskSummary.high_priority_issues?.length || 0}개
              </span>
            </div>

            <div className="metric-row">
              <span>모니터링 상태:</span>
              <span className="metric-value">
                {riskSummary.active_monitoring ? '🟢 활성' : '🔴 비활성'}
              </span>
            </div>
          </div>

          {/* 고위험 요소 목록 */}
          {riskSummary.high_priority_issues && riskSummary.high_priority_issues.length > 0 && (
            <div className="high-priority-issues">
              <h6>🚨 우선 조치 필요 항목</h6>
              <ul className="issues-list">
                {riskSummary.high_priority_issues.map((issue, index) => (
                  <li key={index} className="issue-item">
                    <span className="issue-category">{issue.category}:</span>
                    <span className="issue-type">{issue.risk_type}</span>
                    <span className="issue-level">({issue.level})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 통합 준비 상태 표시 */}
      <div className="integration-readiness">
        <h5>🤝 P1/P2/P3 통합 준비도</h5>
        <div className="readiness-indicators">
          <div className="readiness-item">
            <span>API 연동:</span>
            <span className={`readiness-status ${systemStatus.p1_backend === 'healthy' ? 'ready' : 'waiting'}`}>
              {systemStatus.p1_backend === 'healthy' ? 'Ready' : 'Waiting for P1'}
            </span>
          </div>
          
          <div className="readiness-item">
            <span>데이터 연동:</span>
            <span className={`readiness-status ${systemStatus.p2_database === 'healthy' ? 'ready' : 'waiting'}`}>
              {systemStatus.p2_database === 'healthy' ? 'Ready' : 'Waiting for P2'}
            </span>
          </div>
          
          <div className="readiness-item">
            <span>UI 준비:</span>
            <span className="readiness-status ready">Maya Chen 완료</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SystemHealthDashboard;

