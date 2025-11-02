// CuratorOdyssey AI 결과 캐싱 시스템
// 동일한 데이터 재분석 방지로 성능 향상 및 비용 절약

class AICache {
  constructor() {
    this.cache = new Map();
    this.maxSize = parseInt(process.env.REACT_APP_AI_CACHE_SIZE) || 100;
    this.ttl = parseInt(process.env.REACT_APP_AI_CACHE_TTL) || 1800000; // 30분
    
    console.log(`🗄️ AI 캐시 초기화: 최대 ${this.maxSize}개, TTL ${this.ttl/1000/60}분`);
  }

  /**
   * 캐시 키 생성 (아티스트 데이터 해시 기반)
   */
  generateCacheKey(artistData, phase = 1) {
    const dataString = JSON.stringify({
      name: artistData.name,
      radar5: artistData.radar5,
      sunburst_l1: artistData.sunburst_l1
    });
    
    // 간단한 해시 생성 (더 정교한 해시는 crypto-js 라이브러리 사용 가능)
    const hash = this.simpleHash(dataString);
    return `ai_phase${phase}_${hash}`;
  }

  /**
   * 캐시에서 조회
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`🔍 캐시 미스: ${key}`);
      return null;
    }

    // TTL 확인
    if (Date.now() - item.timestamp > this.ttl) {
      console.log(`⏰ 캐시 만료: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ 캐시 히트: ${key}`);
    return item.data;
  }

  /**
   * 캐시에 저장
   */
  set(key, value) {
    // 최대 크기 초과 시 가장 오래된 항목 제거 (LRU)
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      console.log(`🗑️ 캐시 정리: ${oldestKey} 제거`);
    }

    const item = {
      data: value,
      timestamp: Date.now(),
      key: key
    };

    this.cache.set(key, item);
    console.log(`💾 캐시 저장: ${key} (총 ${this.cache.size}개)`);
  }

  /**
   * 특정 키 삭제
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️ 캐시 삭제: ${key}`);
    }
    return deleted;
  }

  /**
   * 캐시 전체 정리
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🧹 캐시 전체 정리: ${size}개 항목 삭제`);
  }

  /**
   * 만료된 캐시 항목 정리
   */
  cleanup() {
    let cleanedCount = 0;
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 만료 캐시 정리: ${cleanedCount}개 항목 삭제`);
    }
    
    return cleanedCount;
  }

  /**
   * 캐시 통계 정보
   */
  getStats() {
    const items = Array.from(this.cache.values());
    const now = Date.now();
    
    const stats = {
      totalItems: this.cache.size,
      maxSize: this.maxSize,
      ttlMinutes: this.ttl / 1000 / 60,
      expiredItems: items.filter(item => now - item.timestamp > this.ttl).length,
      oldestItemAge: items.length > 0 ? 
        Math.max(...items.map(item => now - item.timestamp)) / 1000 / 60 : 0,
      newestItemAge: items.length > 0 ? 
        Math.min(...items.map(item => now - item.timestamp)) / 1000 / 60 : 0,
      memoryUsageKB: this.estimateMemoryUsage()
    };
    
    return stats;
  }

  /**
   * 메모리 사용량 추정
   */
  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, item] of this.cache.entries()) {
      totalSize += key.length * 2; // 유니코드 문자당 2바이트
      totalSize += JSON.stringify(item).length * 2;
    }
    return Math.round(totalSize / 1024); // KB 단위
  }

  /**
   * 간단한 해시 함수 (djb2 알고리즘)
   */
  simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 캐시 히트율 계산용 통계
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
  }

  getHitRate() {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total * 100).toFixed(1) : 0;
  }
}

// 싱글톤 인스턴스 생성
const aiCache = new AICache();

// 주기적인 캐시 정리 (10분마다)
setInterval(() => {
  aiCache.cleanup();
}, 10 * 60 * 1000);

export default aiCache;
