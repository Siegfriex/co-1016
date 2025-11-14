# 피지컬 컴퓨팅 API 명세서 (Physical Computing API Specification)

**버전**: v1.1

**상태**: Draft (초안)

**최종 수정**: 2025-11-10

**소유자**: NEO GOD (Director)

**승인자**: Technical Lead (TBD)

**개정 이력**:
- v1.1 (2025-11-10): 초기 작성 (HTTP POST + WebSocket 프로토콜)

**배포 범위**: Physical Computing Development Team, Backend Team, Frontend Team, QA Team

**변경 관리 프로세스**: GitHub Issues/PR 워크플로, 변경 시 TSD/FRD/SRD 동시 업데이트

**참조 문서 (References)**:
- **[피지컬 컴퓨팅 TSD](PHYSICAL_COMPUTING_TSD.md)** - 기술 설계 문서
- **[피지컬 컴퓨팅 MVP TSD](MVP_PHYSICAL_COMPUTING_TSD.md)** - MVP 기술 설계 문서
- **[API Specification](../api/API_SPECIFICATION.md)** - WebSocket 클라이언트 프로토콜

---

## 1. 문서 개요 (Introduction)

### 1.1 목적 (Purpose)

본 문서는 피지컬 컴퓨팅 아트워크의 API 명세를 정의합니다. MVP 단계에서 사용하는 HTTP POST API와 향후 확장 기능에서 사용할 WebSocket API를 포함하여, 하드웨어(ESP32-C3)와 백엔드 서버 간의 통신 프로토콜을 상세히 명시합니다.

### 1.2 범위 (Scope)

**In Scope**:
- HTTP POST API 명세 (MVP)
- WebSocket API 명세 (향후 확장)
- 요청/응답 스키마
- 에러 코드 정의
- 인증 및 보안

**Out of Scope**:
- CuratorOdyssey 웹앱 API (별도 문서)
- Vertex AI API (Google Cloud 문서 참조)
- Firestore API (Google Cloud 문서 참조)

### 1.3 대상 독자 (Audience)

- 백엔드 개발자 (FastAPI 서버 구현)
- 하드웨어 개발자 (ESP32-C3 펌웨어 구현)
- 프론트엔드 개발자 (WebSocket 클라이언트 구현)
- QA 엔지니어 (API 테스트)

---

## 2. HTTP POST API 명세 (MVP)

### 2.1 엔드포인트 개요

**Base URL**:
- 개발 환경: `http://localhost:8000`
- 프로덕션 환경: `https://physical-game.example.com` (실제 도메인으로 변경 필요)

**API 버전**: v1

**인증**: 현재 인증 없음 (향후 필요 시 추가)

---

### 2.2 POST /api/sensor-data

**설명**: 센서 데이터를 백엔드 서버로 전송합니다. MVP에서는 조도 센서, 초음파 센서, IR 센서 데이터를 수신합니다.

**요청**:

**HTTP Method**: `POST`

**URL**: `/api/sensor-data`

**Headers**:
```
Content-Type: application/json
Content-Length: {json_length}
```

**요청 본문 (조도 센서)**:
```json
{
  "sensor_type": "light",
  "sensor_id": 1,
  "light_value": 800,
  "timestamp": 1699612800000
}
```

**요청 본문 (초음파 센서)**:
```json
{
  "sensor_type": "ultrasonic",
  "sensor_id": 1,
  "distance": 15.5,
  "timestamp": 1699612800000
}
```

**요청 본문 (IR 센서)**:
```json
{
  "sensor_type": "ir",
  "sensor_id": 1,
  "detected": true,
  "timestamp": 1699612800000
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 범위/형식 | 설명 |
|------|------|------|----------|------|
| `sensor_type` | string | Yes | `"light"`, `"ultrasonic"`, `"ir"` | 센서 타입 |
| `sensor_id` | integer | Yes | 1-255 | 센서 ID |
| `light_value` | integer | Yes* | 0-4095 | 조도 센서 값 (조도 센서만) |
| `distance` | float | Yes* | 0.0-400.0 | 초음파 센서 거리(cm) (초음파 센서만) |
| `detected` | boolean | Yes* | `true`, `false` | IR 센서 감지 여부 (IR 센서만) |
| `timestamp` | integer | Yes | Unix timestamp (ms) | 센서 데이터 수집 시간 |

*필수 조건: `sensor_type`에 따라 해당 필드만 필수

**응답**:

**성공 응답 (200 OK)**:
```json
{
  "status": "ok",
  "processed": true
}
```

**에러 응답 (400 Bad Request)**:
```json
{
  "error": {
    "code": "ERR_INVALID_DATA",
    "message": "Invalid sensor data format"
  }
}
```

**에러 응답 (500 Internal Server Error)**:
```json
{
  "error": {
    "code": "ERR_SERVER_ERROR",
    "message": "Internal server error"
  }
}
```

**에러 코드**:

| 코드 | HTTP 상태 | 설명 |
|------|----------|------|
| `ERR_INVALID_DATA` | 400 | 잘못된 센서 데이터 형식 |
| `ERR_INVALID_SENSOR_TYPE` | 400 | 잘못된 센서 타입 |
| `ERR_MISSING_FIELD` | 400 | 필수 필드 누락 |
| `ERR_SERVER_ERROR` | 500 | 서버 내부 오류 |

**참조**: [MVP TSD Section 5](MVP_PHYSICAL_COMPUTING_TSD.md#5-통신-프로토콜-명세-communication-protocol)

---

## 3. WebSocket API 명세 (향후 확장)

### 3.1 연결 설정

**WebSocket URL**:
- 개발 환경: `ws://localhost:8000/ws`
- 프로덕션 환경: `wss://physical-game.example.com/ws` (실제 도메인으로 변경 필요)

