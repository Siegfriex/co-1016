# CO-1016 CURATOR ODYSSEY: Visual Interaction Design Document (VID) v2.0

## 문서 메타데이터 (Document Metadata)

**문서명**: CO-1016 CURATOR ODYSSEY Visual Interaction Design Document (VID) v2.0

**버전**: 2.0

**상태**: Final (확정, BRD v1.1, FRD v1.1, SRD v1.1, TSD v1.1 기반)

**최종 수정**: 2025-11-10

**소유자**: NEO GOD (Director)

**승인자**: UX Lead (TBD)

**개정 이력**:
- v1.0 (2025-11-02): FRD v1.0 기반 초기 작성
- v2.0 (2025-11-10): 디자인 시스템 변경 (DYSS 폐기, 새로운 색상 시스템 적용), 피지컬 게임 결과 화면 통합, 랜딩 페이지 추가, 18 Years of Büro 및 111 West 57th Street 스타일 통합

**배포 범위**: Frontend Development Team (React/D3.js), UX/UI Design Team, Physical Computing Team

**변경 관리 프로세스**: GitHub Issues/PR 워크플로, 변경 시 BRD/FRD/SRD/TSD 동시 업데이트

**참조 문서 (References)**:
- **[BRD v1.1](../requirements/BRD.md)** - Business Requirements Document, 피지컬 게임 및 웹앱 통합 요구사항
- **[FRD v1.1](../requirements/FRD.md)** - Functional Requirements Document, Phase 1-4 기능 요구사항 및 API 엔드포인트 매핑
- **[SRD v1.1](../requirements/SRD.md)** - Software Requirements Document, 수용 기준 및 기능 요구사항
- **[TSD v1.1](../TSD.md)** - Technical Design Document, 기존 웹앱 아키텍처
- **[API Specification v1.1](../api/API_SPECIFICATION.md)** - API 엔드포인트 정의, 데이터 스키마
- **[API Integration Guide](../api/API_INTEGRATION_GUIDE.md)** - React Query 통합 가이드

---

## 1. 디자인 원칙 (Design Principles)

### 1.1 일관성 (Consistency)

