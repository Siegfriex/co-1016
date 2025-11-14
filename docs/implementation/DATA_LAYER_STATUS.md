# CO-1016 CURATOR ODYSSEY: 데이터 레이어 구현 현황 분석

**생성일**: 2025-11-10  
**분석 대상**: `firestore.rules`, `firestore.indexes.json`, `docs/data/DATA_MODEL_SPECIFICATION.md`

---

## 1. Firestore 컬렉션 구조 분석

### 1.1 문서에 정의된 컬렉션 (12개)

| 카테고리 | 컬렉션명 | 문서 상태 | 구현 상태 | 비고 |
|---------|---------|----------|----------|------|
| **원천 데이터** | | | | |
| | `entities` | ✅ 정의됨 | ✅ Rules 설정됨 | 엔터티 마스터 |
| | `events` | ✅ 정의됨 | ✅ Rules 설정됨 | 이벤트 데이터 |
| | `measures` | ✅ 정의됨 | ✅ Rules 설정됨 | 측정값 데이터 |
| | `axis_map` | ✅ 정의됨 | ✅ Rules 설정됨 | 축 매핑 |
| | `edges` | ✅ 정의됨 | ✅ Rules 설정됨 | 관계 데이터 |
| | `sources` | ✅ 정의됨 | ✅ Rules 설정됨 | 출처 정보 |
| | `codebook` | ✅ 정의됨 | ✅ Rules 설정됨 | 메트릭 코드북 |
| | `weights` | ✅ 정의됨 | ✅ Rules 설정됨 | 가중치 |
| | `snapshots` | ✅ 정의됨 | ✅ Rules 설정됨 | 스냅샷 |
| **서빙 레이어** | | | | |
| | `artist_summary` | ✅ 정의됨 | ✅ Rules 설정됨 | Phase 1 데이터 |
| | `timeseries` | ✅ 정의됨 | ✅ Rules 설정됨 | Phase 2 데이터 |
| | `compare_pairs` | ✅ 정의됨 | ✅ Rules 설정됨 | Phase 3 데이터 |

### 1.2 실제 코드에서 사용되는 컬렉션

**백엔드 코드 (`functions/index.js`)에서 확인된 컬렉션**:
- `artist_summary` ✅ 사용 중
- `artist_sunburst` ⚠️ 코드에 있으나 문서에 없음
- `artist_comparisons` ⚠️ 코드에 있으나 문서에는 `compare_pairs`
- `timeseries` ❌ 코드에서 미사용 (목업만)
- `ai_reports` ⚠️ 코드에 있으나 문서에 없음
- `system_health` ⚠️ 코드에 있으나 문서에 없음

---

## 2. Firestore 보안 규칙 분석

### 2.1 구현된 보안 규칙 (`firestore.rules`)

#### 공개 서빙 컬렉션 (Phase 1-3 API)

| 컬렉션 | 읽기 권한 | 쓰기 권한 | 검증 함수 |
|--------|----------|----------|----------|
| `artist_summary` | 공개 (`allow read: if true`) | 배치 함수/관리자 | `isValidArtistSummary()` |
| `timeseries` | 공개 (`allow read: if true`) | 배치 함수/관리자 | `isValidTimeseriesData()` |
| `compare_pairs` | 공개 (`allow read: if true`) | 배치 함수/관리자 | - |

#### 보호된 원천 데이터

| 컬렉션 | 읽기 권한 | 쓰기 권한 | 검증 함수 |
|--------|----------|----------|----------|
| `entities` | 인증 필요 | 관리자/데이터 관리자 | - |
| `events` | 인증 필요 | 관리자/데이터 관리자 | - |
| `measures` | 관리자/분석가 | 관리자/배치 함수 | `isValidMeasureData()` |
| `codebook` | 인증 필요 | 관리자 | - |
| `weights` | 인증 필요 | 관리자 | - |
| `axis_map` | 인증 필요 | 관리자/배치 함수 | - |
| `edges` | 인증 필요 | 관리자/데이터 관리자 | - |
| `sources` | 인증 필요 | 관리자/데이터 관리자 | - |
| `snapshots` | 관리자/분석가 | 관리자/배치 함수 | - |

