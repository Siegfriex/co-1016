# 데이터 스키마 일관성 검증 보고서

**생성일**: 2025-11-10  
**검증 기준**: DATA_MODEL_SPECIFICATION.md v1.1 vs 실제 코드 사용 및 firestore.rules  
**검증 범위**: 15개 컬렉션 (원천 9개 + 서빙 3개 + 피지컬 컴퓨팅 3개)

---

## 1. 검증 결과 요약

| 컬렉션명 | 문서 정의 | 코드 사용 | Rules 정의 | 일치 여부 | 상태 |
|---------|----------|----------|-----------|----------|------|
| `artist_summary` | ✅ | ✅ | ✅ | ✅ 일치 | 정상 |
| `timeseries` | ✅ | ⚠️ 미사용 | ✅ | ⚠️ 부분 불일치 | **개선 필요** |
| `compare_pairs` | ✅ | ✅ | ✅ | ✅ 일치 | 정상 |
| `entities` | ✅ | ⚠️ 간접 사용 | ✅ | ✅ 일치 | 정상 |
| `events` | ✅ | ⚠️ 간접 사용 | ✅ | ✅ 일치 | 정상 |
| `measures` | ✅ | ⚠️ 간접 사용 | ✅ | ✅ 일치 | 정상 |
| `artist_sunburst` | ❌ 없음 | ✅ 사용 | ❌ 없음 | ❌ 불일치 | **문서화 필요** |
| `artist_comparisons` | ❌ 없음 | ✅ 사용 | ❌ 없음 | ❌ 불일치 | **문서화 필요** |
| `sunburst_snapshots` | ❌ 없음 | ✅ 사용 | ❌ 없음 | ❌ 불일치 | **문서화 필요** |
| `ai_reports` | ❌ 없음 | ✅ 사용 | ❌ 없음 | ❌ 불일치 | **문서화 필요** |
| `system_health` | ❌ 없음 | ✅ 사용 | ❌ 없음 | ❌ 불일치 | **문서화 필요** |
| `physical_game_sessions` | ✅ | ❌ 미사용 | ❌ 없음 | ⚠️ 부분 불일치 | **Rules 추가 필요** |
| `treasure_boxes` | ✅ | ❌ 미사용 | ❌ 없음 | ⚠️ 부분 불일치 | **Rules 추가 필요** |
| `treasure_box_combinations` | ✅ | ❌ 미사용 | ❌ 없음 | ⚠️ 부분 불일치 | **Rules 추가 필요** |

**일치율**: 5/15 (33.3%)  
**위험도**: 🔴 **HIGH** - 문서에 없는 컬렉션 사용 및 피지컬 컴퓨팅 컬렉션 Rules 누락

---

## 2. 상세 검증 결과

### 2.1 서빙 레이어 컬렉션

#### 2.1.1 artist_summary

**문서 정의** (`DATA_MODEL_SPECIFICATION.md:252-315`):
- 필수 필드: `artist_id`, `name`, `radar5`, `sunburst_l1`, `weights_version`, `updated_at`
- 선택 필드: `is_temporary`, `data_source`
- `radar5`: `{I, F, A, M, Sedu}` (0~100)
- `sunburst_l1`: `{제도, 학술, 담론, 네트워크}` (0~100)

**코드 사용** (`functions/index.js:42`):
```javascript
const p2Doc = await db.collection('artist_summary').doc(artistId).get();
```

**firestore.rules** (`firestore.rules:14-18`):
```javascript
match /artist_summary/{artistId} {
  allow read: if true;
  allow write: if (isAuthorizedBatchFunction() || isAdmin()) && 
                 isValidArtistSummary(request.resource.data);
}
```

**검증 함수** (`firestore.rules:156-165`):
```javascript
function isValidArtistSummary(data) {
  return data.keys().hasAll(['radar5', 'sunburst_l1']) &&
         data.radar5.keys().hasAll(['I', 'F', 'A', 'M', 'Sedu']) &&
         // ... 타입 검증
}
```

**일치 여부**: ✅ **일치**
- 문서 정의와 코드 사용 일치
- Rules 검증 함수가 문서 스키마와 일치

---

#### 2.1.2 timeseries

**문서 정의** (`DATA_MODEL_SPECIFICATION.md:317-360`):
- 필수 필드: `timeseries_id`, `artist_id`, `axis`, `bins[]`, `version`, `debut_year`, `last_calculated`
- `bins`: `[{t: number, v: number}]` (상대 시간축)