**프로토콜**: WebSocket (RFC 6455)

**인증**: 현재 인증 없음 (향후 필요 시 추가)

**연결 예시 (Python)**:
```python
import asyncio
import websockets

async def connect():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        # 메시지 수신
        message = await websocket.recv()
        print(f"Received: {message}")

asyncio.run(connect())
```

**연결 예시 (JavaScript)**:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket disconnected');
};
```

---

### 3.2 메시지 타입 정의

피지컬 컴퓨팅 아트워크 백엔드에서 웹앱으로 전송되는 메시지 타입은 다음과 같습니다:

#### 3.2.1 game_start

**설명**: 게임 시작 이벤트

**방향**: 서버 → 클라이언트

**메시지 형식**:
```json
{
  "type": "game_start",
  "session_id": "SESSION_123456",
  "started_at": "2025-11-10T10:00:00Z",
  "websocket_url": "ws://localhost:8000/ws"
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"game_start"` |
| `session_id` | string | Yes | 게임 세션 ID (패턴: `^SESSION_\d{6}$`) |
| `started_at` | string | Yes | 시작 시간 (ISO 8601) |
| `websocket_url` | string | Yes | WebSocket 연결 URL |

**참조**: [API_SPECIFICATION.md Section 4.6.2.1](../api/API_SPECIFICATION.md#4621-game_start)

---

#### 3.2.2 sensor_update

**설명**: 센서 데이터 업데이트 이벤트

**방향**: 서버 → 클라이언트

**메시지 형식**:
```json
{
  "type": "sensor_update",
  "session_id": "SESSION_123456",
  "sensor_data": {
    "sensor_type": "light",
    "sensor_id": 1,
    "light_value": 800,
    "timestamp": 1699612800000
  }
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"sensor_update"` |
| `session_id` | string | Yes | 게임 세션 ID |
| `sensor_data` | object | Yes | 센서 데이터 (HTTP POST 요청 본문과 동일) |

---

#### 3.2.3 ball_collected

**설명**: 공 수집 이벤트

**방향**: 서버 → 클라이언트

**메시지 형식**:
```json
{
  "type": "ball_collected",
  "session_id": "SESSION_123456",
  "tier": 1,
  "axis": "제도",
  "timestamp": "2025-11-10T10:02:00Z"
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"ball_collected"` |
| `session_id` | string | Yes | 게임 세션 ID |
| `tier` | integer | Yes | 공 티어 (1: 당구공, 2: 골프공, 3: 탁구공) |
| `axis` | string | Yes | 축 (`"제도"`, `"학술"`, `"담론"`, `"네트워크"`) |
| `timestamp` | string | Yes | 이벤트 발생 시간 (ISO 8601) |

**참조**: [API_SPECIFICATION.md Section 4.6.2.2](../api/API_SPECIFICATION.md#4622-ball_collected)

---

#### 3.2.4 treasure_box_selected

**설명**: 보물 상자 선택 이벤트

**방향**: 서버 → 클라이언트

**메시지 형식**:
```json
{
  "type": "treasure_box_selected",
  "session_id": "SESSION_123456",
  "box_id": 1,
  "age_group": "10대",
  "event_description": "구설수가 생기다",
  "timestamp": "2025-11-10T10:03:00Z"
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"treasure_box_selected"` |
| `session_id` | string | Yes | 게임 세션 ID |
| `box_id` | integer | Yes | 보물 상자 ID (1-9) |
| `age_group` | string | Yes | 나이대 (`"10대"`, `"20대"`, `"30대"`) |
| `event_description` | string | Yes | 이벤트 설명 |
| `timestamp` | string | Yes | 이벤트 발생 시간 (ISO 8601) |

**참조**: [API_SPECIFICATION.md Section 4.6.2.3](../api/API_SPECIFICATION.md#4623-treasure_box_selected)

---

#### 3.2.5 game_end

**설명**: 게임 종료 이벤트 (결과 데이터 포함)

**방향**: 서버 → 클라이언트

**메시지 형식**:
```json
{
  "type": "game_end",
  "session_id": "SESSION_123456",
  "data": {
    "main_persona": {
      "life_scenario": "구설수 → 퇴학 → 입대",
      "event_sequence": [
        "구설수가 생기다",
        "대학교에서 퇴학당하다",
        "군에 입대하다"
      ]
    },
    "calculated_metadata": {
      "radar5": {
        "I": 25.0,
        "F": 10.0,
        "A": 15.0,
        "M": 20.0,
        "Sedu": 3.0
      },
      "sunburst_l1": {
        "제도": 35.0,
        "학술": 20.0,
        "담론": 30.0,
        "네트워크": 15.0
      }
    },
    "ai_matching": {
      "matched_artist_id": "ARTIST_0005",
      "matched_artist_name": "헨리 마티스",
      "similarity_score": 0.85,
      "matching_reason": "유사한 인생 궤적과 작품 스타일",
      "generated_story": "AI 생성 스토리 텍스트...",
      "curator_odyssey_link": "/artist/ARTIST_0005"
    }
  },
  "timestamp": "2025-11-10T10:08:30Z"
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"game_end"` |
| `session_id` | string | Yes | 게임 세션 ID |
| `data` | object | Yes | 게임 세션 데이터 |
| `data.main_persona` | object | Yes | 주 페르소나 정보 |
| `data.calculated_metadata` | object | Yes | 계산된 메타데이터 (점수 등) |
| `data.ai_matching` | object | Yes | AI 매칭 결과 |
| `timestamp` | string | Yes | 이벤트 발생 시간 (ISO 8601) |

**참조**: [API_SPECIFICATION.md Section 4.6.2.4](../api/API_SPECIFICATION.md#4624-game_end)

---

#### 3.2.6 treasure_box_detected

**설명**: 보물 상자(배) 감지 이벤트 (IR 센서)

**방향**: 서버 → 클라이언트

**메시지 형식**:
```json
{
  "type": "treasure_box_detected",
  "session_id": "SESSION_123456",
  "timestamp": 1699612800000
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Yes | 메시지 타입: `"treasure_box_detected"` |
| `session_id` | string | Yes | 게임 세션 ID |
| `timestamp` | integer | Yes | 이벤트 발생 시간 (Unix timestamp, ms) |

**처리**: 웹앱은 이 메시지를 수신하면 모니터를 자동으로 켜고 결과 화면을 표시합니다.

**참조**: [API_SPECIFICATION.md Section 4.6.2.5](../api/API_SPECIFICATION.md#4625-treasure_box_detected)

---

### 3.3 에러 처리

**WebSocket 에러 메시지 형식**:
```json
{
  "type": "error",
  "code": "ERR_INVALID_MESSAGE",
  "message": "Invalid message format",
  "timestamp": "2025-11-10T10:00:00Z"
}
```

**에러 코드**:

| 코드 | 설명 |
|------|------|
| `ERR_INVALID_MESSAGE` | 잘못된 메시지 형식 |
| `ERR_INVALID_SESSION` | 잘못된 세션 ID |
| `ERR_CONNECTION_CLOSED` | 연결이 닫혔습니다 |
| `ERR_SERVER_ERROR` | 서버 내부 오류 |

---

## 4. 인증 및 보안

### 4.1 현재 상태

**인증**: 현재 인증 없음

**보안**: HTTP/HTTPS, WSS 사용 권장 (프로덕션 환경)

### 4.2 향후 계획

**인증 방식**: API 키 기반 인증 또는 JWT 토큰

**보안 강화**:
- HTTPS/WSS 필수 (프로덕션 환경)
- Rate Limiting 적용
- CORS 정책 설정

---

## 5. 참조 문서

- **[피지컬 컴퓨팅 TSD](PHYSICAL_COMPUTING_TSD.md)** - 기술 설계 문서
- **[피지컬 컴퓨팅 MVP TSD](MVP_PHYSICAL_COMPUTING_TSD.md)** - MVP 기술 설계 문서
- **[API Specification](../api/API_SPECIFICATION.md)** - WebSocket 클라이언트 프로토콜
- **[피지컬 컴퓨팅 FRD](PHYSICAL_COMPUTING_FRD.md)** - 기능 요구사항 문서

---

## 6. 부록

### 6.1 API 버전 관리

**현재 버전**: v1.1

**버전 관리 정책**:
- 주요 변경사항 발생 시 버전 업데이트
- 하위 호환성 유지 (가능한 경우)
- Deprecated API는 최소 1년간 유지

### 6.2 Rate Limiting

**현재**: Rate Limiting 없음

**향후 계획**:
- HTTP POST: 100 requests/minute per IP
- WebSocket: 10 connections per IP

---

**문서 종료**

