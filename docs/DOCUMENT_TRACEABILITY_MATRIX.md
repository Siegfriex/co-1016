# CO-1016 CURATOR ODYSSEY: 문서 추적성 매트릭스

**생성일**: 2025-11-10  
**최종 업데이트**: 2025-11-10  
**버전**: 1.1

---

## 문서 계층 구조

```
BRD (Business Requirements)
  ↓
SRD (Software Requirements)
  ↓
FRD (Functional Requirements)
  ↓
TSD (Technical Design)
  ↓
구현 코드

BRD → API Spec → Functions 구현
SRD → Data Model Spec → Firestore 스키마
FRD → API Spec → React 컴포넌트
```

**FR ID 매핑**: [FR ID 매핑 테이블](FR_ID_MAPPING.md) 참조

---

## 문서 간 참조 관계

| 문서 | 참조하는 문서 | 참조 유형 | 링크 위치 |
|------|--------------|----------|----------|
| **BRD v1.1** | TSD v1.1 | 기반 문서 | 참조 문서 섹션 |
| **BRD v1.1** | FRD v1.1 | 기능 명세 | FR-WEB-003 섹션 |
| **BRD v1.1** | SRD v1.1 | 요구사항 | 참조 문서 섹션 |
| **BRD v1.1** | API Spec v1.1 | API 정의 | FR-WEB-003 섹션 |
| **SRD v1.1** | TSD v1.1 | 기반 문서 | 참조 문서 섹션 |
| **SRD v1.1** | FRD v1.1 | 상세 명세 | 각 FR 섹션 |
| **SRD v1.1** | API Spec v1.1 | API 정의 | 참조 문서 섹션 |
| **SRD v1.1** | FR ID 매핑 테이블 | 매핑 관계 | 참조 문서 섹션 |
| **FRD v1.1** | BRD v1.1 | 비즈니스 요구사항 | 참조 문서 섹션 |
| **FRD v1.1** | SRD v1.1 | 원본 FR | 각 FR 섹션의 SRD FR ID |
| **FRD v1.1** | TSD v1.1 | 기술 설계 | 참조 문서 섹션 |
| **FRD v1.1** | API Spec v1.1 | API 정의 | 각 FR 섹션의 API 매핑 |
| **TSD v1.1** | FRD v1.1 | 기능 요구사항 | 각 API 엔드포인트 섹션 |
| **TSD v1.1** | SRD v1.1 | 요구사항 | 참조 문서 섹션 |
| **TSD v1.1** | API Spec v1.1 | API 정의 | 참조 문서 섹션 |
| **API Spec v1.1** | FRD v1.1 | 상세 명세 | 각 엔드포인트의 FRD FR ID |
| **API Spec v1.1** | SRD v1.1 | 원본 FR | 각 엔드포인트의 SRD FR ID |
| **API Spec v1.1** | TSD v1.1 | 기술 설계 | 참조 문서 섹션 |
| **API Spec v1.1** | FR ID 매핑 테이블 | 매핑 관계 | 참조 문서 섹션 |
| **IA v1.1** | FRD v1.1 | 데이터 흐름 및 논리 데이터 모델 | 참조 문서 섹션 |
| **IA v1.1** | SRD v1.1 | 기능 요구사항 및 수용 기준 | 참조 문서 섹션 |
| **IA v1.1** | TSD v1.1 | 기술 설계 및 API 구현 | 참조 문서 섹션 |
| **IA v1.1** | VID v2.0 | 컴포넌트 스펙 및 디자인 시스템 | 참조 문서 섹션 |
| **IA v1.1** | Data Model Spec | Firestore 스키마 상세 | 참조 문서 섹션 |
| **IA v1.1** | API Spec v1.1 | API 엔드포인트 정의 | 참조 문서 섹션 |
| **SITEMAP_WIREFRAME v2.1** | VID v2.0 | Visual Interaction Design Document | 참조 문서 섹션 |
| **SITEMAP_WIREFRAME v2.1** | IA v1.1 | Information Architecture Document | 참조 문서 섹션 |
| **SITEMAP_WIREFRAME v2.1** | FRD v1.1 | Functional Requirements Document | 각 기능명세 테이블 |
| **SITEMAP_WIREFRAME v2.1** | SRD v1.1 | Software Requirements Document | 각 기능명세 테이블 및 수용 기준 |
| **SITEMAP_WIREFRAME v2.1** | TSD v1.1 | Technical Design Document | 참조 문서 섹션 |
| **PHYSICAL_COMPUTING_FRD v1.1** | BRD v1.1 | 비즈니스 요구사항 | 참조 문서 섹션 |
| **PHYSICAL_COMPUTING_TSD v1.1** | PHYSICAL_COMPUTING_FRD v1.1 | 기능 요구사항 | 참조 문서 섹션 |
| **PHYSICAL_COMPUTING_SRD v1.1** | PHYSICAL_COMPUTING_FRD v1.1 | 수용 기준 | 참조 문서 섹션 |
| **PHYSICAL_COMPUTING_API_SPEC v1.1** | PHYSICAL_COMPUTING_TSD v1.1 | API 정의 | 참조 문서 섹션 |
| **MVP_PHYSICAL_COMPUTING_FRD MVP v1.1** | BRD v1.1 | MVP 비즈니스 요구사항 | 참조 문서 섹션 |
| **MVP_PHYSICAL_COMPUTING_TSD MVP v1.1** | MVP_PHYSICAL_COMPUTING_FRD MVP v1.1 | MVP 기능 요구사항 | 참조 문서 섹션 |
| **MVP_PHYSICAL_COMPUTING_SRD MVP v1.1** | MVP_PHYSICAL_COMPUTING_FRD MVP v1.1 | MVP 수용 기준 | 참조 문서 섹션 |

