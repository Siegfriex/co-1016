# 피지컬 컴퓨팅 MVP 기능 요구사항 문서 (Physical Computing MVP Functional Requirements Document)

**버전**: MVP v1.1

**상태**: Draft (초안)

**최종 수정**: 2025-11-10

**소유자**: NEO GOD (Director)

**승인자**: Technical Lead (TBD)

**개정 이력**:
- MVP v1.0 (2025-11-13): 초기 작성
- MVP v1.1 (2025-11-10): 버전 동기화, 참조 문서 정리

**배포 범위**: Physical Computing MVP Development Team, Hardware Team, QA Team

**변경 관리 프로세스**: GitHub Issues/PR 워크플로, 변경 시 MVP_SRD/MVP_TSD/MVP_VID 동시 업데이트

**참조 문서 (References)**:
- **[BRD v1.1](../requirements/BRD.md)** - 피지컬 컴퓨팅 아트워크 및 웹앱 통합 비즈니스 요구사항
- **[피지컬 컴퓨팅 FRD](PHYSICAL_COMPUTING_FRD.md)** - 전체 기능 요구사항 문서
- **[피지컬 컴퓨팅 TSD](PHYSICAL_COMPUTING_TSD.md)** - 전체 기술 설계 문서
- **[피지컬 컴퓨팅 MVP TSD](MVP_PHYSICAL_COMPUTING_TSD.md)** - MVP 기술 설계 문서
- **[피지컬 컴퓨팅 MVP SRD](MVP_PHYSICAL_COMPUTING_SRD.md)** - MVP 소프트웨어 요구사항 문서

---

## 1. 문서 개요 (Introduction)

### 1.1 목적 (Purpose)

본 문서는 피지컬 컴퓨팅 아트워크의 MVP(Minimum Viable Product) 기능 요구사항을 정의합니다. MVP는 핵심 기능만 포함하여 하드웨어 작동성과 기본 인터랙션을 검증하는 것을 목표로 합니다.

**참고**: 본 문서는 MVP(Minimum Viable Product) 단계의 기능 요구사항을 정의합니다. 전체 기능 요구사항은 [피지컬 컴퓨팅 FRD](PHYSICAL_COMPUTING_FRD.md)를 참조하세요.

### 1.2 범위 (Scope)

**In Scope (MVP 포함)**:
- 배 모형 불도저 제어 (모터 2개, 조이스틱)
- 공 포집 검증 (그물망으로 탁구공/골프공/당구공 포집)
- 센서 데이터 수집 (조도 센서 1개, MPU-6050 1개, IR 센서 1개)
- 초음파 센서는 현재 사용 안함
- LED RGB 64 패널 표시 (게임 상태, 공 수집 현황)
- WiFi 통신 (최소 기능, HTTP POST만)

**Out of Scope (MVP 제외)**:
- 웹 페이지 연동 (우선순위 낮음)
- 공 개수 자동 카운팅 (동전 개수기)
- 점수 계산 엔진 (간단한 로직만)
- AI 매칭 시스템
- Firestore 저장 (로컬 로그만)
- WebSocket 통신 (HTTP POST만)
- CuratorOdyssey API 연동
- 보물 상자 선택 로직 (간단한 버튼 입력만)

### 1.3 대상 독자 (Audience)

- Physical Computing MVP 개발자 (ESP32-C3 펌웨어)
- 하드웨어 엔지니어 (배 모형 불도저 제작)
- QA 엔지니어 (MVP 테스트)

---

## 2. MVP 기능 요구사항 (MVP Functional Requirements)

### 2.1 FR-MVP-001: 배 모형 불도저 제어

#### 기능 설명

시스템은 배 모형 불도저를 모터 2개로 제어하여 계속 전진 상태를 유지하며, 조이스틱 입력에 따라 방향만 조정할 수 있어야 합니다.

#### 하드웨어 구성요소

- **모터 1 (왼쪽 바퀴)**: GPIO 2 (PWM), GPIO 3 (방향 제어)
- **모터 2 (오른쪽 바퀴)**: GPIO 4 (PWM), GPIO 5 (방향 제어)
- **조이스틱**: GPIO 9 (X축 ADC), GPIO 10 (Y축 ADC), GPIO 11 (버튼)

#### 입력 (Input)

**조이스틱 입력**:
- X축 값: 0-4095 (ADC 값, 중앙: ~2048)
- Y축 값: 0-4095 (ADC 값, 중앙: ~2048) - MVP에서는 사용하지 않음
- 버튼: HIGH/LOW (풀업 모드)

