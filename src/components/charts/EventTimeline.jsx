import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EventTimeline = ({ 
  events = [], 
  timeRange = [0, 20],
  hoveredTime,
  hoveredEvent,
  onEventHover,
  onEventClick,
  impactAnalysis = {},
  width = 800,
  height = 120
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!events || events.length === 0 || !svgRef.current) return;

    // 차트 기본 설정 (Dr. Sarah Kim의 시간적 UI 설계)
    const margin = { top: 20, right: 80, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 이벤트 타입별 색상 및 아이콘 매핑 (DYSS 확장 팔레트)
    const eventTypeStyles = {
      '전시': { 
        color: '#8B5CF6', // DYSS Primary
        icon: '🎨',
        importance: 0.8
      },
      '수상': { 
        color: '#DC2626', // Red for achievements
        icon: '🏆',
        importance: 1.0
      },
      '출간': { 
        color: '#059669', // Green for publications
        icon: '📖',
        importance: 0.6
      },
      '협업': { 
        color: '#F59E0B', // Amber for collaborations
        icon: '🤝',
        importance: 0.7
      },
      '교육': { 
        color: '#7C3AED', // DYSS Primary 600
        icon: '🎓',
        importance: 0.5
      },
      '비엔날레': { 
        color: '#DC2626', // Red for major events
        icon: '🌍',
        importance: 1.0
      }
    };

    // 시간축 스케일
    const xScale = d3.scaleLinear()
      .domain(timeRange)
      .range([0, innerWidth]);

    // 이벤트를 시간순으로 정렬하고 겹침 방지 로직
    const sortedEvents = [...events].sort((a, b) => a.t - b.t);
    const eventLanes = []; // 이벤트 레인 (겹침 방지)
    
    sortedEvents.forEach((event, i) => {
      let laneIndex = 0;
      let placed = false;
      
      // 겹치지 않는 레인 찾기
      while (!placed) {
        if (!eventLanes[laneIndex]) {
          eventLanes[laneIndex] = [];
        }
        
        const lastEventInLane = eventLanes[laneIndex][eventLanes[laneIndex].length - 1];
        if (!lastEventInLane || xScale(event.t) - xScale(lastEventInLane.t) > 40) {
          eventLanes[laneIndex].push(event);
          event.lane = laneIndex;
          placed = true;
        } else {
          laneIndex++;
        }
      }
    });

    const maxLanes = eventLanes.length;
    const laneHeight = innerHeight / Math.max(maxLanes, 1);

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

    // 시간축 렌더링
    const timeAxis = d3.axisBottom(xScale)
      .tickFormat(d => `+${d}년`)
      .ticks(Math.min(timeRange[1] - timeRange[0], 10));

    g.append('g')
      .attr('class', 'time-axis')
      .attr('transform', `translate(0, ${innerHeight + 10})`)
      .call(timeAxis)
      .style('color', '#6B7280')
      .style('font-size', '12px');

    // 배경 시간 그리드 (시간적 맥락 강화)
    g.selectAll('.time-grid')
      .data(xScale.ticks(Math.min(timeRange[1] - timeRange[0], 20)))
      .enter()
      .append('line')
      .attr('class', 'time-grid')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .style('stroke', '#F3F4F6')
      .style('stroke-width', '1px')
      .style('opacity', 0.7);

    // 호버 타임라인 (StackedAreaChart와 동기화)
    if (hoveredTime !== null && hoveredTime !== undefined) {
      g.append('line')
        .attr('class', 'hover-timeline')
        .attr('x1', xScale(hoveredTime))
        .attr('x2', xScale(hoveredTime))
        .attr('y1', -10)
        .attr('y2', innerHeight + 10)
        .style('stroke', '#8B5CF6')
        .style('stroke-width', '2px')
        .style('stroke-dasharray', '4,4')
        .style('opacity', 0.8);
    }

    // 이벤트 그룹화 및 영향 분석 표시
    const eventGroups = g.selectAll('.event-group')
      .data(sortedEvents)
      .enter()
      .append('g')
      .attr('class', 'event-group')
      .attr('transform', d => {
        const x = xScale(d.t);
        const y = (d.lane * laneHeight) + (laneHeight / 2);
        return `translate(${x}, ${y})`;
      });

    // 이벤트 영향 분석 배경 (성장 가속화 구간 표시)
    eventGroups.each(function(event) {
      const group = d3.select(this);
      const impactData = impactAnalysis[event.id];
      
      if (impactData && impactData.growth_acceleration > 0.1) {
        // 영향 구간 배경 (이벤트 전후 2년)
        const impactWidth = xScale(Math.min(event.t + 3, timeRange[1])) - xScale(Math.max(event.t - 1, timeRange[0]));
        const impactX = xScale(Math.max(event.t - 1, timeRange[0])) - xScale(event.t);
        
        group.append('rect')
          .attr('class', 'impact-background')
          .attr('x', impactX)
          .attr('y', -laneHeight/2)
          .attr('width', impactWidth)
          .attr('height', laneHeight)
          .style('fill', eventTypeStyles[event.type]?.color || '#8B5CF6')
          .style('opacity', 0.1)
          .style('rx', 4);
      }
    });

    // 이벤트 연결선 (시간적 연속성 표시)
    eventGroups.append('line')
      .attr('class', 'event-stem')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', -laneHeight/4)
      .attr('y2', laneHeight/4)
      .style('stroke', d => eventTypeStyles[d.type]?.color || '#8B5CF6')
      .style('stroke-width', d => {
        const importance = eventTypeStyles[d.type]?.importance || 0.5;
        return hoveredEvent === d.id ? importance * 4 + 2 : importance * 2 + 1;
      })
      .style('opacity', d => hoveredEvent === d.id ? 1.0 : 0.7);

    // 이벤트 마커 (중요도별 크기 차별화)
    eventGroups.append('circle')
      .attr('class', 'event-marker')
      .attr('r', d => {
        const importance = eventTypeStyles[d.type]?.importance || 0.5;
        const baseSize = importance * 6 + 4;
        return hoveredEvent === d.id ? baseSize * 1.3 : baseSize;
      })
      .style('fill', d => eventTypeStyles[d.type]?.color || '#8B5CF6')
      .style('stroke', '#FFFFFF')
      .style('stroke-width', '2px')
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('mouseover', (event, d) => {
        if (onEventHover) onEventHover(d.id);
        
        // 이벤트 상세 툴팁 표시
        tooltip.style('display', 'block')
          .html(formatEventTooltip(d, impactAnalysis[d.id]));
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', () => {
        if (onEventHover) onEventHover(null);
        tooltip.style('display', 'none');
      })
      .on('click', (event, d) => {
        if (onEventClick) onEventClick(d);
      });

    // 이벤트 타입 아이콘 (가독성 향상)
    eventGroups.append('text')
      .attr('class', 'event-icon')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', d => {
        const importance = eventTypeStyles[d.type]?.importance || 0.5;
        return `${importance * 8 + 8}px`;
      })
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => eventTypeStyles[d.type]?.icon || '●');

    // 이벤트 레이블 (중요 이벤트만 표시)
    eventGroups
      .filter(d => (eventTypeStyles[d.type]?.importance || 0) > 0.7)
      .append('text')
      .attr('class', 'event-label')
      .attr('x', 0)
      .attr('y', d => d.lane % 2 === 0 ? -laneHeight/2 - 5 : laneHeight/2 + 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .style('pointer-events', 'none')
      .text(d => {
        const words = d.title.split(' ');
        return words.length > 2 ? words.slice(0, 2).join(' ') + '...' : d.title;
      });

    // 성장 가속화 인디케이터 (정량적 분석 표시)
    eventGroups
      .filter(d => impactAnalysis[d.id] && impactAnalysis[d.id].growth_acceleration > 0.2)
      .append('path')
      .attr('class', 'growth-indicator')
      .attr('d', 'M-3,-8 L3,-8 L0,-12 Z') // 위쪽 화살표
      .style('fill', '#10B981')
      .style('opacity', 0.8);

    // 범례 (이벤트 타입별)
    const legend = g.append('g')
      .attr('class', 'event-legend')
      .attr('transform', `translate(${innerWidth - 200}, -10)`);

    const legendItems = Object.entries(eventTypeStyles)
      .filter(([type]) => events.some(e => e.type === type));

    legendItems.forEach(([type, style], i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${(i % 3) * 70}, ${Math.floor(i / 3) * 20})`);

      legendItem.append('circle')
        .attr('r', 4)
        .style('fill', style.color);

      legendItem.append('text')
        .attr('x', 8)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .style('font-size', '10px')
        .style('font-weight', '500')
        .style('fill', '#374151')
        .text(type);
    });

  }, [events, timeRange, hoveredTime, hoveredEvent, impactAnalysis]);

  // 이벤트 상세 툴팁 포매터 (영향 분석 포함)
  const formatEventTooltip = (event, impact) => {
    let html = `
      <strong>${event.title}</strong><br/>
      <strong>시점:</strong> +${event.t}년 (${new Date(new Date().getFullYear() - (20 - event.t)).getFullYear()}년)<br/>
      <strong>유형:</strong> ${event.type}<br/>
      <strong>기관:</strong> ${event.org || '미상'}<br/>
    `;

    if (impact) {
      html += `
        <hr/>
        <strong>📈 성장 영향 분석:</strong><br/>
        <strong>성장 가속도:</strong> +${(impact.growth_acceleration * 100).toFixed(1)}%<br/>
        <strong>영향 지속기간:</strong> ${impact.duration_months || 12}개월<br/>
        <strong>주요 축 영향:</strong> ${impact.primary_axis || '전체'}
      `;
      
      if (impact.correlation_coefficient) {
        html += `<br/><strong>상관계수:</strong> ${impact.correlation_coefficient.toFixed(3)}`;
      }
    }

    html += `<hr/><small>클릭하여 상세 분석 보기</small>`;
    return html;
  };

  return (
    <div className="curator-chart-wrapper" style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        className="curator-tooltip"
        style={{ position: 'absolute', display: 'none', zIndex: 1000 }}
      ></div>
    </div>
  );
};

export default EventTimeline;
