# 미구현 엔드포인트 구현 계획서

**생성일**: 2025-11-10  
**목적**: FR-P2-EVT-001, FR-P2-BAT-001 구현 계획 수립  
**버전**: 1.0

---

## 1. 개요

본 문서는 검증 보고서에서 식별된 미구현 엔드포인트 2개에 대한 구현 계획을 수립합니다.

### 1.1 미구현 엔드포인트 목록

| FR ID | 엔드포인트 | 우선순위 | 예상 작업량 |
|-------|-----------|----------|------------|
| FR-P2-BAT-001 | `POST /api/batch/timeseries` | High | 2-3일 |
| FR-P2-EVT-001 | `GET /api/artist/{id}/events/{axis}` | Medium | 2-3일 |

---

## 2. FR-P2-BAT-001: 배치 시계열 데이터 조회

### 2.1 목적

Phase 2 UI에서 4축 동시 로드 시 효율성 향상을 위해 단일 요청으로 다중 축 시계열 데이터를 조회합니다.

### 2.2 우선순위: High

**이유**:
- Phase 2 UI 성능 최적화에 직접적 영향
- 네트워크 요청 수 감소 (4개 → 1개)
- Firestore 읽기 ops 효율화

### 2.3 구현 계획

#### 2.3.1 의존성 확인

**필수 확인 사항**:
- [ ] `fnBatchTimeseries` 배치 함수 구현 상태 확인
- [ ] 배치 함수 실행 여부 확인
- [ ] `timeseries` 컬렉션 데이터 존재 여부 확인
- [ ] 인덱스 설정 확인 (`firestore.indexes.json`)

**현재 상태**:
- ✅ 인덱스 정의됨: `timeseries_artist_axis` (line 90-101)
- ✅ 인덱스 정의됨: `timeseries_artist_axis_version` (line 103-119)
- ⚠️ 배치 함수 구현 상태: 확인 필요 (`functions/src/` 디렉토리)
- ⚠️ 데이터 존재 여부: 확인 필요

#### 2.3.2 구현 단계

**Step 1: 배치 함수 확인 및 실행 (1일)**
- `fnBatchTimeseries` 함수 구현 상태 확인
- 미구현 시 구현 (또는 데이터 수동 입력)
- 배치 함수 실행하여 `timeseries` 컬렉션 데이터 생성

**Step 2: API 엔드포인트 구현 (1-2일)**
- `functions/index.js`에 `getBatchTimeseries` 함수 추가
- 요청 검증 (artist_id 패턴, axes enum, 중복 체크)
- Firestore 병렬 쿼리 구현 (Promise.all 사용)
- 응답 형식 문서 스펙 준수
- 에러 처리 구현

**Step 3: 테스트 및 검증 (0.5일)**
- 단위 테스트 작성
- 통합 테스트 수행
- 성능 테스트 (응답 시간 <500ms 확인)

#### 2.3.3 구현 상세

**함수 시그니처**:
```javascript
exports.getBatchTimeseries = onRequest(async (req, res) => {
  // POST 요청 처리
  // Request body 검증
  // Firestore 병렬 쿼리
  // 응답 형식 변환
});
```

**Firestore 쿼리 패턴**:
```javascript
// 각 축에 대해 병렬 쿼리
const queries = axes.map(axis => 
  db.collection('timeseries')
    .where('artist_id', '==', artist_id)
    .where('axis', '==', axis)
    .orderBy('version', 'desc')
    .limit(1)
    .get()
);

const results = await Promise.all(queries);
```

**응답 형식**:
```javascript
{
  data: {
    artist_id: "ARTIST_0005",
    timeseries: {
      제도: {
        axis: "제도",
        bins: [{t: 0, v: 0.1}, ...],
        window_applied: {type: "10y_weighted", boost: 1.0}
      },
      // ... 다른 축들
    },
    version: "v1.0"
  },
  meta: {
    response_time: 450,
    axes_processed: 4,
    total_read_ops: 8
  }
}
```

