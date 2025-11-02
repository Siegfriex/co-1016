import React, { useState, useMemo, useCallback } from 'react';

const MarkdownReportDisplay = React.memo(({ 
  content = '', 
  title = 'AI 분석 보고서',
  generatedAt,
  onExport,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf'); // pdf, word, txt

  // Markdown 렌더링 (간단한 구현, 실제로는 react-markdown 사용 권장)
  const renderedContent = useMemo(() => {
    if (!content) return '';

    return content
      // 헤딩 처리
      .replace(/^### (.*$)/gm, '<h3 class="report-heading-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="report-heading-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="report-heading-1">$1</h1>')
      
      // 강조 처리
      .replace(/\*\*(.*?)\*\*/g, '<strong class="report-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="report-italic">$1</em>')
      
      // 목록 처리
      .replace(/^- (.*$)/gm, '<li class="report-list-item">$1</li>')
      
      // 줄바꿈 처리
      .replace(/\n/g, '<br>');
  }, [content]);

  // 내보내기 핸들러 (Maya Chen UI 전문성)
  const handleExport = useCallback(async (format) => {
    setIsExporting(true);
    try {
      console.log(`📄 ${format.toUpperCase()} 내보내기 시작:`, title);
      
      if (format === 'pdf') {
        // 실제로는 jsPDF 또는 서버사이드 PDF 생성
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
      
      if (onExport) {
        onExport(format, content);
      }
      
    } catch (error) {
      console.error('내보내기 오류:', error);
    } finally {
      setIsExporting(false);
    }
  }, [content, title, onExport]);

  // 접근성: 키보드 네비게이션
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (event.target.classList.contains('export-btn')) {
        handleExport(exportFormat);
      }
    }
  }, [exportFormat, handleExport]);

  return (
    <div className={`markdown-report-display ${className}`}>
      <div className="report-header">
        <div className="report-meta">
          <h3 className="report-title">{title}</h3>
          {generatedAt && (
            <p className="report-timestamp">
              생성일시: {new Date(generatedAt).toLocaleString('ko-KR')}
            </p>
          )}
        </div>

        {/* 내보내기 컨트롤 */}
        <div className="export-controls">
          <div className="export-format-selector">
            <label htmlFor="export-format">내보내기 형식:</label>
            <select
              id="export-format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="format-select"
            >
              <option value="pdf">📄 PDF</option>
              <option value="word">📝 Word</option>
              <option value="txt">📋 텍스트</option>
            </select>
          </div>

          <button
            className={`export-btn ${isExporting ? 'loading' : ''}`}
            onClick={() => handleExport(exportFormat)}
            onKeyDown={handleKeyDown}
            disabled={isExporting || !content}
            aria-label={`${exportFormat.toUpperCase()} 형식으로 내보내기`}
          >
            {isExporting ? (
              <>
                <div className="btn-spinner"></div>
                내보내는 중...
              </>
            ) : (
              `내보내기 (${exportFormat.toUpperCase()})`
            )}
          </button>
        </div>
      </div>

      {/* 보고서 내용 */}
      <div className="report-content-container">
        {content ? (
          <div 
            className="report-content"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
            role="document"
            aria-label="AI 생성 분석 보고서"
            tabIndex={0}
          />
        ) : (
          <div className="report-placeholder">
            <div className="placeholder-icon">📄</div>
            <h4>보고서를 생성해주세요</h4>
            <p>AI 보고서 생성 버튼을 클릭하여 종합 분석 보고서를 생성할 수 있습니다.</p>
          </div>
        )}
      </div>

      {/* 보고서 통계 */}
      {content && (
        <div className="report-stats">
          <div className="stat-item">
            <span className="stat-label">단어 수:</span>
            <span className="stat-value">{content.split(' ').length.toLocaleString('ko-KR')}개</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">문자 수:</span>
            <span className="stat-value">{content.length.toLocaleString('ko-KR')}자</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">예상 읽기 시간:</span>
            <span className="stat-value">{Math.ceil(content.split(' ').length / 200)}분</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default MarkdownReportDisplay;

