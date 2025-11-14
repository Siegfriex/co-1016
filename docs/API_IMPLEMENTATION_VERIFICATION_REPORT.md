# API 구현 검증 보고서

**생성일**: 2025-11-10  
**검증 기준**: API_SPECIFICATION.md v1.1 vs functions/index.js  
**검증 범위**: Phase 1-4 주요 엔드포인트 7개

---

## 1. 검증 결과 요약

| 엔드포인트 | API 스펙 | 구현 상태 | 스키마 일치 | 상태 |
|-----------|---------|----------|------------|------|
| GET /api/artist/{id}/summary | ✅ 정의됨 | ✅ 구현됨 | ⚠️ 부분 불일치 | **수정 필요** |
| GET /api/artist/{id}/sunburst | ✅ 정의됨 | ✅ 구현됨 | ⚠️ 부분 불일치 | **수정 필요** |
| GET /api/artist/{id}/timeseries/{axis} | ✅ 정의됨 | ⚠️ 부분 구현 | ❌ 불일치 | **개선 필요** |
| POST /api/batch/timeseries | ✅ 정의됨 | ❌ 미구현 | - | **구현 필요** |
| GET /api/artist/{id}/events/{axis} | ✅ 정의됨 | ❌ 미구현 | - | **구현 필요** |
| GET /api/compare/{artistA}/{artistB}/{axis} | ✅ 정의됨 | ⚠️ 부분 구현 | ❌ 불일치 | **수정 필요** |
| POST /api/report/generate | ✅ 정의됨 | ✅ 구현됨 | ⚠️ 부분 불일치 | **수정 필요** |

**구현률**: 5/7 (71.4%)  
**완전 일치율**: 0/7 (0%)  
**위험도**: 🔴 **HIGH** - 스키마 불일치 및 미구현 엔드포인트 존재

---

## 2. 상세 검증 결과

### 2.1 GET /api/artist/{id}/summary

**API 스펙**:
- Path Parameter: `{id}` (pattern: `^ARTIST_\d{4}$`)
- Query Parameter: `version` (optional)
- Response: `{ data: {...}, meta: {...} }` 형식

**실제 구현** (`functions/index.js:33-68`):
```javascript
exports.getArtistSummary = onRequest(async (req, res) => {
  const artistId = req.query.id || 'ARTIST_0005';  // ❌ Query parameter 사용
  // ...
  return res.status(200).json(p2Doc.data());  // ❌ data 래퍼 없음
});
```

**불일치 항목**:
1. ❌ **Path Parameter vs Query Parameter**: 스펙은 path parameter `{id}`를 요구하나 구현은 `req.query.id` 사용
2. ❌ **응답 형식**: 스펙은 `{ data: {...}, meta: {...} }` 래퍼를 요구하나 구현은 직접 데이터 반환
3. ⚠️ **패턴 검증 누락**: `^ARTIST_\d{4}$` 패턴 검증 없음
4. ⚠️ **version 파라미터 미지원**: Query parameter `version` 처리 없음

**영향**: 
- Firebase Hosting rewrites 설정과 불일치 (`/api/artist/*/summary`는 path parameter를 기대)
- 클라이언트가 스펙 기반으로 호출 시 오류 발생 가능

**권장 수정**:
```javascript
exports.getArtistSummary = onRequest(async (req, res) => {
  const artistId = req.params.id || req.query.id || 'ARTIST_0005';
  
  // 패턴 검증
  if (!/^ARTIST_\d{4}$/.test(artistId)) {
    return res.status(400).json({ 
      error: { code: 'ERR_INVALID_PARAM', message: 'Invalid artist ID format' }
    });
  }
  
  // ... 데이터 조회 로직 ...
  
  return res.status(200).json({
    data: p2Doc.data(),
    meta: { cache_hit: true, response_time: Date.now() - startTime }
  });
});
```

---

### 2.2 GET /api/artist/{id}/sunburst

**API 스펙**:
- Path Parameter: `{id}` (string, required)
- Response: `{ data: { sunburst: {...}, artist_id, generated_at } }` 형식

**실제 구현** (`functions/index.js:200-258`):
```javascript
exports.getArtistSunburst = onRequest(async (req, res) => {
  const artistId = req.query.id || 'ARTIST_0005';  // ❌ Query parameter 사용
  // ...
  return res.status(200).json(sunburstData);  // ❌ data 래퍼 없음
});
```

**불일치 항목**:
1. ❌ **Path Parameter vs Query Parameter**: 동일한 문제
2. ❌ **응답 형식**: `data` 래퍼 없음
3. ⚠️ **스키마 구조**: 스펙은 `sunburst.l1`, `sunburst.l2` 중첩 구조를 요구하나 구현은 `sunburst_l1`, `sunburst_l2` 평면 구조

