# 비즈니스 로직 검증 보고서

**생성일**: 2025-11-10  
**검증 기준**: BUSINESS_LOGIC_SPECIFICATION.md vs 실제 구현 코드  
**검증 범위**: Phase 1-4 핵심 비즈니스 로직

---

## 1. 검증 결과 요약

| Phase | 비즈니스 로직 | 문서 명시 | 구현 상태 | 일치 여부 | 상태 |
|-------|--------------|----------|----------|----------|------|
| Phase 1 | `calculateArtistSummary` | ✅ 의사코드 | ⚠️ 부분 구현 | ⚠️ 부분 불일치 | **개선 필요** |
| Phase 1 | 일관성 검증 (±0.5p) | ✅ 명시 | ✅ 구현됨 | ✅ 일치 | 정상 |
| Phase 2 | `calculateTimeseries` | ✅ 의사코드 | ❌ 미적용 | ❌ 불일치 | **구현 필요** |
| Phase 2 | Time Window Rules | ✅ 상세 명시 | ✅ 구현됨 | ⚠️ 미사용 | **적용 필요** |
| Phase 3 | `compareArtists` | ✅ 의사코드 | ⚠️ 부분 구현 | ⚠️ 부분 불일치 | **개선 필요** |
| Phase 4 | `generateAIReport` | ✅ 의사코드 | ✅ 구현됨 | ✅ 일치 | 정상 |

**일치율**: 2/6 (33.3%)  
**위험도**: 🔴 **HIGH** - Phase 2 핵심 로직 미적용

---

## 2. 상세 검증 결과

### 2.1 Phase 1: 현재 가치 분석

#### 2.1.1 calculateArtistSummary

**문서 명시** (`BUSINESS_LOGIC_SPECIFICATION.md:86-128`):
```pseudocode
FUNCTION calculateArtistSummary(artistId):
  1. measures 컬렉션에서 작가 데이터 조회
  2. 축별로 그룹화
  3. 각 축별 가중치 적용하여 집계
  4. 선버스트 → 레이더 변환
  5. 일관성 검증 (±0.5p)
  6. artist_summary 저장
END FUNCTION
```

**실제 구현** (`functions/index.js:33-68`):
```javascript
exports.getArtistSummary = onRequest(async (req, res) => {
  // ❌ measures 컬렉션 조회 없음
  // ❌ 가중치 적용 없음
  // ❌ 선버스트 → 레이더 변환 없음
  
  // ✅ artist_summary 컬렉션에서 직접 조회 (사전 계산된 데이터 사용)
  const p2Doc = await db.collection('artist_summary').doc(artistId).get();
  
  if (p2Doc.exists) {
    return res.status(200).json(p2Doc.data());
  }
  
  // 목업 데이터 반환
  return res.status(200).json(mockArtistData[artistId]);
});
```

**불일치 항목**:
1. ❌ **실시간 계산 없음**: 문서는 `measures`에서 실시간 계산을 명시하나 구현은 사전 계산된 `artist_summary`만 조회
2. ⚠️ **폴백 전략**: 목업 데이터 사용은 문서의 폴백 전략과 일치하나, 실시간 계산 로직 없음

**영향**: 
- **낮음** - 사전 계산된 데이터 사용은 성능상 유리하나, 실시간 계산 기능 없음
- 배치 함수(`fnBatchNormalize`, `fnBatchWeightsApply`)에서 사전 계산 가정

**권장 조치**: 
- 실시간 계산 로직 구현 (선택적)
- 또는 배치 함수 구현 확인 및 문서화

---

#### 2.1.2 일관성 검증 (±0.5p)

**문서 명시** (`BUSINESS_LOGIC_SPECIFICATION.md:46`):
- **핵심 원칙**: ±0.5p 일관성 검증 필수
- `radar5` 합계와 `sunburst_l1`에서 변환한 `radar5` 합계 차이가 0.5 이하여야 함

