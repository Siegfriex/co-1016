# 인덱스 전략 검증 보고서

**생성일**: 2025-11-10  
**검증 기준**: DATA_MODEL_SPECIFICATION.md Section 4 vs firestore.indexes.json  
**검증 범위**: 모든 복합 인덱스 (단일 필드 인덱스는 자동 생성되므로 제외)

---

## 1. 검증 결과 요약

| 컬렉션 | 문서 명시 인덱스 | 실제 인덱스 | 일치 여부 | 상태 |
|--------|----------------|------------|----------|------|
| `measures` | 5개 | 5개 | ✅ 일치 | 정상 |
| `timeseries` | 2개 | 2개 | ✅ 일치 | 정상 |
| `compare_pairs` | 2개 | 2개 | ✅ 일치 | 정상 |
| `events` | 2개 | 2개 | ✅ 일치 | 정상 |
| `artist_summary` | 1개 (복합) | 1개 | ✅ 일치 | 정상 |
| `entities` | 1개 | 1개 | ✅ 일치 | 정상 |
| `edges` | 1개 | 1개 | ✅ 일치 | 정상 |
| `physical_game_sessions` | 2개 (자동) | 자동 생성 | ✅ 일치 | 정상 |
| `treasure_box_combinations` | 2개 (자동) | 자동 생성 | ✅ 일치 | 정상 |

**일치율**: 14/14 (100%)  
**위험도**: ✅ **LOW** - 모든 인덱스 일치

**검증 상태**: ✅ **firestore.indexes.json 확인 완료 - 모든 인덱스 일치**

---

## 2. 문서에 명시된 인덱스 목록

### 2.1 measures 컬렉션 인덱스 (5개)

| 인덱스 이름 | 필드 조합 | 용도 | 문서 위치 |
|-----------|----------|------|----------|
| `measures_entity_axis_metric` | `entity_id` (ASC) + `axis` (ASC) + `metric_code` (ASC) | 특정 작가의 특정 축/지표 조회 | DATA_MODEL_SPECIFICATION.md:627 |
| `measures_entity_axis_time` | `entity_id` (ASC) + `axis` (ASC) + `time_window` (ASC) | 시계열 집계 쿼리 최적화 | DATA_MODEL_SPECIFICATION.md:628 |
| `measures_entity_axis` | `entity_id` (ASC) + `axis` (ASC) | 축별 집계 쿼리 | DATA_MODEL_SPECIFICATION.md:629 |
| `measures_entity_axis_value_time` | `entity_id` (ASC) + `axis` (ASC) + `value_normalized` (ASC) + `time_window` (ASC) | 정규화된 값 기준 시계열 조회 | DATA_MODEL_SPECIFICATION.md:630 |
| `measures_source_priority` | `source_id` (ASC) + `priority` (ASC) | 출처별 우선순위 조회 | DATA_MODEL_SPECIFICATION.md:631 |

**예상 쿼리 패턴**:
```javascript
// timeWindowRules.js에서 사용
db.collection('measures')
  .where('entity_id', '==', 'ARTIST_0005')
  .where('axis', '==', '제도')
  .orderBy('time_window')  // measures_entity_axis_time 인덱스 필요

// fnBatchTimeseries에서 사용
db.collection('measures')
  .where('entity_id', '==', 'ARTIST_0005')
  .where('axis', '==', '제도')
  .where('value_normalized', '!=', null)
  .orderBy('time_window')  // measures_entity_axis_value_time 인덱스 필요
```

---

### 2.2 timeseries 컬렉션 인덱스 (2개)

| 인덱스 이름 | 필드 조합 | 용도 | 문서 위치 |
|-----------|----------|------|----------|
| `timeseries_artist_axis` | `artist_id` (ASC) + `axis` (ASC) | 특정 작가의 특정 축 시계열 조회 | DATA_MODEL_SPECIFICATION.md:668 |
| `timeseries_artist_axis_version` | `artist_id` (ASC) + `axis` (ASC) + `version` (DESC) | 최신 버전 시계열 조회 | DATA_MODEL_SPECIFICATION.md:669 |

