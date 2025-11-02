# VERTEX AI COST MANAGEMENT (월 $30 한도)

## 1) 목표
- Gemini 1.5 Pro 호출 비용을 월 $30 이내로 유지
- 품질/지연/비용 균형(캐싱/샘플링/부분응답/폴백)

## 2) 한도/경보 정책
- 월간 예산: $30, 일일 상한: $1.5
- 임계치: 월 70%/90% 경보 → Slack 웹훅
- 차단: 100% 초과 시 폴백 강제(GPT-4 템플릿/통계 보고서)

## 3) 호출 전략
- 캐싱: 동일 입력 24h 캐시 (키: artist_id+weights_version+template)
- 샘플링: temperature 0.3~0.5, top_p 0.9, max_output_tokens 1024~1536
- 부분응답: Executive Summary 우선, 필요 시 섹션별 추가 호출
- 배치: 복수 아티스트 보고서는 섹션 병렬 대신 순차/부분화

## 4) 프롬프트/토큰 최적화
- vertexAIDataAdapter: 중요도 기반 압축(60~80%), 키포인트 우선
- 데이터 스니펫 길이 상한(예: 각 축 상위 N 시점)
- 메타데이터 버전만 표시, 원 데이터 링크 제공

## 5) 폴백 비용 모델
- 1차: Gemini 실패/차단 → GPT-4 mini(저가) 또는 gpt-4o-mini
- 2차: 템플릿 보고서(통계 기반)로 무료 대응
- 라우팅 규칙: 실패율>5% 또는 예산>90% 시 자동 폴백

## 6) 기술 설정
- Secret Manager: 모델/버전/최대 토큰/임계치 설정(app-config)
- Cloud Monitoring: 호출수/토큰수/오류율/비용 추정 지표 수집
- 알림: Functions 로그 기반 ErrorReporting + Slack

## 7) 운영 수칙
- 피크 시간대 큐 제한(동시성 N)
- 대형 요청은 섹션 분할/지연 허용
- 월말 3일 전 보고서 생성 요청은 요약 모드 강제