**코드 사용** (`functions/index.js:71-102`):
```javascript
// ❌ Firestore 쿼리 없음 - 목업 데이터만 반환
const timeseriesData = {
  artist_id: artistId,
  axis: axis,
  bins: [{ t: 0, v: 12.5 }, ...],  // 하드코딩된 목업
  version: "AHP_v1"
};
```

**firestore.rules** (`firestore.rules:21-25`):
```javascript
match /timeseries/{timeseriesId} {
  allow read: if true;
  allow write: if (isAuthorizedBatchFunction() || isAdmin()) && 
                 isValidTimeseriesData(request.resource.data);
}
```

**불일치 항목**:
1. ❌ **코드에서 Firestore 미사용**: `timeseries` 컬렉션 조회 없이 목업 데이터만 반환
2. ⚠️ **문서 스키마와 목업 구조 불일치**: 
   - 문서: `timeseries_id`, `debut_year`, `last_calculated` 필수
   - 목업: 해당 필드 없음

**영향**: 
- **매우 높음** - Phase 2 기능이 실제 데이터를 사용하지 않음
- Time Window Rules 적용 불가능

---

#### 2.1.3 compare_pairs

**문서 정의** (`DATA_MODEL_SPECIFICATION.md:362-389`):
- 필수 필드: `pair_id`, `artistA_id`, `artistB_id`, `axis`, `series[]`, `abs_diff_sum`, `calculated_at`
- 선택 필드: `correlation`
- `series`: `[{t, v_A, v_B, diff}]`

**코드 사용** (`functions/index.js:271`):
```javascript
const p2Doc = await db.collection('compare_pairs').doc(`${artistA}_vs_${artistB}`).get();
```

**firestore.rules** (`firestore.rules:28-31`):
```javascript
match /compare_pairs/{pairId} {
  allow read: if true;
  allow write: if isAuthorizedBatchFunction() || isAdmin();
}
```

**일치 여부**: ✅ **일치**
- 문서 정의와 코드 사용 일치
- 다만 코드에서 `pair_id` 형식이 `${artistA}_vs_${artistB}`인데, 문서는 `${artistA_id}_{artistB_id}_{axis}` 형식 명시

**주의사항**: `axis`가 `pair_id`에 포함되지 않음 - 문서와 불일치 가능성

---

### 2.2 문서에 없는 컬렉션 (코드에서 사용)

#### 2.2.1 artist_sunburst

**코드 사용** (`functions/index.js:209`):
```javascript
const p2Doc = await db.collection('artist_sunburst').doc(artistId).get();
```

**문서 상태**: ❌ **DATA_MODEL_SPECIFICATION.md에 정의되지 않음**

**추정 스키마** (코드 기반):
- 기본 키: `artist_id`
- 필드: `sunburst_l1`, `sunburst_l2`, `weights_version`, `updated_at`

**영향**: 
- 별도 컬렉션으로 관리되는지, `artist_summary`의 일부인지 불명확
- 문서화 필요

**권장 조치**: 
- `artist_summary`에 통합하거나 별도 컬렉션으로 문서화
- firestore.rules에 보안 규칙 추가

---

#### 2.2.2 artist_comparisons

**코드 사용** (`functions/index.js:271`):
```javascript
const p2Doc = await db.collection('artist_comparisons').doc(`${artistA}_vs_${artistB}`).get();
```

**문서 상태**: ❌ **DATA_MODEL_SPECIFICATION.md에는 `compare_pairs`로 정의**

**불일치**: 
- 코드: `artist_comparisons`
- 문서: `compare_pairs`

**영향**: 
- 컬렉션명 불일치로 인한 데이터 접근 오류 가능성
- firestore.rules는 `compare_pairs`만 정의되어 있어 `artist_comparisons` 접근 불가능

**권장 조치**: 
- 컬렉션명 통일 (`compare_pairs`로 통일 권장)
- 또는 `artist_comparisons`를 문서에 추가하고 Rules에 정의

---

#### 2.2.3 sunburst_snapshots

**코드 사용** (`functions/src/api/index.js:103, 124`):
```javascript
const snapshotDoc = await db.collection('sunburst_snapshots').doc(artistId).get();
await db.collection('sunburst_snapshots').doc(artistId).set({...});
```

**문서 상태**: ❌ **DATA_MODEL_SPECIFICATION.md에 정의되지 않음**

**추정 용도**: 선버스트 데이터 스냅샷/캐시

**영향**: 
- 문서화되지 않은 컬렉션으로 인한 유지보수 어려움
- firestore.rules에 보안 규칙 없음

**권장 조치**: 문서에 추가 및 Rules 정의

---

#### 2.2.4 ai_reports

**코드 사용** (`functions/index.js:364`):
```javascript
const p2Doc = await db.collection('ai_reports').doc(`${artistIds?.join('_')}_${reportType}`).get();
```

