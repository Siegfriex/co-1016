/**
 * CuratorOdyssey Universal Data Adapter
 * P1 Alex Chen - P2 독립성 확보를 위한 3단계 폴백 시스템
 * 
 * 🤝 Dr. Sarah Kim 존중 원칙:
 * 1순위: P2 실제 컬렉션 (is_temporary: false)
 * 2순위: P1 임시 컬렉션 (is_temporary: true)  
 * 3순위: 기존 mockData.js (Firestore 연결 실패 시)
 */

const ExistingMockAdapter = require('./existingMockAdapter');

class UniversalDataAdapter {
  constructor(db) {
    this.db = db;
    this.existingMockAdapter = new ExistingMockAdapter();
    this.dataSourcePriority = ['p2_firestore', 'temp_firestore', 'existing_mock'];
  }

  /**
   * 작가 요약 데이터 가져오기 (3단계 폴백)
   */
  async getArtistSummary(artistId) {
    try {
      // 1순위: P2 Dr. Sarah Kim 실제 컬렉션 확인
      const summaryDoc = await this.db.collection('artist_summary').doc(artistId).get();
      
      if (summaryDoc.exists) {
        const data = summaryDoc.data();
        
        // P2 실제 데이터인지 P1 임시 데이터인지 구분
        if (!data.is_temporary) {
          console.log(`🎉 P2 실제 데이터 사용: ${artistId}`);
          return {
            source: 'p2_firestore',
            data: data,
            collaboration_status: 'p2_active'
          };
        }
        
        // 2순위: P1 임시 컬렉션
        console.log(`⏳ P1 임시 데이터 사용: ${artistId} (P2 대기 중)`);
        return {
          source: 'temp_firestore',
          data: data,
          collaboration_status: 'p2_pending'
        };
      }
    } catch (firestoreError) {
      console.log('⚠️  Firestore 접근 실패, 기존 목업으로 폴백:', firestoreError.message);
    }
    
    // 3순위: 기존 mockData.js (ExistingMockAdapter)
    const mockData = this.existingMockAdapter.getArtistSummary(artistId);
    
    if (mockData) {
      console.log(`✅ 기존 목업 데이터 사용: ${artistId}`);
      return {
        source: 'existing_mock',
        data: mockData,
        collaboration_status: 'p2_pending_firestore_unavailable'
      };
    }
    
    // 모든 폴백 실패
    return null;
  }

  /**
   * 시계열 데이터 가져오기 (3단계 폴백)
   */
  async getTimeseries(artistId, axis) {
    try {
      // 1-2순위: Firestore (P2 실제 + P1 임시)
      const timeseriesQuery = await this.db.collection('timeseries')
        .where('artist_id', '==', artistId)
        .where('axis', '==', axis)
        .limit(1)
        .get();
      
      if (!timeseriesQuery.empty) {
        const data = timeseriesQuery.docs[0].data();
        
        if (!data.is_temporary) {
          console.log(`🎉 P2 실제 시계열: ${artistId} - ${axis}`);
          return {
            source: 'p2_firestore',
            data: data
          };
        }
        
        console.log(`⏳ P1 임시 시계열: ${artistId} - ${axis}`);
        return {
          source: 'temp_firestore',
          data: data
        };
      }
    } catch (error) {
      console.log('⚠️  Firestore 시계열 접근 실패, 목업 폴백:', error.message);
    }
    
    // 3순위: 기존 mockData
    const mockTimeseries = this.existingMockAdapter.getTimeseries(artistId, axis);
    
    if (mockTimeseries) {
      console.log(`✅ 기존 목업 시계열: ${artistId} - ${axis}`);
      return {
        source: 'existing_mock',
        data: mockTimeseries
      };
    }
    
    return null;
  }