#### 2.3.4 예상 작업량

- **총 작업량**: 2-3일
- **의존성 해결**: 1일 (배치 함수 확인/실행)
- **구현**: 1-2일
- **테스트**: 0.5일

---

## 3. FR-P2-EVT-001: 이벤트 영향 분석

### 3.1 목적

특정 축의 이벤트 영향 분석 데이터를 반환하여 Phase 2 UI에서 이벤트 영향 시각화를 지원합니다.

### 3.2 우선순위: Medium

**이유**:
- Phase 2 기능 보완
- 이벤트 영향 분석은 시계열 분석의 확장 기능
- 배치 시계열 API 구현 후 진행 가능

### 3.3 구현 계획

#### 3.3.1 의존성 확인

**필수 확인 사항**:
- [ ] `events` 컬렉션 데이터 존재 여부 확인
- [ ] `timeseries` 컬렉션 데이터 존재 여부 확인
- [ ] 이벤트-시계열 조인 로직 구현 가능 여부 확인
- [ ] 영향도 계산 알고리즘 확인

**현재 상태**:
- ✅ 인덱스 정의됨: `events` 컬렉션 (line 181-207)
- ⚠️ 데이터 존재 여부: 확인 필요
- ⚠️ 조인 로직: 구현 필요

#### 3.3.2 구현 단계

**Step 1: 데이터 확인 및 준비 (0.5일)**
- `events` 컬렉션 데이터 확인
- `timeseries` 컬렉션 데이터 확인
- 영향도 계산 알고리즘 검토

**Step 2: API 엔드포인트 구현 (1.5일)**
- `functions/index.js`에 `getArtistEvents` 함수 추가
- Path parameter 검증 (id, axis)
- Firestore 쿼리 구현:
  - `timeseries` 컬렉션에서 해당 축 데이터 조회
  - `events` 컬렉션에서 관련 이벤트 조회
  - 영향도 계산 (delta_v)
- 상위 5개 이벤트만 반환
- 응답 형식 문서 스펙 준수

**Step 3: 테스트 및 검증 (0.5일)**
- 단위 테스트 작성
- 통합 테스트 수행
- 성능 테스트 (응답 시간 <300ms 확인)

#### 3.3.3 구현 상세

**함수 시그니처**:
```javascript
exports.getArtistEvents = onRequest(async (req, res) => {
  // GET 요청 처리
  // Path parameter 검증
  // Firestore 쿼리 (timeseries + events)
  // 영향도 계산
  // 상위 5개 이벤트 반환
});
```

**Firestore 쿼리 패턴**:
```javascript
// 1. 시계열 데이터 조회
const timeseriesDoc = await db.collection('timeseries')
  .where('artist_id', '==', artist_id)
  .where('axis', '==', axis)
  .orderBy('version', 'desc')
  .limit(1)
  .get();

// 2. 관련 이벤트 조회
const eventsSnapshot = await db.collection('events')
  .where('entity_participants', 'array-contains', artist_id)
  .orderBy('start_date', 'desc')
  .get();

// 3. 영향도 계산 (timeseries bins와 events 매칭)
const eventImpacts = calculateEventImpacts(timeseriesData, events);
```

**영향도 계산 로직**:
```javascript
function calculateEventImpacts(timeseriesBins, events) {
  // 각 이벤트에 대해:
  // 1. 이벤트 발생 시점(t) 찾기
  // 2. 해당 시점 전후 bins 값 비교
  // 3. delta_v 계산 (v_after - v_before)
  // 4. 상위 5개 정렬
}
```

**응답 형식**:
```javascript
{
  data: {
    events: [
      {
        t: 5,
        delta_v: 0.2,
        type: "전시",
        event_id: "EVENT_001"
      },
      // ... 최대 5개
    ],
    artist_id: "ARTIST_0005",
    axis: "제도"
  }
}
```

