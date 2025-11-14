# CO-1016 CURATOR ODYSSEY: API Specification v1.0

## Document Metadata (문서 메타)

**Document Name**: CO-1016 CURATOR ODYSSEY API Specification v1.0

**Version**: 1.1

**Status**: Draft (초안, SRD v1.0 및 TSD v1.0 기반)

**Last Modified**: 2025-11-10

**Owner**: NEO GOD (Director)

**Approver**: Product Owner (TBD)

**Revision History**:
- v1.0 (2025-11-02): SRD Phase 1-4 FR 및 TSD API Layer 기반 엔드포인트 정의, OpenAPI 3.0 호환 스펙화
- v1.1 (2025-11-10): 문서 동기화 및 참조 관계 확정, FR ID 매핑 추가

**Distribution Scope**: Backend Development Team (Firebase Functions), Frontend Development Team (React Query Integration), QA Team (Testing)

**Change Management Process**: GitHub Issues/PR 워크플로, 변경 시 SRD/TSD 동시 업데이트. API 변경 시 OpenAPI 스펙 재생성 (Swagger Editor 사용 권장)

### References (참조 문서)

- **[FRD v1.1](../requirements/FRD.md)** - Functional Requirements Document, SRD FR을 API 엔드포인트와 매핑한 상세 명세
- **[SRD v1.1](../requirements/SRD.md)** - Functional Requirements (FR) 및 Acceptance Criteria (AC)
- **[FR ID 매핑 테이블](../FR_ID_MAPPING.md)** - SRD FR ID와 FRD FR ID 간 매핑 관계
- **[TSD v1.1](../TSD.md)** - API Layer 상세 및 Functions 구현
- **[BRD v1.1](../requirements/BRD.md)** - 피지컬 컴퓨팅 아트워크 및 웹앱 통합 비즈니스 요구사항
- **[피지컬 컴퓨팅 API Spec](physical-computing/PHYSICAL_COMPUTING_API_SPEC.md)** - 피지컬 컴퓨팅 아트워크 API 명세서
- **[API Integration Guide](API_INTEGRATION_GUIDE.md)** - React Query 통합, 오류 처리
- **[OpenAPI Specification YAML](OPENAPI_SPECIFICATION.yaml)** - 본 명세서의 YAML 버전 (자동 생성 가능)

### Technology Stack (기술 스택)

**Backend**: Firebase Functions (Node.js 20, Express.js 호환 라우팅)

**Proxy**: Firebase Hosting (`/api/*` rewrites)

**Authentication**: 향후 Firebase Authentication (현재 공개 API, API Key 또는 Secret Manager 보호)

**Documentation Tools**: OpenAPI 3.0, Swagger UI (테스트용)

---

## 1. 개요와 범위 (Overview and Scope)

### 1.1 목적 (Purpose)

본 명세서는 CO-1016 CURATOR ODYSSEY 플랫폼의 RESTful API를 정의하며, Phase 1-4 기능을 지원하는 엔드포인트를 중심으로 요청/응답 형식, 매개변수, 오류 코드를 명확히 한다. Firebase Functions를 통해 서버리스로 구현되며, React Query를 통한 프론트엔드 통합을 가정한다. 이는 SRD의 FR (e.g., FR-P1-DQ-001)과 연계되어 추적성을 보장한다.

### 1.2 비즈니스 가치 (Business Value)

- **데이터 쿼리 효율화**: Firestore 인덱스 최적화로 p95 응답 <300ms 달성
- **AI 통합**: Vertex AI 호출을 통해 보고서 생성 <30초
- **확장성**: 서버리스 아키텍처로 30명 사용자 지원 (월 읽기 ops <1M)

### 1.3 In Scope (범위 내)

- **Phase 1**: Summary data retrieval (`/summary`)
- **Phase 2**: Timeseries data retrieval (`/timeseries`) + Batch API (`/batch/timeseries`)
- **Phase 3**: Comparison data retrieval (`/compare`)
- **Phase 4**: AI report generation (`/report/generate`)
- **WebSocket 통신**: 피지컬 컴퓨팅 아트워크와의 실시간 통신 (WebSocket 프로토콜)
- **Common**: Error handling, caching (React Query + Functions TTL), token optimization

### 1.4 Out of Scope (범위 외)

- User authentication endpoints (향후 Firebase Auth 도입 예정, v1.1)
- Large-scale batch API (ETL 파이프라인 별도)
- WebSocket real-time updates for CuratorOdyssey (웹 폴링 사용, 피지컬 컴퓨팅 아트워크는 WebSocket 사용)

### 1.5 가정과 제약 (Assumptions and Constraints)

**Base URL**: 
- Production: `https://co-1016.web.app/api`
- Development: `http://localhost:5002/api`

**Rate Limiting**: Functions 내 10 req/min (사용자별, 초과 시 429)

**Authentication**: 현재 공개 (Secret Manager로 AI 키 보호), 향후 Bearer Token

**Error Handling**: JSON 형식, HTTP 4xx/5xx 표준 + 커스텀 코드 (e.g., `ERR_DATA_NOT_FOUND`)

**Performance KPI**: p95 <300ms, 성공률 ≥99% (Cloud Monitoring)

### 1.6 성공 지표와 KPI (Success Metrics and KPIs)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| API 응답 시간 (p95) | <300ms | Cloud Monitoring latency |
| 성공률 (HTTP 2xx) | ≥99% | Cloud Logging 상태 코드 |
| 토큰 사용량 (Phase 4) | <50K/요청 | Vertex AI 메트릭 |
| Firestore 읽기 ops | <1M/month | Firestore 사용량 대시보드 |

---

## 2. 보안 및 접근 제어 (Security & Access Control)

### 2.1 Authentication Mechanism (인증 메커니즘)

**Current (v1.0)**: Public API (Firebase Rules allow read: `if true;`)

**Future (v1.1 - Q1 2026)**: Firebase Authentication (Email/Google OAuth), Bearer Token header (`Authorization: Bearer {token}`)

