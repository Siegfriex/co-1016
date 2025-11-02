import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const AdvancedMarkdownRenderer = ({ 
  content, 
  theme = 'professional',
  enableCharts = true,
  enablePrint = false,
  reportType = 'comprehensive' 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // 마크다운에서 차트 데이터 추출 및 렌더링
  const processedContent = useMemo(() => {
    if (!content || !enableCharts) return content;

    // 차트 패턴 감지 및 교체
    return content
      .replace(/```chart:bar\n([\s\S]*?)```/g, (match, chartData) => {
        try {
          const data = JSON.parse(chartData);
          return `<div class="embedded-chart" data-type="bar" data-content='${JSON.stringify(data)}'></div>`;
        } catch (e) {
          return match; // 파싱 실패 시 원본 유지
        }
      })
      .replace(/```chart:radar\n([\s\S]*?)```/g, (match, chartData) => {
        try {
          const data = JSON.parse(chartData);
          return `<div class="embedded-chart" data-type="radar" data-content='${JSON.stringify(data)}'></div>`;
        } catch (e) {
          return match;
        }
      });
  }, [content, enableCharts]);

  // 커스텀 렌더러 컴포넌트들
  const renderers = {
    // 헤딩 렌더링 (앵커 링크 포함)
    h1: ({ children, ...props }) => (
      <h1 className={`markdown-h1 ${theme}`} {...props}>
        {children}
        <div className="heading-anchor" />
      </h1>
    ),
    
    h2: ({ children, ...props }) => (
      <h2 className={`markdown-h2 ${theme}`} {...props}>
        {children}
        <div className="heading-anchor" />
      </h2>
    ),
    
    h3: ({ children, ...props }) => (
      <h3 className={`markdown-h3 ${theme}`} {...props}>
        {children}
        <div className="heading-anchor" />
      </h3>
    ),

    // 코드 블록 렌더링 (Syntax Highlighting)
    code: ({ inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      
      if (!inline && match) {
        return (
          <div className="code-block-container">
            <div className="code-block-header">
              <span className="code-language">{match[1]}</span>
            </div>
            <SyntaxHighlighter
              style={oneLight}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: '0 0 8px 8px',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      return (
        <code className={`inline-code ${theme}`} {...props}>
          {children}
        </code>
      );
    },

    // 테이블 렌더링 (전문가용 스타일)
    table: ({ children, ...props }) => (
      <div className="table-wrapper">
        <table className={`markdown-table ${theme}`} {...props}>
          {children}
        </table>
      </div>
    ),

    // 블록쿼트 렌더링 (인사이트 박스 스타일)
    blockquote: ({ children, ...props }) => (
      <div className={`insight-blockquote ${theme}`} {...props}>
        <div className="blockquote-icon">💡</div>
        <div className="blockquote-content">
          {children}
        </div>
      </div>
    ),

    // 리스트 렌더링 (체크박스 지원)
    li: ({ children, ...props }) => {
      const content = String(children);
      if (content.startsWith('[ ]') || content.startsWith('[x]')) {
        const checked = content.startsWith('[x]');
        const text = content.slice(3).trim();
        
        return (
          <li className={`checkbox-item ${checked ? 'checked' : ''}`} {...props}>
            <input 
              type="checkbox" 
              checked={checked} 
              readOnly 
              className="checkbox-input"
            />
            <span className="checkbox-text">{text}</span>
          </li>
        );
      }
      
      return <li className="standard-list-item" {...props}>{children}</li>;
    },

    // 링크 렌더링 (외부 링크 표시)
    a: ({ href, children, ...props }) => (
      <a 
        href={href}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={`markdown-link ${theme}`}
        {...props}
      >
        {children}
        {href?.startsWith('http') && <span className="external-link-icon">🔗</span>}
      </a>
    ),

    // 이미지 렌더링 (캡션 지원)
    img: ({ src, alt, title, ...props }) => (
      <figure className={`markdown-image-figure ${theme}`}>
        <img 
          src={src} 
          alt={alt} 
          className="markdown-image"
          loading="lazy"
          {...props} 
        />
        {(alt || title) && (
          <figcaption className="image-caption">
            {title || alt}
          </figcaption>
        )}
      </figure>
    ),

    // HTML 요소 처리 (차트 임베딩)
    div: ({ className, ...props }) => {
      if (className === 'embedded-chart') {
        return <EmbeddedChart {...props} theme={theme} />;
      }
      return <div className={className} {...props} />;
    }
  };

  // PDF 내보내기 핸들러
  const handleExport = async (format = 'pdf') => {
    setIsExporting(true);
    
    try {
      if (format === 'pdf') {
        // jsPDF 사용한 PDF 생성
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;
        
        const element = document.querySelector('.markdown-container');
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`curator-report-${Date.now()}.pdf`);
      }
    } catch (error) {
      console.error('Export 실패:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`markdown-container ${theme} report-${reportType}`}>
      {/* 보고서 헤더 */}
      <div className="report-header">
        <div className="report-meta">
          <span className="report-type-badge">{reportType}</span>
          <span className="report-generated">
            Generated {new Date().toLocaleString('ko-KR')}
          </span>
        </div>
        
        {enablePrint && (
          <div className="export-controls">
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="export-button pdf"
            >
              {isExporting ? '📄 Exporting...' : '📄 Export PDF'}
            </button>
            <button
              onClick={() => window.print()}
              className="export-button print"
            >
              🖨️ Print
            </button>
          </div>
        )}
      </div>

      {/* 메인 마크다운 렌더링 */}
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={renderers}
        >
          {processedContent}
        </ReactMarkdown>
      </div>

      {/* 보고서 푸터 */}
      <div className="report-footer">
        <div className="curator-branding">
          <span>🎨 CuratorOdyssey</span>
          <span>AI-Powered Art Market Analysis</span>
        </div>
        <div className="disclaimer">
          <small>
            이 보고서는 AI 분석을 기반으로 생성되었습니다. 
            투자 결정 시 추가적인 전문가 상담을 권장합니다.
          </small>
        </div>
      </div>
    </div>
  );
};

// 임베디드 차트 컴포넌트
const EmbeddedChart = ({ 'data-type': type, 'data-content': content, theme }) => {
  const chartData = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch (e) {
      return null;
    }
  }, [content]);

  if (!chartData) return null;

  const chartStyle = {
    width: '100%',
    height: 300,
    margin: '20px 0'
  };

  switch (type) {
    case 'bar':
      return (
        <div className="embedded-chart-container">
          <ResponsiveContainer {...chartStyle}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="var(--dyss-color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
      
    case 'radar':
      return (
        <div className="embedded-chart-container">
          <ResponsiveContainer {...chartStyle}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" />
              <PolarRadiusAxis />
              <Radar
                name="Score"
                dataKey="value"
                stroke="var(--dyss-color-primary)"
                fill="var(--dyss-color-primary)"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
      
    default:
      return null;
  }
};

export default AdvancedMarkdownRenderer;