#### 출력 (Output)

**모터 제어 신호**:
- 모터 1 PWM: GPIO 2, 고정 속도 512 (0-1023 범위)
- 모터 1 방향: GPIO 3, HIGH (전진) 또는 LOW (역회전)
- 모터 2 PWM: GPIO 4, 고정 속도 512 (0-1023 범위)
- 모터 2 방향: GPIO 5, HIGH (전진) 또는 LOW (역회전)

#### 동작 로직

1. **기본 상태**: 양쪽 모터 모두 고정 속도로 전진 (속도 조절 불가)
2. **직진 모드**: 조이스틱 X축이 데드존 내 (중앙 ±50)
   - 모터 1: PWM=512, 방향=FORWARD
   - 모터 2: PWM=512, 방향=FORWARD
3. **좌회전 모드**: 조이스틱 X축 < -50
   - 모터 1: PWM=256 (또는 정지), 방향=REVERSE
   - 모터 2: PWM=512, 방향=FORWARD
4. **우회전 모드**: 조이스틱 X축 > 50
   - 모터 1: PWM=512, 방향=FORWARD
   - 모터 2: PWM=256 (또는 정지), 방향=REVERSE

#### 워크플로우

1. 시스템 초기화 시 모터 핀 설정 (GPIO 2, 3, 4, 5)
2. 메인 루프에서 조이스틱 X축 읽기 (GPIO 9)
3. 데드존 체크 (abs(x - 2048) < 50)
4. 조이스틱 값에 따라 모터 제어 모드 결정
5. PWM 및 방향 신호 출력
6. 100ms 주기로 반복

#### 사전 조건 (Preconditions)

- ESP32-C3 보드 초기화 완료
- 모터 드라이버 연결 완료
- 조이스틱 연결 완료

#### 사후 조건 (Postconditions)

- 배 모형이 계속 전진하며 방향 조정 가능
- 조이스틱 입력에 즉시 반응 (<100ms)

---

### 2.2 FR-MVP-002: 공 포집 검증

#### 기능 설명

시스템은 배 모형 불도저의 그물망을 통해 탁구공, 골프공, 당구공을 포집할 수 있어야 합니다. 공이 빠져나가는 상황도 연출 가능해야 합니다.

#### 하드웨어 구성요소

- **배 모형 불도저**: 그물망 부착
- **폼보드 판떼기**: 탁구공 지름(40mm), 골프공 지름(42.67mm), 당구공 지름(57mm)에 맞는 판떼기 각 3개씩 (총 9개)

#### 입력 (Input)

**물리적 입력**:
- 탁구공, 골프공, 당구공 (각각 폼보드로 대체 가능)

#### 출력 (Output)

**포집 결과**:
- 공이 그물망에 포집됨
- 공이 그물망 구멍(r1, r2)으로 빠져나감 (선택적)

#### 동작 로직

1. 배 모형이 계속 전진하며 그물망으로 공을 포집
2. 그물망 크기:
   - r1: 탁구공용 (작은 구멍)
   - r2: 골프공용 (중간 구멍)
   - 당구공은 그물망에 걸리도록 설계
3. 공이 빠져나가는 상황 연출 가능

#### 워크플로우

1. 배 모형을 공 위치로 이동 (조이스틱으로 방향 조정)
2. 그물망이 공을 포집
3. 포집 성공 여부 확인
4. 공이 빠져나가는지 확인 (선택적)

#### 사전 조건 (Preconditions)

- 배 모형 불도저 제작 완료
- 그물망 부착 완료
- 폼보드 판떼기 제작 완료

#### 사후 조건 (Postconditions)

- 탁구공/골프공/당구공 포집 가능
- 포집 성공률 ≥80%

---

### 2.3 FR-MVP-003: 센서 데이터 수집

#### 기능 설명

시스템은 조도 센서, 초음파 센서, IR 센서를 통해 게임 상태를 감지하고 데이터를 수집해야 합니다.

#### 하드웨어 구성요소

- **조도 센서 (CDS)**: GPIO 4 (ADC 입력)
- **MPU-6050**: GPIO 6 (SCL), GPIO 5 (SDA) - I2C 통신
- **초음파 센서**: 사용 안함
- **IR 센서**: GPIO 12 (Digital Input)

#### 입력 (Input)

**센서 입력**:
- 조도 센서: 0-4095 (ADC 값)
- MPU-6050: 가속도/자이로 데이터 (I2C 통신)
- 초음파 센서: 사용 안함 (distance=-1 고정)
- IR 센서: HIGH/LOW (감지 여부)

