```md
*** CuratorOdyssey: MVP 

기술 명세 및 구현 로드맵 v2.0 (AI Architect Ready)문서 목적: 본 문서는 'CuratorOdyssey' MVP를 GCP 단일 프로젝트 환경 내에서 구현하기 위한 모든 기술적 사양과 단계별 로드맵을 정의하는 단일 진실 공급원(Single Source of Truth)이다. AI 아키텍트 에이전트는 본 명세서를 기준으로 모든 리소스를 프로비저닝하고 로직을 구현한다.항목명세프로젝트 이름CuratorOdysseyGCP Project IDco-1016주요 리전asia-northeast3 (Seoul)핵심 목표동일 원천 데이터로 레이더(5축)·선버스트(4축)·누적영역(Phase2)·다작가 비교(Phase3)를 일관되게 생성하고, 데이터 처리의 모든 과정을 시스템 규칙으로 강제하여 설명가능성과 재현성을 확보한다.1. 중앙 블루프린트: 아키텍처 원칙 및 전역 규칙1.1. 설계 원칙단일 진실 공급원: 모든 분석 및 시각화는 Firestore의 정규화된 원시 데이터 컬렉션에서 파생된다.설명가능성 및 재현성: 모든 분석 결과는 weights.version, normalization.method_version, snapshots.period의 조합으로 추적 및 복원 가능해야 한다.읽기 최적화: 복잡한 집계 연산은 야간 배치(Batch) 작업을 통해 사전 계산한다. API는 최종 사용자에게 사전 계산된 artist_summary, timeseries 컬렉션을 직접 서빙하여 빠른 응답 속도를 보장한다.이중 프레임워크: 고수준 **요약 5대축(I/F/A/M/Sedu)**과 저수준 **근거 4축(제도/학술/담론/네트워크)**을 동일한 데이터 소스에서 생성하여 논리적 일관성을 유지한다.1.2. 용어 사전축(Axis): 레이더 5축(요약) vs 선버스트 4축(근거).지표(Metric): metric_code로 식별되는 단위 측정 변수.이벤트(Event): event_id (yyyy-mm-dd+org+title 형식)로 식별되는 1회성 발생 단위.정규화: 로그 변환 → 윈저라이징(상하 1%) → 백분위 표준 파이프라인.스냅샷: 특정 시점의 집계 결과와 분석에 사용된 파이프라인 버전 정보.1.3. 전역 규칙 (Mandatory)귀속 분기: "최근 빈도 → 제도, 누적 이력/관계 → 네트워크" 원칙에 따라 axis_map을 통해 상호 배타적으로 집계한다.이벤트 1회 계수: 축 간 파생 효과는 edges의 링크 메타데이터로만 기록한다.허브 단일 귀속: HUB_OFFICIAL_FREQ는 '제도'에, HUB_OFFICIAL_HIST는 '네트워크'에 단일 귀속된다.시간창: 담론=24개월, 제도=10년(최근 5년 가중 1.0/이전 5년 0.5), 학술=누적+최근 5년 가중, 네트워크=누적을 강제한다.출처 계층: 1차 공식 문서 > 공식 보도자료 > 신뢰 매체 순의 priority를 따르며, 충돌 시 최신 1차 출처를 채택한다.엔터티 해결(ER): 한/영/별칭 및 외부 식별자(VIAF/ULAN)를 entities 마스터 테이블에서 병합하여 엔터티를 정규화한다.2. STEP 0: 데이터 수집 및 정제(ETL) 파이프라인Goal: 외부 소스로부터 비정형 데이터를 수집, 정제하여 Firestore의 원천 데이터 컬렉션에 value_raw 형태로 적재하는 자동화된 파이프라인을 구축한다.2.1. Extract (추출):Cloud Scheduler가 주기적으로 fnEtlExtract 함수를 트리거한다.함수는 sources 컬렉션에 정의된 URL을 대상으로 웹 스크레이핑/API 호출을 수행하고, 원본 파일을 gs://co-1016-uploads/raw/{date}/{source_id}.json 경로에 저장한다.2.2. Transform & Load (변환 및 적재):fnEtlTransform 함수가 Storage에 저장된 원본 파일을 처리한다.엔터티 해결(ER): 텍스트에서 작가/기관명을 추출, entities 컬렉션을 참조하여 표준 entity_id로 변환한다. (신규 엔터티는 생성)이벤트 생성: event_id를 표준화하여 events 컬렉션에 upsert한다.측정값 추출: metric_code별 value_raw를 추출하여 measures 컬렉션에 source_id, priority, capture_hash, time_window와 함께 기록한다.귀속 및 관계 생성: axis_map(귀속 규칙)과 edges(관계 정보) 컬렉션에 관련 레코드를 생성한다.DoD (Definition of Done): MVP 30인 코호트의 핵심 이벤트가 measures 컬렉션에 value_raw 형태로 적재되고, 모든 데이터의 출처 및 관계(라인리지)가 완비된다.3. STEP 1: 인프라 설계 (GCP/Firebase 단일 프로젝트)Goal: co-1016 프로젝트 내에 모든 인프라 리소스를 정의하고 배포한다.3.1. 리소스 명세:Firestore 컬렉션: entities, events, measures, axis_map, edges, sources, codebook, weights, snapshots, artist_summary, timeseries, compare_pairs.Storage 버킷: gs://co-1016-uploads, gs://co-1016-snapshots.Cloud Functions: asia-northeast3, node20, 함수명 fnApi*/fnBatch*.Firebase Hosting: SPA 라우팅 + /api/* 프록시, 채널 preview/stg/live.3.2. IAM 및 Secrets:서비스 계정: sa-curator-fn (API용), sa-curator-batch (배치용)에 최소 권한 부여.Secret Manager: app/config에 {norm, time_window, weights.version} 등 핵심 파라미터 저장.DoD: 모든 리소스가 프로비저닝되고, IAM 권한 및 Firestore 보안 규칙이 배포된다.4. STEP 2: 백엔드 로직 설계 (배치·API)Goal: 원시 데이터를 분석 지표로 변환하는 배치 로직과, 이를 서빙하는 API 엔드포인트를 구현한다.4.1. 배치 로직 (Scheduler & Cloud Tasks):Cloud Scheduler가 fnBatchNormalize를 트리거하며, 각 함수는 성공 시 Cloud Tasks를 통해 다음 함수를 순차적으로 호출하여 안정적인 오케스트레이션을 보장한다.fnBatchNormalize: measures의 value_raw를 읽어 value_normalized를 계산 및 저장한다.fnBatchWeightsApply: codebook과 weights를 참조하여 레이더 5축 점수와 선버스트 L1 합계를 산출 후 artist_summary를 업데이트한다.fnBatchTimeseries: measures를 기반으로 10년 단위 누적 시계열을 계산하여 timeseries에 저장한다.4.2. API 로직 (HTTPS Functions):GET /api/artist/:id/summary → artist_summary에서 단일 문서 read.GET /api/artist/:id/sunburst → sunburst_snapshot에서 스냅샷 read (또는 on-the-fly 생성).GET /api/artist/:id/timeseries/:axis → timeseries에서 사전 계산된 데이터 read.GET /api/compare/:A/:B/:axis → 두 작가의 timeseries 데이터를 병렬 read 후 병합.DoD: 3개의 배치 함수와 4개의 API 엔드포인트가 구현되고, 단위 테스트를 통과한다.5. STEP 3: 백엔드–차트 로직 정렬Goal: "한 입력, 두 차트" 원칙을 시스템 레벨에서 강제하여 데이터의 논리적 일관성을 확보한다.5.1. 구현: fnBatchWeightsApply 함수 내에서 레이더 5축 점수와 선버스트 L1 합계를 동일한 트랜잭션으로 계산하여 artist_summary에 저장한다.5.2. 검증: 레이더 축 점수의 기반이 되는 4축 메타데이터 합계와 선버스트 L1 합계 간 차이가 허용 오차(±0.5p) 이내인지 검증하는 자동화된 테스트를 CI 파이프라인에 포함한다.5.3. 투명성: 모든 API 응답과 차트 툴팁에 weights.version, normalization.method_version 등 분석에 사용된 모델 버전을 명시적으로 노출한다.DoD: 레이더-선버스트 데이터 간의 논리적 일관성이 자동화된 테스트로 증명된다.6. STEP 4: 데이터베이스·스토리지 스키마 (최종)Goal: AI 에이전트가 참조할 최종 데이터베이스 및 스토리지 스키마를 확정한다.6.1. Firestore 컬렉션 명세:컬렉션명PK주요 필드설명entitiesentity_identity_type, names_ko, names_en, alias, external_ids{}, debut_year작가, 기관 등 모든 엔터티의 마스터 정보eventsevent_idtitle, org, start_date, end_date, venue_id, type전시, 수상 등 모든 발생 이벤트 원본measuresmeasure_identity_id, axis, metric_code, value_raw, value_normalized, source_id이벤트로부터 추출된 개별 측정값axis_mapmap_idevent_id, axis_assignment, duplicate_rule이벤트의 축 귀속 규칙edgesedge_idsrc_id, dst_id, relation_type, event_id, weight엔터티 간의 관계(네트워크) 정보sourcessource_idsource_url, priority, capture_hash, captured_at모든 데이터의 출처 정보codebookmetric_codeaxis, definition, unit, time_window_default, normalization모든 지표의 정의 및 처리 규칙weightsweight_idaxis, metric_code, value, version지표별 가중치와 버전 정보snapshotssnapshot_idscope, period, file_uri, checksum과거 분석 결과 재현을 위한 데이터 덤프artist_summaryartist_idradar5{}, sunburst_l1{}, weights_version, time_windowPhase 1 서빙용 사전 계산 요약 데이터timeseriesartist_idaxis, bins[{t,v}], versionPhase 2/3 서빙용 사전 계산 시계열 데이터compare_pairspair_idaxis, series, abs_diff_sum, price_anchor_mapPhase 3 비교 분석 결과6.2. Cloud Storage 경로 규칙:원본: gs://co-1016-uploads/raw/{date}/{source_id}.json스냅샷: gs://co-1016-snapshots/{period}/sunburst/{artist_id}.jsonDoD: 위 스키마를 기반으로 Firestore 데이터베이스가 구성되고, 보안 규칙이 배포된다.7. STEP 5: UX/UI 설계Goal: 사용자가 Phase 1, 2, 3의 분석 플로우를 직관적으로 경험할 수 있는 React 인터페이스를 구현한다.7.1. 핵심 화면:/artist/:id: 좌측에 ArtistRadar5Axis 컴포넌트, 우측에 SunburstL4 컴포넌트를 배치한다. 선버스트 클릭 시, 하단에 StackedArea 컴포넌트가 나타나며 Phase 2로 드릴다운된다.7.2. 성능 및 접근성:React Query/SWR로 /summary, /sunburst API를 초기에 1회 호출 후 캐싱한다.모든 차트 요소에 aria-label, focus ring 등 웹 접근성 표준을 준수한다.데이터 로딩 시 Skeleton UI를 표시하여 LCP(Largest Contentful Paint)를 개선한다.DoD: 핵심 사용자 플로우(요약 로딩 → 선버스트 드릴다운 → 누적영역 전환)가 1초 이내에 완료된다.8. STEP 6: AI API 인덱스·JS 프롬프트·엔드포인트Goal: 분석 데이터를 기반으로 서술형 보고서를 생성하는 AI 기능을 구현하고 API 엔드포인트를 설정한다.8.1. 엔드포인트:POST /api/report/generate: Vertex AI Gemini-1.5 Pro를 호출하여 구조화된 Markdown 보고서를 생성한다.8.2. 프롬프트 템플릿 (Functions 내 구현):JavaScript// functions/src/api/generateReport.js
//... (Vertex AI SDK 초기화)...
// POST /api/report/generate 엔드포인트 함수
exports.generateAiReport = onRequest(async (req, res) => {
    const { artistA_data, artistB_data, comparison_analysis } = req.body;
    const config = await loadAppConfig(); // Secret Manager에서 설정 로드

    const prompt = `
