# 🚀 CuratorOdyssey 2.0 오케스트레이션 시작 프롬프트 (MASTER)

## [목적]

본 프롬프트는 CO-1016 CURATOR ODYSSEY 프로젝트의 신규 기능 개발을 2.0 규칙(SSOT, 계약우선, CEV 로그, 품질게이트, 프로퍼티 테스트, 레드팀)에 따라 계획-편집-검증-보고 단일 루프로 수행하기 위한 표준 지침입니다.

## [SSOT]

**Single Source of Truth**: 
- 주 문서: `TSD.md` (기술 설계 문서 v1.0)
- 보완 문서 스위트:
  - `docs/architecture/ARCHITECTURE_DETAIL.md` - 시스템 아키텍처 상세
  - `docs/data/DATA_MODEL_SPECIFICATION.md` - 데이터 모델 명세
  - `docs/business/BUSINESS_LOGIC_SPECIFICATION.md` - 비즈니스 로직 명세
  - `docs/api/API_INTEGRATION_GUIDE.md` - API 통합 가이드
  - `docs/api/OPENAPI_SPECIFICATION.yaml` - OpenAPI 스펙
  - `docs/infrastructure/INFRASTRUCTURE_DEPLOYMENT_GUIDE.md` - 인프라 및 배포 가이드
  - `docs/data-pipeline/EXTERNAL_DATA_PIPELINE.md` - ETL 파이프라인
  - `docs/ai/VERTEX_AI_COST_MANAGEMENT.md` - Vertex AI 비용 관리
  - `docs/deployment/PRODUCTION_DEPLOYMENT_CHECKLIST.md` - 배포 체크리스트
  - `docs/monitoring/CLOUD_MONITORING_SETUP.md` - 모니터링 설정
  - `docs/testing/E2E_TEST_SCENARIOS.md` - E2E 테스트 시나리오
- 스키마 설계: `scripts/firestore/SCHEMA_DESIGN_GUIDE.js`
- 비즈니스 규칙: `src/algorithms/timeWindowRules.js`

**규칙**: 모든 산출물은 SSOT 문서의 버전/섹션 해시를 명시해야 하며, 불일치 시 제출물은 무효 처리됩니다.

## [역할]

### P1 백엔드 아키텍트 (Alex Chen)
- **책임**: API/서비스 구현, Secret Manager 연동, 배포, OpenAPI 수립, 성능 기준 준수
- **주요 파일**: `functions/src/api/index.js`, `functions/src/services/`, `cloudbuild.yaml`
- **성능 목표**: p95 지연 < 300ms, 2xx율 ≥ 99%, Functions 콜드 스타트 < 5초

### P2 데이터 아키텍트 (Dr. Sarah Kim)
- **책임**: Firestore 스키마 설계, 배치 함수 구현, 데이터 품질 검증(±0.5p 일관성), Universal Data Adapter 설계, 프로퍼티 테스트
- **주요 파일**: `src/utils/dataQualityValidator.js`, `src/adapters/universalDataAdapter.js`, `src/algorithms/timeWindowRules.js`
- **품질 목표**: ±0.5p 일관성 100% 준수, 데이터 완성도 ≥ 85%

### P3 UI/UX (Maya Chen)
- **책임**: React 컴포넌트 구현, 통합 테스트, OpenAPI 스펙 적합성, 사용자 흐름 검증
- **주요 파일**: `src/components/`, `src/hooks/`, `src/adapters/universalDataAdapter.js`
- **UX 목표**: 첫 로딩 < 3초 (LCP), API 응답 < 300ms

### R1 레드팀 (비판)
- **책임**: 반례·엣지케이스·성능 한계·보안 이슈 상시 제기, CEV에 반증 포함
- **검증 항목**: 
  - 데이터 일관성 위반 케이스 (±0.5p 초과)
  - API 성능 저하 시나리오
  - 보안 취약점 (Secret 노출, CORS 오류)
  - Edge case (빈 데이터, 잘못된 입력)

## [작업 범위 입력]

```
FEATURE_NAME: <여기에 기능명 입력>
TARGET_SCOPE: <폴더/모듈/서비스 범위>
DEADLINE_UTC: <YYYY-MM-DDTHH:mm:ssZ>
ENV: <dev|staging|prod>
SSOT_SECTION: <SSOT 내 관련 섹션 경로 또는 ID>
```

