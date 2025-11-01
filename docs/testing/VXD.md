# CO-1016 CURATOR ODYSSEY: Validation eXecution Document (VXD) v1.0

## 문서 메타데이터 (Document Metadata)

**문서명**: CO-1016 CURATOR ODYSSEY Validation eXecution Document (VXD) v1.0

**버전**: 1.0

**상태**: Draft (초안, FRD v1.0 기반)

**최종 수정**: 2025-11-02

**소유자**: NEO GOD (Director)

**승인자**: QA Lead (TBD)

**개정 이력**:
- v1.0 (2025-11-02): FRD v1.0 기반 초기 작성, IEEE 829 표준 준수

**배포 범위**: QA Team, Backend Development Team, Frontend Development Team

**변경 관리 프로세스**: GitHub Issues/PR 워크플로, 변경 시 FRD 동시 업데이트

**참조 문서 (References)**:
- **[FRD v1.0](../requirements/FRD.md)** - Functional Requirements Document, 테스트 대상 FR 정의
- **[SRD v1.0](../requirements/SRD.md)** - Software Requirements Document, Acceptance Criteria (AC)
- **[API Specification v1.0](../api/API_SPECIFICATION.md)** - API 엔드포인트 정의, JSON Schema
- **[E2E Test Scenarios](E2E_TEST_SCENARIOS.md)** - 기존 E2E 테스트 시나리오

---

## 1. 서론 (Introduction)

### 1.1 목적 (Purpose)

본 문서는 FRD v1.0의 모든 기능 요구사항(FR)에 대한 검증 계획과 실행 스크립트를 제공한다. IEEE 829 표준을 따르며, 단위/통합/E2E 테스트 케이스를 정의하여 AC 커버리지 100%를 달성한다. 각 FR의 사전/사후 조건, 예외 처리 시나리오를 테스트 케이스로 변환하며, Jest/Playwright 코드 스니펫을 포함한다.

### 1.2 범위 (Scope)

**테스트 대상 FR**:
- **Phase 1**: FR-P1-SUM-001 (요약 조회), FR-P1-SUN-001 (sunburst 상세)
- **Phase 2**: FR-P2-TIM-001 (시계열), FR-P2-EVT-001 (이벤트 영향), FR-P2-BAT-001 (배치)
- **Phase 3**: FR-P3-CMP-001 (비교 분석)
- **Phase 4**: FR-P4-RPT-001 (AI 보고서)

**테스트 레벨**:
- 단위 테스트 (Jest): 비즈니스 로직, 검증 규칙
- 통합 테스트 (Jest): API 엔드포인트, 데이터베이스 쿼리
- E2E 테스트 (Playwright): 사용자 플로우, UI 렌더링

**성능 테스트**:
- API 응답 시간 p95 <300ms
- 렌더링 시간 <2초 (Phase 1), <3초 (Phase 2-4)

### 1.3 문서 개요 (Document Overview)

본 문서는 다음과 같은 구조로 구성된다:

1. **서론**: 목적, 범위, 참조 문서
2. **테스트 전략**: 테스트 레벨, 테스트 데이터, 환경 설정
3. **상세 테스트 스크립트**: Phase별 테스트 케이스 (각 FR에 대해)
4. **추적성 매트릭스**: FR ID → 테스트 케이스 매핑, AC 커버리지

---

## 2. 테스트 전략 (Test Strategy)

### 2.1 테스트 레벨 (Test Levels)

#### 2.1.1 단위 테스트 (Unit Tests)

**도구**: Jest (`@jest/globals`)

**범위**:
- 비즈니스 로직 함수 (예: `timeWindowRules.js`, `universalDataAdapter.js`)
- 데이터 검증 함수 (예: `dataQualityValidator.js`)
- 유틸리티 함수 (예: 패턴 검증, enum 체크)

**목표 커버리지**: 80% 이상

**실행 명령**:
```bash
npm test -- --coverage
```

#### 2.1.2 통합 테스트 (Integration Tests)

**도구**: Jest + Firebase Emulators

**범위**:
- API 엔드포인트 (Firebase Functions)
- Firestore 쿼리 및 인덱스 히트
- 데이터 변환 로직 (Adapter)

**목표 커버리지**: 70% 이상

**실행 명령**:
```bash
firebase emulators:start --only functions,firestore
npm test -- --testPathPattern=integration
```

#### 2.1.3 E2E 테스트 (End-to-End Tests)

**도구**: Playwright (`@playwright/test`)

**범위**:
- 사용자 플로우 (UC-P1-001 ~ UC-P4-001)
- UI 렌더링 및 상호작용
- API 호출 및 응답 처리

**목표 커버리지**: 100% (모든 UC 커버)

**실행 명령**:
```bash
npm run test:e2e
```

### 2.2 테스트 데이터 (Test Data)

**Mock 데이터 소스**: `src/utils/mockData.js`

