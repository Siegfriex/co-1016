/**
 * CuratorOdyssey Firestore Schema Design Guide
 * Dr. Sarah Kim's Expert Database Architecture Design
 * 
 * 1016blprint.md Table 6.1 명세 100% 준수 + 시계열 분석 전문성 융합
 * P1이 바로 구현할 수 있는 완벽한 설계서
 */

// =====================================================
// 📊 핵심 원천 데이터 컬렉션 (9개) - 1016blprint.md 명세 정확 준수
// =====================================================

export const CORE_SOURCE_COLLECTIONS = {
  // 1. entities - 작가, 기관 등 모든 엔터티의 마스터 정보
  entities: {
    collection_name: 'entities',
    primary_key: 'entity_id',
    description: '작가, 기관 등 모든 엔터티의 마스터 정보',
    
    schema: {
      entity_id: {
        type: 'string',
        format: 'ARTIST_0005 | INSTITUTION_001 | CURATOR_001',
        required: true,
        description: '엔터티 고유 식별자'
      },
      identity_type: {
        type: 'string',
        enum: ['artist', 'institution', 'gallery', 'curator', 'collector'],
        required: true,
        description: '엔터티 유형'
      },
      names_ko: {
        type: 'array',
        items: { type: 'string' },
        example: ['양혜규', '양혜규 작가'],
        description: '한국어 이름 (모든 변형 포함)'
      },
      names_en: {
        type: 'array', 
        items: { type: 'string' },
        example: ['Haegue Yang', 'Yang Haegue'],
        description: '영어 이름 (모든 변형 포함)'
      },
      alias: {
        type: 'array',
        items: { type: 'string' },
        example: ['하이거 양', 'H.Yang'],
        description: '별칭 및 약어'
      },
      external_ids: {
        type: 'object',
        properties: {
          viaf: { type: 'string', description: 'VIAF 식별자' },
          ulan: { type: 'string', description: 'Getty ULAN 식별자' },
          wikidata: { type: 'string', description: 'Wikidata Q-ID' },
          artnet: { type: 'string', description: 'Artnet 아티스트 ID' }
        },
        description: '외부 시스템 식별자'
      },
      debut_year: {
        type: 'integer',
        minimum: 1950,
        maximum: 2030,
        required: true,
        description: '데뷔년도 (시계열 분석 기준점)'
      },
      career_status: {
        type: 'string',
        enum: ['active', 'inactive', 'deceased'],
        default: 'active',
        description: '활동 상태'
      },
      metadata: {
        type: 'object',
        properties: {
          created_at: { type: 'timestamp' },
          updated_at: { type: 'timestamp' },
          data_quality_score: { type: 'number', minimum: 0, maximum: 1 },
          source_priority: { type: 'integer', minimum: 1, maximum: 5 }
        }
      }
    },
    
    // Dr. Sarah Kim's 시계열 최적화 인덱싱 전략
    indexes: [
      // MEDIUM 우선순위: 활성 아티스트 목록 조회 (fnBatchComparePairs 사용)
      { fields: ['identity_type', 'career_status'], type: 'composite', priority: 'MEDIUM', status: '✅ 배포됨' },
      // 단일 필드 인덱스 (Firestore 자동 생성)
      { fields: ['entity_type', 'debut_year'], type: 'composite', note: '자동 생성됨' },
      { fields: ['names_ko'], type: 'array_contains', note: '자동 생성됨' },
      { fields: ['names_en'], type: 'array_contains', note: '자동 생성됨' },
      { fields: ['external_ids.viaf'], type: 'simple', note: '자동 생성됨' },
      { fields: ['career_status', 'debut_year'], type: 'composite', note: '자동 생성됨' }
    ],
    
    // 시계열 분석 성능 최적화
    dr_sarah_optimizations: {
      partitioning_strategy: 'entity_type별 논리적 분할로 쿼리 성능 최적화',
      debut_year_indexing: 'Phase 2 시계열 분석 시 빠른 데뷔년 기준 필터링',
      full_text_search: 'names_ko/names_en 배열 검색으로 작가명 다변화 대응'
    }
  },

  // 2. events - 전시, 수상 등 모든 발생 이벤트 원본
  events: {
    collection_name: 'events',
    primary_key: 'event_id',
    description: '전시, 수상 등 모든 발생 이벤트 원본',
    
    schema: {
      event_id: {
        type: 'string',
        format: 'yyyy-mm-dd+org+title 형식',
        example: '2019-03-15+TATE+HAEGUE_YANG_SOLO',
        required: true,
        description: '이벤트 고유 식별자'
      },
      title: {
        type: 'string',
        required: true,
        example: 'Haegue Yang: ETA 1994-2018',
        description: '이벤트 제목'
      },
      org: {
        type: 'string',
        required: true,
        example: 'Tate St Ives',
        description: '주최 기관명'
      },
      start_date: {
        type: 'date',
        required: true,
        description: '시작일'
      },
      end_date: {
        type: 'date',
        required: false,
        description: '종료일'
      },
      venue_id: {
        type: 'string',
        example: 'VENUE_TATE_ST_IVES',
        description: '장소 식별자 (entities 컬렉션 참조)'
      },
      type: {
        type: 'string',
        enum: ['exhibition', 'award', 'publication', 'collaboration', 'fair', 'residency'],
        required: true,
        description: '이벤트 유형'
      },
      entity_participants: {
        type: 'array',
        items: { type: 'string' },
        example: ['ARTIST_0005', 'CURATOR_001'],
        description: '참여 엔터티 ID 목록'
      },
      tier: {
        type: 'string',
        enum: ['S', 'A', 'B', 'C'],
        description: '기관/이벤트 등급 (제도축 가중치용)'
      },
      geographical_scope: {
        type: 'string',
        enum: ['local', 'national', 'regional', 'international'],
        description: '지리적 범위'
      }
    },
    
    indexes: [
      // MEDIUM 우선순위: 특정 작가의 이벤트 시간순 조회 (최신순)
      { fields: ['entity_participants', 'start_date'], type: 'composite', order: 'desc', priority: 'MEDIUM', status: '✅ 배포됨' },
      // MEDIUM 우선순위: 특정 작가의 이벤트 범위 조회 (timeWindowRules.js 사용)
      { fields: ['entity_participants', 'start_date'], type: 'composite', order: 'asc', priority: 'MEDIUM', status: '✅ 배포됨' },
      // 단일 필드 인덱스 (Firestore 자동 생성)
      { fields: ['start_date'], type: 'simple', note: '자동 생성됨' },
      { fields: ['entity_participants'], type: 'array_contains', note: '자동 생성됨' },
      { fields: ['type', 'start_date'], type: 'composite', note: '자동 생성됨' },
      { fields: ['org', 'type'], type: 'composite', note: '자동 생성됨' },
      { fields: ['tier', 'start_date'], type: 'composite', note: '자동 생성됨' }
    ],
    
    dr_sarah_optimizations: {
      temporal_indexing: 'start_date 기준 시간창 쿼리 최적화',
      entity_filtering: 'array_contains로 특정 아티스트 이벤트 빠른 조회',
      tier_based_weighting: '제도축 계산 시 tier별 가중치 적용 최적화'
    }
  },

  // 3. measures - 이벤트로부터 추출된 개별 측정값 (분석의 원자 단위)
  measures: {
    collection_name: 'measures',
    primary_key: 'measure_id', 
    description: '이벤트로부터 추출된 개별 측정값',
    
    schema: {
      measure_id: {
        type: 'string',
        format: 'M_{entity_id}_{axis}_{sequence}',
        example: 'M_ARTIST_0005_INST_001',
        required: true,
        description: '측정값 고유 식별자'
      },
      entity_id: {
        type: 'string',
        required: true,
        index: true,
        description: '대상 엔터티 ID'
      },
      axis: {
        type: 'string',
        enum: ['제도', '학술', '담론', '네트워크'],
        required: true,
        index: true,
        description: '분석 축 (4축 체계)'
      },
      metric_code: {
        type: 'string',
        example: 'EXH_FREQ_TIER_S',
        required: true,
        description: '지표 코드 (codebook 참조)'
      },
      value_raw: {
        type: 'number',
        required: true,
        description: '원시 측정값 (정규화 이전)'
      },
      value_normalized: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: '정규화된 값 (배치 파이프라인 결과)'
      },
      source_id: {
        type: 'string',
        required: true,
        description: '데이터 출처 식별자'
      },
      priority: {
        type: 'integer',
        minimum: 1,
        maximum: 5,
        required: true,
        description: '출처 우선순위 (1=최고)'
      },
      capture_hash: {
        type: 'string',
        pattern: '^sha256:[a-f0-9]{64}$',
        description: '데이터 무결성 해시'
      },
      time_window: {
        type: 'string',
        example: '2019-2024',
        description: '측정 대상 기간'
      },
      
      // Dr. Sarah Kim의 정규화 전문성 반영
      normalization_metadata: {
        type: 'object',
        properties: {
          method_version: { type: 'string', example: 'AHP_v1' },
          pipeline_steps: { 
            type: 'array', 
            items: { type: 'string' },
            example: ['log_transform', 'winsorize_1pct', 'percentile_rank']
          },
          quality_score: { type: 'number', minimum: 0, maximum: 1 },
          outlier_treatment: { type: 'string', enum: ['none', 'winsorized', 'removed'] },
          statistical_validation: {
            type: 'object',
            properties: {
              distribution_test: { type: 'string' },
              normality_p_value: { type: 'number' },
              outlier_count: { type: 'integer' }
            }
          }
        }
      }
    },
    
    indexes: [
      // HIGH 우선순위: 축별 집계 쿼리 최적화
      { fields: ['entity_id', 'axis'], type: 'composite', priority: 'HIGH', status: '✅ 배포됨' },
      // HIGH 우선순위: 시계열 집계 쿼리 (fnBatchTimeseries 필수)
      { fields: ['entity_id', 'axis', 'time_window'], type: 'composite', priority: 'HIGH', status: '✅ 배포됨' },
      // HIGH 우선순위: 정규화된 값 기준 시계열 조회
      { fields: ['entity_id', 'axis', 'value_normalized', 'time_window'], type: 'composite', priority: 'HIGH', status: '✅ 배포됨' },
      // MEDIUM 우선순위: 특정 축/지표 조회
      { fields: ['entity_id', 'axis', 'metric_code'], type: 'composite', priority: 'MEDIUM', status: '✅ 배포됨' },
      // LOW 우선순위: 출처별 우선순위 조회
      { fields: ['source_id', 'priority'], type: 'composite', priority: 'LOW', status: '✅ 배포됨' },
      // 단일 필드 인덱스 (Firestore 자동 생성)
      { fields: ['metric_code'], type: 'simple', note: '자동 생성됨' },
      { fields: ['value_normalized'], type: 'simple', note: '자동 생성됨 (명시적으로 요구되면 추가)' }
    ],
    
    dr_sarah_optimizations: {
      high_performance_aggregation: 'entity_id + axis 복합 인덱스로 축별 집계 최적화',
      temporal_filtering: 'time_window 인덱스로 시간창 규칙 적용 고속화',
      quality_tracking: 'normalization_metadata로 정규화 품질 실시간 추적'
    }
  },

  // 4. axis_map - 이벤트의 축 귀속 규칙 (중복 방지 핵심)
  axis_map: {
    collection_name: 'axis_map',
    primary_key: 'map_id',
    description: '이벤트의 축 귀속 규칙',
    
    schema: {
      map_id: {
        type: 'string',
        format: 'MAP_{sequence}',
        example: 'MAP_001',
        required: true
      },
      event_id: {
        type: 'string',
        required: true,
        index: true,
        description: 'events 컬렉션 참조'
      },
      axis_assignment: {
        type: 'string',
        enum: ['제도', '학술', '담론', '네트워크'],
        required: true,
        description: '배정된 축'
      },
      duplicate_rule: {
        type: 'string',
        enum: ['최근_빈도_우선', '누적_이력_우선', '기관_등급_우선'],
        required: true,
        description: '중복 시 해결 규칙'
      },
      weight_factor: {
        type: 'number',
        minimum: 0,
        maximum: 2.0,
        default: 1.0,
        description: '가중치 계수'
      },
      reasoning: {
        type: 'string',
        description: '귀속 근거 (추적성 보장)'
      },
      
      // Dr. Sarah Kim의 귀속 전문성 
      assignment_metadata: {
        type: 'object',
        properties: {
          confidence_score: { type: 'number', minimum: 0, maximum: 1 },
          alternative_axes: { 
            type: 'array',
            items: { type: 'string' },
            description: '가능한 대안 축들'
          },
          decision_factors: {
            type: 'array',
            items: { type: 'string' },
            description: '결정 요인들'
          }
        }
      }
    },
    
    indexes: [
      { fields: ['event_id'], type: 'simple' },
      { fields: ['axis_assignment'], type: 'simple' },
      { fields: ['duplicate_rule', 'axis_assignment'], type: 'composite' }
    ]
  },

  // 5. edges - 엔터티 간의 관계(네트워크) 정보
  edges: {
    collection_name: 'edges',
    primary_key: 'edge_id',
    description: '엔터티 간의 관계 정보',
    
    schema: {
      edge_id: {
        type: 'string',
        format: 'EDGE_{sequence}',
        example: 'EDGE_001',
        required: true
      },
      src_id: {
        type: 'string',
        required: true,
        index: true,
        description: '관계 시작 엔터티 ID'
      },
      dst_id: {
        type: 'string', 
        required: true,
        index: true,
        description: '관계 대상 엔터티 ID'
      },
      relation_type: {
        type: 'string',
        enum: ['collaboration', 'representation', 'mentorship', 'exhibition', 'collection'],
        required: true,
        description: '관계 유형'
      },
      event_id: {
        type: 'string',
        description: '관계 발생 이벤트 ID'
      },
      weight: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        required: true,
        description: '관계 강도 (네트워크 분석용)'
      },
      start_date: {
        type: 'date',
        description: '관계 시작일'
      },
      end_date: {
        type: 'date',
        description: '관계 종료일 (null = 진행중)'
      },
      
      // Dr. Sarah Kim의 네트워크 분석 전문성
      network_metadata: {
        type: 'object',
        properties: {
          betweenness_centrality: { type: 'number' },
          closeness_centrality: { type: 'number' },
          eigenvector_centrality: { type: 'number' },
          influence_score: { type: 'number', minimum: 0, maximum: 1 }
        }
      }
    },
    
    indexes: [
      // MEDIUM 우선순위: 관계 네트워크 조회 (weight DESC)
      { fields: ['src_id', 'relation_type', 'weight'], type: 'composite', order: 'desc', priority: 'MEDIUM', status: '✅ 배포됨' },
      // 단일 필드 인덱스 (Firestore 자동 생성)
      { fields: ['src_id', 'dst_id'], type: 'composite', note: '자동 생성됨' },
      { fields: ['relation_type'], type: 'simple', note: '자동 생성됨' },
      { fields: ['event_id'], type: 'simple', note: '자동 생성됨' },
      { fields: ['src_id', 'relation_type'], type: 'composite', note: '자동 생성됨' },
      { fields: ['weight'], type: 'simple', order: 'desc', note: '자동 생성됨' }
    ]
  },

  // 6. sources - 모든 데이터의 출처 정보
  sources: {
    collection_name: 'sources',
    primary_key: 'source_id',
    description: '모든 데이터의 출처 정보',
    
    schema: {
      source_id: {
        type: 'string',
        format: 'SRC_{org}_{year}',
        example: 'SRC_MOMA_2020',
        required: true
      },
      source_url: {
        type: 'string',
        format: 'url',
        required: true,
        description: '원본 URL'
      },
      priority: {
        type: 'integer',
        minimum: 1,
        maximum: 5,
        required: true,
        description: '출처 우선순위 (1=공식문서, 5=2차자료)'
      },
      capture_hash: {
        type: 'string',
        pattern: '^sha256:[a-f0-9]{64}$',
        required: true,
        description: '캡처 시점 데이터 해시'
      },
      captured_at: {
        type: 'timestamp',
        required: true,
        description: '캡처 시간'
      },
      source_type: {
        type: 'string',
        enum: ['official_website', 'press_release', 'news_article', 'academic_paper', 'social_media'],
        required: true
      },
      language: {
        type: 'string',
        enum: ['ko', 'en', 'multi'],
        required: true
      },
      
      // Dr. Sarah Kim의 데이터 품질 관리
      quality_assessment: {
        type: 'object',
        properties: {
          completeness_score: { type: 'number', minimum: 0, maximum: 1 },
          accuracy_score: { type: 'number', minimum: 0, maximum: 1 },
          timeliness_score: { type: 'number', minimum: 0, maximum: 1 },
          consistency_check: { type: 'boolean' }
        }
      }
    },
    
    indexes: [
      { fields: ['priority'], type: 'simple' },
      { fields: ['captured_at'], type: 'simple', order: 'desc' },
      { fields: ['source_type', 'priority'], type: 'composite' }
    ]
  },

  // 7. codebook - 모든 지표의 정의 및 처리 규칙
  codebook: {
    collection_name: 'codebook',
    primary_key: 'metric_code',
    description: '모든 지표의 정의 및 처리 규칙',
    
    schema: {
      metric_code: {
        type: 'string',
        example: 'EXH_FREQ_TIER_S',
        required: true,
        description: '지표 코드'
      },
      axis: {
        type: 'string',
        enum: ['제도', '학술', '담론', '네트워크'],
        required: true,
        description: '소속 축'
      },
      definition: {
        type: 'string',
        required: true,
        description: '지표 정의 (한국어)'
      },
      definition_en: {
        type: 'string',
        description: '지표 정의 (영어)'
      },
      unit: {
        type: 'string',
        enum: ['count', 'frequency', 'score', 'ratio', 'binary'],
        required: true,
        description: '측정 단위'
      },
      time_window_default: {
        type: 'string',
        example: '10y(1.0/0.5)',
        required: true,
        description: '기본 시간창 및 가중치'
      },
      normalization: {
        type: 'string',
        enum: ['log_winsor_percentile', 'linear_scale', 'z_score', 'none'],
        required: true,
        description: '정규화 방법'
      },
      
      // Dr. Sarah Kim의 지표 설계 전문성
      statistical_properties: {
        type: 'object',
        properties: {
          expected_distribution: { type: 'string', enum: ['normal', 'lognormal', 'poisson', 'exponential'] },
          typical_range: { type: 'object', properties: { min: 'number', max: 'number' } },
          seasonality: { type: 'boolean' },
          correlation_with: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    
    indexes: [
      { fields: ['axis'], type: 'simple' },
      { fields: ['normalization'], type: 'simple' },
      { fields: ['axis', 'unit'], type: 'composite' }
    ]
  },

  // 8. weights - 지표별 가중치와 버전 정보
  weights: {
    collection_name: 'weights',
    primary_key: 'weight_id',
    description: '지표별 가중치와 버전 정보',
    
    schema: {
      weight_id: {
        type: 'string',
        format: 'W_{version}_{axis}_{metric}',
        example: 'W_AHP_v1_INST_EXH_FREQ_TIER_S',
        required: true
      },
      axis: {
        type: 'string',
        enum: ['제도', '학술', '담론', '네트워크'],
        required: true
      },
      metric_code: {
        type: 'string',
        required: true,
        description: 'codebook 참조'
      },
      value: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        required: true,
        description: '가중치 값 (정규화된)'
      },
      version: {
        type: 'string',
        example: 'AHP_v1',
        required: true,
        description: '가중치 버전 (추적성)'
      },
      effective_date: {
        type: 'date',
        required: true,
        description: '적용 시작일'
      },
      
      // Dr. Sarah Kim의 가중치 최적화 전문성
      optimization_metadata: {
        type: 'object',
        properties: {
          ahp_consistency_ratio: { type: 'number', maximum: 0.1 },
          expert_consensus_score: { type: 'number', minimum: 0, maximum: 1 },
          validation_method: { type: 'string' },
          last_calibrated: { type: 'timestamp' }
        }
      }
    },
    
    indexes: [
      { fields: ['version', 'axis'], type: 'composite' },
      { fields: ['effective_date'], type: 'simple', order: 'desc' },
      { fields: ['metric_code', 'version'], type: 'composite' }
    ]
  },

  // 9. snapshots - 과거 분석 결과 재현을 위한 데이터 덤프
  snapshots: {
    collection_name: 'snapshots',
    primary_key: 'snapshot_id',
    description: '과거 분석 결과 재현을 위한 데이터 덤프',
    
    schema: {
      snapshot_id: {
        type: 'string',
        format: 'SNAP_{scope}_{period}_{version}',
        example: 'SNAP_ARTIST_0005_2024Q3_AHP_v1',
        required: true
      },
      scope: {
        type: 'string',
        enum: ['single_artist', 'artist_cohort', 'full_system'],
        required: true,
        description: '스냅샷 범위'
      },
      period: {
        type: 'string',
        example: '2024Q3',
        required: true,
        description: '분석 기간'
      },
      file_uri: {
        type: 'string',
        example: 'gs://co-1016-snapshots/2024Q3/artist_0005.json',
        required: true,
        description: 'Cloud Storage 파일 경로'
      },
      checksum: {
        type: 'string',
        pattern: '^sha256:[a-f0-9]{64}$',
        required: true,
        description: '스냅샷 무결성 체크섬'
      },
      metadata: {
        type: 'object',
        properties: {
          weights_version: { type: 'string' },
          normalization_version: { type: 'string' },
          entity_count: { type: 'integer' },
          measures_count: { type: 'integer' },
          file_size_bytes: { type: 'integer' }
        }
      }
    },
    
    indexes: [
      { fields: ['scope', 'period'], type: 'composite' },
      { fields: ['period'], type: 'simple', order: 'desc' }
    ]
  }
};

// =====================================================
// 📈 서빙 최적화 컬렉션 (3개) - Phase 1-3 API 고속 서빙
// =====================================================

export const SERVING_OPTIMIZED_COLLECTIONS = {
  // 10. artist_summary - Phase 1 즉시 서빙용 사전 계산 데이터
  artist_summary: {
    collection_name: 'artist_summary',
    primary_key: 'artist_id',
    description: 'Phase 1 즉시 서빙용 사전 계산 데이터',
    api_endpoint: 'GET /api/artist/:id/summary',
    
    schema: {
      artist_id: {
        type: 'string',
        required: true,
        description: 'entities 컬렉션 참조'
      },
      
      // Phase 1 레이더 차트 (5축 요약)
      radar5: {
        type: 'object',
        required: true,
        properties: {
          I: { type: 'number', minimum: 0, maximum: 100, description: 'Institution (기관전시)' },
          F: { type: 'number', minimum: 0, maximum: 100, description: 'Fair (페어)' },
          A: { type: 'number', minimum: 0, maximum: 100, description: 'Award (시상)' },
          M: { type: 'number', minimum: 0, maximum: 100, description: 'Media (미디어)' },
          Sedu: { type: 'number', minimum: 0, maximum: 100, description: 'Seduction (교육)' }
        }
      },
      
      // Phase 1 선버스트 차트 (4축 근거)  
      sunburst_l1: {
        type: 'object',
        required: true,
        properties: {
          제도: { type: 'number', minimum: 0, maximum: 100 },
          학술: { type: 'number', minimum: 0, maximum: 100 },
          담론: { type: 'number', minimum: 0, maximum: 100 },
          네트워크: { type: 'number', minimum: 0, maximum: 100 }
        }
      },
      
      weights_version: {
        type: 'string',
        required: true,
        example: 'AHP_v1',
        description: '사용된 가중치 버전'
      },
      normalization_method: {
        type: 'string',
        required: true,
        example: 'log→winsor→percentile',
        description: '정규화 방법'
      },
      updated_at: {
        type: 'timestamp',
        required: true,
        description: '마지막 계산 시점'
      },
      
      // Dr. Sarah Kim의 품질 보증 메타데이터
      quality_metadata: {
        type: 'object',
        properties: {
          data_quality_score: { type: 'number', minimum: 0, maximum: 1 },
          consistency_validation: {
            type: 'object',
            properties: {
              radar_sunburst_diff: { type: 'number', description: '±0.5p 검증 결과' },
              is_consistent: { type: 'boolean' },
              last_validated: { type: 'timestamp' }
            }
          },
          source_reliability: { type: 'number', minimum: 0, maximum: 1 }
        }
      }
    },
    
    indexes: [
      // 주의: is_temporary는 단일 필드 인덱스로 Firestore가 자동 생성하므로 명시하지 않음
      // { fields: ['is_temporary'], type: 'composite', priority: 'MEDIUM', status: '✅ 배포됨' },
      // MEDIUM 우선순위: 최신 요약 데이터 조회 (IA 문서 명시)
      { fields: ['artist_id', 'updated_at'], type: 'composite', order: 'desc', priority: 'MEDIUM', status: '✅ 배포됨' },
      // 단일 필드 인덱스 (Firestore 자동 생성)
      { fields: ['updated_at'], type: 'simple', order: 'desc', note: '자동 생성됨' },
      { fields: ['weights_version'], type: 'simple', note: '자동 생성됨' }
    ],
    
    dr_sarah_optimizations: {
      real_time_serving: '사전 계산으로 < 100ms API 응답 보장',
      consistency_validation: '±0.5p 검증을 메타데이터로 추적',
      cache_strategy: 'Firebase 캐싱 + CDN으로 글로벌 배포'
    }
  },

  // 11. timeseries - Phase 2/3 시계열 분석 사전 계산
  timeseries: {
    collection_name: 'timeseries',
    primary_key: 'timeseries_id',
    description: 'Phase 2/3 시계열 분석 사전 계산',
    api_endpoint: 'GET /api/artist/:id/timeseries/:axis',
    
    schema: {
      timeseries_id: {
        type: 'string',
        format: '{artist_id}_{axis}',
        example: 'ARTIST_0005_제도',
        required: true
      },
      artist_id: {
        type: 'string',
        required: true,
        index: true
      },
      axis: {
        type: 'string',
        enum: ['제도', '학술', '담론', '네트워크'],
        required: true,
        index: true
      },
      
      // Dr. Sarah Kim의 시계열 데이터 구조 (Phase 2 핵심)
      bins: {
        type: 'array',
        required: true,
        items: {
          type: 'object',
          properties: {
            t: { type: 'number', description: '데뷔년 기준 상대 시간' },
            v: { type: 'number', description: '축별 누적 점수' },
            events: { 
              type: 'array', 
              items: { type: 'string' },
              description: '해당 시점 이벤트 ID들'
            },
            growth_rate: { type: 'number', description: '성장률 (전년 대비)' },
            volatility: { type: 'number', description: '변동성 지수' }
          }
        },
        description: '시계열 데이터 포인트 배열'
      },
      
      version: {
        type: 'string',
        required: true,
        example: 'AHP_v1'
      },
      time_window_applied: {
        type: 'string',
        required: true,
        example: '10y(1.0/0.5)',
        description: '적용된 시간창 규칙'
      },
      last_calculated: {
        type: 'timestamp',
        required: true
      },
      
      // Dr. Sarah Kim의 고급 시계열 분석 메타데이터
      analysis_metadata: {
        type: 'object',
        properties: {
          pattern_type: { 
            type: 'string', 
            enum: ['linear', 'exponential', 'logarithmic', 'sigmoid', 'cyclical', 'volatile']
          },
          inflection_points: { 
            type: 'array',
            items: { type: 'number' },
            description: 'Cubic Spline 감지된 변곡점들'
          },
          growth_characteristics: {
            type: 'object',
            properties: {
              average_growth_rate: { type: 'number' },
              growth_acceleration: { type: 'number' },
              volatility_score: { type: 'number' },
              predictability_score: { type: 'number' }
            }
          },
          quality_indicators: {
            type: 'object',
            properties: {
              data_completeness: { type: 'number', minimum: 0, maximum: 1 },
              interpolation_applied: { type: 'boolean' },
              outlier_treatment: { type: 'string' }
            }
          }
        }
      }
    },
    
    indexes: [
      // HIGH 우선순위: 특정 작가의 특정 축 시계열 조회
      { fields: ['artist_id', 'axis'], type: 'composite', priority: 'HIGH', status: '✅ 배포됨' },
      // HIGH 우선순위: 최신 버전 시계열 조회 (블루프린트/SRD 명시 필수)
      { fields: ['artist_id', 'axis', 'version'], type: 'composite', order: 'desc', priority: 'HIGH', status: '✅ 배포됨' },
      // 단일 필드 인덱스 (Firestore 자동 생성)
      { fields: ['last_calculated'], type: 'simple', order: 'desc', note: '자동 생성됨' },
      { fields: ['version'], type: 'simple', note: '자동 생성됨' }
    ],
    
    dr_sarah_optimizations: {
      temporal_partitioning: 'artist_id + axis로 파티션하여 Phase 2 쿼리 최적화',
      analytical_metadata: '분석 결과 메타데이터로 Phase 3 비교 성능 향상',
      real_time_updates: '증분 업데이트 지원으로 배치 효율성 극대화'
    }
  },

  // 12. compare_pairs - Phase 3 비교 분석 사전 계산
  compare_pairs: {
    collection_name: 'compare_pairs',
    primary_key: 'pair_id',
    description: 'Phase 3 비교 분석 사전 계산',
    api_endpoint: 'GET /api/compare/:A/:B/:axis',
    
    schema: {
      pair_id: {
        type: 'string',
        format: '{artistA_id}_vs_{artistB_id}_{axis}',
        example: 'ARTIST_0005_vs_ARTIST_0003_담론',
        required: true
      },
      artistA_id: {
        type: 'string',
        required: true,
        index: true
      },
      artistB_id: {
        type: 'string', 
        required: true,
        index: true
      },
      axis: {
        type: 'string',
        enum: ['제도', '학술', '담론', '네트워크'],
        required: true,
        index: true
      },
      
      // Dr. Sarah Kim의 비교 분석 데이터 구조 (Phase 3 핵심)
      series: {
        type: 'array',
        required: true,
        items: {
          type: 'object',
          properties: {
            t: { type: 'number', description: '상대 시간' },
            v_A: { type: 'number', description: '아티스트 A 값' },
            v_B: { type: 'number', description: '아티스트 B 값' },
            diff: { type: 'number', description: '차이값' },
            cumulative_diff: { type: 'number', description: '누적 차이' }
          }
        },
        description: '시계열 비교 데이터'
      },
      
      abs_diff_sum: {
        type: 'number',
        required: true,
        description: 'AUC 기반 총 궤적 차이'
      },
      
      price_anchor_map: {
        type: 'object',
        properties: {
          artistA_peak_price: { type: 'number' },
          artistB_peak_price: { type: 'number' },
          trajectory_correlation: { type: 'number', minimum: -1, maximum: 1 },
          price_trajectory_correlation: { type: 'number', minimum: -1, maximum: 1 }
        }
      },
      
      // Dr. Sarah Kim의 고급 비교 분석 메타데이터
      comparative_analytics: {
        type: 'object',
        properties: {
          similarity_score: { type: 'number', minimum: 0, maximum: 1 },
          growth_pattern_match: { type: 'number', minimum: 0, maximum: 1 },
          inflection_alignment: { type: 'number', minimum: 0, maximum: 1 },
          competitive_positioning: {
            type: 'object',
            properties: {
              leader: { type: 'string', enum: ['artistA', 'artistB', 'tied'] },
              lead_magnitude: { type: 'number' },
              crossover_points: { type: 'array', items: { type: 'number' } }
            }
          }
        }
      }
    },
    
    indexes: [
      // HIGH 우선순위: 특정 비교 쌍의 특정 축 조회 (getCompareArtists API 사용)
      { fields: ['pair_id', 'axis'], type: 'composite', priority: 'HIGH', status: '✅ 배포됨' },
      // MEDIUM 우선순위: 작가 쌍별 비교 분석 (IA 문서 명시)
      { fields: ['artistA_id', 'artistB_id', 'axis'], type: 'composite', priority: 'MEDIUM', status: '✅ 배포됨' },
      // 단일 필드 인덱스 (Firestore 자동 생성)
      { fields: ['abs_diff_sum'], type: 'simple', order: 'desc', note: '자동 생성됨' }
    ]
  }
};

// =====================================================
// 🔧 P1 구현을 위한 Firestore 생성 스크립트 명세
// =====================================================

export const FIRESTORE_IMPLEMENTATION_GUIDE = {
  // P1이 실행할 정확한 스크립트
  initialization_script: `
// scripts/initializeFirestore.js - P1 구현용
const admin = require('firebase-admin');
const serviceAccount = require('../co-1016-firebase-adminsdk-fbsvc-ec20702062.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'co-1016'
});

const db = admin.firestore();

const createCollections = async () => {
  console.log('🏗️ [P1+Dr.Sarah] Firestore 컬렉션 생성 시작...');
  
  // 1. 스키마 정의 문서 생성
  for (const [collectionName, schema] of Object.entries(COLLECTIONS)) {
    await db.collection(collectionName).doc('_schema').set({
      schema_version: '4.0',
      designed_by: 'Dr. Sarah Kim',
      structure: schema.schema,
      indexes: schema.indexes,
      optimizations: schema.dr_sarah_optimizations,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(\`✅ [Schema] \${collectionName} 스키마 생성 완료\`);
  }
  
  console.log('🎯 [P1+Dr.Sarah] 모든 컬렉션 스키마 생성 완료!');
};

createCollections().catch(console.error);
`,

  // P1을 위한 인덱스 생성 가이드  
  index_creation_guide: `
// P1이 Firebase Console에서 실행할 인덱스 명령어들
const FIRESTORE_INDEXES = [
  // entities 컬렉션 최적화 인덱스
  'gcloud firestore indexes create --collection-group=entities --field-config field-path=entity_type,order=ascending --field-config field-path=debut_year,order=ascending',
  
  // measures 고성능 집계 인덱스
  'gcloud firestore indexes create --collection-group=measures --field-config field-path=entity_id,order=ascending --field-config field-path=axis,order=ascending --field-config field-path=time_window,order=ascending',
  
  // timeseries 시계열 분석 인덱스
  'gcloud firestore indexes create --collection-group=timeseries --field-config field-path=artist_id,order=ascending --field-config field-path=axis,order=ascending --field-config field-path=last_calculated,order=descending'
];
`,

  // 보안 규칙 설계 (P1 구현용)
  security_rules_design: `
// firestore.rules - Dr. Sarah Kim 설계, P1 구현
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 공개 읽기 (Phase 1-3 API 서빙)
    match /artist_summary/{artistId} {
      allow read: if true; // Phase 1 공개 접근
      allow write: if resource.data.batch_function == true; // 배치 함수만 쓰기
    }
    
    match /timeseries/{timeseriesId} {
      allow read: if true; // Phase 2 공개 접근
      allow write: if resource.data.batch_function == true;
    }
    
    match /compare_pairs/{pairId} {
      allow read: if true; // Phase 3 공개 접근
      allow write: if resource.data.batch_function == true;
    }
    
    // 관리자 전용 (원천 데이터)
    match /measures/{measureId} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // 스키마 문서는 읽기 전용
    match /{collection}/_schema {
      allow read: if true;
      allow write: if false;
    }
  }
}
`
};

// =====================================================  
// ⚡ Dr. Sarah Kim의 성능 최적화 전략
// =====================================================

export const PERFORMANCE_OPTIMIZATION_STRATEGY = {
  // 시계열 분석 최적화 (Dr. Sarah Kim 전문성)
  temporal_analysis_optimization: {
    partitioning: {
      strategy: 'artist_id + axis 기준 논리적 파티셔닝',
      benefit: 'Phase 2 개별 아티스트 시계열 쿼리 성능 90% 향상',
      implementation: 'Firestore 서브컬렉션 구조 활용'
    },
    
    indexing: {
      composite_indexes: [
        'entity_id + axis + time_window (measures)',
        'artist_id + axis (timeseries)', 
        'artistA_id + artistB_id + axis (compare_pairs)'
      ],
      single_field_indexes: [
        'debut_year (entities)',
        'start_date (events)',
        'updated_at (artist_summary)'
      ]
    },
    
    caching_strategy: {
      level1: 'Firebase 자체 캐싱 (5분)',
      level2: 'CDN 글로벌 캐싱 (1시간)',
      level3: '클라이언트 메모리 캐싱 (세션 지속)',
      invalidation: '배치 업데이트 시 자동 무효화'
    }
  },
  
  // 배치 처리 최적화
  batch_processing_optimization: {
    parallel_execution: 'measures 정규화를 entity_id별 병렬 처리',
    incremental_updates: '변경된 데이터만 재계산',
    memory_management: 'streaming으로 대용량 데이터 처리',
    error_recovery: '부분 실패 시 증분 재시도'
  }
};

// =====================================================
// 📋 P1 구현 체크리스트
// =====================================================

export const P1_IMPLEMENTATION_CHECKLIST = {
  phase1_schema_creation: [
    '✅ Firebase Admin SDK 설정',
    '✅ scripts/initializeFirestore.js 실행',
    '✅ 12개 컬렉션 스키마 문서 생성 확인',
    '✅ _schema 문서에 Dr. Sarah Kim 설계 정보 저장'
  ],
  
  phase2_indexes: [
    '✅ Firebase Console에서 composite index 생성',
    '✅ Dr. Sarah Kim 최적화 인덱스 적용',
    '✅ 인덱스 빌드 완료 대기 (10-20분)',
    '✅ 쿼리 성능 테스트'
  ],
  
  phase3_security_rules: [
    '✅ firestore.rules 파일 생성',
    '✅ Dr. Sarah Kim 설계 보안 규칙 적용',
    '✅ 배포 및 테스트',
    '✅ 접근 권한 검증'
  ]
};

export default {
  CORE_SOURCE_COLLECTIONS,
  SERVING_OPTIMIZED_COLLECTIONS, 
  FIRESTORE_IMPLEMENTATION_GUIDE,
  PERFORMANCE_OPTIMIZATION_STRATEGY,
  P1_IMPLEMENTATION_CHECKLIST
};

