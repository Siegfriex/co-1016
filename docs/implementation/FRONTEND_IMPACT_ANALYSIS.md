# 프론트엔드 영향 분석 보고서

**생성일**: 2025-11-10  
**목적**: `getCompareArtists` 응답 형식 변경에 따른 프론트엔드 영향 분석 및 수정 계획  
**버전**: 1.0

---

## 1. 변경 사항 요약

### 1.1 응답 형식 변경

**이전 형식** (코드):
```javascript
{
  artist_a: { id, name, radar5, sunburst_l1 },
  artist_b: { id, name, radar5, sunburst_l1 },
  comparison_metrics: { ... },
  axis_comparison: { ... },
  timestamp: "...",
  _p3_ui_compatible: true
}
```

**새 형식** (문서 스펙):
```javascript
{
  data: {
    pair_id: "ARTIST_0005_vs_0010",
    axis: "제도",
    series: [{ t, v_A, v_B, diff }],
    metrics: { correlation, abs_diff_sum, auc },
    cached: true,
    computed_at: "2025-11-02T00:00:00Z"
  },
  meta: {
    cache_hit: true,
    response_time: 400
  }
}
```

---

## 2. 프론트엔드 사용 위치 분석

### 2.1 직접 API 호출 위치

#### 2.1.1 `src/utils/api.js` (line 42-43)

**현재 코드**:
```javascript
getComparison: (artistA, artistB, axis) => 
  apiCall(`/compare/${artistA}/${artistB}/${axis}`)
```

**영향**: 낮음
- 단순 API 호출 래퍼 함수
- 응답 형식 변경에 영향 없음

**수정 필요**: 없음

---

#### 2.1.2 `src/hooks/useDataSource.js` (line 162-180)

**현재 코드**:
```javascript
async getComparisonData(artistA, artistB, axis = '담론') {
  const response = await fetch(`/api/compare/${artistA}/${artistB}/${axis}`);
  const data = await response.json();
  console.log(`✅ Comparison API 성공:`, data.abs_diff_sum || 'No diff data');
  return validateComparisonDataStructure(data);
}
```

**영향**: 높음
- `data.abs_diff_sum` 직접 접근 → `data.metrics.abs_diff_sum`로 변경 필요
- `validateComparisonDataStructure` 함수 수정 필요

**수정 필요**: ✅ 필요

**수정 계획**:
```javascript
async getComparisonData(artistA, artistB, axis = '담론') {
  const response = await fetch(`/api/compare/${artistA}/${artistB}/${axis}`);
  const data = await response.json();
  
  // 새 응답 형식 처리
  if (data.data) {
    console.log(`✅ Comparison API 성공:`, data.data.metrics?.abs_diff_sum || 'No diff data');
    return validateComparisonDataStructure(data.data);
  }
  
  // 이전 형식 호환성 (임시)
  return validateComparisonDataStructure(data);
}
```

---

### 2.2 간접 사용 위치

#### 2.2.1 `src/components/layout/ArtistPhase3View.jsx` (line 28-35)

**현재 코드**:
```javascript
// 실제로는 여러 API 호출:
// const axisPromises = ['제도', '학술', '담론', '네트워크'].map(axis =>
//   fetch(`/api/compare/${selectedArtists.artistA}/${selectedArtists.artistB}/${axis}`)
// );
// const responses = await Promise.all(axisPromises);

// 목업 데이터 사용
setComparisonData(mockComparisonData);
```

**영향**: 중간
- 현재는 목업 데이터 사용 중
- 실제 API 연동 시 수정 필요

**수정 필요**: ⚠️ 향후 필요

**수정 계획**:
```javascript
const axisPromises = ['제도', '학술', '담론', '네트워크'].map(axis =>
  fetch(`/api/compare/${selectedArtists.artistA}/${selectedArtists.artistB}/${axis}`)
    .then(res => res.json())
    .then(res => res.data) // 새 응답 형식에서 data 추출
);
const responses = await Promise.all(axisPromises);
```

---

#### 2.2.2 `src/hooks/useConditionalData.js` (line 90)

**현재 코드**:
```javascript
const comparison = await dataProvider.getComparisonData(artistId, 'ARTIST_0003', 'all');
```

**영향**: 낮음
- `dataProvider.getComparisonData`를 통해 간접 사용
- `useDataSource.js` 수정으로 해결

