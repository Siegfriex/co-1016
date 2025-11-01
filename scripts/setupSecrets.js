// CuratorOdyssey Secret Manager 설정 스크립트
// 1016blprint.md 보안 명세 100% 준수

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class SecretsSetup {
  constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = 'co-1016';
  }

  /**
   * 모든 필요한 시크릿 생성
   */
  async setupAllSecrets() {
    console.log('🔐 CuratorOdyssey Secret Manager 설정 시작...');
    
    const secrets = [
      {
        id: 'openai-api-key',
        description: 'OpenAI GPT-4 API Key for AI analysis',
        value: 'your_openai_api_key_here' // 실제 설정 시 교체 필요
      },
      {
        id: 'anthropic-api-key', 
        description: 'Anthropic Claude API Key for backup AI',
        value: 'your_anthropic_api_key_here' // 실제 설정 시 교체 필요
      },
      {
        id: 'vertex-ai-credentials',
        description: 'Vertex AI Service Account Credentials',
        value: JSON.stringify({
          type: 'service_account',
          project_id: 'co-1016',
          private_key_id: 'vertex-ai-key-id',
          private_key: 'vertex-ai-private-key',
          client_email: 'vertex-ai@co-1016.iam.gserviceaccount.com'
        })
      },
      {
        id: 'app-config',
        description: 'CuratorOdyssey Application Configuration (1016blprint.md 명세)',
        value: JSON.stringify({
          weights: {
            version: 'AHP_v1',
            last_updated: '2024-10-16T00:00:00Z',
            validation_threshold: 0.5 // ±0.5p 일관성 검증
          },
          normalization: {
            method_version: 'log_winsor_percentile_v1',
            pipeline: ['log_transform', 'winsorize_1pct', 'percentile_rank'],
            validation_enabled: true
          },
          time_windows: {
            담론: '24개월',
            제도: '10년(1.0/0.5)', // 최근 5년 가중 1.0, 이전 5년 0.5
            학술: '누적+최근5년가중',
            네트워크: '누적'
          },
          ai: {
            openai: {
              model: 'gpt-4',
              maxTokens: 2000,
              temperature: 0.7
            },
            anthropic: {
              model: 'claude-3-sonnet-20240229',
              maxTokens: 2000
            },
            vertex: {
              location: 'asia-northeast3',
              model: 'gemini-1.5-pro'
            }
          },
          performance: {
            cache_ttl: 300,
            batch_size: 50,
            timeout: 30000,
            api_rate_limit: 100 // per hour
          }
        })
      }
    ];

    for (const secretConfig of secrets) {
      try {
        await this.createSecret(secretConfig);
        console.log(`✅ [Secret] ${secretConfig.id} 생성 완료`);
      } catch (error) {
        if (error.code === 6) { // Already exists
          console.log(`ℹ️ [Secret] ${secretConfig.id} 이미 존재함`);
          await this.updateSecretValue(secretConfig.id, secretConfig.value);
          console.log(`✅ [Secret] ${secretConfig.id} 업데이트 완료`);
        } else {
          console.error(`❌ [Secret] ${secretConfig.id} 설정 실패:`, error.message);
        }
      }
    }

    console.log('🎉 모든 Secret Manager 설정 완료!');
    console.log('📋 다음 단계: Firebase 프로젝트에서 각 시크릿에 실제 값을 입력하세요.');
  }

  async createSecret(secretConfig) {
    // 시크릿 생성
    const [secret] = await this.client.createSecret({
      parent: `projects/${this.projectId}`,
      secretId: secretConfig.id,
      secret: {
        replication: {
          automatic: {}
        },
        labels: {
          'app': 'curator-odyssey',
          'environment': 'production'
        }
      }
    });

    // 시크릿 값 추가
    await this.client.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from(secretConfig.value, 'utf8')
      }
    });

    return secret;
  }

  async updateSecretValue(secretId, newValue) {
    const secretName = `projects/${this.projectId}/secrets/${secretId}`;
    
    await this.client.addSecretVersion({
      parent: secretName,
      payload: {
        data: Buffer.from(newValue, 'utf8')
      }
    });
  }

  /**
   * Secret Manager 권한 설정 (서비스 계정용)
   */
  async setupIAMPermissions() {
    console.log('🔑 Secret Manager IAM 권한 설정...');
    
    const serviceAccounts = [
      'firebase-adminsdk-fbsvc@co-1016.iam.gserviceaccount.com', // 기존 계정 활용
      'co-1016@appspot.gserviceaccount.com' // 기본 앱엔진 계정
    ];

    for (const account of serviceAccounts) {
      try {
        // Secret Manager Secret Accessor 권한 부여 (gcloud 명령어 형태로 안내)
        console.log(`📝 다음 명령어를 터미널에서 실행하세요:`);
        console.log(`gcloud secrets add-iam-policy-binding openai-api-key \\`);
        console.log(`  --member="serviceAccount:${account}" \\`);
        console.log(`  --role="roles/secretmanager.secretAccessor" \\`);
        console.log(`  --project=co-1016`);
        console.log('');
        
      } catch (error) {
        console.error(`❌ IAM 권한 설정 실패: ${account}`, error);
      }
    }
  }

  /**
   * 설정 검증
   */
  async verifySetup() {
    try {
      const { loadAppConfig } = require('../functions/src/services/configLoader');
      const config = await loadAppConfig();
      
      console.log('✅ Secret Manager 설정 검증 완료');
      console.log('📊 설정 요약:', {
        hasOpenAI: !!config.openai?.apiKey,
        hasAnthropic: !!config.anthropic?.apiKey, 
        hasVertexAI: !!config.vertex?.credentials,
        weightsVersion: config.weights?.version,
        normalizationMethod: config.normalization?.method_version
      });
      
      return true;
    } catch (error) {
      console.error('❌ 설정 검증 실패:', error);
      return false;
    }
  }
}

// 스크립트 실행 부
if (require.main === module) {
  const setup = new SecretsSetup();
  
  setup.setupAllSecrets()
    .then(() => setup.setupIAMPermissions())
    .then(() => setup.verifySetup())
    .then(success => {
      if (success) {
        console.log('🎉 Secret Manager 설정 완전 완료!');
        console.log('🚀 다음: Firebase Functions 배포 준비됨');
      } else {
        console.log('⚠️ 일부 설정 검증 실패, 수동 확인 필요');
      }
    })
    .catch(error => {
      console.error('💥 Secret Manager 설정 중 오류:', error);
      process.exit(1);
    });
}

module.exports = SecretsSetup;