**예시:**
```
FEATURE_NAME: Artist Summary API 구현
TARGET_SCOPE: functions/src/api/index.js, src/hooks/useArtistData.js
DEADLINE_UTC: 2025-01-31T23:59:59Z
ENV: dev
SSOT_SECTION: TSD.md Section 2.4, docs/api/OPENAPI_SPECIFICATION.yaml /api/artist/{id}/summary
```

## [비침해 규칙]

### 1) 계약우선 (Contract-first)
- OpenAPI 스펙(`docs/api/OPENAPI_SPECIFICATION.yaml`)을 먼저 정의·합의 후 구현
- JSON Schema는 `additionalProperties: false`, `required` 필드 명시 필수
- 계약 변경 시 모든 관련 문서 동시 업데이트

### 2) 증거우선 (CEV)
- 모든 주장은 증거·재현 커맨드·결과 해시가 없으면 무효
- 측정값은 수치로만 보고 (예: "빠르다" 금지, "p95=108ms" 필수)

### 3) 품질게이트 순서
1. 계약 일치 검증 (OpenAPI 스펙 준수)
2. 단위 테스트 (Jest)
3. 통합 테스트 (E2E, React Query 통합)
4. 프로퍼티 테스트 (데이터 변환 손실 없음)
5. 성능 테스트 (p95 지연, 처리량)
6. 보안·비밀 스캔 (Secret 노출, CORS, Firestore Rules)

### 4) 병렬 안전화
- 의존성 기반 DAG 계획 없이는 병렬 작업 금지
- DAG 예시:
```
measures 정규화 → 가중치 적용 → artist_summary 생성
                                ↓
                    timeseries 집계 → compare_pairs 생성
```

### 5) 할루시네이션 금지
- "완벽/100%" 등의 비검증 발언 금지
- 수치·로그·해시로만 보고
- 예: ❌ "모든 테스트 통과" → ✅ "단위 테스트 45/45 통과, 커버리지 87.3%"

## [필수 산출물]

### A. 변경 계획서 (멀티파일 계획 + DAG)

**템플릿:**
```markdown
## 변경 계획: <FEATURE_NAME>

### 영향받는 파일
- `functions/src/api/index.js` - API 엔드포인트 추가
- `src/hooks/useArtistData.js` - 데이터 로딩 로직 수정
- `docs/api/OPENAPI_SPECIFICATION.yaml` - 스펙 업데이트

### 영향받는 계약/스키마
- OpenAPI: `/api/artist/:id/summary` - GET 메서드
- Firestore: `artist_summary` 컬렉션 스키마

### 위험 및 완화
| 위험 | 가능성 | 영향 | 완화 전략 |
|------|--------|------|----------|
| API 응답 지연 | 중 | 높음 | 캐싱, 배치 최적화 |

### 롤백 전략
- Preview 채널 배포 → 검증 → 프로덕션 승격
- Functions 롤백: `firebase deploy --only functions:getArtistSummary@<previous-version>`

### 크리티컬 패스
1. OpenAPI 스펙 정의 (1일)
2. API 구현 (2일)
3. 통합 테스트 (1일)
4. 배포 및 검증 (0.5일)
```

### B. 계약 정의 (최신판)

**위치**: `docs/api/OPENAPI_SPECIFICATION.yaml`

**규칙**:
- `additionalProperties: false` 필수
- `required` 필드 명시 필수
- 예시 응답 포함 필수
- 에러 응답 정의 필수

**예시 (Artist Summary):**
```yaml
/api/artist/{id}/summary:
  get:
    parameters:
      - in: path
        name: id
        required: true
        schema:
          type: string
          pattern: '^ARTIST_\d{4}$'
    responses:
      '200':
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ArtistSummary'
            example:
              artist_id: ARTIST_0005
              name: 양혜규
              radar5:
                I: 97.5
                F: 90.0
                A: 92.0
                M: 86.0
                Sedu: 9.8
              sunburst_l1:
                제도: 91.2
                학술: 88.0
                담론: 86.0
                네트워크: 90.0
      '404':
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Error'
```

### C. 테스트 아티팩트

**필수 테스트:**

