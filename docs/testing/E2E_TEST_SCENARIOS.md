# E2E TEST SCENARIOS (Phase 1→4)

## 1) 전제 조건
- 로컬: `npm start` (3000), Express/Firebase 에뮬레이터 중 하나 활성
- 프로덕션: Hosting/Functions 배포 완료, 공개 API 동작
- 테스트 데이터: mockData.js 기본 2인 + (옵션) Firestore 샘플

## 2) 시나리오 목록
### S1. Phase 1 로딩/렌더링
- Given 홈페이지 접속, When 요약 데이터 로드, Then 레이더/선버스트 렌더링
- Acceptance: DOM 내 SVG path 존재, 에러 미노출

### S2. Phase 1 → 2 드릴다운
- 레이더/선버스트 인터랙션 후 Phase 2 전환
- Acceptance: StackedAreaChart+EventTimeline 보임, 로딩<2.5s

### S3. Phase 2 시계열 동기화
- 호버/줌/이벤트 선택 동작 일관성
- Acceptance: 동기화 지연 <16ms, FPS 유지(체감)

### S4. Phase 3 비교 분석
- 특정 두 작가 비교 시리즈 렌더링
- Acceptance: 비교 차트 표시, 궤적 차이/상관 결과 존재

### S5. Phase 4 AI 보고서 생성
- 템플릿/Vertex 호출 성공 또는 폴백 보고서 생성
- Acceptance: Markdown 출력, 200 OK, 에러 시 폴백

## 3) 데이터 가드 (±0.5p)
- 배치 후 artist_summary 레이더5 합계 vs 선버스트 L1 매핑 합계 차이 ≤ 0.5
- 실패 시: 경고 로그 + UI 배지 + 리포트 생성 차단(선택)

## 4) 실행 예시
```bash
# 로컬 Express
node localServer.js &

# Functions 에뮬레이터
firebase emulators:start --only functions &

# React
npm start &
```

## 5) 자동 스크립트(예시)
- `scripts/testReactAppIntegration.js`: DOM/라우팅 확인
- `scripts/testLocalServerAPIs.js`: health/summary/timeseries/compare 검증
- `scripts/testAIReport.js`: report/generate 호출 + 폴백 확인

## 6) 리그레션 세트
- Phase 전환/라우팅, API 오류/폴백, 성능 임계치(렌더<3s, API<300ms), 접근성 기본(aria)

