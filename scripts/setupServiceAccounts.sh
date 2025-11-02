#!/bin/bash
# CuratorOdyssey 서비스 계정 권한 최적화 스크립트
# 1016blprint.md 명세: 기존 계정 활용 + 최소 권한 원칙

PROJECT_ID="co-1016"
API_SERVICE_ACCOUNT="firebase-adminsdk-fbsvc@co-1016.iam.gserviceaccount.com"
APP_ENGINE_ACCOUNT="co-1016@appspot.gserviceaccount.com"

echo "🔑 CuratorOdyssey 서비스 계정 권한 설정 시작..."
echo "📋 프로젝트: $PROJECT_ID"

# 1. Secret Manager 접근 권한
echo "🔐 Secret Manager 권한 설정..."
gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:$API_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor" \
  --project=$PROJECT_ID

gcloud secrets add-iam-policy-binding anthropic-api-key \
  --member="serviceAccount:$API_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor" \
  --project=$PROJECT_ID

gcloud secrets add-iam-policy-binding vertex-ai-credentials \
  --member="serviceAccount:$API_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor" \
  --project=$PROJECT_ID

gcloud secrets add-iam-policy-binding app-config \
  --member="serviceAccount:$API_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor" \
  --project=$PROJECT_ID

# 2. Firestore 접근 권한  
echo "🏪 Firestore 권한 설정..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$API_SERVICE_ACCOUNT" \
  --role="roles/datastore.user"

# 3. Vertex AI 접근 권한
echo "🧠 Vertex AI 권한 설정..."  
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$API_SERVICE_ACCOUNT" \
  --role="roles/aiplatform.user"

# 4. Cloud Logging 권한 (모니터링용)
echo "📊 Cloud Logging 권한 설정..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$API_SERVICE_ACCOUNT" \
  --role="roles/logging.logWriter"

# 5. Firebase Hosting 권한 (배포용)
echo "🌐 Firebase Hosting 권한 설정..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$API_SERVICE_ACCOUNT" \
  --role="roles/firebase.hostingAdmin"

echo "✅ 모든 서비스 계정 권한 설정 완료!"
echo ""
echo "🔍 권한 확인:"
echo "  - Secret Manager: 4개 시크릿 읽기 권한"
echo "  - Firestore: 데이터 읽기/쓰기 권한" 
echo "  - Vertex AI: AI 모델 호출 권한"
echo "  - Cloud Logging: 로그 기록 권한"
echo "  - Firebase Hosting: 웹앱 배포 권한"
echo ""
echo "🚀 다음 단계: firebase deploy --only functions,hosting,firestore"
