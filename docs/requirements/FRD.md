# CO-1016 CURATOR ODYSSEY: Functional Requirements Document (FRD) v1.0

## 문서 메타데이터 (Document Metadata)

**문서명**: CO-1016 CURATOR ODYSSEY Functional Requirements Document (FRD) v1.0

**버전**: 1.0

**상태**: Draft (초안, API Spec v1.0 기반)

**최종 수정**: 2025-11-02

**소유자**: NEO GOD (Director)

**승인자**: Product Owner (TBD)

**개정 이력**:
- v1.0 (2025-11-02): API Spec 기반 초기 초안, SRD FR을 API 엔드포인트와 매핑하여 세부화

**배포 범위**: Backend Development Team (Firebase Functions), Frontend Development Team (React Query Integration), QA Team (Testing)

**변경 관리 프로세스**: GitHub Issues/PR 워크플로, 변경 시 SRD/TSD/API Spec 동시 업데이트

**참조 문서 (References)**:
- **[SRD v1.0](SRD.md)** - Software Requirements Document, 기능 요구사항 (FR) 및 수용 기준 (AC)
- **[TSD v1.0](../TSD.md)** - Technical Design Document, API Layer 상세 및 Functions 구현
- **[API Specification v1.0](../api/API_SPECIFICATION.md)** - RESTful API 엔드포인트 정의, JSON Schema, 에러 코드

---

## 1. 서론 (Introduction)

### 1.1 목적 (Purpose)

본 문서는 API 명세서 v1.0을 기반으로 IEEE 830-1998 표준을 따르는 Functional Requirements Document (FRD)를 제공한다. SRD의 기능 요구사항(FR, e.g., FR-P1-DQ-001)을 API 엔드포인트(예: GET `/api/artist/{id}/summary`)와 매핑하여 상세화하며, 개발/테스트 가이드로 활용한다. 각 FR에 대해 입력/출력 스키마, 검증 규칙, 사전/사후 조건을 명확히 정의하여 구현 추적성을 보장한다.

### 1.2 범위 (Scope)

#### In Scope (범위 내)

- **Phase 1 기능**: 현재 가치 분석 (요약 데이터 조회, sunburst 상세)
- **Phase 2 기능**: 커리어 궤적 분석 (시계열 조회, 이벤트 영향, 배치 API)
- **Phase 3 기능**: 비교 분석 (두 아티스트 비교)
- **Phase 4 기능**: AI 보고서 생성 (데이터 취합 + AI 호출)

#### Out of Scope (범위 외)

- 사용자 인증 구현 (향후 Firebase Auth 도입 예정, v1.1)
- 실시간 업데이트 (WebSocket, 현재 폴링 사용)
- 대규모 배치 API (ETL 파이프라인 별도 문서)

### 1.3 배경 (Background)

CO-1016 CURATOR ODYSSEY는 아티스트(예술가)의 경력 궤적을 데이터 기반으로 분석하고 시각화하는 플랫폼이다. 축(제도/학술/담론/네트워크) 기반 데이터 처리를 통해 큐레이터의 의사결정을 지원한다. Phase 1-4를 통해 현재 가치 평가, 궤적 시각화, 비교 분석, AI 보고서를 제공한다.

### 1.4 가정 및 제약 (Assumptions and Constraints)

**데이터 가정**:
- 데이터 사전 포착 (Firestore에 사전 계산된 데이터 저장)
- ±0.5p 일관성 검증 통과

**성능 제약**:
- 토큰 사용량 <50K/요청 (Phase 4)
- API 응답 시간 p95 <300ms
- Firestore 읽기 ops <1M/month

**기술 제약**:
- Firebase Functions 백엔드 (Node.js 20)
- Firestore NoSQL 데이터베이스
- Vertex AI 통합 (Gemini 1.5 Pro)

**사용자 규모**:
- MVP: 30명 사용자 지원

### 1.5 문서 개요 (Document Overview)

본 문서는 다음과 같은 계층 구조로 구성된다:

1. **문서 메타데이터**: 문서 정보 및 참조 링크
2. **서론**: 목적, 범위, 배경, 가정/제약
3. **방법론**: 요구사항 도출, 우선순위, 검증 방법
4. **기능 요구사항**: 사용자 요구사항, 데이터 흐름, 논리 데이터 모델, 상세 FR (Phase별)
5. **사용 사례**: 4-6개 Use Case (UC-P1-001 ~ UC-P4-001)
6. **기타 요구사항**: 인터페이스, 데이터 변환, 하드웨어/소프트웨어, 운영
7. **부록**: 용어집, 추적성 매트릭스, TBD 목록

---

## 2. 방법론 (Methodology)

### 2.1 요구사항 도출 (Requirements Elicitation)

**SRD 워크숍**: 프로덕트 오너 및 이해관계자와 협의하여 고수준 요구사항 정의 (SRD v1.0)

**API 프로토타이핑**: 실제 구현 전 API 엔드포인트 설계 및 스펙 작성 (API Spec v1.0)

**FR 세부화**: API Spec의 엔드포인트를 기반으로 FR의 입력/출력, 검증 규칙 상세화

### 2.2 우선순위 (Prioritization)

**MoSCoW 방법론** 적용:

- **Must (필수)**: Phase 1-4 쿼리 기능 (FR-P1-SUM-001, FR-P2-TIM-001, FR-P3-CMP-001, FR-P4-RPT-001)
- **Should (중요)**: 배치 API (FR-P2-BAT-001), 이벤트 영향 분석 (FR-P2-EVT-001)
- **Could (선택)**: 실시간 업데이트, 고급 필터링
- **Won't (제외)**: 사용자 인증 (v1.1), 모바일 앱

### 2.3 검증 (Verification)

**AC 정렬**: 각 FR의 수용 기준(AC)이 API Spec의 응답 스키마와 정확히 매핑

**스키마 강화**: JSON Schema 검증 규칙(required 필드, enum 값, pattern)을 FR의 검증 규칙으로 명시

**테스트 커버리지**: 각 FR에 대해 단위/통합/E2E 테스트 케이스 링크 제공

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 사용자 요구사항 (User Requirements)

**주요 액터**: 큐레이터 (Curator)

**고급 요구사항**:

1. **요약 조회**: 큐레이터는 아티스트 ID를 입력하여 현재 가치 구성(radar5, sunburst_l1)을 조회할 수 있어야 한다.
2. **궤적 분석**: 큐레이터는 아티스트의 커리어 궤적을 시계열 데이터로 시각화할 수 있어야 한다.
3. **비교 분석**: 큐레이터는 두 아티스트를 비교하여 상관관계 및 차이점을 분석할 수 있어야 한다.
4. **AI 보고서**: 큐레이터는 AI 기반 종합 보고서를 생성하여 의사결정을 지원받을 수 있어야 한다.

### 3.2 데이터 흐름 개요 (Data Flow Overview)

```
사용자 요청 (React Client)
  ↓
Firebase Hosting (/api/* 프록시)
  ↓
Firebase Functions (API 엔드포인트)
  ↓
Firestore 쿼리 검증 (패턴/enum)
  ↓
데이터 조회/계산 (인덱스 히트, Time Window Rules 적용)
  ↓
응답 변환 (JSON Schema 검증)
  ↓
클라이언트 응답 (React Query 캐싱)
```

**Phase별 데이터 흐름**:

- **Phase 1**: Firestore `artist_summary` → API 검증 → `radar5`/`sunburst_l1` 반환
- **Phase 2**: Firestore `timeseries` → Time Window Rules 적용 → `bins` 배열 반환
- **Phase 3**: Firestore `compare_pairs` (또는 실시간 계산) → `series`/`metrics` 반환
- **Phase 4**: Phase 1-3 데이터 취합 → Vertex AI 호출 → Markdown 보고서 반환

### 3.3 논리 데이터 모델 (Logical Data Model)

**엔티티 (Entities)**:

- **Artist**: 아티스트 정보 (`artist_id`, `name`)
- **Timeseries**: 시계열 데이터 (`artist_id`, `axis`, `bins[]`)
- **Comparison**: 비교 데이터 (`pair_id`, `artistA`, `artistB`, `axis`, `series[]`)
- **Report**: AI 보고서 (`report_id`, `content`, `token_usage`)

**축 Enum (Axis Enum)**:

- `제도`: 제도적 성취 (기관전시, 상 등)
- `학술`: 학술적 활동 (논문, 학회 등)
- `담론`: 담론적 영향 (미디어, 비평 등)
- `네트워크`: 네트워크 연결 (협업, 관계 등)

**Bins 구조**:

```typescript
interface Bin {
  t: number;      // t_relative (상대 시간축, 데뷔년 기준)
  v: number;      // 값 (0-100)
}
```

**시계열 데이터 예시**:

```json
{
  "bins": [
    { "t": 0, "v": 0.1 },
    { "t": 5, "v": 0.45 },
    { "t": 10, "v": 0.78 }
  ]
}
```

---

## 4. 상세 기능 요구사항 (Detailed Functional Requirements)

### 4.1 Phase 1: 현재 가치 분석 (Current Value Analysis)

#### FR-P1-SUM-001: 아티스트 요약 데이터 조회

**설명**: 시스템은 아티스트 ID를 입력받아 `artist_summary` 컬렉션에서 radar5와 sunburst_l1 데이터를 조회하여 반환해야 한다.