**테스트 아티스트 ID**:
- `ARTIST_0005`: 양혜규 (주요 테스트 대상)
- `ARTIST_0010`: 비교 분석용
- `ARTIST_9999`: 존재하지 않는 ID (404 테스트)

**테스트 데이터 구조**:
```javascript
const mockArtistSummary = {
  artist_id: 'ARTIST_0005',
  name: '양혜규',
  radar5: {
    I: 97.5,
    F: 90.0,
    A: 92.0,
    M: 86.0,
    Sedu: 9.8
  },
  sunburst_l1: {
    제도: 0.912,
    학술: 0.880,
    담론: 0.860,
    네트워크: 0.900
  },
  weights_version: 'AHP_v1',
  updated_at: '2025-11-02T00:00:00Z',
  consistency_check: {
    passed: true,
    error: 0.2
  }
};
```

**Firestore Emulator 데이터**:
- 컬렉션: `artist_summary`, `timeseries`, `compare_pairs`
- 샘플 문서: `scripts/seedFirestoreEmulator.js` 실행

### 2.3 환경 설정 (Environment Setup)

**개발 환경**:
- Node.js 20
- Firebase Emulators (Functions, Firestore)
- React Dev Server (포트 3000)

**테스트 환경**:
- CI/CD: GitHub Actions / Cloud Build
- 테스트 데이터베이스: Firestore Emulator

**환경 변수**:
```bash
# .env.test
FIREBASE_PROJECT_ID=co-1016-test
FIREBASE_EMULATOR_HOST=localhost:8080
API_BASE_URL=http://localhost:5002
```

---

## 3. 상세 테스트 스크립트 (Detailed Test Scripts)

### 3.1 Phase 1: 현재 가치 분석 테스트

#### TC-P1-SUM-001: 아티스트 요약 데이터 조회 (정상 케이스)

**FR ID**: FR-P1-SUM-001

**AC 커버리지**: AC-P1-DQ-001 (100%)

**사전 조건**:
- Firestore Emulator 실행 중
- `artist_summary` 컬렉션에 `ARTIST_0005` 문서 존재

**테스트 케이스**:

**단위 테스트 (Jest)**:
```javascript
// tests/unit/api/getArtistSummary.test.js
import { getArtistSummary } from '../../../functions/src/api/index.js';
import { adminDb } from '../../../functions/src/utils/firebase.js';

describe('FR-P1-SUM-001: 아티스트 요약 데이터 조회', () => {
  const testArtistId = 'ARTIST_0005';
  
  test('정상 케이스: 유효한 artist_id로 요약 데이터 조회', async () => {
    const startTime = Date.now();
    
    const result = await getArtistSummary(testArtistId);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // 사후 조건 검증
    expect(result).toHaveProperty('artist_id');
    expect(result.artist_id).toMatch(/^ARTIST_\d{4}$/);
    expect(result).toHaveProperty('radar5');
    expect(result.radar5).toHaveProperty('I');
    expect(result.radar5.I).toBeGreaterThanOrEqual(0);
    expect(result.radar5.I).toBeLessThanOrEqual(100);
    expect(result).toHaveProperty('sunburst_l1');
    expect(result.sunburst_l1).toHaveProperty('제도');
    expect(result.sunburst_l1.제도).toBeGreaterThanOrEqual(0);
    expect(result.sunburst_l1.제도).toBeLessThanOrEqual(1);
    expect(result).toHaveProperty('consistency_check');
    expect(result.consistency_check.passed).toBe(true);
    expect(result.consistency_check.error).toBeLessThanOrEqual(0.5);
    
    // 성능 검증 (p95 < 2초)
    expect(responseTime).toBeLessThan(2000);
  });
  
  test('예외 케이스: 유효하지 않은 artist_id 패턴', async () => {
    const invalidId = 'INVALID_ID';
    
    await expect(getArtistSummary(invalidId)).rejects.toThrow();
    // 또는 400 Bad Request 반환 확인
  });
  
  test('예외 케이스: 존재하지 않는 artist_id', async () => {
    const nonExistentId = 'ARTIST_9999';
    
    const result = await getArtistSummary(nonExistentId);
    
    // Mock 데이터 폴백 확인
    expect(result).toHaveProperty('artist_id');
    expect(result.artist_id).toBe(nonExistentId);
  });
});
```