**영향**: 클라이언트가 스펙 기반으로 파싱 시 오류 발생 가능

---

### 2.3 GET /api/artist/{id}/timeseries/{axis}

**API 스펙**:
- Path Parameters: `{id}`, `{axis}` (enum: 제도, 학술, 담론, 네트워크)
- Query Parameters: `window`, `limit`
- Response: `{ data: { artist_id, axis, bins[], window_applied, version }, meta: {...} }`
- **Time Window Rules 적용 필수**

**실제 구현** (`functions/index.js:71-102`):
```javascript
exports.getArtistTimeseries = onRequest(async (req, res) => {
  const artistId = req.query.id || req.query.artistId || 'ARTIST_0005';
  const axis = req.query.axis || '제도';  // ❌ Path parameter 미사용
  
  // ❌ 목업 데이터만 반환 (Time Window Rules 미적용)
  const timeseriesData = {
    artist_id: artistId,
    axis: axis,
    bins: [{ t: 0, v: 12.5 }, ...],  // 하드코딩된 목업 데이터
    version: "AHP_v1"
  };
  
  return res.status(200).json(timeseriesData);  // ❌ data 래퍼 없음
});
```

**불일치 항목**:
1. ❌ **Path Parameter 미사용**: `{id}`, `{axis}` path parameter 처리 없음
2. ❌ **Time Window Rules 미적용**: 비즈니스 로직 문서의 Time Window Rules 전혀 적용 안 됨
3. ❌ **Firestore 쿼리 없음**: `timeseries` 컬렉션 조회 없이 목업 데이터만 반환
4. ❌ **응답 형식**: `data` 래퍼 및 `meta` 정보 없음
5. ⚠️ **axis enum 검증 없음**: 스펙의 enum 값 검증 없음

**영향**: 
- **매우 높음** - Phase 2 핵심 기능이 작동하지 않음
- 실제 데이터 기반 시계열 분석 불가능
- Time Window Rules (담론 24개월, 제도 10년 가중치 등) 미적용

**권장 수정**:
```javascript
exports.getArtistTimeseries = onRequest(async (req, res) => {
  const artistId = req.params.id || req.query.id;
  const axis = req.params.axis || req.query.axis;
  
  // Enum 검증
  const validAxes = ['제도', '학술', '담론', '네트워크'];
  if (!validAxes.includes(axis)) {
    return res.status(400).json({ 
      error: { code: 'ERR_INVALID_AXIS', message: 'Invalid axis' }
    });
  }
  
  // Firestore 쿼리
  const timeseriesDoc = await db.collection('timeseries')
    .doc(`${artistId}_${axis}`)
    .get();
  
  if (!timeseriesDoc.exists) {
    // Time Window Rules 적용하여 실시간 계산
    const timeseriesData = await calculateTimeseriesWithTimeWindowRules(artistId, axis);
    return res.status(200).json({ data: timeseriesData, meta: { computed: true } });
  }
  
  return res.status(200).json({ 
    data: timeseriesDoc.data(), 
    meta: { cache_hit: true } 
  });
});
```

---

### 2.4 POST /api/batch/timeseries

**API 스펙**:
- Request Body: `{ artist_id, axes[], options: { limit, window } }`
- Response: `{ data: { artist_id, timeseries: { [axis]: {...} }, version }, meta: {...} }`
- **구현 상태**: ❌ **미구현**

**영향**:
- Phase 2 UI에서 4축 동시 로드 시 비효율적 (4개 개별 요청 필요)
- Firestore 읽기 ops 증가 (4회 → 1회로 최적화 가능)

**구현 필요성**: 🔴 **HIGH** - 성능 최적화를 위해 필수

**예상 구현 코드**:
```javascript
exports.getBatchTimeseries = onRequest(async (req, res) => {
  const { artist_id, axes, options = {} } = req.body;
  
  // Validation
  if (!artist_id || !axes || !Array.isArray(axes) || axes.length === 0) {
    return res.status(400).json({ error: { code: 'ERR_INVALID_PARAM' } });
  }
  
  const timeseries = {};
  for (const axis of axes) {
    const doc = await db.collection('timeseries')
      .doc(`${artist_id}_${axis}`)
      .get();
    if (doc.exists) {
      timeseries[axis] = doc.data();
    }
  }
  
  return res.status(200).json({
    data: { artist_id, timeseries, version: 'v1.0' },
    meta: { axes_processed: axes.length }
  });
});
```

---

### 2.5 GET /api/artist/{id}/events/{axis}

