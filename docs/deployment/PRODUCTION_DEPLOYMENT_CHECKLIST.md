# PRODUCTION DEPLOYMENT CHECKLIST (asia-northeast3)

## 1) 사전 점검
- [ ] GCP 프로젝트: co-1016 활성화
- [ ] Firebase CLI/gcloud 로그인
- [ ] Secret Manager: 다음 Secret들이 설정되어 있는지 확인
  - [ ] `ANTHROPIC_API_KEY` - Anthropic Claude API 키
  - [ ] `OPENAI_API_KEY` - OpenAI GPT-4 API 키 (폴백용)
  - [ ] `VERTEX_AI_CREDENTIALS` - Vertex AI Gemini 서비스 계정 인증 정보
  - [ ] `app-config` - 애플리케이션 설정
  - [ ] `apphosting-github-conn-bf9212r-github-oauthtoken-111de7` - GitHub App Hosting 연결 토큰 (선택적)
  - [ ] `co-1016-firebase-adminsdk-fbsvc-ec20702062` - Firebase Admin SDK 서비스 계정 키 (선택적)
- [ ] IAM 최소권한: functions runner, secret accessor
- [ ] Firestore rules/indexes 배포 준비
- [ ] Cloud Build 트리거 설정 확인 (선택적, CI/CD 사용 시)
  - [ ] 트리거 이름: `curator-odyssey-prod-deploy`
  - [ ] 서비스 계정 권한 확인: `501326088107@cloudbuild.gserviceaccount.com`
  - [ ] Secret Manager 접근 권한 확인
  - [ ] 상세 가이드: [Cloud Build 트리거 설정 가이드](docs/deployment/CLOUD_BUILD_TRIGGER_SETUP.md)

## 2) Hosting 설정 검증
- firebase.json rewrites:
  - /api/artist/*/summary → getArtistSummary
  - /api/artist/*/sunburst → getArtistSunburst
  - /api/artist/*/timeseries/* → getArtistTimeseries
  - /api/compare/*/* → getCompareArtists
  - /api/report/generate → generateAiReport
  - /api/ai/vertex-* → vertex functions

## 3) Functions 배포 (nodejs20, asia-northeast3)
```bash
cd functions
npm ci
firebase deploy --only functions --project co-1016
```

## 4) Hosting 배포
```bash
npm ci
npm run build
firebase deploy --only hosting --project co-1016
```

## 5) Cloud Build (샘플)
```yaml
# cloudbuild.yaml
steps:
- name: 'gcr.io/cloud-builders/npm'
  args: ['ci']
- name: 'gcr.io/cloud-builders/npm'
  args: ['run','build']
- name: 'gcr.io/cloud-builders/npm'
  args: ['ci']
  dir: 'functions'
- name: 'gcr.io/$PROJECT_ID/firebase'
  args: ['deploy','--only','hosting,functions','--project','co-1016']
```

## 6) 롤백 절차 상세

### 6.1 Hosting 롤백

**Preview 채널 방식 (권장):**
```bash
# 1. Preview 채널로 배포
firebase hosting:channel:deploy preview --project co-1016

# 2. Preview URL에서 검증
# https://co-1016--preview-<channel-id>.web.app

# 3. 검증 완료 후 프로덕션으로 승격
firebase hosting:channel:deploy preview --project co-1016 --only production

# 또는 직접 롤백
firebase hosting:rollback --project co-1016
```

**이전 버전 확인:**
```bash
# 배포 히스토리 확인
firebase hosting:channel:list --project co-1016

# 특정 버전으로 롤백
firebase hosting:rollback <version-id> --project co-1016
```

### 6.2 Functions 롤백

**특정 함수 롤백:**
```bash
# 1. 현재 Functions 버전 확인
firebase functions:list --project co-1016

# 2. 특정 함수만 이전 버전으로 롤백
firebase deploy --only functions:getArtistSummary@<previous-version> --project co-1016

# 3. 전체 Functions 롤백
firebase functions:rollback --project co-1016
```

**롤백 확인:**
```bash
# 롤백 후 Functions 상태 확인
firebase functions:list --project co-1016

# API 엔드포인트 테스트
curl https://co-1016.web.app/api/artist/ARTIST_0005/summary
```

### 6.3 긴급 폴백 전략

**1. Mock 데이터로 전환:**
- `src/hooks/useDataSource.js`에서 `mock` 모드 강제
- `useDataSource('mock')` 설정

**2. API 라우팅 차단:**
- `firebase.json` rewrites에서 문제되는 엔드포인트 주석 처리
- 재배포

**3. Cloud Build 롤백:**
```bash
# 이전 빌드 ID 확인
gcloud builds list --project co-1016 --limit 10

# 특정 빌드 재실행
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_BUILD_ID=<previous-build-id> \
  --project co-1016
```