**API Key Protection**: Secret Manager (`openai-api-key`, `vertex-ai-credentials`) - Functions 내부 사용, 클라이언트 노출 금지

**Authentication Roadmap**:

| Version | Release Date | Features | Migration Guide |
|---------|-------------|----------|----------------|
| v1.0 | 2025-11-02 | Public API (no auth) | N/A |
| v1.1 | Q1 2026 (예정) | Firebase Auth (Email/Google OAuth) | [Migration Guide](../docs/auth/AUTH_MIGRATION_GUIDE.md) *(to be created)* |
| v1.2 | Q2 2026 (예정) | Role-based access control (RBAC) | TBD |

### 2.2 IAM Permissions (권한)

**Functions Service Account**: 
- `roles/datastore.user`
- `roles/aiplatform.user`
- `roles/secretmanager.secretAccessor`

**Firestore Rules Example**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artist_summary/{doc} { 
      allow read: if true;  // 공개 읽기
    }
    match /timeseries/{doc} { 
      allow read: if request.auth != null;  // 인증 필요 (향후)
    }
  }
}
```

**CORS**: Firebase Hosting 기본 (`*` 허용, Prod 시 도메인 제한)

### 2.3 Security Requirements (보안 요구사항, NFR-SEC-001 연계)

**Input Validation**: 
- `artist_id` (UUID 형식: `^ARTIST_\d{4}$`)
- `axis` (enum: `제도`/`학술`/`담론`/`네트워크`)

**Vulnerability Prevention**: 
- SQL Injection 불필요 (Firestore NoSQL)
- XSS (JSON 응답)

**Audit Logging**: 모든 API 호출 Cloud Logging (IP, timestamp, user_id)

**Rate Limiting**: Functions 내 구현 (e.g., redis-like 캐시로 추적)

---

## 3. 에러 핸들링 (Error Handling)

모든 응답은 JSON 형식:

```json
{
  "error": {
    "code": "ERR_INVALID_PARAM",
    "message": "Invalid artist ID format",
    "details": ["ID must be UUID"],
    "timestamp": "2025-11-02T01:29:00Z"
  },
  "status": 400
}
```

### 3.1 Common HTTP Status Codes (공통 HTTP 코드)

| 코드 | 설명 | 사용 시나리오 |
|------|------|--------------|
| **200 OK** | 성공 | 정상 응답 |
| **400 Bad Request** | 유효하지 않은 매개변수 | e.g., invalid axis |
| **404 Not Found** | 데이터 없음 | e.g., FR-P1-DQ-001 예외 |
| **429 Too Many Requests** | Rate limit 초과 | 초과 요청 |
| **500 Internal Server Error** | Functions 오류 | e.g., Vertex 실패 |
| **503 Service Unavailable** | Firestore/Vertex 다운 | 서비스 장애 |

### 3.2 Custom Error Codes (커스텀 에러 코드)

| 코드 | 설명 | HTTP 상태 |
|------|------|----------|
| `ERR_DATA_NOT_FOUND` | 데이터 없음 (mock 반환 시도) | 404 |
| `ERR_INVALID_PARAM` | 잘못된 매개변수 | 400 |
| `ERR_INVALID_AXIS` | 잘못된 축 (enum 범위 밖) | 400 |
| `ERR_AI_FAILED` | Phase 4 실패 (폴백 로그) | 500 |
| `ERR_TOKEN_EXCEEDED` | 토큰 초과 (압축 실패) | 429 |
| `ERR_RATE_LIMIT` | Rate limit 초과 | 429 |

### 3.3 Fallback Mechanism (폴백 메커니즘)

**오류 시**: `mockData.js` 반환 (테스트용, Prod 시 로그 + 알림)

**예시**: 404 응답 시 `mockData.js`에서 데이터 조회 후 반환 (로그 기록)

---

## 4. API 엔드포인트 (API Endpoints)

OpenAPI 3.0 호환 스펙. YAML 버전은 `OPENAPI_SPECIFICATION.yaml` 참조. 아래는 Markdown 요약.

### 4.1 Common Headers (공통 헤더)

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Request |
| `Accept` | `application/json` | Request |
| `X-Request-ID` | UUID (for tracing) | Optional |

---

### 4.2 Phase 1: Current Value Analysis (현재 가치 분석, FR-P1-DQ-001 등 연계)

#### GET /api/artist/{id}/summary

**FRD FR ID**: [FR-P1-SUM-001](../requirements/FRD.md#fr-p1-sum-001-아티스트-요약-데이터-조회)  
**SRD FR ID**: [FR-P1-DQ-001](../requirements/SRD.md#fr-p1-dq-001-아티스트-요약-데이터-조회)  
**구현 상태**: ✅ 구현 완료 (`functions/index.js`의 `getArtistSummary`)

**Description**: Retrieve artist summary data (radar5, sunburst_l1). Firestore `artist_summary` 쿼리, 인덱스 히트. (AC-P1-DQ-001)

**Path Parameters**:

| Parameter | Type | Required | Pattern | Description |
|---------|------|----------|---------|-------------|
| `id` | string | Yes | `^ARTIST_\d{4}$` | Artist ID (엄격 패턴 검증) |

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|---------|------|----------|---------|-------------|
| `version` | string | No | latest | weights_version |

**JSON Schema Validation**:

```json
{
  "type": "object",
  "required": ["artist_id", "radar5", "sunburst_l1"],
  "properties": {
    "artist_id": {
      "type": "string",
      "pattern": "^ARTIST_\\d{4}$"
    },
    "radar5": {
      "type": "object",
      "required": ["I", "F", "A", "M", "Sedu"],
      "properties": {
        "I": { "type": "number", "minimum": 0, "maximum": 100 },
        "F": { "type": "number", "minimum": 0, "maximum": 100 },
        "A": { "type": "number", "minimum": 0, "maximum": 100 },
        "M": { "type": "number", "minimum": 0, "maximum": 100 },
        "Sedu": { "type": "number", "minimum": 0, "maximum": 100 }
      },
      "additionalProperties": false
    },
    "sunburst_l1": {
      "type": "object",
      "required": ["제도", "학술", "담론", "네트워크"],
      "properties": {
        "제도": { "type": "number", "minimum": 0, "maximum": 1 },
        "학술": { "type": "number", "minimum": 0, "maximum": 1 },
        "담론": { "type": "number", "minimum": 0, "maximum": 1 },
        "네트워크": { "type": "number", "minimum": 0, "maximum": 1 }
      },
      "additionalProperties": false
    }
  }
}
```

**Response**:

**200 OK**:

```json
{
  "data": {
    "artist_id": "ARTIST_0005",
    "name": "양혜규",
    "radar5": {
      "I": 0.85,
      "F": 0.72,
      "A": 0.91,
      "M": 0.68,
      "Sedu": 0.79
    },
    "sunburst_l1": {
      "제도": 0.45,
      "학술": 0.28,
      "담론": 0.15,
      "네트워크": 0.12
    },
    "weights_version": "v1.0",
    "updated_at": "2025-11-01T00:00:00Z",
    "consistency_check": {
      "passed": true,
      "error": 0.2
    },
    "data_source": "firestore_p2"
  },
  "meta": {
    "cache_hit": true,
    "response_time": 150
  }
}
```

**400 Bad Request**: Invalid ID (pattern mismatch)

**404 Not Found**: 데이터 없음 (mock 반환 시도)

**Example Request**:
```bash
GET /api/artist/ARTIST_0005/summary?version=v1.0
```

**Example Response**: 위 JSON (200)

**Performance**: <2s, 읽기 ops: 1-2

**SRD Link**: [FR-P1-DQ-001](../requirements/SRD.md#fr-p1-dq-001-아티스트-요약-데이터-조회)

---

#### GET /api/artist/{id}/sunburst

**FRD FR ID**: [FR-P1-SUN-001](../requirements/FRD.md#fr-p1-sun-001-sunburst-상세-데이터-조회)  
**SRD FR ID**: [FR-P1-DQ-001](../requirements/SRD.md#fr-p1-dq-001-아티스트-요약-데이터-조회) (보완)  
**구현 상태**: ✅ 구현 완료 (`functions/index.js`의 `getArtistSunburst`)

**Description**: Retrieve sunburst detailed data (L1/L2 계층). TSD 참조, Phase 1 보완.

**Path Parameters**: `id` (string, required)

**Response**: **200 OK**

```json
{
  "data": {
    "sunburst": {
      "l1": {
        "제도": 0.45,
        "학술": 0.28,
        "담론": 0.15,
        "네트워크": 0.12
      },
      "l2": {
        "제도": {
          "전시": 0.3,
          "상": 0.15
        }
      }
    },
    "artist_id": "ARTIST_0005",
    "generated_at": "2025-11-02T00:00:00Z"
  }
}
```

**400 Bad Request**: Invalid ID

**404 Not Found**: 데이터 없음

**Performance**: <2s, 읽기 ops: 1-3

---

### 4.3 Phase 2: Career Trajectory Analysis (커리어 궤적 분석, FR-P2-DQ-001 등 연계)

#### GET /api/artist/{id}/timeseries/{axis}

**FRD FR ID**: [FR-P2-TIM-001](../requirements/FRD.md#fr-p2-tim-001-시계열-데이터-조회)  
**SRD FR ID**: [FR-P2-DQ-001](../requirements/SRD.md#fr-p2-dq-001-시계열-데이터-조회)  
**구현 상태**: ⚠️ 부분 구현 (`functions/index.js`의 `getArtistTimeseries`, 목업 데이터만 반환)

**Description**: Retrieve timeseries data by axis (`bins[{t,v}]`). Time Window Rules applied, composite index. (AC-P2-DQ-001)

**Path Parameters**:

| Parameter | Type | Required | Enum | Description |
|---------|------|----------|------|-------------|
| `id` | string | Yes | - | Artist ID |
| `axis` | string | Yes | `제도`, `학술`, `담론`, `네트워크` | Axis name (엄격 enum 검증) |

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|---------|------|----------|---------|-------------|
| `window` | string | No | default | Time window (e.g., "10y" for 제도) |
| `limit` | integer | No | 50 | Bins count (최소: 1, 최대: 100) |

**JSON Schema Validation**:

```json
{
  "type": "object",
  "required": ["artist_id", "axis"],
  "properties": {
    "artist_id": {
      "type": "string",
      "pattern": "^ARTIST_\\d{4}$"
    },
    "axis": {
      "type": "string",
      "enum": ["제도", "학술", "담론", "네트워크"]
    },
    "bins": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["t", "v"],
        "properties": {
          "t": { "type": "integer", "minimum": 0 },
          "v": { "type": "number", "minimum": 0, "maximum": 100 }
        }
      }
    }
  }
}
```

**Response**: **200 OK**

```json
{
  "data": {
    "artist_id": "ARTIST_0005",
    "axis": "제도",
    "bins": [
      { "t": 0, "v": 0.1 },
      { "t": 5, "v": 0.45 }
    ],
    "window_applied": {
      "type": "10y_weighted",
      "boost": 1.0
    },
    "version": "v1.0"
  },
  "meta": {
    "hits": 20,
    "response_time": 250
  }
}
```

**400 Bad Request**: Invalid axis (enum mismatch)

**404 Not Found**: 데이터 없음

**500 Internal Server Error**: Rules 적용 실패

**Example Request**:
```bash
GET /api/artist/ARTIST_0005/timeseries/제도?limit=20
```

**배치 지원**: 프론트에서 `Promise.all`로 다중 축 호출 권장 (또는 `/batch/timeseries` 사용)

**Performance**: <300ms, 읽기 ops: 1-10

**SRD Link**: [FR-P2-DQ-001](../requirements/SRD.md#fr-p2-dq-001-시계열-데이터-조회)

---

#### POST /api/batch/timeseries

**FRD FR ID**: [FR-P2-BAT-001](../requirements/FRD.md#fr-p2-bat-001-배치-시계열-데이터-조회)  
**SRD FR ID**: [FR-P2-DQ-001](../requirements/SRD.md#fr-p2-dq-001-시계열-데이터-조회) (확장)  
**구현 상태**: ❌ 미구현

**Description**: Batch timeseries retrieval for multiple axes (효율성 향상). Single request로 다중 축 조회.

**Request Body** (JSON, required):

```json
{
  "artist_id": "ARTIST_0005",
  "axes": ["제도", "학술", "담론", "네트워크"],
  "options": {
    "limit": 50,
    "window": "default"
  }
}
```

**Request Body Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `artist_id` | string | Yes | Artist ID (pattern: `^ARTIST_\d{4}$`) |
| `axes` | array[string] | Yes | Axis names (enum: `제도`, `학술`, `담론`, `네트워크`, 최소 1개, 최대 4개) |
| `options` | object | No | Query options |
| `options.limit` | integer | No | Bins count (default: 50, 최소: 1, 최대: 100) |
| `options.window` | string | No | Time window (default: "default") |

**JSON Schema Validation**:

```json
{
  "type": "object",
  "required": ["artist_id", "axes"],
  "properties": {
    "artist_id": {
      "type": "string",
      "pattern": "^ARTIST_\\d{4}$"
    },
    "axes": {
      "type": "array",
      "minItems": 1,
      "maxItems": 4,
      "items": {
        "type": "string",
        "enum": ["제도", "학술", "담론", "네트워크"]
      },
      "uniqueItems": true
    },
    "options": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100
        },
        "window": {
          "type": "string"
        }
      }
    }
  }
}
```

**Response**: **200 OK**

```json
{
  "data": {
    "artist_id": "ARTIST_0005",
    "timeseries": {
      "제도": {
        "axis": "제도",
        "bins": [
          { "t": 0, "v": 0.1 },
          { "t": 5, "v": 0.45 }
        ],
        "window_applied": {
          "type": "10y_weighted",
          "boost": 1.0
        }
      },
      "학술": {
        "axis": "학술",
        "bins": [
          { "t": 0, "v": 0.15 }
        ]
      }
    },
    "version": "v1.0"
  },
  "meta": {
    "response_time": 450,
    "axes_processed": 4,
    "total_read_ops": 8
  }
}
```

**400 Bad Request**: Invalid request body (invalid artist_id, invalid axes enum, duplicate axes)

**404 Not Found**: Artist not found

**500 Internal Server Error**: Processing failure

**Performance**: <500ms for 4 axes, 읽기 ops: 4-16 (단일 요청으로 효율화)

**Use Case**: Phase 2 UI에서 4축 동시 로드 시 효율성 향상 (단일 요청 vs 4개 개별 요청)

---

#### GET /api/artist/{id}/events/{axis}

**FRD FR ID**: [FR-P2-EVT-001](../requirements/FRD.md#fr-p2-evt-001-이벤트-영향-분석)  
**SRD FR ID**: [FR-P2-DQ-002](../requirements/SRD.md#fr-p2-dq-002-이벤트-영향-분석)  
**구현 상태**: ❌ 미구현

**Description**: Event impact analysis (delta_v). FR-P2-DQ-002 보완.

**Path Parameters**: `id` (string, required, pattern: `^ARTIST_\d{4}$`), `axis` (string, required, enum: `제도`, `학술`, `담론`, `네트워크`)

**Response**: **200 OK**

```json
{
  "data": {
    "events": [
      {
        "t": 5,
        "delta_v": 0.2,
        "type": "전시",
        "event_id": "EVENT_001"
      }
    ],
    "artist_id": "ARTIST_0005",
    "axis": "제도"
  }
}
```

**400 Bad Request**: Invalid axis (enum mismatch)

**404 Not Found**: 데이터 없음

**Performance**: <300ms, 읽기 ops: 2-5

**SRD Link**: [FR-P2-DQ-002](../requirements/SRD.md#fr-p2-dq-002-이벤트-영향-분석)

---

### 4.4 Phase 3: Comparison Analysis (비교 분석, FR-P3-DQ-001 등 연계)

#### GET /api/compare/{artistA}/{artistB}/{axis}

**FRD FR ID**: [FR-P3-CMP-001](../requirements/FRD.md#fr-p3-cmp-001-두-아티스트-비교-데이터-조회)  
**SRD FR ID**: [FR-P3-DQ-001](../requirements/SRD.md#fr-p3-dq-001-비교-데이터-조회)  
**구현 상태**: ✅ 구현 완료 (`functions/index.js`의 `getCompareArtists`)

**Description**: Compare two artists (`series[{t, v_A, v_B, diff}]`). Cache (`compare_pairs`) 또는 실시간 계산. (AC-P3-DQ-001)

**Path Parameters**:

| Parameter | Type | Required | Pattern/Enum | Description |
|---------|------|----------|--------------|-------------|
| `artistA` | string | Yes | `^ARTIST_\d{4}$` | First artist ID |
| `artistB` | string | Yes | `^ARTIST_\d{4}$` | Second artist ID |
| `axis` | string | Yes | `제도`, `학술`, `담론`, `네트워크` | Axis name (엄격 enum 검증) |

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|---------|------|----------|---------|-------------|
| `compute` | boolean | No | false | Force real-time calculation (default: false, 캐시 우선) |

**Response**: **200 OK**

```json
{
  "data": {
    "pair_id": "ARTIST_0005_vs_0010",
    "axis": "제도",
    "series": [
      {
        "t": 0,
        "v_A": 0.1,
        "v_B": 0.2,
        "diff": -0.1
      }
    ],
    "metrics": {
      "correlation": 0.85,
      "abs_diff_sum": 2.5,
      "auc": 0.78
    },
    "cached": true,
    "computed_at": "2025-11-02T00:00:00Z"
  },
  "meta": {
    "cache_hit": true,
    "response_time": 400
  }
}
```

**400 Bad Request**: Invalid parameters (pattern/enum mismatch)

**404 Not Found**: 데이터 없음 (실시간 계산 트리거)

**500 Internal Server Error**: 계산 실패 (e.g., 보간 오류)

**Example Request**:
```bash
GET /api/compare/ARTIST_0005/ARTIST_0010/제도?compute=true
```

**캐시 TTL**: 24시간 (Functions 내 구현)

**Performance**: <500ms, 읽기 ops: 2-20 (실시간 시)

**SRD Link**: [FR-P3-DQ-001](../requirements/SRD.md#fr-p3-dq-001-비교-데이터-조회)

---

### 4.5 Phase 4: AI Report Generation (AI 보고서 생성, FR-P4-RP-001 등 연계)

#### POST /api/report/generate

**FRD FR ID**: [FR-P4-RPT-001](../requirements/FRD.md#fr-p4-rpt-001-ai-보고서-생성)  
**SRD FR ID**: [FR-P4-RP-001](../requirements/SRD.md#fr-p4-rp-001-vertex-ai-호출)  
**구현 상태**: ✅ 구현 완료 (`functions/index.js`의 `generateAiReport`)

**Description**: Aggregate Phase 1-3 data and generate AI report. Vertex AI 호출, 토큰 최적화. (AC-P4-RP-001)

**Path Parameters**: None

**Request Body** (JSON, required):

```json
{
  "artist_id": "ARTIST_0005",
  "include_phases": ["1", "2", "3"],
  "compare_with": "ARTIST_0010",
  "prompt_options": {
    "compress_level": "high",
    "max_events": 10
  }
}
```

**Request Body Schema**:

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `artist_id` | string | Yes | Artist ID (pattern: `^ARTIST_\d{4}$`) |
| `include_phases` | array[string] | No | Phases to include (enum: `["1", "2", "3"]`, default: all) |
| `compare_with` | string | No | Comparison target (pattern: `^ARTIST_\d{4}$`, required if Phase 3 included) |
| `prompt_options` | object | No | Token optimization options |
| `prompt_options.compress_level` | string | No | Compression level (enum: `"low"`, `"medium"`, `"high"`, default: `"medium"`, 70% 압축) |
| `prompt_options.max_events` | integer | No | Maximum events (default: 10, 최소: 1, 최대: 50) |

**JSON Schema Validation**:

```json
{
  "type": "object",
  "required": ["artist_id"],
  "properties": {
    "artist_id": {
      "type": "string",
      "pattern": "^ARTIST_\\d{4}$"
    },
    "include_phases": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["1", "2", "3"]
      },
      "uniqueItems": true
    },
    "compare_with": {
      "type": "string",
      "pattern": "^ARTIST_\\d{4}$"
    },
    "prompt_options": {
      "type": "object",
      "properties": {
        "compress_level": {
          "type": "string",
          "enum": ["low", "medium", "high"]
        },
        "max_events": {
          "type": "integer",
          "minimum": 1,
          "maximum": 50
        }
      }
    }
  }
}
```

**Response**: **200 OK**

```json
{
  "data": {
    "report_id": "REPORT_001",
    "content": "## Introduction\n[AI 생성 Markdown]\n### Analysis\n...",
    "model_used": "gemini-1.5-pro",
    "token_usage": {
      "input": 35000,
      "output": 1500
    },
    "generated_at": "2025-11-02T01:29:00Z",
    "cost_estimate": 0.005
  },
  "meta": {
    "fallback_used": false,
    "response_time": 25
  }
}
```

**400 Bad Request**: Invalid request body (JSON Schema validation failed)

**429 Too Many Requests**: Rate limit or token exceed

**500 Internal Server Error**: AI 실패 (폴백 로그, e.g., GPT-4 시도)

**503 Service Unavailable**: Vertex unavailable

**Example Request**:
```bash
POST /api/report/generate
Content-Type: application/json

