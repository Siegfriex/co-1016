// AI 캐시 시스템 테스트

import aiCache from '../aiCache';
import { SAMPLE_ARTIST_DATA } from '../../../prompts/phase1Templates';

describe('AICache', () => {
  beforeEach(() => {
    // 테스트 전 캐시 정리
    aiCache.clear();
  });

  describe('generateCacheKey', () => {
    test('동일 데이터에 대해 동일 키 생성', () => {
      const key1 = aiCache.generateCacheKey(SAMPLE_ARTIST_DATA, 1);
      const key2 = aiCache.generateCacheKey(SAMPLE_ARTIST_DATA, 1);
      
      expect(key1).toBe(key2);
      expect(key1).toMatch(/^ai_phase1_/);
    });

    test('다른 Phase에 대해 다른 키 생성', () => {
      const key1 = aiCache.generateCacheKey(SAMPLE_ARTIST_DATA, 1);
      const key2 = aiCache.generateCacheKey(SAMPLE_ARTIST_DATA, 2);
      
      expect(key1).not.toBe(key2);
    });

    test('다른 아티스트 데이터에 대해 다른 키 생성', () => {
      const artistData2 = {
        ...SAMPLE_ARTIST_DATA,
        name: '다른 작가',
        radar5: { ...SAMPLE_ARTIST_DATA.radar5, I: 90 }
      };

      const key1 = aiCache.generateCacheKey(SAMPLE_ARTIST_DATA, 1);
      const key2 = aiCache.generateCacheKey(artistData2, 1);
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('set and get', () => {
    test('캐시 저장 및 조회', () => {
      const key = 'test_key';
      const data = { insights: 'test insights', model: 'gpt-4' };

      aiCache.set(key, data);
      const retrieved = aiCache.get(key);

      expect(retrieved).toEqual(data);
    });

    test('존재하지 않는 키 조회', () => {
      const result = aiCache.get('non_existent_key');
      expect(result).toBeNull();
    });

    test('TTL 초과 시 캐시 만료', () => {
      // TTL을 1ms로 설정하여 테스트
      const originalTTL = aiCache.ttl;
      aiCache.ttl = 1;

      const key = 'test_key';
      const data = { insights: 'test insights' };

      aiCache.set(key, data);
      
      // 2ms 대기
      return new Promise(resolve => {
        setTimeout(() => {
          const result = aiCache.get(key);
          expect(result).toBeNull();
          
          // 원래 TTL 복원
          aiCache.ttl = originalTTL;
          resolve();
        }, 2);
      });
    });
  });

  describe('캐시 관리', () => {
    test('최대 크기 초과 시 LRU 정책', () => {
      const originalMaxSize = aiCache.maxSize;
      aiCache.maxSize = 2; // 테스트용 작은 크기

      aiCache.set('key1', { data: 'data1' });
      aiCache.set('key2', { data: 'data2' });
      aiCache.set('key3', { data: 'data3' }); // key1 제거됨

      expect(aiCache.get('key1')).toBeNull();
      expect(aiCache.get('key2')).toEqual({ data: 'data2' });
      expect(aiCache.get('key3')).toEqual({ data: 'data3' });

      aiCache.maxSize = originalMaxSize;
    });

    test('캐시 삭제', () => {
      const key = 'test_key';
      const data = { insights: 'test' };

      aiCache.set(key, data);
      expect(aiCache.get(key)).toEqual(data);

      const deleted = aiCache.delete(key);
      expect(deleted).toBe(true);
      expect(aiCache.get(key)).toBeNull();

      const deletedAgain = aiCache.delete(key);
      expect(deletedAgain).toBe(false);
    });

    test('캐시 전체 정리', () => {
      aiCache.set('key1', { data: 'data1' });
      aiCache.set('key2', { data: 'data2' });

      expect(aiCache.cache.size).toBe(2);
      
      aiCache.clear();
      
      expect(aiCache.cache.size).toBe(0);
      expect(aiCache.get('key1')).toBeNull();
      expect(aiCache.get('key2')).toBeNull();
    });
  });

  describe('통계 정보', () => {
    test('캐시 통계 조회', () => {
      aiCache.set('key1', { data: 'data1' });
      aiCache.set('key2', { data: 'data2' });

      const stats = aiCache.getStats();

      expect(stats.totalItems).toBe(2);
      expect(stats.maxSize).toBe(aiCache.maxSize);
      expect(stats.ttlMinutes).toBe(aiCache.ttl / 1000 / 60);
      expect(stats.memoryUsageKB).toBeGreaterThan(0);
    });

    test('메모리 사용량 추정', () => {
      const memoryBefore = aiCache.estimateMemoryUsage();
      
      aiCache.set('large_key', { 
        data: 'x'.repeat(1000), 
        moreData: 'y'.repeat(1000) 
      });
      
      const memoryAfter = aiCache.estimateMemoryUsage();
      
      expect(memoryAfter).toBeGreaterThan(memoryBefore);
    });
  });

  describe('만료 정리', () => {
    test('만료된 항목 정리', () => {
      const originalTTL = aiCache.ttl;
      aiCache.ttl = 1;

      aiCache.set('expired_key', { data: 'expired' });
      aiCache.set('valid_key', { data: 'valid' });

      return new Promise(resolve => {
        setTimeout(() => {
          // expired_key만 만료되도록
          aiCache.ttl = originalTTL; // 복원하여 valid_key는 유지
          aiCache.set('valid_key', { data: 'valid' }); // 다시 설정
          
          const cleanedCount = aiCache.cleanup();
          expect(cleanedCount).toBe(1); // expired_key만 정리됨
          
          expect(aiCache.get('expired_key')).toBeNull();
          expect(aiCache.get('valid_key')).toEqual({ data: 'valid' });
          
          resolve();
        }, 2);
      });
    });
  });

  describe('해시 함수', () => {
    test('동일 입력에 동일 해시', () => {
      const input = 'test string';
      const hash1 = aiCache.simpleHash(input);
      const hash2 = aiCache.simpleHash(input);
      
      expect(hash1).toBe(hash2);
    });

    test('다른 입력에 다른 해시', () => {
      const hash1 = aiCache.simpleHash('string1');
      const hash2 = aiCache.simpleHash('string2');
      
      expect(hash1).not.toBe(hash2);
    });

    test('해시는 36진수 문자열', () => {
      const hash = aiCache.simpleHash('test');
      expect(hash).toMatch(/^[0-9a-z]+$/);
    });
  });
});