#### 출력 (Output)

**센서 데이터**:
```json
{
  "sensor_type": "light" | "ir" | "mpu6050",
  "sensor_id": 1,
  "light_value": 800,      // 조도 센서만 (0-4095)
  "distance": -1,          // 초음파 센서 사용 안함 (고정값)
  "detected": true,        // IR 센서만 (boolean)
  "timestamp": 1699612800000  // milliseconds
}
```

#### 동작 로직

1. **조도 센서 읽기**:
   - GPIO 4에서 ADC 값 읽기 (0-4095)
   - 100ms 주기로 읽기
   - 공 감지 시 값 변화 감지

2. **MPU-6050 읽기** (I2C 통신):
3. **초음파 센서 읽기** (사용 안함):
   - GPIO 7에 Trigger 신호 출력 (10μs HIGH)
   - GPIO 8에서 Echo 신호 대기
   - 펄스 폭 측정하여 거리 계산
   - 구간 진입 감지 (거리 < 30cm)

3. **IR 센서 읽기**:
   - GPIO 12에서 디지털 값 읽기
   - 배 감지 시 HIGH (또는 LOW, 센서 타입에 따라)
   - 골인 지점 감지

#### 워크플로우

1. 메인 루프에서 각 센서 읽기
2. 센서 값이 이전 값과 변경되었는지 확인
3. 변경된 경우 데이터 패키징
4. WiFi로 전송 (FR-MVP-005)

#### 사전 조건 (Preconditions)

- 센서 연결 완료
- 센서 캘리브레이션 완료

#### 사후 조건 (Postconditions)

- 센서 값 정확히 읽기 가능
- 센서 읽기 주기 100ms 유지
- 오차율 <5%

---

### 2.4 FR-MVP-004: LED RGB 64 패널 표시

#### 기능 설명

시스템은 LED RGB 64 패널(8x8 매트릭스)을 통해 게임 상태와 공 수집 현황을 시각적으로 표시해야 합니다.

#### 하드웨어 구성요소

- **LED RGB 64 패널**: GPIO 13 (DIN), GPIO 14 (CLK), GPIO 15 (CS)
- **패널 사양**: 8x8 매트릭스, WS2812B 또는 유사 LED 드라이버

#### 입력 (Input)

**게임 상태 데이터**:
- 현재 게임 상태 (초기화, 대기, 게임 진행, 골인)
- 공 수집 현황 (탁구공/골프공/당구공 개수)
- 센서 상태

#### 출력 (Output)

**LED 패널 표시**:
- 게임 상태별 패턴 표시
- 공 수집 현황 표시
- 센서 상태 표시

#### 동작 로직

1. **게임 상태 표시**:
   - 초기화: 전체 깜빡임
   - 대기: 중앙 점 표시
   - 게임 진행: 진행 방향 화살표
   - 골인: 전체 밝기 증가

2. **공 수집 현황 표시**:
   - 탁구공: 좌측 상단 영역
   - 골프공: 중앙 영역
   - 당구공: 우측 하단 영역
   - 각 공 개수에 따라 밝기 조절

3. **LED 업데이트**:
   - 30fps 업데이트 주기
   - 버퍼에 패턴 저장 후 한 번에 출력

#### 워크플로우

1. 게임 상태 변경 감지
2. 해당 상태에 맞는 LED 패턴 생성
3. LED 패널 버퍼 업데이트
4. GPIO 13, 14, 15를 통해 데이터 전송
5. 33ms마다 반복 (30fps)

#### 사전 조건 (Preconditions)

- LED RGB 64 패널 연결 완료
- LED 드라이버 라이브러리 로드 완료

#### 사후 조건 (Postconditions)

- LED 패널로 게임 상태 표시 가능
- LED 업데이트 30fps 유지
- 패턴이 명확히 표시됨

---

### 2.5 FR-MVP-005: WiFi 통신 (최소 기능)

#### 기능 설명

시스템은 WiFi를 통해 센서 데이터를 백엔드로 전송해야 합니다. MVP에서는 HTTP POST만 사용하며, WebSocket은 제외합니다.

#### 하드웨어 구성요소

- **WiFi**: ESP32-C3 내장 WiFi 모듈

#### 입력 (Input)

**센서 데이터** (FR-MVP-003에서 생성):
```json
{
  "sensor_type": "light" | "ir" | "mpu6050",
  "sensor_id": 1,
  "light_value": 800,
  "distance": 15.5,
  "detected": true,
  "timestamp": 1699612800000
}
```

#### 출력 (Output)

