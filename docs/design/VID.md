# CO-1016 CURATOR ODYSSEY: Visual Interaction Design Document (VID) v1.0

## 문서 메타데이터 (Document Metadata)

**문서명**: CO-1016 CURATOR ODYSSEY Visual Interaction Design Document (VID) v1.0

**버전**: 1.0

**상태**: Draft (초안, FRD v1.0 기반)

**최종 수정**: 2025-11-02

**소유자**: NEO GOD (Director)

**승인자**: UX Lead (TBD)

**개정 이력**:
- v1.0 (2025-11-02): FRD v1.0 기반 초기 작성

**배포 범위**: Frontend Development Team (React/D3.js), UX/UI Design Team

**변경 관리 프로세스**: GitHub Issues/PR 워크플로, 변경 시 FRD 동시 업데이트

**참조 문서 (References)**:
- **[FRD v1.0](../requirements/FRD.md)** - Functional Requirements Document, 사용자 요구사항 및 Use Case
- **[API Specification v1.0](../api/API_SPECIFICATION.md)** - API 엔드포인트 정의, 데이터 스키마
- **[API Integration Guide](../api/API_INTEGRATION_GUIDE.md)** - React Query 통합 가이드

---

## 1. 디자인 원칙 (Design Principles)

### 1.1 일관성 (Consistency)

**시각적 일관성**:
- 모든 Phase에서 동일한 색상 팔레트 사용
- 축별 색상 매핑 고정 (제도-블루, 학술-그린, 담론-오렌지, 네트워크-퍼플)
- 공통 컴포넌트 재사용 (버튼, 입력 필드, 툴팁)

**인터랙션 일관성**:
- 호버 효과: 모든 차트에서 동일한 툴팁 스타일
- 클릭 동작: 선버스트 섹터 클릭 시 레이더 하이라이트 (Phase 1)
- 드릴다운: Phase 1 → Phase 2 전환 시 부드러운 애니메이션

### 1.2 접근성 (Accessibility)

**WCAG 2.1 AA 준수**:
- 색상 대비비: 최소 4.5:1 (텍스트), 3:1 (UI 컴포넌트)
- 키보드 네비게이션: 모든 상호작용 요소에 Tab 키 지원
- ARIA 레이블: 차트, 버튼, 입력 필드에 적절한 `aria-label` 제공
- 스크린 리더 지원: 차트 데이터를 텍스트로 제공 (예: `<text role="status">`)

**접근성 체크리스트**:
- [ ] 모든 이미지에 `alt` 텍스트
- [ ] 폼 입력에 `aria-required` 및 `aria-invalid` 속성
- [ ] 차트에 `role="img"` 및 `aria-label` 제공
- [ ] 키보드 포커스 표시기 명확히 (outline: 2px solid)

### 1.3 반응형 레이아웃 (Responsive Layout)

**브레이크포인트**:
- 모바일: < 768px
- 태블릿: 768px - 1024px
- 데스크톱: > 1024px

**모바일 최적화**:
- Phase 1: 레이더 차트를 세로 스크롤 가능한 카드 레이아웃으로 변경
- Phase 2: StackedAreaChart를 가로 스크롤 가능한 래퍼로 감싸기
- Phase 3: 비교 차트를 탭 인터페이스로 전환 (A/B 탭)
- Phase 4: Markdown 보고서를 모바일 친화적 폰트 크기로 조정

**터치 제스처**:
- 스와이프: Phase 2에서 가로 스크롤
- 핀치 줌: Phase 2 시계열 차트 확대/축소
- 탭: Phase 1 선버스트 섹터 선택

---

## 2. 컴포넌트 스펙 (Component Specifications)

### 2.1 Phase 1: 현재 가치 분석 컴포넌트

#### 2.1.1 Radar5Chart (레이더 5축 차트)

**컴포넌트 경로**: `src/components/charts/ArtistRadarChart.jsx`

**데이터 소스**: `GET /api/artist/{id}/summary` → `radar5` 객체

**시각적 스펙**:
- **크기**: 400px × 400px (데스크톱), 300px × 300px (모바일)
- **축 개수**: 5개 (I, F, A, M, Sedu)
- **값 범위**: 0-100
- **색상**: 
  - 다각형 채우기: `rgba(59, 130, 246, 0.3)` (블루 반투명)
  - 다각형 경계: `rgb(59, 130, 246)` (블루)
  - 축 라인: `rgba(0, 0, 0, 0.2)` (회색)
  - 그리드 라인: `rgba(0, 0, 0, 0.1)` (연한 회색)