  /**
   * 비교 분석 데이터 가져오기 (3단계 폴백)
   */
  async getComparison(artistA, artistB, axis) {
    try {
      const pairId = `${artistA}_vs_${artistB}`;
      
      // 1-2순위: Firestore
      const compareQuery = await this.db.collection('compare_pairs')
        .where('pair_id', '==', pairId)
        .where('axis', '==', axis)
        .limit(1)
        .get();
      
      if (!compareQuery.empty) {
        const data = compareQuery.docs[0].data();
        
        if (!data.is_temporary) {
          console.log(`🎉 P2 실제 비교 분석: ${pairId}`);
          return {
            source: 'p2_firestore',
            data: data
          };
        }
        
        console.log(`⏳ P1 임시 비교 분석: ${pairId}`);
        return {
          source: 'temp_firestore',
          data: data
        };
      }
    } catch (error) {
      console.log('⚠️  Firestore 비교 분석 접근 실패, 목업 폴백:', error.message);
    }
    
    // 3순위: 기존 mockData
    const mockComparison = this.existingMockAdapter.getComparison(artistA, artistB, axis);
    
    if (mockComparison) {
      console.log(`✅ 기존 목업 비교 분석: ${artistA} vs ${artistB}`);
      return {
        source: 'existing_mock',
        data: mockComparison
      };
    }
    
    return null;
  }

  /**
   * P2 협업 상태 확인
   */
  async checkP2CollaborationStatus() {
    try {
      // artist_summary 컬렉션에서 is_temporary가 false인 실제 P2 데이터 확인
      const p2DataQuery = await this.db.collection('artist_summary')
        .where('is_temporary', '==', false)
        .limit(1)
        .get();
      
      if (!p2DataQuery.empty) {
        console.log('🎉 P2 Dr. Sarah Kim 실제 데이터 감지됨!');
        return {
          status: 'active',
          message: 'P2 실제 컬렉션 활성화',
          data_quality: 'production_grade'
        };
      }
      
      // is_temporary가 true인 P1 임시 데이터만 존재
      const tempDataQuery = await this.db.collection('artist_summary')
        .where('is_temporary', '==', true)
        .limit(1)
        .get();
      
      if (!tempDataQuery.empty) {
        console.log('⏳ P1 임시 데이터로 운영 중 (P2 대기)');
        return {
          status: 'pending',
          message: 'P1 임시 컬렉션 사용 중, P2 데이터 대기',
          data_quality: 'temporary'
        };
      }
      
      console.log('⚠️  Firestore 컬렉션 없음, 기존 mockData 사용');
      return {
        status: 'fallback',
        message: '기존 mockData.js 폴백',
        data_quality: 'mock_only'
      };
      
    } catch (error) {
      console.log('⚠️  P2 상태 확인 실패:', error.message);
      return {
        status: 'error',
        message: 'Firestore 접근 불가',
        data_quality: 'unknown'
      };
    }
  }

  /**
   * 사용 가능한 작가 목록
   */
  async getAvailableArtists() {
    try {
      const artistsSnapshot = await this.db.collection('artist_summary').get();
      const firestoreArtists = artistsSnapshot.docs.map(doc => ({
        artist_id: doc.id,
        name: doc.data().name,
        source: doc.data().is_temporary ? 'temp' : 'p2'
      }));
      
      if (firestoreArtists.length > 0) {
        return firestoreArtists;
      }
    } catch (error) {
      console.log('⚠️  Firestore 작가 목록 조회 실패, 목업 폴백');
    }
    
    // 폴백: ExistingMockAdapter
    const mockArtists = this.existingMockAdapter.getAvailableArtists();
    return mockArtists.map(id => ({
      artist_id: id,
      name: '목업 작가',
      source: 'mock'
    }));
  }

  /**
   * 데이터 소스 통계
   */
  async getDataSourceStats() {
    const p2Status = await this.checkP2CollaborationStatus();
    const artists = await this.getAvailableArtists();
    
    const sourceCount = {
      p2: artists.filter(a => a.source === 'p2').length,
      temp: artists.filter(a => a.source === 'temp').length,
      mock: artists.filter(a => a.source === 'mock').length
    };
    
    return {
      collaboration_status: p2Status.status,
      total_artists: artists.length,
      data_sources: sourceCount,
      primary_source: sourceCount.p2 > 0 ? 'p2_firestore' : 
                      sourceCount.temp > 0 ? 'temp_firestore' : 'existing_mock',
      p2_readiness: p2Status.data_quality
    };
  }
}

module.exports = UniversalDataAdapter;


