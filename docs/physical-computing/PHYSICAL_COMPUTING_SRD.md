# 피지컬 컴퓨팅 소프트웨어 요구사항 문서 (Physical Computing Software Requirements Document)

**버전**: v1.1

**상태**: Draft (초안)

**최종 수정**: 2025-11-10

**소유자**: NEO GOD (Director)

**승인자**: Technical Lead (TBD)

**개정 이력**:
- v1.1 (2025-11-10): 초기 작성 (MVP 포함 + 향후 확장 수용 기준)

**배포 범위**: Physical Computing Development Team, Hardware Team, Backend Team, QA Team

**변경 관리 프로세스**: GitHub Issues/PR 워크플로, 변경 시 FRD/TSD/VID 동시 업데이트

**참조 문서 (References)**:
- **[BRD v1.1](../requirements/BRD.md)** - 피지컬 컴퓨팅 아트워크 및 웹앱 통합 비즈니스 요구사항
- **[피지컬 컴퓨팅 FRD](PHYSICAL_COMPUTING_FRD.md)** - 기능 요구사항 문서
- **[피지컬 컴퓨팅 MVP SRD](MVP_PHYSICAL_COMPUTING_SRD.md)** - MVP 소프트웨어 요구사항 문서
- **[피지컬 컴퓨팅 TSD](PHYSICAL_COMPUTING_TSD.md)** - 기술 설계 문서

---

## 1. 문서 개요 (Introduction)

### 1.1 목적 (Purpose)

본 문서는 피지컬 컴퓨팅 아트워크의 전체 소프트웨어 요구사항을 검증 가능한 조건, 성능 지표, 테스트 시나리오로 상세화합니다. MVP 단계의 수용 기준과 향후 확장 기능의 수용 기준을 포함하여, 전체 시스템 검증을 위한 테스트 케이스를 정의합니다.

**참고**: MVP 단계 수용 기준은 [피지컬 컴퓨팅 MVP SRD](MVP_PHYSICAL_COMPUTING_SRD.md)를 참조하세요.

### 1.2 범위 (Scope)

**In Scope (전체 버전 포함)**:
- MVP 수용 기준 검증 조건 정의
- 향후 확장 기능 수용 기준 정의
- 성능 지표 및 측정 방법
- 테스트 시나리오 및 케이스
- 하드웨어/소프트웨어 통합 테스트

**Out of Scope (범위 외)**:
- CuratorOdyssey 웹앱 UI/UX 테스트 (별도 문서)
- 외부 API 서비스 테스트 (별도 문서)

### 1.3 대상 독자 (Audience)

- QA 엔지니어 (테스트 계획 및 실행)
- Physical Computing 개발자 (수용 기준 이해)
- 하드웨어 엔지니어 (센서 정확도 검증)
- 백엔드 개발자 (API 및 WebSocket 테스트)

---

## 2. MVP 수용 기준 (요약)

본 섹션은 MVP 단계의 수용 기준을 요약합니다. 상세한 내용은 [피지컬 컴퓨팅 MVP SRD](MVP_PHYSICAL_COMPUTING_SRD.md)를 참조하세요.

### 2.1 MVP 수용 기준 목록

1. **AC-MVP-001: 배 모형 불도저 작동성**
   - 모터 반응 속도 <100ms
   - 방향 전환 정확도 100%

2. **AC-MVP-002: 공 포집 검증**
   - 센서 감지 정확도 ≥95%
   - 센서 읽기 주기 100ms

3. **AC-MVP-003: LED RGB 64 패널 표시**
   - LED 업데이트 주기 33ms (30fps)
   - 표시 정확도 100%

4. **AC-MVP-004: WiFi 통신**
   - HTTP POST 요청 성공률 ≥95%
   - 통신 지연 <500ms

5. **AC-MVP-005: 로컬 로그 저장**
   - 로그 파일 저장 성공률 100%
   - JSONL 형식 준수