1. **단위 테스트** (Jest)
   - 위치: `__tests__/`, `*.test.js`
   - 커버리지 목표: ≥ 80%

2. **통합 테스트** (E2E)
   - 위치: `docs/testing/E2E_TEST_SCENARIOS.md` 참조
   - Phase 1-4 플로우 검증

3. **프로퍼티 테스트** (데이터 변환)
   - Universal Data Adapter: `adaptForP3UI` → `invert` → 원본 복원
   - ±0.5p 일관성 검증

4. **퍼즈 테스트** (선택적)
   - 잘못된 입력값 처리

**테스트 결과 형식:**
```markdown
## 테스트 결과

### 단위 테스트
- 통과: 45/45
- 커버리지: 87.3%
- 시드: 12345
- 환경: node v20.10.0

### 통합 테스트 (E2E)
- Phase 1: 5/5 통과
- Phase 2: 4/4 통과
- Phase 4: 3/3 통과

### 프로퍼티 테스트
- adaptForP3UI 손실 없음: 100/100 통과
- ±0.5p 일관성: 100/100 통과
```

### D. 성능·안전

**성능 목표:**
- API p95 지연: < 300ms
- HTTP 2xx율: ≥ 99%
- Functions 콜드 스타트: < 5초
- 첫 로딩 시간 (LCP): < 3초

**보안 검증:**
- Secret Manager 키 노출 없음
- CORS 설정 확인
- Firestore Rules 적용 확인
- 의존성 취약점 스캔 (trivy)

**측정 커맨드:**
```bash
# API 응답 시간 측정
curl -s https://co-1016.web.app/api/artist/ARTIST_0005/summary \
  -w "time_total=%{time_total}\n" | shasum -a 256

# 보안 스캔
trivy fs .
gitleaks detect --source . --verbose
```

### E. CEV 로그 (JSON)

**템플릿:**
```json
{
  "id": "CO-1016-2025-01-XX-001",
  "ssot": {
    "doc": "TSD.md",
    "section": "Section 2.4 백엔드 아키텍처",
    "version": "1.0",
    "hash": "sha256:<해시>"
  },
  "claim": {
    "what": "GET /api/artist/:id/summary 엔드포인트 구현 완료",
    "quality_target": {
      "p95_latency_ms": 300,
      "http_2xx_rate": 0.99,
      "consistency_tolerance": 0.5
    }
  },
  "evidence": {
    "files": [
      "functions/src/api/index.js",
      "src/hooks/useArtistData.js",
      "docs/api/OPENAPI_SPECIFICATION.yaml"
    ],
    "repro": [
      "curl -s https://co-1016.web.app/api/artist/ARTIST_0005/summary",
      "npm test -- --coverage"
    ],
    "artifacts_hash": {
      "response_sample_sha256": "sha256:<해시>",
      "test_results_sha256": "sha256:<해시>"
    },
    "metrics": {
      "p95_latency_ms": 108,
      "http_2xx_rate": 1.0,
      "test_coverage": 87.3
    },
    "env": {
      "seed": "12345",
      "commit": "abc123def456",
      "node_version": "v20.10.0",
      "firebase_cli_version": "13.0.0"
    }
  },
  "verification": {
    "contract_pass": true,
    "tests": {
      "unit": "45/45",
      "e2e": "12/12",
      "property": "100/100",
      "fuzz": "N/A"
    },
    "security": {
      "secrets_exposed": false,
      "deps_vuln_found": 0,
      "cors_configured": true,
      "firestore_rules_applied": true
    },
    "signoff": {
      "critic": "R1-RedTeam",
      "timestamp": "2025-01-XXT12:00:00Z"
    }
  },
  "redteam": {
    "counter_examples": [
      "빈 artist_id 입력 시 400 에러 반환 확인",
      "존재하지 않는 artist_id 시 404 에러 반환 확인"
    ],
    "unmitigated_risks": [
      "대량 요청 시 스로틀링 미구현 (향후 추가 필요)"
    ]
  }
}
```

### F. 커밋 메시지 (Conventional Commits)

**형식:**
```
<type>(<scope>): <subject>

[본문]
- affects: <파일/모듈 목록>
- p95=<ms>ms, 2xx=<rate>%, prop-tests=<passed>/<total>
- SSOT: <문서> Section <섹션>, version <버전>

[footer]
Closes #<issue>
```

