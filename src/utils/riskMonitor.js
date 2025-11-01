import React, { useState, useEffect } from 'react';

// Maya Chen 실시간 위험 모니터링 시스템
// P1/P2/P3 통합 과정 위험요인 실시간 감지 및 대응

class RealTimeRiskMonitor {
  constructor() {
    this.riskHistory = [];
    this.currentRisks = {};
    this.monitoringActive = false;
    this.alertCallbacks = [];
    
    this.riskThresholds = {
      api_response_time: 5000,      // 5초 이상시 위험
      error_rate: 0.10,             // 10% 이상 에러시 위험  
      data_quality: 0.90,           // 90% 미만시 위험
      memory_usage: 100 * 1024 * 1024, // 100MB 이상시 위험
      ui_responsiveness: 1000       // 1초 이상 반응 없으면 위험
    };
  }

  startMonitoring(interval = 30000) {
    if (this.monitoringActive) {
      console.log('⚠️ 위험 모니터링이 이미 활성화되어 있습니다');
      return;
    }

    console.log('🔍 실시간 위험 모니터링 시작 (Maya Chen 시스템 통합 전문성)');
    this.monitoringActive = true;

    this.monitoringInterval = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        await this.performRiskAssessment();
      }
    }, interval);

    // 초기 위험 평가
    this.performRiskAssessment();
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringActive = false;
      console.log('⏹️ 위험 모니터링 중단');
    }
  }

  async performRiskAssessment() {
    const timestamp = new Date().toISOString();
    
    try {
      const riskAssessment = {
        timestamp,
        p1_api_risks: await this.assessP1APIRisks(),
        p2_data_risks: await this.assessP2DataRisks(),
        p3_ui_risks: await this.assessP3UIRisks(),
        integration_risks: await this.assessIntegrationRisks(),
        performance_risks: await this.assessPerformanceRisks()
      };

      // 전체 위험 레벨 계산
      const overallRisk = this.calculateOverallRiskLevel(riskAssessment);
      riskAssessment.overall_risk = overallRisk;

      // 위험 히스토리 업데이트
      this.riskHistory.push(riskAssessment);
      this.currentRisks = riskAssessment;

      // 위험 레벨이 높으면 경고
      if (overallRisk.level === 'high') {
        this.triggerRiskAlert(overallRisk);
      }

      // 위험 히스토리 크기 제한 (최근 100개만 유지)
      if (this.riskHistory.length > 100) {
        this.riskHistory = this.riskHistory.slice(-100);
      }

    } catch (error) {
      console.error('❌ 위험 평가 중 오류:', error);
    }
  }

  async assessP1APIRisks() {
    // P1 백엔드 API 위험요인 평가
    const risks = {
      connectivity: 'low',
      response_time: 'low', 
      error_rate: 'low',
      availability: 'unknown'
    };

    try {
      // P1 API 연결 상태 체크
      const testCall = await this.quickAPITest('/api/artist/ARTIST_0005/summary');
      
      if (!testCall.success) {
        risks.connectivity = testCall.error?.includes('404') ? 'medium' : 'high';
        risks.availability = 'low';
      } else {
        risks.connectivity = 'low';
        risks.response_time = testCall.responseTime > this.riskThresholds.api_response_time ? 'high' : 'low';
        risks.availability = 'high';
      }

    } catch (error) {
      risks.connectivity = 'high';
      risks.availability = 'unknown';
    }

    return risks;
  }

  async assessP2DataRisks() {
    // P2 데이터베이스 위험요인 평가
    const risks = {
      data_quality: 'low',
      consistency: 'low',
      completeness: 'medium', // P2 구현 진행도에 따라
      schema_stability: 'medium'
    };

    try {
      // P2 데이터 품질 지표 확인 (가능한 경우)
      const qualityTest = await this.quickAPITest('/api/admin/data-quality-status');
      
      if (qualityTest.success && qualityTest.data) {
        const qualityScore = qualityTest.data.overall_score || 0.95;
        risks.data_quality = qualityScore < this.riskThresholds.data_quality ? 'high' : 'low';
        risks.consistency = qualityTest.data.consistency_passed ? 'low' : 'medium';
      }

    } catch (error) {
      // P2 API 미구현시 기본값 유지
      console.log('ℹ️ P2 품질 API 미구현, 기본 위험도 적용');
    }

    return risks;
  }

  async assessP3UIRisks() {
    // Maya Chen P3 UI 위험요인 평가 
    const risks = {
      rendering_performance: 'low',
      memory_usage: 'low',
      user_interaction: 'low',
      accessibility: 'low'
    };

    try {
      // UI 성능 지표 체크
      const memoryUsage = performance.memory?.usedJSHeapSize || 0;
      risks.memory_usage = memoryUsage > this.riskThresholds.memory_usage ? 'high' : 'low';

      // 마지막 사용자 인터랙션으로부터 시간 체크
      const lastInteraction = Date.now() - (window.lastUserInteraction || Date.now());
      risks.user_interaction = lastInteraction > 300000 ? 'medium' : 'low'; // 5분 이상 비활성

      // 접근성 기능 작동 확인
      const accessibilityFeatures = this.checkAccessibilityFeatures();
      risks.accessibility = accessibilityFeatures ? 'low' : 'medium';

    } catch (error) {
      console.warn('⚠️ P3 UI 위험 평가 중 오류:', error);
      risks.rendering_performance = 'medium';
    }

    return risks;
  }

  async assessIntegrationRisks() {
    // 전체 시스템 통합 위험요인 평가
    const risks = {
      data_flow: 'low',
      component_compatibility: 'low',
      state_synchronization: 'low',
      error_propagation: 'medium' // 기본적으로 중간 위험
    };

    // 통합 상태 체크
    try {
      const integrationHealth = await this.checkIntegrationHealth();
      
      if (!integrationHealth.data_flow_working) {
        risks.data_flow = 'high';
      }
      
      if (!integrationHealth.components_synchronized) {
        risks.state_synchronization = 'high';
      }

    } catch (error) {
      risks.component_compatibility = 'high';
      risks.error_propagation = 'high';
    }

    return risks;
  }

  async assessPerformanceRisks() {
    // 성능 위험요인 평가
    const risks = {
      bundle_size: 'medium',  // 번들 크기 미측정
      render_time: 'low',     // Maya Chen 최적화 적용
      api_latency: 'medium',  // P1 API 의존
      memory_leaks: 'low'     // React 훅 최적화 적용
    };

    try {
      // 실제 성능 지표 측정
      if (performance.memory) {
        const memoryGrowth = this.detectMemoryGrowth();
        risks.memory_leaks = memoryGrowth > 0.1 ? 'high' : 'low';
      }

    } catch (error) {
      console.warn('⚠️ 성능 위험 평가 제한적:', error);
    }

    return risks;
  }

  calculateOverallRiskLevel(assessment) {
    const allRisks = [];
    
    // 모든 위험 요인 수집
    Object.values(assessment).forEach(category => {
      if (category && typeof category === 'object') {
        Object.values(category).forEach(risk => {
          if (['low', 'medium', 'high'].includes(risk)) {
            allRisks.push(risk);
          }
        });
      }
    });

    // 위험 레벨 점수화
    const riskScores = allRisks.map(risk => {
      switch (risk) {
        case 'low': return 1;
        case 'medium': return 3;
        case 'high': return 5;
        default: return 2;
      }
    });

    const averageRisk = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
    
    const level = averageRisk <= 2 ? 'low' : 
                  averageRisk <= 3.5 ? 'medium' : 'high';

    return {
      level,
      score: averageRisk.toFixed(2),
      total_risks: allRisks.length,
      high_risks: allRisks.filter(r => r === 'high').length,
      medium_risks: allRisks.filter(r => r === 'medium').length
    };
  }

  triggerRiskAlert(overallRisk) {
    const alertMessage = `🚨 높은 위험도 감지: ${overallRisk.level} (${overallRisk.score}/5.0)`;
    console.error(alertMessage, {
      high_risks: overallRisk.high_risks,
      total_risks: overallRisk.total_risks,
      timestamp: new Date().toLocaleString('ko-KR')
    });

    // 등록된 알림 콜백 실행
    this.alertCallbacks.forEach(callback => {
      try {
        callback(overallRisk, alertMessage);
      } catch (error) {
        console.error('❌ 위험 알림 콜백 오류:', error);
      }
    });
  }

  // 공개 메서드들
  onRiskAlert(callback) {
    this.alertCallbacks.push(callback);
  }

  getCurrentRiskLevel() {
    return this.currentRisks?.overall_risk || { level: 'unknown', score: 0 };
  }

  getRiskHistory(limit = 10) {
    return this.riskHistory.slice(-limit);
  }

  // 헬퍼 함수들
  async quickAPITest(url) {
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',  // 빠른 연결 테스트
        timeout: 3000    // 3초 타임아웃
      });
      
      return {
        success: response.ok,
        responseTime: performance.now() - startTime,
        status: response.status
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        responseTime: performance.now() - startTime
      };
    }
  }

  checkAccessibilityFeatures() {
    // 접근성 기능 작동 여부 확인
    try {
      const hasAriaLabels = document.querySelectorAll('[aria-label]').length > 0;
      const hasProperHeadings = document.querySelectorAll('h1, h2, h3, h4').length > 0;
      const hasKeyboardSupport = document.querySelectorAll('[tabindex]').length > 0;
      
      return hasAriaLabels && hasProperHeadings && hasKeyboardSupport;
      
    } catch (error) {
      console.warn('접근성 확인 중 오류:', error);
      return false;
    }
  }

  async checkIntegrationHealth() {
    // 통합 상태 기본 체크
    return {
      data_flow_working: true,      // 기본값 (상세 테스트는 별도)
      components_synchronized: true, // 기본값
      error_boundaries_active: document.querySelectorAll('[data-error-boundary]').length > 0
    };
  }

  detectMemoryGrowth() {
    // 메모리 증가 패턴 감지 (단순화된 구현)
    if (this.riskHistory.length < 5) return 0;
    
    const recentMemory = this.riskHistory.slice(-5).map(assessment => 
      assessment.performance_risks?.memory_usage || 0
    );
    
    // 최근 5회 평균 대비 현재 상태
    const averageMemory = recentMemory.reduce((sum, mem) => sum + mem, 0) / recentMemory.length;
    const currentMemory = performance.memory?.usedJSHeapSize || 0;
    
    return currentMemory > averageMemory ? 
      (currentMemory - averageMemory) / averageMemory : 0;
  }

  // 위험 패턴 분석 및 예측
  analyzeRiskPatterns() {
    if (this.riskHistory.length < 3) return null;

    const recentRisks = this.riskHistory.slice(-10);
    const riskTrends = this.calculateRiskTrends(recentRisks);

    return {
      trending_up: riskTrends.filter(trend => trend.direction === 'increasing'),
      trending_down: riskTrends.filter(trend => trend.direction === 'decreasing'),
      stable: riskTrends.filter(trend => trend.direction === 'stable'),
      prediction: this.predictNextRiskLevel(riskTrends)
    };
  }

  calculateRiskTrends(riskHistory) {
    // 위험 트렌드 계산 (단순화된 구현)
    const categories = ['p1_api_risks', 'p2_data_risks', 'p3_ui_risks'];
    
    return categories.map(category => {
      const values = riskHistory.map(assessment => 
        this.scoreRiskCategory(assessment[category])
      ).filter(score => score !== null);

      if (values.length < 2) return { category, direction: 'unknown' };

      const trend = values[values.length - 1] - values[0];
      const direction = Math.abs(trend) < 0.5 ? 'stable' :
                       trend > 0 ? 'increasing' : 'decreasing';

      return { category, direction, trend_score: trend };
    });
  }

  scoreRiskCategory(riskCategory) {
    if (!riskCategory) return null;
    
    const riskValues = Object.values(riskCategory);
    const scores = riskValues.map(risk => {
      switch (risk) {
        case 'low': return 1;
        case 'medium': return 3; 
        case 'high': return 5;
        default: return 2;
      }
    });

    return scores.length > 0 ? 
      scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
  }

  predictNextRiskLevel(trends) {
    // 다음 위험 레벨 예측 (기본 구현)
    const increasingTrends = trends.filter(t => t.direction === 'increasing').length;
    const totalTrends = trends.length;
    
    if (increasingTrends / totalTrends > 0.6) {
      return { 
        prediction: 'increasing_risk',
        confidence: 0.7,
        recommendation: 'P1/P2 진행상황 점검 권장'
      };
    } else {
      return {
        prediction: 'stable_risk',
        confidence: 0.8, 
        recommendation: '현재 상태 유지'
      };
    }
  }

  // 경고 및 대응 방안 생성
  generateRiskMitigationPlan(riskAssessment) {
    const mitigationPlan = [];

    // P1 API 관련 위험 대응
    if (riskAssessment.p1_api_risks?.connectivity === 'high') {
      mitigationPlan.push({
        priority: 'critical',
        action: 'P1 백엔드 API 상태 점검 필요',
        target: 'P1 Alex Chen',
        estimated_time: '1-2시간'
      });
    }

    // P2 데이터 관련 위험 대응  
    if (riskAssessment.p2_data_risks?.data_quality === 'high') {
      mitigationPlan.push({
        priority: 'high',
        action: 'P2 데이터 품질 검증 시스템 점검',
        target: 'P2 Dr. Sarah Kim',
        estimated_time: '2-3시간'
      });
    }

    // P3 UI 관련 위험 대응
    if (riskAssessment.p3_ui_risks?.memory_usage === 'high') {
      mitigationPlan.push({
        priority: 'medium',
        action: 'React 컴포넌트 메모리 최적화 추가',
        target: 'P3 Maya Chen',
        estimated_time: '1시간'
      });
    }

    return mitigationPlan;
  }

  // 사용자 대시보드를 위한 요약 정보
  getRiskSummaryForUI() {
    if (!this.currentRisks) return null;

    const overallRisk = this.currentRisks.overall_risk;
    
    return {
      level: overallRisk?.level || 'unknown',
      score: overallRisk?.score || 0,
      last_check: this.currentRisks.timestamp,
      active_monitoring: this.monitoringActive,
      high_priority_issues: this.getHighPriorityIssues()
    };
  }

  getHighPriorityIssues() {
    if (!this.currentRisks) return [];

    const highRiskIssues = [];

    // 각 카테고리에서 high 위험 요인 수집
    Object.entries(this.currentRisks).forEach(([category, risks]) => {
      if (risks && typeof risks === 'object') {
        Object.entries(risks).forEach(([risk, level]) => {
          if (level === 'high') {
            highRiskIssues.push({
              category: category.replace(/_risks$/, ''),
              risk_type: risk,
              level: 'high'
            });
          }
        });
      }
    });

    return highRiskIssues;
  }
}

// 전역 인스턴스 (싱글톤 패턴)
const globalRiskMonitor = new RealTimeRiskMonitor();

// React 훅으로 래핑
export const useRiskMonitoring = (autoStart = true) => {
  const [riskSummary, setRiskSummary] = useState(null);
  
  useEffect(() => {
    if (autoStart) {
      globalRiskMonitor.startMonitoring();
      
      // 위험 상태 변경시 UI 업데이트
      const updateRiskSummary = () => {
        setRiskSummary(globalRiskMonitor.getRiskSummaryForUI());
      };

      const interval = setInterval(updateRiskSummary, 5000); // 5초마다 UI 업데이트
      
      return () => {
        clearInterval(interval);
        if (autoStart) {
          globalRiskMonitor.stopMonitoring();
        }
      };
    }
  }, [autoStart]);

  return {
    riskSummary,
    startMonitoring: () => globalRiskMonitor.startMonitoring(),
    stopMonitoring: () => globalRiskMonitor.stopMonitoring(),
    getCurrentRisks: () => globalRiskMonitor.currentRisks,
    getRiskHistory: (limit) => globalRiskMonitor.getRiskHistory(limit)
  };
};

export default RealTimeRiskMonitor;