**실제 구현** (`src/utils/dataQualityValidator.js`):
```javascript
performConsistencyCalculation(radar5, sunburst_l1) {
  const radarSum = Object.values(radar5).reduce((sum, value) => sum + (value || 0), 0);
  const radar5FromSunburst = this.mapSunburstToRadar5(sunburst_l1);
  const radar5FromSunburstSum = Object.values(radar5FromSunburst).reduce((sum, value) => sum + (value || 0), 0);
  const difference = Math.abs(radarSum - radar5FromSunburstSum);
  const isConsistent = difference <= this.qualityStandards.consistency_tolerance; // 0.5
  
  return {
    valid: isConsistent,
    difference: difference,
    tolerance: this.qualityStandards.consistency_tolerance,
    // ... 상세 분석
  };
}
```

**일치 여부**: ✅ **일치**
- 문서 명시 로직과 구현 코드 일치
- `consistency_tolerance: 0.5` 정확히 구현됨

**주의사항**: 
- API 레벨에서 일관성 검증 실행 여부 확인 필요
- `getArtistSummary`에서 검증 로직 호출 여부 확인 필요

---

### 2.2 Phase 2: 커리어 궤적 분석

#### 2.2.1 calculateTimeseries

**문서 명시** (`BUSINESS_LOGIC_SPECIFICATION.md:153-200`):
```pseudocode
FUNCTION calculateTimeseries(artistId, axis):
  1. measures 조회
  2. 데뷔년 조회
  3. Time Window Rules 적용
     - 담론: 24개월 hard cutoff
     - 제도: 10년 윈도우 (최근 5년 × 1.0, 이전 5년 × 0.5)
     - 학술: 누적 + 최근 5년 30% boost
     - 네트워크: 누적
  4. 연도별 집계
  5. 상대 시간축 변환 (t = year - debutYear)
  6. timeseries 저장
END FUNCTION
```

**실제 구현** (`functions/index.js:71-102`):
```javascript
exports.getArtistTimeseries = onRequest(async (req, res) => {
  const artistId = req.query.id || req.query.artistId || 'ARTIST_0005';
  const axis = req.query.axis || '제도';
  
  // ❌ measures 컬렉션 조회 없음
  // ❌ Time Window Rules 적용 없음
  // ❌ 데뷔년 조회 없음
  // ❌ 상대 시간축 변환 없음
  
  // ❌ 하드코딩된 목업 데이터만 반환
  const timeseriesData = {
    artist_id: artistId,
    axis: axis,
    bins: [
      { t: 0, v: 12.5 },
      { t: 5, v: 34.7 },
      { t: 10, v: 67.2 },
      { t: 15, v: 88.4 },
      { t: 20, v: 94.0 }
    ],
    version: "AHP_v1"
  };
  
  return res.status(200).json(timeseriesData);
});
```

**Time Window Rules 구현** (`src/algorithms/timeWindowRules.js`):
- ✅ **구현됨**: `TIME_WINDOW_RULES` 객체에 모든 축별 규칙 정의
- ✅ **상세 구현**: 각 축별 JavaScript 코드 구현
- ✅ **시계열 집계 알고리즘**: `TIMESERIES_AGGREGATION_SPECS`에 완전한 알고리즘 정의

**불일치 항목**:
1. ❌ **Time Window Rules 미적용**: `getArtistTimeseries`에서 `timeWindowRules.js` 모듈 미사용
2. ❌ **실시간 계산 없음**: 목업 데이터만 반환
3. ❌ **measures 컬렉션 미조회**: Firestore 쿼리 없음

**영향**: 
- **매우 높음** - Phase 2 핵심 기능이 작동하지 않음
- Time Window Rules (담론 24개월, 제도 10년 가중치 등) 미적용으로 잘못된 분석 결과 제공 가능

**권장 수정**:
```javascript
const { TIME_WINDOW_RULES, TIMESERIES_AGGREGATION_SPECS } = require('../src/algorithms/timeWindowRules');

exports.getArtistTimeseries = onRequest(async (req, res) => {
  const artistId = req.params.id || req.query.id;
  const axis = req.params.axis || req.query.axis;
  
  // 1. measures 조회
  const measuresSnapshot = await db.collection('measures')
    .where('entity_id', '==', artistId)
    .where('axis', '==', axis)
    .orderBy('time_window')
    .get();
  
  // 2. 데뷔년 조회
  const artistDoc = await db.collection('entities').doc(artistId).get();
  const debutYear = artistDoc.data().debut_year;
  
  // 3. Time Window Rules 적용
  const timeWindowRule = TIME_WINDOW_RULES.axis_specifications[axis];
  const processedMeasures = applyTimeWindowRule(measuresSnapshot.docs, timeWindowRule);
  
  // 4. 연도별 집계 및 상대 시간축 변환
  const bins = generateTimeseriesBins(processedMeasures, debutYear, axis);
  
  return res.status(200).json({
    artist_id: artistId,
    axis: axis,
    bins: bins,
    version: "AHP_v1",
    time_window_applied: timeWindowRule.rule
  });
});
```