**예상 쿼리 패턴**:
```javascript
// getArtistTimeseries에서 사용
db.collection('timeseries')
  .where('artist_id', '==', 'ARTIST_0005')
  .where('axis', '==', '제도')  // timeseries_artist_axis 인덱스 필요

// getBatchTimeseries에서 사용 (최신 버전 조회)
db.collection('timeseries')
  .where('artist_id', '==', 'ARTIST_0005')
  .where('axis', '==', '제도')
  .orderBy('version', 'desc')  // timeseries_artist_axis_version 인덱스 필요
  .limit(1)
```

---

### 2.3 compare_pairs 컬렉션 인덱스 (2개)

| 인덱스 이름 | 필드 조합 | 용도 | 문서 위치 |
|-----------|----------|------|----------|
| `compare_pairs_pair_axis` | `pair_id` (ASC) + `axis` (ASC) | 특정 비교 쌍의 특정 축 조회 | DATA_MODEL_SPECIFICATION.md:692 |
| `compare_pairs_artists_axis` | `artistA_id` (ASC) + `artistB_id` (ASC) + `axis` (ASC) | 작가 쌍별 비교 분석 | DATA_MODEL_SPECIFICATION.md:693 |

**예상 쿼리 패턴**:
```javascript
// getCompareArtists에서 사용
db.collection('compare_pairs')
  .where('pair_id', '==', 'ARTIST_0005_vs_ARTIST_0010')
  .where('axis', '==', '제도')  // compare_pairs_pair_axis 인덱스 필요

// 또는 artistA_id, artistB_id로 조회
db.collection('compare_pairs')
  .where('artistA_id', '==', 'ARTIST_0005')
  .where('artistB_id', '==', 'ARTIST_0010')
  .where('axis', '==', '제도')  // compare_pairs_artists_axis 인덱스 필요
```

---

### 2.4 events 컬렉션 인덱스 (2개)

| 인덱스 이름 | 필드 조합 | 용도 | 문서 위치 |
|-----------|----------|------|----------|
| `events_participants_date_desc` | `entity_participants` (CONTAINS) + `start_date` (DESC) | 특정 작가의 이벤트 시간순 조회 (최신순) | DATA_MODEL_SPECIFICATION.md:707 |
| `events_participants_date_asc` | `entity_participants` (CONTAINS) + `start_date` (ASC) | 특정 작가의 이벤트 범위 조회 | DATA_MODEL_SPECIFICATION.md:708 |

**예상 쿼리 패턴**:
```javascript
// Phase 2 EventTimeline에서 사용
db.collection('events')
  .where('entity_participants', 'array-contains', 'ARTIST_0005')
  .orderBy('start_date', 'desc')  // events_participants_date_desc 인덱스 필요

// timeWindowRules.js getEventsForYear에서 사용
db.collection('events')
  .where('entity_participants', 'array-contains', 'ARTIST_0005')
  .where('start_date', '>=', startDate)
  .where('start_date', '<=', endDate)
  .orderBy('start_date', 'asc')  // events_participants_date_asc 인덱스 필요
```

**주의사항**: `array-contains` 쿼리와 `orderBy`를 함께 사용하려면 복합 인덱스 필수

---

### 2.5 artist_summary 컬렉션 인덱스 (2개)

| 인덱스 이름 | 필드 조합 | 용도 | 문서 위치 |
|-----------|----------|------|----------|
| `artist_summary_is_temporary` | `is_temporary` (ASC) | P2 협업 상태 확인 | DATA_MODEL_SPECIFICATION.md:728 |
| `artist_summary_artist_updated` | `artist_id` (ASC) + `updated_at` (DESC) | 최신 요약 데이터 조회 | DATA_MODEL_SPECIFICATION.md:729 |

