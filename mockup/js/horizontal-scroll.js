/**
 * CO-1016 CURATOR ODYSSEY: Horizontal Scroll
 * 마우스 휠 → 가로 스크롤 변환 (VID v2.0 Section 4.2)
 */

class HorizontalScroll {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      snap: options.snap !== false, // 기본값: true
      snapStrength: options.snapStrength || 0.5,
      wheelSensitivity: options.wheelSensitivity || 1,
      keyboardEnabled: options.keyboardEnabled !== false, // 기본값: true
      ...options
    };

    this.sections = [];
    this.currentSection = 0;
    this.isScrolling = false;

    this.init();
  }

  init() {
    if (!this.container) {
      console.error('Container not found');
      return;
    }

    // 섹션 수집
    this.sections = Array.from(this.container.querySelectorAll('.section-result'));
    
    if (this.sections.length === 0) {
      console.warn('No sections found');
      return;
    }

    // 마우스 휠 이벤트
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      if (this.isScrolling) return;
      
      const deltaY = e.deltaY;
      const scrollAmount = deltaY * this.options.wheelSensitivity;
      
      this.scrollHorizontal(scrollAmount);
    }, { passive: false });

    // 키보드 네비게이션
    if (this.options.keyboardEnabled) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.goToSection(this.currentSection - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.goToSection(this.currentSection + 1);
        } else if (e.key === 'Home') {
          e.preventDefault();
          this.goToSection(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          this.goToSection(this.sections.length - 1);
        }
      });
    }

    // 터치 제스처 (모바일)
    let touchStartX = 0;
    let touchStartY = 0;

    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (!touchStartX || !touchStartY) return;

      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // 가로 스와이프 감지
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        e.preventDefault();
        
        if (diffX > 0) {
          // 왼쪽 스와이프 (다음 섹션)
          this.goToSection(this.currentSection + 1);
        } else {
          // 오른쪽 스와이프 (이전 섹션)
          this.goToSection(this.currentSection - 1);
        }

        touchStartX = 0;
        touchStartY = 0;
      }
    }, { passive: false });

    // 초기 섹션 설정
    this.updateCurrentSection();
    
    // 스크롤 이벤트 리스너
    this.container.addEventListener('scroll', () => {
      this.updateCurrentSection();
    });
  }

  scrollHorizontal(delta) {
    if (this.isScrolling) return;
    
    this.isScrolling = true;
    
    const currentScroll = this.container.scrollLeft;
    const newScroll = currentScroll + delta;
    
    this.container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });

    // 스크롤 완료 후 플래그 해제
    setTimeout(() => {
      this.isScrolling = false;
    }, 300);
  }

  goToSection(index) {
    if (index < 0 || index >= this.sections.length) return;
    if (this.isScrolling) return;

    this.isScrolling = true;
    this.currentSection = index;

    const targetSection = this.sections[index];
    if (!targetSection) return;

    targetSection.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start'
    });

    // 네비게이션 인디케이터 업데이트
    this.updateNavigationIndicators();

    // 포커스 관리
    targetSection.focus();

    setTimeout(() => {
      this.isScrolling = false;
    }, 800);
  }

  updateCurrentSection() {
    const containerRect = this.container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestSection = 0;
    let closestDistance = Infinity;

    this.sections.forEach((section, index) => {
      const sectionRect = section.getBoundingClientRect();
      const sectionCenter = sectionRect.left + sectionRect.width / 2;
      const distance = Math.abs(sectionCenter - containerCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestSection = index;
      }
    });

    if (this.currentSection !== closestSection) {
      this.currentSection = closestSection;
      this.updateNavigationIndicators();
    }
  }

  updateNavigationIndicators() {
    // 네비게이션 점 업데이트
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
      if (index === this.currentSection) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // 섹션 활성화 클래스 업데이트
    this.sections.forEach((section, index) => {
      if (index === this.currentSection) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });
  }

  destroy() {
    // 이벤트 리스너 제거는 필요시 구현
  }
}

// 전역으로 내보내기
if (typeof window !== 'undefined') {
  window.HorizontalScroll = HorizontalScroll;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HorizontalScroll;
}