#### 3.3.4 예상 작업량

- **총 작업량**: 2-3일
- **데이터 확인**: 0.5일
- **구현**: 1.5일
- **테스트**: 0.5일

---

## 4. 구현 일정

### 4.1 우선순위별 일정

**Week 1 (High 우선순위)**:
- Day 1-2: FR-P2-BAT-001 배치 함수 확인 및 실행
- Day 3-4: FR-P2-BAT-001 API 엔드포인트 구현
- Day 5: FR-P2-BAT-001 테스트 및 검증

**Week 2 (Medium 우선순위)**:
- Day 1: FR-P2-EVT-001 데이터 확인 및 준비
- Day 2-3: FR-P2-EVT-001 API 엔드포인트 구현
- Day 4: FR-P2-EVT-001 테스트 및 검증

### 4.2 마일스톤

- **M1**: FR-P2-BAT-001 구현 완료 (Week 1 끝)
- **M2**: FR-P2-EVT-001 구현 완료 (Week 2 끝)

---

## 5. 필요한 리소스

### 5.1 Firestore 리소스

**인덱스**:
- ✅ `timeseries_artist_axis` (이미 정의됨)
- ✅ `timeseries_artist_axis_version` (이미 정의됨)
- ✅ `events` 컬렉션 인덱스 (이미 정의됨)

**데이터**:
- `timeseries` 컬렉션 데이터 필요
- `events` 컬렉션 데이터 필요

### 5.2 코드 리소스

**참조할 수 있는 코드**:
- `src/algorithms/timeWindowRules.js`: 시계열 생성 알고리즘
- `src/algorithms/normalizationSpecs.js`: 시계열 생성 알고리즘
- `src/utils/timeseriesProcessor.js`: 시계열 처리 유틸리티

### 5.3 배치 함수

**필요한 배치 함수**:
- `fnBatchTimeseries`: 시계열 데이터 생성 함수
- 구현 상태 확인 필요 (`functions/src/` 디렉토리)

---

## 6. 리스크 및 대응 방안

### 6.1 리스크

1. **배치 함수 미구현**
   - 리스크: `timeseries` 컬렉션 데이터 없음
   - 대응: 배치 함수 우선 구현 또는 데이터 수동 입력

2. **성능 이슈**
   - 리스크: 병렬 쿼리 시 응답 시간 초과
   - 대응: 쿼리 최적화, 캐싱 고려

3. **영향도 계산 정확도**
   - 리스크: delta_v 계산 로직 복잡
   - 대응: 알고리즘 검증 및 테스트 강화

### 6.2 대응 방안

- 배치 함수 우선 구현 또는 데이터 준비
- 성능 모니터링 및 최적화
- 충분한 테스트 케이스 작성

---

## 7. 검증 기준

### 7.1 FR-P2-BAT-001 검증 기준

- [ ] 요청 검증 정확성 (artist_id 패턴, axes enum, 중복 체크)
- [ ] 응답 형식 문서 스펙 준수
- [ ] 모든 축 데이터 정확히 반환
- [ ] 응답 시간 <500ms (4축 기준)
- [ ] 읽기 ops 효율화 확인

### 7.2 FR-P2-EVT-001 검증 기준

- [ ] Path parameter 검증 정확성
- [ ] 응답 형식 문서 스펙 준수
- [ ] 영향도 계산 정확도 >90%
- [ ] 상위 5개 이벤트만 반환
- [ ] 응답 시간 <300ms

---

## 8. 다음 단계

1. 배치 함수 구현 상태 확인
2. `timeseries` 컬렉션 데이터 준비
3. FR-P2-BAT-001 구현 시작
4. FR-P2-EVT-001 구현 시작

---

**계획 수립일**: 2025-11-10  
**예상 완료일**: 2025-11-24 (2주 내)  
**상태**: 계획 수립 완료, 구현 대기