{
  "artist_id": "ARTIST_0005"
}
```

**폴백**: Vertex 실패 → GPT-4 (`max_tokens=2000`) → 템플릿 (`ERR_AI_FAILED` 반환)

**Performance**: <30s, 토큰 <50K (NFR-P4-TO-001)

**SRD Link**: [FR-P4-RP-001](../requirements/SRD.md#fr-p4-rp-001-vertex-ai-호출)

---

## 4.6 WebSocket 통신 프로토콜 (WebSocket Communication Protocol)

본 섹션은 CuratorOdyssey 웹앱이 피지컬 컴퓨팅 아트워크와 통신하기 위한 WebSocket 프로토콜을 정의합니다. 피지컬 컴퓨팅 아트워크의 WebSocket 서버 API는 [피지컬 컴퓨팅 API Spec](physical-computing/PHYSICAL_COMPUTING_API_SPEC.md)을 참조하세요.

**BRD 연계**: [BRD v1.1 Section 9.2](../requirements/BRD.md#92-websocket-통신-프로토콜)

**FRD 연계**: 
- [FR-WEB-001](../requirements/FRD.md#fr-web-001-모니터-자동-켜기): 모니터 자동 켜기
- [FR-WEB-002](../requirements/FRD.md#fr-web-002-게임-결과-표시): 게임 결과 표시

**SRD 연계**:
- [FR-WEB-001](../requirements/SRD.md#fr-web-001-모니터-자동-켜기): 모니터 자동 켜기
- [FR-WEB-002](../requirements/SRD.md#fr-web-002-게임-결과-표시): 게임 결과 표시

### 4.6.1 연결 설정 (Connection Setup)

**WebSocket URL**:
- 개발 환경: `ws://localhost:8000/ws`
- 프로덕션 환경: `wss://physical-game.example.com/ws` (실제 도메인으로 변경 필요)