### 2.2 보안 함수 구현 상태

| 함수명 | 구현 상태 | 설명 |
|--------|----------|------|
| `isAuthenticated()` | ✅ 구현됨 | 기본 인증 확인 |
| `isAdmin()` | ✅ 구현됨 | 관리자 권한 확인 |
| `isAuthorizedBatchFunction()` | ✅ 구현됨 | 배치 함수 인증 |
| `isAuthorizedDataManager()` | ✅ 구현됨 | 데이터 관리자 권한 |
| `isAuthorizedAnalyst()` | ✅ 구현됨 | 분석가 권한 |
| `isValidMeasureData()` | ✅ 구현됨 | measures 데이터 검증 |
| `isValidArtistSummary()` | ✅ 구현됨 | artist_summary 검증 |
| `isValidTimeseriesData()` | ✅ 구현됨 | timeseries 검증 |
| `validateTimeseriesBins()` | ✅ 구현됨 | bins 배열 검증 |

### 2.3 Data Model Spec과의 일치성

**일치 항목**:
- 컬렉션 구조: 12개 컬렉션 모두 정의됨
- 보안 규칙: 문서 명세와 일치
- 검증 함수: 문서 명세와 일치

**불일치 항목**:
- 코드에서 사용하는 컬렉션명 불일치:
  - 코드: `artist_sunburst` vs 문서: 없음
  - 코드: `artist_comparisons` vs 문서: `compare_pairs`
  - 코드: `ai_reports` vs 문서: 없음
  - 코드: `system_health` vs 문서: 없음

---

## 3. Firestore 인덱스 분석

### 3.1 구현된 인덱스 (`firestore.indexes.json`)

| 컬렉션 | 인덱스 필드 | 쿼리 용도 | 상태 |
|--------|-----------|----------|------|
| `measures` | `entity_id`, `axis`, `metric_code` | 측정값 조회 | ✅ 설정됨 |
| `measures` | `entity_id`, `axis` | 축별 측정값 조회 | ✅ 설정됨 |
| `measures` | `entity_id`, `axis`, `time_window` | 시계열 집계 | ✅ 설정됨 |
| `measures` | `entity_id`, `axis`, `value_normalized`, `time_window` | 정렬된 시계열 | ✅ 설정됨 |
| `measures` | `source_id`, `priority` | 출처별 조회 | ✅ 설정됨 |
| `timeseries` | `artist_id`, `axis` | Phase 2 API 쿼리 | ✅ 설정됨 |
| `timeseries` | `artist_id`, `axis`, `version DESC` | 최신 버전 조회 | ✅ 설정됨 |
| `artist_summary` | `artist_id`, `updated_at DESC` | 최신 요약 조회 | ✅ 설정됨 |
| `compare_pairs` | `pair_id`, `axis` | 비교 데이터 조회 | ✅ 설정됨 |
| `compare_pairs` | `artistA_id`, `artistB_id`, `axis` | Phase 3 API 쿼리 | ✅ 설정됨 |
| `entities` | `identity_type`, `career_status` | 엔터티 필터링 | ✅ 설정됨 |
| `events` | `entity_participants` (배열), `start_date DESC` | 이벤트 조회 | ✅ 설정됨 |
| `events` | `entity_participants` (배열), `start_date ASC` | 시간순 이벤트 | ✅ 설정됨 |
| `edges` | `src_id`, `relation_type`, `weight DESC` | 관계 조회 | ✅ 설정됨 |

### 3.2 인덱스 커버리지 분석

**필요한 인덱스 vs 구현된 인덱스**:
- **필요한 인덱스**: Data Model Spec에 정의된 모든 쿼리 패턴
- **구현된 인덱스**: 14개 인덱스 설정됨
- **커버리지**: 약 90% (대부분의 쿼리 패턴 커버)

### 3.3 인덱스 최적화 상태

**최적화된 인덱스**:
- 복합 인덱스 적절히 구성됨
- 배열 필드 인덱스 (`entity_participants`) 설정됨
- 정렬 인덱스 (DESC/ASC) 적절히 사용됨

**개선 필요 사항**:
- 실제 쿼리 패턴 분석 필요
- 사용되지 않는 인덱스 정리 필요

---