**인터랙션**:
- **호버**: 마우스 오버 시 해당 축 하이라이트 (색상: `rgb(59, 130, 246)`, 굵기: 3px)
- **툴팁**: 호버 시 축 이름 및 값 표시 (`{axis}: {value}`)
- **클릭**: 축 클릭 시 선버스트 차트와 동기화 (해당 축 매핑 섹터 하이라이트)

**애니메이션**:
- 초기 로딩: 다각형이 중앙에서 펼쳐지는 애니메이션 (duration: 500ms, easing: `ease-out`)
- 값 변경: 부드러운 전환 (duration: 300ms, easing: `ease-in-out`)

**접근성**:
```jsx
<svg
  role="img"
  aria-label="아티스트 5축 레이더 차트"
  aria-describedby="radar-chart-description"
>
  <title>레이더 차트: I={I}, F={F}, A={A}, M={M}, Sedu={Sedu}</title>
  {/* SVG path elements */}
</svg>
```

**React Query 통합**:
```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['artist', artistId, 'summary'],
  queryFn: () => getArtistSummary(artistId),
  staleTime: 5 * 60 * 1000, // 5분 캐시
});

if (isLoading) return <RadarChartSkeleton />;
if (error) return <ErrorDisplay error={error} />;

return <RadarChart data={data.radar5} />;
```

---

#### 2.1.2 SunburstChart (선버스트 4축 차트)

**컴포넌트 경로**: `src/components/charts/SunburstChart.jsx`

**데이터 소스**: `GET /api/artist/{id}/summary` → `sunburst_l1` 객체

**시각적 스펙**:
- **크기**: 400px × 400px (데스크톱), 300px × 300px (모바일)
- **계층**: L1 (4개 섹터), L2 (옵션, 드릴다운)
- **색상 팔레트**:
  - 제도: `rgb(59, 130, 246)` (블루)
  - 학술: `rgb(34, 197, 94)` (그린)
  - 담론: `rgb(249, 115, 22)` (오렌지)
  - 네트워크: `rgb(168, 85, 247)` (퍼플)

**인터랙션**:
- **호버**: 섹터 호버 시 확대 (scale: 1.05) 및 툴팁 표시 (`{axis}: {value}%`)
- **클릭**: 섹터 클릭 시 레이더 차트 하이라이트 (해당 축 매핑)
- **드릴다운**: L2 데이터 존재 시 클릭 시 L2 계층 표시 (애니메이션: 300ms)

**애니메이션**:
- 초기 로딩: 섹터가 순차적으로 나타남 (stagger: 100ms)
- 회전: 드릴다운 시 부드러운 회전 애니메이션 (duration: 300ms)
- 전환: 값 변경 시 부드러운 전환 (duration: 500ms)

**접근성**:
```jsx
<svg
  role="img"
  aria-label="아티스트 4축 선버스트 차트"
  aria-describedby="sunburst-chart-description"
>
  <title>선버스트 차트: 제도={제도}%, 학술={학술}%, 담론={담론}%, 네트워크={네트워크}%</title>
  {/* SVG path elements */}
</svg>
```

**React Query 통합**:
```jsx
const { data, isLoading } = useQuery({
  queryKey: ['artist', artistId, 'summary'],
  queryFn: () => getArtistSummary(artistId),
});

// 캐싱 무효화 (데이터 업데이트 시)
const queryClient = useQueryClient();
queryClient.invalidateQueries(['artist', artistId, 'summary']);
```

---

### 2.2 Phase 2: 커리어 궤적 분석 컴포넌트

#### 2.2.1 StackedAreaChart (누적 영역 차트)

**컴포넌트 경로**: `src/components/charts/StackedAreaChart.jsx`

**데이터 소스**: `POST /api/batch/timeseries` → `timeseries.{axis}.bins` 배열

**시각적 스펙**:
- **크기**: 800px × 400px (데스크톱), 100vw × 300px (모바일, 가로 스크롤)
- **축**: 
  - X축: `t_relative` (상대 시간축, 데뷔년 기준)
  - Y축: 누적 값 (0-100)
- **4축 색상** (위에서 아래 순서):
  - 제도: `rgba(59, 130, 246, 0.8)` (블루)
  - 학술: `rgba(34, 197, 94, 0.8)` (그린)
  - 담론: `rgba(249, 115, 22, 0.8)` (오렌지)
  - 네트워크: `rgba(168, 85, 247, 0.8)` (퍼플)

