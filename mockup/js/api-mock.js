/**
 * CO-1016 CURATOR ODYSSEY: API Mock
 * 정적 JSON 데이터를 로드하여 API 호출 시뮬레이션
 */

class APIMock {
  constructor() {
    this.mockData = null;
    this.loadMockData();
  }

  async loadMockData() {
    try {
      const response = await fetch('./data/mock-data.json');
      this.mockData = await response.json();
    } catch (error) {
      console.error('Failed to load mock data:', error);
      // 폴백: 빈 데이터 구조
      this.mockData = {
        artists: {},
        comparisons: {},
        physicalGameSessions: {}
      };
    }
  }

  // GET /api/artist/:id/summary
  async getArtistSummary(artistId) {
    await this.ensureDataLoaded();
    
    const artist = this.mockData.artists[artistId];
    if (!artist) {
      throw new Error(`Artist ${artistId} not found`);
    }

    return {
      data: {
        artist_id: artist.artist_id,
        name: artist.name,
        radar5: artist.radar5,
        sunburst_l1: artist.sunburst_l1,
        weights_version: artist.weights_version,
        updated_at: artist.updated_at,
        data_source: artist.data_source
      },
      meta: {
        cache_hit: false,
        response_time: 150
      }
    };
  }

  // GET /api/artist/:id/sunburst
  async getArtistSunburst(artistId) {
    await this.ensureDataLoaded();
    
    const artist = this.mockData.artists[artistId];
    if (!artist) {
      throw new Error(`Artist ${artistId} not found`);
    }

    return {
      data: {
        artist_id: artist.artist_id,
        sunburst: artist.sunburst,
        weights_version: artist.weights_version,
        updated_at: artist.updated_at
      },
      meta: {
        cache_hit: false,
        response_time: 120
      }
    };
  }

  // GET /api/artist/:id/timeseries/:axis
  async getArtistTimeseries(artistId, axis) {
    await this.ensureDataLoaded();
    
    const artist = this.mockData.artists[artistId];
    if (!artist || !artist.timeseries[axis]) {
      throw new Error(`Timeseries data for ${artistId} axis ${axis} not found`);
    }

    return {
      data: {
        artist_id: artistId,
        axis: axis,
        series: artist.timeseries[axis],
        updated_at: artist.updated_at
      },
      meta: {
        cache_hit: false,
        response_time: 100
      }
    };
  }

  // POST /api/batch/timeseries
  async getBatchTimeseries(artistId, axes) {
    await this.ensureDataLoaded();
    
    const artist = this.mockData.artists[artistId];
    if (!artist) {
      throw new Error(`Artist ${artistId} not found`);
    }

    const batchData = {};
    axes.forEach(axis => {
      if (artist.timeseries[axis]) {
        batchData[axis] = artist.timeseries[axis];
      }
    });

    return {
      data: {
        artist_id: artistId,
        batch: batchData,
        updated_at: artist.updated_at
      },
      meta: {
        cache_hit: false,
        response_time: 200
      }
    };
  }

  // GET /api/compare/:artistA/:artistB/:axis
  async getCompareArtists(artistA, artistB, axis) {
    await this.ensureDataLoaded();
    
    const pairId = `${artistA}_vs_${artistB}`;
    const comparison = this.mockData.comparisons[pairId];
    
    if (!comparison || comparison.axis !== axis) {
      // 동적 생성 (간단한 예시)
      const artistA_data = this.mockData.artists[artistA];
      const artistB_data = this.mockData.artists[artistB];
      
      if (!artistA_data || !artistB_data) {
        throw new Error(`Comparison data not found for ${artistA} vs ${artistB}`);
      }

      // 간단한 비교 데이터 생성
      const seriesA = artistA_data.timeseries[axis] || [];
      const seriesB = artistB_data.timeseries[axis] || [];
      const maxLength = Math.max(seriesA.length, seriesB.length);
      
      const series = [];
      for (let i = 0; i < maxLength; i++) {
        const v_A = seriesA[i]?.v || 0;
        const v_B = seriesB[i]?.v || 0;
        series.push({
          t: i,
          v_A: v_A,
          v_B: v_B,
          diff: v_A - v_B
        });
      }

      return {
        data: {
          pair_id: pairId,
          axis: axis,
          series: series,
          metrics: {
            correlation: 0.75,
            abs_diff_sum: 1.2,
            auc: 0.7
          },
          cached: false,
          computed_at: new Date().toISOString()
        },
        meta: {
          cache_hit: false,
          response_time: 300
        }
      };
    }

    return {
      data: comparison,
      meta: {
        cache_hit: true,
        response_time: 50
      }
    };
  }

  // GET /api/physical-game/session/:sessionId
  async getPhysicalGameSession(sessionId) {
    await this.ensureDataLoaded();
    
    const session = this.mockData.physicalGameSessions[sessionId];
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return {
      data: session,
      meta: {
        cache_hit: false,
        response_time: 100
      }
    };
  }

  // 데이터 로드 확인
  async ensureDataLoaded() {
    if (!this.mockData) {
      await this.loadMockData();
    }
    
    // 최대 3초 대기
    let attempts = 0;
    while (!this.mockData && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!this.mockData) {
      throw new Error('Failed to load mock data');
    }
  }

  // 에러 시뮬레이션
  simulateError(errorType = 'NETWORK_ERROR') {
    const errors = {
      NETWORK_ERROR: {
        error: {
          code: 'ERR_NETWORK',
          message: 'Network error',
          details: [],
          timestamp: new Date().toISOString()
        },
        status: 503
      },
      NOT_FOUND: {
        error: {
          code: 'ERR_DATA_NOT_FOUND',
          message: 'Data not found',
          details: [],
          timestamp: new Date().toISOString()
        },
        status: 404
      },
      INVALID_PARAM: {
        error: {
          code: 'ERR_INVALID_PARAM',
          message: 'Invalid parameter',
          details: [],
          timestamp: new Date().toISOString()
        },
        status: 400
      }
    };

    return Promise.reject(errors[errorType] || errors.NETWORK_ERROR);
  }
}

// 전역 인스턴스 생성
const apiMock = new APIMock();

// 전역으로 내보내기
if (typeof window !== 'undefined') {
  window.apiMock = apiMock;
}

// Node.js 환경에서도 사용 가능하도록
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiMock;
}

