# Cloud Build 모범 사례 가이드

버전: 1.0  
최종 수정: 2025-01-XX  
작성자: NEO GOD (Director)

## 목차

1. [일반 원칙](#1-일반-원칙)
2. [Step 구성 모범 사례](#2-step-구성-모범-사례)
3. [인증 및 보안](#3-인증-및-보안)
4. [에러 처리](#4-에러-처리)
5. [성능 최적화](#5-성능-최적화)
6. [검증 및 테스트](#6-검증-및-테스트)

---

## 1. 일반 원칙

### 1.1 명확성과 단순성

- 각 step은 하나의 명확한 목적을 가져야 함
- 복잡한 로직은 별도의 스크립트 파일로 분리
- 주석을 통해 각 step의 목적 명시

**좋은 예시**:
```yaml
# =====================================================
# 1. 의존성 설치 및 빌드 (Frontend)
# =====================================================
- name: 'gcr.io/cloud-builders/npm'
  id: 'install-frontend'
  args: ['ci']
  waitFor: ['-']
```

**나쁜 예시**:
```yaml
# 모든 작업을 하나의 step에 몰아넣음
- name: 'gcr.io/cloud-builders/npm'
  script: |
    npm ci && npm run build && npm test && npm run deploy
```

### 1.2 재사용 가능성

- 환경별 설정은 substitution 변수 사용
- 하드코딩된 값 피하기

**좋은 예시**:
```yaml
substitutions:
  _ENVIRONMENT: 'production'
  _PROJECT_ID: 'co-1016'

steps:
  - name: 'gcr.io/$_PROJECT_ID/firebase'
    args:
      - '--project'
      - '$_PROJECT_ID'
```

**나쁜 예시**:
```yaml
steps:
  - name: 'gcr.io/co-1016/firebase'
    args:
      - '--project'
      - 'co-1016'  # 하드코딩
```

---

## 2. Step 구성 모범 사례

### 2.1 script vs args 선택

**단순 명령어 실행: args 사용**
```yaml
- name: 'gcr.io/cloud-builders/npm'
  id: 'install-deps'
  args: ['ci']
  waitFor: ['-']
```

**복잡한 로직/파일 저장: script 사용**
```yaml
- name: 'gcr.io/cloud-builders/gcloud'
  id: 'save-rollback-info'
  script: |
    #!/bin/bash
    FUNCTIONS_LIST=$(gcloud firebase functions:list --project=$_PROJECT_ID --format=json)
    echo "$FUNCTIONS_LIST" > /workspace/previous-functions.json
    echo "Previous functions version saved for rollback"
  waitFor: ['deploy-firebase']
```

**중요**: `script`를 사용할 때는 `args`와 `entrypoint`를 동시에 사용할 수 없습니다.

### 2.2 waitFor 의존성 관리

- 명확한 의존성 체인 정의
- 병렬 실행 가능한 단계는 병렬로 실행

**좋은 예시**:
```yaml
# 병렬 실행 가능
- name: 'gcr.io/cloud-builders/npm'
  id: 'install-frontend'
  args: ['ci']
  waitFor: ['-']

- name: 'gcr.io/cloud-builders/npm'
  id: 'install-backend'
  args: ['ci']
  dir: 'functions'
  waitFor: ['-']  # frontend와 병렬 실행

# 이후 단계는 둘 다 완료 후 실행
- name: 'gcr.io/cloud-builders/npm'
  id: 'verify-build'
  args: ['run','test']
  waitFor: ['install-frontend', 'install-backend']
```

### 2.3 에러 처리

- 중요한 단계는 실패 시 빌드 중단
- 선택적 단계는 `allowFailure: true` 사용

**좋은 예시**:
```yaml
# 필수 단계 (실패 시 빌드 중단)
- name: 'gcr.io/cloud-builders/npm'
  id: 'verify-build'
  args: ['run','test']
  waitFor: ['build-frontend']

# 선택적 단계 (실패해도 빌드 계속)
- name: 'gcr.io/cloud-builders/curl'
  id: 'notify-deployment'
  args: ['-X', 'POST', '${_SLACK_WEBHOOK_URL}']
  waitFor: ['verify-deployment']
  allowFailure: true
```

---

## 3. 인증 및 보안

### 3.1 Secret 관리

**Secret Manager 사용 (권장)**:
```yaml
substitutions:
  _FIREBASE_TOKEN: '${_SECRET_FIREBASE_TOKEN}'  # Secret Manager 참조

steps:
  - name: 'gcr.io/$_PROJECT_ID/firebase'
    args:
      - '--token'
      - '${_FIREBASE_TOKEN}'
    env:
      - 'FIREBASE_TOKEN=${_FIREBASE_TOKEN}'
```

**주의사항**:
- Secret을 로그에 출력하지 않기
- 하드코딩된 Secret 사용 금지
- Secret Manager 접근 권한 확인

### 3.2 서비스 계정 권한

**최소 권한 원칙**:
- 필요한 권한만 부여
- 역할별 권한 분리

**필수 권한 예시**:
```bash
# Cloud Build 서비스 계정
roles/cloudbuild.builds.builder
roles/firebase.admin
roles/secretmanager.secretAccessor

# Firebase Admin SDK 서비스 계정
roles/firebase.admin
roles/datastore.user
roles/secretmanager.secretAccessor
```

---

## 4. 에러 처리

### 4.1 단계별 검증

**각 단계 후 검증 추가**:
```yaml
- name: 'gcr.io/cloud-builders/npm'
  id: 'build-frontend'
  args: ['run','build']
  waitFor: ['install-frontend']

# 빌드 검증
- name: 'gcr.io/cloud-builders/gcloud'
  id: 'verify-build-output'
  script: |
    #!/bin/bash
    if [ ! -d "build" ]; then
      echo "Build output directory not found"
      exit 1
    fi
    echo "Build output verified"
  waitFor: ['build-frontend']
```

### 4.2 롤백 준비

**배포 전 이전 버전 저장**:
```yaml
- name: 'gcr.io/cloud-builders/gcloud'
  id: 'save-rollback-info'
  script: |
    #!/bin/bash
    FUNCTIONS_LIST=$(gcloud firebase functions:list --project=$_PROJECT_ID --format=json)
    echo "$FUNCTIONS_LIST" > /workspace/previous-functions.json
    echo "Previous functions version saved for rollback"
  waitFor: ['deploy-firebase']
```

### 4.3 알림 및 로깅

**배포 결과 알림**:
```yaml
- name: 'gcr.io/cloud-builders/curl'
  id: 'notify-deployment'
  args:
    - '-X'
    - 'POST'
    - '${_SLACK_WEBHOOK_URL}'
    - '-H'
    - 'Content-Type: application/json'
    - '-d'
    - '{"text":"Deployment completed: $_ENVIRONMENT"}'
  waitFor: ['verify-deployment']
  allowFailure: true
```

---

## 5. 성능 최적화

### 5.1 병렬 실행

**독립적인 작업 병렬 실행**:
```yaml
# Frontend와 Backend 설치를 병렬로 실행
- name: 'gcr.io/cloud-builders/npm'
  id: 'install-frontend'
  args: ['ci']
  waitFor: ['-']

- name: 'gcr.io/cloud-builders/npm'
  id: 'install-backend'
  args: ['ci']
  dir: 'functions'
  waitFor: ['-']  # 병렬 실행
```

### 5.2 캐싱 활용

**의존성 캐싱**:
```yaml
options:
  machineType: 'N1_HIGHCPU_8'  # 더 빠른 머신 사용
  logging: CLOUD_LOGGING_ONLY

# npm ci는 package-lock.json을 사용하여 빠른 설치
- name: 'gcr.io/cloud-builders/npm'
  args: ['ci']  # npm install 대신 ci 사용
```

### 5.3 불필요한 단계 제거

- 사용하지 않는 빌드 단계 제거
- 중복 검증 단계 통합

---

## 6. 검증 및 테스트

### 6.1 배포 전 검증

**다단계 검증**:
```yaml
# 1. 코드 품질 검증
- name: 'gcr.io/cloud-builders/npm'
  id: 'lint'
  args: ['run','lint']
  waitFor: ['install-frontend']

# 2. 단위 테스트
- name: 'gcr.io/cloud-builders/npm'
  id: 'test'
  args: ['run','test']
  waitFor: ['install-frontend', 'install-backend']
  env:
    - 'CI=true'

# 3. 빌드 검증
- name: 'gcr.io/cloud-builders/npm'
  id: 'build-frontend'
  args: ['run','build']
  waitFor: ['test']
```

### 6.2 배포 후 검증

**배포 결과 확인**:
```yaml
- name: 'gcr.io/cloud-builders/curl'
  id: 'verify-deployment'
  args:
    - '-f'
    - '-X'
    - 'GET'
    - 'https://$_PROJECT_ID.web.app/api/artist/ARTIST_0005/summary'
  waitFor: ['deploy-firebase']
```

### 6.3 Firestore 인덱스 검증

**인덱스 배포 전 검증**:
```yaml
# Firebase CLI 설치 (필요한 경우)
- name: 'gcr.io/cloud-builders/npm'
  id: 'install-firebase-cli'
  args: ['install', '-g', 'firebase-tools']
  waitFor: ['verify-build']

# 인덱스 구문 검증 (dry-run)
- name: 'gcr.io/cloud-builders/node'
  id: 'validate-indexes'
  entrypoint: 'firebase'
  args:
    - 'deploy'
    - '--only'
    - 'firestore:indexes'
    - '--dry-run'
    - '--project'
    - '$_PROJECT_ID'
    - '--token'
    - '${_FIREBASE_TOKEN}'
  waitFor: ['install-firebase-cli']
```

### 6.4 Firebase CLI 설치 방식 선택

**npm 기반 방식 (권장)**:
- 장점: 이미지 빌드 불필요, 빠른 설정
- 단점: 매 빌드마다 설치 시간 소요 (약 10-20초)

**커스텀 이미지 방식**:
- 장점: 빌드 시간 단축
- 단점: 이미지 빌드 및 관리 필요

**권장 사항**: npm 기반 방식으로 시작하고, 빌드 시간이 문제가 되면 이미지 빌드 방식으로 전환

---

## 7. 환경별 전략

### 7.1 환경 변수 사용

```yaml
substitutions:
  _ENVIRONMENT: 'production'  # production, staging, development
  _PROJECT_ID: 'co-1016'

options:
  env:
    - 'NODE_ENV=${_ENVIRONMENT}'
```

### 7.2 조건부 실행

**환경별 다른 단계 실행** (향후 개선):
```yaml
# 주의: Cloud Build는 기본적으로 조건부 실행을 지원하지 않음
# 대신 별도의 트리거와 설정 파일 사용 권장
```

---

## 8. 문서화

### 8.1 cloudbuild.yaml 주석

**각 섹션에 명확한 주석**:
```yaml
# =====================================================
# 1. 의존성 설치 및 빌드 (Frontend)
# =====================================================
# Frontend React 앱의 의존성을 설치하고 빌드합니다.
# 병렬 실행을 위해 waitFor: ['-']를 사용합니다.
```

### 8.2 README 문서화

**배포 프로세스 문서화**:
```markdown
## CI/CD 파이프라인

Cloud Build를 통한 자동 배포 프로세스:

1. 코드 푸시 시 트리거 실행
2. 의존성 설치 및 빌드
3. 테스트 실행
4. Firebase 배포
5. 배포 검증
```

---

## 9. 체크리스트

cloudbuild.yaml 작성 시 다음 항목을 확인하세요:

- [ ] 각 step에 명확한 id와 주석이 있는가?
- [ ] script와 args를 동시에 사용하지 않았는가?
- [ ] Secret이 하드코딩되지 않았는가?
- [ ] 불필요한 단계가 없는가?
- [ ] 병렬 실행 가능한 단계가 병렬로 실행되는가?
- [ ] 에러 처리가 적절한가? (allowFailure 사용)
- [ ] 배포 전/후 검증이 포함되어 있는가?
- [ ] 환경 변수가 substitution 변수로 설정되어 있는가?

---

## 10. 참조 문서

- [Cloud Build 트리거 설정 가이드](CLOUD_BUILD_TRIGGER_SETUP.md)
- [Cloud Build 문제 해결 가이드](CLOUD_BUILD_TROUBLESHOOTING.md)
- [인프라 및 배포 가이드](../infrastructure/INFRASTRUCTURE_DEPLOYMENT_GUIDE.md)
- [프로덕션 배포 체크리스트](PRODUCTION_DEPLOYMENT_CHECKLIST.md)