**프로토콜**: WebSocket (RFC 6455)

**인증**: 현재 인증 없음 (향후 필요 시 추가)

**연결 예시**:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket disconnected');
};
```

### 4.6.2 메시지 타입 정의 (Message Types)

피지컬 컴퓨팅 아트워크 백엔드에서 웹앱으로 전송되는 메시지 타입은 다음과 같습니다:

#### 4.6.2.1 game_start

**설명**: 게임 시작 이벤트

**방향**: 서버 → 클라이언트

**메시지 형식**:

```json
{
  "type": "game_start",
  "session_id": "SESSION_123456",
  "timestamp": "2024-11-10T10:00:00Z"
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"game_start"` |
| `session_id` | string | Yes | 게임 세션 ID (패턴: `^SESSION_\d+$`) |
| `timestamp` | string | Yes | 이벤트 발생 시간 (ISO 8601) |

**처리**: 웹앱은 세션 ID를 저장하고 게임 진행 상태를 초기화합니다.

---

#### 4.6.2.2 ball_collected

**설명**: 공 수집 이벤트

**방향**: 서버 → 클라이언트

**메시지 형식**:

```json
{
  "type": "ball_collected",
  "session_id": "SESSION_123456",
  "tier": 1,
  "axis": "제도",
  "timestamp": "2024-11-10T10:02:00Z"
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"ball_collected"` |
| `session_id` | string | Yes | 게임 세션 ID |
| `tier` | integer | Yes | 공 티어 (1: 당구공, 2: 골프공, 3: 탁구공) |
| `axis` | string | Yes | 축 (`"제도"`, `"학술"`, `"담론"`, `"네트워크"`) |
| `timestamp` | string | Yes | 이벤트 발생 시간 (ISO 8601) |

**처리**: 웹앱은 공 수집 데이터를 업데이트하고 실시간 수집 현황을 표시합니다.

---

#### 4.6.2.3 treasure_box_selected

**설명**: 보물 상자 선택 이벤트

**방향**: 서버 → 클라이언트

**메시지 형식**:

```json
{
  "type": "treasure_box_selected",
  "session_id": "SESSION_123456",
  "box_id": 1,
  "age_group": "10대",
  "event_description": "구설수가 생기다",
  "timestamp": "2024-11-10T10:03:00Z"
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"treasure_box_selected"` |
| `session_id` | string | Yes | 게임 세션 ID |
| `box_id` | integer | Yes | 보물 상자 ID (1-9) |
| `age_group` | string | Yes | 나이대 (`"10대"`, `"20대"`, `"30대"`) |
| `event_description` | string | Yes | 이벤트 설명 |
| `timestamp` | string | Yes | 이벤트 발생 시간 (ISO 8601) |

**처리**: 웹앱은 보물 상자 선택 데이터를 업데이트하고 주 페르소나를 갱신합니다.

---

#### 4.6.2.4 game_end

**설명**: 게임 종료 이벤트 (결과 데이터 포함)

**방향**: 서버 → 클라이언트

**메시지 형식**:

```json
{
  "type": "game_end",
  "session_id": "SESSION_123456",
  "data": {
    "main_persona": {
      "life_scenario": "구설수 → 퇴학 → 입대",
      "event_sequence": [
        "구설수가 생기다",
        "대학교에서 퇴학당하다",
        "군에 입대하다"
      ]
    },
    "calculated_metadata": {
      "radar5": {
        "I": 25.0,
        "F": 10.0,
        "A": 15.0,
        "M": 20.0,
        "Sedu": 3.0
      },
      "sunburst_l1": {
        "제도": 35.0,
        "학술": 20.0,
        "담론": 30.0,
        "네트워크": 15.0
      }
    },
    "ai_matching": {
      "matched_artist_id": "ARTIST_0005",
      "matched_artist_name": "헨리 마티스",
      "similarity_score": 0.85,
      "matching_reason": "유사한 인생 궤적과 작품 스타일",
      "generated_story": "AI 생성 스토리 텍스트...",
      "curator_odyssey_link": "/artist/ARTIST_0005"
    }
  },
  "timestamp": "2024-11-10T10:08:30Z"
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"game_end"` |
| `session_id` | string | Yes | 게임 세션 ID |
| `data` | object | Yes | 게임 세션 데이터 (아래 참조) |
| `timestamp` | string | Yes | 이벤트 발생 시간 (ISO 8601) |

**data 객체 구조**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `main_persona` | object | Yes | 주 페르소나 정보 |
| `main_persona.life_scenario` | string | Yes | 인생 시나리오 템플릿 |
| `main_persona.event_sequence` | array[string] | Yes | 이벤트 시퀀스 배열 |
| `calculated_metadata` | object | Yes | 계산된 메타데이터 |
| `calculated_metadata.radar5` | object | Yes | 레이더 5축 점수 |
| `calculated_metadata.sunburst_l1` | object | Yes | 선버스트 4축 점수 |
| `ai_matching` | object | Yes | AI 매칭 결과 |
| `ai_matching.matched_artist_id` | string | Yes | 매칭된 작가 ID |
| `ai_matching.matched_artist_name` | string | Yes | 매칭된 작가 이름 |
| `ai_matching.similarity_score` | number | Yes | 유사도 점수 (0-1) |
| `ai_matching.curator_odyssey_link` | string | Yes | CuratorOdyssey 링크 |

**처리**: 웹앱은 게임 세션 데이터를 저장하고 결과 화면을 표시합니다.

---

#### 4.6.2.5 treasure_box_detected

**설명**: 배 감지 이벤트 (모니터 켜기 트리거)

**방향**: 서버 → 클라이언트

**메시지 형식**:

```json
{
  "type": "treasure_box_detected",
  "session_id": "SESSION_123456",
  "timestamp": "2024-11-10T10:07:00Z"
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"treasure_box_detected"` |
| `session_id` | string | Yes | 게임 세션 ID |
| `timestamp` | string | Yes | 이벤트 발생 시간 (ISO 8601) |

**처리**: 웹앱은 모니터를 자동으로 켜고 전체화면 모드로 전환한 후 결과 화면으로 이동합니다.

**구현 예시**:

```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'treasure_box_detected') {
    // 전체화면 모드 전환
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    }
    
    // 결과 화면으로 라우팅
    navigate('/physical-game/result');
  }
};
```

### 4.6.3 재연결 로직 (Reconnection Logic)

**전략**: 지수 백오프 (Exponential Backoff)

**파라미터**:
- 초기 지연: 1초
- 최대 재연결 시도: 5회
- 지수 백오프: `delay = INITIAL_DELAY × 2^attempt_number`
- 최대 지연: 32초 (2^5)

**구현 예시**:

```javascript
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1초
let reconnectAttempts = 0;

function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnect attempts reached');
    return;
  }

  const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
  reconnectAttempts += 1;

  setTimeout(() => {
    console.log(`Reconnecting... (attempt ${reconnectAttempts})`);
    connect();
  }, delay);
}

