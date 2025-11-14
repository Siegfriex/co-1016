# 피지컬 컴퓨팅 기술 설계 문서 (Physical Computing Technical Design Document)

**버전**: v1.1

**상태**: Draft (초안)

**최종 수정**: 2025-11-10

**소유자**: NEO GOD (Director)

**승인자**: Technical Lead (TBD)

**개정 이력**:
- v1.1 (2025-11-10): 초기 작성 (MVP 포함 + 향후 확장 기술 설계)

**배포 범위**: Physical Computing Development Team, Hardware Team, Backend Team, QA Team

**변경 관리 프로세스**: GitHub Issues/PR 워크플로, 변경 시 FRD/SRD/VID 동시 업데이트

**참조 문서 (References)**:
- **[BRD v1.1](../requirements/BRD.md)** - 피지컬 컴퓨팅 아트워크 및 웹앱 통합 비즈니스 요구사항
- **[피지컬 컴퓨팅 FRD](PHYSICAL_COMPUTING_FRD.md)** - 기능 요구사항 문서
- **[피지컬 컴퓨팅 MVP TSD](MVP_PHYSICAL_COMPUTING_TSD.md)** - MVP 기술 설계 문서
- **[피지컬 컴퓨팅 SRD](PHYSICAL_COMPUTING_SRD.md)** - 소프트웨어 요구사항 문서
- **[피지컬 컴퓨팅 API Spec](PHYSICAL_COMPUTING_API_SPEC.md)** - API 명세서

---

## 1. 문서 개요 (Introduction)

### 1.1 문서 목적 (Purpose)

본 문서는 피지컬 컴퓨팅 아트워크의 전체 기술 설계를 상세히 정의합니다. MVP 단계의 기술 설계와 향후 확장 기술 설계를 포함하여, ESP32-C3 기반 하드웨어, Python FastAPI 백엔드, WebSocket 통신, AI 매칭 시스템, Firestore 통합 등 전체 시스템 아키텍처를 다룹니다.

**참고**: MVP 단계 기술 설계는 [피지컬 컴퓨팅 MVP TSD](MVP_PHYSICAL_COMPUTING_TSD.md)를 참조하세요.

### 1.2 프로젝트 개요 (Project Overview)

피지컬 컴퓨팅 아트워크는 CuratorOdyssey 플랫폼과 연동된 인터랙티브 아트워크 시스템입니다. 플레이어는 물리적 조작을 통해 "노력(공 수집)"과 "우연(보물 상자)"의 조합으로 자신만의 예술가 스토리를 생성하고, AI가 유사한 실제 작가를 매칭하여 제시합니다.

**주요 특징**:
- ESP32-C3 기반 하드웨어 시스템
- Python FastAPI 백엔드 서버
- WebSocket 실시간 통신
- Vertex AI 기반 AI 매칭 시스템
- Firestore 데이터베이스 통합
- CuratorOdyssey API 연동

### 1.3 대상 독자 (Audience)

- Physical Computing 개발자 (ESP32-C3 펌웨어, Python 백엔드)
- 하드웨어 엔지니어 (배 모형 불도저 제작)
- 백엔드 개발자 (FastAPI, WebSocket 서버)
- AI/ML 엔지니어 (Vertex AI 통합)
- QA 엔지니어 (전체 시스템 테스트)

---

## 2. MVP 기술 설계 (요약)

본 섹션은 MVP 단계의 기술 설계를 요약합니다. 상세한 내용은 [피지컬 컴퓨팅 MVP TSD](MVP_PHYSICAL_COMPUTING_TSD.md)를 참조하세요.

### 2.1 MVP 아키텍처 요약

**하드웨어 구성**:
- ESP32-C3 마이크로컨트롤러
- 모터 2개 (좌우 바퀴 제어)
- 조이스틱 (방향 제어)
- 센서 시스템 (조도 센서, MPU-6050, IR 센서)
- LED RGB 64 패널 (WS2812B NeoPixel)

**통신 프로토콜**:
- WiFi 통신 (HTTP POST만 사용)
- RESTful API 엔드포인트: `POST /api/sensor-data`

**데이터 저장**:
- 로컬 파일 기반 로그 저장 (JSONL 형식)
- Firestore 저장 미사용

**참조**: [MVP TSD Section 2-6](MVP_PHYSICAL_COMPUTING_TSD.md)

---

## 3. 향후 확장 기술 설계

### 3.1 Python FastAPI 백엔드 아키텍처

**프레임워크**: FastAPI (Python 3.9+)

**주요 구성요소**:
- RESTful API 서버 (HTTP 엔드포인트)
- WebSocket 서버 (실시간 통신)
- Firestore 클라이언트 (데이터베이스 통합)
- Vertex AI 클라이언트 (AI 매칭)
- CuratorOdyssey API 클라이언트 (작가 데이터 조회)