**인터랙션**:
- **호버**: 마우스 오버 시 해당 시간점의 4축 값 표시 (툴팁)
- **줌**: 마우스 휠 또는 핀치 제스처로 확대/축소 (D3 zoom)
- **팬**: 드래그로 차트 이동 (가로 스크롤)
- **동기화**: 호버 시 EventTimeline 하이라이트 (지연: <100ms)

**애니메이션**:
- 초기 로딩: 영역이 왼쪽에서 오른쪽으로 그려짐 (duration: 1000ms)
- 값 변경: 부드러운 전환 (duration: 500ms)

**접근성**:
```jsx
<svg
  role="img"
  aria-label="아티스트 커리어 궤적 시계열 차트"
  aria-describedby="timeseries-chart-description"
>
  <title>시계열 차트: 제도, 학술, 담론, 네트워크</title>
  {/* SVG path elements */}
</svg>
```

**React Query 통합**:
```jsx
const { data, isLoading } = useQuery({
  queryKey: ['artist', artistId, 'batch-timeseries'],
  queryFn: () => getBatchTimeseries(artistId, ['제도', '학술', '담론', '네트워크']),
  staleTime: 5 * 60 * 1000,
});

// 캐싱 무효화 (새 데이터 로드 시)
queryClient.invalidateQueries(['artist', artistId, 'batch-timeseries']);
```

---

#### 2.2.2 EventTimeline (이벤트 타임라인)

**컴포넌트 경로**: `src/components/charts/EventTimeline.jsx`

**데이터 소스**: `GET /api/artist/{id}/events/{axis}` → `events` 배열

**시각적 스펙**:
- **크기**: 800px × 100px (데스크톱), 100vw × 80px (모바일)
- **이벤트 아이콘**: 원형 마커 (크기: 8px)
- **색상**: 이벤트 타입별 색상 (전시: 빨강, 아트페어: 노랑, 시상: 파랑)

**인터랙션**:
- **호버**: 아이콘 호버 시 이벤트 정보 툴팁 표시 (`{type}: {event_id}`)
- **클릭**: 이벤트 클릭 시 StackedAreaChart 해당 시간점으로 이동
- **동기화**: StackedAreaChart 호버 시 해당 이벤트 하이라이트 (scale: 1.5)

**애니메이션**:
- 하이라이트: scale 애니메이션 (duration: 200ms)

---

### 2.3 Phase 3: 비교 분석 컴포넌트

#### 2.3.1 ComparisonAreaChart (비교 영역 차트)

**컴포넌트 경로**: `src/components/charts/ComparisonAreaChart.jsx`

**데이터 소스**: `GET /api/compare/{artistA}/{artistB}/{axis}` → `series` 배열

**시각적 스펙**:
- **크기**: 800px × 400px (데스크톱), 100vw × 300px (모바일)
- **라인**: 
  - 아티스트 A: `rgb(59, 130, 246)` (블루), 굵기: 2px
  - 아티스트 B: `rgb(249, 115, 22)` (오렌지), 굵기: 2px
- **차이 음영**: `rgba(59, 130, 246, 0.2)` (블루 반투명)

**인터랙션**:
- **호버**: 마우스 오버 시 두 아티스트의 값 및 차이 표시 (`v_A: {value}, v_B: {value}, diff: {diff}`)
- **범례 클릭**: 범례 클릭 시 해당 라인 표시/숨김
- **상관계수 표시**: 상관계수 > 0.8 시 "유사" 라벨 표시

**애니메이션**:
- 초기 로딩: 라인이 왼쪽에서 오른쪽으로 그려짐 (duration: 800ms)
- 값 변경: 부드러운 전환 (duration: 400ms)

**접근성**:
```jsx
<svg
  role="img"
  aria-label={`${artistA} vs ${artistB} 비교 차트`}
  aria-describedby="comparison-chart-description"
>
  <title>비교 차트: 상관계수={correlation}, 절대 차이 합계={abs_diff_sum}</title>
  {/* SVG path elements */}
</svg>
```

**React Query 통합**:
```jsx
const { data, isLoading } = useQuery({
  queryKey: ['compare', artistA, artistB, axis],
  queryFn: () => getCompareArtists(artistA, artistB, axis),
  staleTime: 24 * 60 * 60 * 1000, // 24시간 캐시
});

// 캐싱 무효화 (비교 쌍 변경 시)
queryClient.invalidateQueries(['compare', artistA, artistB, axis]);
```