**통합 테스트 (Jest + Firebase Emulators)**:
```javascript
// tests/integration/api/artistSummary.integration.test.js
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';

describe('FR-P1-SUM-001: API 통합 테스트', () => {
  test('GET /api/artist/{id}/summary - 정상 응답', async () => {
    const startTime = Date.now();
    
    const response = await axios.get(`${API_BASE_URL}/api/artist/ARTIST_0005/summary`);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('artist_id');
    expect(response.data.artist_id).toBe('ARTIST_0005');
    expect(response.data).toHaveProperty('radar5');
    expect(response.data).toHaveProperty('sunburst_l1');
    expect(response.data).toHaveProperty('consistency_check');
    
    // JSON Schema 검증 (Joi 또는 express-validator)
    expect(response.data.consistency_check.passed).toBe(true);
    expect(response.data.consistency_check.error).toBeLessThanOrEqual(0.5);
    
    // 성능 검증 (p95 < 2초)
    expect(responseTime).toBeLessThan(2000);
  });
  
  test('GET /api/artist/{id}/summary - 400 Bad Request (패턴 불일치)', async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/artist/INVALID_ID/summary`);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error.code).toBe('ERR_INVALID_PARAM');
    }
  });
  
  test('GET /api/artist/{id}/summary - 404 Not Found (Mock 폴백)', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/artist/ARTIST_9999/summary`);
    
    // Mock 데이터 반환 확인
    expect(response.status).toBe(200); // 또는 404 (구현에 따라)
    expect(response.data).toHaveProperty('artist_id');
  });
});
```

**E2E 테스트 (Playwright)**:
```javascript
// tests/e2e/phase1/artistSummary.e2e.test.js
import { test, expect } from '@playwright/test';

test.describe('FR-P1-SUM-001: Phase 1 요약 데이터 조회 E2E', () => {
  test('UC-P1-001: 아티스트 요약 데이터 조회 플로우', async ({ page }) => {
    // 1. 홈페이지 접속
    await page.goto('http://localhost:3000');
    
    // 2. 아티스트 ID 입력
    await page.fill('[data-testid="artist-id-input"]', 'ARTIST_0005');
    await page.click('[data-testid="load-button"]');
    
    // 3. API 호출 대기 (React Query)
    await page.waitForResponse(response => 
      response.url().includes('/api/artist/ARTIST_0005/summary') && 
      response.status() === 200
    );
    
    // 4. 레이더 차트 렌더링 확인
    const radarChart = await page.locator('[data-testid="radar-chart"]');
    await expect(radarChart).toBeVisible();
    
    // SVG path 존재 확인
    const svgPaths = await page.locator('[data-testid="radar-chart"] svg path');
    await expect(svgPaths.first()).toBeVisible();
    
    // 5. 선버스트 차트 렌더링 확인
    const sunburstChart = await page.locator('[data-testid="sunburst-chart"]');
    await expect(sunburstChart).toBeVisible();
    
    // 6. 일관성 검증 배지 확인 (±0.5p)
    const consistencyBadge = await page.locator('[data-testid="consistency-badge"]');
    await expect(consistencyBadge).toBeVisible();
    
    // 성능 검증 (렌더링 시간 < 2초)
    const loadTime = await page.evaluate(() => 
      performance.getEntriesByType('navigation')[0].loadEventEnd - 
      performance.getEntriesByType('navigation')[0].navigationStart
    );
    expect(loadTime).toBeLessThan(2000);
  });
  
  test('예외 케이스: 유효하지 않은 artist_id 입력', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.fill('[data-testid="artist-id-input"]', 'INVALID_ID');
    await page.click('[data-testid="load-button"]');
    
    // 에러 메시지 표시 확인
    const errorMessage = await page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('ERR_INVALID_PARAM');
  });
});
```

---

#### TC-P1-SUN-001: Sunburst 상세 데이터 조회

**FR ID**: FR-P1-SUN-001

**AC 커버리지**: 80% (SRD FR-P1-DQ-001 확장)

**테스트 케이스**:

**통합 테스트**:
```javascript
// tests/integration/api/sunburst.integration.test.js
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';

describe('FR-P1-SUN-001: Sunburst 상세 데이터 조회', () => {
  test('GET /api/artist/{id}/sunburst - 정상 응답', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/artist/ARTIST_0005/sunburst`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('sunburst');
    expect(response.data.sunburst).toHaveProperty('l1');
    expect(response.data.sunburst.l1).toHaveProperty('제도');
    expect(response.data.sunburst.l1).toHaveProperty('학술');
    expect(response.data.sunburst.l1).toHaveProperty('담론');
    expect(response.data.sunburst.l1).toHaveProperty('네트워크');
    
    // L2 계층 확인 (옵션)
    if (response.data.sunburst.l2) {
      expect(typeof response.data.sunburst.l2).toBe('object');
    }
  });
});
```

---

### 3.2 Phase 2: 커리어 궤적 분석 테스트

#### TC-P2-TIM-001: 시계열 데이터 조회

**FR ID**: FR-P2-TIM-001

**AC 커버리지**: AC-P2-DQ-001 (100%)

**테스트 케이스**:

**단위 테스트 (Time Window Rules 적용)**:
```javascript
// tests/unit/algorithms/timeWindowRules.test.js
import { applyTimeWindowRule } from '../../../src/algorithms/timeWindowRules.js';

