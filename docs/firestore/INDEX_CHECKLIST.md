# Firestore 인덱스 체크리스트

**마지막 업데이트**: 2025-11-02  
**관리 스크립트**: `scripts/firestore/analyzeIndexRequirements.js`  
**인덱스 파일**: `firestore.indexes.json`

## 개요

이 문서는 CuratorOdyssey 프로젝트의 Firestore 인덱스 관리 체크리스트입니다. 각 컬렉션별 필수 인덱스와 그 용도를 명시합니다.

## 인덱스 상태

- **총 인덱스 수**: 15개
- **컬렉션 수**: 6개 (measures, timeseries, compare_pairs, events, artist_summary, entities, edges)
- **HIGH 우선순위**: 3개
- **MEDIUM 우선순위**: 8개
- **LOW 우선순위**: 1개

## 단일 필드 인덱스 안내

**중요**: Firestore는 단일 필드 인덱스를 자동으로 생성하므로 `firestore.indexes.json`에 명시할 필요가 없습니다. 

단일 필드 인덱스를 `firestore.indexes.json`에 포함하면 배포 시 오류가 발생합니다:
```
Error: this index is not necessary, configure using single field index controls
```

**단일 필드 인덱스 예시**:
- `artist_summary: (is_temporary)` - 제거됨 (자동 생성됨)
- `measures: (entity_id)` - 자동 생성됨 (명시 불필요)
- `timeseries: (artist_id)` - 자동 생성됨 (명시 불필요)

**복합 인덱스만 명시**:
- 2개 이상의 필드 조합 인덱스만 `firestore.indexes.json`에 정의합니다.
- 예: `(entity_id, axis)`, `(artist_id, axis, version DESC)` 등

---

## 컬렉션별 인덱스 상세

### measures 컬렉션

| 인덱스 ID | 필드 조합 | 우선순위 | 상태 | 용도 | 사용 쿼리 패턴 |
|----------|----------|---------|------|------|---------------|
| `measures_entity_axis_metric` | `entity_id` (ASC) + `axis` (ASC) + `metric_code` (ASC) | MEDIUM | ✅ 배포됨 | 특정 작가의 특정 축/지표 조회 | `where('entity_id').where('axis').where('metric_code')` |
| `measures_entity_axis_time` | `entity_id` (ASC) + `axis` (ASC) + `time_window` (ASC) | HIGH | ✅ 배포됨 | 시계열 집계 쿼리 최적화 | `where('entity_id').where('axis').orderBy('time_window')` |
| `measures_entity_axis` | `entity_id` (ASC) + `axis` (ASC) | HIGH | ✅ 배포됨 | 축별 집계 쿼리 | `where('entity_id').where('axis')` |
| `measures_entity_axis_value_time` | `entity_id` (ASC) + `axis` (ASC) + `value_normalized` (ASC) + `time_window` (ASC) | HIGH | ✅ 배포됨 | 정규화된 값 기준 시계열 조회 | `where('entity_id').where('axis').where('value_normalized').orderBy('time_window')` |
| `measures_source_priority` | `source_id` (ASC) + `priority` (ASC) | LOW | ✅ 배포됨 | 출처별 우선순위 조회 | `where('source_id').where('priority')` |

**참고**: 
- 단일 필드 인덱스(`entity_id`, `value_normalized`)는 Firestore에서 자동 생성되므로 명시하지 않음
- `measures_entity_axis_time` 인덱스는 다음 파일에서 필수 사용:
  - `src/algorithms/timeWindowRules.js` (Line 407-411): `where('entity_id').where('axis').orderBy('time_window')`
  - `src/algorithms/normalizationSpecs.js` (Line 310-314): `where('entity_id').where('axis').orderBy('time_window')`
- `measures_entity_axis_value_time` 인덱스는 `P1_BATCH_IMPLEMENTATION_GUIDE.md`의 `fnBatchTimeseries` 함수에서 사용 (value_normalized 필터 포함)

---

### timeseries 컬렉션

| 인덱스 ID | 필드 조합 | 우선순위 | 상태 | 용도 | 사용 쿼리 패턴 |
|----------|----------|---------|------|------|---------------|
| `timeseries_artist_axis` | `artist_id` (ASC) + `axis` (ASC) | HIGH | ✅ 배포됨 | 특정 작가의 특정 축 시계열 조회 | `where('artist_id').where('axis')` |
| `timeseries_artist_axis_version` | `artist_id` (ASC) + `axis` (ASC) + `version` (DESC) | HIGH | ✅ 배포됨 | 최신 버전 시계열 조회 | `where('artist_id').where('axis').orderBy('version', 'desc')` |

**참고**:
- `timeseries_artist_axis_version` 인덱스는 `getBatchTimeseries` API에서 필수 사용 (블루프린트/SRD 명시)
- 최신 버전 조회를 위해 `version DESC` 필수

---

### compare_pairs 컬렉션

| 인덱스 ID | 필드 조합 | 우선순위 | 상태 | 용도 | 사용 쿼리 패턴 |
|----------|----------|---------|------|------|---------------|
| `compare_pairs_pair_axis` | `pair_id` (ASC) + `axis` (ASC) | HIGH | ✅ 배포됨 | 특정 비교 쌍의 특정 축 조회 | `where('pair_id').where('axis')` |
| `compare_pairs_artists_axis` | `artistA_id` (ASC) + `artistB_id` (ASC) + `axis` (ASC) | MEDIUM | ✅ 배포됨 | 작가 쌍별 비교 분석 | `where('artistA_id').where('artistB_id').where('axis')` |

**참고**:
- `compare_pairs_pair_axis`는 `getCompareArtists` API에서 사용
- `compare_pairs_artists_axis`는 IA 문서에 명시된 인덱스 (향후 확장용)

