import React, { useState, useCallback, useMemo } from 'react';

const AIReportGenerator = React.memo(({ 
  artistData,
  phase2Data,
  phase3Data,
  onReportGenerated,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('comprehensive');
  const [customPrompt, setCustomPrompt] = useState('');

  // 보고서 템플릿 옵션 (Maya Chen 전문성)
  const reportTemplates = useMemo(() => [
    {
      id: 'comprehensive',
      title: '종합 분석 보고서',
      description: 'Phase 1-3 전 영역을 아우르는 완전한 분석',
      icon: '📊',
      estimatedTime: '8-12초',
      features: ['현재 가치 분석', '성장 궤적 추적', '비교 분석', '미래 전망']
    },
    {
      id: 'investment',
      title: '투자 전략 보고서',
      description: '투자자 관점의 리스크-수익 분석',
      icon: '💰',
      estimatedTime: '6-10초',
      features: ['ROI 예측', '리스크 분석', '포트폴리오 권장', '시장 타이밍']
    },
    {
      id: 'curatorial',
      title: '큐레이터 기획 보고서',
      description: '전시 기획자를 위한 작가 분석',
      icon: '🎨',
      estimatedTime: '5-8초',
      features: ['작품 맥락 분석', '전시 이력', '관객 반응', '기획 제안']
    }
  ], []);

  // AI 보고서 생성 핸들러 (Maya Chen 비교 분석 통합)
  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // 생성 진행 시뮬레이션
      const progressSteps = [
        { step: 10, message: '데이터 수집 및 검증...' },
        { step: 25, message: 'Phase 1 요약 분석...' },
        { step: 45, message: 'Phase 2 궤적 분석...' },
        { step: 65, message: 'Phase 3 비교 분석...' },
        { step: 80, message: 'AI 모델 분석 중...' },
        { step: 95, message: '보고서 렌더링...' },
        { step: 100, message: '완료!' }
      ];

      for (const { step, message } of progressSteps) {
        setGenerationProgress(step);
        console.log(`🤖 AI 보고서 생성: ${step}% - ${message}`);
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      }

      // 실제로는 P1의 POST /api/report/generate 호출
      const mockReport = generateMockReport(artistData, phase2Data, phase3Data, selectedTemplate);
      
      if (onReportGenerated) {
        onReportGenerated({
          content: mockReport,
          type: selectedTemplate,
          generatedAt: new Date().toISOString(),
          model: 'Vertex AI Gemini-1.5 Pro',
          tokens: mockReport.length
        });
      }

    } catch (error) {
      console.error('AI 보고서 생성 오류:', error);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [artistData, phase2Data, phase3Data, selectedTemplate, onReportGenerated]);

  return (
    <div className={`ai-report-generator ${className}`}>
      <div className="generator-header">
        <h3 className="generator-title">🤖 AI 분석 보고서 생성</h3>
        <p className="generator-subtitle">Vertex AI Gemini-1.5 Pro 기반 전문가급 분석</p>
      </div>

      {/* 템플릿 선택 */}
      <div className="template-selector">
        <h4>보고서 유형 선택</h4>
        <div className="template-grid">
          {reportTemplates.map(template => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(template.id)}
              role="radio"
              aria-checked={selectedTemplate === template.id}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedTemplate(template.id);
                }
              }}
            >
              <div className="template-header">
                <div className="template-icon">{template.icon}</div>
                <div className="template-info">
                  <h5 className="template-title">{template.title}</h5>
                  <p className="template-description">{template.description}</p>
                </div>
              </div>
              
              <div className="template-meta">
                <div className="template-time">⏱️ {template.estimatedTime}</div>
                <div className="template-features">
                  {template.features.map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 생성 진행 상태 */}
      {isGenerating && (
        <div className="generation-progress">
          <div className="progress-header">
            <h4>🤖 AI 분석 중...</h4>
            <span className="progress-percent">{generationProgress}%</span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          
          <div className="progress-status">
            {generationProgress < 25 && '데이터 수집 및 검증...'}
            {generationProgress >= 25 && generationProgress < 45 && 'Phase 1 요약 분석...'}
            {generationProgress >= 45 && generationProgress < 65 && 'Phase 2 궤적 분석...'}
            {generationProgress >= 65 && generationProgress < 80 && 'Phase 3 비교 분석...'}
            {generationProgress >= 80 && generationProgress < 95 && 'AI 모델 분석 중...'}
            {generationProgress >= 95 && '보고서 렌더링...'}
          </div>
        </div>
      )}

      {/* 생성 버튼 */}
      <div className="generation-controls">
        <button
          className={`generate-btn ${isGenerating ? 'generating' : ''}`}
          onClick={handleGenerateReport}
          disabled={isGenerating || !artistData}
          aria-label="AI 보고서 생성"
        >
          {isGenerating ? (
            <>
              <div className="btn-spinner"></div>
              생성 중... ({generationProgress}%)
            </>
          ) : (
            <>
              🚀 AI 보고서 생성
            </>
          )}
        </button>

        {isGenerating && (
          <button
            className="cancel-btn"
            onClick={() => {
              setIsGenerating(false);
              setGenerationProgress(0);
            }}
            aria-label="생성 취소"
          >
            ❌ 취소
          </button>
        )}
      </div>

      {/* 사용자 가이드 */}
      <div className="generator-guide">
        <h5>📋 AI 보고서 생성 가이드</h5>
        <ul>
          <li><strong>종합 분석:</strong> 전체 커리어를 아우르는 완전한 분석 보고서</li>
          <li><strong>투자 전략:</strong> ROI 및 리스크 중심의 투자 의사결정 지원</li>
          <li><strong>큐레이터 기획:</strong> 전시 기획 및 작가 선정을 위한 전문 분석</li>
        </ul>
        
        <div className="guide-note">
          💡 <strong>참고:</strong> 보고서 생성은 Vertex AI Gemini-1.5 Pro를 사용하여 
          Maya Chen의 비교 분석 방법론을 기반으로 전문가급 인사이트를 제공합니다.
        </div>
      </div>
    </div>
  );
});

