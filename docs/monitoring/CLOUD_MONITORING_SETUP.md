# CLOUD MONITORING SETUP

## 1) 목표
- Functions/Firestore/Vertex AI 관측성 표준화
- 실패율/지연/비용 지표 기반 경보 설정

## 2) 대시보드 (샘플 지표)
- Functions: 요청수, 오류율, p95 지연, 메모리/콜드스타트
- Firestore: 읽기/쓰기/지연, 쿼리 실패율
- Vertex AI: 호출수, 오류율(HTTP 5xx/429), 평균 토큰수

## 3) 알림 정책
- Vertex 실패율 ≥5% (5분 윈도우) → Slack
- Functions 오류율 ≥2% (연속 10분) → PagerDuty/Slack
- 비용 임계치(예산 70%/90%) → Slack

## 4) 구현 단계
- Logs-based Metrics: Functions 라우트별 status code 카운터
- Dashboards API: 대시보드 JSON 템플릿 버전 관리
- AlertPolicy: gcloud 또는 콘솔로 임계치/윈도우 구성

## 5) SystemHealthDashboard 연동 지침
- `/api/ai/vertex-health` ping 주기: 30초
- /api/* 헬스체크 응답시간 측정 및 UI 표시(색상/배지)
- 상태 불량 시 데이터 소스 자동 폴백(API→Hybrid→Mock)

## 6) 예시: gcloud 알림 생성
```bash
# Vertex 실패율 ≥5% 경보 (예시)
# 세부 리소스/메트릭 명은 실제 배포 후 콘솔에서 확인하여 반영
```

