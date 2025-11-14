# Cloud Build 트리거 설정 가이드

**버전**: 1.0  
**최종 수정**: 2025-11-02  
**프로젝트**: co-1016 (CuratorOdyssey)

## 목차

1. [사전 요구사항](#1-사전-요구사항)
2. [저장소 연결](#2-저장소-연결)
3. [트리거 생성](#3-트리거-생성)
4. [설정값 상세](#4-설정값-상세)
5. [서비스 계정 권한](#5-서비스-계정-권한)
6. [검증 및 테스트](#6-검증-및-테스트)
7. [문제 해결](#7-문제-해결)

---

## 1. 사전 요구사항

### 1.1 필수 API 활성화

다음 GCP API가 활성화되어 있어야 합니다:

```bash
# Cloud Build API 활성화 확인
gcloud services list --enabled --project=co-1016 | grep cloudbuild

# 필요 시 활성화
gcloud services enable cloudbuild.googleapis.com --project=co-1016
```

**필수 API 목록**:
- `cloudbuild.googleapis.com` - Cloud Build API
- `firebase.googleapis.com` - Firebase API
- `secretmanager.googleapis.com` - Secret Manager API
- `storage-api.googleapis.com` - Cloud Storage API

### 1.2 프로젝트 정보

- **프로젝트 ID**: `co-1016`
- **프로젝트 번호**: `501326088107`
- **리전**: `asia-northeast3`
- **Cloud Build 구성 파일**: `/cloudbuild.yaml` (프로젝트 루트)

### 1.3 권한 확인

Cloud Build 트리거 생성을 위해 다음 권한이 필요합니다:

- `roles/cloudbuild.builds.editor` - 트리거 생성 및 관리
- `roles/cloudbuild.builds.builder` - 빌드 실행
- `roles/storage.admin` - Artifact Registry 접근

---

## 2. 저장소 연결

### 2.1 GitHub 저장소 연결

**GCP Console에서**:

1. **Cloud Build > 트리거** 페이지로 이동
2. **저장소 연결** 버튼 클릭
3. **소스** 선택:
   - **GitHub (Cloud Build GitHub 앱)** 선택
   - 또는 **GitHub** 선택 후 인증 진행
4. **저장소 연결**:
   - 저장소 선택 또는 새로 연결
   - 저장소 이름: 예) `co-1016-curator-odyssey`
   - 연결 확인

### 2.2 Cloud Source Repositories 연결 (대안)

GitHub 대신 Cloud Source Repositories를 사용하는 경우:

```bash
# Cloud Source Repositories에 저장소 미러 생성
gcloud source repos create curator-odyssey --project=co-1016

# GitHub 저장소와 미러링 설정
gcloud source repos update curator-odyssey \
  --update-custom-remote \
  --remote-url=https://github.com/YOUR_USERNAME/YOUR_REPO.git \
  --project=co-1016
```

---

## 3. 트리거 생성

### 3.1 GCP Console에서 트리거 생성

1. **Cloud Build > 트리거** 페이지로 이동
2. **[+ 트리거 만들기]** 클릭
3. 다음 설정 입력:

#### 기본 설정

- **이름**: `curator-odyssey-prod-deploy`
- **설명**: `CuratorOdyssey 프로덕션 자동 배포 트리거`
- **태그**: `production`, `automated-deployment`

#### 이벤트 설정

- **이벤트**: `브랜치에 푸시` 선택
- **저장소**: 연결된 저장소 선택
- **브랜치**: `^main$` (정규식)
  - 정규식 예시:
    - `^main$` - main 브랜치만
    - `^main$|^develop$` - main 또는 develop 브랜치
    - `^release/.*` - release/로 시작하는 모든 브랜치

#### 구성 설정

- **유형**: `Cloud Build 구성 파일 (yaml 또는 json)`
- **Cloud Build 구성 파일 위치**: `/cloudbuild.yaml`
- **구성 파일 경로**: 프로젝트 루트에 있는 `cloudbuild.yaml` 파일

#### Substitution 변수

다음 변수들을 설정합니다:

| 변수 이름 | 값 | 설명 |
|----------|-----|------|
| `_ENVIRONMENT` | `production` | 배포 환경 |
| `_PROJECT_ID` | `co-1016` | GCP 프로젝트 ID |
| `_FIREBASE_PROJECT` | `co-1016` | Firebase 프로젝트 ID |
| `_FIREBASE_TOKEN` | Secret Manager 참조 | Firebase 배포 토큰 |

**Secret Manager에서 변수 참조**:
- 변수 이름: `_FIREBASE_TOKEN`
- Secret 이름: `firebase-deploy-token` (또는 해당 Secret 이름)
- 버전: `latest` 또는 특정 버전

#### 서비스 계정 설정

- **서비스 계정**: `501326088107@cloudbuild.gserviceaccount.com` (기본 Cloud Build 서비스 계정)
- 또는 **대체 서비스 계정**: `firebase-adminsdk-fbsvc@co-1016.iam.gserviceaccount.com` (Firebase 배포 권한 필요 시)

### 3.2 gcloud CLI로 트리거 생성 (대안)

```bash
gcloud builds triggers create github \
  --name="curator-odyssey-prod-deploy" \
  --repo-name="YOUR_REPO_NAME" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --substitutions="_ENVIRONMENT=production,_PROJECT_ID=co-1016,_FIREBASE_PROJECT=co-1016" \
  --service-account="projects/co-1016/serviceAccounts/501326088107@cloudbuild.gserviceaccount.com" \
  --project=co-1016
```

---

## 4. 설정값 상세

### 4.1 트리거 설정값 요약

| 설정 항목 | 값 | 비고 |
|---------|-----|------|
| 트리거 이름 | `curator-odyssey-prod-deploy` | 식별 용이한 이름 |
| 이벤트 | 브랜치에 푸시 | GitHub Push 이벤트 |
| 브랜치 패턴 | `^main$` | 정규식 사용 |
| 구성 파일 | `/cloudbuild.yaml` | 프로젝트 루트 기준 |
| 서비스 계정 | `501326088107@cloudbuild.gserviceaccount.com` | Cloud Build 기본 계정 |

### 4.2 Substitution 변수 상세

`cloudbuild.yaml`에서 사용하는 Substitution 변수:

```yaml
substitutions:
  _ENVIRONMENT: 'production'      # production, staging, development
  _PROJECT_ID: 'co-1016'
  _FIREBASE_PROJECT: 'co-1016'
```

**Secret Manager에서 변수 참조**:
- `_FIREBASE_TOKEN`: Firebase 배포 토큰 (Secret Manager에서 가져옴)
- `_SLACK_WEBHOOK_URL`: Slack 알림 웹훅 (선택적)

### 4.3 cloudbuild.yaml 주요 설정

```yaml
options:
  logging: CLOUD_LOGGING_ONLY
  machineType: 'N1_HIGHCPU_8'
  substitution_option: 'ALLOW_LOOSE'
  env:
    - 'NODE_ENV=${_ENVIRONMENT}'
```

---

## 5. 서비스 계정 권한

### 5.1 Cloud Build 서비스 계정

**서비스 계정**: `501326088107@cloudbuild.gserviceaccount.com`

**부여된 주요 역할**:
- `roles/cloudbuild.builds.builder` - 빌드 실행
- `roles/cloudbuild.builds.editor` - 빌드 관리
- `roles/firebase.admin` - Firebase 배포
- `roles/secretmanager.secretAccessor` - Secret Manager 접근
- `roles/storage.admin` - Cloud Storage 접근
- `roles/artifactregistry.writer` - Artifact Registry 쓰기

**권한 확인**:
```bash
gcloud projects get-iam-policy co-1016 \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:serviceAccount:501326088107@cloudbuild.gserviceaccount.com"
```

### 5.2 Firebase Admin SDK 서비스 계정 (대체 사용 시)

**서비스 계정**: `firebase-adminsdk-fbsvc@co-1016.iam.gserviceaccount.com`

**부여된 주요 역할**:
- `roles/firebase.admin` - Firebase 관리
- `roles/datastore.user` - Firestore 접근
- `roles/secretmanager.secretAccessor` - Secret Manager 접근
- `roles/aiplatform.admin` - Vertex AI 관리

### 5.3 필요한 추가 권한

Secret Manager에서 Secret을 읽기 위해:
- `roles/secretmanager.secretAccessor` (이미 부여됨)

Firebase Functions 배포를 위해:
- `roles/cloudfunctions.developer` (이미 부여됨)
- `roles/firebase.admin` (이미 부여됨)

---

## 6. 검증 및 테스트

### 6.1 트리거 활성화 확인

```bash
# 트리거 목록 확인
gcloud builds triggers list --project=co-1016

# 특정 트리거 확인
gcloud builds triggers describe curator-odyssey-prod-deploy --project=co-1016
```

### 6.2 수동 빌드 실행 (테스트)

```bash
# 트리거를 수동으로 실행
gcloud builds triggers run curator-odyssey-prod-deploy \
  --branch=main \
  --project=co-1016
```

### 6.3 빌드 로그 확인

```bash
# 최근 빌드 목록
gcloud builds list --project=co-1016 --limit=10

# 특정 빌드 로그 확인
gcloud builds log BUILD_ID --project=co-1016
```

### 6.4 GCP Console에서 확인

1. **Cloud Build > 히스토리** 페이지로 이동
2. 빌드 상태 확인:
   - ✅ **성공** - 빌드 성공
   - ⏳ **진행 중** - 빌드 실행 중
   - ❌ **실패** - 빌드 실패 (로그 확인 필요)

### 6.5 배포 검증

빌드가 성공적으로 완료된 후:

```bash
# API 엔드포인트 테스트
curl https://co-1016.web.app/api/artist/ARTIST_0005/summary

# Firebase Functions 상태 확인
firebase functions:list --project=co-1016
```

---

## 7. 문제 해결

**상세한 문제 해결 가이드는 [Cloud Build 문제 해결 가이드](CLOUD_BUILD_TROUBLESHOOTING.md)를 참조하세요.**

### 7.1 일반적인 오류

#### 오류: "File cloudbuild.yaml not found"

**원인**: `cloudbuild.yaml` 파일이 GitHub 저장소의 `main` 브랜치에 없음

**해결**:
```bash
# GitHub에서 파일 확인
git ls-tree -r main --name-only | grep cloudbuild.yaml

# 파일이 다른 브랜치에만 있다면 main 브랜치로 머지
git checkout main
git merge <branch-name>
git push origin main
```

**참조**: [Cloud Build 문제 해결 가이드](CLOUD_BUILD_TROUBLESHOOTING.md#11-파일을-찾을-수-없음-not_found)

#### 오류: "invalid build: invalid .steps field: build step X both script and entrypoint provided"

**원인**: Cloud Build step에서 `script`와 `entrypoint` (또는 `args`)를 동시에 사용

**해결**:
- `script`를 사용할 때는 `args`와 `entrypoint` 제거
- 단순 명령어는 `args`만 사용
- 복잡한 로직은 `script`만 사용

**예시**:
```yaml
# 잘못된 예시
- name: 'gcr.io/cloud-builders/gcloud'
  args: ['firebase', 'functions:list']
  entrypoint: 'bash'
  script: |
    #!/bin/bash
    echo "..."

# 올바른 예시 (script만 사용)
- name: 'gcr.io/cloud-builders/gcloud'
  script: |
    #!/bin/bash
    FUNCTIONS_LIST=$(gcloud firebase functions:list --project=$_PROJECT_ID --format=json)
    echo "$FUNCTIONS_LIST" > /workspace/previous-functions.json
```

**참조**: [Cloud Build 문제 해결 가이드](CLOUD_BUILD_TROUBLESHOOTING.md#21-script와-entrypoint-충돌)

#### 오류: "Permission denied"

**원인**: 서비스 계정에 필요한 권한이 없음

**해결**:
```bash
# Cloud Build 서비스 계정에 권한 부여
gcloud projects add-iam-policy-binding co-1016 \
  --member="serviceAccount:501326088107@cloudbuild.gserviceaccount.com" \
  --role="roles/firebase.admin"
```

#### 오류: "Secret not found"

**원인**: Secret Manager에 Secret이 없거나 접근 권한 없음

**해결**:
```bash
# Secret 목록 확인
gcloud secrets list --project=co-1016

# Secret 접근 권한 확인
gcloud secrets get-iam-policy SECRET_NAME --project=co-1016
```

#### 오류: "Build failed: npm install"

**원인**: package.json 또는 의존성 문제

**해결**:
- 로컬에서 `npm ci` 실행하여 확인
- `package-lock.json` 파일 확인
- 빌드 로그에서 상세 오류 확인

### 7.2 빌드 타임아웃

**원인**: 빌드 시간이 기본 타임아웃(10분) 초과

**해결**:
`cloudbuild.yaml`에 타임아웃 설정 추가:

```yaml
options:
  timeout: '1200s'  # 20분
```

### 7.3 Secret Manager 접근 문제

**원인**: 서비스 계정에 Secret Manager 접근 권한 없음

**해결**:
```bash
# Secret에 서비스 계정 권한 부여
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:501326088107@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=co-1016
```

### 7.4 Firebase 배포 실패

**원인**: Firebase CLI 인증 문제 또는 프로젝트 설정 오류

**해결**:
- `_FIREBASE_TOKEN` Secret이 올바르게 설정되었는지 확인
- Firebase 프로젝트 ID 확인 (`_FIREBASE_PROJECT=co-1016`)
- `firebase.json` 파일이 올바른지 확인

---

## 8. 추가 설정 (선택사항)

### 8.1 빌드 알림 설정

Slack 알림을 위한 Secret 설정:

```bash
# Slack 웹훅 URL을 Secret Manager에 저장
echo -n "https://hooks.slack.com/services/YOUR/WEBHOOK/URL" | \
  gcloud secrets create slack-webhook-url --data-file=- --project=co-1016

# 트리거 Substitution에 추가
# _SLACK_WEBHOOK_URL: Secret Manager에서 참조
```

### 8.2 환경별 트리거 생성

스테이징 환경용 트리거:

- **이름**: `curator-odyssey-staging-deploy`
- **브랜치**: `^develop$`
- **Substitution**: `_ENVIRONMENT=staging`

### 8.3 PR 빌드 트리거

Pull Request에 대한 빌드만 실행:

- **이벤트**: Pull Request
- **작업**: 테스트만 실행, 배포는 하지 않음

---

## 9. 참고 문서

- [Cloud Build 공식 문서](https://cloud.google.com/build/docs)
- [Firebase 배포 가이드](docs/deployment/PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- [인프라 배포 가이드](docs/infrastructure/INFRASTRUCTURE_DEPLOYMENT_GUIDE.md)
- [CI/CD 파이프라인](docs/infrastructure/INFRASTRUCTURE_DEPLOYMENT_GUIDE.md#3-cicd-파이프라인)

---

**문서 버전 관리**:
- v1.0 (2025-11-02): 초기 작성

