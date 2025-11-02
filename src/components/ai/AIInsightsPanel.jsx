import React, { useState, useEffect, useCallback } from 'react';
import aiService from '../../services/aiService';
import aiCache from '../../utils/ai/aiCache';

const AIInsightsPanel = ({ artistData, phase = 1, className = '' }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // AI 분석 실행
  const generateInsights = useCallback(async (forceRefresh = false) => {
    if (!artistData || !artistData.name) {
      setError('분석할 아티스트 데이터가 없습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 캐시 확인 (forceRefresh가 false인 경우)
      if (!forceRefresh) {
        const cacheKey = aiCache.generateCacheKey(artistData, phase);
        const cachedResult = aiCache.get(cacheKey);
        
        if (cachedResult) {
          console.log('🗄️ 캐시된 AI 분석 결과 사용');
          setInsights(cachedResult);
          setLoading(false);
          return;
        }
      }

      // AI 분석 실행
      console.log('🤖 새로운 AI 분석 시작:', artistData.name);
      const result = await aiService.generatePhase1Insights(artistData);

      if (result.success) {
        setInsights(result);
        
        // 캐시에 저장 (폴백이 아닌 경우)
        if (!result.fallbackUsed) {
          const cacheKey = aiCache.generateCacheKey(artistData, phase);
          aiCache.set(cacheKey, result);
        }
      } else {
        throw new Error(result.error || 'AI 분석을 완료할 수 없습니다.');
      }

    } catch (err) {
      console.error('AI 분석 오류:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [artistData, phase]);

  // 컴포넌트 마운트 시 자동 분석 실행
  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  // API 연결 상태 확인
  useEffect(() => {
    const checkConnection = async () => {
      const status = await aiService.checkConnection();
      setConnectionStatus(status);
    };
    checkConnection();
  }, []);

  // 에러 메시지 처리
  const getErrorMessage = (error) => {
    if (error.message?.includes('quota')) {
      return '일일 AI 분석 한도에 도달했습니다. 내일 다시 시도해주세요.';
    } else if (error.message?.includes('network')) {
      return '네트워크 연결을 확인하고 다시 시도해주세요.';
    } else if (error.message?.includes('timeout')) {
      return 'AI 분석 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
    }
    return 'AI 분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    generateInsights(true); // 캐시 무시하고 새로 분석
  };

  // 렌더링 조건부 처리
  if (loading) {
    return (
      <div className={`curator-chart-container ${className}`}>
        <div className="curator-chart-title">
          🤖 AI 분석 인사이트
        </div>
        <div className="curator-loading">
          <div className="curator-spinner"></div>
          <div className="curator-loading-text">
            AI가 {artistData?.name || '작가'}의 데이터를 분석하고 있습니다...
          </div>
          <div className="ai-loading-details">
            <p>• 5축 레이더 데이터 해석 중</p>
            <p>• 4축 선버스트 근거 분석 중</p>
            <p>• 시장 포지셔닝 평가 중</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !insights) {
    return (
      <div className={`curator-chart-container ${className}`}>
        <div className="curator-chart-title">
          🤖 AI 분석 인사이트
        </div>
        <div className="curator-error">
          <div className="curator-error-icon">🤖❌</div>
          <h3 className="curator-error-title">AI 분석 오류</h3>
          <p className="curator-error-message">{error}</p>
          <button 
            className="ai-retry-button"
            onClick={handleRefresh}
          >
            🔄 다시 시도
          </button>
        </div>
        {!connectionStatus?.connected && (
          <div className="ai-connection-warning">
            ⚠️ API 연결 상태: {connectionStatus?.reason || '확인 중...'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`curator-chart-container ai-insights-panel ${className}`}>
      {/* 헤더 */}
      <div className="ai-insights-header">
        <div className="curator-chart-title">
          🤖 AI 분석 인사이트
        </div>
        <div className="ai-insights-controls">
          <button
            className="ai-refresh-button"
            onClick={handleRefresh}
            disabled={loading}
            title="새로운 분석 생성"
          >
            🔄
          </button>
          <div className="ai-model-badge">
            {insights?.model === 'fallback' ? '📊 통계분석' : 
             insights?.model === 'gpt-4' ? '🧠 GPT-4' : 
             insights?.model === 'claude-3' ? '🎭 Claude-3' : '🤖 AI'}
          </div>
        </div>
      </div>

      {/* 분석 결과 */}
      <div className="ai-insights-content">
        {insights?.insights ? (
          <div className="ai-insights-text">
            {formatInsights(insights.insights)}
          </div>
        ) : (
          <div className="ai-insights-placeholder">
            분석 결과를 불러오는 중입니다...
          </div>
        )}
      </div>

      {/* 메타 정보 */}
      <div className="ai-insights-footer">
        <div className="ai-insights-meta">
          <span className="ai-timestamp">
            📅 {insights?.timestamp ? new Date(insights.timestamp).toLocaleString('ko-KR') : ''}
          </span>
          {insights?.fallbackUsed && (
            <span className="ai-fallback-badge">
              🔄 통계 기반 분석
            </span>
          )}
          {insights?.statistics && (
            <span className="ai-stats-badge" title={`평균: ${insights.statistics.average}, 분산: ${insights.statistics.variance}`}>
              📈 데이터 통계
            </span>
          )}
        </div>
        
        {error && (
          <div className="ai-error-notice">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
};

// 인사이트 텍스트 포맷팅 (마크다운 스타일)
const formatInsights = (insightsText) => {
  if (!insightsText) return null;

  // 간단한 마크다운 파싱
  const lines = insightsText.split('\n');
  
  return lines.map((line, index) => {
    // 헤딩 처리
    if (line.startsWith('###')) {
      return <h4 key={index} className="ai-insight-heading-3">{line.replace('###', '').trim()}</h4>;
    } else if (line.startsWith('##')) {
      return <h3 key={index} className="ai-insight-heading-2">{line.replace('##', '').trim()}</h3>;
    } else if (line.startsWith('#')) {
      return <h2 key={index} className="ai-insight-heading-1">{line.replace('#', '').trim()}</h2>;
    }
    
    // 빈 줄 처리
    if (line.trim() === '') {
      return <br key={index} />;
    }
    
    // 일반 텍스트 (굵은 글씨 처리)
    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return (
      <p 
        key={index} 
        className="ai-insight-paragraph"
        dangerouslySetInnerHTML={{ __html: formattedLine }}
      />
    );
  });
};

export default AIInsightsPanel;
