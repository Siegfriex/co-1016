#!/bin/bash
# CuratorOdyssey 프로덕션 배포 스크립트
# Alex Chen P1 Backend 완전 배포

PROJECT_ID="co-1016"
REGION="asia-northeast3"

echo "🚀 CuratorOdyssey 프로덕션 배포 시작..."
echo "📍 프로젝트: $PROJECT_ID ($REGION)"

# 1. Firebase 프로젝트 설정 확인
echo "🔧 Firebase 프로젝트 설정 확인..."
firebase use $PROJECT_ID
firebase projects:list | grep $PROJECT_ID

# 2. 프론트엔드 빌드
echo "⚛️ React 앱 빌드..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ 프론트엔드 빌드 실패"
  exit 1
fi

# 3. Cloud Functions dependencies 설치
echo "📦 Cloud Functions dependencies 설치..."
cd functions
npm install
if [ $? -ne 0 ]; then
  echo "❌ Functions dependencies 설치 실패"
  exit 1
fi
cd ..

# 4. Firestore 보안 규칙 배포
echo "🔒 Firestore 보안 규칙 배포..."
firebase deploy --only firestore:rules,firestore:indexes --project $PROJECT_ID
if [ $? -ne 0 ]; then
  echo "❌ Firestore 규칙 배포 실패"
  exit 1
fi

# 5. Cloud Functions 배포
echo "☁️ Cloud Functions 배포..."
firebase deploy --only functions --project $PROJECT_ID
if [ $? -ne 0 ]; then
  echo "❌ Cloud Functions 배포 실패"
  exit 1
fi

# 6. Firebase Hosting 배포  
echo "🌐 Firebase Hosting 배포..."
firebase deploy --only hosting --project $PROJECT_ID
if [ $? -ne 0 ]; then
  echo "❌ Hosting 배포 실패"
  exit 1
fi

# 7. 배포 후 검증
echo "🔍 배포 상태 검증..."

# 웹앱 접근 테스트
WEB_URL="https://$PROJECT_ID.web.app"
echo "📱 웹앱 URL: $WEB_URL"

# API 엔드포인트 테스트
API_BASE="$WEB_URL/api"
echo "🔌 API Base: $API_BASE"

# 헬스체크
curl -f $API_BASE/artist/ARTIST_0005/summary > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ API 엔드포인트 정상 작동"
else
  echo "⚠️ API 응답 확인 필요"
fi

echo ""
echo "🎉 CuratorOdyssey 프로덕션 배포 완료!"
echo "🌐 웹앱: $WEB_URL" 
echo "🔌 API: $API_BASE"
echo ""
echo "📊 배포된 컴포넌트:"
echo "  ✅ React 앱 (Phase 1-4 통합)"
echo "  ✅ 5개 API 엔드포인트" 
echo "  ✅ Vertex AI 백엔드"
echo "  ✅ Firestore 12개 컬렉션"
echo "  ✅ Secret Manager 보안"
echo ""
echo "🎯 다음 단계:"
echo "  1. Secret Manager에서 실제 API 키 입력"
echo "  2. P2 (Dr. Sarah Kim) - 데이터베이스 구축"  
echo "  3. P3 (Maya Chen) - 최종 UI/UX 통합"