# MISSION
You are "Odyssey AI", a top-tier art market analyst for the "CuratorOdyssey" platform. Your mission is to generate a professional, data-driven report based on the structured JSON data provided below.

# CONTEXT & DATA
The analysis is based on version "${config.weights_version}" of our model. All scores are normalized to a 0-100 scale.

## 1. Primary Artist Analysis: ${artistA_data.name}
### 1.1. Phase 1: Current Value Snapshot
- **5-Axis Radar Scores:** ${JSON.stringify(artistA_data.summary.radar5)}
- **4-Axis Foundational Scores (Sunburst L1):** ${JSON.stringify(artistA_data.summary.sunburst_l1)}

### 1.2. Phase 2: Career Trajectory (Institution Axis Example)
- **Trajectory Data (Debut Year = 0):** ${JSON.stringify(artistA_data.timeseries.institution.bins)}
- **Key Turning Points:** ${JSON.stringify(artistA_data.key_events)}

## 2. Comparative Analysis: ${artistA_data.name} vs. ${artistB_data.name}
### 2.1. Phase 3-1: Trajectory Comparison (Discourse Axis)
- **Comparison Series (t: years since debut):** ${JSON.stringify(comparison_analysis.discourse_comparison.series)}

### 2.2. Phase 3-2: Trajectory vs. Market Value
- **Total Trajectory Difference Index:** ${comparison_analysis.total_trajectory_difference_index}
- **Highest Price per "Ho" (A vs. B):** ${JSON.stringify(comparison_analysis.price_comparison)}