**SRD FR ID**: [FR-P1-DQ-001](SRD.md#fr-p1-dq-001-아티스트-요약-데이터-조회)

**API 매핑**: `GET /api/artist/{id}/summary` ([API Spec Section 4.2](../api/API_SPECIFICATION.md#get-apipartistidsummary))

**입력 (Input)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID (Path Parameter) |
| `version` | string | No | - | weights_version (Query Parameter, default: latest) |

**출력 (Output)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `artist_id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID |
| `name` | string | Yes | - | 아티스트 이름 |
| `radar5` | object | Yes | Required: `I`, `F`, `A`, `M`, `Sedu` | 5축 레이더 데이터 |
| `radar5.I` | number | Yes | Range: 0-100 | Institution (기관전시) |
| `radar5.F` | number | Yes | Range: 0-100 | Fair (아트페어) |
| `radar5.A` | number | Yes | Range: 0-100 | Award (시상) |
| `radar5.M` | number | Yes | Range: 0-100 | Media (미디어) |
| `radar5.Sedu` | number | Yes | Range: 0-100 | Seduction (교육) |
| `sunburst_l1` | object | Yes | Required: `제도`, `학술`, `담론`, `네트워크` | 선버스트 L1 데이터 |
| `sunburst_l1.제도` | number | Yes | Range: 0-1 | 제도적 성취 비율 |
| `sunburst_l1.학술` | number | Yes | Range: 0-1 | 학술적 활동 비율 |
| `sunburst_l1.담론` | number | Yes | Range: 0-1 | 담론적 영향 비율 |
| `sunburst_l1.네트워크` | number | Yes | Range: 0-1 | 네트워크 연결 비율 |
| `weights_version` | string | Yes | - | 가중치 버전 |
| `updated_at` | string | Yes | ISO 8601 | 업데이트 시간 |
| `consistency_check` | object | Yes | - | 일관성 검증 결과 |
| `consistency_check.passed` | boolean | Yes | - | ±0.5p 검증 통과 여부 |
| `consistency_check.error` | number | Yes | Range: 0-0.5 | 오차 값 |

**사전 조건 (Preconditions)**:

- Firestore `artist_summary` 컬렉션이 존재해야 함
- `artist_id`가 유효한 형식이어야 함 (`^ARTIST_\d{4}$`)

**사후 조건 (Postconditions)**:

- 응답 시간 < 2초 (p95)
- ±0.5p 일관성 검증 통과 (radar5 합계 vs sunburst_l1 매핑 합계)
- HTTP 상태 코드 200 (성공) 또는 404 (데이터 없음, mock 반환 시도)

**예외 처리 (Exception Handling)**:

- **404 Not Found**: 데이터 없을 시 `mockData.js`에서 조회 후 반환 (로그 기록)
- **400 Bad Request**: `artist_id` 패턴 불일치 시 `ERR_INVALID_PARAM` 반환

**AC 커버리지**: 100% ([AC-P1-DQ-001](SRD.md#fr-p1-dq-001-아티스트-요약-데이터-조회))

**테스트 케이스**: [E2E-P1-001](../testing/E2E_TEST_SCENARIOS.md#s1-phase-1-로딩렌더링)

---

#### FR-P1-SUN-001: Sunburst 상세 데이터 조회

**설명**: 시스템은 아티스트 ID를 입력받아 sunburst 상세 데이터(L1/L2 계층)를 조회하여 반환해야 한다.

**SRD FR ID**: FR-P1-DQ-001 (보완)

**API 매핑**: `GET /api/artist/{id}/sunburst` ([API Spec Section 4.2](../api/API_SPECIFICATION.md#get-apipartistidsunburst))

**입력 (Input)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID (Path Parameter) |

**출력 (Output)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `sunburst` | object | Yes | - | Sunburst 데이터 |
| `sunburst.l1` | object | Yes | Required: `제도`, `학술`, `담론`, `네트워크` | L1 계층 |
| `sunburst.l2` | object | No | - | L2 계층 (예: `제도.전시`, `제도.상`) |
| `artist_id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID |
| `generated_at` | string | Yes | ISO 8601 | 생성 시간 |

**사전 조건 (Preconditions)**:

- Firestore `sunburst_snapshots` 또는 `artist_summary` 컬렉션 접근 가능

**사후 조건 (Postconditions)**:

- 응답 시간 < 2초
- L1 데이터 정확도 100%
- 스냅샷 없을 시 on-the-fly 생성 및 저장

**예외 처리 (Exception Handling)**:

- **404 Not Found**: 아티스트 없음
- **500 Internal Server Error**: on-the-fly 생성 실패

**AC 커버리지**: 80% (SRD FR-P1-DQ-001 확장)

---

### 4.2 Phase 2: 커리어 궤적 분석 (Career Trajectory Analysis)

#### FR-P2-TIM-001: 시계열 데이터 조회

**설명**: 시스템은 아티스트 ID와 축을 입력받아 `timeseries` 컬렉션에서 `bins[{t,v}]` 데이터를 조회하여 반환해야 한다. Time Window Rules가 적용되어야 한다.

**SRD FR ID**: [FR-P2-DQ-001](SRD.md#fr-p2-dq-001-시계열-데이터-조회)

**API 매핑**: `GET /api/artist/{id}/timeseries/{axis}` ([API Spec Section 4.3](../api/API_SPECIFICATION.md#get-apipartistidtimeseriesaxis))

**입력 (Input)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID (Path Parameter) |
| `axis` | string | Yes | Enum: `제도`, `학술`, `담론`, `네트워크` | 축 이름 (Path Parameter, 엄격 enum 검증) |
| `window` | string | No | - | 시간창 (Query Parameter, default: "default") |
| `limit` | integer | No | Range: 1-100 | bins 개수 (Query Parameter, default: 50) |

**출력 (Output)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `artist_id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID |
| `axis` | string | Yes | Enum: `제도`, `학술`, `담론`, `네트워크` | 축 이름 |
| `bins` | array[Bin] | Yes | MinItems: 1, MaxItems: 100 | 시계열 bins 배열 |
| `bins[].t` | integer | Yes | Minimum: 0 | 상대 시간축 (t_relative) |
| `bins[].v` | number | Yes | Range: 0-100 | 값 |
| `window_applied` | object | Yes | - | 적용된 시간창 규칙 |
| `window_applied.type` | string | Yes | - | 규칙 타입 (예: "10y_weighted") |
| `window_applied.boost` | number | Yes | - | 가중치 boost 값 |
| `version` | string | Yes | - | 데이터 버전 |

**사전 조건 (Preconditions)**:

- Firestore `timeseries` 컬렉션에 복합 인덱스 `(artist_id, axis, version DESC)` 존재
- `axis`가 유효한 enum 값이어야 함

**사후 조건 (Postconditions)**:

- 응답 시간 < 300ms (p95)
- Time Window Rules 적용 완료
- bins 배열이 시간순 정렬됨 (`bins[i].t < bins[i+1].t`)
- 인덱스 히트율 99%

**예외 처리 (Exception Handling)**:

- **400 Bad Request**: `axis` enum 불일치 시 `ERR_INVALID_AXIS` 반환
- **404 Not Found**: 데이터 없을 시 빈 배열 반환
- **500 Internal Server Error**: Rules 적용 실패 시 로그 기록

**AC 커버리지**: 100% ([AC-P2-DQ-001](SRD.md#fr-p2-dq-001-시계열-데이터-조회))

**테스트 케이스**: [E2E-P2-001](../testing/E2E_TEST_SCENARIOS.md#s2-phase-1--2-드릴다운)

---

#### FR-P2-EVT-001: 이벤트 영향 분석

**설명**: 시스템은 timeseries와 events를 조인하여 영향도(delta_v)를 계산하여 반환해야 한다.

**SRD FR ID**: [FR-P2-DQ-002](SRD.md#fr-p2-dq-002-이벤트-영향-분석)

**API 매핑**: `GET /api/artist/{id}/events/{axis}` ([API Spec Section 4.3](../api/API_SPECIFICATION.md#get-apipartistideventsaxis))

**입력 (Input)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID |
| `axis` | string | Yes | Enum: `제도`, `학술`, `담론`, `네트워크` | 축 이름 |

**출력 (Output)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `events` | array[EventImpact] | Yes | MaxItems: 5 | 이벤트 영향 배열 (상위 5개) |
| `events[].t` | integer | Yes | Minimum: 0 | 시간축 (t_relative) |
| `events[].delta_v` | number | Yes | - | 영향도 변화량 |
| `events[].type` | string | Yes | - | 이벤트 타입 (예: "전시") |
| `events[].event_id` | string | Yes | Pattern: `^EVENT_\d{3}$` | 이벤트 ID |
| `artist_id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID |
| `axis` | string | Yes | Enum | 축 이름 |

**사전 조건 (Preconditions)**:

- Firestore `timeseries` 및 `events` 컬렉션 접근 가능
- `edges` 컬렉션에서 관계 데이터 조회 가능

**사후 조건 (Postconditions)**:

- 응답 시간 < 300ms
- 영향도 계산 정확도 > 90%
- 상위 5개 이벤트만 반환

**예외 처리 (Exception Handling)**:

- **400 Bad Request**: `axis` enum 불일치
- **404 Not Found**: 데이터 없음

**AC 커버리지**: 100% ([AC-P2-DQ-002](SRD.md#fr-p2-dq-002-이벤트-영향-분석))

**테스트 케이스**: [E2E-P2-004](../testing/E2E_TEST_SCENARIOS.md)

---

#### FR-P2-BAT-001: 배치 시계열 데이터 조회

**설명**: 시스템은 아티스트 ID와 다중 축 배열을 입력받아 단일 요청으로 모든 축의 시계열 데이터를 조회하여 반환해야 한다.

**SRD FR ID**: FR-P2-DQ-001 (확장, 효율성 향상)

**API 매핑**: `POST /api/batch/timeseries` ([API Spec Section 4.3](../api/API_SPECIFICATION.md#post-apibatchtimeseries))

**입력 (Input)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `artist_id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID (Request Body) |
| `axes` | array[string] | Yes | MinItems: 1, MaxItems: 4, UniqueItems: true | 축 이름 배열 (Enum: `제도`, `학술`, `담론`, `네트워크`) |
| `options` | object | No | - | 옵션 |
| `options.limit` | integer | No | Range: 1-100 | bins 개수 (default: 50) |
| `options.window` | string | No | - | 시간창 (default: "default") |

**출력 (Output)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `artist_id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID |
| `timeseries` | object | Yes | - | 축별 시계열 데이터 |
| `timeseries.{axis}` | object | Yes | - | 각 축의 데이터 (예: `timeseries.제도`) |
| `timeseries.{axis}.axis` | string | Yes | Enum | 축 이름 |
| `timeseries.{axis}.bins` | array[Bin] | Yes | - | bins 배열 |
| `timeseries.{axis}.window_applied` | object | Yes | - | 적용된 시간창 규칙 |
| `version` | string | Yes | - | 데이터 버전 |

**사전 조건 (Preconditions)**:

- `axes` 배열에 중복 값 없음 (`uniqueItems: true`)
- 모든 `axes` 값이 유효한 enum 값

**사후 조건 (Postconditions)**:

- 응답 시간 < 500ms (4축 기준)
- 모든 축의 데이터가 정확히 반환됨
- 읽기 ops 효율화 (단일 요청 vs 4개 개별 요청)

**예외 처리 (Exception Handling)**:

- **400 Bad Request**: 
  - `artist_id` 패턴 불일치
  - `axes` enum 불일치
  - 중복 `axes` 값
  - `axes` 배열 길이 초과 (MaxItems: 4)
- **404 Not Found**: 아티스트 없음
- **500 Internal Server Error**: 처리 실패

**AC 커버리지**: 95% (신규 FR, SRD 확장)

**Use Case**: Phase 2 UI에서 4축 동시 로드 시 효율성 향상

---

### 4.3 Phase 3: 비교 분석 (Comparison Analysis)

#### FR-P3-CMP-001: 두 아티스트 비교 데이터 조회

**설명**: 시스템은 두 아티스트 ID와 축을 입력받아 `compare_pairs` 컬렉션에서 사전 계산 데이터를 조회하거나, 없을 경우 실시간 계산을 수행하여 반환해야 한다.

**SRD FR ID**: [FR-P3-DQ-001](SRD.md#fr-p3-dq-001-비교-데이터-조회)

**API 매핑**: `GET /api/compare/{artistA}/{artistB}/{axis}` ([API Spec Section 4.4](../api/API_SPECIFICATION.md#get-apicompareartistaartistbaxis))

**입력 (Input)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `artistA` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 첫 번째 아티스트 ID (Path Parameter) |
| `artistB` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 두 번째 아티스트 ID (Path Parameter) |
| `axis` | string | Yes | Enum: `제도`, `학술`, `담론`, `네트워크` | 축 이름 (Path Parameter) |
| `compute` | boolean | No | - | 실시간 계산 강제 (Query Parameter, default: false) |

**출력 (Output)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `pair_id` | string | Yes | Pattern: `^ARTIST_\d{4}_vs_\d{4}$` | 비교 쌍 ID |
| `axis` | string | Yes | Enum | 축 이름 |
| `series` | array[ComparisonSeries] | Yes | - | 비교 시계열 데이터 |
| `series[].t` | integer | Yes | Minimum: 0 | 시간축 |
| `series[].v_A` | number | Yes | Range: 0-100 | 아티스트 A 값 |
| `series[].v_B` | number | Yes | Range: 0-100 | 아티스트 B 값 |
| `series[].diff` | number | Yes | - | 차이값 (v_A - v_B) |
| `metrics` | object | Yes | - | 비교 지표 |
| `metrics.correlation` | number | Yes | Range: -1 to 1 | 상관계수 |
| `metrics.abs_diff_sum` | number | Yes | Minimum: 0 | 절대 차이 합계 |
| `metrics.auc` | number | Yes | Range: 0-1 | Area Under Curve |
| `cached` | boolean | Yes | - | 캐시 사용 여부 |
| `computed_at` | string | Yes | ISO 8601 | 계산 시간 |

**사전 조건 (Preconditions)**:

- `artistA`와 `artistB`가 서로 다른 값이어야 함
- Firestore `compare_pairs` 또는 `timeseries` 컬렉션 접근 가능

**사후 조건 (Postconditions)**:

- 응답 시간 < 500ms (캐시 히트 시) 또는 < 1초 (실시간 계산 시)
- 캐시 히트율 > 80%
- 계산 정확도 > 95%
- 결과가 `compare_pairs` 컬렉션에 캐시 저장 (TTL: 24시간)

**예외 처리 (Exception Handling)**:

- **400 Bad Request**: 
  - `artistA` 또는 `artistB` 패턴 불일치
  - `axis` enum 불일치
  - `artistA` === `artistB` (동일 아티스트 비교 불가)
- **404 Not Found**: 데이터 없음 (실시간 계산 트리거)
- **500 Internal Server Error**: 계산 실패 (보간 오류 등)

**AC 커버리지**: 100% ([AC-P3-DQ-001](SRD.md#fr-p3-dq-001-비교-데이터-조회))

**테스트 케이스**: [E2E-P3-001](../testing/E2E_TEST_SCENARIOS.md#s4-phase-3-비교-분석)

---

### 4.4 Phase 4: AI 보고서 생성 (AI Report Generation)

#### FR-P4-RPT-001: AI 보고서 생성

**설명**: 시스템은 아티스트 ID를 입력받아 Phase 1-3 데이터를 취합한 후, Vertex AI (Gemini 1.5 Pro)를 호출하여 종합 보고서를 생성하여 반환해야 한다. 실패 시 폴백 메커니즘을 적용해야 한다.

**SRD FR ID**: [FR-P4-RP-001](SRD.md#fr-p4-rp-001-vertex-ai-호출)

**API 매핑**: `POST /api/report/generate` ([API Spec Section 4.5](../api/API_SPECIFICATION.md#post-apireportgenerate))

**입력 (Input)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `artist_id` | string | Yes | Pattern: `^ARTIST_\d{4}$` | 아티스트 ID (Request Body) |
| `include_phases` | array[string] | No | UniqueItems: true, Items: Enum `["1", "2", "3"]` | 포함할 Phase (default: all) |
| `compare_with` | string | No | Pattern: `^ARTIST_\d{4}$` | 비교 대상 (Phase 3 포함 시 필수) |
| `prompt_options` | object | No | - | 토큰 최적화 옵션 |
| `prompt_options.compress_level` | string | No | Enum: `"low"`, `"medium"`, `"high"` | 압축 레벨 (default: "medium") |
| `prompt_options.max_events` | integer | No | Range: 1-50 | 최대 이벤트 수 (default: 10) |

**출력 (Output)**:

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|----------|------|
| `report_id` | string | Yes | Pattern: `^REPORT_\d{3}$` | 보고서 ID |
| `content` | string | Yes | - | Markdown 형식 보고서 내용 |
| `model_used` | string | Yes | Enum: `"gemini-1.5-pro"`, `"gpt-4"`, `"template"` | 사용된 모델 |
| `token_usage` | object | Yes | - | 토큰 사용량 |
| `token_usage.input` | integer | Yes | Maximum: 50000 | 입력 토큰 수 |
| `token_usage.output` | integer | Yes | - | 출력 토큰 수 |
| `generated_at` | string | Yes | ISO 8601 | 생성 시간 |
| `cost_estimate` | number | Yes | Maximum: 0.01 | 비용 추정 (USD) |

**사전 조건 (Preconditions)**:

- Phase 1-3 데이터가 준비되어 있어야 함
- Vertex AI 또는 OpenAI API 키가 Secret Manager에 저장되어 있어야 함
- `artist_id`가 유효한 형식이어야 함

**사후 조건 (Postconditions)**:

- 보고서 생성 시간 < 30초
- 입력 토큰 < 50K (NFR-P4-TO-001)
- 성공률 ≥ 95% (폴백 포함)
- 비용 < $0.01/요청

**폴백 메커니즘 (Fallback Mechanism)**:

1. **1차 시도**: Vertex AI (Gemini 1.5 Pro) 호출
2. **2차 시도**: Vertex 실패 시 OpenAI GPT-4 호출 (`max_tokens=2000`)
3. **3차 시도**: GPT-4 실패 시 템플릿 보고서 생성 (`ERR_AI_FAILED` 로그 기록)

**예외 처리 (Exception Handling)**:

- **400 Bad Request**: 
  - `artist_id` 패턴 불일치
  - `include_phases` enum 불일치
  - `compare_with` 패턴 불일치 (Phase 3 포함 시)
  - `prompt_options.compress_level` enum 불일치
  - `prompt_options.max_events` 범위 초과
- **429 Too Many Requests**: 
  - Rate limit 초과
  - 토큰 초과 (`ERR_TOKEN_EXCEEDED`)
- **500 Internal Server Error**: 
  - AI 실패 (폴백 로그, `ERR_AI_FAILED`)
- **503 Service Unavailable**: Vertex unavailable

**AC 커버리지**: 100% ([AC-P4-RP-001](SRD.md#fr-p4-rp-001-vertex-ai-호출))

**테스트 케이스**: [E2E-P4-001](../testing/E2E_TEST_SCENARIOS.md#s5-phase-4-ai-보고서-생성)

---

## 5. 사용 사례 (Use Cases)

### UC-P1-001: 아티스트 요약 데이터 조회

**액터**: 큐레이터 (Curator)

**목적**: 아티스트의 현재 가치 구성을 조회하여 Phase 1 화면에 표시

**사전 조건**: 큐레이터가 아티스트 ID를 알고 있음

**주 흐름 (Main Flow)**:

1. 큐레이터가 아티스트 ID를 입력 (예: ARTIST_0005)
2. 시스템이 `GET /api/artist/{id}/summary` 호출
3. 시스템이 `artist_id` 패턴 검증 (`^ARTIST_\d{4}$`)
4. 시스템이 Firestore `artist_summary` 컬렉션 조회
5. 시스템이 ±0.5p 일관성 검증 수행
6. 시스템이 `{radar5, sunburst_l1}` 데이터 반환
7. UI가 레이더 차트 및 선버스트 차트 렌더링

**대안 흐름 (Alternative Flow)**:

- **3a**: `artist_id` 패턴 불일치 → 400 Bad Request 반환 (`ERR_INVALID_PARAM`)
- **4a**: Firestore 데이터 없음 → `mockData.js`에서 조회 후 반환 (로그 기록)

**사후 조건**: Phase 1 화면에 요약 데이터 표시 완료

**예외 사항**: 네트워크 오류, Firestore 다운

**관련 FR**: FR-P1-SUM-001

---

### UC-P2-001: 커리어 궤적 시계열 조회

**액터**: 큐레이터 (Curator)

**목적**: 아티스트의 커리어 궤적을 시계열 데이터로 시각화

**사전 조건**: Phase 1 요약 데이터 조회 완료

**주 흐름 (Main Flow)**:

1. 큐레이터가 Phase 2 화면으로 전환
2. 시스템이 `POST /api/batch/timeseries` 호출 (4축 동시 조회)
3. 시스템이 `artist_id` 및 `axes` 배열 검증
4. 시스템이 각 축별로 Firestore `timeseries` 컬렉션 조회
5. 시스템이 Time Window Rules 적용 (예: 제도 10년 가중)
6. 시스템이 `bins` 배열 반환
7. UI가 StackedAreaChart 렌더링 (4축 누적)

**대안 흐름 (Alternative Flow)**:

- **3a**: `axes` enum 불일치 → 400 Bad Request 반환 (`ERR_INVALID_AXIS`)
- **4a**: 배치 API 사용 불가 → 개별 `GET /api/artist/{id}/timeseries/{axis}` 호출 (Promise.all)

**사후 조건**: Phase 2 화면에 시계열 차트 표시 완료

**예외 사항**: Time Window Rules 적용 실패, 인덱스 미히트

**관련 FR**: FR-P2-TIM-001, FR-P2-BAT-001

---

### UC-P3-001: 두 아티스트 비교 분석

**액터**: 큐레이터 (Curator)

**목적**: 두 아티스트를 비교하여 상관관계 및 차이점 분석

**사전 조건**: 비교 대상 아티스트 ID 2개 선택 완료

**주 흐름 (Main Flow)**:

1. 큐레이터가 아티스트 A/B 선택 (예: ARTIST_0005, ARTIST_0010)
2. 큐레이터가 축 선택 (예: "제도")
3. 시스템이 `GET /api/compare/{artistA}/{artistB}/{axis}` 호출
4. 시스템이 `compare_pairs` 컬렉션에서 캐시 확인
5. **5a (캐시 히트)**: 캐시 데이터 반환
6. **5b (캐시 미스)**: `timeseries` A/B 조회 후 실시간 계산 (보간/AUC)
7. 시스템이 결과를 `compare_pairs`에 캐시 저장 (TTL: 24시간)
8. 시스템이 `{series, metrics}` 반환
9. UI가 ComparisonAreaChart 렌더링 (dual-line, diff 음영)

**대안 흐름 (Alternative Flow)**:

- **3a**: `artistA` === `artistB` → 400 Bad Request 반환
- **5b-1**: 실시간 계산 실패 → 500 Internal Server Error 반환

**사후 조건**: Phase 3 화면에 비교 차트 표시 완료

**예외 사항**: 계산 알고리즘 오류, 캐시 저장 실패

**관련 FR**: FR-P3-CMP-001

---

### UC-P4-001: AI 보고서 생성

**액터**: 큐레이터 (Curator)

**목적**: AI 기반 종합 보고서 생성으로 의사결정 지원

**사전 조건**: Phase 1-3 데이터 조회 완료 (또는 자동 취합)

**주 흐름 (Main Flow)**:

1. 큐레이터가 보고서 생성 버튼 클릭
2. 시스템이 `POST /api/report/generate` 호출
3. 시스템이 Phase 1-3 데이터 취합 (Promise.all 병렬 로드)
4. 시스템이 토큰 최적화 적용 (압축률 70%, 핵심 events 10개만)
5. 시스템이 Vertex AI (Gemini 1.5 Pro) 호출
6. Vertex AI가 Markdown 보고서 생성
7. 시스템이 `{content, token_usage, cost_estimate}` 반환
8. UI가 Markdown 보고서 렌더링 (React Markdown)

**대안 흐름 (Alternative Flow)**:

- **5a**: Vertex AI 실패 (429/500) → OpenAI GPT-4 호출 (`max_tokens=2000`)
- **5b**: GPT-4 실패 → 템플릿 보고서 생성 (`ERR_AI_FAILED` 로그)
- **4a**: 토큰 초과 → 압축 레벨 상향 조정 ("high")

**사후 조건**: Phase 4 화면에 AI 보고서 표시 완료, 생성 시간 < 30초

**예외 사항**: Vertex AI 다운, 비용 초과, 네트워크 타임아웃

**관련 FR**: FR-P4-RPT-001

---

## 6. 기타 요구사항 (Other Requirements)

### 6.1 인터페이스 요구사항 (Interface Requirements)

#### 6.1.1 API 스키마 (API Schema)

**JSON Schema 검증**: 모든 요청/응답은 JSON Schema로 검증되어야 한다.

**검증 라이브러리**: Joi 또는 express-validator 사용 권장

**예시 (Joi 검증)**:

```javascript
const schema = Joi.object({
  artist_id: Joi.string().pattern(/^ARTIST_\d{4}$/).required(),
  axes: Joi.array().items(Joi.string().valid('제도', '학술', '담론', '네트워크'))
    .min(1).max(4).unique().required()
});
```

**참조**: [API Spec Section 4](../api/API_SPECIFICATION.md#4-api-엔드포인트-api-endpoints)

#### 6.1.2 외부 인터페이스 (External Interfaces)

**Vertex AI**: 
- API: Vertex AI Gemini 1.5 Pro
- 인증: Secret Manager (`vertex-ai-credentials`)
- 폴백: OpenAI GPT-4 (`openai-api-key`)

**OpenAI**: 
- API: OpenAI GPT-4
- 인증: Secret Manager (`openai-api-key`)
- 폴백: 템플릿 보고서

#### 6.1.3 UI 인터페이스 (UI Interfaces)

**React Query 통합**: 
- 쿼리 키: `['artist', id, 'summary']` (캐싱 자동)
- 무효화: `useQueryClient().invalidateQueries(['artist', id])`

**참조**: [API Integration Guide Section 5.1](../api/API_INTEGRATION_GUIDE.md#5-react-query-통합)

### 6.2 데이터 변환 요구사항 (Data Transformation Requirements)

#### 6.2.1 이벤트 → 정규화 점수 (Event → Normalized Score)

**변환 규칙**: 
- 이벤트 타입별 가중치 적용 (예: 전시 > 아트페어)
- 축별 Time Window Rules 적용
- 정규화 범위: 0-100

**구현 모듈**: `src/algorithms/timeWindowRules.js`

#### 6.2.2 AI 출력 → HTML (AI Output → HTML)

**변환 규칙**: 
- Markdown → HTML 렌더링 (React Markdown)
- 섹션 네비게이션 지원 (Introduction, Analysis, Prediction)

**구현 모듈**: `src/components/ui/MarkdownReportDisplay.jsx`

### 6.3 하드웨어/소프트웨어 요구사항 (Hardware/Software Requirements)

**하드웨어**: 
- 서버리스 아키텍처 (GCP 관리)

**소프트웨어**: 
- Node.js 20
- Firebase Admin SDK
- Firebase Functions (nodejs20 runtime)
- React Query (`@tanstack/react-query`)

### 6.4 운영 요구사항 (Operational Requirements)

#### 6.4.1 로깅 (Logging)

**Cloud Logging**: 
- 모든 API 호출 로깅 (IP, timestamp, user_id)
- 구조화된 JSON 형식
- 에러 로그 자동 알림 (PagerDuty)

**구현**: Firebase Functions logger

#### 6.4.2 백업 (Backup)

**Firestore 자동 백업**: 
- 일일 자동 백업
- 7일 보관
- Point-in-time recovery 지원

**구현**: Cloud Firestore 백업

---

## 7. 부록 (Appendix)

### 7.1 용어집 (Glossary)

| 용어 | 정의 |
|------|------|
| **Axis (축)** | 데이터 분석 축 (제도, 학술, 담론, 네트워크) |
| **Radar5** | 5축 레이더 차트 (I, F, A, M, Sedu) |
| **Sunburst4** | 4축 선버스트 차트 (제도, 학술, 담론, 네트워크) |
| **Bins** | 시계열 데이터 포인트 배열 `[{t, v}, ...]` |
| **t_relative** | 데뷔년 기준 상대 시간축 (`t = year - debut_year`) |
| **UUID** | 범용 고유 식별자 (본 시스템: `ARTIST_\d{4}` 패턴) |
| **±0.5p 일관성** | 레이더 합계와 선버스트 L1 매핑 합계의 허용 오차 (0.5 이내) |
| **Time Window Rules** | 축별 시간창 규칙 (담론: 24개월, 제도: 10년 가중 등) |
| **AUC** | Area Under Curve (비교 분석 지표) |
| **p95** | 95th percentile (성능 지표) |

### 7.2 추적성 매트릭스 (Traceability Matrix)

| FR ID | 설명 | SRD FR ID | API 엔드포인트 | AC 커버리지(%) | 리스크 |
|-------|------|-----------|---------------|---------------|--------|
| FR-P1-SUM-001 | 요약 데이터 조회 | FR-P1-DQ-001 | GET `/api/artist/{id}/summary` | 100% | 낮음 |
| FR-P1-SUN-001 | Sunburst 상세 조회 | FR-P1-DQ-001 (확장) | GET `/api/artist/{id}/sunburst` | 80% | 낮음 |
| FR-P2-TIM-001 | 시계열 데이터 조회 | FR-P2-DQ-001 | GET `/api/artist/{id}/timeseries/{axis}` | 100% | 중간 |
| FR-P2-EVT-001 | 이벤트 영향 분석 | FR-P2-DQ-002 | GET `/api/artist/{id}/events/{axis}` | 100% | 중간 |
| FR-P2-BAT-001 | 배치 시계열 조회 | FR-P2-DQ-001 (확장) | POST `/api/batch/timeseries` | 95% | 낮음 |
| FR-P3-CMP-001 | 비교 데이터 조회 | FR-P3-DQ-001 | GET `/api/compare/{artistA}/{artistB}/{axis}` | 100% | 중간 |
| FR-P4-RPT-001 | AI 보고서 생성 | FR-P4-RP-001 | POST `/api/report/generate` | 100% | 높음 |

**리스크 설명**:
- **낮음**: 단순 조회, 명확한 스키마
- **중간**: 복잡한 계산, Time Window Rules 적용
- **높음**: 외부 AI 의존성, 폴백 메커니즘 필요

### 7.3 TBD 목록 (To Be Determined)

**다이어그램 (Diagrams)**:
- [ ] Figma UI 모델 (향후)
- [ ] 상세 Sequence Diagram (아키텍처 문서 참조)

**배치 우선순위 (Batch Priority)**:
- [ ] 배치 API 최적화 전략 (향후 확장)
- [ ] 캐시 전략 세부화 (TTL 조정)

**향후 확장 (Future Enhancements)**:
- [ ] 사용자 인증 (v1.1)
- [ ] 실시간 업데이트 (WebSocket)
- [ ] 고급 필터링 API

---

**문서 버전 관리**:
- v1.0 (2025-11-02): 초기 작성 (API Spec 기반, SRD FR 매핑)
- 향후 업데이트: API 변경 시 FRD 동시 업데이트

**주의사항**: 본 문서는 SRD FR을 100% 커버하며, API Spec과 일치하도록 유지 관리된다.