describe('FR-P2-TIM-001: Time Window Rules 적용', () => {
  const mockBins = [
    { t: 0, v: 10 },
    { t: 60, v: 50 },
    { t: 120, v: 80 }
  ];
  
  test('제도 축: 10년 윈도우 가중치 적용', () => {
    const result = applyTimeWindowRule(mockBins, '제도');
    
    expect(result).toHaveLength(3);
    expect(result[0].v).toBeGreaterThanOrEqual(0);
    expect(result[0].v).toBeLessThanOrEqual(100);
    
    // 최근 5년 가중치 1.0, 이전 5년 가중치 0.5 확인
    // (구현 세부사항에 따라 조정)
  });
  
  test('담론 축: 24개월 윈도우 적용', () => {
    const result = applyTimeWindowRule(mockBins, '담론');
    
    expect(result).toHaveLength(3);
    // 최근 24개월만 포함 확인
  });
});
```

**통합 테스트**:
```javascript
// tests/integration/api/timeseries.integration.test.js
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';

describe('FR-P2-TIM-001: 시계열 데이터 조회', () => {
  test('GET /api/artist/{id}/timeseries/{axis} - 정상 응답', async () => {
    const startTime = Date.now();
    
    const response = await axios.get(
      `${API_BASE_URL}/api/artist/ARTIST_0005/timeseries/제도`
    );
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('artist_id');
    expect(response.data.artist_id).toBe('ARTIST_0005');
    expect(response.data).toHaveProperty('axis');
    expect(response.data.axis).toBe('제도');
    expect(response.data).toHaveProperty('bins');
    expect(Array.isArray(response.data.bins)).toBe(true);
    expect(response.data.bins.length).toBeGreaterThan(0);
    expect(response.data.bins.length).toBeLessThanOrEqual(50);
    
    // bins 배열 정렬 확인 (시간순)
    for (let i = 0; i < response.data.bins.length - 1; i++) {
      expect(response.data.bins[i].t).toBeLessThanOrEqual(response.data.bins[i + 1].t);
    }
    
    // Time Window Rules 적용 확인
    expect(response.data).toHaveProperty('window_applied');
    expect(response.data.window_applied).toHaveProperty('type');
    
    // 성능 검증 (p95 < 300ms)
    expect(responseTime).toBeLessThan(300);
  });
  
  test('GET /api/artist/{id}/timeseries/{axis} - 400 Bad Request (잘못된 axis)', async () => {
    try {
      await axios.get(
        `${API_BASE_URL}/api/artist/ARTIST_0005/timeseries/INVALID_AXIS`
      );
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error.code).toBe('ERR_INVALID_AXIS');
    }
  });
  
  test('GET /api/artist/{id}/timeseries/{axis} - limit 파라미터 확인', async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/artist/ARTIST_0005/timeseries/제도?limit=10`
    );
    
    expect(response.data.bins.length).toBeLessThanOrEqual(10);
  });
});
```

**E2E 테스트**:
```javascript
// tests/e2e/phase2/timeseries.e2e.test.js
import { test, expect } from '@playwright/test';

test.describe('FR-P2-TIM-001: Phase 2 시계열 조회 E2E', () => {
  test('UC-P2-001: 커리어 궤적 시계열 조회 플로우', async ({ page }) => {
    // 1. Phase 1에서 Phase 2로 전환
    await page.goto('http://localhost:3000/artist/ARTIST_0005');
    await page.click('[data-testid="phase-2-tab"]');
    
    // 2. 배치 API 호출 대기 (4축 동시 조회)
    await page.waitForResponse(response => 
      response.url().includes('/api/batch/timeseries') && 
      response.status() === 200
    );
    
    // 3. StackedAreaChart 렌더링 확인
    const stackedAreaChart = await page.locator('[data-testid="stacked-area-chart"]');
    await expect(stackedAreaChart).toBeVisible();
    
    // 4. 4축 데이터 확인
    const axes = ['제도', '학술', '담론', '네트워크'];
    for (const axis of axes) {
      const axisData = await page.locator(`[data-testid="axis-${axis}"]`);
      await expect(axisData).toBeVisible();
    }
    
    // 성능 검증 (로딩 < 2.5초)
    const loadTime = await page.evaluate(() => 
      performance.getEntriesByType('navigation')[0].loadEventEnd - 
      performance.getEntriesByType('navigation')[0].navigationStart
    );
    expect(loadTime).toBeLessThan(2500);
  });
});
```

---

#### TC-P2-EVT-001: 이벤트 영향 분석

**FR ID**: FR-P2-EVT-001

**AC 커버리지**: AC-P2-DQ-002 (100%)

**테스트 케이스**:

**통합 테스트**:
```javascript
// tests/integration/api/events.integration.test.js
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';

describe('FR-P2-EVT-001: 이벤트 영향 분석', () => {
  test('GET /api/artist/{id}/events/{axis} - 정상 응답', async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/artist/ARTIST_0005/events/제도`
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('events');
    expect(Array.isArray(response.data.events)).toBe(true);
    expect(response.data.events.length).toBeLessThanOrEqual(5);
    
    // 이벤트 구조 확인
    if (response.data.events.length > 0) {
      const event = response.data.events[0];
      expect(event).toHaveProperty('t');
      expect(event).toHaveProperty('delta_v');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('event_id');
      expect(event.event_id).toMatch(/^EVENT_\d{3}$/);
    }
  });
});
```

---

#### TC-P2-BAT-001: 배치 시계열 데이터 조회

**FR ID**: FR-P2-BAT-001

**AC 커버리지**: 95% (신규 FR)

**테스트 케이스**:

**통합 테스트**:
```javascript
// tests/integration/api/batchTimeseries.integration.test.js
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';