# TASK
Generate a structured, analytical report in Korean Markdown format with the following sections:

### **Executive Summary**
- Concisely summarize ${artistA_data.name}'s market position, key value drivers, and comparison against ${artistB_data.name}.

### **Phase 1: 현재 가치 구성 분석 (${artistA_data.name})**
- 5대축 레이더 점수를 해석하여 작가의 핵심 가치 유형(예: '제도권 검증형')과 강점/약점을 분석하라.
- 4축 근거 점수를 바탕으로 강점의 원인을 설명하라. (예: '기관전시(I)' 점수가 높은 이유가 '제도' 축의 압도적 기여 때문임을 언급)

### **Phase 2: 커리어 궤적 분석 (${artistA_data.name})**
- 시계열 데이터를 바탕으로 작가의 성장 패턴(꾸준한 성장 vs. 변곡점을 통한 급성장)을 설명하라.
- 주요 이벤트를 바탕으로 커리어의 결정적 전환점을 식별하고, 그것이 가치 축적에 미친 영향을 분석하라.

### **Phase 3: 비교 분석 및 시장 전망**
- ${artistA_data.name}와(과) ${artistB_data.name}의 성장 궤적을 '담론' 축을 중심으로 비교 분석하고, 성공 경로의 유사점과 차이점을 논하라.
- '궤적 차이 지수'와 '호당 가격 차이'의 상관관계를 해석하고, 커리어 경로 차이가 시장 가치 차이를 논리적으로 설명하는지 분석하라.
- 최종적으로 ${artistA_data.name}의 미래 잠재력, 리스크, 기회 요인에 대한 전략적 전망을 제시하라.

# OUTPUT FORMAT
- Language: Korean
- Format: Markdown
- Tone: Professional, analytical, objective.
`;

    //... Vertex AI Gemini API 호출 및 응답 처리 로직...
});
DoD: POST /api/report/generate 엔드포인트가 정상 동작하며, 주어진 데이터에 대해 구조화된 한국어 Markdown 보고서를 성공적으로 출력한다.9. 테스트 및 관측Unit Test (Jest): 정규화 파이프라인, 레이더-선버스트 합치(±0.5p) 검증.E2E Test (Playwright): 핵심 사용자 시나리오(/summary 로딩 → 드릴다운 → 누적영역 전환)가 1초 내 완료되는지 검증.관측(Observability): Cloud Logging/Tracing, Error Reporting, GA4 이벤트를 통해 페이지 성능 및 API 레이턴시를 지속적으로 모니터링한다.