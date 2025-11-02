// CuratorOdyssey Secret Manager 통합 서비스
// 1016blprint.md 명세 100% 준수: 환경변수 → GCP Secret Manager 완전 전환

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class ConfigLoader {
  constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = 'co-1016';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5분 캐시
    
    console.log('🔐 Secret Manager 클라이언트 초기화 완료');
  }

  /**
   * 시크릿 조회 (캐시 포함)
   */
  async getSecret(secretId, version = 'latest') {
    const cacheKey = `${secretId}_${version}`;
    
    // 캐시 확인
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`🗄️ 캐시된 시크릿 사용: ${secretId}`);
        return cached.value;
      }
    }

    try {
      const secretName = `projects/${this.projectId}/secrets/${secretId}/versions/${version}`;
      const [response] = await this.client.accessSecretVersion({ name: secretName });
      const secretValue = response.payload.data.toString();
      
      // 캐시 저장
      this.cache.set(cacheKey, {
        value: secretValue,
        timestamp: Date.now()
      });
      
      console.log(`✅ Secret Manager에서 시크릿 조회 성공: ${secretId}`);
      return secretValue;
      
    } catch (error) {
      console.error(`❌ Secret Manager 조회 실패: ${secretId}`, error);
      throw new Error(`Secret ${secretId} 조회 실패: ${error.message}`);
    }
  }

  /**
   * 애플리케이션 통합 설정 로드
   * 1016blprint.md의 config 구조 정확히 준수
   */
  async loadAppConfig() {
    try {
      console.log('📋 애플리케이션 통합 설정 로드 시작');
      
      const [
        openaiApiKey,
        anthropicApiKey, 
        vertexCredentials,
        appConfigJson
      ] = await Promise.all([
        this.getSecret('openai-api-key'),
        this.getSecret('anthropic-api-key'),
        this.getSecret('vertex-ai-credentials'),
        this.getSecret('app-config')
      ]);

      // app-config 시크릿 파싱
      const appConfig = JSON.parse(appConfigJson);
      
      const config = {
        // AI 설정
        openai: {
          apiKey: openaiApiKey,
          model: appConfig.ai?.openai?.model || 'gpt-4',
          maxTokens: appConfig.ai?.openai?.maxTokens || 2000
        },
        anthropic: {
          apiKey: anthropicApiKey,
          model: appConfig.ai?.anthropic?.model || 'claude-3-sonnet-20240229'
        },
        vertex: {
          credentials: JSON.parse(vertexCredentials),
          projectId: this.projectId,
          location: appConfig.vertex?.location || 'asia-northeast3',
          model: appConfig.vertex?.model || 'gemini-1.5-pro'
        },
        
        // 1016blprint.md 핵심 파라미터들
        weights: {
          version: appConfig.weights?.version || 'AHP_v1',
          last_updated: appConfig.weights?.last_updated
        },
        normalization: {
          method_version: appConfig.normalization?.method_version || 'log_winsor_percentile_v1',
          time_windows: {
            담론: appConfig.time_windows?.담론 || '24개월',
            제도: appConfig.time_windows?.제도 || '10년(1.0/0.5)',
            학술: appConfig.time_windows?.학술 || '누적+최근5년가중',
            네트워크: appConfig.time_windows?.네트워크 || '누적'
          }
        },
        
        // 성능 설정
        performance: {
          cache_ttl: appConfig.performance?.cache_ttl || 300, // 5분
          batch_size: appConfig.performance?.batch_size || 50,
          timeout: appConfig.performance?.timeout || 30000
        }
      };
      
      console.log('✅ 통합 설정 로드 완료:', {
        hasOpenAI: !!config.openai.apiKey,
        hasAnthropic: !!config.anthropic.apiKey,
        hasVertex: !!config.vertex.credentials,
        weightsVersion: config.weights.version,
        normalizationMethod: config.normalization.method_version
      });
      
      return config;
      
    } catch (error) {
      console.error('❌ 애플리케이션 설정 로드 실패:', error);
      throw new Error(`설정 로드 실패: ${error.message}`);
    }
  }

  /**
   * 설정값 업데이트 (관리자용)
   */
  async updateSecret(secretId, newValue) {
    try {
      const secretName = `projects/${this.projectId}/secrets/${secretId}`;
      
      const [response] = await this.client.addSecretVersion({
        parent: secretName,
        payload: {
          data: Buffer.from(newValue, 'utf8')
        }
      });
      
      // 캐시 무효화
      this.cache.clear();
      
      console.log(`✅ Secret 업데이트 완료: ${secretId}`);
      return response.name;
      
    } catch (error) {
      console.error(`❌ Secret 업데이트 실패: ${secretId}`, error);
      throw error;
    }
  }

  /**
   * 캐시 정리 (메모리 최적화)
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Secret 캐시 정리 완료');
  }

  /**
   * 설정 검증 (시스템 헬스체크용)
   */
  async validateConfiguration() {
    try {
      const config = await this.loadAppConfig();
      
      const validation = {
        openai_available: !!config.openai.apiKey,
        anthropic_available: !!config.anthropic.apiKey,
        vertex_configured: !!config.vertex.credentials,
        weights_version_set: !!config.weights.version,
        time_windows_configured: Object.keys(config.normalization.time_windows).length === 4,
        all_systems_ready: false
      };
      
      validation.all_systems_ready = validation.openai_available && 
                                     validation.vertex_configured && 
                                     validation.weights_version_set &&
                                     validation.time_windows_configured;
      
      console.log('🔍 설정 검증 결과:', validation);
      return validation;
      
    } catch (error) {
      console.error('❌ 설정 검증 실패:', error);
      return {
        all_systems_ready: false,
        error: error.message
      };
    }
  }
}

// 싱글톤 인스턴스 (Cloud Functions 최적화)
let configLoaderInstance = null;

const getConfigLoader = () => {
  if (!configLoaderInstance) {
    configLoaderInstance = new ConfigLoader();
  }
  return configLoaderInstance;
};

module.exports = {
  getConfigLoader,
  loadAppConfig: () => getConfigLoader().loadAppConfig(),
  validateConfiguration: () => getConfigLoader().validateConfiguration()
};