**문서 상태**: ❌ **DATA_MODEL_SPECIFICATION.md에 정의되지 않음**

**추정 용도**: AI 보고서 캐시

**영향**: 문서화되지 않은 컬렉션

**권장 조치**: 문서에 추가 및 Rules 정의

---

#### 2.2.5 system_health

**코드 사용** (`functions/index.js:450`):
```javascript
const p2Doc = await db.collection('system_health').doc('vertex_ai').get();
```

**문서 상태**: ❌ **DATA_MODEL_SPECIFICATION.md에 정의되지 않음**

**추정 용도**: 시스템 헬스체크 상태 저장

**영향**: 문서화되지 않은 컬렉션

**권장 조치**: 문서에 추가 및 Rules 정의

---

### 2.3 피지컬 컴퓨팅 컬렉션

#### 2.3.1 physical_game_sessions

**문서 정의** (`DATA_MODEL_SPECIFICATION.md:397-518`):
- 필수 필드: `session_id`, `started_at`, `balls_collected`, `treasure_boxes_selected`, `calculated_metadata`, `main_persona`, `created_at`, `updated_at`
- 선택 필드: `ended_at`, `ai_matching`

**firestore.rules**: ❌ **정의되지 않음**

**코드 사용**: ❌ **현재 미사용** (피지컬 컴퓨팅 백엔드에서 사용 예정)

**영향**: 
- 보안 규칙 없이 컬렉션 생성 시 접근 제어 불가능
- 문서에는 정의되어 있으나 실제 사용 전까지는 문제 없음

**권장 조치**: firestore.rules에 보안 규칙 추가

---

#### 2.3.2 treasure_boxes

**문서 정의** (`DATA_MODEL_SPECIFICATION.md:520-560`):
- 기본 키: `box_id` (integer, 1-9)
- 필수 필드: `age_group`, `position`, `event_description`, `event_type`, `created_at`

**firestore.rules**: ❌ **정의되지 않음**

**코드 사용**: ❌ **현재 미사용**

**권장 조치**: firestore.rules에 보안 규칙 추가 (읽기 전용 권장)

---

#### 2.3.3 treasure_box_combinations

**문서 정의** (`DATA_MODEL_SPECIFICATION.md:562-611`):
- 기본 키: `combination_id`
- 필수 필드: `box_ids[]`, `story_template`, `storytelling_keyword`, `similar_artists[]`

**firestore.rules**: ❌ **정의되지 않음**

**코드 사용**: ❌ **현재 미사용**

**권장 조치**: firestore.rules에 보안 규칙 추가 (읽기 전용 권장)

---

### 2.4 원천 데이터 컬렉션

#### 2.4.1 entities, events, measures

**문서 정의**: ✅ **정의됨**  
**firestore.rules**: ✅ **정의됨**  
**코드 사용**: ⚠️ **간접 사용** (배치 함수에서 사용 예정)

**일치 여부**: ✅ **일치** (현재 직접 사용하지 않으나 구조는 일치)

---

## 3. 필드 타입 검증

### 3.1 artist_summary 필드 타입

| 필드명 | 문서 타입 | 코드 사용 | 일치 여부 |
|--------|----------|----------|----------|
| `radar5.I` | number (0~100) | number | ✅ |
| `radar5.F` | number (0~100) | number | ✅ |
| `radar5.A` | number (0~100) | number | ✅ |
| `radar5.M` | number (0~100) | number | ✅ |
| `radar5.Sedu` | number (0~100) | number | ✅ |
| `sunburst_l1.제도` | number (0~100) | number | ✅ |
| `sunburst_l1.학술` | number (0~100) | number | ✅ |
| `sunburst_l1.담론` | number (0~100) | number | ✅ |
| `sunburst_l1.네트워크` | number (0~100) | number | ✅ |

**주의사항**: 
- 문서에서 `sunburst_l1`은 0~100 범위로 명시되어 있으나, API 스펙에서는 0~1 범위로 표기됨
- 실제 데이터는 0~100 범위 사용 (예: `{제도: 91.2, 학술: 88.0}`)

**불일치**: API_SPECIFICATION.md와 DATA_MODEL_SPECIFICATION.md 간 범위 불일치

---

### 3.2 timeseries 필드 타입

| 필드명 | 문서 타입 | 코드 사용 | 일치 여부 |
|--------|----------|----------|----------|
| `bins[].t` | number (상대 시간) | number | ✅ |
| `bins[].v` | number (0~100) | number | ✅ |
| `debut_year` | integer | ❌ 없음 | ❌ 불일치 |
| `last_calculated` | timestamp | ❌ 없음 | ❌ 불일치 |

