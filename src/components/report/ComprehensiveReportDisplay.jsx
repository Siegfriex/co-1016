import React, { useState, useEffect } from 'react';
import AdvancedMarkdownRenderer from './AdvancedMarkdownRenderer';
import aiService from '../../services/aiService';

const ComprehensiveReportDisplay = ({ 
  artistData, 
  phase1Data, 
  phase2Data = null, 
  phase3Data = null,
  reportType = 'comprehensive' 
}) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisMetrics, setAnalysisMetrics] = useState(null);

  // 보고서 생성 실행
  const generateReport = async () => {
    if (!artistData) {
      setError('분석할 아티스트 데이터가 없습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📊 종합 보고서 생성 시작:', {
        artist: artistData.name,
        type: reportType,
        phases: {
          phase1: !!phase1Data,
          phase2: !!phase2Data, 
          phase3: !!phase3Data
        }
      });

      const analysisStartTime = Date.now();

      // 종합 분석 호출 (Vertex AI 백엔드 우선)
      const result = await aiService.generateComprehensiveReport(
        phase1Data || artistData,
        phase2Data,
        phase3Data
      );

      const analysisEndTime = Date.now();

      if (result.success) {
        setReport(result);
        
        // 분석 메트릭 계산
        setAnalysisMetrics({
          processing_time: analysisEndTime - analysisStartTime,
          model_used: result.model,
          phases_analyzed: result.phases_analyzed || 'basic',
          content_length: result.report?.length || 0,
          tokens_estimated: Math.ceil((result.report?.length || 0) / 4),
          fallback_used: result.fallback_used || false
        });

        console.log('✅ 종합 보고서 생성 완료:', {
          model: result.model,
          length: result.report?.length,
          time: analysisEndTime - analysisStartTime
        });

      } else {
        throw new Error(result.error || '보고서 생성에 실패했습니다.');
      }

    } catch (err) {
      console.error('종합 보고서 생성 실패:', err);
      
      // 최종 폴백: 통계 기반 간단한 보고서
      const fallbackReport = generateStatisticalReport(artistData, reportType);
      setReport(fallbackReport);
      
      setAnalysisMetrics({
        processing_time: Date.now() - Date.now(),
        model_used: 'statistical-fallback',
        phases_analyzed: 'fallback',
        content_length: fallbackReport.report.length,
        fallback_used: true,
        error_recovered: true
      });
      
      setError('AI 분석 오류 발생, 통계 기반 보고서로 대체되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 자동 생성
  useEffect(() => {
    generateReport();
  }, [artistData, reportType]); // eslint-disable-line react-hooks/exhaustive-deps

  // 통계 기반 폴백 보고서 생성
  const generateStatisticalReport = (data, type) => {
    const radar = data.radar5 || {};
    const sunburst = data.sunburst_l1 || {};
    
    const avgRadar = Object.values(radar).reduce((a, b) => a + b, 0) / Object.keys(radar).length;
    const avgSunburst = Object.values(sunburst).reduce((a, b) => a + b, 0) / Object.keys(sunburst).length;
    
    const reportContent = `# 📊 ${data.name} ${type.toUpperCase()} 분석 보고서

## Executive Summary

${data.name} 작가는 현재 평균 **${avgRadar.toFixed(1)}점**의 종합 성과를 달성하여 ${avgRadar >= 85 ? '글로벌 톱티어' : avgRadar >= 70 ? '아시아 주요 작가' : '성장 잠재력'} 그룹에 속합니다. 특히 **${Object.entries(radar).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A'}** 영역에서의 강세가 두드러집니다.

## 현재 가치 구성 분석

### 5축 레이더 분석
- **최고 성과**: ${Object.entries(radar).sort((a,b) => b[1]-a[1])[0]?.[1] || 0}점
- **개선 영역**: ${Object.entries(radar).sort((a,b) => a[1]-b[1])[0]?.[1] || 0}점
- **균형도**: ${Math.max(...Object.values(radar)) - Math.min(...Object.values(radar)) > 50 ? '전문화형' : '균형형'} 프로필

### 4축 기반 구조
4축 선버스트 분석에서는 **${Object.entries(sunburst).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A'}**(${Object.entries(sunburst).sort((a,b) => b[1]-a[1])[0]?.[1] || 0}점)이 가장 견고한 기반을 제공하고 있어, 이를 중심으로 한 전략적 접근이 효과적일 것으로 판단됩니다.

## 시장 포지셔닝

현재 수치를 바탕으로 ${type === 'investment' ? '투자 관점에서' : '종합적으로'} 평가할 때, ${avgRadar >= 80 ? '매우 안정적인' : avgRadar >= 65 ? '양호한' : '성장 가능성이 높은'} 포지션을 유지하고 있습니다.

${type === 'investment' ? `
## 투자 가치 평가

- **리스크 레벨**: ${avgRadar >= 80 ? 'LOW' : avgRadar >= 65 ? 'MEDIUM' : 'HIGH'}
- **성장 잠재력**: ${100 - avgRadar > 20 ? 'HIGH' : 100 - avgRadar > 10 ? 'MEDIUM' : 'MATURE'}
- **권장 포지션**: ${avgRadar >= 75 ? '핵심 보유' : avgRadar >= 60 ? '전략적 투자' : '장기 관찰'}
` : ''}

## 전략적 제언

### 단기 전략 (6-12개월)
${Object.values(radar).some(v => v < 50) ? '취약 영역 집중 보완을 통한 기초 체력 강화' : '강점 영역 심화 발전을 통한 경쟁 우위 확대'}

### 중기 전략 (1-3년)
글로벌 시장 진출 및 다각화된 포트폴리오 구축을 통한 종합적 성장 추진

---

*분석 기준: 통계 모델 기반 | 생성 시각: ${new Date().toLocaleString('ko-KR')}*`;

    return {
      success: true,
      report: reportContent,
      model: 'statistical-comprehensive',
      analysisType: type,
      phases_analyzed: 'statistical',
      timestamp: new Date().toISOString(),
      fallback_used: true
    };
  };

  // 보고서 재생성 핸들러
  const handleRegenerate = () => {
    generateReport();
  };

  // 보고서 내보내기 핸들러
  const handleExport = async (format) => {
    if (!report?.report) return;

    try {
      if (format === 'json') {
        const dataStr = JSON.stringify({
          report: report,
          metrics: analysisMetrics,
          exportedAt: new Date().toISOString()
        }, null, 2);
        
        const element = document.createElement('a');
        const file = new Blob([dataStr], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = `curator-report-${artistData.name}-${Date.now()}.json`;
        element.click();
      }
    } catch (error) {
      console.error('내보내기 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="comprehensive-report-container">
        <div className="report-loading">
          <div className="curator-spinner"></div>
          <div className="loading-details">
            <h3>🤖 AI가 종합 보고서를 생성하고 있습니다...</h3>
            <div className="loading-progress">
              <div className="progress-step active">📊 데이터 분석 중</div>
              <div className="progress-step">🔍 패턴 식별 중</div>
              <div className="progress-step">📝 보고서 작성 중</div>
              <div className="progress-step">✅ 완료</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="comprehensive-report-container">
        <div className="curator-error">
          <div className="curator-error-icon">🤖❌</div>
          <h3 className="curator-error-title">종합 보고서 생성 오류</h3>
          <p className="curator-error-message">{error}</p>
          <button onClick={handleRegenerate} className="ai-retry-button">
            🔄 다시 생성
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="comprehensive-report-container">
      {/* 보고서 컨트롤 */}
      <div className="report-controls">
        <div className="report-info">
          <h2 className="report-title">
            📊 {artistData.name} 종합 분석 보고서
          </h2>
          <div className="report-metadata">
            <span className="report-type">Type: {reportType.toUpperCase()}</span>
            <span className="report-model">Model: {report?.model || 'Unknown'}</span>
            {analysisMetrics && (
              <span className="report-timing">
                처리시간: {(analysisMetrics.processing_time / 1000).toFixed(1)}초
              </span>
            )}
          </div>
        </div>
        
        <div className="report-actions">
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="regenerate-button"
          >
            🔄 재생성
          </button>
          <button
            onClick={() => handleExport('json')}
            className="export-json-button"
          >
            📋 JSON 내보내기
          </button>
        </div>
      </div>

      {/* 메인 보고서 렌더링 */}
      {report && (
        <AdvancedMarkdownRenderer
          content={report.report}
          theme="professional"
          enableCharts={true}
          enablePrint={true}
          reportType={reportType}
        />
      )}

      {/* 분석 메트릭 표시 */}
      {analysisMetrics && (
        <div className="analysis-metrics">
          <h4>📈 분석 메트릭</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">처리 시간</span>
              <span className="metric-value">{(analysisMetrics.processing_time / 1000).toFixed(1)}초</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">분석 모델</span>
              <span className="metric-value">{analysisMetrics.model_used}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">분석 범위</span>
              <span className="metric-value">{analysisMetrics.phases_analyzed}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">토큰 사용</span>
              <span className="metric-value">~{analysisMetrics.tokens_estimated}개</span>
            </div>
            {analysisMetrics.fallback_used && (
              <div className="metric-item fallback">
                <span className="metric-label">폴백 사용</span>
                <span className="metric-value">✅ 자동 복구</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="error-notice">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default ComprehensiveReportDisplay;
