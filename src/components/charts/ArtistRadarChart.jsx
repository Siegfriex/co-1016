import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ArtistRadarChart = ({ data, onAxisHover }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // 차트 기본 설정 (VID v2.0 디자인 시스템 적용)
    const width = 450;
    const height = 450;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const radius = Math.min(width, height) / 2 - margin.top;

    // 5축 데이터 매핑
    const axes = [
      { key: 'I', label: '기관전시', fullName: 'Institution' },
      { key: 'F', label: '페어', fullName: 'Fair' },
      { key: 'A', label: '시상', fullName: 'Award' },
      { key: 'M', label: '미디어', fullName: 'Media' },
      { key: 'Sedu', label: '교육', fullName: 'Seduction' }
    ];

    const angleSlice = (Math.PI * 2) / axes.length;

    // VID v2.0 Primary 팔레트 적용 (Section 5.4.1 참조)
    const primaryColor = '#F28317C'; // Primary 500 (주 컬러)
    const axisColors = {
      'I': '#F28317C',    // Primary 500
      'F': '#FFA333',     // Primary 400
      'A': '#D66A0F',     // Primary 600
      'M': '#BA510C',     // Primary 700
      'Sedu': '#9E3809'   // Primary 800
    };

    // 스케일 정의
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 100]);

    // SVG 설정
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('font-family', 'var(--dyss-font-family-primary)');

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // 툴팁 설정
    const tooltip = d3.select(tooltipRef.current);

    // 배경 그리드 렌더링 (VID v2.0 스타일)
    const gridLevels = 5;
    const gridWrapper = g.append('g').attr('class', 'grid-wrapper');

    gridWrapper.selectAll('.grid-level')
      .data(d3.range(1, gridLevels + 1).reverse())
      .enter()
      .append('polygon')
      .attr('class', 'grid-level')
      .attr('points', (d) => {
        const levelFactor = radius * (d / gridLevels);
        return axes.map((axis, i) => {
          const x = levelFactor * Math.cos(angleSlice * i - Math.PI / 2);
          const y = levelFactor * Math.sin(angleSlice * i - Math.PI / 2);
          return `${x},${y}`;
        }).join(' ');
      })
      .style('fill', '#F3F4F6')
      .style('stroke', '#E5E7EB')
      .style('stroke-width', '1px')
      .style('fill-opacity', 0.1);

    // 축 선 렌더링
    const axisGroup = gridWrapper.selectAll('.axis')
      .data(axes)
      .enter()
      .append('g')
      .attr('class', 'axis');

    axisGroup.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => rScale(100) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => rScale(100) * Math.sin(angleSlice * i - Math.PI / 2))
      .style('stroke', '#D1D5DB')
      .style('stroke-width', '2px');

    // 축 레이블 렌더링 (인터랙티브)
    axisGroup.append('text')
      .attr('class', 'axis-label')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .style('cursor', 'pointer')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', (d, i) => rScale(120) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => rScale(120) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d.label)
      .on('mouseover', (event, d) => {
        // 호버 효과
        const axisKey = axes.find(a => a.label === d.label)?.key || 'I';
        const hoverColor = axisColors[axisKey] || primaryColor;
        d3.select(event.currentTarget)
          .style('fill', hoverColor)
          .style('font-size', '16px');
        
        // 상위 컴포넌트에 호버 축 알림 (선버스트 하이라이트용)
        const axisMapping = {
          '기관전시': '제도',
          '페어': '제도',
          '시상': '학술',
          '미디어': '담론',
          '교육': '학술'
        };
        
        if (onAxisHover) {
          onAxisHover(axisMapping[d.label] || null);
        }
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .style('fill', '#374151')
          .style('font-size', '14px');
        
        if (onAxisHover) onAxisHover(null);
      });

    // 데이터 폴리곤 렌더링
    const dataValues = axes.map(axis => ({
      axis: axis.label,
      value: data[axis.key] || 0,
      fullName: axis.fullName
    }));

    // 라인 생성기
    const lineGenerator = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice);

    // 데이터 영역 (채워진 폴리곤)
    g.append('path')
      .datum(dataValues)
      .attr('class', 'data-area')
      .attr('d', lineGenerator)
      .style('fill', 'rgba(242, 131, 23, 0.2)') // Primary 500, 20% 투명도
      .style('stroke', '#F28317C') // Primary 500
      .style('stroke-width', '3px')
      .style('stroke-linejoin', 'round');

    // 데이터 포인트 (점)
    g.selectAll('.data-point')
      .data(dataValues)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('r', 6)
      .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .style('fill', primaryColor)
      .style('stroke', '#FFFFFF')
      .style('stroke-width', '3px')
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        // 점 확대 효과
        const axisKey = axes.find(a => a.label === d.axis)?.key || 'I';
        const hoverColor = axisColors[axisKey] || primaryColor;
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', 8)
          .style('fill', hoverColor);

        tooltip.style('display', 'block')
              .html(`<strong>${d.fullName}</strong><br/>Score: ${d.value.toFixed(1)}`);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${event.pageX + 15}px`)
              .style('top', `${event.pageY + 15}px`);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', 6)
          .style('fill', primaryColor);

        tooltip.style('display', 'none');
      });

    // 중앙 제목
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '16px')
      .style('font-weight', '700')
      .style('fill', '#1F2937')
      .text('Value Snapshot');

  }, [data, onAxisHover]);

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

export default ArtistRadarChart;