**서버 구조**:
```
physical-computing-backend/
├── main.py                 # FastAPI 앱 진입점
├── routers/
│   ├── sensor.py          # 센서 데이터 엔드포인트
│   ├── game.py            # 게임 세션 엔드포인트
│   └── websocket.py       # WebSocket 엔드포인트
├── services/
│   ├── scoring.py         # 점수 계산 엔진
│   ├── ai_matching.py     # AI 매칭 시스템
│   └── firestore.py       # Firestore 통합
├── models/
│   ├── sensor.py          # 센서 데이터 모델
│   ├── game.py            # 게임 세션 모델
│   └── artist.py          # 작가 데이터 모델
└── config.py              # 설정 파일
```

**참조**: [BRD v1.1 Section 10](../requirements/BRD.md#10-기술-요구사항)

---

### 3.2 WebSocket 통신 프로토콜 상세

**WebSocket 서버 설정**:
- URL: `ws://localhost:8000/ws` (개발 환경)
- URL: `wss://physical-game.example.com/ws` (프로덕션 환경)
- 프로토콜: WebSocket (RFC 6455)
- 인증: 현재 인증 없음 (향후 필요 시 추가)

**메시지 타입 정의**:

#### 3.2.1 game_start
**서버 → 클라이언트**:
```json
{
  "type": "game_start",
  "session_id": "SESSION_123456",
  "started_at": "2025-11-10T10:00:00Z",
  "websocket_url": "ws://localhost:8000/ws"
}
```

#### 3.2.2 sensor_update
**서버 → 클라이언트**:
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

#### 3.2.3 game_end
**서버 → 클라이언트**:
```json
{
  "type": "game_end",
  "session_id": "SESSION_123456",
  "ended_at": "2025-11-10T10:05:00Z",
  "final_scores": {
    "radar5": {
      "I": 7.0,
      "F": 3.0,
      "A": 0,
      "M": 8.0,
      "Sedu": 0
    }
  }
}
```

**참조**: [API Spec Section 4](PHYSICAL_COMPUTING_API_SPEC.md), [API_SPECIFICATION.md Section 4.6](../api/API_SPECIFICATION.md#46-websocket-통신-프로토콜-websocket-communication-protocol)

---

### 3.3 AI 매칭 시스템 설계 (Vertex AI 통합)

**Vertex AI 모델**: Gemini Pro (text-bison@001)

**매칭 프로세스**:

1. **보물 상자 조합식 조회**
   - Firestore `treasure_box_combinations` 컬렉션에서 조합 조회
   - `similar_artists` 배열 및 `storytelling_keyword` 획득

2. **CuratorOdyssey 작가 데이터 조회**
   - Firestore `artist_summary` 컬렉션에서 작가 데이터 조회
   - 우선 후보 작가 리스트 우선 조회

3. **Vertex AI 프롬프트 생성**
   ```python
   prompt = f"""
   주 페르소나: {main_persona}
   스토리텔링 키워드: {storytelling_keyword}
   플레이어 스펙:
   - 레이더 5축: {radar5_scores}
   - 선버스트 4축: {sunburst_scores}
   
   우선 후보 작가: {similar_artists}
   
   위 정보를 바탕으로 플레이어와 가장 유사한 작가 1명을 선정하고, 
   매칭 근거와 스토리를 생성하세요.
   """
   ```

4. **유사도 계산 및 매칭**
   - Vertex AI가 유사도 점수 계산 (0-1 범위)
   - 가장 높은 점수의 작가 1명 선정
   - 매칭 근거 및 스토리 생성

**참조**: [BRD v1.1 Section 3.5](../requirements/BRD.md#35-fr-phys-005-ai-매칭-시스템)

---

### 3.4 Firestore 통합 설계

**데이터베이스 구조**:

**컬렉션 1: physical_game_sessions**
- 세션 ID (PK)
- 시작/종료 시간
- 공 수집 데이터
- 보물 상자 선택 데이터
- 계산된 점수
- 매칭된 작가 정보

**컬렉션 2: treasure_box_combinations**
- 조합식 ID (PK)
- 보물 상자 ID 배열
- 스토리텔링 키워드
- 우선 후보 작가 리스트

**컬렉션 3: artist_summary** (CuratorOdyssey 연동)
- 작가 ID (PK)
- 작가 이름 (한국어/영어)
- 레이더 5축 점수
- 선버스트 4축 점수

**Firestore 클라이언트 설정**:
```python
from google.cloud import firestore

db = firestore.Client(project="curator-odyssey")
```

**참조**: [BRD v1.1 Section 4](../requirements/BRD.md#4-데이터-구조-및-스키마-data-structure--schema)

---

### 3.5 CuratorOdyssey API 연동 설계

**API 엔드포인트**: `https://api.curatorodyssey.com/v1/artists`

**주요 기능**:
- 작가 데이터 조회 (`GET /artists/{artist_id}`)
- 작가 목록 조회 (`GET /artists`)
- 작가 검색 (`GET /artists/search?q={query}`)

**인증**: API 키 기반 인증
```python
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
```

**참조**: [API_SPECIFICATION.md](../api/API_SPECIFICATION.md)

---

### 3.6 점수 계산 엔진 설계

**알고리즘**: CuratorOdyssey 가중치 시스템 적용

**티어별 기본 점수**:
- 티어 1 (당구공): 10점
- 티어 2 (골프공): 5점
- 티어 3 (탁구공): 2점

**레이더 5축 계산**:
```python
def calculate_radar5(balls_collected):
    tier1_counts = balls_collected["tier_1"]["axis_distribution"]
    
    I = tier1_counts["제도"] * 0.7 * 10
    F = tier1_counts["제도"] * 0.3 * 10
    A = tier1_counts["학술"] * 0.6 * 10
    M = tier1_counts["담론"] * 0.8 * 10
    Sedu = tier1_counts["학술"] * 0.15 * 10
    
    return {"I": I, "F": F, "A": A, "M": M, "Sedu": Sedu}
```

**선버스트 4축 계산**:
```python
def calculate_sunburst(balls_collected):
    sunburst = {}
    for axis in ["제도", "학술", "담론", "네트워크"]:
        score = (
            balls_collected["tier_1"]["axis_distribution"][axis] * 10 +
            balls_collected["tier_2"]["axis_distribution"][axis] * 5 +
            balls_collected["tier_3"]["axis_distribution"][axis] * 2
        )
        sunburst[axis] = score
    return sunburst
```

**일관성 검증 (±0.5p)**:
```python
def validate_consistency(radar5, sunburst):
    radar_sum = sum(radar5.values())
    mapped_sum = (
        sunburst["제도"] * 0.7 +
        sunburst["제도"] * 0.3 +
        sunburst["학술"] * 0.6 +
        sunburst["담론"] * 0.8 +
        sunburst["학술"] * 0.15
    )
    difference = abs(radar_sum - mapped_sum)
    return difference <= 0.5
```

**참조**: [BRD v1.1 Section 3.4](../requirements/BRD.md#34-fr-phys-004-점수-계산-엔진-curatorodyssey-가중치-적용)

---

### 3.7 자동 모니터 제어 설계

**IR 센서 감지**:
- ESP32-C3 GPIO 12에서 IR 센서 입력 감지
- 배(보물 상자) 감지 시 HIGH/LOW 신호 발생

**WebSocket 신호 전송**:
```json
{
  "type": "treasure_box_detected",
  "session_id": "SESSION_123456",
  "timestamp": 1699612800000
}
```

**웹앱 모니터 제어**:
- WebSocket 메시지 수신 시 모니터 자동 켜기
- 결과 화면으로 자동 전환

**참조**: [BRD v1.1 Section 3.6](../requirements/BRD.md#36-fr-phys-006-자동-모니터-제어)

---

## 4. 시스템 아키텍처 다이어그램

### 4.1 전체 시스템 아키텍처

```
┌─────────────────┐
│   ESP32-C3      │
│   (하드웨어)     │
│                 │
│ - 모터 제어      │
│ - 센서 수집      │
│ - LED 표시       │
└────────┬────────┘
         │ WiFi (HTTP POST / WebSocket)
         │
┌────────▼─────────────────────────┐
│   Python FastAPI 백엔드           │
│                                  │
│ - RESTful API                    │
│ - WebSocket 서버                  │
│ - 점수 계산 엔진                  │
│ - AI 매칭 시스템                  │
└────────┬─────────────────────────┘
         │
    ┌────┴────┬──────────┬──────────────┐
    │         │          │              │
┌───▼───┐ ┌──▼────┐ ┌───▼────┐ ┌──────▼──────┐
│Firestore│ │Vertex AI│ │CuratorOdyssey│ │웹앱 (React)│
│         │ │        │ │   API        │ │            │
└─────────┘ └────────┘ └──────────────┘ └────────────┘
```

---

## 5. 참조 문서

- **[BRD v1.1](../requirements/BRD.md)** - 비즈니스 요구사항 문서
- **[피지컬 컴퓨팅 FRD](PHYSICAL_COMPUTING_FRD.md)** - 기능 요구사항 문서
- **[피지컬 컴퓨팅 MVP TSD](MVP_PHYSICAL_COMPUTING_TSD.md)** - MVP 기술 설계 문서
- **[피지컬 컴퓨팅 SRD](PHYSICAL_COMPUTING_SRD.md)** - 소프트웨어 요구사항 문서
- **[피지컬 컴퓨팅 API Spec](PHYSICAL_COMPUTING_API_SPEC.md)** - API 명세서

---

## 6. 부록

### 6.1 기술 스택

**하드웨어**:
- ESP32-C3 (RISC-V 마이크로컨트롤러)
- MicroPython 펌웨어

**백엔드**:
- Python 3.9+
- FastAPI (웹 프레임워크)
- WebSocket (실시간 통신)
- Google Cloud Firestore (데이터베이스)
- Vertex AI (AI 매칭)

**프론트엔드**:
- React (웹앱)
- WebSocket 클라이언트

### 6.2 개발 환경

**필수 도구**:
- Python 3.9+
- pip (패키지 관리자)
- Google Cloud SDK
- ESP32-C3 개발 보드
- MicroPython 펌웨어

**참조**: [하드웨어 세팅 블루프린트](HARDWARE_SETUP_BLUEPRINT.md), [하드웨어 세팅 체크리스트](HARDWARE_SETUP_CHECKLIST.md)

---

**문서 종료**