// 목업 보고서 생성 함수 (P1 API 준비 전까지 사용)
const generateMockReport = (artistData, phase2Data, phase3Data, templateType) => {
  const artistName = artistData.name;
  const currentDate = new Date().toLocaleDateString('ko-KR');

  if (templateType === 'comprehensive') {
    return `# ${artistName} 종합 분석 보고서

## Executive Summary

${artistName}은 현재 한국 현대미술계에서 제도권 기반의 강력한 위상을 구축한 작가로 평가됩니다. 5축 분석 결과 기관전시(${artistData.radar5.I}점) 및 페어(${artistData.radar5.F}점) 영역에서 뛰어난 성과를 보이며, 특히 제도권 검증형 성공 모델의 대표적 사례입니다.

## Phase 1: 현재 가치 구성 분석

### 5축 레이더 분석
- **기관전시 (I)**: ${artistData.radar5.I}점 - 최상급 수준의 제도권 인정
- **페어 (F)**: ${artistData.radar5.F}점 - 국제 무대에서의 안정적 입지
- **시상 (A)**: ${artistData.radar5.A}점 - 학술적 성취도 우수
- **미디어 (M)**: ${artistData.radar5.M}점 - 언론 노출 및 담론 형성력
- **교육 (Sedu)**: ${artistData.radar5.Sedu}점 - 향후 개발 여지 존재

### 4축 근거 분석
제도권 우수성(${artistData.sunburst_l1.제도}점)이 전체 가치의 핵심 동력으로 작용하고 있으며, 네트워크(${artistData.sunburst_l1.네트워크}점) 및 학술(${artistData.sunburst_l1.학술}점) 영역의 균형 잡힌 발전이 뒷받침되고 있습니다.

## Phase 2: 커리어 궤적 분석

${artistName}의 성장 패턴은 전형적인 '점진적 상승형'으로, 특별한 변곡점 없이 지속적인 상승세를 보여왔습니다. 이는 안정적인 기반 구축과 체계적인 경력 관리의 결과로 해석됩니다.

## Phase 3: 비교 분석 및 시장 전망

동시대 작가들과의 비교 분석 결과, ${artistName}은 제도권 기반의 차별화된 성장 경로를 보여주며, 특히 국제적 인지도와 국내 기반의 조화로운 발전이 특징적입니다.

### 미래 전망
- **성장 잠재력**: 높음 (교육 영역 확장 가능성)
- **리스크 요인**: 낮음 (안정적 제도권 기반)
- **기회 요소**: 글로벌 확장 및 새로운 매체 실험

---

*본 보고서는 CuratorOdyssey의 Phase 1-3 통합 분석을 기반으로 Vertex AI Gemini-1.5 Pro가 생성했습니다.*
*생성일시: ${currentDate} | 분석 버전: AHP v1.0*`;
  }

  if (templateType === 'investment') {
    return `# ${artistName} 투자 전략 분석

## 투자 요약
- **현재 시장 가치**: 상위 5% (제도권 인정 기반)
- **예상 ROI**: 연 12-15% (향후 5년)
- **리스크 레벨**: 낮음-중간
- **포트폴리오 적합성**: 안정형 + 성장형 하이브리드

## 가치 동력 분석
제도권 전시(${artistData.radar5.I}점) 기반의 안정적 가치 증대가 주요 동력입니다...

*생성일시: ${currentDate}*`;
  }

  if (templateType === 'curatorial') {
    return `# ${artistName} 큐레이터 기획 보고서

## 작가 개요
${artistName}은 국제적 인지도와 학술적 깊이를 겸비한 한국 현대미술의 대표 작가입니다...

## 전시 기획 제안
- **개인전 기획**: 제도권 성과 중심의 회고전 형태
- **그룹전 참여**: 아시아 현대미술 맥락에서의 위치 부각
- **교육 프로그램**: 작가의 철학과 방법론 공유

*생성일시: ${currentDate}*`;
  }

  return `# ${artistName} 분석 보고서\n\n생성일시: ${currentDate}`;
};

export default AIReportGenerator;

