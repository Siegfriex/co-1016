# Cloud Build 문제 해결 가이드

버전: 1.0  
최종 수정: 2025-01-XX  
작성자: NEO GOD (Director)

## 목차

1. [일반적인 오류](#1-일반적인-오류)
2. [구문 오류](#2-구문-오류)
3. [인증 오류](#3-인증-오류)
4. [배포 오류](#4-배포-오류)
5. [검증 및 디버깅](#5-검증-및-디버깅)

---

## 1. 일반적인 오류

### 1.1 파일을 찾을 수 없음 (NOT_FOUND)

**오류 메시지**:
```
ERROR: (gcloud.builds.triggers.run) NOT_FOUND: File cloudbuild.yaml not found.
```

**원인**:
- `cloudbuild.yaml` 파일이 GitHub 저장소의 `main` 브랜치에 없음
- 파일 경로가 잘못됨

**해결 방법**:
1. GitHub 저장소의 `main` 브랜치에 `cloudbuild.yaml` 파일이 있는지 확인
2. 파일이 다른 브랜치에만 있다면 `main` 브랜치로 머지
3. 트리거 설정에서 파일 경로 확인 (`/cloudbuild.yaml`은 프로젝트 루트 기준)

**검증**:
```bash
# GitHub에서 파일 확인
git ls-tree -r main --name-only | grep cloudbuild.yaml

# 로컬에서 확인
git checkout main
ls -la cloudbuild.yaml
```

---

## 2. 구문 오류

### 2.1 script와 entrypoint 충돌

**오류 메시지**:
```
ERROR: (gcloud.builds.triggers.run) INVALID_ARGUMENT: invalid build: invalid .steps field: build step 6 both script and entrypoint provided
```

**원인**:
- Cloud Build step에서 `script`와 `entrypoint` (또는 `args`)를 동시에 사용
- Cloud Build는 이 두 가지를 동시에 허용하지 않음

**해결 방법**:

**잘못된 예시**:
```yaml
- name: 'gcr.io/cloud-builders/gcloud'
  id: 'save-rollback-info'
  args:
    - 'firebase'
    - 'functions:list'
  entrypoint: 'bash'
  script: |
    #!/bin/bash
    FUNCTIONS_LIST=$(gcloud firebase functions:list --project=$_PROJECT_ID --format=json)
    echo "$FUNCTIONS_LIST" > /workspace/previous-functions.json
```

**올바른 예시 (script만 사용)**:
```yaml
- name: 'gcr.io/cloud-builders/gcloud'
  id: 'save-rollback-info'
  waitFor: ['deploy-firebase']
  script: |
    #!/bin/bash
    FUNCTIONS_LIST=$(gcloud firebase functions:list --project=$_PROJECT_ID --format=json)
    echo "$FUNCTIONS_LIST" > /workspace/previous-functions.json
    echo "Previous functions version saved for rollback"
```

**올바른 예시 (args만 사용)**:
```yaml
- name: 'gcr.io/cloud-builders/gcloud'
  id: 'save-rollback-info'
  args:
    - 'firebase'
    - 'functions:list'
    - '--project'
    - '$_PROJECT_ID'
    - '--format=json'
  waitFor: ['deploy-firebase']
```

**권장 사항**:
- 단순 명령어: `args` 사용
- 복잡한 로직/파일 저장: `script` 사용 (args, entrypoint 제거)

### 2.2 YAML 구문 오류

**오류 메시지**:
```
ERROR: yaml: line X: did not find expected key
```

**원인**:
- 들여쓰기 오류
- YAML 키 중복
- 특수 문자 이스케이프 누락

**해결 방법**:
1. YAML 린터 사용:
   ```bash
   # 온라인 YAML 검증기 사용
   # 또는
   python -c "import yaml; yaml.safe_load(open('cloudbuild.yaml'))"
   ```

2. 들여쓰기 확인 (공백 2개 사용, 탭 사용 금지)

3. 특수 문자 이스케이프:
   ```yaml
   # 잘못된 예시
   - '-d'
   - '{"text":"Deployment completed: $_ENVIRONMENT"}'
   
   # 올바른 예시
   - '-d'
   - '{"text":"Deployment completed: $_ENVIRONMENT"}'
   ```

---

## 3. 인증 오류

### 3.1 Firebase 토큰 인증 실패

**오류 메시지**:
```
Error: Failed to authenticate with Firebase. Please run firebase login.
```

**원인**:
- `_FIREBASE_TOKEN` substitution 변수가 설정되지 않음
- 토큰이 만료됨
- Secret Manager에서 토큰을 가져오지 못함

**해결 방법**:

**방법 1: Substitution 변수로 토큰 전달**
```bash
# 트리거 설정에서 _FIREBASE_TOKEN substitution 변수 설정
# Secret Manager에서 가져오기:
gcloud builds triggers update curator-odyssey-prod-deploy \
  --update-substitutions=_FIREBASE_TOKEN=$(gcloud secrets versions access latest --secret=firebase-deploy-token) \
  --project=co-1016
```

**방법 2: cloudbuild.yaml에서 토큰 처리 통일**
```yaml
- name: 'gcr.io/$_PROJECT_ID/firebase'
  id: 'deploy-firebase'
  args:
    - 'deploy'
    - '--only'
    - 'hosting,functions,firestore:indexes'
    - '--project'
    - '$_PROJECT_ID'
    - '--token'
    - '${_FIREBASE_TOKEN}'
  env:
    - 'FIREBASE_TOKEN=${_FIREBASE_TOKEN}'
```

**검증**:
```bash
# 트리거 substitution 변수 확인
gcloud builds triggers describe curator-odyssey-prod-deploy \
  --project=co-1016 \
  --format="value(substitutions._FIREBASE_TOKEN)"
```

### 3.2 서비스 계정 권한 부족

**오류 메시지**:
```
Error: Permission denied: The caller does not have permission
```

**원인**:
- Cloud Build 서비스 계정에 필요한 권한이 없음
- Firebase Admin SDK 서비스 계정 권한 부족

**해결 방법**:
1. 필요한 권한 확인:
   ```bash
   gcloud projects get-iam-policy co-1016 \
     --flatten="bindings[].members" \
     --format="table(bindings.role)" \
     --filter="bindings.members:serviceAccount:501326088107@cloudbuild.gserviceaccount.com"
   ```

2. 권한 부여:
   ```bash
   # Firebase 배포 권한
   gcloud projects add-iam-policy-binding co-1016 \
     --member="serviceAccount:501326088107@cloudbuild.gserviceaccount.com" \
     --role="roles/firebase.admin"
   
   # Secret Manager 접근 권한
   gcloud projects add-iam-policy-binding co-1016 \
     --member="serviceAccount:501326088107@cloudbuild.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

---

## 4. 배포 오류

### 4.1 Firebase Builder 이미지 없음

**오류 메시지**:
```
ERROR: (gcloud.builds.triggers.run) Image 'gcr.io/co-1016/firebase' not found.
```

**원인**:
- Firebase builder 이미지가 프로젝트에 빌드되지 않음
- 이미지 경로가 잘못됨

**해결 방법**:

**방법 1: Firebase Builder 이미지 빌드**
```bash
# Firebase builder 이미지 빌드 스크립트 생성
cat > Dockerfile.firebase <<EOF
FROM node:20
RUN npm install -g firebase-tools
ENTRYPOINT ["firebase"]
EOF

# 이미지 빌드 및 푸시
gcloud builds submit --tag gcr.io/co-1016/firebase --project=co-1016
```

**방법 2: npm을 통한 Firebase CLI 사용 (권장)**
```yaml
# cloudbuild.yaml에서 npm을 통해 Firebase CLI 설치 후 사용
- name: 'gcr.io/cloud-builders/npm'
  id: 'install-firebase-cli'
  args: ['install', '-g', 'firebase-tools']
  waitFor: ['verify-build']

- name: 'gcr.io/cloud-builders/node'
  id: 'deploy-firebase'
  entrypoint: 'firebase'
  args:
    - 'deploy'
    - '--only'
    - 'hosting,functions,firestore:indexes'
    - '--project'
    - '$_PROJECT_ID'
    - '--token'
    - '${_FIREBASE_TOKEN}'
  waitFor: ['install-firebase-cli']
```

### 4.2 Firestore 인덱스 배포 실패

**오류 메시지**:
```
Error: Index creation failed: ...
```

**원인**:
- `firestore.indexes.json` 구문 오류
- 인덱스 정의가 Firestore 규칙과 충돌
- 단일 필드 인덱스를 명시적으로 정의 (Firestore가 자동 생성)

**해결 방법**:
1. 인덱스 구문 검증:
   ```bash
   firebase deploy --only firestore:indexes --dry-run --project=co-1016
   ```

2. 단일 필드 인덱스 제거:
   ```json
   // firestore.indexes.json에서 제거
   // 잘못된 예시:
   {
     "collectionGroup": "artist_summary",
     "queryScope": "COLLECTION",
     "fields": [
       {
         "fieldPath": "is_temporary",
         "order": "ASCENDING"
       }
     ]
   }
   // 단일 필드 인덱스는 Firestore가 자동 생성하므로 명시적으로 정의하지 않음
   ```

3. 로컬 검증 스크립트 실행:
   ```bash
   node scripts/firestore/validateIndexes.js --check-only
   ```

---

## 5. 검증 및 디버깅

### 5.1 빌드 로그 확인

**명령어**:
```bash
# 최근 빌드 목록
gcloud builds list --project=co-1016 --limit=10

# 특정 빌드 로그 확인
gcloud builds log <BUILD_ID> --project=co-1016

# 실시간 로그 스트리밍
gcloud builds log --stream --project=co-1016
```

### 5.2 cloudbuild.yaml 검증

**로컬 검증**:
```bash
# YAML 구문 검증
python -c "import yaml; yaml.safe_load(open('cloudbuild.yaml'))"

# Cloud Build 구문 검증 (빌드 실행 없이)
gcloud builds submit --config=cloudbuild.yaml --dry-run --project=co-1016
```

### 5.3 트리거 설정 확인

**명령어**:
```bash
# 트리거 설정 확인
gcloud builds triggers describe curator-odyssey-prod-deploy \
  --project=co-1016 \
  --format=yaml

# substitution 변수 확인
gcloud builds triggers describe curator-odyssey-prod-deploy \
  --project=co-1016 \
  --format="value(substitutions)"
```

### 5.4 단계별 디버깅

**문제가 있는 단계만 실행**:
```yaml
# cloudbuild.yaml에서 특정 단계만 실행하려면
# waitFor를 수정하여 이전 단계 건너뛰기
- name: 'gcr.io/cloud-builders/npm'
  id: 'test-step'
  args: ['run','test']
  waitFor: ['-']  # 이전 단계 대기 없이 실행
```

**디버깅 스크립트 추가**:
```yaml
- name: 'gcr.io/cloud-builders/gcloud'
  id: 'debug-info'
  script: |
    #!/bin/bash
    echo "=== 환경 변수 ==="
    env | grep -E "_(PROJECT_ID|ENVIRONMENT|FIREBASE)"
    echo "=== 현재 디렉토리 ==="
    pwd
    ls -la
```

---

## 6. 자주 묻는 질문 (FAQ)

### Q1: 왜 dry-run은 성공했는데 실제 배포는 실패하나요?

**A**: dry-run은 구문만 검증하며, 실제 권한이나 리소스 접근은 확인하지 않습니다. 서비스 계정 권한이나 Secret Manager 접근 권한을 확인하세요.

### Q2: Firebase Builder 이미지를 사용해야 하나요?

**A**: 필수는 아닙니다. npm을 통해 Firebase CLI를 설치하여 사용하는 방법도 있습니다. 커스텀 이미지를 사용하려면 먼저 빌드해야 합니다.

**npm 기반 방식 (권장)**:
```yaml
# Step 1: Firebase CLI 설치
- name: 'gcr.io/cloud-builders/npm'
  id: 'install-firebase-cli'
  args: ['install', '-g', 'firebase-tools']
  waitFor: ['verify-build']

# Step 2: Firebase 배포
- name: 'gcr.io/cloud-builders/node'
  id: 'deploy-firebase'
  entrypoint: 'firebase'
  args:
    - 'deploy'
    - '--only'
    - 'hosting,functions,firestore:indexes'
    - '--project'
    - '$_PROJECT_ID'
    - '--token'
    - '${_FIREBASE_TOKEN}'
  waitFor: ['install-firebase-cli']
```

**장점**:
- 이미지 빌드 불필요
- 빠른 설정 및 테스트
- 유지보수 용이

**단점**:
- 매 빌드마다 Firebase CLI 설치 (약 10-20초 소요)
- 이미지 빌드 방식 대비 약간 느림

### Q2-1: Firebase CLI 설치가 실패하는 경우

**오류 메시지**: `npm ERR! code EACCES` 또는 권한 오류

**원인**: npm 전역 설치 권한 문제

**해결**:
```yaml
# --unsafe-perm 플래그 추가 (필요한 경우)
- name: 'gcr.io/cloud-builders/npm'
  id: 'install-firebase-cli'
  args: ['install', '-g', 'firebase-tools', '--unsafe-perm']
  waitFor: ['verify-build']
```

### Q2-2: Firebase CLI가 설치되었지만 명령어를 찾을 수 없는 경우

**오류 메시지**: `firebase: command not found`

**원인**: 전역 설치 경로가 PATH에 없음

**해결**:
- `entrypoint: 'firebase'` 사용 (node 이미지에 PATH 포함)
- 또는 `script`를 사용하여 전체 경로 지정:
```yaml
- name: 'gcr.io/cloud-builders/node'
  id: 'deploy-firebase'
  script: |
    #!/bin/bash
    export PATH="/usr/local/bin:$PATH"
    firebase deploy --only hosting,functions,firestore:indexes --project=$_PROJECT_ID --token=${_FIREBASE_TOKEN}
  waitFor: ['install-firebase-cli']
```

### Q3: script와 args 중 어떤 것을 사용해야 하나요?

**A**:
- 단순 명령어: `args` 사용
- 복잡한 로직/파일 저장: `script` 사용
- 두 가지를 동시에 사용할 수 없습니다.

### Q4: Firestore 인덱스가 자동으로 배포되지 않나요?

**A**: Cloud Build 파이프라인에 `--only firestore:indexes`를 추가해야 합니다. 현재 `cloudbuild.yaml`에는 포함되어 있습니다.

---

## 7. 참조 문서

- [Cloud Build 트리거 설정 가이드](CLOUD_BUILD_TRIGGER_SETUP.md)
- [Cloud Build 모범 사례](CLOUD_BUILD_BEST_PRACTICES.md)
- [인프라 및 배포 가이드](../infrastructure/INFRASTRUCTURE_DEPLOYMENT_GUIDE.md)
- [프로덕션 배포 체크리스트](PRODUCTION_DEPLOYMENT_CHECKLIST.md)

---

## 8. 문제 해결 체크리스트

빌드 오류 발생 시 다음 항목을 확인하세요:

- [ ] `cloudbuild.yaml` 파일이 `main` 브랜치에 있는가?
- [ ] YAML 구문 오류가 없는가? (script/entrypoint 충돌 포함)
- [ ] `_FIREBASE_TOKEN` substitution 변수가 설정되어 있는가?
- [ ] 서비스 계정에 필요한 권한이 있는가?
- [ ] Firebase Builder 이미지가 존재하는가? (또는 npm으로 설치하는가?)
- [ ] `firestore.indexes.json`에 단일 필드 인덱스가 없는가?
- [ ] 빌드 로그를 확인하여 구체적인 오류 메시지를 확인했는가?

