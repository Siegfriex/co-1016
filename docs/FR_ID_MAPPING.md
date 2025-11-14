# CO-1016 CURATOR ODYSSEY: FR ID 매핑 테이블

**생성일**: 2025-11-10  
**목적**: SRD의 FR ID와 FRD의 FR ID 간 매핑 명확화

---

## 1. 개요

본 문서는 SRD(Software Requirements Document)의 고수준 기능 요구사항 FR ID와 FRD(Functional Requirements Document)의 API 엔드포인트 매핑된 FR ID 간의 관계를 명확히 정의합니다.

### 1.1 FR ID 네이밍 체계

**SRD FR ID 형식**: `FR-P{Phase번호}-{카테고리}-{연번}`
- 카테고리: DQ (Data Query), VI (Visualization), IN (Interaction), AD (Adapter), RP (Report)

**FRD FR ID 형식**: `FR-P{Phase번호}-{기능약어}-{연번}`
- 기능약어: SUM (Summary), SUN (Sunburst), TIM (Timeseries), EVT (Events), BAT (Batch), CMP (Comparison), RPT (Report)

---

## 2. FR ID 매핑 테이블

| SRD FR ID | FRD FR ID | API 엔드포인트 | 설명 | 구현 상태 |
|-----------|-----------|---------------|------|----------|
| FR-P1-DQ-001 | FR-P1-SUM-001 | `GET /api/artist/:id/summary` | 아티스트 요약 데이터 조회 (radar5, sunburst_l1) | ✅ 구현됨 |
| FR-P1-DQ-001 | FR-P1-SUN-001 | `GET /api/artist/:id/sunburst` | Sunburst 상세 데이터 조회 (L1/L2 계층) | ✅ 구현됨 |
| FR-P2-DQ-001 | FR-P2-TIM-001 | `GET /api/artist/:id/timeseries/:axis` | 시계열 데이터 조회 | ⚠️ 목업만 |
| FR-P2-DQ-002 | FR-P2-EVT-001 | `GET /api/artist/:id/events/:axis` | 이벤트 영향 분석 | ❌ 미구현 |
| FR-P2-DQ-001 | FR-P2-BAT-001 | `POST /api/batch/timeseries` | 배치 시계열 데이터 조회 | ❌ 미구현 |
| FR-P3-DQ-001 | FR-P3-CMP-001 | `GET /api/compare/:A/:B/:axis` | 두 아티스트 비교 데이터 조회 | ✅ 구현됨 |
| FR-P4-RP-001 | FR-P4-RPT-001 | `POST /api/report/generate` | AI 보고서 생성 | ✅ 구현됨 |
| FR-WEB-001 | FR-WEB-001 | WebSocket 연결 (피지컬 컴퓨팅 아트워크) | WebSocket 클라이언트 연결 및 재연결 로직 | ❌ 미구현 |
| FR-WEB-002 | FR-WEB-002 | 게임 결과 화면 컴포넌트 | 피지컬 게임 결과 표시 (4개 섹션, 가로 스크롤) | ❌ 미구현 |
| FR-WEB-003 | FR-WEB-003 | `GET /api/artist/{id}/summary`<br/>`POST /api/batch/timeseries`<br/>`GET /api/compare/{playerSessionId}/{matchedArtistId}/{axis}` | CuratorOdyssey API 연동 (플레이어 세션 데이터 조회) | ⚠️ 부분 구현 |
| FR-WEB-004 | FR-WEB-004 | 비교 차트 컴포넌트 | 플레이어 vs 매칭 작가 비교 차트 표시 | ❌ 미구현 |
| FR-WEB-005 | FR-WEB-005 | 랜딩 페이지 컴포넌트 | Hero 섹션, Feature Cards, WebGL 배경 | ❌ 미구현 |

---

## 3. 매핑 관계 설명

### 3.1 Phase 1: 현재 가치 분석

**SRD FR-P1-DQ-001**은 두 개의 FRD FR로 세분화됩니다:
- **FR-P1-SUM-001**: 요약 데이터 조회 (radar5, sunburst_l1)
- **FR-P1-SUN-001**: Sunburst 상세 데이터 조회 (L1/L2 계층)

**관계**: FR-P1-SUM-001이 기본 요약 조회를 담당하고, FR-P1-SUN-001은 보완 기능으로 상세 선버스트 데이터를 제공합니다.

### 3.2 Phase 2: 커리어 궤적 분석

**SRD FR-P2-DQ-001**은 두 개의 FRD FR로 세분화됩니다:
- **FR-P2-TIM-001**: 단일 축 시계열 데이터 조회
- **FR-P2-BAT-001**: 다중 축 배치 시계열 데이터 조회 (효율성 향상)

**SRD FR-P2-DQ-002**는:
- **FR-P2-EVT-001**: 이벤트 영향 분석

**관계**: FR-P2-TIM-001은 기본 시계열 조회를 담당하고, FR-P2-BAT-001은 효율성을 위한 배치 조회를 제공합니다. FR-P2-EVT-001은 이벤트 영향 분석을 위한 별도 기능입니다.

### 3.3 Phase 3: 비교 분석

