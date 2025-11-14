import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const StackedAreaChart = ({ 
  data, 
  events = [], 
  hoveredEvent, 
  onTimeHover,
  onEventHover,
  width = 800, 
  height = 400 
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [currentZoom, setCurrentZoom] = useState([0, 20]); // 기본 20년 범위

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // 차트 기본 설정 (VID v2.0 디자인 시스템 적용)
    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // VID v2.0 4축 색상 시스템 (Section 2.2.1 참조, 위에서 아래 순서)
    const axisColors = {
      '제도': 'rgba(242, 131, 23, 0.8)',      // 주 컬러
      '학술': 'rgba(232, 229, 216, 0.8)',     // 세컨더리 베리에이션
      '담론': 'rgba(245, 168, 90, 0.8)',      // 주 컬러 밝은 톤
      '네트워크': 'rgba(222, 221, 214, 0.8)'  // 세컨더리 어두운 톤
    };

    // 스트로크 색상 (경계선용, 투명도 제거)
    const axisStrokeColors = {
      '제도': 'rgb(242, 131, 23)',      // 주 컬러
      '학술': 'rgb(232, 229, 216)',     // 세컨더리 베리에이션
      '담론': 'rgb(245, 168, 90)',      // 주 컬러 밝은 톤
      '네트워크': 'rgb(222, 221, 214)'  // 세컨더리 어두운 톤
    };

    const axisOrder = ['네트워크', '담론', '학술', '제도']; // 안정성 순서 (변동성 오름차순)

    // 시계열 데이터 전처리 (시간적 분석 전문성)
    const processedData = data.bins.map(d => ({
      t: d.t,
      제도: d.institution || 0,
      학술: d.academic || 0, 
      담론: d.discourse || 0,
      네트워크: d.network || 0
    }));

    // D3 Stack Layout 적용 (누적 계산 최적화)
    const stack = d3.stack()
      .keys(axisOrder)
      .order(d3.stackOrderNone) // 고정된 순서 유지
      .offset(d3.stackOffsetNone);

    const stackedData = stack(processedData);

    // 스케일 정의 (시간적 도메인 전문 설정)
    const xScale = d3.scaleLinear()
      .domain(currentZoom)
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1]) * 1.1])
      .range([innerHeight, 0]);

    // Area 생성기 (부드러운 곡선 보간법 적용)
    const area = d3.area()
      .x(d => xScale(d.data.t))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveCatmullRom.alpha(0.5)); // 자연스러운 곡선

    // SVG 설정
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('font-family', 'var(--dyss-font-family-primary)');

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 툴팁 설정
    const tooltip = d3.select(tooltipRef.current);

    // 배경 그리드 (시간적 맥락 강화)
    const xAxis = d3.axisBottom(xScale)
      .tickSize(-innerHeight)
      .tickFormat(d => `+${d}년`); // 데뷔년 기준 상대 표시

    const yAxis = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(d => d.toFixed(0));

    g.append('g')
      .attr('class', 'grid-x')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .style('color', '#E5E7EB')
      .style('font-size', '12px');

    g.append('g')
      .attr('class', 'grid-y')
      .call(yAxis)
      .style('color', '#E5E7EB')
      .style('font-size', '12px');

    // 누적 영역 렌더링 (성능 최적화된 그라데이션)
    stackedData.forEach((layerData, i) => {
      const axisName = layerData.key;
      
      // 그라데이션 정의 (시각적 깊이감 강화)
      const gradientId = `gradient-${axisName}`;
      const gradient = svg.select('defs').empty() ? 
        svg.append('defs') : svg.select('defs');
        
      gradient.append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 0).attr('y2', innerHeight)
        .selectAll('stop')
        .data([
          { offset: '0%', color: axisColors[axisName], opacity: 0.8 },
          { offset: '100%', color: axisColors[axisName], opacity: 0.3 }
        ])
        .enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => {
          // rgba 값을 rgb로 변환 (그라데이션용)
          const rgbMatch = d.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (rgbMatch) {
            return `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
          }
          return d.color;
        })
        .attr('stop-opacity', d => d.opacity);

      // 영역 패스
      g.append('path')
        .datum(layerData)
        .attr('class', `area-${axisName}`)
        .attr('d', area)
        .style('fill', axisColors[axisName])
        .style('stroke', axisStrokeColors[axisName])
        .style('stroke-width', '2px')
        .style('stroke-opacity', 0.6);
    });

    // 이벤트 마커 렌더링 (커리어 분석 전문성)
    if (events && events.length > 0) {
      const eventGroup = g.append('g').attr('class', 'events');

      events.forEach((event, i) => {
        const eventX = xScale(event.t);
        
        if (eventX >= 0 && eventX <= innerWidth) {
          // 이벤트 수직선
          eventGroup.append('line')
            .attr('class', `event-line-${i}`)
            .attr('x1', eventX)
            .attr('x2', eventX)
            .attr('y1', 0)
            .attr('y2', innerHeight)
            .style('stroke', event.impact_level === 'high' ? '#DC2626' : '#F59E0B')
            .style('stroke-width', '2px')
            .style('stroke-dasharray', '4,4')
            .style('opacity', hoveredEvent === event.id ? 0.8 : 0.4)
            .style('cursor', 'pointer')
            .on('mouseover', () => onEventHover && onEventHover(event.id))
            .on('mouseout', () => onEventHover && onEventHover(null));

          // 이벤트 마커
          eventGroup.append('circle')
            .attr('class', `event-marker-${i}`)
            .attr('cx', eventX)
            .attr('cy', -10)
            .attr('r', hoveredEvent === event.id ? 8 : 6)
            .style('fill', event.impact_level === 'high' ? '#DC2626' : '#F59E0B')
            .style('stroke', '#FFFFFF')
            .style('stroke-width', '2px')
            .style('cursor', 'pointer')
            .on('mouseover', (e) => {
              if (onEventHover) onEventHover(event.id);
              
              tooltip.style('display', 'block')
                .html(formatEventTooltip(event));
            })
            .on('mousemove', (e) => {
              tooltip.style('left', `${e.pageX + 15}px`)
                .style('top', `${e.pageY + 15}px`);
            })
            .on('mouseout', () => {
              if (onEventHover) onEventHover(null);
              tooltip.style('display', 'none');
            });
        }
      });
    }

    // 인터랙티브 오버레이 (시점별 분석)
    const bisectDate = d3.bisector(d => d.t).left;
    
    const overlay = g.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const t = xScale.invert(mouseX);
        const index = bisectDate(processedData, t, 1);
        const d0 = processedData[index - 1];
        const d1 = processedData[index];
        
        if (!d0 || !d1) return;
        
        const closestData = t - d0.t > d1.t - t ? d1 : d0;
        
        if (onTimeHover) {
          onTimeHover({
            t: closestData.t,
            values: {
              제도: closestData.제도,
              학술: closestData.학술,
              담론: closestData.담론,
              네트워크: closestData.네트워크
            },
            total: closestData.제도 + closestData.학술 + closestData.담론 + closestData.네트워크
          });
        }

        // 수직 가이드라인
        g.selectAll('.guide-line').remove();
        g.append('line')
          .attr('class', 'guide-line')
          .attr('x1', xScale(closestData.t))
          .attr('x2', xScale(closestData.t))
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .style('stroke', '#F28317C') // Primary 500
          .style('stroke-width', '1px')
          .style('stroke-dasharray', '2,2')
          .style('opacity', 0.7);

        // 데이터 포인트 하이라이트
        stackedData.forEach((layerData) => {
          const dataPoint = layerData.find(d => d.data.t === closestData.t);
          if (dataPoint) {
            g.selectAll(`.highlight-${layerData.key}`).remove();
            g.append('circle')
              .attr('class', `highlight-${layerData.key}`)
              .attr('cx', xScale(closestData.t))
              .attr('cy', yScale(dataPoint[1]))
              .attr('r', 4)
              .style('fill', axisStrokeColors[layerData.key])
              .style('stroke', '#FFFFFF')
              .style('stroke-width', '2px');
          }
        });

        // 상세 툴팁
        tooltip.style('display', 'block')
          .html(formatTimeTooltip(closestData));
      })
      .on('mouseleave', () => {
        g.selectAll('.guide-line').remove();
        g.selectAll('[class*="highlight-"]').remove();
        tooltip.style('display', 'none');
        if (onTimeHover) onTimeHover(null);
      });

    // 축 제목 및 레이블
    g.append('text')
      .attr('class', 'x-axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text('데뷔년 기준 경과 시간 (년)');

    g.append('text')
      .attr('class', 'y-axis-label')  
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -50)
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text('누적 가치 점수');

    // 범례 (축별 기여도 표시)
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth - 120}, 20)`);

    axisOrder.forEach((axis, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendItem.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', axisColors[axis])
        .style('opacity', 0.8);

      legendItem.append('text')
        .attr('x', 25)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#374151')
        .text(axis);
    });

  }, [data, events, hoveredEvent, currentZoom, width, height]);

  // 이벤트 툴팁 포매터
  const formatEventTooltip = (event) => {
    return `
      <strong>${event.title}</strong><br/>
      <strong>시점:</strong> +${event.t}년<br/>
      <strong>유형:</strong> ${event.type}<br/>
      <strong>기관:</strong> ${event.org}<br/>
      <strong>영향도:</strong> ${event.impact_level === 'high' ? '높음' : '보통'}<br/>
      <hr/>
      <small>클릭하여 영향 분석 보기</small>
    `;
  };

  // 시점별 툴팁 포매터 (성장 패턴 분석)
  const formatTimeTooltip = (data) => {
    const total = data.제도 + data.학술 + data.담론 + data.네트워크;
    return `
      <strong>+${data.t}년 시점 분석</strong><br/>
      <hr/>
      <strong>제도:</strong> ${data.제도.toFixed(1)} (${((data.제도/total)*100).toFixed(1)}%)<br/>
      <strong>학술:</strong> ${data.학술.toFixed(1)} (${((data.학술/total)*100).toFixed(1)}%)<br/>
      <strong>담론:</strong> ${data.담론.toFixed(1)} (${((data.담론/total)*100).toFixed(1)}%)<br/>
      <strong>네트워크:</strong> ${data.네트워크.toFixed(1)} (${((data.네트워크/total)*100).toFixed(1)}%)<br/>
      <hr/>
      <strong>총 누적:</strong> ${total.toFixed(1)}
    `;
  };

  return (
    <div className="curator-chart-wrapper" style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        className="curator-tooltip"
        style={{ position: 'absolute', display: 'none' }}
      ></div>
    </div>
  );
};

export default StackedAreaChart;