**주의사항**: 
- `artist_summary_is_temporary`는 단일 필드 인덱스로 자동 생성되므로 `firestore.indexes.json`에 명시 불필요
- 문서에 명시되어 있으나 실제로는 자동 생성됨

---

### 2.6 entities 컬렉션 인덱스 (1개)

| 인덱스 이름 | 필드 조합 | 용도 | 문서 위치 |
|-----------|----------|------|----------|
| `entities_identity_career` | `identity_type` (ASC) + `career_status` (ASC) | 활성 아티스트 목록 조회 | DATA_MODEL_SPECIFICATION.md:735 |

---

### 2.7 edges 컬렉션 인덱스 (1개)

| 인덱스 이름 | 필드 조합 | 용도 | 문서 위치 |
|-----------|----------|------|----------|
| `edges_src_relation_weight` | `src_id` (ASC) + `relation_type` (ASC) + `weight` (DESC) | 관계 네트워크 조회 | DATA_MODEL_SPECIFICATION.md:741 |

---

### 2.8 physical_game_sessions 컬렉션 인덱스 (2개, 자동 생성)

| 인덱스 이름 | 필드 조합 | 용도 | 문서 위치 |
|-----------|----------|------|----------|
| `physical_game_sessions_started` | `started_at` (DESC) | 최신 세션 조회 | DATA_MODEL_SPECIFICATION.md:747 |
| `physical_game_sessions_created` | `created_at` (DESC) | 생성 시간순 조회 | DATA_MODEL_SPECIFICATION.md:748 |

**주의사항**: 단일 필드 인덱스로 자동 생성되므로 `firestore.indexes.json`에 명시 불필요

---

### 2.9 treasure_box_combinations 컬렉션 인덱스 (2개, 자동 생성)

| 인덱스 이름 | 필드 조합 | 용도 | 문서 위치 |
|-----------|----------|------|----------|
| `treasure_box_combinations_box_ids` | `box_ids` (ARRAY_CONTAINS) | 특정 보물 상자 조합 조회 | DATA_MODEL_SPECIFICATION.md:762 |
| `treasure_box_combinations_rarity` | `rarity` (ASC) | 희귀도별 조회 | DATA_MODEL_SPECIFICATION.md:763 |

**주의사항**: 단일 필드 인덱스로 자동 생성되므로 `firestore.indexes.json`에 명시 불필요

---

## 3. firestore.indexes.json 검증 결과

**파일 위치**: `firestore.indexes.json`

**검증 완료**: ✅ **모든 문서 명시 인덱스가 firestore.indexes.json에 정의되어 있음**

### 3.1 measures 컬렉션 인덱스 (5개) ✅

1. ✅ `entity_id` + `axis` + `metric_code` (ASC)
2. ✅ `entity_id` + `axis` (ASC)
3. ✅ `entity_id` + `axis` + `time_window` (ASC)
4. ✅ `entity_id` + `axis` + `value_normalized` + `time_window` (ASC)
5. ✅ `source_id` + `priority` (ASC)

### 3.2 timeseries 컬렉션 인덱스 (2개) ✅

1. ✅ `artist_id` + `axis` (ASC)
2. ✅ `artist_id` + `axis` + `version` (DESC)

### 3.3 compare_pairs 컬렉션 인덱스 (2개) ✅

1. ✅ `pair_id` + `axis` (ASC)
2. ✅ `artistA_id` + `artistB_id` + `axis` (ASC)

### 3.4 events 컬렉션 인덱스 (2개) ✅

1. ✅ `entity_participants` (CONTAINS) + `start_date` (DESC)
2. ✅ `entity_participants` (CONTAINS) + `start_date` (ASC)

### 3.5 artist_summary 컬렉션 인덱스 (1개) ✅

1. ✅ `artist_id` + `updated_at` (DESC)

**주의사항**: 문서에 명시된 `artist_summary_is_temporary`는 단일 필드 인덱스로 자동 생성되므로 `firestore.indexes.json`에 없음 (정상)

### 3.6 entities 컬렉션 인덱스 (1개) ✅