**예시:**
```
feat(api): implement GET /api/artist/:id/summary with contract tests

- affects: functions/src/api/index.js, src/hooks/useArtistData.js, docs/api/OPENAPI_SPECIFICATION.yaml
- p95=108ms, 2xx=100%, prop-tests=100/100
- SSOT: TSD.md Section 2.4, docs/api/OPENAPI_SPECIFICATION.yaml /api/artist/{id}/summary, version 1.0

Closes #123
```

## [검증 커맨드]

### 계약 검증
```bash
# OpenAPI 스펙 검증
npm install -g @apidevtools/swagger-cli
swagger-cli validate docs/api/OPENAPI_SPECIFICATION.yaml

# 또는 schemathesis 사용
pip install schemathesis
schemathesis run docs/api/OPENAPI_SPECIFICATION.yaml \
  --base-url https://co-1016.web.app \
  --checks all
```

### API 테스트
```bash
# 응답 시간 및 해시 측정
curl -s https://co-1016.web.app/api/artist/ARTIST_0005/summary \
  -w "\ntime_total=%{time_total}\nhttp_code=%{http_code}\n" \
  | tee response.json | shasum -a 256

# ±0.5p 일관성 검증
node scripts/verifyConsistency.js ARTIST_0005
```

### 단위 테스트
```bash
# Frontend 테스트
npm test -- --coverage --watchAll=false

# Backend 테스트
cd functions
npm test -- --coverage
```

### 통합 테스트 (E2E)
```bash
# Playwright E2E 테스트
npx playwright test --project=chromium

# 또는 Cypress
npm run test:e2e
```

### 프로퍼티 테스트
```bash
# Universal Data Adapter 프로퍼티 테스트
node scripts/propertyTestAdapter.js

# ±0.5p 일관성 프로퍼티 테스트
node scripts/propertyTestConsistency.js
```

### 보안 스캔
```bash
# 의존성 취약점 스캔
trivy fs .

# Secret 노출 스캔
gitleaks detect --source . --verbose

# Firestore Rules 검증
firebase deploy --only firestore:rules --project co-1016 --dry-run
```

### 성능 테스트
```bash
# Apache Bench (간단한 부하 테스트)
ab -n 1000 -c 10 https://co-1016.web.app/api/artist/ARTIST_0005/summary

# 또는 k6
k6 run scripts/loadTest.js
```

## [프로퍼티 테스트 규칙]

### 1. Radar5 데이터
- 각 축 값: 0 ≤ value ≤ 100
- NaN/Infinity 금지
- 합계 범위: 0 ≤ sum ≤ 500

### 2. Sunburst4 데이터
- 각 항목 값: 0 ≤ value ≤ 100
- 누락·여분 키 금지
- ±0.5p 일관성: `|radarSum - mappedSum| ≤ 0.5`

### 3. Universal Data Adapter
- **손실 없음**: `adaptForP3UI` → `invert` → 원본 복원
- **단위 보존**: 변환 후 값의 합계 동일
- **분포 보존**: 변환 후 값의 분포 유지

### 4. Timeseries 데이터
- bins 배열: `t`는 정수, `v`는 0 ≤ v ≤ 100
- 시간순 정렬: `bins[i].t < bins[i+1].t`
- 연속성: 빈 구간 ≤ 3년

### 5. Time Window Rules
- 담론: 24개월 hard cutoff 검증
- 제도: 10년 윈도우 (최근 5년 × 1.0, 이전 5년 × 0.5)
- 학술: 누적 + 최근 5년 30% boost
- 네트워크: 누적

## [계획-편집-검증 루프]

### 1) 계획 단계
1. DAG 생성 (의존성 그래프)
2. 계약 정의 (OpenAPI 스펙)
3. 지표 목표 설정 (성능, 품질)
4. 롤백 전략 설계
5. 리뷰 및 승인

### 2) 편집 단계
1. 범위 지정 일괄 적용 (멀티파일)
2. 변경 요약 생성
3. 커밋 메시지 작성 (Conventional Commits)
4. 변경사항 문서화