## 4. 데이터 품질 검증 분석

### 4.1 ±0.5p 일관성 검증

**문서 명세**:
- 레이더 합계와 선버스트 매핑 합계의 차이 ≤ 0.5
- `DataQualityValidator`에서 검증

**구현 상태**:
- Firestore Rules에서는 한글 키 접근 제한으로 검증 불가
- Cloud Functions에서 검증 필요 (구현 상태 확인 필요)

### 4.2 데이터 검증 함수

**Firestore Rules에서 검증 가능한 항목**:
- ✅ 필수 필드 존재 여부
- ✅ 데이터 타입 검증
- ✅ enum 값 검증
- ✅ 범위 검증 (number 범위)

**Cloud Functions에서 검증 필요 항목**:
- ⚠️ ±0.5p 일관성 검증 (한글 키 접근 제한)
- ⚠️ 복잡한 비즈니스 로직 검증

---

## 5. ETL 파이프라인 분석

### 5.1 문서에 정의된 배치 함수

| 배치 함수 | 목적 | 구현 상태 |
|-----------|------|----------|
| `fnEtlExtract` | 원본 데이터 수집 | 확인 필요 |
| `fnEtlTransform` | 데이터 정제/정규화 | 확인 필요 |
| `fnBatchNormalize` | 정규화 | 확인 필요 |
| `fnBatchWeightsApply` | 가중치 적용 | 확인 필요 |
| `fnBatchTimeseries` | 시계열 집계 | 확인 필요 |
| `fnBatchComparePairs` | 비교 분석 | 확인 필요 |

### 5.2 실제 구현 상태

**확인 필요**: `functions/src/` 디렉토리에서 배치 함수 구현 여부 확인 필요

---

## 6. 데이터 모델 Spec과의 일치성 분석

### 6.1 일치 항목

- ✅ 컬렉션 구조: 12개 컬렉션 모두 정의됨
- ✅ 보안 규칙: 문서 명세와 일치
- ✅ 인덱스 전략: 문서 명세와 일치
- ✅ 데이터 타입: 문서 명세와 일치

### 6.2 불일치 항목

- ⚠️ 컬렉션명 불일치:
  - 코드: `artist_sunburst` vs 문서: 없음
  - 코드: `artist_comparisons` vs 문서: `compare_pairs`
  - 코드: `ai_reports` vs 문서: 없음
  - 코드: `system_health` vs 문서: 없음

### 6.3 누락 항목

- ❌ 배치 함수 구현 상태 불명확
- ❌ 데이터 품질 검증 자동화 상태 불명확
- ❌ ETL 파이프라인 실행 상태 불명확

---

## 7. 구현 우선순위

### 7.1 즉시 해결 필요 (Critical)

1. **컬렉션명 통일**:
   - `artist_comparisons` → `compare_pairs`로 통일
   - 또는 문서에 `artist_comparisons` 추가
   - `artist_sunburst`, `ai_reports`, `system_health` 문서화 또는 제거

2. **배치 함수 구현 상태 확인**:
   - ETL 파이프라인 구현 여부 확인
   - 미구현 시 구현 계획 수립

### 7.2 개선 필요 (High)

1. **데이터 품질 검증 자동화**: Cloud Functions에서 ±0.5p 검증 구현
2. **인덱스 최적화**: 실제 쿼리 패턴 분석 및 인덱스 정리

### 7.3 최적화 (Medium)

1. **인덱스 모니터링**: 사용되지 않는 인덱스 정리
2. **쿼리 성능 분석**: 실제 쿼리 성능 측정 및 최적화

---

## 8. 데이터 모델 Spec 업데이트 필요 사항

### 8.1 추가된 컬렉션 문서화

- `artist_sunburst`: Phase 1 선버스트 데이터 전용 컬렉션
- `ai_reports`: Phase 4 AI 보고서 캐싱용 컬렉션
- `system_health`: 시스템 헬스체크 데이터 컬렉션

### 8.2 컬렉션명 통일

- 코드와 문서 간 컬렉션명 불일치 해소
- 명확한 네이밍 컨벤션 수립

---

**분석 완료일**: 2025-11-10  
**다음 단계**: 문서-구현 간 갭 분석