**API 스펙**:
- Path Parameters: `{id}`, `{axis}`
- Response: `{ data: { events: [{ t, delta_v, type, event_id }], artist_id, axis } }`
- **구현 상태**: ❌ **미구현**

**영향**:
- Phase 2 EventTimeline 컴포넌트에서 이벤트 영향 분석 불가능
- FR-P2-DQ-002 요구사항 미충족

**구현 필요성**: 🟡 **MEDIUM** - Phase 2 보완 기능

---

### 2.6 GET /api/compare/{artistA}/{artistB}/{axis}

**API 스펙**:
- Path Parameters: `{artistA}`, `{artistB}`, `{axis}` (모두 필수)
- Query Parameter: `compute` (boolean, optional)
- Response: `{ data: { pair_id, axis, series[], metrics, cached, computed_at }, meta: {...} }`

**실제 구현** (`functions/index.js:261-352`):
```javascript
exports.getCompareArtists = onRequest(async (req, res) => {
  const { artistA, artistB } = req.params;  // ⚠️ Path parameter는 받지만
  const axis = req.query.axis || 'all';  // ❌ axis는 query parameter로 처리
  
  // ❌ 응답 형식 불일치
  const comparisonData = {
    artist_a: {...},  // 스펙과 다른 구조
    artist_b: {...},
    comparison_metrics: {...},  // 스펙은 metrics만 요구
    axis_comparison: {...}  // 스펙에는 없음
  };
  
  return res.status(200).json(comparisonData);  // ❌ data 래퍼 없음
});
```

**불일치 항목**:
1. ❌ **axis Path Parameter 미사용**: 스펙은 `{axis}` path parameter를 요구하나 구현은 query parameter 사용
2. ❌ **응답 스키마 불일치**: 
   - 스펙: `{ pair_id, axis, series[], metrics, cached, computed_at }`
   - 구현: `{ artist_a, artist_b, comparison_metrics, axis_comparison }`
3. ❌ **series 배열 없음**: 스펙의 `series[{t, v_A, v_B, diff}]` 구조 없음
4. ❌ **data 래퍼 없음**

**영향**: Phase 3 비교 분석 UI에서 데이터 파싱 오류 발생 가능

---

### 2.7 POST /api/report/generate

**API 스펙**:
- Request Body: `{ artist_id, include_phases[], compare_with?, prompt_options? }`
- Response: `{ data: { report_id, content, model_used, token_usage, generated_at, cost_estimate }, meta: {...} }`

**실제 구현** (`functions/index.js:105-155`):
```javascript
exports.generateAiReport = onRequest(async (req, res) => {
  const { artistA_data, artistB_data, comparison_analysis } = req.body;  // ❌ 스펙과 다른 구조
  
  // ✅ Vertex AI 연동은 구현됨
  const result = await vertexAI.generateComprehensiveReport(...);
  
  return res.status(200).json(result);  // ⚠️ 응답 형식 확인 필요
});
```

**불일치 항목**:
1. ❌ **Request Body 스키마 불일치**: 
   - 스펙: `{ artist_id, include_phases[], compare_with?, prompt_options? }`
   - 구현: `{ artistA_data, artistB_data, comparison_analysis }`
2. ⚠️ **응답 형식**: VertexAIService의 응답 형식이 스펙과 일치하는지 확인 필요

**영향**: 클라이언트가 스펙 기반으로 요청 시 오류 발생 가능

---

## 3. 추가 구현된 엔드포인트 (문서에 없음)

### 3.1 POST /api/ai/vertex-generate

**구현 상태**: ✅ 구현됨 (`generateComprehensiveReport`)  
**문서 상태**: ❌ API_SPECIFICATION.md에 정의되지 않음

**권장 조치**: 문서에 추가하거나 별도 확장 API 문서로 분리

---

### 3.2 GET /api/ai/vertex-health

**구현 상태**: ✅ 구현됨 (`checkVertexHealth`)  
**문서 상태**: ❌ API_SPECIFICATION.md에 정의되지 않음

**권장 조치**: 헬스체크 엔드포인트로 문서화

---

## 4. Firebase Hosting Rewrites 설정 검증

**firebase.json rewrites 설정**:
```json
{
  "/api/artist/*/summary": "getArtistSummary",
  "/api/artist/*/sunburst": "getArtistSunburst",
  "/api/artist/*/timeseries/*": "getArtistTimeseries",
  "/api/compare/*/*": "getCompareArtists",
  "/api/report/generate": "generateAiReport"
}
```

**문제점**:
1. ❌ `/api/compare/*/*`는 2개 path segment만 매칭하나 스펙은 3개 (`{artistA}/{artistB}/{axis}`) 요구
2. ❌ `/api/batch/timeseries` rewrites 설정 없음 (미구현이므로 당연)
3. ❌ `/api/artist/*/events/*` rewrites 설정 없음 (미구현이므로 당연)