**HTTP POST 요청**:
- 엔드포인트: `POST http://{BACKEND_HOST}:8000/api/sensor-data`
- Content-Type: `application/json`
- 요청 본문: 센서 데이터 JSON

**HTTP 응답**:
```json
{
  "status": "ok",
  "processed": true
}
```

#### 동작 로직

1. **WiFi 연결**:
   - SSID와 비밀번호로 연결 시도
   - 연결 실패 시 재시도 (최대 3회)
   - 연결 성공 시 IP 주소 획득

2. **센서 데이터 전송**:
   - 센서 데이터가 변경된 경우에만 전송
   - HTTP POST 요청 생성
   - 소켓 연결 후 요청 전송
   - 응답 대기 (타임아웃 5초)
   - 응답 파싱 및 로그 기록

3. **에러 처리**:
   - WiFi 연결 실패: 재연결 시도
   - HTTP 요청 실패: 재시도 (최대 3회)
   - 타임아웃: 에러 로그 기록

#### 워크플로우

1. 시스템 초기화 시 WiFi 연결 시도
2. 메인 루프에서 센서 데이터 수집
3. 센서 데이터 변경 감지
4. JSON 데이터 생성
5. HTTP POST 요청 전송
6. 응답 수신 및 처리
7. 에러 발생 시 재시도

#### 사전 조건 (Preconditions)

- WiFi 네트워크 접근 가능
- 백엔드 서버 실행 중
- WiFi SSID 및 비밀번호 설정 완료

#### 사후 조건 (Postconditions)

- 센서 데이터 전송 성공률 ≥95%
- 통신 지연 <500ms
- 에러 발생 시 적절히 처리

---

## 3. API 엔드포인트 매핑 (MVP)

### 3.1 RESTful API 엔드포인트

MVP에서는 최소 기능만 제공합니다.

| 메서드 | 엔드포인트 | 설명 | FR 매핑 |
|--------|-----------|------|---------|
| POST | `/api/sensor-data` | 센서 데이터 수신 (ESP32-C3 → 백엔드) | FR-MVP-003, FR-MVP-005 |

### 3.2 센서 데이터 수신 API 상세

#### POST /api/sensor-data

**설명**: ESP32-C3에서 센서 데이터를 HTTP POST로 전송하는 엔드포인트입니다.

**요청 본문 형식**:

**조도 센서**:
```json
{
  "sensor_type": "light",
  "sensor_id": 1,
  "light_value": 800,  // 0-4095
  "timestamp": 1699612800000
}
```

**초음파 센서**:
```json
{
  "sensor_type": "ultrasonic",
  "sensor_id": 1,
  "distance": 15.5,  // cm
  "timestamp": 1699612800000
}
```

**IR 센서**:
```json
{
  "sensor_type": "ir",
  "sensor_id": 1,
  "detected": true,
  "timestamp": 1699612800000
}
```

**응답**:
```json
{
  "status": "ok",
  "processed": true
}
```

**에러 응답**:
- `400 Bad Request`: 잘못된 센서 데이터 형식
- `500 Internal Server Error`: 서버 오류

---

## 4. 데이터 모델 (MVP)

### 4.1 센서 데이터 스키마

**조도 센서 데이터**:
```json
{
  "sensor_type": "light",
  "sensor_id": 1,
  "light_value": 800,  // 0-4095 (ADC 값)
  "timestamp": 1699612800000  // milliseconds
}
```

**초음파 센서 데이터**:
```json
{
  "sensor_type": "ultrasonic",
  "sensor_id": 1,
  "distance": 15.5,  // cm
  "timestamp": 1699612800000
}
```

**IR 센서 데이터**:
```json
{
  "sensor_type": "ir",
  "sensor_id": 1,
  "detected": true,  // boolean
  "timestamp": 1699612800000
}
```

### 4.2 게임 상태 데이터 (로컬)

MVP에서는 Firestore 저장 없이 로컬에서만 관리합니다.

```json
{
  "game_state": "waiting" | "playing" | "finished",
  "age_group": "10대" | "20대" | "30대" | null,
  "balls_collected": {
    "tier_1": 0,  // 당구공
    "tier_2": 0,  // 골프공
    "tier_3": 0   // 탁구공
  },
  "treasure_boxes_selected": []
}
```

---

## 5. 추적성 매트릭스 (Traceability Matrix)

### 5.1 FR ID → 하드웨어 구성요소 매핑

