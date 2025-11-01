import React, { useState } from 'react';
import aiService from '../../services/aiService';
import AdvancedMarkdownRenderer from './AdvancedMarkdownRenderer';

const ReportTypeSelector = ({ artistData, onReportGenerated }) => {
  const [selectedType, setSelectedType] = useState('executive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const reportTypes = [
    {
      id: 'executive',
      title: '📊 Executive Summary',
      duration: '5분 읽기',
      description: '핵심 인사이트와 주요 지표를 간결하게 정리한 경영진 보고서',
      features: [
        '핵심 성과 지표 요약',
        '시장 포지셔닝 분석', 
        '주요 리스크 및 기회 요인',
        '전략적 권고사항'
      ],
      icon: '📈',
      color: 'var(--dyss-color-primary)'
    },
    {
      id: 'technical',
      title: '🔬 Technical Deep-dive',
      duration: '30분 읽기',
      description: '데이터 분석 방법론과 상세한 통계 해석이 포함된 기술 보고서',
      features: [
        '상세 데이터 분석 과정',
        '통계적 유의성 검증',
        '비교 분석 및 벤치마킹',
        '방법론 및 한계점 설명',
        '원시 데이터 테이블 포함'
      ],
      icon: '🔬',
      color: 'var(--dyss-color-gray-700)'
    },
    {
      id: 'investment',
      title: '💰 Investment Briefing',
      duration: '10분 읽기',
      description: '투자 관점에서의 작가 가치 평가 및 시장 전망 브리핑',
      features: [
        '투자 가치 평가',
        '시장 성장 잠재력 분석',
        '리스크-수익률 매트릭스',
        '포트폴리오 권장사항',
        '타이밍 전략 제시'
      ],
      icon: '💎',
      color: '#059669'
    }
  ];

  const handleTypeSelection = (typeId) => {
    setSelectedType(typeId);
    setGeneratedReport(null); // 새로운 타입 선택 시 기존 보고서 초기화
  };

  const generateReport = async () => {
    if (!artistData || !selectedType) return;

    setIsGenerating(true);
    
    try {
      const selectedReportConfig = reportTypes.find(type => type.id === selectedType);
      
      // 보고서 타입에 따른 커스텀 프롬프트 생성
      const customPrompt = buildCustomPrompt(artistData, selectedReportConfig);
      
      let result;
      
      if (selectedType === 'technical') {
        // 기술 보고서는 종합 분석 사용
        result = await aiService.generateComprehensiveReport(artistData);
      } else {
        // Executive, Investment 보고서는 커스텀 프롬프트 사용
        result = await aiService.callOpenAI ? 
          { 
            success: true, 
            report: await aiService.callOpenAI(customPrompt),
            model: 'gpt-4-custom'
          } : 
          await aiService.generatePhase1Insights(artistData);\n      }\n\n      if (result.success) {\n        const reportData = {\n          type: selectedType,\n          content: result.report || result.insights,\n          model: result.model,\n          timestamp: result.timestamp || new Date().toISOString(),\n          artist: artistData.name\n        };\n        \n        setGeneratedReport(reportData);\n        \n        if (onReportGenerated) {\n          onReportGenerated(reportData);\n        }\n      } else {\n        throw new Error('보고서 생성에 실패했습니다.');\n      }\n      \n    } catch (error) {\n      console.error('보고서 생성 오류:', error);\n      \n      // 폴백 보고서 생성\n      const fallbackReport = generateFallbackReport(artistData, selectedType);\n      setGeneratedReport(fallbackReport);\n    } finally {\n      setIsGenerating(false);\n    }\n  };\n\n  const buildCustomPrompt = (artistData, reportConfig) => {\n    const baseData = `**작가**: ${artistData.name}\n**5축 데이터**: I${artistData.radar5.I} F${artistData.radar5.F} A${artistData.radar5.A} M${artistData.radar5.M} S${artistData.radar5.Sedu}\n**4축 기반**: 제도${artistData.sunburst_l1.제도} 학술${artistData.sunburst_l1.학술} 담론${artistData.sunburst_l1.담론} 네트워크${artistData.sunburst_l1.네트워크}`;\n\n    switch (reportConfig.id) {\n      case 'executive':\n        return `CuratorOdyssey Executive Summary 생성:\n\n${baseData}\n\n**요구사항**:\n- 경영진 대상 5분 내 읽기 가능한 요약\n- 핵심 성과 지표 3-4개 선별 제시\n- 시장 내 포지셔닝 명확한 평가\n- 주요 리스크 및 기회 요인 식별\n- 실행 가능한 전략적 권고 3개 제시\n- 총 800-1000자, 구조화된 마크다운\n\n마크다운 형식으로 작성:`;\n        \n      case 'investment':\n        return `CuratorOdyssey Investment Briefing 생성:\n\n${baseData}\n\n**요구사항**:\n- 투자자 관점의 가치 평가 중심\n- ROI 잠재력 및 성장성 분석\n- 시장 리스크 vs 수익률 매트릭스\n- 포트폴리오 내 포지션 권장\n- 투자 타이밍 및 전략 제시\n- 경쟁 작가 대비 우위 요소 강조\n- 총 1000-1200자, 투자 용어 활용\n\n마크다운 형식으로 작성:`;\n        \n      default:\n        return `CuratorOdyssey ${reportConfig.title} 생성:\n\n${baseData}\n\n전문적인 분석 보고서를 마크다운 형식으로 작성해주세요.`;\n    }\n  };\n\n  const generateFallbackReport = (artistData, reportType) => {\n    const avgScore = Object.values(artistData.radar5).reduce((a, b) => a + b, 0) / 5;\n    \n    const reportContent = `# ${reportTypes.find(t => t.id === reportType)?.title} - ${artistData.name}\n\n## Executive Summary\n\n현재 평균 점수 ${avgScore.toFixed(1)}점으로 ${avgScore >= 85 ? '글로벌 톱티어' : avgScore >= 70 ? '아시아 주요 작가' : '신진 유망 작가'} 수준의 성과를 보이고 있습니다.\n\n## 주요 지표\n\n- **최고 성과 영역**: ${Object.entries(artistData.radar5).sort((a,b) => b[1]-a[1])[0][0] === 'I' ? '기관전시' : '특정 영역'} (${Math.max(...Object.values(artistData.radar5))}점)\n- **개선 영역**: ${Object.entries(artistData.radar5).sort((a,b) => a[1]-b[1])[0][0] === 'Sedu' ? '교육' : '특정 영역'} (${Math.min(...Object.values(artistData.radar5))}점)\n- **종합 균형도**: ${Math.max(...Object.values(artistData.radar5)) - Math.min(...Object.values(artistData.radar5)) > 50 ? '전문화형' : '균형형'}\n\n## ${reportType === 'investment' ? '투자 권고' : '전략적 제언'}\n\n${reportType === 'investment' ? \n  '중장기 성장 잠재력이 높은 포지션으로 평가되며, 리스크 대비 수익률이 양호한 투자 대상입니다.' : \n  '현재 강점 영역을 중심으로 한 집중 전략과 약점 영역의 단계적 보완을 권장합니다.'}\n\n---\n*생성 시각: ${new Date().toLocaleString('ko-KR')} | 분석 모델: 통계 기반*`;\n\n    return {\n      type: reportType,\n      content: reportContent,\n      model: 'fallback',\n      timestamp: new Date().toISOString(),\n      artist: artistData.name,\n      fallback: true\n    };\n  };\n\n  if (generatedReport) {\n    return (\n      <div className=\"generated-report-container\">\n        <div className=\"report-nav\">\n          <button \n            onClick={() => setGeneratedReport(null)}\n            className=\"back-to-selector-button\"\n          >\n            ← 다른 보고서 생성\n          </button>\n          <div className=\"report-nav-info\">\n            <span className=\"current-report-type\">\n              {reportTypes.find(t => t.id === generatedReport.type)?.title}\n            </span>\n            <span className=\"report-model\">\n              Model: {generatedReport.model}\n            </span>\n          </div>\n        </div>\n        \n        <AdvancedMarkdownRenderer \n          content={generatedReport.content}\n          theme=\"professional\"\n          enableCharts={true}\n          enablePrint={true}\n          reportType={generatedReport.type}\n        />\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"report-type-selector\">\n      <div className=\"report-selector-header\">\n        <h2 className=\"report-selector-title\">\n          📊 AI 보고서 생성\n        </h2>\n        <p className=\"report-selector-subtitle\">\n          {artistData?.name}에 대한 전문적인 분석 보고서를 선택하세요\n        </p>\n      </div>\n\n      <div className=\"report-options\">\n        {reportTypes.map(type => (\n          <div \n            key={type.id}\n            className={`report-option ${selectedType === type.id ? 'selected' : ''}`}\n            onClick={() => handleTypeSelection(type.id)}\n            style={{\n              '--option-color': type.color\n            }}\n          >\n            <div className=\"report-option-header\">\n              <div className=\"report-option-title\">\n                <span>{type.icon}</span>\n                {type.title}\n              </div>\n              <span className=\"report-option-duration\">\n                {type.duration}\n              </span>\n            </div>\n            \n            <p className=\"report-option-description\">\n              {type.description}\n            </p>\n            \n            <ul className=\"report-option-features\">\n              {type.features.map((feature, index) => (\n                <li key={index}>{feature}</li>\n              ))}\n            </ul>\n          </div>\n        ))}\n      </div>\n\n      <div className=\"report-generation-controls\">\n        <button\n          onClick={generateReport}\n          disabled={isGenerating || !selectedType}\n          className=\"generate-report-button\"\n        >\n          {isGenerating ? (\n            <>\n              <div className=\"curator-spinner\" style={{width: '16px', height: '16px'}}></div>\n              보고서 생성 중...\n            </>\n          ) : (\n            <>\n              🚀 보고서 생성\n            </>\n          )}\n        </button>\n        \n        <button\n          onClick={() => setShowPreview(!showPreview)}\n          className=\"preview-button\"\n        >\n          👁️ 미리보기\n        </button>\n      </div>\n\n      {showPreview && (\n        <div className=\"preview-section\">\n          <h3>🔍 {reportTypes.find(t => t.id === selectedType)?.title} 미리보기</h3>\n          <div className=\"preview-content\">\n            <p>이 보고서는 다음과 같은 섹션으로 구성됩니다:</p>\n            <ul>\n              {reportTypes.find(t => t.id === selectedType)?.features.map((feature, index) => (\n                <li key={index}>{feature}</li>\n              ))}\n            </ul>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n};\n\nexport default ReportTypeSelector;