**SRD FR-P3-DQ-001**은:
- **FR-P3-CMP-001**: 두 아티스트 비교 데이터 조회

**관계**: 1:1 매핑 관계입니다.

### 3.4 Phase 4: AI 보고서 생성

**SRD FR-P4-RP-001**은:
- **FR-P4-RPT-001**: AI 보고서 생성

**관계**: 1:1 매핑 관계입니다.

### 3.5 웹앱 통합 기능 (피지컬 컴퓨팅 아트워크)

**SRD FR-WEB-001**은:
- **FR-WEB-001**: WebSocket 연결 및 재연결 로직

**SRD FR-WEB-002**는:
- **FR-WEB-002**: 게임 결과 화면 컴포넌트 (4개 섹션, 가로 스크롤 레이아웃)

**SRD FR-WEB-003**은:
- **FR-WEB-003**: CuratorOdyssey API 연동 (기존 API 재사용 및 확장)

**SRD FR-WEB-004**는:
- **FR-WEB-004**: 비교 차트 컴포넌트 (플레이어 vs 매칭 작가)

**SRD FR-WEB-005**는:
- **FR-WEB-005**: 랜딩 페이지 컴포넌트 (Hero, Feature Cards, WebGL 배경)

**관계**: 웹앱 통합 기능은 피지컬 컴퓨팅 아트워크와의 통합을 위한 클라이언트 측 기능입니다. FR-WEB-003은 기존 CuratorOdyssey API를 재사용하며, 플레이어 세션 데이터를 지원하도록 확장됩니다.

---

## 4. 제거된 API 엔드포인트

다음 엔드포인트는 문서에 정의되지 않았으며 코드에서 제거되었습니다:

| 엔드포인트 | 설명 | 상태 |
|-----------|------|------|
| `POST /api/ai/vertex-generate` | Vertex AI 종합 보고서 생성 | ❌ 제거됨 (2025-11-10) |
| `GET /api/ai/vertex-health` | Vertex AI 헬스체크 | ❌ 제거됨 (2025-11-10) |

**참고**: 이 엔드포인트들은 문서에 정의되지 않았으며, 다른 엔드포인트로 통합되었습니다. 내부 로직은 `functions/src/services/vertexAIService.js`에서 계속 사용 가능합니다.

---

## 5. 구현 상태

### 5.1 구현 완료

- ✅ FR-P1-SUM-001: `functions/index.js`의 `getArtistSummary` 함수
- ✅ FR-P1-SUN-001: `functions/index.js`의 `getArtistSunburst` 함수
- ✅ FR-P3-CMP-001: `functions/index.js`의 `getCompareArtists` 함수
- ✅ FR-P4-RPT-001: `functions/index.js`의 `generateAiReport` 함수

### 5.2 부분 구현

- ⚠️ FR-P2-TIM-001: `functions/index.js`의 `getArtistTimeseries` 함수 (목업 데이터만 반환, Firestore 연동 없음)

### 5.3 미구현

- ❌ FR-P2-EVT-001: 엔드포인트 및 함수 미구현
- ❌ FR-P2-BAT-001: 엔드포인트 및 함수 미구현
- ❌ FR-WEB-001: WebSocket 클라이언트 훅 (`usePhysicalGameWebSocket`) 미구현
- ❌ FR-WEB-002: 게임 결과 화면 컴포넌트 (`PhysicalGameResultView` 등) 미구현
- ❌ FR-WEB-004: 비교 차트 컴포넌트 (플레이어 vs 매칭 작가) 미구현
- ❌ FR-WEB-005: 랜딩 페이지 컴포넌트 (`LandingPageHero`, `FeatureCards` 등) 미구현

### 5.4 부분 구현 (웹앱 통합)

- ⚠️ FR-WEB-003: CuratorOdyssey API는 구현되어 있으나, 플레이어 세션 데이터 지원 확장 필요

**상세 정보**: [갭 분석 문서](../GAP_ANALYSIS.md) 및 [실행 로드맵](../EXECUTION_ROADMAP.md) 참조

---

## 6. 참조 문서

- **[SRD v1.1](../requirements/SRD.md)**: Software Requirements Document
- **[FRD v1.1](../requirements/FRD.md)**: Functional Requirements Document
- **[TSD v1.1](../TSD.md)**: Technical Design Document
- **[API Specification v1.1](../api/API_SPECIFICATION.md)**: API 엔드포인트 정의
- **[VID v2.0](../design/VID.md)**: Visual Interaction Design Document
- **[피지컬 컴퓨팅 TSD](../physical-computing/PHYSICAL_COMPUTING_TSD.md)**: 피지컬 컴퓨팅 아트워크 기술 설계 문서
- **[피지컬 컴퓨팅 API Spec](../physical-computing/PHYSICAL_COMPUTING_API_SPEC.md)**: 피지컬 컴퓨팅 아트워크 API 명세서
- **[갭 분석](../GAP_ANALYSIS.md)**: 문서-구현 간 갭 분석
- **[실행 로드맵](../EXECUTION_ROADMAP.md)**: 갭 해소 작업 계획

---

**최종 업데이트**: 2025-11-10 (웹앱 통합 기능 FR-WEB-001~005 추가)