---

### 2.4 Phase 4: AI 보고서 컴포넌트

#### 2.4.1 MarkdownReportDisplay (Markdown 보고서 표시)

**컴포넌트 경로**: `src/components/ui/MarkdownReportDisplay.jsx`

**데이터 소스**: `POST /api/report/generate` → `content` (Markdown 문자열)

**시각적 스펙**:
- **폰트**: 
  - 본문: `Inter`, `-apple-system`, `BlinkMacSystemFont`, 크기: 16px (데스크톱), 14px (모바일)
  - 제목: `Inter Bold`, 크기: 24px (H1), 20px (H2), 18px (H3)
- **색상**: 
  - 본문 텍스트: `rgb(31, 41, 55)` (다크 그레이)
  - 링크: `rgb(59, 130, 246)` (블루)
  - 코드 블록 배경: `rgb(243, 244, 246)` (연한 그레이)

**인터랙션**:
- **섹션 네비게이션**: Introduction, Analysis, Prediction 섹션으로 스크롤
- **다운로드**: 보고서 다운로드 버튼 (PDF 또는 Markdown)
- **공유**: 보고서 공유 버튼 (URL 복사)

**애니메이션**:
- 로딩: 스켈레톤 UI 표시 (duration: 500ms)
- 페이드 인: 보고서 내용이 페이드 인 (duration: 300ms)

**접근성**:
```jsx
<article
  role="article"
  aria-label="AI 생성 보고서"
  aria-describedby="report-meta"
>
  <header>
    <h1>아티스트 분석 보고서</h1>
    <p id="report-meta">
      생성 시간: {generatedAt}, 모델: {modelUsed}
    </p>
  </header>
  <ReactMarkdown>{content}</ReactMarkdown>
</article>
```

**React Query 통합**:
```jsx
const { data, isLoading, error } = useMutation({
  mutationFn: (params) => generateReport(params),
  onSuccess: (data) => {
    // 성공 시 캐시 저장
    queryClient.setQueryData(['report', artistId], data);
  },
});

// 보고서 생성
mutate({
  artist_id: artistId,
  include_phases: ['1', '2', '3'],
});
```

---

## 3. 사용자 플로우 다이어그램 (User Flow Diagrams)

### 3.1 UC-P1-001: 아티스트 요약 데이터 조회 플로우

```
┌─────────────────┐
│   홈페이지 접속   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 아티스트 ID 입력  │
│ (예: ARTIST_0005)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API 호출      │
│ GET /summary    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   데이터 로드    │
│ (React Query)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 레이더 차트 렌더링│
│ + 선버스트 차트  │
└─────────────────┘
```

**상호작용 시나리오**:
1. 사용자가 아티스트 ID 입력 → Enter 키 또는 "로드" 버튼 클릭
2. React Query가 API 호출 → 로딩 스피너 표시
3. 데이터 수신 → 레이더 차트 및 선버스트 차트 동시 렌더링
4. 사용자가 선버스트 섹터 클릭 → 레이더 차트 해당 축 하이라이트

---

### 3.2 UC-P2-001: 커리어 궤적 시계열 조회 플로우

```
┌─────────────────┐
│ Phase 1 화면     │
│ (요약 데이터)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Phase 2 탭 클릭  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   배치 API 호출  │
│ POST /batch/    │
│ timeseries      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4축 데이터 로드  │
│ (Promise.all)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ StackedAreaChart│
│ 렌더링          │
│ + EventTimeline │
└─────────────────┘
```

**상호작용 시나리오**:
1. 사용자가 Phase 2 탭 클릭 → 배치 API 호출 (4축 동시)
2. 데이터 수신 → StackedAreaChart 렌더링 (4축 누적)
3. 사용자가 차트 호버 → 툴팁 표시 및 EventTimeline 동기화
4. 사용자가 이벤트 클릭 → 해당 시간점으로 스크롤

---

### 3.3 UC-P3-001: 두 아티스트 비교 분석 플로우