ws.onclose = () => {
  attemptReconnect();
};
```

### 4.6.4 에러 처리 (Error Handling)

**연결 실패**:
- 자동 재연결 시도 (지수 백오프)
- 최대 재연결 시도 초과 시 사용자에게 알림

**메시지 파싱 오류**:
- 잘못된 형식의 메시지 수신 시 로그 기록 및 무시
- `ERR_INVALID_MESSAGE` 에러 코드

**타임아웃**:
- 연결 타임아웃: 30초
- 메시지 타임아웃: 없음 (서버가 주기적으로 ping 전송)

### 4.6.5 참조 문서

- [BRD v1.1 Section 9.2](../requirements/BRD.md#92-websocket-통신-프로토콜) - WebSocket 통신 프로토콜 비즈니스 요구사항
- [TSD Section 13.2](../TSD.md#132-websocket-클라이언트-구현) - WebSocket 클라이언트 구현 상세
- [피지컬 컴퓨팅 API Spec](physical-computing/PHYSICAL_COMPUTING_API_SPEC.md) - 피지컬 컴퓨팅 아트워크 WebSocket 서버 API

---

## 5. Integration Guide (통합 가이드)

### 5.1 React Query Integration (SRD 4.2 참조)

**Query Key**: `['artist', id, 'summary']` (캐싱 자동)

**Invalidation**: `useQueryClient().invalidateQueries(['artist', id])`

**Offline Support**: React Query devtools + offline-first (localStorage fallback)

**Example Code**:

```javascript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { data, isLoading } = useQuery({
  queryKey: ['artist', id, 'summary'],
  queryFn: () => axios.get(`/api/artist/${id}/summary`),
  staleTime: 5 * 60 * 1000  // 5min
});
```

**Batch Request Example** (Phase 2 - `/batch/timeseries` 사용):

```javascript
import { useMutation } from '@tanstack/react-query';