| FR ID | 기능 요구사항 | 하드웨어 구성요소 | GPIO 핀 |
|-------|-------------|-----------------|---------|
| FR-MVP-001 | 배 모형 불도저 제어 | 모터 우측 | GPIO 2 (PWM), GPIO 3 (방향) |
| FR-MVP-001 | 배 모형 불도저 제어 | 모터 좌측 | GPIO 8 (PWM), GPIO 9 (방향) |
| FR-MVP-001 | 배 모형 불도저 제어 | 조이스틱 | GPIO 1 (X축), GPIO 0 (Y축), GPIO 11 (버튼) |
| FR-MVP-002 | 공 포집 검증 | 배 모형 불도저 | 그물망 부착 |
| FR-MVP-002 | 공 포집 검증 | 폼보드 판떼기 | 9개 (탁구공/골프공/당구공 각 3개) |
| FR-MVP-003 | 센서 데이터 수집 | 조도 센서 | GPIO 4 (ADC) |
| FR-MVP-003 | 센서 데이터 수집 | MPU-6050 | GPIO 6 (SCL), GPIO 5 (SDA) |
| FR-MVP-003 | 센서 데이터 수집 | 초음파 센서 | 사용 안함 |
| FR-MVP-003 | 센서 데이터 수집 | IR 센서 | GPIO 12 (Digital Input) |
| FR-MVP-004 | LED RGB 64 패널 표시 | LED RGB 64 패널 | GPIO 20 (NEO, WS2812B 단일 핀) |
| FR-MVP-005 | WiFi 통신 | WiFi 모듈 | ESP32-C3 내장 |

### 5.2 FR ID → API 엔드포인트 매핑

| FR ID | 기능 요구사항 | RESTful API | 데이터 형식 |
|-------|-------------|-------------|------------|
| FR-MVP-003 | 센서 데이터 수집 | `POST /api/sensor-data` | JSON (센서 타입별) |
| FR-MVP-005 | WiFi 통신 | `POST /api/sensor-data` | HTTP POST |

### 5.3 FR ID → 테스트 케이스 매핑

| FR ID | 기능 요구사항 | 테스트 케이스 ID | 테스트 케이스 설명 |
|-------|-------------|-----------------|------------------|
| FR-MVP-001 | 배 모형 불도저 제어 | TC-MVP-001-01 | 직진 모드 테스트 |
| FR-MVP-001 | 배 모형 불도저 제어 | TC-MVP-001-02 | 좌회전 모드 테스트 |
| FR-MVP-001 | 배 모형 불도저 제어 | TC-MVP-001-03 | 우회전 모드 테스트 |
| FR-MVP-002 | 공 포집 검증 | TC-MVP-002-01 | 탁구공 포집 테스트 |
| FR-MVP-002 | 공 포집 검증 | TC-MVP-002-02 | 골프공 포집 테스트 |
| FR-MVP-002 | 공 포집 검증 | TC-MVP-002-03 | 당구공 포집 테스트 |
| FR-MVP-003 | 센서 데이터 수집 | TC-MVP-003-01 | 조도 센서 읽기 테스트 |
| FR-MVP-003 | 센서 데이터 수집 | TC-MVP-003-02 | MPU-6050 읽기 테스트 |
| FR-MVP-003 | 센서 데이터 수집 | TC-MVP-003-03 | 초음파 센서 사용 안함 확인 |
| FR-MVP-003 | 센서 데이터 수집 | TC-MVP-003-03 | IR 센서 읽기 테스트 |
| FR-MVP-004 | LED RGB 64 패널 표시 | TC-MVP-004-01 | 게임 상태 표시 테스트 |
| FR-MVP-004 | LED RGB 64 패널 표시 | TC-MVP-004-02 | 공 수집 현황 표시 테스트 |
| FR-MVP-005 | WiFi 통신 | TC-MVP-005-01 | WiFi 연결 테스트 |
| FR-MVP-005 | WiFi 통신 | TC-MVP-005-02 | 센서 데이터 전송 테스트 |

---

## 6. 참조 문서

- [BRD v1.1 Section 3](../requirements/BRD.md#3-기능-요구사항-functional-requirements) - 기능 요구사항 비즈니스 명세
- [피지컬 컴퓨팅 FRD](PHYSICAL_COMPUTING_FRD.md) - 전체 기능 요구사항 문서
- [피지컬 컴퓨팅 MVP TSD](MVP_PHYSICAL_COMPUTING_TSD.md) - MVP 기술 설계 문서
- [피지컬 컴퓨팅 MVP SRD](MVP_PHYSICAL_COMPUTING_SRD.md) - MVP 소프트웨어 요구사항 문서