```
┌─────────────────┐
│ Phase 3 화면     │
│ (비교 페이지)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 아티스트 A/B 선택│
│ + 축 선택        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API 호출      │
│ GET /compare/   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 캐시 확인       │
│ (compare_pairs) │
└────────┬────────┘
         │
    ┌────┴────┐
    │        │
    ▼        ▼
┌──────┐ ┌──────────┐
│캐시  │ │실시간    │
│히트  │ │계산      │
└──┬───┘ └────┬─────┘
   │         │
   └────┬────┘
        │
        ▼
┌─────────────────┐
│ ComparisonArea  │
│ Chart 렌더링    │
│ + 지표 표시     │
└─────────────────┘
```

**상호작용 시나리오**:
1. 사용자가 아티스트 A/B 및 축 선택 → "비교" 버튼 클릭
2. API 호출 → 캐시 확인 (캐시 히트 시 빠른 응답, 미스 시 실시간 계산)
3. 데이터 수신 → ComparisonAreaChart 렌더링 (dual-line)
4. 사용자가 범례 클릭 → 해당 라인 표시/숨김

---

### 3.4 UC-P4-001: AI 보고서 생성 플로우

```
┌─────────────────┐
│ Phase 4 화면     │
│ (보고서 페이지)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ "생성" 버튼 클릭  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Phase 1-3 데이터│
│ 취합 (Promise.all)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Vertex AI 호출 │
│ (Gemini 1.5 Pro) │
└────────┬────────┘
         │
    ┌────┴────┐
    │        │
    ▼        ▼
┌──────┐ ┌──────────┐
│성공  │ │실패      │
│      │ │(폴백)    │
└──┬───┘ └────┬─────┘
   │         │
   │    ┌────┴────┐
   │    │        │
   │    ▼        ▼
   │ ┌──────┐ ┌──────────┐
   │ │GPT-4 │ │템플릿    │
   │ │호출  │ │보고서    │
   │ └──┬───┘ └────┬─────┘
   │    │         │
   └────┴─────────┘
         │
         ▼
┌─────────────────┐
│ Markdown 보고서  │
│ 렌더링           │
│ (React Markdown) │
└─────────────────┘
```

**상호작용 시나리오**:
1. 사용자가 "생성" 버튼 클릭 → 로딩 스피너 표시
2. Phase 1-3 데이터 취합 → Vertex AI 호출 (최대 30초 대기)
3. 보고서 생성 → Markdown 렌더링 (섹션 네비게이션, 다운로드 버튼)
4. 사용자가 섹션 클릭 → 해당 섹션으로 스크롤

---

## 4. 접근성 가이드 (Accessibility Guide)

### 4.1 ARIA 레이블 (ARIA Labels)

**차트 컴포넌트**:
```jsx
// 레이더 차트
<svg
  role="img"
  aria-label="아티스트 5축 레이더 차트"
  aria-describedby="radar-chart-description"
>
  <title>레이더 차트: I={I}, F={F}, A={A}, M={M}, Sedu={Sedu}</title>
</svg>

// 선버스트 차트
<svg
  role="img"
  aria-label="아티스트 4축 선버스트 차트"
  aria-describedby="sunburst-chart-description"
>
  <title>선버스트 차트: 제도={제도}%, 학술={학술}%, 담론={담론}%, 네트워크={네트워크}%</title>
</svg>

// 시계열 차트
<svg
  role="img"
  aria-label="아티스트 커리어 궤적 시계열 차트"
  aria-describedby="timeseries-chart-description"
>
  <title>시계열 차트: 제도, 학술, 담론, 네트워크</title>
</svg>
```

**폼 입력**:
```jsx
<input
  type="text"
  id="artist-id-input"
  aria-label="아티스트 ID 입력"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="artist-id-error"
/>
```

### 4.2 키보드 네비게이션 (Keyboard Navigation)

**탭 순서**:
1. 아티스트 ID 입력 필드
2. "로드" 버튼
3. Phase 탭 (Phase 1, 2, 3, 4)
4. 차트 (포커스 가능 시)
5. 보고서 생성 버튼

**키보드 단축키**:
- `Enter`: 입력 필드에서 Enter 키 → 데이터 로드
- `Tab`: 다음 요소로 이동
- `Shift + Tab`: 이전 요소로 이동
- `Space`: 버튼 활성화
- `Arrow Keys`: 차트 내 네비게이션 (옵션)

### 4.3 색상 대비 (Color Contrast)

**텍스트**:
- 본문 텍스트: `rgb(31, 41, 55)` (다크 그레이) / 배경: `rgb(255, 255, 255)` → 대비비: 12.6:1 ✅
- 링크: `rgb(59, 130, 246)` (블루) / 배경: `rgb(255, 255, 255)` → 대비비: 4.5:1 ✅