### 6.4 롤백 체크리스트

- [ ] 롤백 사유 문서화
- [ ] 이전 버전 ID 확인
- [ ] 롤백 전 데이터 백업 (필요시)
- [ ] 롤백 실행
- [ ] 롤백 후 기능 검증
- [ ] 모니터링 대시보드 확인
- [ ] 팀에 롤백 알림

## 7) 리전 특화 설정
- Secrets/Functions/Dashboards 리전: asia-northeast3 통일
- VPC/Outbound 정책 없음(기본)
- 에뮬레이터 포트: functions 5002, ui 4002

## 8) 검증 체크리스트 확장

### 8.1 API 엔드포인트 검증

**Phase 1 API:**
- [ ] `GET /api/artist/ARTIST_0005/summary` → 200 OK, radar5/sunburst_l1 포함
- [ ] `GET /api/artist/ARTIST_0005/sunburst` → 200 OK, 데이터 구조 검증
- [ ] 존재하지 않는 작가 → 404 Not Found

**Phase 2 API:**
- [ ] `GET /api/artist/ARTIST_0005/timeseries/제도` → 200 OK, bins 배열 포함
- [ ] `GET /api/artist/ARTIST_0005/timeseries/학술` → 200 OK
- [ ] `GET /api/artist/ARTIST_0005/timeseries/담론` → 200 OK
- [ ] `GET /api/artist/ARTIST_0005/timeseries/네트워크` → 200 OK
- [ ] 잘못된 축 이름 → 400 Bad Request

**Phase 3 API:**
- [ ] `GET /api/compare/ARTIST_0005/ARTIST_0010/제도` → 200 OK, series 배열 포함
- [ ] 두 작가 비교 데이터 일관성 확인

**Phase 4 API:**
- [ ] `POST /api/report/generate` → 200 OK, Markdown 보고서 반환
- [ ] Vertex AI 실패 시 폴백 동작 확인 (템플릿 보고서)
- [ ] 보고서 생성 시간 측정 (< 30초)

### 8.2 성능 검증

- [ ] API 응답 시간 < 300ms (P95)
- [ ] 첫 로딩 시간 < 3초 (LCP)
- [ ] 번들 크기 확인 (번들 크기 < 500KB)
- [ ] Functions 콜드 스타트 시간 < 5초

### 8.3 보안 검증

- [ ] CORS 헤더 설정 확인
- [ ] Secret Manager 접근 권한 확인
- [ ] Firestore 보안 규칙 적용 확인
- [ ] HTTPS 강제 확인

### 8.4 데이터 품질 검증

- [ ] ±0.5p 일관성 검증 통과
- [ ] 데이터 완성도 ≥ 85%
- [ ] 시계열 데이터 연속성 확인

### 8.5 모니터링 검증

- [ ] Cloud Monitoring 지표 수집 확인
- [ ] 에러 로깅 확인
- [ ] 알림 설정 확인 (Slack/PagerDuty)

### 8.6 자동화 검증 스크립트

```bash
#!/bin/bash
# scripts/verify-deployment.sh

BASE_URL="https://co-1016.web.app"

echo "🔍 배포 검증 시작..."

# Phase 1 검증
echo "Phase 1 검증 중..."
curl -f "${BASE_URL}/api/artist/ARTIST_0005/summary" || exit 1

# Phase 2 검증
echo "Phase 2 검증 중..."
for axis in "제도" "학술" "담론" "네트워크"; do
  curl -f "${BASE_URL}/api/artist/ARTIST_0005/timeseries/${axis}" || exit 1
done

# Phase 4 검증
echo "Phase 4 검증 중..."
curl -f -X POST "${BASE_URL}/api/report/generate" \
  -H "Content-Type: application/json" \
  -d '{"artist_id":"ARTIST_0005","report_type":"comprehensive"}' || exit 1

echo "✅ 모든 검증 통과"
```

## 9) 배포 후 모니터링

### 9.1 즉시 확인 사항 (배포 후 5분)

- [ ] Functions 로그 확인 (에러 없음)
- [ ] API 응답 시간 확인
- [ ] 사용자 트래픽 모니터링
- [ ] 에러율 확인 (< 1%)

### 9.2 1시간 후 확인

- [ ] 전체 API 엔드포인트 정상 동작 확인
- [ ] 데이터 품질 검증 자동 실행 결과 확인
- [ ] 성능 지표 확인 (응답 시간, 처리량)

### 9.3 24시간 후 확인

- [ ] 일일 사용자 통계 확인
- [ ] 에러 로그 분석
- [ ] 비용 모니터링 (Vertex AI 사용량)
- [ ] 사용자 피드백 수집