---

### 2.3 Phase 3: 비교 분석

#### 2.3.1 compareArtists

**문서 명시** (`BUSINESS_LOGIC_SPECIFICATION.md:220-260`):
```pseudocode
FUNCTION compareArtists(artistA, artistB, axis):
  1. 두 작가의 timeseries 조회
  2. 시간 정렬 및 보간
  3. 차이 계산 (diff = v_A - v_B)
  4. 상관계수 계산
  5. AUC 계산
  6. compare_pairs 저장
END FUNCTION
```

**실제 구현** (`functions/index.js:261-352`):
```javascript
exports.getCompareArtists = onRequest(async (req, res) => {
  const { artistA, artistB } = req.params;
  const axis = req.query.axis || 'all';
  
  // ⚠️ compare_pairs 컬렉션에서 사전 계산된 데이터 조회 시도
  const p2Doc = await db.collection('compare_pairs').doc(`${artistA}_vs_${artistB}`).get();
  
  if (p2Doc.exists) {
    return res.status(200).json(p2Doc.data());
  }
  
  // ❌ 실시간 계산 로직 없음
  // ❌ timeseries 조회 없음
  // ❌ 보간, 상관계수, AUC 계산 없음
  
  // 목업 비교 데이터 생성
  const comparisonData = {
    artist_a: {...},
    artist_b: {...},
    comparison_metrics: {...},
    axis_comparison: {...}
  };
  
  return res.status(200).json(comparisonData);
});
```

**불일치 항목**:
1. ❌ **실시간 계산 로직 없음**: 문서는 실시간 계산을 명시하나 구현은 사전 계산된 데이터만 조회
2. ❌ **비교 알고리즘 미구현**: 보간, 상관계수, AUC 계산 없음
3. ⚠️ **폴백 전략**: 목업 데이터 사용은 문서와 일치하나, 실시간 계산 기능 없음

**영향**: 
- **중간** - 사전 계산된 데이터 사용은 성능상 유리하나, 실시간 비교 기능 없음
- 배치 함수(`fnBatchComparePairs`)에서 사전 계산 가정

**권장 조치**: 
- 실시간 비교 계산 로직 구현 (선택적)
- 또는 배치 함수 구현 확인 및 문서화

---

### 2.4 Phase 4: AI 보고서 생성

#### 2.4.1 generateAIReport

**문서 명시** (`BUSINESS_LOGIC_SPECIFICATION.md:270-320`):
```pseudocode
FUNCTION generateAIReport(artistId, compareWith?):
  1. Phase 1-3 데이터 집계
  2. Universal Data Adapter로 변환
  3. AI 프롬프트 템플릿 생성
  4. Vertex AI 호출
  5. 응답 파싱 및 검증
  6. 보고서 저장
END FUNCTION
```

**실제 구현** (`functions/index.js:105-155`):
```javascript
exports.generateAiReport = onRequest(async (req, res) => {
  const { artistA_data, artistB_data, comparison_analysis } = req.body;
  
  // ✅ Vertex AI 서비스 초기화 및 호출
  const VertexAIService = require('./src/services/vertexAIService');
  const vertexAI = new VertexAIService();
  
  const result = await vertexAI.generateComprehensiveReport(
    artistA_data, 
    artistB_data, 
    comparison_analysis
  );
  
  return res.status(200).json(result);
});
```

**일치 여부**: ✅ **일치**
- Vertex AI 호출 구현됨
- 프롬프트 템플릿 및 응답 처리 구현됨

**주의사항**: 
- Universal Data Adapter 사용 여부 확인 필요
- 프롬프트 템플릿이 문서 명시와 일치하는지 확인 필요

---

## 3. Time Window Rules 구현 검증

### 3.1 문서 명시 vs 구현 코드

