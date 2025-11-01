import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const SunburstChart = ({ data, highlightedAxis, onSegmentHover, onSegmentClick }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [currentRoot, setCurrentRoot] = useState(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // 차트 기본 설정 (DYSS 디자인 시스템 적용)
    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 6;

    // DYSS 컬러 시스템 적용
    const colorScale = d3.scaleOrdinal()
      .domain(['제도', '학술', '담론', '네트워크'])
      .range(['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6']); // DYSS primary colors

    // 계층적 데이터 구조화
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // 파티션 레이아웃 계산
    d3.partition().size([2 * Math.PI, root.height + 1])(root);
    root.each(d => (d.current = d));

    // SVG 설정
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .style('font-family', 'var(--dyss-font-family-primary)');

    svg.selectAll('*').remove();

    // Arc 생성기
    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    // 툴팁 설정
    const tooltip = d3.select(tooltipRef.current);

    // Path 렌더링
    const path = svg.append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', d => {
        while (d.depth > 1) d = d.parent;
        return colorScale(d.data.name);
      })
      .attr('fill-opacity', d => {
        const isHighlighted = highlightedAxis && 
          d.ancestors().some(ancestor => ancestor.data.name === highlightedAxis);
        const isDimmed = highlightedAxis && !isHighlighted;
        
        if (isDimmed) return 0.2;
        return arcVisible(d.current) ? (d.children ? 0.8 : 0.6) : 0;
      })
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .attr('d', d => arc(d.current))
      .style('cursor', 'pointer')
      .style('transition', 'fill-opacity 0.3s ease')
      .on('click', (event, d) => {
        // Phase 2 드릴다운을 위한 클릭 이벤트
        if (onSegmentClick && d.depth <= 2) {
          onSegmentClick({
            name: d.data.name,
            axis: d.ancestors().find(a => a.depth === 1)?.data.name,
            value: d.data.value,
            depth: d.depth
          });
          return; // 드릴다운 후 줌 방지
        }
        
        // 기본 줌 동작
        clicked(event, d);
      })
      .on('mouseover', (event, d) => {
        // 호버 시 상위 컴포넌트에 알림
        if (onSegmentHover) {
          const rootAxis = d.ancestors().find(a => a.depth === 1);
          onSegmentHover(rootAxis ? rootAxis.data.name : null);
        }

        tooltip.style('display', 'block')
              .html(formatTooltip(d.data));
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${event.pageX + 15}px`)
              .style('top', `${event.pageY + 15}px`);
      })
      .on('mouseout', () => {
        if (onSegmentHover) onSegmentHover(null);
        tooltip.style('display', 'none');
      });

    // 중앙 원 (줌아웃 버튼)
    const parent = svg.append('circle')
      .datum(root)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', clicked);

    // 레이블 렌더링
    const label = svg.append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em')
      .attr('fill', '#FFFFFF')
      .attr('fill-opacity', d => +labelVisible(d.current))
      .attr('transform', d => labelTransform(d.current))
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text(d => d.data.name);

    // 클릭 핸들러 (줌 기능)
    function clicked(event, p) {
      parent.datum(p.parent || root);

      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });

      const t = svg.transition().duration(750);

      path.transition(t)
        .tween('data', d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
        .filter(function(d) {
          return +this.getAttribute('fill-opacity') || arcVisible(d.target);
        })
        .attr('fill-opacity', d => {
          const isHighlighted = highlightedAxis && 
            d.ancestors().some(ancestor => ancestor.data.name === highlightedAxis);
          const isDimmed = highlightedAxis && !isHighlighted;
          
          if (isDimmed) return 0.2;
          return arcVisible(d.target) ? (d.children ? 0.8 : 0.6) : 0;
        })
        .attrTween('d', d => () => arc(d.current));

      label.filter(function(d) {
          return +this.getAttribute('fill-opacity') || labelVisible(d.target);
        }).transition(t)
        .attr('fill-opacity', d => +labelVisible(d.target))
        .attrTween('transform', d => () => labelTransform(d.current));
    }

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    function formatTooltip(d) {
      let content = `<strong>${d.name}</strong><br/>Value: ${d.value?.toFixed(1) || 0}`;
      
      if (d.tooltip) {
        content += `<hr/>`;
        content += `Unit: ${d.tooltip.unit}<br/>`;
        content += `Time Window: ${d.tooltip.time_window}<br/>`;
        content += `Weight: ${d.tooltip.weight}<br/>`;
        content += `Source: ${d.tooltip.source_id}`;
      }
      return content;
    }

  }, [data, highlightedAxis]);

  return (
    <div className="curator-chart-wrapper">
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        className="curator-tooltip"
      ></div>
    </div>
  );
};

export default SunburstChart;