## 참조 문서 링크

### 주요 문서

- **[BRD v1.1](requirements/BRD.md)**: Business Requirements Document
- **[SRD v1.1](requirements/SRD.md)**: Software Requirements Document
- **[FRD v1.1](requirements/FRD.md)**: Functional Requirements Document
- **[TSD v1.1](../TSD.md)**: Technical Design Document
- **[API Specification v1.1](api/API_SPECIFICATION.md)**: RESTful API 엔드포인트 정의
- **[VID v2.0](design/VID.md)**: Visual Interaction Design Document
- **[IA v1.1](architecture/IA.md)**: Information Architecture Document
- **[SITEMAP_WIREFRAME v2.1](design/SITEMAP_WIREFRAME.md)**: 사이트맵 및 와이어프레임 기능명세
- **[피지컬 컴퓨팅 FRD v1.1](physical-computing/PHYSICAL_COMPUTING_FRD.md)**: 피지컬 컴퓨팅 기능 요구사항 문서
- **[피지컬 컴퓨팅 TSD v1.1](physical-computing/PHYSICAL_COMPUTING_TSD.md)**: 피지컬 컴퓨팅 기술 설계 문서
- **[피지컬 컴퓨팅 SRD v1.1](physical-computing/PHYSICAL_COMPUTING_SRD.md)**: 피지컬 컴퓨팅 소프트웨어 요구사항 문서
- **[피지컬 컴퓨팅 API Spec v1.1](physical-computing/PHYSICAL_COMPUTING_API_SPEC.md)**: 피지컬 컴퓨팅 API 명세서
- **[피지컬 컴퓨팅 MVP FRD MVP v1.1](physical-computing/MVP_PHYSICAL_COMPUTING_FRD.md)**: 피지컬 컴퓨팅 MVP 기능 요구사항 문서
- **[피지컬 컴퓨팅 MVP TSD MVP v1.1](physical-computing/MVP_PHYSICAL_COMPUTING_TSD.md)**: 피지컬 컴퓨팅 MVP 기술 설계 문서
- **[피지컬 컴퓨팅 MVP SRD MVP v1.1](physical-computing/MVP_PHYSICAL_COMPUTING_SRD.md)**: 피지컬 컴퓨팅 MVP 소프트웨어 요구사항 문서

### 문서 간 참조 링크 예시