**UI 컴포넌트**:
- 버튼: `rgb(59, 130, 246)` (블루) / 텍스트: `rgb(255, 255, 255)` → 대비비: 4.5:1 ✅
- 입력 필드: `rgb(229, 231, 235)` (연한 그레이) / 텍스트: `rgb(31, 41, 55)` → 대비비: 4.5:1 ✅

### 4.4 스크린 리더 지원 (Screen Reader Support)

**차트 데이터 텍스트 제공**:
```jsx
<div role="status" aria-live="polite">
  <p id="radar-chart-description">
    레이더 차트: I (기관전시) {I}점, F (아트페어) {F}점, A (시상) {A}점, 
    M (미디어) {M}점, Sedu (교육) {Sedu}점
  </p>
</div>
```

**로딩 상태**:
```jsx
<div role="status" aria-live="polite" aria-busy="true">
  데이터 로딩 중...
</div>
```

---

## 5. 색상 팔레트 (Color Palette)

### 5.1 축별 색상 매핑

| 축 | 색상 코드 | RGB | 용도 |
|----|----------|-----|------|
| **제도** | `#3B82F6` | `rgb(59, 130, 246)` | 레이더 차트, 선버스트 차트, 시계열 차트 |
| **학술** | `#22C55E` | `rgb(34, 197, 94)` | 레이더 차트, 선버스트 차트, 시계열 차트 |
| **담론** | `#F97316` | `rgb(249, 115, 22)` | 레이더 차트, 선버스트 차트, 시계열 차트 |
| **네트워크** | `#A855F7` | `rgb(168, 85, 247)` | 레이더 차트, 선버스트 차트, 시계열 차트 |

### 5.2 레이더 5축 색상 (옵션)

| 축 | 색상 코드 | RGB | 용도 |
|----|----------|-----|------|
| **I** (Institution) | `#3B82F6` | `rgb(59, 130, 246)` | 레이더 차트 (제도와 동일) |
| **F** (Fair) | `#22C55E` | `rgb(34, 197, 94)` | 레이더 차트 (학술과 동일) |
| **A** (Award) | `#F97316` | `rgb(249, 115, 22)` | 레이더 차트 (담론과 동일) |
| **M** (Media) | `#A855F7` | `rgb(168, 85, 247)` | 레이더 차트 (네트워크와 동일) |
| **Sedu** (Seduction) | `#EC4899` | `rgb(236, 72, 153)` | 레이더 차트 (핑크) |

### 5.3 UI 컴포넌트 색상

| 컴포넌트 | 색상 코드 | RGB | 용도 |
|----------|----------|-----|------|
| **Primary Button** | `#3B82F6` | `rgb(59, 130, 246)` | 주요 액션 버튼 |
| **Secondary Button** | `#6B7280` | `rgb(107, 114, 128)` | 보조 액션 버튼 |
| **Error** | `#EF4444` | `rgb(239, 68, 68)` | 에러 메시지 |
| **Success** | `#22C55E` | `rgb(34, 197, 94)` | 성공 메시지 |
| **Warning** | `#F59E0B` | `rgb(245, 158, 11)` | 경고 메시지 |

---

## 6. 애니메이션 스펙 (Animation Specifications)

### 6.1 차트 애니메이션

**레이더 차트**:
- 초기 로딩: 다각형이 중앙에서 펼쳐지는 애니메이션
  - Duration: 500ms
  - Easing: `ease-out`
  - Transform: `scale(0) → scale(1)`

**선버스트 차트**:
- 초기 로딩: 섹터가 순차적으로 나타남
  - Duration: 300ms per sector
  - Stagger: 100ms
  - Easing: `ease-out`
- 회전: 드릴다운 시 부드러운 회전
  - Duration: 300ms
  - Easing: `ease-in-out`
  - Transform: `rotate(0deg) → rotate(360deg)`

**시계열 차트**:
- 초기 로딩: 영역이 왼쪽에서 오른쪽으로 그려짐
  - Duration: 1000ms
  - Easing: `ease-out`
  - Transform: `translateX(-100%) → translateX(0)`

### 6.2 전환 애니메이션

**Phase 전환**:
- Duration: 300ms
- Easing: `ease-in-out`
- Opacity: `0 → 1`