const { mutate, data } = useMutation({
  mutationFn: (payload) => axios.post('/api/batch/timeseries', payload),
  onSuccess: (data) => {
    // 4축 데이터 한 번에 처리
    console.log(data.data.timeseries);
  }
});

// 사용
mutate({
  artist_id: 'ARTIST_0005',
  axes: ['제도', '학술', '담론', '네트워크']
});
```

**Legacy Batch Example** (Promise.all):

```javascript
const { data: timeseriesData } = useQueries({
  queries: ['제도', '학술', '담론', '네트워크'].map(axis => ({
    queryKey: ['artist', id, 'timeseries', axis],
    queryFn: () => axios.get(`/api/artist/${id}/timeseries/${axis}`)
  }))
});
```

### 5.2 Testing and Mocking (테스트 및 모킹)

**단위 테스트**: Jest + nock (HTTP 모킹)

```javascript
import nock from 'nock';

nock('https://co-1016.web.app')
  .get('/api/artist/ARTIST_0005/summary')
  .reply(200, { data: mockSummaryData });
```

**통합 테스트**: Firebase Emulators (Functions 5002)

```bash
firebase emulators:start --only functions
# API 호출: http://localhost:5002/api/artist/ARTIST_0005/summary
```

**E2E**: Cypress - API 호출 검증

```javascript
cy.request('GET', '/api/artist/ARTIST_0005/summary').then((response) => {
  expect(response.status).to.eq(200);
  expect(response.body.data).to.have.property('radar5');
});
```

**모킹**: `mockData.js`로 데이터 시뮬레이션 (404 시)

### 5.3 Monitoring (모니터링)

**Cloud Logging**: Request/response logging (structured JSON)

```json
{
  "timestamp": "2025-11-02T01:29:00Z",
  "method": "GET",
  "path": "/api/artist/ARTIST_0005/summary",
  "status": 200,
  "response_time": 150,
  "user_id": "anonymous"
}
```

**Cloud Monitoring**: Latency/error rate alerts (p95 >300ms 시)

**Cost Tracking**: Vertex AI usage tracking ($30 한도 알림)

### 5.4 Benchmarking Tools (벤치마킹 도구)

**Postman Collection**: API 테스트 및 문서화

**Postman Collection 파일**: [`docs/api/postman/CO-1016_API.postman_collection.json`](postman/CO-1016_API.postman_collection.json) *(to be created)*

**사용법**:
1. Postman에서 Import → Collection 파일 선택
2. Environment 설정 (Base URL: `https://co-1016.web.app/api`)
3. Collection Runner로 전체 엔드포인트 테스트 실행

