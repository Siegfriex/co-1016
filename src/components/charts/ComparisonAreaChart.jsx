import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';

const ComparisonAreaChart = ({ 
  series, 
  axis, 
  artistA, 
  artistB, 
  isHighlighted = false,
  onDataPointHover 
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // 성능 최적화: 차트 설정 메모이제이션
  const chartConfig = useMemo(() => ({
    width: 480,
    height: 320,
    margin: { top: 20, right: 30, bottom: 40, left: 50 }
  }), []);

  // 성능 최적화: 스케일 계산 메모이제이션
  const scales = useMemo(() => {
    if (!series) return null;

    const { width, height, margin } = chartConfig;
    
    return {
      xScale: d3.scaleLinear()
        .domain(d3.extent(series, d => d.t))
        .range([0, width - margin.left - margin.right]),
      
      yScale: d3.scaleLinear()
        .domain([0, d3.max(series, d => Math.max(d.v_A, d.v_B))])
        .nice()
        .range([height - margin.top - margin.bottom, 0])
    };
  }, [series, chartConfig]);

  // 성능 최적화: 툴팁 핸들러 안정화
  const handleTooltip = useCallback((event, tooltipContent) => {
    const tooltip = d3.select(tooltipRef.current);
    tooltip
      .html(tooltipContent)
      .style('left', `${event.pageX + 15}px`)
      .style('top', `${event.pageY - 15}px`);
  }, []);

  useEffect(() => {
    if (!series || !svgRef.current || !scales) return;

    const { width, height, margin } = chartConfig;
    const { xScale, yScale } = scales;

    // VID v2.0 기본 색상 설정 (Section 5.4.3 참조)
    const defaultArtistA = {
      name: artistA?.name || '플레이어',
      color: artistA?.color || '#F28317C' // Primary 500
    };
    const defaultArtistB = {
      name: artistB?.name || '작가',
      color: artistB?.color || '#F1F0EC' // Secondary 기본
    };

    // SVG 설정
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 스케일은 이미 scales에서 가져왔으므로 중복 선언 제거

    // 그라데이션 정의
    const defs = svg.append('defs');
    
    // Artist A 그라데이션
    const gradientA = defs.append('linearGradient')
      .attr('id', `gradientA-${axis}`)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0);
    
    gradientA.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', defaultArtistA.color)
      .attr('stop-opacity', 0.1);
    
    gradientA.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', defaultArtistA.color)
      .attr('stop-opacity', 0.7);

    // Artist B 그라데이션
    const gradientB = defs.append('linearGradient')
      .attr('id', `gradientB-${axis}`)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0);
    
    gradientB.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', defaultArtistB.color)
      .attr('stop-opacity', 0.1);
    
    gradientB.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', defaultArtistB.color)
      .attr('stop-opacity', 0.7);

    // Area 생성기
    const areaA = d3.area()
      .x(d => xScale(d.t))
      .y0(yScale(0))
      .y1(d => yScale(d.v_A))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const areaB = d3.area()
      .x(d => xScale(d.t))
      .y0(yScale(0))
      .y1(d => yScale(d.v_B))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Line 생성기
    const lineA = d3.line()
      .x(d => xScale(d.t))
      .y(d => yScale(d.v_A))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const lineB = d3.line()
      .x(d => xScale(d.t))
      .y(d => yScale(d.v_B))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Artist B 영역 (뒤쪽에 렌더링)
    g.append('path')
      .datum(series)
      .attr('class', 'area-b')
      .attr('d', areaB)
      .attr('fill', `url(#gradientB-${axis})`)
      .style('opacity', isHighlighted ? 1 : 0.8);

    // Artist A 영역 (앞쪽에 렌더링)
    g.append('path')
      .datum(series)
      .attr('class', 'area-a')
      .attr('d', areaA)
      .attr('fill', `url(#gradientA-${axis})`)
      .style('opacity', isHighlighted ? 1 : 0.8);

    // Artist B 라인
    g.append('path')
      .datum(series)
      .attr('class', 'line-b')
      .attr('d', lineB)
      .attr('stroke', defaultArtistB.color)
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    // Artist A 라인
    g.append('path')
      .datum(series)
      .attr('class', 'line-a')
      .attr('d', lineA)
      .attr('stroke', defaultArtistA.color)
      .attr('stroke-width', 3) // VID v2.0 스펙: 플레이어 라인 굵기 3px
      .attr('fill', 'none');

    // 축 렌더링
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => `+${d}년`)
      );

    xAxis.selectAll('text')
      .style('fill', 'var(--dyss-color-text-secondary)')
      .style('font-size', '12px');

    const yAxis = g.append('g')
      .call(d3.axisLeft(yScale).ticks(5));

    yAxis.selectAll('text')
      .style('fill', 'var(--dyss-color-text-secondary)')
      .style('font-size', '12px');

    // 상호작용 영역
    const tooltip = d3.select(tooltipRef.current);
    const bisectDate = d3.bisector(d => d.t).left;

    const focus = g.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    // 세로 가이드 라인
    focus.append('line')
      .attr('class', 'focus-line-x')
      .attr('y1', 0)
      .attr('y2', height - margin.top - margin.bottom)
      .style('stroke', '#666')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '3,3');

    // Artist A 포인트
    focus.append('circle')
      .attr('class', 'focus-circle-a')
      .attr('r', 4)
      .style('fill', defaultArtistA.color)
      .style('stroke', '#fff')
      .style('stroke-width', 2);

    // Artist B 포인트
    focus.append('circle')
      .attr('class', 'focus-circle-b')
      .attr('r', 4)
      .style('fill', defaultArtistB.color)
      .style('stroke', '#fff')
      .style('stroke-width', 2);

    // 인터랙션 오버레이
    const overlay = g.append('rect')
      .attr('class', 'overlay')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => {
        focus.style('display', null);
        tooltip.style('display', 'block');
      })
      .on('mouseout', () => {
        focus.style('display', 'none');
        tooltip.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX);
        const i = bisectDate(series, x0, 1);
        const d0 = series[i - 1];
        const d1 = series[i];
        const d = d1 && (x0 - d0.t > d1.t - x0) ? d1 : d0;

        if (!d) return;

        focus.attr('transform', `translate(${xScale(d.t)},0)`);
        
        focus.select('.focus-circle-a')
          .attr('cy', yScale(d.v_A));
        
        focus.select('.focus-circle-b')
          .attr('cy', yScale(d.v_B));

        // 툴팁 내용
        const tooltipContent = `
          <div class="tooltip-header">
            <strong>+${d.t}년차</strong>
          </div>
          <div class="tooltip-body">
            <div class="tooltip-row">
              <span class="artist-indicator" style="background: ${defaultArtistA.color}"></span>
              <span>${defaultArtistA.name}: ${d.v_A.toFixed(1)}</span>
            </div>
            <div class="tooltip-row">
              <span class="artist-indicator" style="background: ${defaultArtistB.color}"></span>
              <span>${defaultArtistB.name}: ${d.v_B.toFixed(1)}</span>
            </div>
            <div class="tooltip-separator"></div>
            <div class="tooltip-diff">
              차이: ${Math.abs(d.v_A - d.v_B).toFixed(1)} 
              (${d.v_A > d.v_B ? defaultArtistA.name : defaultArtistB.name} 우세)
            </div>
          </div>
        `;

        handleTooltip(event, tooltipContent);

        setHoveredPoint(d);
        if (onDataPointHover) onDataPointHover(d, axis);
      });

    // 범례
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - margin.left - margin.right - 120}, 15)`);

    legend.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .style('fill', defaultArtistA.color);

    legend.append('text')
      .attr('x', 12)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', 'var(--dyss-color-text-secondary)')
      .text(defaultArtistA.name);

    legend.append('circle')
      .attr('cx', 0)
      .attr('cy', 20)
      .attr('r', 6)
      .style('fill', defaultArtistB.color);

    legend.append('text')
      .attr('x', 12)
      .attr('y', 20)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', 'var(--dyss-color-text-secondary)')
      .text(defaultArtistB.name);

  }, [series, axis, artistA, artistB, isHighlighted, chartConfig, scales, handleTooltip]);

  return (
    <div className="curator-chart-wrapper">
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        className="curator-tooltip curator-comparison-tooltip"
      ></div>
    </div>
  );
};

export default React.memo(ComparisonAreaChart);
