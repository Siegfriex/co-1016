/**
 * CO-1016 CURATOR ODYSSEY: Configuration
 * Based on VID v2.0 and API Spec
 */

const CONFIG = {
  // API 엔드포인트 설정
  API: {
    BASE_URL: 'https://co-1016.web.app/api',
    ENDPOINTS: {
      ARTIST_SUMMARY: (id) => `/api/artist/${id}/summary`,
      ARTIST_SUNBURST: (id) => `/api/artist/${id}/sunburst`,
      ARTIST_TIMESERIES: (id, axis) => `/api/artist/${id}/timeseries/${axis}`,
      BATCH_TIMESERIES: '/api/batch/timeseries',
      COMPARE: (artistA, artistB, axis) => `/api/compare/${artistA}/${artistB}/${axis}`,
      REPORT_GENERATE: '/api/report/generate',
      PHYSICAL_GAME_SESSION: (sessionId) => `/api/physical-game/session/${sessionId}`
    }
  },

  // 색상 팔레트 (VID Section 5.4)
  COLORS: {
    PRIMARY: {
      50: '#FFF4E6',
      100: '#FFE8CC',
      200: '#FFD199',
      300: '#FFBA66',
      400: '#FFA333',
      500: '#F28317C', // 주 컬러
      600: '#D66A0F',
      700: '#BA510C',
      800: '#9E3809',
      900: '#821F06'
    },
    SECONDARY: {
      50: '#F9F8F6',
      100: '#F1F0EC', // 세컨더리 기본
      200: '#E8E7E2',
      300: '#DEDDD6',
      400: '#C4C3BA',
      500: '#A9A89E',
      600: '#8E8D82',
      700: '#6B6A60',
      800: '#4A4942',
      900: '#3D3C39'
    },
    // 레이더 차트 색상
    RADAR: {
      I: '#F28317C',
      F: '#FFA333',
      A: '#D66A0F',
      M: '#BA510C',
      Sedu: '#9E3809'
    },
    // 선버스트 차트 색상
    SUNBURST: {
      제도: { L1: '#F28317C', L2: '#FFA333', L3: '#FFBA66' },
      학술: { L1: '#D66A0F', L2: '#FFA333', L3: '#FFD199' },
      담론: { L1: '#BA510C', L2: '#D66A0F', L3: '#FFA333' },
      네트워크: { L1: '#9E3809', L2: '#BA510C', L3: '#D66A0F' }
    },
    // 비교 차트 색상
    COMPARE: {
      PLAYER: '#F28317C',
      ARTIST: '#F1F0EC',
      DIFF: 'rgba(242, 131, 23, 0.15)'
    }
  },

  // 브레이크포인트 (VID Section 7.4)
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1440
  },

  // 애니메이션 타이밍 (VID Section 6)
  ANIMATION: {
    TRANSITION_FAST: 0.15,
    TRANSITION_NORMAL: 0.3,
    TRANSITION_SLOW: 0.6,
    TRANSITION_SLOWER: 0.8,
    STAGGER_DELAY: 200, // ms
    SECTION_FADE_DURATION: 800, // ms
    CHART_EXPAND_DURATION: 500 // ms
  },

  // 그리드 시스템 (VID Section 7)
  GRID: {
    LANDING: {
      MAX_WIDTH: 1440,
      PADDING: {
        MOBILE: 24,
        TABLET: 40,
        DESKTOP: 80
      },
      SECTION_MARGIN: {
        MOBILE: 80,
        TABLET: 120,
        DESKTOP: 160
      },
      COLS: {
        MOBILE: 4,
        TABLET: 8,
        DESKTOP: 12
      },
      GUTTER: {
        MOBILE: 16,
        TABLET: 24,
        DESKTOP: 32
      }
    },
    RESULT: {
      BASE_MARGIN: 120,
      COLS: 12,
      GUTTER: 'auto'
    }
  },

  // 차트 설정
  CHARTS: {
    RADAR: {
      SIZE: {
        MOBILE: 300,
        TABLET: 350,
        DESKTOP: 400
      },
      AXES: ['I', 'F', 'A', 'M', 'Sedu'],
      MAX_VALUE: 100
    },
    SUNBURST: {
      SIZE: {
        MOBILE: 300,
        TABLET: 350,
        DESKTOP: 400
      },
      LEVELS: ['L1', 'L2', 'L3'],
      AXES: ['제도', '학술', '담론', '네트워크']
    },
    STACKED_AREA: {
      HEIGHT: {
        MOBILE: 300,
        TABLET: 400,
        DESKTOP: 500
      },
      AXES: ['제도', '학술', '담론', '네트워크']
    },
    COMPARISON: {
      SIZE: {
        MOBILE: { width: '100%', height: 300 },
        TABLET: { width: '90%', height: 350 },
        DESKTOP: { width: 800, height: 400 }
      }
    }
  },

  // 샘플 아티스트 ID
  SAMPLE_ARTISTS: {
    YANG_HYEKYU: 'ARTIST_0005',
    ARTIST_0003: 'ARTIST_0003'
  }
};

// 전역으로 내보내기
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

// Node.js 환경에서도 사용 가능하도록
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

