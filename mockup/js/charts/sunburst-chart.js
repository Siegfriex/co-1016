/**
 * CO-1016 CURATOR ODYSSEY: Sunburst Chart
 * D3.js 기반 선버스트 차트 구현 (VID v2.0 Section 2.1.2)
 */

class SunburstChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      width: options.width || 400,
      height: options.height || 400,
      colors: options.colors || {
        제도: { L1: '#F28317C', L2: '#FFA333', L3: '#FFBA66' },
        학술: { L1: '#D66A0F', L2: '#FFA333', L3: '#FFD199' },
        담론: { L1: '#BA510C', L2: '#D66A0F', L3: '#FFA333' },
        네트워크: { L1: '#9E3809', L2: '#BA510C', L3: '#D66A0F' }
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
    const { width, height, colors } = this.options;
    const radius = Math.min(width, height) / 2;

    // SVG 초기화
    d3.select(this.container).selectAll('*').remove();
    
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'sunburst-chart-svg');

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

    // 파티션 레이아웃 생성
    const partition = d3.partition()
      .size([2 * Math.PI, radius]);

    // 데이터 변환
    const root = this.hierarchy(data);
    partition(root);

    // 호버 효과
    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1);

    // 섹터 렌더링
    const path = this.g.selectAll('path')
      .data(root.descendants())
      .enter()
      .append('path')
      .attr('d', arc)
      .style('fill', d => {
        if (!d.data.name) return '#E5E7EB';
        const axis = d.data.name;
        const level = d.depth === 1 ? 'L1' : d.depth === 2 ? 'L2' : 'L3';
        return colors[axis]?.[level] || '#E5E7EB';
      })
      .style('stroke', '#FFFFFF')
      .style('stroke-width', '2px')
      .style('opacity', d => {
        if (d.depth === 1) return 1.0;
        if (d.depth === 2) return 0.7;
        return 0.4;
      })
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .style('opacity', 1)
          .style('stroke-width', '3px');
        
        this.tooltip
          .style('opacity', 1)
          .html(`${d.data.name || 'Root'}: ${(d.value * 100).toFixed(1)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', (event, d) => {
        const opacity = d.depth === 1 ? 1.0 : d.depth === 2 ? 0.7 : 0.4;
        d3.select(event.currentTarget)
          .style('opacity', opacity)
          .style('stroke-width', '2px');
        
        this.tooltip.style('opacity', 0);
      });

    // 애니메이션 적용
    path.attr('transform', 'scale(0) rotate(0)')
      .transition()
      .duration(600)
      .attr('transform', 'scale(1) rotate(360)');
  }

  hierarchy(data) {
    const root = { name: 'root', children: [] };
    
    Object.keys(data).forEach(axis => {
      const axisData = data[axis];
      const axisNode = {
        name: axis,
        value: axisData.L1 || 0,
        children: []
      };

      if (axisData.L2) {
        Object.keys(axisData.L2).forEach(l2Key => {
          const l2Value = axisData.L2[l2Key];
          const l2Node = {
            name: l2Key,
            value: l2Value,
            children: []
          };

          if (axisData.L3) {
            Object.keys(axisData.L3).forEach(l3Key => {
              if (l3Key.startsWith(l2Key)) {
                l2Node.children.push({
                  name: l3Key,
                  value: axisData.L3[l3Key] || 0
                });
              }
            });
          }

          axisNode.children.push(l2Node);
        });
      }

      root.children.push(axisNode);
    });

    return d3.hierarchy(root)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
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
  window.SunburstChart = SunburstChart;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SunburstChart;
}