**Artillery Load Testing**: 성능 테스트

**Artillery 설정 파일**: [`scripts/artillery/load-test.yml`](../../scripts/artillery/load-test.yml) *(to be created)*

**예시 스크립트**:

```yaml
# scripts/artillery/load-test.yml
config:
  target: 'https://co-1016.web.app'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
  processor: "./artillery-processor.js"
scenarios:
  - name: "Phase 1 Summary"
    flow:
      - get:
          url: "/api/artist/ARTIST_0005/summary"
  - name: "Phase 2 Timeseries"
    flow:
      - get:
          url: "/api/artist/ARTIST_0005/timeseries/제도"
  - name: "Phase 4 Report"
    flow:
      - post:
          url: "/api/report/generate"
          json:
            artist_id: "ARTIST_0005"
```

**실행 방법**:

```bash
# Artillery 설치
npm install -g artillery

# 부하 테스트 실행
artillery run scripts/artillery/load-test.yml

# 결과 리포트 생성
artillery run --output report.json scripts/artillery/load-test.yml
artillery report report.json
```

**K6 Load Testing**: 대안 벤치마킹 도구

**K6 스크립트 예시**: [`scripts/k6/api-load-test.js`](../../scripts/k6/api-load-test.js) *(to be created)*

```javascript
// scripts/k6/api-load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // p95 < 300ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  const baseUrl = 'https://co-1016.web.app/api';
  
  // Phase 1: Summary
  const summaryRes = http.get(`${baseUrl}/artist/ARTIST_0005/summary`);
  check(summaryRes, {
    'summary status is 200': (r) => r.status === 200,
    'summary response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  // Phase 2: Timeseries (batch)
  const batchRes = http.post(`${baseUrl}/batch/timeseries`, JSON.stringify({
    artist_id: 'ARTIST_0005',
    axes: ['제도', '학술', '담론', '네트워크']
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(batchRes, {
    'batch status is 200': (r) => r.status === 200,
    'batch response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

**실행 방법**:

```bash
# K6 설치
brew install k6  # macOS
# 또는 https://k6.io/docs/getting-started/installation/

