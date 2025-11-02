# 🤖 CuratorOdyssey AI 기능 설정 가이드

## 📋 환경변수 설정

AI 분석 기능을 사용하려면 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```bash
# CuratorOdyssey AI Analysis Environment Variables
# ⚠️ 이 파일을 Git에 커밋하지 마세요!

# OpenAI API 설정 (필수)
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_OPENAI_MODEL=gpt-4

# Anthropic Claude API 설정 (백업용, 선택사항)
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Vertex AI 설정 (향후 백엔드 이전용)
REACT_APP_VERTEX_AI_PROJECT_ID=co-1016
REACT_APP_VERTEX_AI_LOCATION=asia-northeast3

# Firebase 설정 (기존 유지)
REACT_APP_FIREBASE_API_KEY=AIzaSyAKwV9CoxAQxmZiG3-yf60qacXlYWaCjs4
REACT_APP_FIREBASE_PROJECT_ID=co-1016
REACT_APP_FIREBASE_AUTH_DOMAIN=co-1016.firebaseapp.com
REACT_APP_FIREBASE_STORAGE_BUCKET=co-1016.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=501326088107
REACT_APP_FIREBASE_APP_ID=1:501326088107:web:9902f24a03638360e7b4ee

# AI 분석 설정 (선택사항)
REACT_APP_AI_CACHE_TTL=1800000
REACT_APP_AI_MAX_RETRIES=3
REACT_APP_AI_TIMEOUT=30000
```

## 🔑 API 키 발급 방법

### OpenAI API 키 (권장)
1. [OpenAI Platform](https://platform.openai.com/)에 가입
2. API Keys 섹션에서 새 API 키 생성
3. 위의 환경변수 파일에 키 입력

### Anthropic Claude API 키 (백업용)
1. [Anthropic Console](https://console.anthropic.com/)에 가입
2. API Keys에서 새 키 생성
3. 환경변수에 추가

## 🚀 기능 사용법

### 자동 AI 분석
- Phase 1 화면 진입 시 자동으로 AI 분석 실행
- 결과는 30분간 캐시되어 재사용
- 네트워크 오류 시 통계 기반 폴백 분석 제공

### 수동 새로고침
- AI 인사이트 패널의 🔄 버튼 클릭
- 캐시 무시하고 새로운 분석 생성
- 다양한 관점의 분석 결과 확인 가능

## ⚠️ 중요 보안 사항

### 현재 제약사항
- **dangerouslyAllowBrowser**: 브라우저에서 직접 API 호출
- **프로덕션 부적합**: 실제 서비스에서는 백엔드 이전 필수
- **API 키 노출 위험**: 개발 환경에서만 사용

### 프로덕션 권장사항
```javascript
// 향후 백엔드 구조
POST /api/ai/analyze
{
  "artistData": {...},
  "analysisType": "phase1"
}
```

## 🔧 문제 해결

### API 키 미설정
```
🤖❌ AI 분석 오류
API 연결 상태: API 키 미설정
```
**해결**: `.env.local` 파일에 올바른 API 키 설정

### 일일 한도 초과
```
일일 AI 분석 한도에 도달했습니다.
```
**해결**: OpenAI 계정의 사용량 한도 확인 및 증액

### 네트워크 오류
```
네트워크 연결을 확인하고 다시 시도해주세요.
```
**해결**: 인터넷 연결 확인, 방화벽/프록시 설정 점검

### 느린 응답
```
AI 분석 시간이 초과되었습니다.
```
**해결**: 
- 환경변수에서 `REACT_APP_AI_TIMEOUT` 증가 (기본 30초)
- 모델을 gpt-3.5-turbo로 변경하여 속도 향상

## 📊 성능 모니터링

### 캐시 통계 확인
```javascript
// 브라우저 콘솔에서 실행
import aiCache from './src/utils/ai/aiCache';
console.log(aiCache.getStats());
```

### AI 서비스 상태 확인  
```javascript
import aiService from './src/services/aiService';
aiService.checkConnection().then(console.log);
```

## 💰 비용 관리

### OpenAI GPT-4 요금 (참고)
- Input: $0.03/1K tokens
- Output: $0.06/1K tokens
- 평균 분석당: ~$0.05-0.15

### 비용 절약 팁
1. **캐시 활용**: 동일 데이터 30분간 재사용
2. **모델 선택**: 간단한 분석은 gpt-3.5-turbo 사용
3. **배치 처리**: 여러 아티스트 한 번에 분석
4. **프롬프트 최적화**: 불필요한 텍스트 제거

## 🔄 백업 시스템

### AI 실패 시 자동 폴백
1. **OpenAI 실패** → Anthropic Claude 시도
2. **모든 AI 실패** → 통계 기반 분석 제공
3. **데이터 부족** → 기본 템플릿 메시지

### 폴백 분석 예시
- 평균/최고/최저점 계산
- 강점/약점 축 자동 식별  
- 편차 분석을 통한 균형도 평가
- 축간 상관관계 분석

---

**AI 기능 관련 문의사항은 개발팀(Alex Chen)에게 연락 바랍니다.** 🤖✨