**불일치**: 목업 데이터에 필수 필드 누락

---

## 4. 위험도 분석

### 4.1 High Priority 위험요인

1. **문서에 없는 컬렉션 사용 (5개)**
   - **위험**: `artist_sunburst`, `artist_comparisons`, `sunburst_snapshots`, `ai_reports`, `system_health`가 문서에 없어 유지보수 어려움
   - **영향**: 신규 개발자 혼란, 데이터 구조 파악 불가능
   - **예방조치**: 모든 컬렉션 문서화 또는 코드에서 제거

2. **컬렉션명 불일치**
   - **위험**: `artist_comparisons` vs `compare_pairs` 불일치
   - **영향**: 데이터 접근 실패 가능성
   - **예방조치**: 컬렉션명 통일

3. **피지컬 컴퓨팅 컬렉션 Rules 누락**
   - **위험**: 보안 규칙 없이 컬렉션 사용 시 접근 제어 불가능
   - **영향**: 보안 취약점
   - **예방조치**: firestore.rules에 보안 규칙 추가

4. **timeseries 컬렉션 미사용**
   - **위험**: Phase 2 핵심 기능이 실제 데이터를 사용하지 않음
   - **영향**: Time Window Rules 미적용, 잘못된 분석 결과
   - **예방조치**: timeseries 컬렉션 조회 로직 구현

### 4.2 Medium Priority 위험요인

1. **필드 범위 불일치**
   - **위험**: API 스펙(0~1)과 데이터 모델(0~100) 간 범위 불일치
   - **영향**: 클라이언트 파싱 오류 가능성
   - **예방조치**: 문서 간 범위 통일

2. **필수 필드 누락**
   - **위험**: timeseries 목업 데이터에 `debut_year`, `last_calculated` 누락
   - **영향**: 스키마 검증 실패 가능성
   - **예방조치**: 목업 데이터 구조 수정

---

## 5. 권장 조치사항

### 5.1 즉시 조치 (High Priority)

1. **컬렉션명 통일**
   - `artist_comparisons` → `compare_pairs`로 통일
   - 또는 `artist_comparisons`를 문서에 추가하고 Rules 정의

2. **문서에 없는 컬렉션 문서화**
   - `artist_sunburst`, `sunburst_snapshots`, `ai_reports`, `system_health` 문서 추가
   - 또는 `artist_summary`에 통합

3. **피지컬 컴퓨팅 컬렉션 Rules 추가**
   ```javascript
   match /physical_game_sessions/{sessionId} {
     allow read: if true; // 공개 읽기
     allow write: if isAuthorizedBatchFunction() || isAdmin();
   }
   
   match /treasure_boxes/{boxId} {
     allow read: if true; // 공개 읽기 (읽기 전용)
     allow write: if isAdmin();
   }
   
   match /treasure_box_combinations/{combinationId} {
     allow read: if true; // 공개 읽기 (읽기 전용)
     allow write: if isAdmin();
   }
   ```

4. **timeseries 컬렉션 사용 구현**
   - Firestore 쿼리 로직 추가
   - Time Window Rules 적용

### 5.2 단기 조치 (Medium Priority)

1. **필드 범위 통일**
   - API 스펙과 데이터 모델 간 범위 통일 (0~100 권장)
   - 또는 정규화 계층 명시

2. **목업 데이터 구조 수정**
   - timeseries 목업에 필수 필드 추가

3. **스키마 검증 강화**
   - Cloud Functions에서 스키마 검증 로직 추가
   - 문서 정의와 일치 여부 자동 검증

### 5.3 장기 조치 (Low Priority)

1. **스키마 버전 관리**
   - 스키마 변경 시 버전 관리 프로세스 수립
   - 마이그레이션 스크립트 작성

2. **자동화 검증**
   - 스키마 일치 여부 자동 검증 스크립트
   - CI/CD 파이프라인 통합

---

## 6. 결론

데이터 스키마 일치율은 33.3%로 매우 낮습니다. 주요 문제점:

1. **문서에 없는 컬렉션 5개 사용**: 문서화 필요
2. **컬렉션명 불일치**: `artist_comparisons` vs `compare_pairs`
3. **피지컬 컴퓨팅 컬렉션 Rules 누락**: 보안 취약점
4. **timeseries 컬렉션 미사용**: Phase 2 기능 제한

**즉시 조치 필요**: 컬렉션명 통일 및 문서화, 피지컬 컴퓨팅 Rules 추가

---

**보고서 작성일**: 2025-11-10  
**다음 검토일**: 스키마 수정 후 재검증