---

## 5. 위험도 분석

### 5.1 High Priority 위험요인

1. **미구현 엔드포인트 (2개)**
   - **위험**: FR-P2-BAT-001, FR-P2-EVT-001 미구현으로 기능 불완전성
   - **영향**: Phase 2 UI 기능 제한, 성능 최적화 불가능
   - **예방조치**: 즉시 구현 우선순위 결정 및 일정 수립

2. **Path Parameter 처리 오류**
   - **위험**: 모든 엔드포인트가 query parameter로 처리하여 Firebase Hosting rewrites와 불일치
   - **영향**: 실제 배포 환경에서 라우팅 실패 가능성
   - **예방조치**: 모든 엔드포인트의 path parameter 처리 수정

3. **응답 스키마 불일치**
   - **위험**: `{ data: {...}, meta: {...} }` 래퍼 없이 직접 데이터 반환
   - **영향**: 클라이언트 코드가 스펙 기반으로 작성된 경우 파싱 오류
   - **예방조치**: 모든 응답에 표준 래퍼 적용

4. **Time Window Rules 미적용**
   - **위험**: Phase 2 시계열 데이터가 비즈니스 로직 규칙 없이 반환
   - **영향**: 잘못된 분석 결과 제공 가능성
   - **예방조치**: Time Window Rules 구현 및 적용

### 5.2 Medium Priority 위험요인

1. **패턴 검증 누락**
   - **위험**: `artist_id` 패턴 검증 없이 임의 문자열 허용
   - **영향**: 잘못된 데이터 조회 시도로 인한 오류
   - **예방조치**: 모든 path parameter에 패턴 검증 추가

2. **Enum 검증 누락**
   - **위험**: `axis` enum 값 검증 없음
   - **영향**: 잘못된 축 이름으로 인한 오류
   - **예방조치**: axis enum 검증 로직 추가

3. **에러 응답 형식 불일치**
   - **위험**: API 스펙의 에러 형식 `{ error: { code, message, details, timestamp }, status }` 미준수
   - **영향**: 클라이언트 에러 처리 로직과 불일치
   - **예방조치**: 표준 에러 응답 형식 적용

---

## 6. 권장 조치사항

### 6.1 즉시 조치 (High Priority)

1. **Path Parameter 처리 수정**
   - 모든 엔드포인트에서 `req.params` 사용하도록 수정
   - Firebase Hosting rewrites와 일치하도록 확인

2. **응답 스키마 표준화**
   - 모든 성공 응답에 `{ data: {...}, meta: {...} }` 래퍼 적용
   - 모든 에러 응답에 `{ error: { code, message, details, timestamp }, status }` 형식 적용

3. **미구현 엔드포인트 구현**
   - `POST /api/batch/timeseries` 구현 (성능 최적화 필수)
   - `GET /api/artist/{id}/events/{axis}` 구현 (Phase 2 보완)

4. **Time Window Rules 적용**
   - `getArtistTimeseries`에 Time Window Rules 로직 통합
   - `timeWindowRules.js` 모듈 활용

### 6.2 단기 조치 (Medium Priority)

1. **패턴 및 Enum 검증 추가**
   - 모든 path parameter에 패턴 검증
   - axis enum 검증 로직 추가

2. **Firebase Hosting Rewrites 수정**
   - `/api/compare/*/*/*` 패턴으로 수정 (axis 포함)
   - 미구현 엔드포인트 rewrites 추가 준비

3. **문서 업데이트**
   - 추가 구현된 엔드포인트 문서화
   - 실제 구현과 일치하도록 스펙 업데이트 또는 구현 수정

### 6.3 장기 조치 (Low Priority)

1. **자동화 테스트**
   - API 스펙 기반 자동 테스트 작성
   - 스키마 검증 자동화

2. **API 버전 관리**
   - Breaking change 발생 시 버전 관리 전략 수립
   - Deprecation 프로세스 정의

---

## 7. 결론

API 구현률은 71.4%이지만, 완전히 스펙과 일치하는 엔드포인트는 없습니다. 주요 문제점은:

1. **Path Parameter 처리 오류**: 모든 엔드포인트가 query parameter 사용
2. **응답 스키마 불일치**: 표준 래퍼 형식 미준수
3. **미구현 엔드포인트**: 2개 엔드포인트 미구현
4. **비즈니스 로직 미적용**: Time Window Rules 미적용

**즉시 조치 필요**: Path Parameter 처리 수정 및 응답 스키마 표준화

---

**보고서 작성일**: 2025-11-10  
**다음 검토일**: 구현 수정 후 재검증