# 부하 테스트 실행
k6 run scripts/k6/api-load-test.js
```

**성능 KPI 측정**:

| 도구 | 측정 지표 | 목표 | 실행 주기 |
|------|----------|------|----------|
| Artillery | p95 latency, throughput | p95 < 300ms | 주간 |
| K6 | p95 latency, error rate | p95 < 300ms, error < 1% | 주간 |
| Postman | Functional correctness | 100% pass rate | 배포 전 |

---

## 6. Appendix (부록)

### 6.1 OpenAPI YAML Snippet (전체 YAML 참조)

전체 OpenAPI 스펙은 [`OPENAPI_SPECIFICATION.yaml`](OPENAPI_SPECIFICATION.yaml) 참조.

**스니펫 예시** (JSON Schema 통합):

```yaml
openapi: 3.0.0
info:
  title: CO-1016 Curator Odyssey API
  version: 1.0.0
  description: Artist career analysis API
servers:
  - url: https://co-1016.web.app/api
paths:
  /artist/{id}/summary:
    get:
      summary: Get artist summary
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/ArtistSummary'
        '404':
          description: Not Found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    $ref: '#/components/schemas/Error'
components:
  schemas:
    ArtistSummary:
      type: object
      required:
        - artist_id
        - radar5
        - sunburst_l1
        - weights_version
      properties:
        artist_id:
          type: string
          pattern: '^ARTIST_\d{4}$'
          example: ARTIST_0005
        radar5:
          type: object
          required:
            - I
            - F
            - A
            - M
            - Sedu
          properties:
            I:
              type: number
              minimum: 0
              maximum: 100
            F:
              type: number
              minimum: 0
              maximum: 100
            A:
              type: number
              minimum: 0
              maximum: 100
            M:
              type: number
              minimum: 0
              maximum: 100
            Sedu:
              type: number
              minimum: 0
              maximum: 100
        sunburst_l1:
          type: object
          required:
            - 제도
            - 학술
            - 담론
            - 네트워크
          properties:
            제도:
              type: number
              minimum: 0
              maximum: 1
            학술:
              type: number
              minimum: 0
              maximum: 1
            담론:
              type: number
              minimum: 0
              maximum: 1
            네트워크:
              type: number
              minimum: 0
              maximum: 1
          additionalProperties: false
        weights_version:
          type: string
          example: v1.0
    Axis:
      type: string
      enum:
        - 제도
        - 학술
        - 담론
        - 네트워크
      example: 제도
    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
          enum:
            - ERR_DATA_NOT_FOUND
            - ERR_INVALID_PARAM
            - ERR_INVALID_AXIS
            - ERR_AI_FAILED
            - ERR_TOKEN_EXCEEDED
            - ERR_RATE_LIMIT
        message:
          type: string
        details:
          type: array
          items:
            type: string
        timestamp:
          type: string
          format: date-time
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT  # 향후 v1.1
```

### 6.2 Change Log Template (변경 로그 템플릿)

**v1.0 (2025-11-02)**: 초기 릴리스
- Phase 1-4 엔드포인트 정의
- OpenAPI 3.0 스펙 완성
- 에러 핸들링 표준화
- JSON Schema 검증 추가
- 배치 API 추가 (`/batch/timeseries`)

**v1.1 (Q1 2026, 예정)**: 인증 추가
- Firebase Authentication 도입
- Bearer Token 지원
- 새로운 엔드포인트 (`/auth/login`)
- RBAC (Role-based access control)

**v1.2 (Q2 2026, 예정)**: 확장성 개선
- WebSocket 지원 (선택적)
- GraphQL API (선택적)

### 6.3 Checklist (체크리스트)

**Pre-Deployment Checklist**:
- [ ] OpenAPI 유효성 검사 (Swagger Editor)
- [ ] 모든 엔드포인트 테스트 (Postman 컬렉션)
- [ ] 오류 코드 문서화 완료
- [ ] React Query 예시 코드 검증
- [ ] 성능 테스트 (p95 <300ms) - Artillery/K6
- [ ] 보안 스캔 통과
- [ ] JSON Schema 검증 통과 (모든 엔드포인트)
- [ ] 배치 API 테스트 완료

**Post-Deployment Monitoring**:
- [ ] Cloud Monitoring 지표 수집 확인
- [ ] 에러 로그 확인
- [ ] 비용 모니터링 (Vertex AI 사용량)
- [ ] 사용자 피드백 수집
- [ ] 성능 벤치마크 (주간 Artillery 실행)

---

**Document Version Management**:
- v1.0 (2025-11-02): Initial draft with JSON Schema validation, batch API, benchmarking tools integration
- **Future Updates**: API changes must update SRD/TSD simultaneously

**Note**: This specification covers 100% of SRD FRs and maintains synchronization with Functions code. For additional endpoints, submit a PR.