**SRD → FRD**:
- SRD의 FR-P1-DQ-001 → FRD의 FR-P1-SUM-001 및 FR-P1-SUN-001
- SRD의 FR-P2-DQ-001 → FRD의 FR-P2-TIM-001 및 FR-P2-BAT-001
- SRD의 FR-P2-DQ-002 → FRD의 FR-P2-EVT-001
- SRD의 FR-P3-DQ-001 → FRD의 FR-P3-CMP-001
- SRD의 FR-P4-RP-001 → FRD의 FR-P4-RPT-001

**FRD → API Spec**:
- FRD의 각 FR 섹션에 API 엔드포인트 링크 포함
- API Spec의 각 엔드포인트에 FRD FR ID 및 SRD FR ID 포함

**TSD → FRD**:
- TSD의 각 API 엔드포인트 설명에 FRD 링크 포함

## 문서-구현 코드 매핑

| 문서 | 구현 코드 위치 |
|------|---------------|
| `FRD` | `functions/index.js (API 엔드포인트)` |
| `FRD` | `src/components/ (React 컴포넌트)` |
| `API_SPECIFICATION` | `functions/index.js (getArtistSummary, getArtistTimeseries 등)` |
| `API_SPECIFICATION` | `firebase.json (rewrites 설정)` |
| `DATA_MODEL_SPECIFICATION` | `firestore.rules (보안 규칙)` |
| `DATA_MODEL_SPECIFICATION` | `firestore.indexes.json (인덱스 설정)` |
| `DATA_MODEL_SPECIFICATION` | `functions/src/ (데이터 처리 로직)` |
| `ARCHITECTURE_DETAIL` | `src/App.js (라우팅)` |
| `ARCHITECTURE_DETAIL` | `src/components/ (컴포넌트 구조)` |
| `ARCHITECTURE_DETAIL` | `functions/src/ (서비스 레이어)` |
| `BUSINESS_LOGIC_SPECIFICATION` | `src/utils/ (유틸리티 함수)` |
| `BUSINESS_LOGIC_SPECIFICATION` | `src/adapters/universalDataAdapter.js` |
| `BUSINESS_LOGIC_SPECIFICATION` | `functions/src/services/ (비즈니스 로직)` |

## 기능 요구사항(FR) 추적성

| FRD FR ID | SRD FR ID | 문서 | API 엔드포인트 | 구현 파일 | 상태 |
|-----------|-----------|------|---------------|----------|------|
| FR-P1-SUM-001 | FR-P1-DQ-001 | `FRD`, `SRD`, `API Spec` | `GET /api/artist/:id/summary` | `functions/index.js (getArtistSummary)` | ✅ 구현됨 |
| FR-P1-SUN-001 | FR-P1-DQ-001 | `FRD`, `SRD`, `API Spec` | `GET /api/artist/:id/sunburst` | `functions/index.js (getArtistSunburst)` | ✅ 구현됨 |
| FR-P2-TIM-001 | FR-P2-DQ-001 | `FRD`, `SRD`, `API Spec` | `GET /api/artist/:id/timeseries/:axis` | `functions/index.js (getArtistTimeseries)` | ⚠️ 부분 구현 (목업만) |
| FR-P2-EVT-001 | FR-P2-DQ-002 | `FRD`, `SRD`, `API Spec` | `GET /api/artist/:id/events/:axis` | `-` | ❌ 미구현 |
| FR-P2-BAT-001 | FR-P2-DQ-001 | `FRD`, `SRD`, `API Spec` | `POST /api/batch/timeseries` | `-` | ❌ 미구현 |
| FR-P3-CMP-001 | FR-P3-DQ-001 | `FRD`, `SRD`, `API Spec` | `GET /api/compare/:A/:B/:axis` | `functions/index.js (getCompareArtists)` | ✅ 구현됨 |
| FR-P4-RPT-001 | FR-P4-RP-001 | `FRD`, `SRD`, `API Spec` | `POST /api/report/generate` | `functions/index.js (generateAiReport)` | ✅ 구현됨 |

**상세 매핑**: [FR ID 매핑 테이블](FR_ID_MAPPING.md) 참조
