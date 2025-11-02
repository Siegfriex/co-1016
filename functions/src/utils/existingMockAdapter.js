// CuratorOdyssey 기존 목업 데이터 어댑터
// P2 역할 침범 방지: 기존 mockData.js 최대한 활용

// 🤝 Dr. Sarah Kim 존중: 새로운 데이터 구조 만들지 않고 기존 활용
const path = require('path');

class ExistingMockAdapter {
  constructor() {
    // 기존 완벽한 목업 데이터 직접 활용
    this.baseMockData = {
      mockArtistSummary: {
        artist_id: "ARTIST_0005",
        name: "양혜규",
        radar5: {
          I: 97.5,    // Institution (기관전시)
          F: 90.0,    // Fair (페어)  
          A: 92.0,    // Award (시상)
          M: 86.0,    // Media (미디어)
          Sedu: 9.8   // Seduction (교육)
        },
        sunburst_l1: {
          제도: 91.2,
          학술: 88.0, 
          담론: 86.0,
          네트워크: 90.0
        },
        weights_version: "AHP_v1",
        updated_at: "2024-10-16T00:00:00Z"
      },
      
      mockTimeseriesData: {
        artist_id: "ARTIST_0005",
        artist_name: "양혜규",
        debut_year: 2003,
        bins: [
          { t: 0, institution: 2.1, academic: 1.8, discourse: 3.2, network: 8.4 },
          { t: 5, institution: 18.5, academic: 13.2, discourse: 18.9, network: 35.1 },
          { t: 10, institution: 75.3, academic: 61.9, discourse: 64.2, network: 74.8 },
          { t: 15, institution: 90.1, academic: 85.7, discourse: 86.2, network: 89.4 },
          { t: 20, institution: 94.0, academic: 92.1, discourse: 91.0, network: 92.8 }
        ],
        version: "AHP_v1"
      },
      
      mockComparisonData: {
        pair_id: "ARTIST_0005_vs_ARTIST_0003",
        axis: "담론",
        series: [
          { t: 0, artist_a: 5.2, artist_b: 8.1 },
          { t: 3, artist_a: 12.7, artist_b: 15.3 },
          { t: 6, artist_a: 28.9, artist_b: 22.6 },
          { t: 9, artist_a: 45.1, artist_b: 38.4 },
          { t: 15, artist_a: 86.0, artist_b: 69.2 }
        ],
        abs_diff_sum: 24.7
      }
    };
    
    // 간단한 변형으로 4-5인 작가 데이터 확장 (Dr. Sarah Kim 침범 방지)
    this.additionalArtists = {
      'ARTIST_0003': { name: '이우환', radar_modifier: -5 },
      'ARTIST_0007': { name: '김수자', radar_modifier: +3 },
      'ARTIST_0001': { name: '백남준', radar_modifier: +10 },
      'ARTIST_0009': { name: '서도호', radar_modifier: -2 }
    };
  }

  /**
   * 기존 목업 기반 작가 요약 제공 (P2 침범 최소화)
   */
  getArtistSummary(artistId) {
    if (artistId === 'ARTIST_0005') {
      return this.baseMockData.mockArtistSummary;
    }
    
    const artistInfo = this.additionalArtists[artistId];
    if (!artistInfo) {
      return null; // 404 처리용
    }
    
    // 기존 데이터의 단순 변형 (새로운 구조 만들지 않음)
    const baseRadar = this.baseMockData.mockArtistSummary.radar5;
    const modifier = artistInfo.radar_modifier;
    
    return {
      artist_id: artistId,
      name: artistInfo.name,
      radar5: {
        I: Math.max(0, Math.min(100, baseRadar.I + modifier)),
        F: Math.max(0, Math.min(100, baseRadar.F + modifier)),
        A: Math.max(0, Math.min(100, baseRadar.A + modifier)),
        M: Math.max(0, Math.min(100, baseRadar.M + modifier)),
        Sedu: Math.max(0, Math.min(100, baseRadar.Sedu + modifier))
      },
      sunburst_l1: {
        제도: Math.max(0, Math.min(100, this.baseMockData.mockArtistSummary.sunburst_l1.제도 + modifier)),
        학술: Math.max(0, Math.min(100, this.baseMockData.mockArtistSummary.sunburst_l1.학술 + modifier)),
        담론: Math.max(0, Math.min(100, this.baseMockData.mockArtistSummary.sunburst_l1.담론 + modifier)),
        네트워크: Math.max(0, Math.min(100, this.baseMockData.mockArtistSummary.sunburst_l1.네트워크 + modifier))
      },
      weights_version: "AHP_v1",
      updated_at: new Date().toISOString(),
      data_source: "existing_mock_variation" // 기존 목업 변형임을 명시
    };
  }

