# 🎨 DYSS 통합 마스터 디자인 아키텍처
> 새로운 사이트맵 구조를 위한 일원화된 디자인 시스템 설계

## 📋 목차

1. [새로운 사이트맵 구조](#1-새로운-사이트맵-구조)
2. [통합 그리드 & 레이아웃 시스템](#2-통합-그리드--레이아웃-시스템)
3. [영역별 디자인 가이드라인](#3-영역별-디자인-가이드라인)
4. [통합 컬러 & 타이포그래피](#4-통합-컬러--타이포그래피)
5. [컴포넌트 시스템 아키텍처](#5-컴포넌트-시스템-아키텍처)
6. [인터랙션 & 애니메이션](#6-인터랙션--애니메이션)
7. [접근성 & 성능 최적화](#7-접근성--성능-최적화)
8. [구현 가이드](#8-구현-가이드)

---

## 1. 새로운 사이트맵 구조

### 1.1 최종 사이트맵 아키텍처

```
DYSS 플랫폼
│
├── 🌐 Public (퍼블릭 영역)
│   ├── Home (/) - 랜딩 페이지
│   ├── Pricing (/pricing) - 요금제 안내
│   └── Auth (/auth) - 로그인/회원가입
│
└── 🔐 Core App (인증 후 메인 앱)
    │
    ├── 🎨 Studio (/studio) - 업로드/분석 허브
    │   ├── 업로드/파일 선택 · 분석 시작
    │   ├── 결과 요약 카드
    │   │   ├── 미학 점수 (Appraiser)
    │   │   └── 원형 진단 (Explorer) → "서칭으로 이동" CTA
    │   └── 결과 상세 패널
    │       ├── 증거 피처(대비·여백 등)
    │       └── 권고 패널[Phase2-flag]
    │
    ├── 🔍 Search (/search) - 탐색/큐레이션
    │   ├── 유사 이미지 서치 (Vector)
    │   ├── 이미지 기반 추천
    │   └── 관심 인사이트 큐레이션[Phase2-flag, 10%]
    │
    ├── 📚 Archive (/archive) - 나의 디자인 여정
    │   ├── Dashboard (/archive/dashboard) - 지표 중심
    │   │   ├── 점수 변화(지표)
    │   │   └── 스타일 변화(지표)
    │   ├── Works (/archive/works) - 모든 분석 기록
    │   └── Collections (/archive/collections) - 즐겨찾기
    │
    ├── 👤 Me (/me) - 개인 로그/개인화
    │   ├── Profile (/me/profile) - 성향 시각화
    │   └── History (/me/history) - 개인 로그
    │
    └── ⚙️ Settings (/settings)
        ├── Account (/settings/account)
        ├── Billing (/settings/billing)
        └── Data (/settings/data)
            └── DNA Suite (/settings/data/dna) [Advanced/Enterprise]
                ├── Ontology Viewer (/settings/data/dna/ontology)
                ├── Knowledge Graph (/settings/data/dna/graph)
                ├── Adaptive Tuning (/settings/data/dna/tuning)
                └── Context Tools (/settings/data/dna/context)
```

### 1.2 영역별 디자인 시스템 적용 전략

| 영역 | 기준 디자인 시스템 | 특화 요소 |
|------|-------------------|-----------|
| **Public** | `dys_advanced_design_system.md` | 마케팅 중심, 고급 인터랙션 |
| **Studio** | `dys_advanced_design_system.md` | 창작 도구 UI, 실시간 피드백 |
| **Core App** | `DYSS_Design_System_Architecture.md` | 일관된 앱 경험, 생산성 중심 |
| **Settings** | `dys_advanced_design_system.md` | 고급 설정 UI, 엔터프라이즈 느낌 |

---

## 2. 통합 그리드 & 레이아웃 시스템

### 2.1 글로벌 그리드 시스템 (통일)

```css
/* 🎯 통합 그리드 시스템 - 12컬럼 기본, 24컬럼 확장 */
:root {
  /* 기본 그리드 변수 */
  --dyss-grid-columns: 12;
  --dyss-grid-gap: 1.6rem;
  --dyss-container-padding: 2rem;
  --dyss-container-max-width: 1200px;
  
  /* 확장 그리드 변수 (고급 영역용) */
  --dyss-grid-columns-advanced: 24;
  --dyss-grid-gap-advanced: 2rem;
}

/* 메인 컨테이너 - 모든 영역 공통 */
.dyss-container {
  display: grid;
  grid-template-columns: repeat(var(--dyss-grid-columns), minmax(0, 1fr));
  gap: var(--dyss-grid-gap);
  max-width: var(--dyss-container-max-width);
  margin: 0 auto;
  padding: 0 var(--dyss-container-padding);
}

/* 고급 영역용 확장 그리드 */
.dyss-container--advanced {
  --dyss-grid-columns: var(--dyss-grid-columns-advanced);
  --dyss-grid-gap: var(--dyss-grid-gap-advanced);
  max-width: 1440px;
}
```

### 2.2 반응형 브레이크포인트 (통일)

```css
/* 🎯 통일된 브레이크포인트 시스템 */
:root {
  --dyss-breakpoint-xs: 480px;
  --dyss-breakpoint-sm: 768px;
  --dyss-breakpoint-md: 1024px;
  --dyss-breakpoint-lg: 1200px;
  --dyss-breakpoint-xl: 1440px;
}

/* 모바일 우선 반응형 */
.dyss-container {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.2rem;
  padding: 0 1.6rem;
}

@media (min-width: 768px) {
  .dyss-container {
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 1.6rem;
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .dyss-container {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1.6rem;
    padding: 0 2rem;
  }
}

@media (min-width: 1200px) {
  .dyss-container--advanced {
    grid-template-columns: repeat(24, minmax(0, 1fr));
    gap: 2rem;
    padding: 0 4rem;
  }
}
```

### 2.3 스페이싱 시스템 (통일)

```css
/* 🎯 8px 기반 통일된 스페이싱 시스템 */
:root {
  /* 기본 스페이스 토큰 */
  --dyss-space-0: 0px;
  --dyss-space-1: 0.4rem;   /* 4px */
  --dyss-space-2: 0.8rem;   /* 8px */
  --dyss-space-3: 1.2rem;   /* 12px */
  --dyss-space-4: 1.6rem;   /* 16px */
  --dyss-space-5: 2.0rem;   /* 20px */
  --dyss-space-6: 2.4rem;   /* 24px */
  --dyss-space-8: 3.2rem;   /* 32px */
  --dyss-space-10: 4.0rem;  /* 40px */
  --dyss-space-12: 4.8rem;  /* 48px */
  --dyss-space-16: 6.4rem;  /* 64px */
  --dyss-space-20: 8.0rem;  /* 80px */
  --dyss-space-24: 9.6rem;  /* 96px */
  --dyss-space-32: 12.8rem; /* 128px */
  
  /* 시맨틱 스페이싱 */
  --dyss-space-xs: var(--dyss-space-2);  /* 8px */
  --dyss-space-sm: var(--dyss-space-3);  /* 12px */
  --dyss-space-md: var(--dyss-space-4);  /* 16px */
  --dyss-space-lg: var(--dyss-space-6);  /* 24px */
  --dyss-space-xl: var(--dyss-space-8);  /* 32px */
  --dyss-space-2xl: var(--dyss-space-12); /* 48px */
  --dyss-space-3xl: var(--dyss-space-16); /* 64px */
}
```

---

## 3. 영역별 디자인 가이드라인

### 3.1 Public 영역 (Home, Pricing, Auth)

#### 디자인 철학: 고급 마케팅 UI + 첫인상 최적화

```css
/* Public 영역 전용 스타일 */
.dyss-public {
  /* 고급 그리드 시스템 적용 */
  --dyss-grid-columns: var(--dyss-grid-columns-advanced);
  
  /* 마케팅 중심 스페이싱 */
  --dyss-section-padding: var(--dyss-space-20);
  --dyss-hero-height: 100vh;
  
  /* 고급 애니메이션 */
  --dyss-transition-hero: 1000ms cubic-bezier(0.19, 1, 0.22, 1);
}

/* Hero 섹션 - Home 페이지 */
.dyss-hero {
  position: relative;
  height: var(--dyss-hero-height);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(135, 92, 255, 0.1) 0%,
    rgba(245, 245, 220, 0.3) 100%
  );
}

.dyss-hero__content {
  text-align: center;
  z-index: 10;
  max-width: 80rem;
  animation: dyss-fade-in-up 1.2s var(--dyss-ease-out-quart);
}

/* Pricing 카드 시스템 */
.dyss-pricing-card {
  background: var(--dyss-color-bg-primary);
  border: 1px solid var(--dyss-color-gray-200);
  border-radius: var(--dyss-radius-xl);
  padding: var(--dyss-space-8);
  box-shadow: var(--dyss-shadow-lg);
  transition: all var(--dyss-transition-slow);
  position: relative;
  overflow: hidden;
}

.dyss-pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--dyss-shadow-2xl);
}

.dyss-pricing-card--featured {
  border-color: var(--dyss-color-primary);
  background: linear-gradient(
    135deg,
    rgba(135, 92, 255, 0.05) 0%,
    rgba(245, 245, 220, 0.1) 100%
  );
}

/* Auth 폼 시스템 */
.dyss-auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--dyss-space-8);
  background: var(--dyss-color-bg-primary);
  border-radius: var(--dyss-radius-xl);
  box-shadow: var(--dyss-shadow-xl);
}
```

### 3.2 Studio 영역 (업로드/분석 허브)

#### 디자인 철학: 창작 도구 + 실시간 피드백

```css
/* Studio 영역 전용 스타일 */
.dyss-studio {
  /* 고급 레이아웃 */
  --dyss-grid-columns: var(--dyss-grid-columns-advanced);
  
  /* 작업 공간 최적화 */
  --dyss-workspace-padding: var(--dyss-space-6);
  --dyss-panel-gap: var(--dyss-space-4);
  
  /* 실시간 피드백 색상 */
  --dyss-status-analyzing: #f59e0b;
  --dyss-status-completed: #10b981;
  --dyss-status-error: #ef4444;
}

/* 업로드 영역 */
.dyss-upload-zone {
  grid-column: span 12;
  min-height: 300px;
  border: 2px dashed var(--dyss-color-gray-300);
  border-radius: var(--dyss-radius-lg);
  background: var(--dyss-color-gray-50);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all var(--dyss-transition-normal);
  cursor: pointer;
  position: relative;
}

.dyss-upload-zone:hover,
.dyss-upload-zone.drag-over {
  border-color: var(--dyss-color-primary);
  background: rgba(135, 92, 255, 0.05);
  transform: translateY(-2px);
}

/* 결과 요약 카드 */
.dyss-result-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dyss-space-4);
  margin-top: var(--dyss-space-6);
}

.dyss-appraisal-card {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: var(--dyss-radius-lg);
  padding: var(--dyss-space-6);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.dyss-explorer-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: var(--dyss-radius-lg);
  padding: var(--dyss-space-6);
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* 미학 점수 시각화 */
.dyss-aesthetic-score {
  font-size: 4.8rem;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, var(--dyss-color-primary) 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 결과 상세 패널 */
.dyss-detail-panel {
  grid-column: span 24;
  background: var(--dyss-color-bg-primary);
  border-radius: var(--dyss-radius-lg);
  padding: var(--dyss-space-8);
  margin-top: var(--dyss-space-6);
  box-shadow: var(--dyss-shadow-md);
}

/* Phase2 권고 패널 */
.dyss-recommendation-panel {
  border-left: 4px solid var(--dyss-color-primary);
  background: rgba(135, 92, 255, 0.05);
  padding: var(--dyss-space-6);
  border-radius: 0 var(--dyss-radius-md) var(--dyss-radius-md) 0;
  margin-top: var(--dyss-space-4);
  position: relative;
}

.dyss-recommendation-panel::before {
  content: 'Phase 2';
  position: absolute;
  top: var(--dyss-space-2);
  right: var(--dyss-space-3);
  background: var(--dyss-color-primary);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: var(--dyss-radius-sm);
  font-size: var(--dyss-font-size-ui-xs);
  font-weight: 600;
}
```

### 3.3 Core App 영역 (Search, Archive, Me)

#### 디자인 철학: 일관된 앱 경험 + 생산성 중심

```css
/* Core App 영역 - 기본 DYSS 디자인 시스템 적용 */
.dyss-core-app {
  /* 표준 12컬럼 그리드 */
  --dyss-grid-columns: 12;
  
  /* 앱 중심 스페이싱 */
  --dyss-app-padding: var(--dyss-space-4);
  --dyss-card-padding: var(--dyss-space-lg);
  
  /* 생산성 중심 색상 */
  --dyss-app-bg: var(--dyss-color-bg-secondary);
  --dyss-sidebar-bg: var(--dyss-color-bg-primary);
}

/* 사이드바 네비게이션 */
.dyss-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: var(--dyss-sidebar-bg);
  border-right: 1px solid var(--dyss-color-gray-200);
  padding: var(--dyss-space-6) var(--dyss-space-4);
  z-index: 100;
}

.dyss-nav-item {
  display: flex;
  align-items: center;
  padding: var(--dyss-space-3) var(--dyss-space-4);
  border-radius: var(--dyss-radius-md);
  color: var(--dyss-color-text-secondary);
  text-decoration: none;
  transition: all var(--dyss-transition-fast);
  margin-bottom: var(--dyss-space-1);
}

.dyss-nav-item:hover,
.dyss-nav-item.active {
  background: rgba(135, 92, 255, 0.1);
  color: var(--dyss-color-primary);
}

/* 메인 콘텐츠 영역 */
.dyss-main-content {
  margin-left: 280px;
  padding: var(--dyss-space-6);
  background: var(--dyss-app-bg);
  min-height: 100vh;
}

/* Archive 대시보드 */
.dyss-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--dyss-space-4);
  margin-bottom: var(--dyss-space-8);
}

.dyss-metric-card {
  background: var(--dyss-color-bg-primary);
  border-radius: var(--dyss-radius-lg);
  padding: var(--dyss-space-6);
  box-shadow: var(--dyss-shadow-sm);
  transition: all var(--dyss-transition-normal);
}

.dyss-metric-card:hover {
  box-shadow: var(--dyss-shadow-md);
  transform: translateY(-2px);
}

/* Search 결과 그리드 */
.dyss-search-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--dyss-space-4);
}

.dyss-search-item {
  background: var(--dyss-color-bg-primary);
  border-radius: var(--dyss-radius-lg);
  overflow: hidden;
  box-shadow: var(--dyss-shadow-sm);
  transition: all var(--dyss-transition-normal);
}

.dyss-search-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--dyss-shadow-lg);
}
```

### 3.4 Settings 영역 (고급 설정)

#### 디자인 철학: 엔터프라이즈 급 설정 UI

```css
/* Settings 영역 - 고급 디자인 시스템 적용 */
.dyss-settings {
  /* 고급 24컬럼 그리드 */
  --dyss-grid-columns: var(--dyss-grid-columns-advanced);
  
  /* 엔터프라이즈 스페이싱 */
  --dyss-settings-padding: var(--dyss-space-8);
  --dyss-section-gap: var(--dyss-space-10);
  
  /* 고급 UI 색상 */
  --dyss-settings-bg: #fafbfc;
  --dyss-panel-bg: var(--dyss-color-bg-primary);
  --dyss-accent-color: var(--dyss-color-primary);
}

/* Settings 레이아웃 */
.dyss-settings-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--dyss-space-8);
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--dyss-settings-padding);
}

.dyss-settings-sidebar {
  background: var(--dyss-panel-bg);
  border-radius: var(--dyss-radius-lg);
  padding: var(--dyss-space-6);
  height: fit-content;
  position: sticky;
  top: var(--dyss-space-6);
  box-shadow: var(--dyss-shadow-sm);
}

.dyss-settings-content {
  background: var(--dyss-panel-bg);
  border-radius: var(--dyss-radius-lg);
  padding: var(--dyss-space-8);
  box-shadow: var(--dyss-shadow-sm);
}

/* DNA Suite 고급 컴포넌트 */
.dyss-dna-suite {
  border: 2px solid var(--dyss-color-primary);
  border-radius: var(--dyss-radius-xl);
  background: linear-gradient(
    135deg,
    rgba(135, 92, 255, 0.05) 0%,
    rgba(245, 245, 220, 0.1) 100%
  );
  padding: var(--dyss-space-8);
  position: relative;
}

.dyss-dna-suite::before {
  content: 'Advanced/Enterprise';
  position: absolute;
  top: -1px;
  right: var(--dyss-space-4);
  background: var(--dyss-color-primary);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 0 0 var(--dyss-radius-md) var(--dyss-radius-md);
  font-size: var(--dyss-font-size-ui-sm);
  font-weight: 600;
}

/* 온톨로지 뷰어 */
.dyss-ontology-viewer {
  background: var(--dyss-color-gray-900);
  border-radius: var(--dyss-radius-lg);
  padding: var(--dyss-space-6);
  color: var(--dyss-color-gray-100);
  font-family: var(--dyss-font-family-mono);
  overflow-x: auto;
}

/* 지식 그래프 */
.dyss-knowledge-graph {
  background: var(--dyss-color-bg-primary);
  border: 1px solid var(--dyss-color-gray-200);
  border-radius: var(--dyss-radius-lg);
  min-height: 400px;
  position: relative;
  overflow: hidden;
}
```

---

## 4. 통합 컬러 & 타이포그래피

### 4.1 통일된 컬러 시스템

```css
/* 🎨 DYSS 통합 컬러 팔레트 */
:root {
  /* Primary Colors - 보라색 계열 (기존 DYSS 유지) */
  --dyss-color-primary: #8B5CF6;
  --dyss-color-primary-50: #F5F3FF;
  --dyss-color-primary-100: #EDE9FE;
  --dyss-color-primary-200: #DDD6FE;
  --dyss-color-primary-300: #C4B5FD;
  --dyss-color-primary-400: #A78BFA;
  --dyss-color-primary-500: #8B5CF6;
  --dyss-color-primary-600: #7C3AED;
  --dyss-color-primary-700: #6D28D9;
  --dyss-color-primary-800: #5B21B6;
  --dyss-color-primary-900: #4C1D95;
  
  /* Secondary Colors - 연한 노란색 계열 (기존 DYSS 유지) */
  --dyss-color-secondary: #F3F5DC;
  --dyss-color-secondary-50: #FEFEF9;
  --dyss-color-secondary-100: #F3F5DC;
  --dyss-color-secondary-200: #E8EBCD;
  --dyss-color-secondary-300: #DDE1BE;
  --dyss-color-secondary-400: #D2D7AF;
  --dyss-color-secondary-500: #C7CDA0;
  
  /* Neutral Colors - 그레이스케일 (통일) */
  --dyss-color-white: #FFFFFF;
  --dyss-color-gray-50: #F9FAFB;
  --dyss-color-gray-100: #F3F4F6;
  --dyss-color-gray-200: #E5E7EB;
  --dyss-color-gray-300: #D1D5DB;
  --dyss-color-gray-400: #9CA3AF;
  --dyss-color-gray-500: #6B7280;
  --dyss-color-gray-600: #4B5563;
  --dyss-color-gray-700: #374151;
  --dyss-color-gray-800: #1F2937;
  --dyss-color-gray-900: #111827;
  --dyss-color-black: #000000;
  
  /* Semantic Colors */
  --dyss-color-success: #10B981;
  --dyss-color-warning: #F59E0B;
  --dyss-color-error: #EF4444;
  --dyss-color-info: #3B82F6;
  
  /* Background Colors */
  --dyss-color-bg-primary: var(--dyss-color-white);
  --dyss-color-bg-secondary: var(--dyss-color-gray-50);
  --dyss-color-bg-tertiary: var(--dyss-color-gray-100);
  
  /* Text Colors */
  --dyss-color-text-primary: var(--dyss-color-gray-900);
  --dyss-color-text-secondary: var(--dyss-color-gray-600);
  --dyss-color-text-tertiary: var(--dyss-color-gray-400);
  --dyss-color-text-inverse: var(--dyss-color-white);
  
  /* Border Colors */
  --dyss-color-border-primary: var(--dyss-color-gray-200);
  --dyss-color-border-secondary: var(--dyss-color-gray-100);
  --dyss-color-border-focus: var(--dyss-color-primary);
}
```

### 4.2 통일된 타이포그래피 시스템

```css
/* 🔤 DYSS 통합 타이포그래피 시스템 */
:root {
  /* Font Families - 기존 DYSS 기준 유지 */
  --dyss-font-family-primary: 
    "NanumSquareRound", "Zen Maru Gothic", 
    -apple-system, BlinkMacSystemFont, 
    "Segoe UI", "Noto Sans KR", sans-serif;
    
  --dyss-font-family-heading: 
    "Zen Maru Gothic", "NanumSquareRound",
    -apple-system, BlinkMacSystemFont, 
    "Segoe UI", sans-serif;
    
  --dyss-font-family-mono: 
    "JetBrains Mono", "Fira Code", 
    "SF Mono", "Monaco", "Consolas", 
    "Ubuntu Mono", monospace;
  
  /* Font Sizes - 기존 DYSS 기준 유지 */
  --dyss-font-size-xs: 0.75rem;    /* 12px */
  --dyss-font-size-sm: 0.875rem;   /* 14px */
  --dyss-font-size-base: 1rem;     /* 16px */
  --dyss-font-size-lg: 1.125rem;   /* 18px */
  --dyss-font-size-xl: 1.25rem;    /* 20px */
  --dyss-font-size-2xl: 1.5rem;    /* 24px */
  --dyss-font-size-3xl: 1.875rem;  /* 30px */
  --dyss-font-size-4xl: 2.25rem;   /* 36px */
  --dyss-font-size-5xl: 3rem;      /* 48px */
  --dyss-font-size-6xl: 3.75rem;   /* 60px */
  --dyss-font-size-7xl: 4.5rem;    /* 72px */
  --dyss-font-size-8xl: 6rem;      /* 96px */
  --dyss-font-size-9xl: 8rem;      /* 128px */
  
  /* Font Weights */
  --dyss-font-weight-light: 300;
  --dyss-font-weight-normal: 400;
  --dyss-font-weight-medium: 500;
  --dyss-font-weight-semibold: 600;
  --dyss-font-weight-bold: 700;
  --dyss-font-weight-extrabold: 800;
  --dyss-font-weight-black: 900;
  
  /* Line Heights */
  --dyss-line-height-none: 1;
  --dyss-line-height-tight: 1.25;
  --dyss-line-height-snug: 1.375;
  --dyss-line-height-normal: 1.5;
  --dyss-line-height-relaxed: 1.625;
  --dyss-line-height-loose: 2;
  
  /* Letter Spacing */
  --dyss-letter-spacing-tighter: -0.05em;
  --dyss-letter-spacing-tight: -0.025em;
  --dyss-letter-spacing-normal: 0em;
  --dyss-letter-spacing-wide: 0.025em;
  --dyss-letter-spacing-wider: 0.05em;
  --dyss-letter-spacing-widest: 0.1em;
}

/* 헤딩 스타일 */
.dyss-h1 {
  font-family: var(--dyss-font-family-heading);
  font-size: var(--dyss-font-size-5xl);
  font-weight: var(--dyss-font-weight-bold);
  line-height: var(--dyss-line-height-tight);
  letter-spacing: var(--dyss-letter-spacing-tight);
  color: var(--dyss-color-text-primary);
  margin-bottom: var(--dyss-space-6);
}

.dyss-h2 {
  font-family: var(--dyss-font-family-heading);
  font-size: var(--dyss-font-size-4xl);
  font-weight: var(--dyss-font-weight-bold);
  line-height: var(--dyss-line-height-tight);
  color: var(--dyss-color-text-primary);
  margin-bottom: var(--dyss-space-5);
}

.dyss-h3 {
  font-family: var(--dyss-font-family-heading);
  font-size: var(--dyss-font-size-3xl);
  font-weight: var(--dyss-font-weight-semibold);
  line-height: var(--dyss-line-height-snug);
  color: var(--dyss-color-text-primary);
  margin-bottom: var(--dyss-space-4);
}

/* 본문 텍스트 */
.dyss-body {
  font-family: var(--dyss-font-family-primary);
  font-size: var(--dyss-font-size-base);
  font-weight: var(--dyss-font-weight-normal);
  line-height: var(--dyss-line-height-relaxed);
  color: var(--dyss-color-text-secondary);
  margin-bottom: var(--dyss-space-4);
}

.dyss-body-large {
  font-size: var(--dyss-font-size-lg);
  line-height: var(--dyss-line-height-relaxed);
}

.dyss-body-small {
  font-size: var(--dyss-font-size-sm);
  line-height: var(--dyss-line-height-normal);
}

/* UI 텍스트 */
.dyss-label {
  font-family: var(--dyss-font-family-primary);
  font-size: var(--dyss-font-size-sm);
  font-weight: var(--dyss-font-weight-medium);
  text-transform: uppercase;
  letter-spacing: var(--dyss-letter-spacing-wide);
  color: var(--dyss-color-primary);
  margin-bottom: var(--dyss-space-2);
}

.dyss-caption {
  font-size: var(--dyss-font-size-xs);
  color: var(--dyss-color-text-tertiary);
  line-height: var(--dyss-line-height-normal);
}
```

---

## 5. 컴포넌트 시스템 아키텍처

### 5.1 버튼 시스템 (통일)

```css
/* 🔘 통합 버튼 시스템 */
.dyss-btn {
  /* 기본 구조 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--dyss-space-3) var(--dyss-space-4);
  font-family: var(--dyss-font-family-primary);
  font-size: var(--dyss-font-size-base);
  font-weight: var(--dyss-font-weight-medium);
  line-height: var(--dyss-line-height-none);
  border-radius: var(--dyss-radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition: all var(--dyss-transition-normal);
  
  /* 포커스 스타일 */
  &:focus-visible {
    outline: 2px solid var(--dyss-color-primary);
    outline-offset: 2px;
  }
}

/* 버튼 변형 */
.dyss-btn--primary {
  background-color: var(--dyss-color-primary);
  color: var(--dyss-color-text-inverse);
  border-color: var(--dyss-color-primary);
  box-shadow: var(--dyss-shadow-sm);
}

.dyss-btn--primary:hover {
  background-color: var(--dyss-color-primary-600);
  border-color: var(--dyss-color-primary-600);
  box-shadow: var(--dyss-shadow-md);
  transform: translateY(-1px);
}

.dyss-btn--secondary {
  background-color: var(--dyss-color-secondary);
  color: var(--dyss-color-text-primary);
  border-color: var(--dyss-color-secondary);
}

.dyss-btn--outline {
  background-color: transparent;
  color: var(--dyss-color-primary);
  border-color: var(--dyss-color-primary);
}

.dyss-btn--outline:hover {
  background-color: var(--dyss-color-primary);
  color: var(--dyss-color-text-inverse);
}

/* 버튼 크기 */
.dyss-btn--small {
  padding: var(--dyss-space-2) var(--dyss-space-3);
  font-size: var(--dyss-font-size-sm);
}

.dyss-btn--large {
  padding: var(--dyss-space-4) var(--dyss-space-6);
  font-size: var(--dyss-font-size-lg);
}

/* 특수 버튼 (Studio용) */
.dyss-btn--cta {
  background: linear-gradient(135deg, var(--dyss-color-primary) 0%, #a78bfa 100%);
  color: var(--dyss-color-text-inverse);
  border: none;
  padding: var(--dyss-space-4) var(--dyss-space-8);
  font-size: var(--dyss-font-size-lg);
  font-weight: var(--dyss-font-weight-semibold);
  border-radius: var(--dyss-radius-xl);
  box-shadow: var(--dyss-shadow-lg);
  position: relative;
  overflow: hidden;
}

.dyss-btn--cta:hover {
  box-shadow: var(--dyss-shadow-xl);
  transform: translateY(-2px);
}

.dyss-btn--cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.dyss-btn--cta:hover::before {
  left: 100%;
}
```

### 5.2 카드 시스템 (통일)

```css
/* 🃏 통합 카드 시스템 */
.dyss-card {
  background: var(--dyss-color-bg-primary);
  border: 1px solid var(--dyss-color-border-primary);
  border-radius: var(--dyss-radius-lg);
  padding: var(--dyss-space-6);
  box-shadow: var(--dyss-shadow-sm);
  transition: all var(--dyss-transition-normal);
  position: relative;
  overflow: hidden;
}

.dyss-card:hover {
  box-shadow: var(--dyss-shadow-md);
  transform: translateY(-2px);
  border-color: var(--dyss-color-border-focus);
}

/* 카드 헤더 */
.dyss-card__header {
  margin-bottom: var(--dyss-space-4);
  padding-bottom: var(--dyss-space-4);
  border-bottom: 1px solid var(--dyss-color-border-secondary);
}

.dyss-card__title {
  font-family: var(--dyss-font-family-heading);
  font-size: var(--dyss-font-size-xl);
  font-weight: var(--dyss-font-weight-semibold);
  color: var(--dyss-color-text-primary);
  margin: 0;
}

.dyss-card__subtitle {
  font-size: var(--dyss-font-size-sm);
  color: var(--dyss-color-text-tertiary);
  margin-top: var(--dyss-space-1);
}

/* 카드 본문 */
.dyss-card__content {
  color: var(--dyss-color-text-secondary);
  line-height: var(--dyss-line-height-relaxed);
}

/* 카드 푸터 */
.dyss-card__footer {
  margin-top: var(--dyss-space-6);
  padding-top: var(--dyss-space-4);
  border-top: 1px solid var(--dyss-color-border-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 특수 카드 변형 */
.dyss-card--elevated {
  box-shadow: var(--dyss-shadow-lg);
  border: none;
}

.dyss-card--interactive {
  cursor: pointer;
  user-select: none;
}

.dyss-card--interactive:hover {
  transform: translateY(-4px);
  box-shadow: var(--dyss-shadow-xl);
}

.dyss-card--featured {
  border: 2px solid var(--dyss-color-primary);
  background: linear-gradient(
    135deg,
    rgba(135, 92, 255, 0.05) 0%,
    rgba(245, 245, 220, 0.1) 100%
  );
}
```

### 5.3 입력 컴포넌트 시스템

```css
/* 📝 통합 입력 컴포넌트 시스템 */
.dyss-input {
  width: 100%;
  padding: var(--dyss-space-3) var(--dyss-space-4);
  font-family: var(--dyss-font-family-primary);
  font-size: var(--dyss-font-size-base);
  line-height: var(--dyss-line-height-normal);
  color: var(--dyss-color-text-primary);
  background: var(--dyss-color-bg-primary);
  border: 1px solid var(--dyss-color-border-primary);
  border-radius: var(--dyss-radius-md);
  transition: all var(--dyss-transition-fast);
}

.dyss-input:focus {
  outline: none;
  border-color: var(--dyss-color-border-focus);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.dyss-input::placeholder {
  color: var(--dyss-color-text-tertiary);
}

.dyss-input:disabled {
  background: var(--dyss-color-bg-tertiary);
  color: var(--dyss-color-text-tertiary);
  cursor: not-allowed;
}

/* 입력 그룹 */
.dyss-input-group {
  position: relative;
}

.dyss-input-group__label {
  display: block;
  margin-bottom: var(--dyss-space-2);
  font-size: var(--dyss-font-size-sm);
  font-weight: var(--dyss-font-weight-medium);
  color: var(--dyss-color-text-primary);
}

.dyss-input-group__helper {
  margin-top: var(--dyss-space-1);
  font-size: var(--dyss-font-size-xs);
  color: var(--dyss-color-text-tertiary);
}

.dyss-input-group__error {
  margin-top: var(--dyss-space-1);
  font-size: var(--dyss-font-size-xs);
  color: var(--dyss-color-error);
}

/* 특수 입력 (Studio용 파일 업로드) */
.dyss-file-input {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.dyss-file-input__input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.dyss-file-input__label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--dyss-space-8);
  border: 2px dashed var(--dyss-color-border-primary);
  border-radius: var(--dyss-radius-lg);
  background: var(--dyss-color-bg-secondary);
  transition: all var(--dyss-transition-normal);
  cursor: pointer;
}

.dyss-file-input:hover .dyss-file-input__label,
.dyss-file-input.drag-over .dyss-file-input__label {
  border-color: var(--dyss-color-primary);
  background: rgba(139, 92, 246, 0.05);
}
```

---

## 6. 인터랙션 & 애니메이션

### 6.1 트랜지션 시스템 (통일)

```css
/* ⚡ 통합 트랜지션 시스템 */
:root {
  /* 기본 트랜지션 */
  --dyss-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --dyss-transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --dyss-transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
  --dyss-transition-slower: 700ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 고급 이징 함수 (Public, Studio, Settings용) */
  --dyss-ease-in-quad: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  --dyss-ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --dyss-ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);
  --dyss-ease-in-cubic: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  --dyss-ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
  --dyss-ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
  --dyss-ease-in-quart: cubic-bezier(0.895, 0.03, 0.685, 0.22);
  --dyss-ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
  --dyss-ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
  --dyss-ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 공통 트랜지션 클래스 */
.dyss-transition {
  transition: all var(--dyss-transition-normal);
}

.dyss-transition-colors {
  transition: color var(--dyss-transition-fast),
              background-color var(--dyss-transition-fast),
              border-color var(--dyss-transition-fast);
}

.dyss-transition-transform {
  transition: transform var(--dyss-transition-normal);
}

.dyss-transition-shadow {
  transition: box-shadow var(--dyss-transition-normal);
}
```

### 6.2 애니메이션 시스템

```css
/* 🎬 키프레임 애니메이션 */
@keyframes dyss-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes dyss-fade-in-up {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes dyss-fade-in-down {
  from { 
    opacity: 0; 
    transform: translateY(-20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes dyss-scale-in {
  from { 
    opacity: 0; 
    transform: scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
}

@keyframes dyss-slide-in-left {
  from { 
    opacity: 0; 
    transform: translateX(-30px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
}

@keyframes dyss-slide-in-right {
  from { 
    opacity: 0; 
    transform: translateX(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
}

@keyframes dyss-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes dyss-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes dyss-bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -8px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

/* 애니메이션 유틸리티 클래스 */
.dyss-animate-fade-in {
  animation: dyss-fade-in 0.6s var(--dyss-ease-out-cubic);
}

.dyss-animate-fade-in-up {
  animation: dyss-fade-in-up 0.8s var(--dyss-ease-out-quart);
}

.dyss-animate-fade-in-down {
  animation: dyss-fade-in-down 0.8s var(--dyss-ease-out-quart);
}

.dyss-animate-scale-in {
  animation: dyss-scale-in 0.6s var(--dyss-ease-out-cubic);
}

.dyss-animate-slide-in-left {
  animation: dyss-slide-in-left 0.8s var(--dyss-ease-out-quart);
}

.dyss-animate-slide-in-right {
  animation: dyss-slide-in-right 0.8s var(--dyss-ease-out-quart);
}

.dyss-animate-pulse {
  animation: dyss-pulse 2s infinite;
}

.dyss-animate-spin {
  animation: dyss-spin 1s linear infinite;
}

.dyss-animate-bounce {
  animation: dyss-bounce 1s infinite;
}

/* 스크롤 기반 애니메이션 */
.dyss-scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s var(--dyss-ease-out-quart);
}

.dyss-scroll-reveal.in-view {
  opacity: 1;
  transform: translateY(0);
}

/* 지연 애니메이션 */
.dyss-animate-delay-100 { animation-delay: 100ms; }
.dyss-animate-delay-200 { animation-delay: 200ms; }
.dyss-animate-delay-300 { animation-delay: 300ms; }
.dyss-animate-delay-500 { animation-delay: 500ms; }
.dyss-animate-delay-700 { animation-delay: 700ms; }
.dyss-animate-delay-1000 { animation-delay: 1000ms; }
```

### 6.3 고급 인터랙션 효과

```css
/* 🎯 고급 호버 & 인터랙션 효과 */

/* 언더라인 애니메이션 */
.dyss-link-animated {
  position: relative;
  display: inline-block;
  color: var(--dyss-color-primary);
  text-decoration: none;
  overflow: hidden;
}

.dyss-link-animated::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--dyss-color-primary);
  transform: translateX(-100%);
  transition: transform 0.6s var(--dyss-ease-out-quart);
}

.dyss-link-animated:hover::before {
  transform: translateX(0);
}

/* 버튼 리플 효과 */
.dyss-btn-ripple {
  position: relative;
  overflow: hidden;
}

.dyss-btn-ripple::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.dyss-btn-ripple:active::before {
  width: 300px;
  height: 300px;
}

/* 카드 틸트 효과 */
.dyss-card-tilt {
  transition: transform 0.3s var(--dyss-ease-out-cubic);
  transform-style: preserve-3d;
}

.dyss-card-tilt:hover {
  transform: perspective(1000px) rotateX(2deg) rotateY(2deg) translateZ(10px);
}

/* 이미지 줌 효과 */
.dyss-image-zoom {
  overflow: hidden;
  border-radius: var(--dyss-radius-lg);
}

.dyss-image-zoom img {
  transition: transform var(--dyss-transition-slower);
  transform-origin: center;
}

.dyss-image-zoom:hover img {
  transform: scale(1.05);
}

/* 로딩 스피너 */
.dyss-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--dyss-color-gray-200);
  border-top: 2px solid var(--dyss-color-primary);
  border-radius: 50%;
  animation: dyss-spin 1s linear infinite;
}

/* 프로그레스 바 */
.dyss-progress {
  width: 100%;
  height: 8px;
  background: var(--dyss-color-gray-200);
  border-radius: var(--dyss-radius-full);
  overflow: hidden;
}

.dyss-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--dyss-color-primary), #a78bfa);
  border-radius: var(--dyss-radius-full);
  transition: width 0.3s var(--dyss-ease-out-cubic);
  transform-origin: left;
}

/* 토글 스위치 */
.dyss-toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  background: var(--dyss-color-gray-300);
  border-radius: var(--dyss-radius-full);
  cursor: pointer;
  transition: background-color var(--dyss-transition-fast);
}

.dyss-toggle::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--dyss-color-white);
  border-radius: 50%;
  transition: transform var(--dyss-transition-normal);
  box-shadow: var(--dyss-shadow-sm);
}

.dyss-toggle.active {
  background: var(--dyss-color-primary);
}

.dyss-toggle.active::before {
  transform: translateX(24px);
}
```

---

## 7. 접근성 & 성능 최적화

### 7.1 접근성 (A11y) 구현

```css
/* ♿ WCAG 2.1 AA 준수 접근성 */

/* 포커스 관리 */
.dyss-focus-visible {
  outline: 2px solid var(--dyss-color-primary);
  outline-offset: 2px;
  border-radius: var(--dyss-radius-sm);
}

/* 키보드 네비게이션 */
.dyss-btn:focus-visible,
.dyss-link:focus-visible,
.dyss-input:focus-visible {
  outline: 2px solid var(--dyss-color-primary);
  outline-offset: 2px;
}

/* 스크린 리더 전용 텍스트 */
.dyss-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.dyss-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* 건너뛰기 링크 */
.dyss-skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--dyss-color-primary);
  color: var(--dyss-color-text-inverse);
  padding: 8px 16px;
  text-decoration: none;
  border-radius: var(--dyss-radius-sm);
  z-index: 10000;
  transition: top 0.3s;
  font-weight: var(--dyss-font-weight-medium);
}

.dyss-skip-link:focus {
  top: 6px;
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  :root {
    --dyss-color-primary: #5A2FC2;
    --dyss-color-text-primary: #000000;
    --dyss-color-text-secondary: #1a1a1a;
    --dyss-color-border-primary: #000000;
    --dyss-color-bg-primary: #FFFFFF;
  }
}

/* 감소된 모션 선호도 지원 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 다크모드 지원 */
@media (prefers-color-scheme: dark) {
  :root {
    --dyss-color-bg-primary: var(--dyss-color-gray-900);
    --dyss-color-bg-secondary: var(--dyss-color-gray-800);
    --dyss-color-bg-tertiary: var(--dyss-color-gray-700);
    --dyss-color-text-primary: var(--dyss-color-gray-100);
    --dyss-color-text-secondary: var(--dyss-color-gray-300);
    --dyss-color-text-tertiary: var(--dyss-color-gray-400);
    --dyss-color-border-primary: var(--dyss-color-gray-700);
    --dyss-color-border-secondary: var(--dyss-color-gray-800);
  }
}

/* 수동 다크모드 토글 */
[data-theme="dark"] {
  --dyss-color-bg-primary: var(--dyss-color-gray-900);
  --dyss-color-bg-secondary: var(--dyss-color-gray-800);
  --dyss-color-text-primary: var(--dyss-color-gray-100);
  --dyss-color-text-secondary: var(--dyss-color-gray-300);
}
```

### 7.2 성능 최적화

```css
/* ⚡ 성능 최적화 */

/* Critical CSS */
.dyss-critical {
  font-family: var(--dyss-font-family-primary);
  font-size: var(--dyss-font-size-base);
  line-height: var(--dyss-line-height-normal);
  color: var(--dyss-color-text-primary);
  background: var(--dyss-color-bg-primary);
}

/* GPU 가속 최적화 */
.dyss-gpu-accelerated {
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.dyss-optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* 레이지 로딩 */
.dyss-lazy-load {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s var(--dyss-ease-out-cubic);
}

.dyss-lazy-load.loaded {
  opacity: 1;
  transform: translateY(0);
}

/* 이미지 최적화 */
.dyss-image-optimized {
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: center;
  loading: lazy;
  decoding: async;
}

/* 폰트 로딩 최적화 */
@font-face {
  font-family: 'NanumSquareRound';
  font-display: swap;
  font-weight: 400;
  font-style: normal;
  src: url('./fonts/NanumSquareRoundR.woff2') format('woff2');
}

@font-face {
  font-family: 'Zen Maru Gothic';
  font-display: swap;
  font-weight: 400;
  font-style: normal;
  src: url('./fonts/ZenMaruGothic-Regular.woff2') format('woff2');
}
```

---

## 8. 구현 가이드

### 8.1 개발 환경 설정

```json
{
  "name": "dyss-design-system",
  "version": "1.0.0",
  "description": "DYSS 통합 마스터 디자인 시스템",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^13.4.0",
    "framer-motion": "^10.12.0",
    "clsx": "^1.2.1",
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^13.4.0",
    "@typescript-eslint/parser": "^5.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0"
  }
}
```

### 8.2 CSS 아키텍처 구조

```
src/styles/
├── globals.css                 # 글로벌 스타일 & CSS 변수
├── components/                 # 컴포넌트별 스타일
│   ├── buttons.css            # 버튼 시스템
│   ├── cards.css              # 카드 시스템
│   ├── forms.css              # 입력 컴포넌트
│   ├── navigation.css         # 네비게이션
│   └── layout.css             # 레이아웃 컴포넌트
├── utilities/                  # 유틸리티 클래스
│   ├── spacing.css            # 스페이싱 유틸리티
│   ├── typography.css         # 타이포그래피 유틸리티
│   ├── colors.css             # 색상 유틸리티
│   └── animations.css         # 애니메이션 유틸리티
├── areas/                      # 영역별 스타일
│   ├── public.css             # Public 영역
│   ├── studio.css             # Studio 영역
│   ├── core-app.css           # Core App 영역
│   └── settings.css           # Settings 영역
└── vendors/                    # 외부 라이브러리 오버라이드
    ├── tailwind-overrides.css
    └── framer-motion-overrides.css
```

### 8.3 React 컴포넌트 구조

```typescript
// src/components/ui/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'cta';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'medium', loading, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'dyss-btn',
          `dyss-btn--${variant}`,
          `dyss-btn--${size}`,
          loading && 'dyss-btn--loading',
          className
        )}
        disabled={loading}
        {...props}
      >
        {loading ? <span className="dyss-spinner" /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 8.4 타입스크립트 타입 정의

```typescript
// src/types/design-system.ts
export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  typography: {
    fontFamily: {
      primary: string;
      heading: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ComponentVariants {
  button: 'primary' | 'secondary' | 'outline' | 'cta';
  card: 'default' | 'elevated' | 'interactive' | 'featured';
  input: 'default' | 'error' | 'success';
}

export interface ComponentSizes {
  button: 'small' | 'medium' | 'large';
  input: 'small' | 'medium' | 'large';
  card: 'compact' | 'default' | 'expanded';
}
```

### 8.5 구현 체크리스트

#### Phase 1: 기초 설정 ✅
- [x] CSS 변수 시스템 구축
- [x] 그리드 & 레이아웃 시스템
- [x] 타이포그래피 시스템
- [x] 컬러 팔레트 정의
- [x] 스페이싱 시스템

#### Phase 2: 컴포넌트 개발 🔄
- [ ] 기본 UI 컴포넌트 (Button, Card, Input)
- [ ] 네비게이션 컴포넌트
- [ ] 폼 컴포넌트
- [ ] 레이아웃 컴포넌트
- [ ] 피드백 컴포넌트 (Toast, Modal, Alert)

#### Phase 3: 영역별 구현 🔄
- [ ] Public 영역 (Home, Pricing, Auth)
- [ ] Studio 영역 (업로드, 분석, 결과)
- [ ] Core App 영역 (Search, Archive, Me)
- [ ] Settings 영역 (고급 설정, DNA Suite)

#### Phase 4: 최적화 & 테스트 ⏳
- [ ] 접근성 테스트 (WCAG 2.1 AA)
- [ ] 성능 최적화
- [ ] 크로스 브라우저 테스트
- [ ] 반응형 테스트
- [ ] 사용성 테스트

#### Phase 5: 문서화 & 배포 ⏳
- [ ] 컴포넌트 문서화 (Storybook)
- [ ] 사용 가이드 작성
- [ ] 디자인 토큰 문서
- [ ] 개발자 가이드
- [ ] 배포 및 버전 관리

---

## 🎯 핵심 원칙 요약

### 📐 일관성 (Consistency)
- **그리드 시스템**: 모든 영역에서 통일된 12/24컬럼 그리드
- **스페이싱**: 8px 기반 일관된 스페이싱 시스템
- **타이포그래피**: 통일된 폰트 패밀리와 크기 스케일

### 🎨 적응성 (Adaptability)
- **영역별 특화**: Public(고급), Studio(창작), Core App(생산성), Settings(엔터프라이즈)
- **반응형**: 모든 디바이스에서 최적화된 경험
- **테마 지원**: 라이트/다크 모드, 고대비 모드

### ⚡ 성능 (Performance)
- **Critical CSS**: 초기 로딩 최적화
- **레이지 로딩**: 이미지 및 컴포넌트 지연 로딩
- **GPU 가속**: 애니메이션 성능 최적화

### ♿ 접근성 (Accessibility)
- **WCAG 2.1 AA**: 웹 접근성 지침 준수
- **키보드 네비게이션**: 완전한 키보드 접근성
- **스크린 리더**: 보조 기술 지원

### 🔧 확장성 (Scalability)
- **모듈화**: 독립적인 컴포넌트 시스템
- **토큰 기반**: 디자인 토큰을 통한 일관성 유지
- **타입 안전성**: TypeScript를 통한 타입 안전성

이 **DYSS 통합 마스터 디자인 아키텍처**는 새로운 사이트맵 구조에 최적화되어 있으며, 각 영역의 특성을 살리면서도 전체적인 일관성을 유지하는 확장 가능한 시스템입니다. 🚀