---

### events 컬렉션

| 인덱스 ID | 필드 조합 | 우선순위 | 상태 | 용도 | 사용 쿼리 패턴 |
|----------|----------|---------|------|------|---------------|
| `events_participants_date_desc` | `entity_participants` (CONTAINS) + `start_date` (DESC) | MEDIUM | ✅ 배포됨 | 특정 작가의 이벤트 시간순 조회 (최신순) | `where('entity_participants', 'array-contains').orderBy('start_date', 'desc')` |
| `events_participants_date_asc` | `entity_participants` (CONTAINS) + `start_date` (ASC) | MEDIUM | ✅ 배포됨 | 특정 작가의 이벤트 시간순 조회 (과거순) | `where('entity_participants', 'array-contains').where('start_date', '>=').where('start_date', '<=')` |

**참고**:
- `events_participants_date_desc`는 Phase 2 EventTimeline에서 사용
- `events_participants_date_asc`는 `timeWindowRules.js`의 `getEventsForYear` 함수에서 범위 쿼리 사용

---

### artist_summary 컬렉션

| 인덱스 ID | 필드 조합 | 우선순위 | 상태 | 용도 | 사용 쿼리 패턴 |
|----------|----------|---------|------|------|---------------|
| `artist_summary_is_temporary` | `is_temporary` (ASC) | MEDIUM | ⚠️ 제거됨 | P2 협업 상태 확인 | `where('is_temporary')` |

**참고**:
- `artist_summary_is_temporary`는 단일 필드 인덱스로 Firestore가 자동 생성하므로 `firestore.indexes.json`에서 제거되었습니다
- `universalDataAdapter.js`의 `checkP2CollaborationStatus`에서 사용하는 쿼리는 정상 동작합니다 (Firestore 자동 인덱스 사용)
- `artist_summary_artist_updated`는 IA 문서에 명시된 인덱스 (향후 확장용)

---

### entities 컬렉션

| 인덱스 ID | 필드 조합 | 우선순위 | 상태 | 용도 | 사용 쿼리 패턴 |
|----------|----------|---------|------|------|---------------|
| `entities_identity_career` | `identity_type` (ASC) + `career_status` (ASC) | MEDIUM | ✅ 배포됨 | 활성 아티스트 목록 조회 | `where('identity_type').where('career_status')` |

**참고**:
- `entities_identity_career`는 `fnBatchComparePairs` 함수에서 활성 아티스트 목록 조회 시 사용

---

### edges 컬렉션

| 인덱스 ID | 필드 조합 | 우선순위 | 상태 | 용도 | 사용 쿼리 패턴 |
|----------|----------|---------|------|------|---------------|
| `edges_src_relation_weight` | `src_id` (ASC) + `relation_type` (ASC) + `weight` (DESC) | MEDIUM | ✅ 배포됨 | 관계 네트워크 조회 | `where('src_id').where('relation_type').orderBy('weight', 'desc')` |

**참고**:
- `edges_src_relation_weight`는 네트워크 분석에서 사용

---

## 인덱스 추가 프로세스

### 1. 인덱스 필요성 확인
- 코드베이스에서 쿼리 패턴 분석
- 문서 명세 확인
- 기존 인덱스와 중복 확인

### 2. 인덱스 추가
1. `firestore.indexes.json` 파일에 인덱스 정의 추가
2. `scripts/firestore/analyzeIndexRequirements.js` 실행하여 검증
3. 이 문서 업데이트

### 3. 인덱스 배포
```bash
# 로컬 검증
firebase deploy --only firestore:indexes --dry-run

# 배포
firebase deploy --only firestore:indexes

# 배포 확인
firebase firestore:indexes
```

### 4. 쿼리 테스트
- 각 인덱스 사용 쿼리 실행 확인
- 인덱스 히트율 확인
- 성능 개선 확인

---

## 인덱스 검증 체크리스트

PR 제출 전 확인사항:

- [ ] 새로운 쿼리 추가 시 인덱스 필요성 확인
- [ ] `scripts/firestore/analyzeIndexRequirements.js` 실행하여 누락 인덱스 확인
- [ ] `firestore.indexes.json` 파일 업데이트
- [ ] **단일 필드 인덱스 확인**: 단일 필드 인덱스가 포함되어 있지 않은지 확인 (`scripts/firestore/validateIndexes.js` 실행)
- [ ] 이 문서 업데이트
- [ ] 인덱스 배포 전 로컬 검증 완료 (`firebase deploy --only firestore:indexes --dry-run`)

---

## 관련 문서

- [데이터 모델 명세서](docs/data/DATA_MODEL_SPECIFICATION.md#4-인덱스-전략)
- [스키마 설계 가이드](scripts/firestore/SCHEMA_DESIGN_GUIDE.js)
- [인덱스 관리 가이드](docs/firestore/INDEX_MANAGEMENT_GUIDE.md) (작성 예정)
- [인덱스 분석 리포트](../firestore-index-analysis-report.json)

---

## 변경 이력

| 날짜 | 변경 내용 | 담당자 |
|------|----------|--------|
| 2025-11-02 | 초기 체크리스트 작성 및 누락 인덱스 추가 | - |
| 2025-11-02 | measures 컬렉션 `(entity_id, axis, time_window)` 인덱스 추가 | - |
| 2025-11-02 | timeseries 컬렉션 `(artist_id, axis, version DESC)` 인덱스 추가 | - |
| 2025-11-02 | artist_summary, compare_pairs, entities, events 컬렉션 인덱스 추가 | - |
| 2025-11-02 | `artist_summary: (is_temporary)` 단일 필드 인덱스 제거 (Firestore 자동 생성) | - |