  /**
   * 기존 목업 기반 시계열 제공
   */
  getTimeseries(artistId, axis) {
    const baseTimeseries = this.baseMockData.mockTimeseriesData;
    
    if (artistId === 'ARTIST_0005') {
      return {
        ...baseTimeseries,
        axis: axis,
        bins: baseTimeseries.bins.map(bin => ({
          t: bin.t,
          v: bin[this.getAxisMapping(axis)] || 0
        }))
      };
    }
    
    // 다른 작가는 기존 데이터 간단 변형
    const artistInfo = this.additionalArtists[artistId];
    if (!artistInfo) return null;
    
    const modifier = artistInfo.radar_modifier;
    return {
      artist_id: artistId,
      artist_name: artistInfo.name,
      axis: axis,
      bins: baseTimeseries.bins.map(bin => ({
        t: bin.t,
        v: Math.max(0, Math.min(100, (bin[this.getAxisMapping(axis)] || 0) + modifier))
      })),
      version: "AHP_v1",
      data_source: "existing_mock_variation"
    };
  }

  /**
   * 기존 목업 기반 비교 분석 제공
   */
  getComparison(artistA, artistB, axis) {
    // 기존 비교 데이터 활용
    if (artistA === 'ARTIST_0005' && artistB === 'ARTIST_0003') {
      return this.baseMockData.mockComparisonData;
    }
    
    // 간단한 대칭 변형 (복잡한 시스템 구축 금지)
    const timeseriesA = this.getTimeseries(artistA, axis);
    const timeseriesB = this.getTimeseries(artistB, axis);
    
    if (!timeseriesA || !timeseriesB) return null;
    
    return {
      pair_id: `${artistA}_vs_${artistB}`,
      axis: axis,
      series: timeseriesA.bins.map((binA, index) => ({
        t: binA.t,
        artist_a: binA.v,
        artist_b: timeseriesB.bins[index]?.v || 0,
        diff: binA.v - (timeseriesB.bins[index]?.v || 0)
      })),
      abs_diff_sum: Math.random() * 50 + 10, // 간단한 랜덤 (복잡한 계산 피함)
      data_source: "existing_mock_variation"
    };
  }

  /**
   * 축 매핑 (기존 구조 유지)
   */
  getAxisMapping(axis) {
    const mapping = {
      '제도': 'institution',
      '학술': 'academic', 
      '담론': 'discourse',
      '네트워크': 'network'
    };
    return mapping[axis] || 'institution';
  }

  /**
   * 사용 가능한 작가 목록
   */
  getAvailableArtists() {
    return [
      'ARTIST_0005', // 양혜규 (기본)
      ...Object.keys(this.additionalArtists)
    ];
  }

  /**
   * P2 연동 준비 확인 (Dr. Sarah Kim 존중)
   */
  async checkP2Readiness(db) {
    try {
      // Dr. Sarah Kim의 실제 컬렉션 존재 확인만 (침범 금지)
      const testQuery = await db.collection('artist_summary').limit(1).get();
      if (!testQuery.empty) {
        console.log('🎉 P2 Dr. Sarah Kim 컬렉션 감지됨 - 협업 가능');
        return true;
      }
      return false;
    } catch (error) {
      console.log('⏳ P2 컬렉션 대기 중 - 기존 목업 계속 사용');
      return false;
    }
  }
}

module.exports = ExistingMockAdapter;