**수정 필요**: 없음 (간접 영향)

---

### 2.3 데이터 검증 함수

#### 2.3.1 `validateComparisonDataStructure` 함수

**위치**: `src/hooks/useDataSource.js` 또는 유사 파일

**영향**: 높음
- 응답 형식 변경에 따라 검증 로직 수정 필요

**수정 필요**: ✅ 필요

**수정 계획**:
```javascript
function validateComparisonDataStructure(data) {
  // 새 응답 형식 검증
  if (data.pair_id && data.series && data.metrics) {
    return {
      pair_id: data.pair_id,
      axis: data.axis,
      series: data.series,
      metrics: data.metrics,
      cached: data.cached || false,
      computed_at: data.computed_at
    };
  }
  
  // 이전 형식 호환성 (임시)
  // ... 기존 검증 로직
}
```

---

## 3. 수정 우선순위

### 3.1 즉시 수정 필요 (High)

1. **`src/hooks/useDataSource.js`** (line 162-180)
   - `getComparisonData` 함수 수정
   - 새 응답 형식 처리 로직 추가
   - 예상 작업량: 0.5일

2. **`validateComparisonDataStructure` 함수**
   - 검증 로직 수정
   - 새 응답 형식 지원
   - 예상 작업량: 0.5일

### 3.2 향후 수정 필요 (Medium)

3. **`src/components/layout/ArtistPhase3View.jsx`** (line 28-35)
   - 실제 API 연동 시 수정
   - 예상 작업량: 0.5일

---

## 4. 호환성 전략

### 4.1 단계적 마이그레이션

**Phase 1**: 이전 형식과 새 형식 모두 지원
- 응답에 `_legacy_format` 플래그 추가
- 프론트엔드에서 형식 감지 후 처리

**Phase 2**: 새 형식으로 완전 전환
- 이전 형식 지원 제거
- 모든 프론트엔드 코드 수정 완료

### 4.2 임시 호환성 코드

**백엔드**:
```javascript
// 응답에 이전 형식 호환성 필드 추가 (임시)
if (req.query.legacy === 'true') {
  return res.status(200).json({
    // 이전 형식
  });
}
```

**프론트엔드**:
```javascript
// 이전 형식 감지 및 변환
function normalizeComparisonData(data) {
  if (data.data) {
    // 새 형식
    return data.data;
  }
  // 이전 형식 변환
  return convertLegacyFormat(data);
}
```

---

## 5. 테스트 계획

### 5.1 단위 테스트

- [ ] `getComparisonData` 함수 테스트
- [ ] `validateComparisonDataStructure` 함수 테스트
- [ ] 새 응답 형식 파싱 테스트

### 5.2 통합 테스트

- [ ] Phase 3 View 컴포넌트 테스트
- [ ] API 호출 및 데이터 흐름 테스트
- [ ] UI 렌더링 테스트

### 5.3 E2E 테스트

- [ ] 비교 분석 화면 전체 플로우 테스트
- [ ] 다중 축 비교 테스트
- [ ] 캐시 동작 테스트

---

## 6. 수정 일정

### 6.1 예상 작업량

- **즉시 수정**: 1일
- **향후 수정**: 0.5일
- **테스트**: 0.5일

**총 예상 기간**: 2일

### 6.2 마일스톤

- **M1**: 즉시 수정 완료 (1일)
- **M2**: 테스트 완료 (0.5일)
- **M3**: 향후 수정 완료 (0.5일)

---

## 7. 리스크 관리

### 7.1 리스크

1. **프론트엔드 호환성 문제**
   - 리스크: 이전 형식 의존 코드 존재
   - 대응: 호환성 코드 추가, 단계적 마이그레이션

2. **UI 렌더링 오류**
   - 리스크: 데이터 구조 변경으로 인한 UI 오류
   - 대응: 충분한 테스트, 점진적 배포

### 7.2 대응 방안

- 호환성 코드 추가
- 단계적 마이그레이션
- 충분한 테스트 수행

---

## 8. 다음 단계

1. ✅ 백엔드 응답 형식 수정 완료
2. ⏳ 프론트엔드 수정 시작
3. ⏳ 테스트 수행
4. ⏳ 배포 및 검증

---

**분석 완료일**: 2025-11-10  
**수정 시작일**: 예정  
**예상 완료일**: 2025-11-12 (2일 내)