| 축 | 문서 규칙 | 구현 파일 | 구현 상태 | 일치 여부 |
|---|----------|----------|----------|----------|
| 담론 | 24개월 hard cutoff | `timeWindowRules.js:16-49` | ✅ 구현됨 | ✅ 일치 |
| 제도 | 10년 윈도우 (최근 5년 × 1.0, 이전 5년 × 0.5) | `timeWindowRules.js:51-100` | ✅ 구현됨 | ✅ 일치 |
| 학술 | 누적 + 최근 5년 30% boost | `timeWindowRules.js:102-150` | ✅ 구현됨 | ✅ 일치 |
| 네트워크 | 누적 | `timeWindowRules.js:152-200` | ✅ 구현됨 | ✅ 일치 |

**검증 결과**: ✅ **모든 Time Window Rules가 `timeWindowRules.js`에 정확히 구현되어 있음**

**문제점**: ❌ **구현은 되어 있으나 `getArtistTimeseries`에서 사용되지 않음**

---

## 4. 위험도 분석

### 4.1 High Priority 위험요인

1. **Phase 2 Time Window Rules 미적용**
   - **위험**: `getArtistTimeseries`가 Time Window Rules를 적용하지 않고 목업 데이터만 반환
   - **영향**: 잘못된 시계열 분석 결과 제공, Phase 2 기능 실패
   - **예방조치**: `getArtistTimeseries`에 Time Window Rules 적용 로직 구현

2. **일관성 검증 API 레벨 미실행**
   - **위험**: `dataQualityValidator.js`는 구현되어 있으나 API에서 호출 여부 불명확
   - **영향**: 일관성 검증 실패 데이터가 API로 노출될 수 있음
   - **예방조치**: `getArtistSummary`에서 일관성 검증 실행 확인 및 추가

### 4.2 Medium Priority 위험요인

1. **실시간 계산 로직 부재**
   - **위험**: Phase 1, 3에서 실시간 계산 없이 사전 계산된 데이터만 사용
   - **영향**: 배치 함수 실패 시 데이터 제공 불가능
   - **예방조치**: 실시간 계산 로직 구현 또는 배치 함수 안정성 확보

2. **비교 분석 알고리즘 미구현**
   - **위험**: Phase 3 비교 분석이 보간, 상관계수, AUC 계산 없이 목업만 반환
   - **영향**: 정확한 비교 분석 불가능
   - **예방조치**: 비교 분석 알고리즘 구현

---

## 5. 권장 조치사항

### 5.1 즉시 조치 (High Priority)

1. **getArtistTimeseries에 Time Window Rules 적용**
   - `timeWindowRules.js` 모듈 import
   - measures 컬렉션 조회
   - Time Window Rules 적용 로직 구현
   - 상대 시간축 변환 구현

2. **일관성 검증 API 레벨 실행 확인**
   - `getArtistSummary`에서 `dataQualityValidator` 호출 여부 확인
   - 미호출 시 추가

### 5.2 단기 조치 (Medium Priority)

1. **실시간 계산 로직 구현**
   - Phase 1 `calculateArtistSummary` 실시간 계산 로직 구현
   - Phase 3 `compareArtists` 실시간 계산 로직 구현

2. **비교 분석 알고리즘 구현**
   - 보간 로직 구현
   - 상관계수 계산 구현
   - AUC 계산 구현

### 5.3 장기 조치 (Low Priority)

1. **배치 함수 안정성 확보**
   - 배치 함수 구현 확인
   - 실패 시 폴백 메커니즘 강화

2. **비즈니스 로직 테스트**
   - Time Window Rules 단위 테스트
   - 일관성 검증 테스트
   - 비교 분석 알고리즘 테스트

---

## 6. 결론

비즈니스 로직 일치율은 33.3%로 매우 낮습니다. 주요 문제점:

1. **Phase 2 Time Window Rules 미적용**: 구현은 되어 있으나 API에서 사용되지 않음
2. **실시간 계산 로직 부재**: Phase 1, 3에서 사전 계산된 데이터만 사용
3. **비교 분석 알고리즘 미구현**: Phase 3 비교 분석이 목업만 반환

**즉시 조치 필요**: `getArtistTimeseries`에 Time Window Rules 적용

---

**보고서 작성일**: 2025-11-10  
**다음 검토일**: Time Window Rules 적용 후 재검증