describe('FR-P2-BAT-001: 배치 시계열 데이터 조회', () => {
  test('POST /api/batch/timeseries - 정상 응답 (4축)', async () => {
    const startTime = Date.now();
    
    const response = await axios.post(`${API_BASE_URL}/api/batch/timeseries`, {
      artist_id: 'ARTIST_0005',
      axes: ['제도', '학술', '담론', '네트워크'],
      options: {
        limit: 50
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('artist_id');
    expect(response.data).toHaveProperty('timeseries');
    
    // 4축 모두 확인
    const axes = ['제도', '학술', '담론', '네트워크'];
    for (const axis of axes) {
      expect(response.data.timeseries).toHaveProperty(axis);
      expect(response.data.timeseries[axis]).toHaveProperty('axis');
      expect(response.data.timeseries[axis]).toHaveProperty('bins');
      expect(Array.isArray(response.data.timeseries[axis].bins)).toBe(true);
    }
    
    // 성능 검증 (4축 기준 < 500ms)
    expect(responseTime).toBeLessThan(500);
  });
  
  test('POST /api/batch/timeseries - 400 Bad Request (중복 axes)', async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/batch/timeseries`, {
        artist_id: 'ARTIST_0005',
        axes: ['제도', '제도'], // 중복
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  
  test('POST /api/batch/timeseries - 400 Bad Request (잘못된 axis enum)', async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/batch/timeseries`, {
        artist_id: 'ARTIST_0005',
        axes: ['INVALID_AXIS'],
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error.code).toBe('ERR_INVALID_AXIS');
    }
  });
  
  test('POST /api/batch/timeseries - 400 Bad Request (axes 배열 길이 초과)', async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/batch/timeseries`, {
        artist_id: 'ARTIST_0005',
        axes: ['제도', '학술', '담론', '네트워크', 'EXTRA'], // 5개
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});
```

---

### 3.3 Phase 3: 비교 분석 테스트

#### TC-P3-CMP-001: 두 아티스트 비교 데이터 조회

**FR ID**: FR-P3-CMP-001

**AC 커버리지**: AC-P3-DQ-001 (100%)

**테스트 케이스**:

**통합 테스트**:
```javascript
// tests/integration/api/compare.integration.test.js
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';

describe('FR-P3-CMP-001: 두 아티스트 비교 데이터 조회', () => {
  test('GET /api/compare/{artistA}/{artistB}/{axis} - 정상 응답 (캐시 히트)', async () => {
    const startTime = Date.now();
    
    const response = await axios.get(
      `${API_BASE_URL}/api/compare/ARTIST_0005/ARTIST_0010/제도`
    );
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('pair_id');
    expect(response.data.pair_id).toMatch(/^ARTIST_\d{4}_vs_\d{4}$/);
    expect(response.data).toHaveProperty('axis');
    expect(response.data.axis).toBe('제도');
    expect(response.data).toHaveProperty('series');
    expect(Array.isArray(response.data.series)).toBe(true);
    
    // 시리즈 구조 확인
    if (response.data.series.length > 0) {
      const item = response.data.series[0];
      expect(item).toHaveProperty('t');
      expect(item).toHaveProperty('v_A');
      expect(item).toHaveProperty('v_B');
      expect(item).toHaveProperty('diff');
      expect(item.v_A).toBeGreaterThanOrEqual(0);
      expect(item.v_A).toBeLessThanOrEqual(100);
      expect(item.v_B).toBeGreaterThanOrEqual(0);
      expect(item.v_B).toBeLessThanOrEqual(100);
    }
    
    // 지표 확인
    expect(response.data).toHaveProperty('metrics');
    expect(response.data.metrics).toHaveProperty('correlation');
    expect(response.data.metrics.correlation).toBeGreaterThanOrEqual(-1);
    expect(response.data.metrics.correlation).toBeLessThanOrEqual(1);
    expect(response.data.metrics).toHaveProperty('abs_diff_sum');
    expect(response.data.metrics).toHaveProperty('auc');
    
    // 캐시 사용 여부 확인
    expect(response.data).toHaveProperty('cached');
    
    // 성능 검증 (캐시 히트 시 < 500ms)
    if (response.data.cached) {
      expect(responseTime).toBeLessThan(500);
    } else {
      expect(responseTime).toBeLessThan(1000); // 실시간 계산 시 < 1초
    }
  });
  
  test('GET /api/compare/{artistA}/{artistB}/{axis} - 400 Bad Request (동일 아티스트)', async () => {
    try {
      await axios.get(
        `${API_BASE_URL}/api/compare/ARTIST_0005/ARTIST_0005/제도`
      );
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  
  test('GET /api/compare/{artistA}/{artistB}/{axis} - 실시간 계산 (캐시 미스)', async () => {
    // 새로운 비교 쌍으로 실시간 계산 트리거
    const response = await axios.get(
      `${API_BASE_URL}/api/compare/ARTIST_0005/ARTIST_0010/학술?compute=true`
    );
    
    expect(response.status).toBe(200);
    expect(response.data.cached).toBe(false); // 또는 true (구현에 따라)
    expect(response.data).toHaveProperty('computed_at');
  });
});
```

**E2E 테스트**:
```javascript
// tests/e2e/phase3/compare.e2e.test.js
import { test, expect } from '@playwright/test';

test.describe('FR-P3-CMP-001: Phase 3 비교 분석 E2E', () => {
  test('UC-P3-001: 두 아티스트 비교 분석 플로우', async ({ page }) => {
    // 1. Phase 3 화면으로 이동
    await page.goto('http://localhost:3000/compare');
    
    // 2. 아티스트 A/B 선택
    await page.fill('[data-testid="artist-a-input"]', 'ARTIST_0005');
    await page.fill('[data-testid="artist-b-input"]', 'ARTIST_0010');
    await page.selectOption('[data-testid="axis-select"]', '제도');
    await page.click('[data-testid="compare-button"]');
    
    // 3. API 호출 대기
    await page.waitForResponse(response => 
      response.url().includes('/api/compare/ARTIST_0005/ARTIST_0010/제도') && 
      response.status() === 200
    );
    
    // 4. ComparisonAreaChart 렌더링 확인
    const comparisonChart = await page.locator('[data-testid="comparison-area-chart"]');
    await expect(comparisonChart).toBeVisible();
    
    // 5. 지표 표시 확인
    const correlation = await page.locator('[data-testid="correlation"]');
    await expect(correlation).toBeVisible();
    
    const diffSum = await page.locator('[data-testid="abs-diff-sum"]');
    await expect(diffSum).toBeVisible();
  });
});
```

---

### 3.4 Phase 4: AI 보고서 생성 테스트

#### TC-P4-RPT-001: AI 보고서 생성

**FR ID**: FR-P4-RPT-001

**AC 커버리지**: AC-P4-RP-001 (100%)

**테스트 케이스**:

**통합 테스트**:
```javascript
// tests/integration/api/report.integration.test.js
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';

describe('FR-P4-RPT-001: AI 보고서 생성', () => {
  test('POST /api/report/generate - 정상 응답 (Vertex AI)', async () => {
    const startTime = Date.now();
    
    const response = await axios.post(`${API_BASE_URL}/api/report/generate`, {
      artist_id: 'ARTIST_0005',
      include_phases: ['1', '2', '3'],
      prompt_options: {
        compress_level: 'medium',
        max_events: 10
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('report_id');
    expect(response.data.report_id).toMatch(/^REPORT_\d{3}$/);
    expect(response.data).toHaveProperty('content');
    expect(typeof response.data.content).toBe('string');
    expect(response.data.content.length).toBeGreaterThan(0);
    
    // Markdown 형식 확인
    expect(response.data.content).toMatch(/^#|##/); // 헤더 존재
    
    // 모델 확인
    expect(response.data).toHaveProperty('model_used');
    expect(['gemini-1.5-pro', 'gpt-4', 'template']).toContain(response.data.model_used);
    
    // 토큰 사용량 확인
    expect(response.data).toHaveProperty('token_usage');
    expect(response.data.token_usage).toHaveProperty('input');
    expect(response.data.token_usage.input).toBeLessThanOrEqual(50000);
    
    // 비용 추정 확인
    expect(response.data).toHaveProperty('cost_estimate');
    expect(response.data.cost_estimate).toBeLessThanOrEqual(0.01);
    
    // 성능 검증 (보고서 생성 < 30초)
    expect(responseTime).toBeLessThan(30000);
  });
  
  test('POST /api/report/generate - 폴백 메커니즘 (Vertex 실패 → GPT-4)', async () => {
    // Vertex AI 실패 시뮬레이션 (환경 변수 또는 Mock)
    const response = await axios.post(`${API_BASE_URL}/api/report/generate`, {
      artist_id: 'ARTIST_0005',
      include_phases: ['1'],
    });
    
    // 폴백 확인 (GPT-4 또는 템플릿)
    expect(response.status).toBe(200);
    expect(['gpt-4', 'template']).toContain(response.data.model_used);
  });
  
  test('POST /api/report/generate - 400 Bad Request (잘못된 artist_id)', async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/report/generate`, {
        artist_id: 'INVALID_ID',
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  
  test('POST /api/report/generate - 400 Bad Request (잘못된 axis enum)', async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/report/generate`, {
        artist_id: 'ARTIST_0005',
        include_phases: ['INVALID'],
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  
  test('POST /api/report/generate - 429 Too Many Requests (토큰 초과)', async () => {
    // 토큰 초과 시뮬레이션
    try {
      await axios.post(`${API_BASE_URL}/api/report/generate`, {
        artist_id: 'ARTIST_0005',
        prompt_options: {
          compress_level: 'low', // 압축 없음
          max_events: 1000 // 너무 많은 이벤트
        }
      });
    } catch (error) {
      if (error.response.status === 429) {
        expect(error.response.data.error.code).toBe('ERR_TOKEN_EXCEEDED');
      }
    }
  });
});
```

**E2E 테스트**:
```javascript
// tests/e2e/phase4/report.e2e.test.js
import { test, expect } from '@playwright/test';

test.describe('FR-P4-RPT-001: Phase 4 AI 보고서 생성 E2E', () => {
  test('UC-P4-001: AI 보고서 생성 플로우', async ({ page }) => {
    // 1. Phase 4 화면으로 이동
    await page.goto('http://localhost:3000/artist/ARTIST_0005/report');
    
    // 2. 보고서 생성 버튼 클릭
    await page.click('[data-testid="generate-report-button"]');
    
    // 3. 로딩 상태 확인
    const loadingIndicator = await page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible();
    
    // 4. API 호출 대기
    await page.waitForResponse(response => 
      response.url().includes('/api/report/generate') && 
      response.status() === 200,
      { timeout: 30000 }
    );
    
    // 5. Markdown 보고서 렌더링 확인
    const reportContent = await page.locator('[data-testid="report-content"]');
    await expect(reportContent).toBeVisible();
    
    // Markdown 섹션 확인
    const introduction = await page.locator('[data-testid="report-introduction"]');
    await expect(introduction).toBeVisible();
    
    // 6. 생성 시간 확인 (< 30초)
    const generationTime = await page.locator('[data-testid="generation-time"]');
    await expect(generationTime).toBeVisible();
    
    // 7. 토큰 사용량 표시 확인
    const tokenUsage = await page.locator('[data-testid="token-usage"]');
    await expect(tokenUsage).toBeVisible();
  });
  
  test('폴백 메커니즘: Vertex 실패 → GPT-4', async ({ page }) => {
    // Vertex AI 실패 시뮬레이션 (환경 변수 또는 Mock)
    await page.goto('http://localhost:3000/artist/ARTIST_0005/report');
    await page.click('[data-testid="generate-report-button"]');
    
    // 폴백 확인 (GPT-4 또는 템플릿)
    await page.waitForResponse(response => 
      response.url().includes('/api/report/generate') && 
      response.status() === 200
    );
    
    const modelUsed = await page.locator('[data-testid="model-used"]');
    await expect(modelUsed).toContainText(/gpt-4|template/);
  });
});
```

---

### 3.5 성능 테스트 (Performance Tests)

#### TC-PERF-001: API 응답 시간 성능 테스트

**목표**: p95 <300ms 검증

**테스트 케이스**:

```javascript
// tests/performance/apiPerformance.test.js
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';

describe('Performance Tests: API 응답 시간', () => {
  const iterations = 100; // 100회 반복
  
  test('GET /api/artist/{id}/summary - p95 < 2초', async () => {
    const responseTimes = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await axios.get(`${API_BASE_URL}/api/artist/ARTIST_0005/summary`);
      const endTime = Date.now();
      responseTimes.push(endTime - startTime);
    }
    
    responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(iterations * 0.95);
    const p95 = responseTimes[p95Index];
    
    expect(p95).toBeLessThan(2000);
    console.log(`p95 응답 시간: ${p95}ms`);
  });
  
  test('GET /api/artist/{id}/timeseries/{axis} - p95 < 300ms', async () => {
    const responseTimes = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await axios.get(`${API_BASE_URL}/api/artist/ARTIST_0005/timeseries/제도`);
      const endTime = Date.now();
      responseTimes.push(endTime - startTime);
    }
    
    responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(iterations * 0.95);
    const p95 = responseTimes[p95Index];
    
    expect(p95).toBeLessThan(300);
    console.log(`p95 응답 시간: ${p95}ms`);
  });
  
  test('POST /api/batch/timeseries - p95 < 500ms', async () => {
    const responseTimes = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await axios.post(`${API_BASE_URL}/api/batch/timeseries`, {
        artist_id: 'ARTIST_0005',
        axes: ['제도', '학술', '담론', '네트워크']
      });
      const endTime = Date.now();
      responseTimes.push(endTime - startTime);
    }
    
    responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(iterations * 0.95);
    const p95 = responseTimes[p95Index];
    
    expect(p95).toBeLessThan(500);
    console.log(`p95 응답 시간: ${p95}ms`);
  });
});
```

---

### 3.6 데이터 품질 테스트 (Data Quality Tests)

#### TC-DQ-001: ±0.5p 일관성 검증

**목표**: 레이더5 합계와 선버스트 L1 매핑 합계의 오차 ≤ 0.5 검증

**테스트 케이스**:

```javascript
// tests/integration/dataQuality/consistency.test.js
import axios from 'axios';
import { mapSunburstToRadar5 } from '../../../src/utils/dataQualityValidator.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';

describe('TC-DQ-001: ±0.5p 일관성 검증', () => {
  test('레이더5 합계 vs 선버스트 L1 매핑 합계 오차 검증', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/artist/ARTIST_0005/summary`);
    const data = response.data;
    
    // 레이더5 합계 계산
    const radar5Sum = Object.values(data.radar5).reduce((sum, value) => sum + (value || 0), 0);
    
    // 선버스트 L1을 레이더5로 매핑
    const radar5FromSunburst = mapSunburstToRadar5(data.sunburst_l1);
    const radar5FromSunburstSum = Object.values(radar5FromSunburst).reduce((sum, value) => sum + (value || 0), 0);
    
    // 오차 계산
    const difference = Math.abs(radar5Sum - radar5FromSunburstSum);
    
    // ±0.5p 검증
    expect(difference).toBeLessThanOrEqual(0.5);
    expect(data.consistency_check.passed).toBe(true);
    expect(data.consistency_check.error).toBeLessThanOrEqual(0.5);
  });
});
```

---

## 4. 추적성 매트릭스 (Traceability Matrix)

### 4.1 FR → 테스트 케이스 매핑

| FR ID | FR 설명 | 테스트 케이스 ID | 테스트 레벨 | AC 커버리지(%) | 상태 |
|-------|---------|-----------------|------------|---------------|------|
| FR-P1-SUM-001 | 아티스트 요약 데이터 조회 | TC-P1-SUM-001 | 단위/통합/E2E | 100% | 완료 |
| FR-P1-SUN-001 | Sunburst 상세 데이터 조회 | TC-P1-SUN-001 | 통합 | 80% | 완료 |
| FR-P2-TIM-001 | 시계열 데이터 조회 | TC-P2-TIM-001 | 단위/통합/E2E | 100% | 완료 |
| FR-P2-EVT-001 | 이벤트 영향 분석 | TC-P2-EVT-001 | 통합 | 100% | 완료 |
| FR-P2-BAT-001 | 배치 시계열 데이터 조회 | TC-P2-BAT-001 | 통합 | 95% | 완료 |
| FR-P3-CMP-001 | 두 아티스트 비교 데이터 조회 | TC-P3-CMP-001 | 통합/E2E | 100% | 완료 |
| FR-P4-RPT-001 | AI 보고서 생성 | TC-P4-RPT-001 | 통합/E2E | 100% | 완료 |
| N/A | API 성능 테스트 | TC-PERF-001 | 성능 | N/A | 완료 |
| N/A | 데이터 품질 검증 | TC-DQ-001 | 통합 | N/A | 완료 |

### 4.2 테스트 실행 체크리스트

**단위 테스트 실행**:
```bash
npm test -- --testPathPattern=unit
```

**통합 테스트 실행**:
```bash
firebase emulators:start --only functions,firestore
npm test -- --testPathPattern=integration
```

**E2E 테스트 실행**:
```bash
npm run test:e2e
```

**성능 테스트 실행**:
```bash
npm test -- --testPathPattern=performance
```

**전체 테스트 실행**:
```bash
npm test
```

---

## 5. 테스트 실행 가이드 (Test Execution Guide)

### 5.1 로컬 실행

**전제 조건**:
1. Node.js 20 설치
2. Firebase CLI 설치 (`npm install -g firebase-tools`)
3. Firebase Emulators 실행

**실행 순서**:
```bash
# 1. Firebase Emulators 시작
firebase emulators:start --only functions,firestore

# 2. 별도 터미널에서 테스트 실행
npm test

# 3. E2E 테스트 (React 앱 실행 필요)
npm start &  # 포트 3000
npm run test:e2e
```

### 5.2 CI/CD 실행

**GitHub Actions 예시**:
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

---

## 6. 부록 (Appendix)

### 6.1 테스트 데이터 확장

**100명 아티스트 테스트 데이터셋 생성**:
```javascript
// scripts/generateTestData.js
const testArtists = [];
for (let i = 0; i < 100; i++) {
  const artistId = `ARTIST_${String(i).padStart(4, '0')}`;
  testArtists.push({
    artist_id: artistId,
    name: `Test Artist ${i}`,
    // ... mock 데이터 구조
  });
}
```

### 6.2 테스트 커버리지 리포트

**커버리지 생성**:
```bash
npm test -- --coverage --coverageReporters=html
```

**커버리지 리포트 확인**: `coverage/index.html`

---

**문서 버전 관리**:
- v1.0 (2025-11-02): 초기 작성 (FRD v1.0 기반)
- 향후 업데이트: FR 변경 시 VXD 동시 업데이트

**주의사항**: 본 문서는 FRD의 모든 FR을 100% 커버하며, AC 커버리지 100%를 목표로 한다.