**시각적 일관성**:
- 모든 Phase에서 동일한 색상 팔레트 사용
- 축별 색상 매핑: 주 컬러 기반 Primary 팔레트 사용 (Section 5.4 참조)
  - 제도: Primary 500 (#F28317C)
  - 학술: Primary 600 (#D66A0F)
  - 담론: Primary 700 (#BA510C)
  - 네트워크: Primary 800 (#9E3809)
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
- **색상** (주 컬러 기반, Section 5.4.1 참조): 
  - 다각형 채우기: `rgba(242, 131, 23, 0.2)` (주 컬러 반투명)
  - 다각형 경계: `#F28317C` (주 컬러)
  - 축 라인: `rgba(0, 0, 0, 0.2)` (회색)
  - 그리드 라인: `rgba(0, 0, 0, 0.1)` (연한 회색)
  - 축별 구분: 주 컬러 베리에이션 사용 (I: #F28317C, F: #FFA333, A: #D66A0F, M: #BA510C, Sedu: #9E3809)

**인터랙션**:
- **호버**: 마우스 오버 시 해당 축 하이라이트 (색상: `#F28317C`, 굵기: 3px)
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
- **색상 팔레트** (주 컬러 및 세컨더리 베리에이션, Section 5.4.2 참조):
  - 제도 (L1): `#F28317C` (주 컬러, Primary 500)
    - L2: `#FFA333` (Primary 400)
    - L3: `#FFBA66` (Primary 300)
  - 학술 (L1): `#D66A0F` (Primary 600)
    - L2: `#FFA333` (Primary 400)
    - L3: `#FFD199` (Primary 200)
  - 담론 (L1): `#BA510C` (Primary 700)
    - L2: `#D66A0F` (Primary 600)
    - L3: `#FFA333` (Primary 400)
  - 네트워크 (L1): `#9E3809` (Primary 800)
    - L2: `#BA510C` (Primary 700)
    - L3: `#D66A0F` (Primary 600)

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
- **4축 색상** (주 컬러 및 세컨더리 베리에이션, 위에서 아래 순서):
  - 제도: `rgba(242, 131, 23, 0.8)` (주 컬러)
  - 학술: `rgba(232, 229, 216, 0.8)` (세컨더리 베리에이션)
  - 담론: `rgba(245, 168, 90, 0.8)` (주 컬러 밝은 톤)
  - 네트워크: `rgba(222, 221, 214, 0.8)` (세컨더리 어두운 톤)

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
  - 아티스트 A: `#F28317C` (주 컬러), 굵기: 2px
  - 아티스트 B: `#F1F0EC` (세컨더리 기본), 굵기: 2px
- **차이 음영**: `rgba(242, 131, 23, 0.2)` (주 컬러 반투명)

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

### 2.5 랜딩 페이지 컴포넌트

#### 2.5.1 LandingPageHero (Hero 섹션)

**컴포넌트 경로**: `src/components/layout/LandingPageHero.jsx`

**시각적 스펙**:
- **크기**: 전체 화면 (`100vw × 100vh` / `100vw × 100svh`)
- **배경**: WebGL 배경 (기하학적 패턴, 주 컬러 기반)
- **로고 위치**: 상단 좌측 또는 중앙 (디자인에 따라)
- **CTA 버튼**: Hero 하단 또는 중앙 배치

**로고 스타일**:
- **파일**: `@4.svg` (ref/4.svg)
- **크기**: `clamp(120px, 10vw, 200px)` (반응형)
- **위치**: 상단 좌측 `var(--landing-container-padding)` 또는 중앙 정렬
- **색상**: 주 컬러 (#F28317C) 또는 흰색 (배경에 따라)

**CTA 버튼 스타일 (111 West 57th Street clip-path 스타일)**:
- **배경**: 주 컬러 (#F28317C)
- **텍스트**: 흰색
- **Clip-path**: `polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)`
- **호버 효과**: 배경색 어둡게 (#D66A0F), transform: scale(1.05)
- **애니메이션**: 0.3s ease-out

**인터랙션**:
- **스크롤 인디케이터**: Hero 하단에 스크롤 다운 인디케이터 (선택적)
- **CTA 클릭**: 결과 화면 페이지로 이동 (`/physical-game/result`)

**접근성**:
```jsx
<section
  role="banner"
  aria-label="CuratorOdyssey 메인 Hero 섹션"
>
  <img
    src="/ref/4.svg"
    alt="CuratorOdyssey 로고"
    className="landing-hero__logo"
  />
  <button
    className="landing-hero__cta"
    aria-label="피지컬 게임 시작하기"
    onClick={handleStartGame}
  >
    게임 시작하기
  </button>
</section>
```

---

#### 2.5.2 FeatureCards (Feature Cards 그리드)

**컴포넌트 경로**: `src/components/layout/FeatureCards.jsx`

**시각적 스펙**:
- **레이아웃**: 그리드 레이아웃 (모바일: 1열, 태블릿: 2열, 데스크톱: 3열)
- **카드 크기**: 
  - 모바일: `100%` (전체 너비)
  - 태블릿: `calc(50% - var(--landing-grid-gutter) / 2)`
  - 데스크톱: `calc(33.333% - var(--landing-grid-gutter) * 2 / 3)`
- **카드 패딩**: `32px` (모바일), `40px` (태블릿), `48px` (데스크톱)
- **카드 배경**: 세컨더리 배경 (#F1F0EC)
- **카드 간격**: `var(--landing-grid-gutter)`

**Feature Cards 내용**:
1. **Phase 1**: 현재 가치 분석
   - 아이콘: 레이더 차트 아이콘
   - 제목: "현재 가치 분석"
   - 설명: "5축 레이더 차트와 4축 선버스트 차트로 아티스트의 현재 가치를 분석합니다"
   - 링크: `/phase1`

2. **Phase 2**: 커리어 궤적 분석
   - 아이콘: 시계열 차트 아이콘
   - 제목: "커리어 궤적 분석"
   - 설명: "시계열 데이터로 아티스트의 경력 궤적을 시각화합니다"
   - 링크: `/phase2`

3. **Phase 3**: 비교 분석
   - 아이콘: 비교 차트 아이콘
   - 제목: "비교 분석"
   - 설명: "두 아티스트를 비교하여 유사성과 차이점을 분석합니다"
   - 링크: `/phase3`

4. **Phase 4**: AI 보고서
   - 아이콘: AI 아이콘
   - 제목: "AI 보고서"
   - 설명: "AI가 생성한 종합 분석 보고서를 확인합니다"
   - 링크: `/phase4`

5. **피지컬 게임**: 피지컬 컴퓨팅 게임
   - 아이콘: 게임 아이콘
   - 제목: "피지컬 게임"
   - 설명: "물리적 인터랙션으로 나만의 예술가 스토리를 생성하고 유사한 작가를 발견합니다"
   - 링크: `/physical-game`

**인터랙션**:
- **호버**: 카드 확대 (scale: 1.02), 그림자 증가
- **클릭**: 해당 Phase 또는 피지컬 게임 페이지로 이동

**애니메이션**:
- 초기 로딩: 카드가 순차적으로 나타남 (stagger: 100ms)
- 호버: 0.3s ease-out

**접근성**:
```jsx
<section
  role="region"
  aria-label="주요 기능 소개"
>
  <div className="feature-cards-grid">
    {features.map((feature, index) => (
      <article
        key={feature.id}
        className="feature-card"
        aria-label={`${feature.title}: ${feature.description}`}
      >
        <img src={feature.icon} alt="" aria-hidden="true" />
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
        <a href={feature.link} aria-label={`${feature.title} 페이지로 이동`}>
          자세히 보기
        </a>
      </article>
    ))}
  </div>
</section>
```

---

#### 2.5.3 LandingPageNavigation (네비게이션)

**컴포넌트 경로**: `src/components/layout/LandingPageNavigation.jsx`

**시각적 스펙**:
- **위치**: 상단 고정 (`position: fixed`, `top: 0`)
- **배경**: 반투명 배경 (`rgba(255, 255, 255, 0.95)`)
- **높이**: `64px` (모바일), `80px` (데스크톱)
- **로고**: 좌측 상단, `@4.svg`
- **메뉴**: 우측 상단 (데스크톱), 햄버거 메뉴 (모바일)

**네비게이션 메뉴**:
- Home (현재 페이지)
- Features (Feature Cards 섹션으로 스크롤)
- Physical Game (피지컬 게임 페이지)
- About (선택적)

**인터랙션**:
- **스크롤 시**: 배경 불투명도 증가 (`rgba(255, 255, 255, 0.98)`)
- **메뉴 호버**: 메뉴 항목 하단 밑줄 애니메이션
- **모바일 메뉴**: 햄버거 메뉴 클릭 시 슬라이드 다운 메뉴

**접근성**:
```jsx
<nav
  role="navigation"
  aria-label="메인 네비게이션"
>
  <a href="/" aria-label="홈으로 이동">
    <img src="/ref/4.svg" alt="CuratorOdyssey 로고" />
  </a>
  <ul>
    <li><a href="#features">Features</a></li>
    <li><a href="/physical-game">Physical Game</a></li>
  </ul>
</nav>
```

---

### 2.6 피지컬 게임 결과 화면 컴포넌트

#### 2.6.1 PhysicalGameResultView (결과 화면 컨테이너)

**컴포넌트 경로**: `src/components/physical-game/PhysicalGameResultView.jsx`

**데이터 소스**: `WebSocket` 또는 `GET /api/physical-game/session/{sessionId}` → 게임 세션 데이터

**시각적 스펙**:
- **레이아웃**: 가로 스크롤 컨테이너 (18 Years of Büro 스타일)
- **섹션 너비**: `100vw` (각 섹션)
- **섹션 높이**: `100vh` / `100svh`
- **배경**: WebGL 배경 (기하학적 패턴, 주 컬러 기반)
- **섹션 간 전환**: 페이드 애니메이션 (0.8s ease-out)

**섹션 구성** (순서대로):
1. 주 페르소나 섹션 (타임라인)
2. 노력의 결과 섹션 (레이더/선버스트 차트)
3. 매칭 작가 섹션 (유사 작가 프로필)
4. 비교 차트 섹션 (플레이어 vs 작가)

**인터랙션**:
- **마우스 휠 → 가로 스크롤 변환**: 마우스 휠 이벤트를 가로 스크롤로 변환
- **키보드 네비게이션**: 화살표 키 (← →)로 섹션 이동
- **하단 점 네비게이션**: 현재 섹션 인디케이터

**접근성**:
```jsx
<main
  role="main"
  aria-label="피지컬 게임 결과 화면"
  className="physical-game-result-container"
>
  {/* 섹션들 */}
</main>
```

---

#### 2.6.2 MainPersonaSection (주 페르소나 섹션)

**컴포넌트 경로**: `src/components/physical-game/MainPersonaSection.jsx`

**데이터 소스**: 게임 세션 데이터 → `main_persona` 객체

**시각적 스펙**:
- **레이아웃**: 타임라인 레이아웃 (18 Years of Büro 참고)
- **텍스트 중심**: 이미지/아이콘 최소화, 텍스트 중심 표현
- **순차 등장**: 각 나이대 이벤트가 순차적으로 나타남 (stagger: 200ms)

**타임라인 구조**:
- **10대 구간**: 좌측 또는 상단
  - 보물 상자 이벤트 텍스트 표시
  - 예: "구설수가 생기다"
- **20대 구간**: 중앙
  - 보물 상자 이벤트 텍스트 표시
  - 예: "대학교에서 퇴학당하다"
- **30대 구간**: 우측 또는 하단
  - 보물 상자 이벤트 텍스트 표시
  - 예: "군에 입대하다"

**애니메이션**:
- 초기 로딩: 각 나이대 이벤트가 순차적으로 나타남 (stagger: 200ms)
- 페이드 인: `opacity: 0 → 1` (duration: 0.6s)
- 슬라이드 인: `translateX(-20px) → translateX(0)` (duration: 0.6s)

**접근성**:
```jsx
<section
  role="region"
  aria-label="주 페르소나: 인생 궤적"
  className="main-persona-section"
>
  <h2>주 페르소나</h2>
  <div className="persona-timeline">
    <div className="timeline-item" aria-label="10대: {event10s}">
      <span className="age-label">10대</span>
      <p>{event10s}</p>
    </div>
    <div className="timeline-item" aria-label="20대: {event20s}">
      <span className="age-label">20대</span>
      <p>{event20s}</p>
    </div>
    <div className="timeline-item" aria-label="30대: {event30s}">
      <span className="age-label">30대</span>
      <p>{event30s}</p>
    </div>
  </div>
</section>
```

---

#### 2.6.3 EffortResultSection (노력의 결과 섹션)

**컴포넌트 경로**: `src/components/physical-game/EffortResultSection.jsx`

**데이터 소스**: 게임 세션 데이터 → `calculated_metadata` 객체

**시각적 스펙**:
- **레이아웃**: 위아래 배치 (랜딩 페이지에서)
  - 레이더 차트 (상단)
  - 선버스트 차트 (하단)
- **크기**: 전체 화면, VAR 동적 적용
- **인터랙션**: 호버 시 확대

**레이더 차트**:
- **크기**: `clamp(400px, 50vw, 600px) × clamp(400px, 50vw, 600px)`
- **색상**: 주 컬러 기반 (Section 5.4.1 참조)
- **호버 확대**: `scale(1.1)` (duration: 0.3s)

**선버스트 차트**:
- **크기**: `clamp(400px, 50vw, 600px) × clamp(400px, 50vw, 600px)`
- **색상**: 주 컬러 및 세컨더리 베리에이션 (Section 5.4.2 참조)
- **호버 확대**: `scale(1.1)` (duration: 0.3s)

**애니메이션**:
- 초기 로딩: 차트가 순차적으로 나타남 (stagger: 300ms)
- 호버: 확대 애니메이션 (0.3s ease-out)

**접근성**:
```jsx
<section
  role="region"
  aria-label="노력의 결과: 레이더 및 선버스트 차트"
  className="effort-result-section"
>
  <h2>노력의 결과</h2>
  <div className="charts-container">
    <RadarChart
      data={calculatedMetadata.radar5}
      aria-label="레이더 5축 차트"
    />
    <SunburstChart
      data={calculatedMetadata.sunburst_l1}
      aria-label="선버스트 4축 차트"
    />
  </div>
</section>
```

---

#### 2.6.4 MatchedArtistSection (매칭 작가 섹션)

**컴포넌트 경로**: `src/components/physical-game/MatchedArtistSection.jsx`

**데이터 소스**: 게임 세션 데이터 → `ai_matching` 객체

**시각적 스펙**:
- **카드 스타일**: 미니멀 카드 디자인
- **이미지 포함 여부**: 선택적 (작가 프로필 이미지)
- **유사도 시각화**: 프로그레스 바

**카드 레이아웃**:
- **카드 크기**: `clamp(300px, 40vw, 500px) × auto`
- **카드 배경**: 세컨더리 배경 (#F1F0EC)
- **카드 패딩**: `48px`
- **카드 간격**: `32px`

**유사도 프로그레스 바**:
- **너비**: `100%`
- **높이**: `8px`
- **배경**: 세컨더리 300 (#DEDDD6)
- **진행 바**: 주 컬러 (#F28317C)
- **값**: `similarity_score × 100%` (예: 0.85 → 85%)

**작가 정보 표시**:
- 작가 이름 (한국명/영문명)
- 유사도 점수 (예: "85% 유사")
- 매칭 이유 요약
- CuratorOdyssey 링크 버튼

**애니메이션**:
- 초기 로딩: 카드가 페이드 인 (duration: 0.6s)
- 프로그레스 바: 값이 0에서 목표값으로 애니메이션 (duration: 1s)

**접근성**:
```jsx
<section
  role="region"
  aria-label="당신과 유사한 작가"
  className="matched-artist-section"
>
  <h2>당신과 유사한 작가</h2>
  <article className="artist-card">
    <h3>{matchedArtist.name}</h3>
    <div className="similarity-progress">
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={similarityScore * 100}
        aria-valuemin="0"
        aria-valuemax="100"
        style={{ width: `${similarityScore * 100}%` }}
      >
        <span className="sr-only">유사도: {similarityScore * 100}%</span>
      </div>
    </div>
    <p>{matchingReason}</p>
    <a href={curatorOdysseyLink} aria-label={`${matchedArtist.name} 상세 페이지로 이동`}>
      CuratorOdyssey에서 더 알아보기
    </a>
  </article>
</section>
```

---

#### 2.6.5 ComparisonChartSection (비교 차트 섹션)

**컴포넌트 경로**: `src/components/physical-game/ComparisonChartSection.jsx`

**데이터 소스**: 게임 세션 데이터 + CuratorOdyssey API → 비교 데이터

**시각적 스펙**:
- **레이아웃**: 오버레이 스타일 (플레이어와 작가 데이터를 같은 차트에 표시)
- **플레이어 색상**: 주 컬러 (#F28317C)
- **작가 색상**: 세컨더리 컬러 (#F1F0EC)
- **인터랙션**: 축별 토글

**비교 차트 타입**:
1. **레이더 차트 비교**: 플레이어 vs 작가 레이더 5축
2. **선버스트 차트 비교**: 플레이어 vs 작가 선버스트 4축

**축별 토글**:
- 각 축 (I, F, A, M, Sedu 또는 제도, 학술, 담론, 네트워크)에 토글 버튼
- 토글 클릭 시 해당 축 표시/숨김
- 기본값: 모든 축 표시

**오버레이 스타일**:
- 플레이어 라인/영역: 주 컬러, 굵기 3px
- 작가 라인/영역: 세컨더리 컬러, 굵기 2px
- 차이 영역: 반투명 오버레이 (`rgba(242, 131, 23, 0.15)`)

**애니메이션**:
- 초기 로딩: 차트가 페이드 인 (duration: 0.8s)
- 축 토글: 부드러운 전환 (duration: 0.3s)

**접근성**:
```jsx
<section
  role="region"
  aria-label="비교 차트: 플레이어 vs 매칭 작가"
  className="comparison-chart-section"
>
  <h2>비교 차트</h2>
  <div className="axis-toggles">
    {axes.map((axis) => (
      <button
        key={axis}
        aria-pressed={visibleAxes.includes(axis)}
        onClick={() => toggleAxis(axis)}
      >
        {axis}
      </button>
    ))}
  </div>
  <ComparisonChart
    playerData={playerData}
    artistData={artistData}
    visibleAxes={visibleAxes}
    aria-label="플레이어와 작가 비교 차트"
  />
</section>
```

---

#### 2.6.6 ResultNavigation (결과 화면 네비게이션)

**컴포넌트 경로**: `src/components/physical-game/ResultNavigation.jsx`

**시각적 스펙**:
- **하단 점 네비게이션**: 현재 섹션 인디케이터
- **뒤로가기 버튼**: 좌측 상단 또는 하단 (레퍼런스 참고)
- **CuratorOdyssey 링크**: 우측 하단 또는 하단 중앙 (111 West 스타일)

**하단 점 네비게이션**:
- **위치**: 화면 하단 중앙
- **점 크기**: `8px` (비활성), `12px` (활성)
- **점 간격**: `12px`
- **점 색상**: 세컨더리 500 (비활성), 주 컬러 (활성)

**뒤로가기 버튼**:
- **위치**: 좌측 상단 또는 하단 좌측
- **스타일**: 미니멀 아이콘 버튼
- **클릭**: 랜딩 페이지로 이동 또는 이전 페이지로 이동

**CuratorOdyssey 링크 버튼**:
- **위치**: 우측 하단 또는 하단 중앙
- **스타일**: 111 West clip-path 스타일 적용
- **텍스트**: "CuratorOdyssey에서 더 알아보기"
- **클릭**: 매칭 작가 상세 페이지로 이동

**접근성**:
```jsx
<nav
  role="navigation"
  aria-label="결과 화면 네비게이션"
  className="result-navigation"
>
  <button
    className="back-button"
    aria-label="뒤로 가기"
    onClick={handleBack}
  >
    ← 뒤로
  </button>
  <div className="section-indicators" role="tablist">
    {sections.map((section, index) => (
      <button
        key={section.id}
        role="tab"
        aria-selected={currentSection === index}
        aria-label={`${section.name} 섹션으로 이동`}
        onClick={() => scrollToSection(index)}
      >
        <span className="indicator-dot" />
      </button>
    ))}
  </div>
  <a
    href={curatorOdysseyLink}
    className="curator-link"
    aria-label="CuratorOdyssey에서 더 알아보기"
  >
    CuratorOdyssey에서 더 알아보기
  </a>
</nav>
```

---

### 2.7 WebGL 배경 컴포넌트

#### 2.7.1 WebGLBackground (WebGL 배경)

**컴포넌트 경로**: `src/components/common/WebGLBackground.jsx`

**시각적 스펙**:
- **패턴**: 기하학적 패턴 (18 Years of Büro 스타일)
- **색상**: 주 컬러 (#F28317C) 기반
- **인터랙션**: 스크롤 반응
- **성능 최적화 레벨**: 상 (파티클 수, 해상도 최적화)

**기하학적 패턴**:
- **타입**: 파티클 시스템 또는 기하학적 메쉬
- **색상 팔레트**: 
  - 주 컬러 (#F28317C) - 기본 색상
  - Primary 400 (#FFA333) - 강조 색상
  - Primary 600 (#D66A0F) - 어두운 액센트
- **투명도**: `rgba(242, 131, 23, 0.3)` ~ `rgba(242, 131, 23, 0.6)`

**스크롤 반응**:
- **파라미터**: 스크롤 위치에 따라 파티클 위치/속도 변경
- **애니메이션**: 부드러운 전환 (easing: ease-out)
- **성능**: `requestAnimationFrame` 사용, 60fps 목표

**성능 최적화**:
- **파티클 수**: 
  - 모바일: 최대 500개
  - 태블릿: 최대 1000개
  - 데스크톱: 최대 2000개
- **해상도**: 
  - 모바일: `devicePixelRatio × 0.5` (반 해상도)
  - 태블릿: `devicePixelRatio × 0.75` (75% 해상도)
  - 데스크톱: `devicePixelRatio × 1.0` (전체 해상도)
- **렌더링 최적화**: 
  - 프러스텀 컬링 (Frustum Culling)
  - LOD (Level of Detail) 시스템
  - 배치 렌더링 (Instanced Rendering)

**인터랙션**:
- **마우스 호버**: 파티클이 마우스 위치로 모이는 효과 (선택적)
- **스크롤**: 스크롤 속도에 따라 파티클 움직임 가속/감속
- **리사이즈**: 창 크기 변경 시 자동 재조정

**접근성**:
- **prefers-reduced-motion**: 애니메이션 비활성화 옵션
- **성능 모드**: 저사양 디바이스 감지 시 자동 성능 모드 전환

**구현 예시**:
```jsx
<WebGLBackground
  patternType="geometric"
  colorPalette="primary"
  particleCount={deviceType === 'mobile' ? 500 : 2000}
  resolution={devicePixelRatio * (deviceType === 'mobile' ? 0.5 : 1.0)}
  scrollReactive={true}
  performanceMode="high"
/>
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

### 3.5 랜딩 페이지 플로우 (Landing Page Flow)

```
┌─────────────────┐
│   랜딩 페이지 접속 │
│   (홈페이지)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hero 섹션 표시   │
│  (WebGL 배경)     │
│  + 로고 + CTA     │
└────────┬────────┘
         │
    ┌────┴────┐
    │        │
    ▼        ▼
┌──────┐ ┌──────────┐
│CTA   │ │스크롤    │
│클릭  │ │다운      │
└──┬───┘ └────┬─────┘
   │         │
   │         ▼
   │    ┌──────────┐
   │    │Feature   │
   │    │Cards     │
   │    │섹션      │
   │    └──────────┘
   │
   ▼
┌─────────────────┐
│ 피지컬 게임 시작  │
│ 또는 Phase 선택   │
└─────────────────┘
```

**상호작용 시나리오**:
1. 사용자가 랜딩 페이지 접속 → Hero 섹션 표시 (WebGL 배경, 로고, CTA 버튼)
2. 사용자가 CTA 버튼 클릭 → 피지컬 게임 결과 화면으로 이동 (`/physical-game/result`)
3. 또는 사용자가 스크롤 다운 → Feature Cards 섹션 표시
4. 사용자가 Feature Card 클릭 → 해당 Phase 또는 피지컬 게임 페이지로 이동

**랜딩 페이지 → 피지컬 게임 결과 화면 전환**:
- 전환 애니메이션: 페이드 + 슬라이드 (0.8s ease-out)
- 로딩 상태: 스피너 표시 (게임 세션 데이터 로드 중)

---

### 3.6 피지컬 게임 결과 화면 플로우 (Physical Game Result Flow)

```
┌─────────────────┐
│  게임 세션 완료   │
│  (피지컬 게임)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  세션 데이터 로드  │
│  (WebSocket/API) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  결과 화면 표시   │
│  (가로 스크롤)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 섹션 1: 주 페르소나│
│ (타임라인)        │
└────────┬────────┘
         │
         ▼ (가로 스크롤)
┌─────────────────┐
│ 섹션 2: 노력의 결과│
│ (레이더/선버스트)  │
└────────┬────────┘
         │
         ▼ (가로 스크롤)
┌─────────────────┐
│ 섹션 3: 매칭 작가 │
│ (유사 작가 프로필)│
└────────┬────────┘
         │
         ▼ (가로 스크롤)
┌─────────────────┐
│ 섹션 4: 비교 차트 │
│ (플레이어 vs 작가)│
└────────┬────────┘
         │
    ┌────┴────┐
    │        │
    ▼        ▼
┌──────┐ ┌──────────┐
│뒤로  │ │Curator   │
│가기  │ │Odyssey   │
│버튼  │ │링크      │
└──────┘ └──────────┘
```

**상호작용 시나리오**:
1. 사용자가 게임 세션 완료 → 결과 화면 자동 표시
2. 사용자가 마우스 휠 스크롤 → 가로 스크롤로 변환 (18 Years of Büro 스타일)
3. 사용자가 화살표 키 (← →) → 섹션 간 이동
4. 사용자가 하단 점 네비게이션 클릭 → 해당 섹션으로 스크롤
5. 사용자가 CuratorOdyssey 링크 클릭 → 매칭 작가 상세 페이지로 이동

**섹션별 상세 플로우**:

**섹션 1: 주 페르소나**
- 타임라인 레이아웃 (10대, 20대, 30대)
- 순차 등장 애니메이션 (stagger: 200ms)
- 텍스트 중심 표현

**섹션 2: 노력의 결과**
- 레이더 차트 (상단) + 선버스트 차트 (하단)
- 호버 시 확대 효과 (scale: 1.1)
- VAR 동적 적용

**섹션 3: 매칭 작가**
- 미니멀 카드 디자인
- 유사도 프로그레스 바
- CuratorOdyssey 링크 버튼

**섹션 4: 비교 차트**
- 플레이어 vs 작가 오버레이 차트
- 축별 토글 인터랙션
- 주/세컨더리 색상 구분

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

**피지컬 게임 결과 화면 섹션별 aria-label**:
```jsx
// 주 페르소나 섹션
<section
  role="region"
  aria-label="주 페르소나: 인생 궤적"
  aria-describedby="main-persona-description"
>
  <h2>주 페르소나</h2>
  <p id="main-persona-description">
    10대: {event10s}, 20대: {event20s}, 30대: {event30s}
  </p>
</section>

// 노력의 결과 섹션
<section
  role="region"
  aria-label="노력의 결과: 레이더 및 선버스트 차트"
  aria-describedby="effort-result-description"
>
  <h2>노력의 결과</h2>
  <p id="effort-result-description">
    레이더 차트와 선버스트 차트로 계산된 노력의 결과를 표시합니다.
  </p>
</section>

// 매칭 작가 섹션
<section
  role="region"
  aria-label="당신과 유사한 작가"
  aria-describedby="matched-artist-description"
>
  <h2>당신과 유사한 작가</h2>
  <p id="matched-artist-description">
    유사도 {similarityScore * 100}%로 매칭된 작가: {matchedArtist.name}
  </p>
</section>

// 비교 차트 섹션
<section
  role="region"
  aria-label="비교 차트: 플레이어 vs 매칭 작가"
  aria-describedby="comparison-chart-description"
>
  <h2>비교 차트</h2>
  <p id="comparison-chart-description">
    플레이어와 매칭 작가의 레이더 및 선버스트 차트 비교
  </p>
</section>
```

**랜딩 페이지 섹션별 aria-label**:
```jsx
// Hero 섹션
<section
  role="banner"
  aria-label="CuratorOdyssey 메인 Hero 섹션"
>
  <h1>CuratorOdyssey</h1>
  <p>데이터로 가치의 지도를 그립니다</p>
</section>

// Feature Cards 섹션
<section
  role="region"
  aria-label="주요 기능 소개"
>
  <h2>주요 기능</h2>
  {/* Feature Cards */}
</section>
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

**피지컬 게임 결과 화면 키보드 네비게이션**:
- `←` (왼쪽 화살표): 이전 섹션으로 이동
- `→` (오른쪽 화살표): 다음 섹션으로 이동
- `Home`: 첫 번째 섹션으로 이동
- `End`: 마지막 섹션으로 이동
- `Tab`: 섹션 내 상호작용 요소로 포커스 이동
- `Shift + Tab`: 이전 상호작용 요소로 포커스 이동

**섹션 전환 시 포커스 관리**:
- 섹션 전환 시 해당 섹션의 첫 번째 상호작용 요소로 포커스 이동
- 섹션 내 상호작용 요소가 없는 경우, 섹션 자체에 포커스 (`tabIndex={0}`)
- 섹션 전환 애니메이션 완료 후 포커스 이동 (지연: 100ms)

**React 구현 예시**:
```jsx
const PhysicalGameResultView = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && currentSection > 0) {
        setCurrentSection(currentSection - 1);
        scrollToSection(currentSection - 1);
      } else if (e.key === 'ArrowRight' && currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        scrollToSection(currentSection + 1);
      } else if (e.key === 'Home') {
        setCurrentSection(0);
        scrollToSection(0);
      } else if (e.key === 'End') {
        setCurrentSection(sections.length - 1);
        scrollToSection(sections.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection]);

  const scrollToSection = (index) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // 포커스 이동
    setTimeout(() => {
      const firstInteractive = sectionRefs.current[index]?.querySelector('button, a, input, [tabindex="0"]');
      firstInteractive?.focus();
    }, 100);
  };

  return (
    <main>
      {sections.map((section, index) => (
        <section
          key={section.id}
          ref={(el) => (sectionRefs.current[index] = el)}
          tabIndex={0}
          aria-label={section.ariaLabel}
          role="region"
        >
          {section.content}
        </section>
      ))}
    </main>
  );
};
```

### 4.3 색상 대비 (Color Contrast)

**텍스트** (새로운 색상 시스템 기반):
- 본문 텍스트: `#3D3C39` (Secondary 900) / 배경: `#FFFFFF` → 대비비: 12.8:1 ✅
- 보조 텍스트: `#6B6A60` (Secondary 700) / 배경: `#FFFFFF` → 대비비: 7.2:1 ✅
- 링크: `#F28317C` (Primary 500) / 배경: `#FFFFFF` → 대비비: 3.2:1 ⚠️ (큰 텍스트만, 18px 이상)
- 링크 호버: `#D66A0F` (Primary 600) / 배경: `#FFFFFF` → 대비비: 4.1:1 ✅

**UI 컴포넌트**:
- 버튼 (주 컬러): `#F28317C` (Primary 500) / 텍스트: `#FFFFFF` → 대비비: 3.2:1 ⚠️
  - 해결책: 버튼 텍스트는 항상 흰색 (`#FFFFFF`) 사용, 배경은 `#D66A0F` (Primary 600) 사용 → 대비비: 4.1:1 ✅
- 입력 필드: `#F1F0EC` (Secondary 100) / 텍스트: `#3D3C39` (Secondary 900) → 대비비: 8.5:1 ✅
- 카드 배경: `#F1F0EC` (Secondary 100) / 텍스트: `#3D3C39` (Secondary 900) → 대비비: 8.5:1 ✅

**차트 색상 대비**:
- 레이더 차트 다각형 경계: `#F28317C` (Primary 500) / 배경: `#FFFFFF` → 대비비: 3.2:1 ⚠️
  - 해결책: 경계선 굵기 증가 (2px → 3px) 또는 색상 어둡게 (`#D66A0F`)
- 선버스트 차트 섹터: 각 섹터 색상 / 배경: `#FFFFFF` → 대비비 검증 필요
  - 제도 (L1): `#F28317C` → 3.2:1 ⚠️
  - 학술 (L1): `#D66A0F` → 4.1:1 ✅ (텍스트 오버레이 시 어두운 색상 사용)
  - 담론 (L1): `#BA510C` → 4.8:1 ✅ (텍스트 오버레이 시 어두운 색상 사용)
  - 네트워크 (L1): `#9E3809` → 5.2:1 ✅ (텍스트 오버레이 시 어두운 색상 사용)

**색상 대비 검증 도구**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser (CCA)](https://www.tpgi.com/color-contrast-checker/)
- 자동화: [axe DevTools](https://www.deque.com/axe/devtools/) 또는 [Lighthouse](https://developers.google.com/web/tools/lighthouse)

**대비 개선 가이드라인**:
1. 텍스트 오버레이: 밝은 배경에 어두운 텍스트, 어두운 배경에 밝은 텍스트
2. 링크: 밑줄 추가 또는 호버 시 색상 변경 (`#F28317C` → `#D66A0F`)
3. 버튼: 항상 충분한 대비비 확보 (`#D66A0F` 배경 + `#FFFFFF` 텍스트)
4. 차트: 텍스트 라벨은 항상 충분한 대비비 확보 (배경 오버레이 또는 그림자 사용)

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

## 5. 색상 시스템 (Color System)

### 5.1 주 컬러 팔레트 (#F28317C 기반)

**감도 높은 스튜디오 디자인 페이지 기준 스코프 설정**

| 단계 | 색상 코드 | RGB | 용도 |
|------|----------|-----|------|
| **Primary 50** | `#FFF4E6` | `rgb(255, 244, 230)` | 가장 밝은 배경, 호버 배경 |
| **Primary 100** | `#FFE8CC` | `rgb(255, 232, 204)` | 연한 배경, 툴팁 배경 |
| **Primary 200** | `#FFD199` | `rgb(255, 209, 153)` | 경계선, 구분선 |
| **Primary 300** | `#FFBA66` | `rgb(255, 186, 102)` | 비활성 상태, 플레이스홀더 |
| **Primary 400** | `#FFA333` | `rgb(255, 163, 51)` | 호버 상태, 보조 액센트 |
| **Primary 500** | `#F28317C` | `rgb(242, 131, 23)` | **주 컬러** (브랜드 컬러) |
| **Primary 600** | `#D66A0F` | `rgb(214, 106, 15)` | 액티브 상태, 강조 |
| **Primary 700** | `#BA510C` | `rgb(186, 81, 12)` | 텍스트 (큰 제목), 다크 모드 액센트 |
| **Primary 800** | `#9E3809` | `rgb(158, 56, 9)` | 텍스트 (작은 제목), 다크 모드 텍스트 |
| **Primary 900** | `#821F06` | `rgb(130, 31, 6)` | 가장 어두운 액센트, 다크 모드 강조 |

### 5.2 세컨더리 팔레트 (#F1F0EC 베리에이션)

**감도 높은 스튜디오 디자인 페이지 기준 스코프 설정**

| 단계 | 색상 코드 | RGB | 용도 |
|------|----------|-----|------|
| **Secondary 50** | `#F9F8F6` | `rgb(249, 248, 246)` | 가장 밝은 배경 |
| **Secondary 100** | `#F1F0EC` | `rgb(241, 240, 236)` | **세컨더리 기본** (배경, 카드) |
| **Secondary 200** | `#E8E7E2` | `rgb(232, 231, 226)` | 경계선, 구분선 |
| **Secondary 300** | `#DEDDD6` | `rgb(222, 221, 214)` | 비활성 상태 |
| **Secondary 400** | `#C4C3BA` | `rgb(196, 195, 186)` | 플레이스홀더 텍스트 |
| **Secondary 500** | `#A9A89E` | `rgb(169, 168, 158)` | 보조 텍스트 |
| **Secondary 600** | `#8E8D82` | `rgb(142, 141, 130)` | 본문 텍스트 (연한) |
| **Secondary 700** | `#6B6A60` | `rgb(107, 106, 96)` | 본문 텍스트 |
| **Secondary 800** | `#4A4942` | `rgb(74, 73, 66)` | 제목 텍스트 |
| **Secondary 900** | `#3D3C39` | `rgb(61, 60, 57)` | 가장 어두운 텍스트 |

### 5.3 용도별 색상 매핑

#### 5.3.1 텍스트 색상

| 용도 | 색상 코드 | RGB | 대비비 (배경: #FFFFFF) |
|------|----------|-----|---------------------|
| **Primary Text** | `#3D3C39` | `rgb(61, 60, 57)` | 12.8:1 ✅ |
| **Secondary Text** | `#6B6A60` | `rgb(107, 106, 96)` | 7.2:1 ✅ |
| **Tertiary Text** | `#A9A89E` | `rgb(169, 168, 158)` | 3.8:1 ⚠️ (큰 텍스트만) |
| **Placeholder** | `#C4C3BA` | `rgb(196, 195, 186)` | 2.1:1 ⚠️ (큰 텍스트만) |
| **Link** | `#F28317C` | `rgb(242, 131, 23)` | 3.2:1 ⚠️ (큰 텍스트만) |
| **Link Hover** | `#D66A0F` | `rgb(214, 106, 15)` | 4.1:1 ✅ |

#### 5.3.2 배경 색상

| 용도 | 색상 코드 | RGB | 용도 설명 |
|------|----------|-----|----------|
| **Background Primary** | `#FFFFFF` | `rgb(255, 255, 255)` | 메인 배경 |
| **Background Secondary** | `#F1F0EC` | `rgb(241, 240, 236)` | 카드 배경, 섹션 배경 |
| **Background Tertiary** | `#F9F8F6` | `rgb(249, 248, 246)` | 호버 배경, 강조 배경 |
| **Overlay** | `rgba(61, 60, 57, 0.8)` | `rgba(61, 60, 57, 0.8)` | 모달 오버레이 |

#### 5.3.3 액센트 색상

| 용도 | 색상 코드 | RGB | 용도 설명 |
|------|----------|-----|----------|
| **Accent Primary** | `#F28317C` | `rgb(242, 131, 23)` | 주요 CTA 버튼, 강조 요소 |
| **Accent Hover** | `#D66A0F` | `rgb(214, 106, 15)` | 호버 상태 |
| **Accent Active** | `#BA510C` | `rgb(186, 81, 12)` | 액티브 상태 |
| **Accent Light** | `#FFF4E6` | `rgb(255, 244, 230)` | 연한 액센트 배경 |

#### 5.3.4 상태 색상

| 상태 | 색상 코드 | RGB | 용도 |
|------|----------|-----|------|
| **Success** | `#22C55E` | `rgb(34, 197, 94)` | 성공 메시지, 완료 상태 |
| **Error** | `#EF4444` | `rgb(239, 68, 68)` | 에러 메시지, 경고 상태 |
| **Warning** | `#F59E0B` | `rgb(245, 158, 11)` | 경고 메시지, 주의 상태 |
| **Info** | `#3B82F6` | `rgb(59, 130, 246)` | 정보 메시지, 알림 |

### 5.4 데이터 시각화 색상 매핑

#### 5.4.1 레이더 차트 색상 (5축)

**주 컬러 기반, 각 축별 색상 구분**

| 축 | 색상 코드 | RGB | 용도 |
|----|----------|-----|------|
| **I** (Institution) | `#F28317C` | `rgb(242, 131, 23)` | 주 컬러 (Primary 500) |
| **F** (Fair) | `#FFA333` | `rgb(255, 163, 51)` | Primary 400 |
| **A** (Award) | `#D66A0F` | `rgb(214, 106, 15)` | Primary 600 |
| **M** (Media) | `#BA510C` | `rgb(186, 81, 12)` | Primary 700 |
| **Sedu** (Seduction) | `#9E3809` | `rgb(158, 56, 9)` | Primary 800 |

**채우기 색상 (반투명)**:
- 다각형 채우기: `rgba(242, 131, 23, 0.2)` (Primary 500, 20% 투명도)
- 다각형 경계: `rgb(242, 131, 23)` (Primary 500)

#### 5.4.2 선버스트 차트 색상 (4축)

**주 컬러 및 세컨더리 베리에이션, 정보 위계 (L1 → L2 → L3)에 따른 색상 연하게**

| 축 | L1 색상 | L2 색상 | L3 색상 | RGB (L1) |
|----|---------|---------|---------|----------|
| **제도** | `#F28317C` | `#FFA333` | `#FFBA66` | `rgb(242, 131, 23)` |
| **학술** | `#D66A0F` | `#FFA333` | `#FFD199` | `rgb(214, 106, 15)` |
| **담론** | `#BA510C` | `#D66A0F` | `#FFA333` | `rgb(186, 81, 12)` |
| **네트워크** | `#9E3809` | `#BA510C` | `#D66A0F` | `rgb(158, 56, 9)` |

**정보 위계별 투명도**:
- L1: `opacity: 1.0` (100%)
- L2: `opacity: 0.7` (70%)
- L3: `opacity: 0.4` (40%)

#### 5.4.3 비교 차트 색상 (플레이어 vs 작가)

| 항목 | 색상 코드 | RGB | 용도 |
|------|----------|-----|------|
| **플레이어** | `#F28317C` | `rgb(242, 131, 23)` | 주 컬러 (Primary 500) |
| **작가** | `#F1F0EC` | `rgb(241, 240, 236)` | 세컨더리 기본 |
| **차이 음영** | `rgba(242, 131, 23, 0.15)` | `rgba(242, 131, 23, 0.15)` | 차이 영역 표시 |

**오버레이 스타일**:
- 플레이어 라인: 굵기 3px, 주 컬러
- 작가 라인: 굵기 2px, 세컨더리 컬러
- 차이 영역: 반투명 오버레이

### 5.5 CSS 변수 정의

```css
:root {
  /* Primary Colors - 주 컬러 (#F28317C) */
  --color-primary-50: #FFF4E6;
  --color-primary-100: #FFE8CC;
  --color-primary-200: #FFD199;
  --color-primary-300: #FFBA66;
  --color-primary-400: #FFA333;
  --color-primary-500: #F28317C; /* 주 컬러 */
  --color-primary-600: #D66A0F;
  --color-primary-700: #BA510C;
  --color-primary-800: #9E3809;
  --color-primary-900: #821F06;

  /* Secondary Colors - 세컨더리 (#F1F0EC) */
  --color-secondary-50: #F9F8F6;
  --color-secondary-100: #F1F0EC; /* 세컨더리 기본 */
  --color-secondary-200: #E8E7E2;
  --color-secondary-300: #DEDDD6;
  --color-secondary-400: #C4C3BA;
  --color-secondary-500: #A9A89E;
  --color-secondary-600: #8E8D82;
  --color-secondary-700: #6B6A60;
  --color-secondary-800: #4A4942;
  --color-secondary-900: #3D3C39;

  /* Text Colors */
  --color-text-primary: var(--color-secondary-900);
  --color-text-secondary: var(--color-secondary-700);
  --color-text-tertiary: var(--color-secondary-500);
  --color-text-placeholder: var(--color-secondary-400);
  --color-text-link: var(--color-primary-500);
  --color-text-link-hover: var(--color-primary-600);

  /* Background Colors */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: var(--color-secondary-100);
  --color-bg-tertiary: var(--color-secondary-50);
  --color-overlay: rgba(61, 60, 57, 0.8);

  /* Accent Colors */
  --color-accent-primary: var(--color-primary-500);
  --color-accent-hover: var(--color-primary-600);
  --color-accent-active: var(--color-primary-700);
  --color-accent-light: var(--color-primary-50);

  /* Status Colors */
  --color-success: #22C55E;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;

  /* Data Visualization Colors */
  --color-radar-I: var(--color-primary-500);
  --color-radar-F: var(--color-primary-400);
  --color-radar-A: var(--color-primary-600);
  --color-radar-M: var(--color-primary-700);
  --color-radar-Sedu: var(--color-primary-800);

  --color-sunburst-제도-l1: var(--color-primary-500);
  --color-sunburst-제도-l2: var(--color-primary-400);
  --color-sunburst-제도-l3: var(--color-primary-300);
  --color-sunburst-학술-l1: var(--color-primary-600);
  --color-sunburst-학술-l2: var(--color-primary-400);
  --color-sunburst-학술-l3: var(--color-primary-200);
  --color-sunburst-담론-l1: var(--color-primary-700);
  --color-sunburst-담론-l2: var(--color-primary-600);
  --color-sunburst-담론-l3: var(--color-primary-400);
  --color-sunburst-네트워크-l1: var(--color-primary-800);
  --color-sunburst-네트워크-l2: var(--color-primary-700);
  --color-sunburst-네트워크-l3: var(--color-primary-600);

  --color-compare-player: var(--color-primary-500);
  --color-compare-artist: var(--color-secondary-100);
  --color-compare-diff: rgba(242, 131, 23, 0.15);
}
```

---

## 6. 애니메이션 스펙 (Animation Specifications)

### 6.1 섹션 전환 애니메이션

**결과 화면 섹션 전환**:
- **Duration**: 0.8s
- **Easing**: `ease-out`
- **효과**: 페이드 (`opacity: 0 → 1`)
- **전환 방향**: 가로 스크롤 (18 Years of Büro 스타일)

**랜딩 페이지 섹션 전환**:
- **Duration**: 0.6s
- **Easing**: `ease-out`
- **효과**: 페이드 + 슬라이드 (`opacity: 0 → 1`, `translateY(20px) → translateY(0)`)

**Phase 전환** (기존 웹앱):
- **Duration**: 0.8s
- **Easing**: `ease-out`
- **효과**: 페이드 (`opacity: 0 → 1`)

### 6.2 스태거 애니메이션 (Stagger Animation)

**UX/UI 측면에서 최적화된 스태거 타이밍**

**Feature Cards 순차 등장**:
- **Duration**: 0.6s per card
- **Stagger**: 100ms (요소별 지연 시간)
- **Easing**: `ease-out`
- **효과**: 페이드 + 슬라이드 (`opacity: 0 → 1`, `translateY(20px) → translateY(0)`)

**주 페르소나 타임라인 순차 등장**:
- **Duration**: 0.6s per item
- **Stagger**: 200ms (나이대별 지연 시간)
- **Easing**: `ease-out`
- **효과**: 페이드 + 슬라이드 (`opacity: 0 → 1`, `translateX(-20px) → translateX(0)`)

**차트 순차 등장**:
- **Duration**: 0.8s per chart
- **Stagger**: 300ms (차트별 지연 시간)
- **Easing**: `ease-out`
- **효과**: 페이드 + 확대 (`opacity: 0 → 1`, `scale(0.95) → scale(1)`)

**CSS 구현 예시**:
```css
.stagger-item {
  animation: fadeInSlide 0.6s ease-out forwards;
  opacity: 0;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 100ms; }
.stagger-item:nth-child(3) { animation-delay: 200ms; }
.stagger-item:nth-child(4) { animation-delay: 300ms; }
.stagger-item:nth-child(5) { animation-delay: 400ms; }

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 6.3 차트 애니메이션

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

**비교 차트**:
- 초기 로딩: 라인이 왼쪽에서 오른쪽으로 그려짐
  - Duration: 800ms
  - Easing: `ease-out`
  - Transform: `translateX(-100%) → translateX(0)`

### 6.4 로딩 애니메이션

**스피너 로딩**:
- **타입**: 회전 스피너
- **크기**: `40px × 40px`
- **색상**: 주 컬러 (#F28317C)
- **Duration**: 1s (무한 반복)
- **Easing**: `linear`

**스켈레톤 로딩**:
- **타입**: 펄스 애니메이션
- **Duration**: 1.5s (무한 반복)
- **Easing**: `ease-in-out`
- **효과**: `opacity: 0.4 → 1 → 0.4`

**프로그레스 바 로딩**:
- **타입**: 진행 바 애니메이션
- **Duration**: 1s (값에 따라)
- **Easing**: `ease-out`
- **효과**: `width: 0% → target%`

**CSS 구현 예시**:
```css
/* 스피너 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
  border: 3px solid var(--color-secondary-300);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
}

/* 스켈레톤 */
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
  background: var(--color-secondary-200);
}

/* 프로그레스 바 */
.progress-bar {
  transition: width 1s ease-out;
}
```

### 6.5 인터랙션 애니메이션

**호버 효과**:
- **Duration**: 0.3s
- **Easing**: `ease-out`
- **효과**: `scale(1) → scale(1.05)` 또는 `translateY(0) → translateY(-2px)`

**클릭 효과**:
- **Duration**: 0.15s
- **Easing**: `ease-out`
- **효과**: `scale(1) → scale(0.95) → scale(1)`

**툴팁 표시**:
- **Duration**: 200ms
- **Easing**: `ease-out`
- **Transform**: `scale(0.9) → scale(1)`
- **Opacity**: `0 → 1`

### 6.6 애니메이션 성능 최적화

**GPU 가속 활용**:
- `transform` 및 `opacity` 속성 사용 (레이아웃 재계산 방지)
- `will-change` 속성 적절히 사용 (애니메이션 요소에만)

**애니메이션 비활성화 옵션**:
- `prefers-reduced-motion` 미디어 쿼리 지원
- 사용자 설정에 따라 애니메이션 비활성화

**CSS 구현**:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. 그리드 시스템 및 반응형 레이아웃 (Grid System & Responsive Layout)

### 7.1 그리드 시스템 개요

**18 Years of Büro 레퍼런스 기반 그리드 시스템**

CuratorOdyssey는 두 가지 주요 레이아웃 모드를 지원합니다:
1. **랜딩 페이지**: 수직 스크롤, 전통적인 그리드 시스템
2. **결과 화면**: 가로 스크롤, 18 Years of Büro 스타일 섹션 기반 레이아웃

### 7.2 랜딩 페이지 그리드 시스템

**111 West 57th Street 레퍼런스 기반**

#### 7.2.1 컨테이너 및 마진

| 요소 | 값 | 설명 |
|------|-----|------|
| **Max Width** | `1440px` | 컨테이너 최대 너비 |
| **Container Padding** | `24px` (모바일), `40px` (태블릿), `80px` (데스크톱) | 좌우 패딩 |
| **Section Margin** | `80px` (모바일), `120px` (태블릿), `160px` (데스크톱) | 섹션 간 간격 |

#### 7.2.2 그리드 컬럼 시스템

| 브레이크포인트 | 컬럼 수 | 거터 | 컬럼 너비 계산 |
|---------------|---------|------|---------------|
| **모바일** (< 768px) | 4 | `16px` | `(100vw - 48px - 48px) / 4` |
| **태블릿** (768px - 1024px) | 8 | `24px` | `(100vw - 80px - 80px) / 8` |
| **데스크톱** (> 1024px) | 12 | `32px` | `(1440px - 160px - 160px) / 12` |

**CSS 변수 정의**:
```css
:root {
  /* 랜딩 페이지 그리드 */
  --landing-container-max-width: 1440px;
  --landing-container-padding-mobile: 24px;
  --landing-container-padding-tablet: 40px;
  --landing-container-padding-desktop: 80px;
  
  --landing-section-margin-mobile: 80px;
  --landing-section-margin-tablet: 120px;
  --landing-section-margin-desktop: 160px;
  
  --landing-grid-cols-mobile: 4;
  --landing-grid-cols-tablet: 8;
  --landing-grid-cols-desktop: 12;
  
  --landing-grid-gutter-mobile: 16px;
  --landing-grid-gutter-tablet: 24px;
  --landing-grid-gutter-desktop: 32px;
}
```

#### 7.2.3 Hero 섹션 레이아웃

- **전체 화면 높이**: `100vh` / `100svh`
- **컨텐츠 정렬**: 수직/수평 중앙 정렬
- **로고 위치**: 상단 좌측 또는 중앙 (디자인에 따라)
- **CTA 버튼**: Hero 하단 또는 중앙 배치

### 7.3 결과 화면 그리드 시스템

**18 Years of Büro 레퍼런스 기반**

#### 7.3.1 섹션 구조

**가로 스크롤 레이아웃**:
- 각 섹션 너비: `100vw` (뷰포트 너비)
- 섹션 높이: `100vh` / `100svh` (뷰포트 높이)
- 섹션 간 간격: 없음 (연속 스크롤)

#### 7.3.2 기본 마진 및 거터

| 요소 | 값 | 설명 |
|------|-----|------|
| **기본 마진** | `120px` | 섹션 내부 좌우 마진 (18 Years of Büro 참고) |
| **거터** | 자율 | 컬럼 간 간격 (컨텐츠에 따라 조정) |
| **컬럼 수** | `12` | 12컬럼 기반 그리드 |

**CSS 변수 정의**:
```css
:root {
  /* 결과 화면 그리드 */
  --result-section-width: 100vw;
  --result-section-height: 100vh;
  --result-section-height-safe: 100svh;
  
  --result-base-margin: 120px;
  --result-grid-cols: 12;
  --result-grid-gutter: auto; /* 자율 */
  
  /* 18 Years of Büro 스타일 변수 */
  --grid-inset: var(--result-base-margin);
  --grid-padding: var(--result-base-margin);
  --grid-num-cols: var(--result-grid-cols);
  --grid-gutter: var(--result-grid-gutter);
  --computed-100vw: 100vw;
}
```

#### 7.3.3 섹션 너비 및 간격 (18 Years of Büro 참고)

**섹션 내부 레이아웃**:
- 컨텐츠 영역: `calc(100vw - 2 * var(--result-base-margin))`
- 컬럼 너비: `calc((100vw - 2 * var(--result-base-margin)) / var(--result-grid-cols) - var(--result-grid-gutter))`
- 섹션 간 전환: 페이드 애니메이션 (0.8s ease-out)

**예시 섹션 구조**:
```css
.result-section {
  flex: 1 0 auto;
  width: 100vw;
  height: 100vh;
  height: 100svh;
  padding-left: var(--result-base-margin);
  padding-right: var(--result-base-margin);
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: visible;
}
```

### 7.4 반응형 브레이크포인트

#### 7.4.1 브레이크포인트 정의

| 브레이크포인트 | 너비 | 용도 |
|---------------|------|------|
| **Mobile** | `0px - 767px` | 모바일 디바이스 |
| **Tablet** | `768px - 1023px` | 태블릿 디바이스 |
| **Desktop** | `1024px - 1439px` | 데스크톱 (표준) |
| **Large Desktop** | `1440px+` | 대형 데스크톱 |

**CSS 미디어 쿼리**:
```css
/* 모바일 */
@media (max-width: 767px) {
  :root {
    --landing-container-padding: var(--landing-container-padding-mobile);
    --landing-section-margin: var(--landing-section-margin-mobile);
    --landing-grid-cols: var(--landing-grid-cols-mobile);
    --landing-grid-gutter: var(--landing-grid-gutter-mobile);
  }
}

/* 태블릿 */
@media (min-width: 768px) and (max-width: 1023px) {
  :root {
    --landing-container-padding: var(--landing-container-padding-tablet);
    --landing-section-margin: var(--landing-section-margin-tablet);
    --landing-grid-cols: var(--landing-grid-cols-tablet);
    --landing-grid-gutter: var(--landing-grid-gutter-tablet);
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  :root {
    --landing-container-padding: var(--landing-container-padding-desktop);
    --landing-section-margin: var(--landing-section-margin-desktop);
    --landing-grid-cols: var(--landing-grid-cols-desktop);
    --landing-grid-gutter: var(--landing-grid-gutter-desktop);
  }
}
```

### 7.5 모바일 가로 스크롤 처리

**결과 화면 모바일 최적화**:

#### 7.5.1 가로 스크롤 유지

- 모바일에서도 가로 스크롤 레이아웃 유지
- 섹션 너비: `100vw` (모바일)
- 섹션 높이: `100vh` / `100svh` (모바일)
- 터치 제스처: 스와이프 감도 및 스냅 강도 조정

#### 7.5.2 터치 제스처 설정

| 제스처 | 설정 | 값 |
|--------|------|-----|
| **스와이프 감도** | `touch-action: pan-x` | 가로 스와이프만 허용 |
| **스냅 강도** | `scroll-snap-type: x mandatory` | 섹션별 스냅 |
| **스냅 포인트** | `scroll-snap-align: start` | 각 섹션 시작점 |

**CSS 구현**:
```css
.result-container {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
}

.result-section {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

### 7.6 태블릿 섹션 너비 조정

**태블릿 최적화**:

| 요소 | 모바일 | 태블릿 | 데스크톱 |
|------|--------|--------|----------|
| **섹션 너비** | `100vw` | `100vw` | `100vw` |
| **기본 마진** | `80px` | `100px` | `120px` |
| **컬럼 수** | `8` | `10` | `12` |
| **거터** | `16px` | `20px` | 자율 |

### 7.8 Phase별 레이아웃 (기존 웹앱)

**Phase 1**: 레이더 차트와 선버스트 차트를 세로 스택으로 배치 (모바일), 가로 배치 (데스크톱)
- 차트 크기: 300px × 300px (모바일), 400px × 400px (데스크톱)

**Phase 2**: StackedAreaChart를 가로 스크롤 가능한 래퍼로 감싸기
- EventTimeline을 차트 아래에 배치

**Phase 3**: 비교 차트를 탭 인터페이스로 전환 (A/B 탭)
- 지표를 카드 형태로 표시

**Phase 4**: Markdown 보고서를 모바일 친화적 폰트 크기로 조정 (14px)
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

## 9. 브랜드 아이덴티티 (Brand Identity)

### 9.1 로고 (Logo)

**로고 파일**: `@4.svg` (경로: `/ref/4.svg` 또는 `public/ref/4.svg`)

**로고 위치**:
- **랜딩 페이지**: 상단 좌측 (111 West 57th Street 스타일 참고)
  - 위치: `var(--landing-container-padding)` 좌측, 상단 `24px`
  - 크기: `clamp(120px, 10vw, 200px)` (반응형)
- **결과 화면**: 상단 좌측 또는 하단 좌측 (18 Years of Büro 스타일 참고)
  - 위치: `var(--result-base-margin)` 좌측, 상단 `24px` 또는 하단 `24px`
  - 크기: `clamp(100px, 8vw, 160px)` (반응형)

**로고 스타일**:
- **색상**: 주 컬러 (#F28317C) 또는 흰색 (배경에 따라)
- **호버 효과**: 색상 변경 또는 확대 (scale: 1.05, duration: 0.3s)
- **접근성**: `alt="CuratorOdyssey 로고"` 필수

**CSS 구현**:
```css
.curator-logo {
  display: inline-block;
  width: clamp(120px, 10vw, 200px);
  height: auto;
  color: var(--color-primary-500);
  transition: transform 0.3s ease-out, color 0.3s ease-out;
}

.curator-logo:hover {
  transform: scale(1.05);
  color: var(--color-primary-600);
}

.curator-logo img {
  width: 100%;
  height: auto;
  display: block;
}
```

### 9.2 타이포그래피 (Typography)

**랜딩 페이지 타이포그래피**:

| 요소 | 폰트 패밀리 | 크기 | 굵기 | 행간 | 용도 |
|------|------------|------|------|------|------|
| **Hero 제목** | `Zen Maru Gothic` | `clamp(48px, 8vw, 96px)` | `700` | `1.2` | 메인 타이틀 |
| **Hero 부제목** | `Nanum Square Round` | `clamp(18px, 2vw, 24px)` | `400` | `1.5` | 서브 타이틀 |
| **섹션 제목** | `Zen Maru Gothic` | `clamp(32px, 4vw, 48px)` | `700` | `1.25` | 섹션 헤더 |
| **본문** | `Nanum Square Round` | `clamp(14px, 1.5vw, 18px)` | `400` | `1.6` | 본문 텍스트 |
| **CTA 버튼** | `Nanum Square Round` | `clamp(16px, 1.8vw, 20px)` | `700` | `1.4` | 버튼 텍스트 |

**결과 화면 타이포그래피**:

| 요소 | 폰트 패밀리 | 크기 | 굵기 | 행간 | 용도 |
|------|------------|------|------|------|------|
| **섹션 제목** | `Zen Maru Gothic` | `clamp(40px, 5vw, 64px)` | `700` | `1.2` | 섹션 헤더 |
| **타임라인 텍스트** | `Nanum Square Round` | `clamp(18px, 2vw, 24px)` | `400` | `1.5` | 타임라인 이벤트 |
| **차트 라벨** | `Nanum Square Round` | `clamp(12px, 1.2vw, 16px)` | `400` | `1.4` | 차트 축 라벨 |
| **본문** | `Nanum Square Round` | `clamp(14px, 1.5vw, 18px)` | `400` | `1.6` | 본문 텍스트 |
| **작가 이름** | `Zen Maru Gothic` | `clamp(24px, 3vw, 32px)` | `700` | `1.3` | 작가 이름 |

**폰트 로딩**:
```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Nanum+Square+Round:wght@400;700&display=swap" rel="stylesheet">
```

**CSS 변수 정의**:
```css
:root {
  /* 폰트 패밀리 */
  --font-family-heading: "Zen Maru Gothic", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-body: "Nanum Square Round", -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* 랜딩 페이지 폰트 크기 */
  --font-size-hero-title: clamp(48px, 8vw, 96px);
  --font-size-hero-subtitle: clamp(18px, 2vw, 24px);
  --font-size-section-title: clamp(32px, 4vw, 48px);
  --font-size-body: clamp(14px, 1.5vw, 18px);
  --font-size-cta: clamp(16px, 1.8vw, 20px);
  
  /* 결과 화면 폰트 크기 */
  --font-size-result-section-title: clamp(40px, 5vw, 64px);
  --font-size-timeline: clamp(18px, 2vw, 24px);
  --font-size-chart-label: clamp(12px, 1.2vw, 16px);
  --font-size-artist-name: clamp(24px, 3vw, 32px);
}
```

### 9.3 일러스트/이미지 스타일 가이드

**일러스트 스타일**:
- **스타일**: 미니멀, 기하학적 패턴 중심
- **색상**: 주 컬러 (#F28317C) 및 세컨더리 (#F1F0EC) 베리에이션 사용
- **선 스타일**: 얇은 선 (1-2px), 둥근 모서리
- **채우기**: 단색 또는 그라데이션 (주 컬러 기반)

**이미지 스타일**:
- **비율**: 16:9 (Hero), 4:3 (카드), 1:1 (프로필)
- **최적화**: WebP 또는 AVIF 포맷 사용
- **Lazy Loading**: `loading="lazy"` 속성 사용
- **Alt 텍스트**: 모든 이미지에 의미 있는 alt 텍스트 제공

**일러스트 사용 예시**:
- Hero 배경: 기하학적 패턴 (WebGL 또는 SVG)
- Feature Cards 아이콘: 미니멀 아이콘 (SVG)
- 차트 배경: 얇은 그리드 라인 (CSS 또는 SVG)

**CSS 구현**:
```css
.illustration {
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}

.illustration--minimal {
  stroke: var(--color-primary-500);
  stroke-width: 2px;
  fill: none;
}

.illustration--geometric {
  fill: var(--color-primary-500);
  opacity: 0.3;
}
```

---

## 10. 성능 최적화 전략 (Performance Optimization Strategy)

### 10.1 이미지 최적화

**이미지 포맷 선택**:
- **WebP**: 모던 브라우저 지원, JPEG 대비 25-35% 용량 감소
- **AVIF**: 최신 브라우저 지원, JPEG 대비 50% 용량 감소
- **Fallback**: 구형 브라우저를 위한 JPEG/PNG fallback 제공

**이미지 최적화 전략**:
```html
<!-- picture 요소 사용 -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

**이미지 크기 최적화**:
- **Hero 이미지**: 최대 너비 1920px, WebP/AVIF 포맷
- **카드 이미지**: 최대 너비 800px, WebP/AVIF 포맷
- **아이콘**: SVG 사용 (벡터 그래픽)

**Lazy Loading**:
```jsx
<img 
  src="image.jpg" 
  alt="Description" 
  loading="lazy"
  decoding="async"
/>
```

### 10.2 코드 스플리팅

**Route-based Code Splitting**:
```jsx
// App.js
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('./components/layout/LandingPage'));
const PhysicalGameResultView = lazy(() => import('./components/physical-game/PhysicalGameResultView'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/physical-game/result" element={<PhysicalGameResultView />} />
      </Routes>
    </Suspense>
  );
}
```

**Component-based Code Splitting**:
```jsx
// 차트 컴포넌트 지연 로딩
const RadarChart = lazy(() => import('./components/charts/RadarChart'));
const SunburstChart = lazy(() => import('./components/charts/SunburstChart'));
```

**WebGL 배경 지연 로딩**:
```jsx
const WebGLBackground = lazy(() => import('./components/common/WebGLBackground'));
```

### 10.3 캐싱 전략

**정적 자산 캐싱**:
- **이미지**: `Cache-Control: max-age=31536000, immutable`
- **폰트**: `Cache-Control: max-age=31536000, immutable`
- **CSS/JS**: `Cache-Control: max-age=86400` (개발), `max-age=31536000` (프로덕션)

**API 응답 캐싱** (React Query):
- **Phase 1 요약**: `staleTime: 5 * 60 * 1000` (5분)
- **Phase 2 시계열**: `staleTime: 5 * 60 * 1000` (5분)
- **Phase 3 비교**: `staleTime: 24 * 60 * 60 * 1000` (24시간)

**Service Worker 캐싱** (선택적):
- 정적 자산: Cache First
- API 응답: Network First, Fallback to Cache

### 10.4 성능 모니터링

**Core Web Vitals**:
- **LCP (Largest Contentful Paint)**: < 2.5s 목표
- **FID (First Input Delay)**: < 100ms 목표
- **CLS (Cumulative Layout Shift)**: < 0.1 목표

**성능 측정 도구**:
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## 11. 부록 (Appendix)

### 11.1 컴포넌트 파일 구조

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

### 11.2 디자인 툴 (Design Tools)

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

