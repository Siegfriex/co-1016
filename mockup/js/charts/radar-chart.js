/**
 * CO-1016 CURATOR ODYSSEY: Radar Chart
 * D3.js 기반 레이더 차트 구현 (VID v2.0 Section 2.1.1)
 */

class RadarChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      width: options.width || 400,
      height: options.height || 400,
      margin: options.margin || { top: 60, right: 60, bottom: 60, left: 60 },
      maxValue: options.maxValue || 100,
      axes: options.axes || ['I', 'F', 'A', 'M', 'Sedu'],
      colors: options.colors || {
        I: '#F28317C',
        F: '#FFA333',
        A: '#D66A0F',
        M: '#BA510C',
        Sedu: '#9E3809'
      },
      ...options
    };
    
    this.svg = null;
    this.g = null;
    this.tooltip = null;
    this.data = null;
  }

  render(data) {
    if (!this.container) {
      console.error('Container not found');
      return;
    }

    this.data = data;
    const { width, height, margin, maxValue, axes, colors } = this.options;
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.bottom);
    const angleSlice = (Math.PI * 2) / axes.length;

    // SVG 초기화
    d3.select(this.container).selectAll('*').remove();
    
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'radar-chart-svg');

    this.g = this.svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // 툴팁 생성
    this.tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('padding', '8px 12px')
      .style('background-color', 'rgba(61, 60, 57, 0.9)')
      .style('color', '#FFFFFF')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', '10000');

    // 스케일 정의
    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, maxValue]);

    // 배경 그리드 렌더링
    const gridLevels = 5;
    const gridWrapper = this.g.append('g').attr('class', 'grid-wrapper');

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
      .attr('x2', (d, i) => rScale(maxValue) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => rScale(maxValue) * Math.sin(angleSlice * i - Math.PI / 2))
      .style('stroke', '#D1D5DB')
      .style('stroke-width', '2px');

    // 축 레이블 렌더링
    const axisLabels = {
      'I': '기관전시',
      'F': '페어',
      'A': '시상',
      'M': '미디어',
      'Sedu': '교육'
    };

    axisGroup.append('text')
      .attr('class', 'axis-label')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .style('cursor', 'pointer')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', (d, i) => rScale(maxValue * 1.2) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => rScale(maxValue * 1.2) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => axisLabels[d] || d)
      .on('mouseover', (event, d) => {
        const hoverColor = colors[d] || colors.I;
        d3.select(event.currentTarget)
          .style('fill', hoverColor)
          .style('font-size', '16px');
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .style('fill', '#374151')
          .style('font-size', '14px');
      });

    // 데이터 폴리곤 렌더링
    const dataValues = axes.map(axis => ({
      axis: axis,
      value: data[axis] || 0
    }));

    // 데이터 영역 (채워진 폴리곤)
    const points = dataValues.map((d, i) => {
      const x = rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
      const y = rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
      return `${x},${y}`;
    }).join(' ');

    this.g.append('polygon')
      .attr('class', 'data-polygon')
      .attr('points', points)
      .style('fill', 'rgba(242, 131, 23, 0.2)')
      .style('stroke', '#F28317C')
      .style('stroke-width', '3px')
      .style('transition', 'all 0.5s ease-out')
      .attr('transform', 'scale(0)')
      .transition()
      .duration(500)
      .attr('transform', 'scale(1)');

    // 데이터 포인트 렌더링
    const pointGroup = this.g.append('g').attr('class', 'data-points');

    pointGroup.selectAll('.data-point')
      .data(dataValues)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('r', 5)
      .style('fill', (d) => colors[d.axis] || colors.I)
      .style('stroke', '#FFFFFF')
      .style('stroke-width', '2px')
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        this.tooltip
          .style('opacity', 1)
          .html(`${axisLabels[d.axis] || d.axis}: ${d.value.toFixed(1)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
        
        d3.select(event.currentTarget)
          .attr('r', 7)
          .style('fill', colors[d.axis] || colors.I);
      })
      .on('mouseout', (event) => {
        this.tooltip.style('opacity', 0);
        d3.select(event.currentTarget)
          .attr('r', 5);
      });
  }

  update(data) {
    this.render(data);
  }

  destroy() {
    if (this.tooltip) {
      this.tooltip.remove();
    }
    if (this.svg) {
      this.svg.remove();
    }
  }
}

// 전역으로 내보내기
if (typeof window !== 'undefined') {
  window.RadarChart = RadarChart;
}

// Node.js 환경에서도 사용 가능하도록
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RadarChart;
}