**참조**: [MVP SRD Section 2](MVP_PHYSICAL_COMPUTING_SRD.md#2-mvp-수용-기준-상세-명세-detailed-acceptance-criteria)

---

## 3. 향후 확장 수용 기준

### 3.1 AC-PHYS-001: 게임 시작 및 세션 관리

**검증 조건 (Testable Conditions)**:
1. 세션 ID 생성 시간 <500ms
2. WebSocket 연결 성공률 ≥99%
3. 세션 ID 고유성 보장 (중복 없음)
4. Firestore 저장 성공률 100%

**성능 지표 (Performance Metrics)**:

| 지표 | 목표 값 | 측정 방법 |
|------|--------|----------|
| 세션 생성 시간 | <500ms | 게임 시작 신호부터 세션 ID 생성까지 시간 측정 |
| WebSocket 연결 성공률 | ≥99% | 100회 시도 중 성공 횟수 측정 |
| 세션 ID 고유성 | 100% | 중복 세션 ID 발생 여부 확인 |
| Firestore 저장 성공률 | 100% | 세션 데이터 저장 성공 횟수 측정 |

**테스트 케이스**: TC-PHYS-001 (세션 생성 및 WebSocket 연결)

**참조**: [FRD Section 3.1](PHYSICAL_COMPUTING_FRD.md#31-fr-phys-001-게임-시작-및-세션-관리)

---

### 3.2 AC-PHYS-002: 공 수집 시스템

**검증 조건 (Testable Conditions)**:
1. 센서 감지 정확도 ≥95%
2. 점수 계산 시간 <100ms
3. CuratorOdyssey 일관성 검증 통과 (±0.5p)
4. WebSocket 실시간 업데이트 지연 <200ms

**성능 지표 (Performance Metrics)**:

| 지표 | 목표 값 | 측정 방법 |
|------|--------|----------|
| 센서 감지 정확도 | ≥95% | 실제 공 수집 개수 대비 센서 감지 개수 비율 |
| 점수 계산 시간 | <100ms | 공 수집 데이터부터 점수 계산 완료까지 시간 |
| 일관성 검증 통과율 | 100% | ±0.5p 허용 오차 내 일관성 검증 통과 횟수 |
| WebSocket 업데이트 지연 | <200ms | 센서 데이터 수집부터 WebSocket 전송까지 시간 |

**테스트 케이스**: TC-PHYS-002 (공 수집 및 점수 계산)

**참조**: [FRD Section 3.2](PHYSICAL_COMPUTING_FRD.md#32-fr-phys-002-공-수집-시스템-노력)

---

### 3.3 AC-PHYS-003: 보물 상자 선택 시스템

**검증 조건 (Testable Conditions)**:
1. 각 나이대에서 정확히 1개 선택 (필수)
2. 선택 순서 검증 (10대 → 20대 → 30대)
3. 주 페르소나 생성 정확도 100%
4. Firestore 저장 성공률 100%

**성능 지표 (Performance Metrics)**:

| 지표 | 목표 값 | 측정 방법 |
|------|--------|----------|
| 선택 정확도 | 100% | 각 나이대에서 정확히 1개 선택 여부 확인 |
| 순서 검증 정확도 | 100% | 선택 순서가 10대→20대→30대인지 확인 |
| 주 페르소나 생성 정확도 | 100% | 생성된 주 페르소나가 선택된 보물 상자와 일치하는지 확인 |
| Firestore 저장 성공률 | 100% | 보물 상자 선택 데이터 저장 성공 횟수 측정 |

**테스트 케이스**: TC-PHYS-003 (보물 상자 선택 및 주 페르소나 생성)

**참조**: [FRD Section 3.3](PHYSICAL_COMPUTING_FRD.md#33-fr-phys-003-보물-상자-선택-시스템-우연)

---

### 3.4 AC-PHYS-004: 점수 계산 엔진

**검증 조건 (Testable Conditions)**:
1. 점수 계산 시간 <100ms
2. 일관성 검증 통과율 100%
3. CuratorOdyssey 데이터 구조와 일치도 100%
4. 레이더 5축 및 선버스트 4축 점수 정확도 100%

**성능 지표 (Performance Metrics)**:

| 지표 | 목표 값 | 측정 방법 |
|------|--------|----------|
| 점수 계산 시간 | <100ms | 공 수집 데이터부터 점수 계산 완료까지 시간 |
| 일관성 검증 통과율 | 100% | ±0.5p 허용 오차 내 일관성 검증 통과 횟수 |
| CuratorOdyssey 일치도 | 100% | 계산된 점수가 CuratorOdyssey 가중치 시스템과 일치하는지 확인 |
| 점수 정확도 | 100% | 레이더 5축 및 선버스트 4축 점수 계산 정확도 |

**테스트 케이스**: TC-PHYS-004 (점수 계산 및 일관성 검증)

**참조**: [FRD Section 3.4](PHYSICAL_COMPUTING_FRD.md#34-fr-phys-004-점수-계산-엔진-curatorodyssey-가중치-적용)

---

### 3.5 AC-PHYS-005: AI 매칭 시스템

**검증 조건 (Testable Conditions)**:
1. AI 매칭 시간 <30초
2. 유사도 점수 ≥0.7 (70% 이상)
3. 스토리 생성 품질 검증 통과
4. Vertex AI API 호출 성공률 ≥95%

**성능 지표 (Performance Metrics)**:

| 지표 | 목표 값 | 측정 방법 |
|------|--------|----------|
| AI 매칭 시간 | <30초 | 주 페르소나 입력부터 매칭 완료까지 시간 |
| 유사도 점수 | ≥0.7 | 매칭된 작가와 플레이어의 유사도 점수 (0-1 범위) |
| 스토리 생성 품질 | 통과 | 생성된 스토리의 품질 검증 (수동 검토) |
| Vertex AI API 성공률 | ≥95% | Vertex AI API 호출 성공 횟수 측정 |

**테스트 케이스**: TC-PHYS-005 (AI 매칭 및 스토리 생성)

**참조**: [FRD Section 3.5](PHYSICAL_COMPUTING_FRD.md#35-fr-phys-005-ai-매칭-시스템)

---

### 3.6 AC-PHYS-006: 자동 모니터 제어

**검증 조건 (Testable Conditions)**:
1. IR 센서 감지 정확도 ≥95%
2. 모니터 켜기 지연 <2초
3. 결과 화면 표시 성공률 ≥95%
4. WebSocket 신호 전송 성공률 100%

**성능 지표 (Performance Metrics)**:

| 지표 | 목표 값 | 측정 방법 |
|------|--------|----------|
| IR 센서 감지 정확도 | ≥95% | 실제 배 감지 대비 센서 감지 횟수 비율 |
| 모니터 켜기 지연 | <2초 | IR 센서 감지부터 모니터 켜기까지 시간 |
| 결과 화면 표시 성공률 | ≥95% | 모니터 켜기 후 결과 화면 표시 성공 횟수 |
| WebSocket 신호 전송 성공률 | 100% | IR 센서 감지 시 WebSocket 신호 전송 성공 횟수 |

**테스트 케이스**: TC-PHYS-006 (IR 센서 감지 및 모니터 제어)

**참조**: [FRD Section 3.6](PHYSICAL_COMPUTING_FRD.md#36-fr-phys-006-자동-모니터-제어)

---

### 3.7 AC-PHYS-007: WebSocket 연결

**검증 조건 (Testable Conditions)**:
1. WebSocket 연결 성공률 ≥99%
2. 연결 유지 시간 ≥5분
3. 메시지 전송 지연 <200ms
4. 재연결 자동 복구 성공률 ≥90%

**성능 지표 (Performance Metrics)**:

| 지표 | 목표 값 | 측정 방법 |
|------|--------|----------|
| WebSocket 연결 성공률 | ≥99% | 100회 시도 중 성공 횟수 측정 |
| 연결 유지 시간 | ≥5분 | WebSocket 연결이 5분 이상 유지되는지 확인 |
| 메시지 전송 지연 | <200ms | 메시지 전송부터 수신까지 시간 측정 |
| 재연결 자동 복구 성공률 | ≥90% | 연결 끊김 후 자동 재연결 성공 횟수 측정 |

**테스트 케이스**: TC-PHYS-007 (WebSocket 연결 및 통신)

**참조**: [TSD Section 3.2](PHYSICAL_COMPUTING_TSD.md#32-websocket-통신-프로토콜-상세)

---

### 3.8 AC-PHYS-008: Firestore 저장

**검증 조건 (Testable Conditions)**:
1. Firestore 저장 성공률 100%
2. 저장 지연 <500ms
3. 데이터 일관성 검증 통과
4. 트랜잭션 롤백 정확도 100%

**성능 지표 (Performance Metrics)**:

| 지표 | 목표 값 | 측정 방법 |
|------|--------|----------|
| Firestore 저장 성공률 | 100% | 데이터 저장 성공 횟수 측정 |
| 저장 지연 | <500ms | 데이터 저장 요청부터 완료까지 시간 |
| 데이터 일관성 | 통과 | 저장된 데이터가 원본과 일치하는지 확인 |
| 트랜잭션 롤백 정확도 | 100% | 오류 발생 시 트랜잭션 롤백 정확도 |

**테스트 케이스**: TC-PHYS-008 (Firestore 저장 및 검증)

**참조**: [TSD Section 3.4](PHYSICAL_COMPUTING_TSD.md#34-firestore-통합-설계)

---

### 3.9 AC-PHYS-009: CuratorOdyssey API 연동

**검증 조건 (Testable Conditions)**:
1. API 호출 성공률 ≥95%
2. API 응답 시간 <2초
3. 데이터 파싱 정확도 100%
4. 에러 처리 정확도 100%

**성능 지표 (Performance Metrics)**:

| 지표 | 목표 값 | 측정 방법 |
|------|--------|----------|
| API 호출 성공률 | ≥95% | API 호출 성공 횟수 측정 |
| API 응답 시간 | <2초 | API 요청부터 응답까지 시간 |
| 데이터 파싱 정확도 | 100% | API 응답 데이터 파싱 정확도 |
| 에러 처리 정확도 | 100% | API 에러 발생 시 적절한 에러 처리 여부 확인 |

**테스트 케이스**: TC-PHYS-009 (CuratorOdyssey API 연동)

**참조**: [TSD Section 3.5](PHYSICAL_COMPUTING_TSD.md#35-curatorodyssey-api-연동-설계)

---

## 4. 통합 테스트 시나리오

### 4.1 End-to-End 테스트 시나리오

**TC-E2E-001: 전체 게임 플로우 테스트**

**전제 조건**:
- 모든 하드웨어 구성요소 연결 완료
- 백엔드 서버 실행 중
- Firestore 연결 가능
- Vertex AI API 키 설정 완료

**테스트 단계**:
1. 게임 시작 (세션 생성)
2. 공 수집 (센서 데이터 수집)
3. 보물 상자 선택 (10대, 20대, 30대 각 1개)
4. 점수 계산 및 일관성 검증
5. AI 매칭 (유사 작가 검색)
6. IR 센서 감지 (배 감지)
7. 모니터 자동 켜기 및 결과 화면 표시

**예상 결과**:
- 모든 단계가 순차적으로 완료
- 각 단계의 수용 기준 통과
- 최종 결과 화면에 주 페르소나, 점수, 매칭 작가 표시

**통과 기준**: 모든 단계의 수용 기준 통과

---

## 5. 성능 테스트

### 5.1 부하 테스트

**목표**: 동시 세션 처리 능력 검증

**테스트 조건**:
- 동시 세션 수: 10개
- 각 세션 지속 시간: 5분
- WebSocket 연결 유지

**성능 목표**:
- 모든 세션이 정상적으로 처리됨
- 평균 응답 시간 <500ms
- 메모리 사용량 <2GB

---

## 6. 참조 문서

- **[BRD v1.1](../requirements/BRD.md)** - 비즈니스 요구사항 문서
- **[피지컬 컴퓨팅 FRD](PHYSICAL_COMPUTING_FRD.md)** - 기능 요구사항 문서
- **[피지컬 컴퓨팅 MVP SRD](MVP_PHYSICAL_COMPUTING_SRD.md)** - MVP 소프트웨어 요구사항 문서
- **[피지컬 컴퓨팅 TSD](PHYSICAL_COMPUTING_TSD.md)** - 기술 설계 문서

---

## 7. 부록

### 7.1 테스트 환경

**하드웨어**:
- ESP32-C3 개발 보드
- 센서 시스템 (조도, MPU-6050, IR)
- 모터 드라이버 모듈
- LED RGB 64 패널

**소프트웨어**:
- Python 3.9+
- FastAPI 서버
- Google Cloud Firestore
- Vertex AI

**참조**: [하드웨어 세팅 블루프린트](HARDWARE_SETUP_BLUEPRINT.md), [하드웨어 세팅 체크리스트](HARDWARE_SETUP_CHECKLIST.md)

---

**문서 종료**