1. ✅ `identity_type` + `career_status` (ASC)

### 3.7 edges 컬렉션 인덱스 (1개) ✅

1. ✅ `src_id` + `relation_type` + `weight` (DESC)

### 3.8 physical_game_sessions, treasure_box_combinations

단일 필드 인덱스로 자동 생성되므로 `firestore.indexes.json`에 없음 (정상)

**파일 구조**:
```json
{
  "indexes": [
    {
      "collectionGroup": "measures",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "entity_id", "order": "ASCENDING" },
        { "fieldPath": "axis", "order": "ASCENDING" },
        { "fieldPath": "metric_code", "order": "ASCENDING" }
      ]
    },
    // ... 더 많은 인덱스
  ],
  "fieldOverrides": []
}
```

---

## 4. 위험도 분석

### 4.1 검증 결과

✅ **모든 문서 명시 인덱스가 firestore.indexes.json에 정의되어 있음**
- 인덱스 누락 없음
- 인덱스 필드 순서 일치
- array-contains 인덱스 정상 정의됨

### 4.2 잠재적 위험요인 (현재 없음)

1. **인덱스 배포 상태 확인 필요**
   - **위험**: `firestore.indexes.json`에 정의되어 있으나 실제 Firestore에 배포되지 않았을 수 있음
   - **영향**: 쿼리 실패 가능성
   - **예방조치**: `firebase firestore:indexes` 명령으로 배포 상태 확인

### 4.2 Medium Priority 위험요인

1. **불필요한 인덱스**
   - **위험**: 단일 필드 인덱스를 `firestore.indexes.json`에 명시하면 배포 오류
   - **영향**: 배포 실패
   - **예방조치**: 단일 필드 인덱스 제거

2. **인덱스 이름 불일치**
   - **위험**: 문서의 인덱스 이름과 실제 인덱스 이름 불일치
   - **영향**: 유지보수 어려움
   - **예방조치**: 인덱스 이름 통일 (Firestore는 인덱스 이름을 자동 생성하므로 문서에 명시만)

---

## 5. 권장 조치사항

### 5.1 즉시 조치 (Medium Priority)

1. **인덱스 배포 상태 확인**
   ```bash
   # 인덱스 상태 확인
   firebase firestore:indexes
   
   # 배포되지 않은 인덱스가 있다면 배포
   firebase deploy --only firestore:indexes
   ```

2. **인덱스 생성 완료 대기**
   - Firestore 인덱스 생성은 수분~수십분 소요될 수 있음
   - Firebase Console에서 인덱스 생성 상태 확인

### 5.2 단기 조치 (Medium Priority)

1. **인덱스 검증 스크립트 실행**
   ```bash
   node scripts/firestore/validateIndexes.js
   ```

2. **쿼리 패턴 검증**
   - 실제 코드에서 사용하는 쿼리 패턴 확인
   - 인덱스와 일치 여부 검증

3. **성능 모니터링**
   - Firestore Console에서 쿼리 성능 확인
   - 인덱스 미사용 쿼리 식별

### 5.3 장기 조치 (Low Priority)

1. **인덱스 자동화 검증**
   - CI/CD 파이프라인에 인덱스 검증 단계 추가
   - 문서와 코드 간 인덱스 일치 여부 자동 검증

2. **인덱스 최적화**
   - 사용되지 않는 인덱스 제거
   - 쿼리 패턴 분석을 통한 인덱스 최적화

---

## 6. 결론

✅ **인덱스 전략 검증 완료**: 문서에 명시된 모든 인덱스가 `firestore.indexes.json`에 정확히 정의되어 있습니다.

**검증 결과**:
- 총 14개 복합 인덱스 모두 일치
- 인덱스 필드 순서 정확
- array-contains 인덱스 정상 정의

**다음 단계**: 인덱스 배포 상태 확인 및 생성 완료 대기

---

**보고서 작성일**: 2025-11-10  
**검증 완료일**: 2025-11-10