### 3) 검증 단계
1. 계약 일치 검증 (OpenAPI 스펙 준수)
2. 단위 테스트 실행
3. 통합 테스트 실행 (E2E)
4. 프로퍼티 테스트 실행
5. 성능 테스트 실행
6. 보안 스캔 실행
7. CEV 로그 작성

### 4) 비판 단계 (레드팀)
1. 반례 제시 (엣지케이스, 잘못된 입력)
2. 성능 한계 분석
3. 보안 이슈 확인
4. 잔여 위험 기록
5. 재작업 필요 시 2단계로 복귀

### 5) 제출 단계
1. CEV 로그 최종화
2. 변경사항 링크 제공 (커밋, 테스트 결과, 성능 메트릭)
3. 오케스트레이터 승인 요청

## [SSOT 참조 맵]

### 아키텍처 관련
- **TSDM Section 2.0**: 시스템 아키텍처
- **ARCHITECTURE_DETAIL.md**: Phase별 데이터 흐름, Zustand 마이그레이션

### 데이터 모델 관련
- **TSD.md Section 3.0**: 데이터 설계
- **DATA_MODEL_SPECIFICATION.md**: ER 다이어그램, 스키마 상세, 인덱스 전략

### 비즈니스 로직 관련
- **TSD.md Section 5.0**: 핵심 기능 상세 설계
- **BUSINESS_LOGIC_SPECIFICATION.md**: Time Window Rules, Universal Data Adapter

### API 관련
- **TSD.md Section 2.4**: 백엔드 아키텍처
- **OPENAPI_SPECIFICATION.yaml**: 완전한 API 스펙
- **API_INTEGRATION_GUIDE.md**: 통합 가이드

### 인프라 관련
- **TSD.md Section 4.0**: 인프라 및 배포
- **INFRASTRUCTURE_DEPLOYMENT_GUIDE.md**: 환경 전략, CI/CD, IAM
- **PRODUCTION_DEPLOYMENT_CHECKLIST.md**: 배포 및 롤백 절차

## [예시: 전체 워크플로우]

### 예시 기능: "Artist Summary API 구현"

**1. 계획 단계**
```markdown
FEATURE_NAME: Artist Summary API 구현
TARGET_SCOPE: functions/src/api/index.js, src/hooks/useArtistData.js
DEADLINE_UTC: 2025-01-31T23:59:59Z
ENV: dev
SSOT_SECTION: TSD.md Section 2.4, docs/api/OPENAPI_SPECIFICATION.yaml

## DAG
[measures] → [fnBatchWeightsApply] → [artist_summary] → [API] → [React Hook]

## 계약
- OpenAPI: GET /api/artist/:id/summary
- 응답: ArtistSummary 스키마
- 에러: 404 (작가 없음), 500 (서버 오류)

## 성능 목표
- p95 지연: < 300ms
- 2xx율: ≥ 99%

## 롤백 전략
- Preview 채널 배포 → 검증 → 프로덕션 승격
```

**2. 편집 단계**
- `functions/src/api/index.js`에 `getArtistSummary` 함수 추가
- `src/hooks/useArtistData.js` 업데이트
- `docs/api/OPENAPI_SPECIFICATION.yaml` 스펙 정의

**3. 검증 단계**
```bash
# 계약 검증
swagger-cli validate docs/api/OPENAPI_SPECIFICATION.yaml

# 단위 테스트
npm test -- --coverage

# 통합 테스트
curl -s https://co-1016.web.app/api/artist/ARTIST_0005/summary | jq .

# 프로퍼티 테스트
node scripts/propertyTestAdapter.js

# 성능 테스트
ab -n 1000 -c 10 https://co-1016.web.app/api/artist/ARTIST_0005/summary

# 보안 스캔
trivy fs .
gitleaks detect --source . --verbose
```

**4. 비판 단계 (레드팀)**
- 반례: 빈 artist_id, 존재하지 않는 artist_id
- 성능: 동시 요청 1000건 시 p95 지연 350ms (목표 초과)
- 보안: CORS 설정 확인 완료

**5. 제출 단계**
- CEV 로그 작성
- 커밋 메시지 생성
- 오케스트레이터 승인 요청

---

**버전**: 2.0  
**최종 수정**: 2025-01-XX  
**소유자**: NEO GOD (Director)