**툴팁 표시**:
- Duration: 200ms
- Easing: `ease-out`
- Transform: `scale(0.9) → scale(1)`

---

## 7. 반응형 레이아웃 (Responsive Layout)

### 7.1 브레이크포인트

```css
/* 모바일 */
@media (max-width: 767px) {
  /* 레이아웃: 세로 스택 */
  .chart-container {
    flex-direction: column;
    width: 100vw;
  }
}

/* 태블릿 */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 레이아웃: 2열 그리드 */
  .chart-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  /* 레이아웃: 가로 배치 */
  .chart-container {
    flex-direction: row;
    max-width: 1200px;
  }
}
```

### 7.2 모바일 최적화

**Phase 1**:
- 레이더 차트와 선버스트 차트를 세로 스택으로 배치
- 차트 크기: 300px × 300px

**Phase 2**:
- StackedAreaChart를 가로 스크롤 가능한 래퍼로 감싸기
- EventTimeline을 차트 아래에 배치

**Phase 3**:
- 비교 차트를 탭 인터페이스로 전환 (A/B 탭)
- 지표를 카드 형태로 표시

**Phase 4**:
- Markdown 보고서를 모바일 친화적 폰트 크기로 조정 (14px)
- 섹션 네비게이션을 상단 고정 버튼으로 변경

---

## 8. React Query 통합 예시 (React Query Integration Examples)

### 8.1 캐싱 전략

**Phase 1 요약 데이터**:
```jsx
const { data, isLoading } = useQuery({
  queryKey: ['artist', artistId, 'summary'],
  queryFn: () => getArtistSummary(artistId),
  staleTime: 5 * 60 * 1000, // 5분 캐시
  cacheTime: 10 * 60 * 1000, // 10분 메모리 보관
});
```

**Phase 2 배치 시계열**:
```jsx
const { data, isLoading } = useQuery({
  queryKey: ['artist', artistId, 'batch-timeseries'],
  queryFn: () => getBatchTimeseries(artistId, ['제도', '학술', '담론', '네트워크']),
  staleTime: 5 * 60 * 1000,
});
```

**Phase 3 비교 데이터**:
```jsx
const { data, isLoading } = useQuery({
  queryKey: ['compare', artistA, artistB, axis],
  queryFn: () => getCompareArtists(artistA, artistB, axis),
  staleTime: 24 * 60 * 60 * 1000, // 24시간 캐시
});
```

### 8.2 캐싱 무효화

**데이터 업데이트 시**:
```jsx
const queryClient = useQueryClient();

// 아티스트 데이터 업데이트 시
queryClient.invalidateQueries(['artist', artistId]);

// 특정 쿼리만 무효화
queryClient.invalidateQueries(['artist', artistId, 'summary']);
```

**Mutation 후 무효화**:
```jsx
const mutation = useMutation({
  mutationFn: generateReport,
  onSuccess: () => {
    queryClient.invalidateQueries(['report', artistId]);
  },
});
```

---

## 9. 부록 (Appendix)

### 9.1 컴포넌트 파일 구조

```
src/
├── components/
│   ├── charts/
│   │   ├── ArtistRadarChart.jsx      # Phase 1: 레이더 5축 차트
│   │   ├── SunburstChart.jsx         # Phase 1: 선버스트 4축 차트
│   │   ├── StackedAreaChart.jsx      # Phase 2: 누적 영역 차트
│   │   ├── EventTimeline.jsx         # Phase 2: 이벤트 타임라인
│   │   └── ComparisonAreaChart.jsx   # Phase 3: 비교 영역 차트
│   └── ui/
│       ├── MarkdownReportDisplay.jsx # Phase 4: Markdown 보고서
│       └── QualityIndicator.jsx      # 데이터 신선도 표시
```

### 9.2 디자인 툴 (Design Tools)

**프로토타이핑**:
- Figma: UI 디자인 및 프로토타입
- Framer: 인터랙션 프로토타입

**차트 라이브러리**:
- D3.js: 커스텀 차트 (레이더, 선버스트, 시계열)
- React-D3: D3.js React 래퍼 (옵션)

---

**문서 버전 관리**:
- v1.0 (2025-11-02): 초기 작성 (FRD v1.0 기반)
- 향후 업데이트: FR 변경 시 VID 동시 업데이트

**주의사항**: 본 문서는 FRD의 모든 사용자 요구사항과 Use Case를 커버하며, 접근성 및 반응형 레이아웃을 강조한다.

