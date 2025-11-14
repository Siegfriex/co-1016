# 피지컬 컴퓨팅 기능 요구사항 문서 (Physical Computing Functional Requirements Document)

**버전**: v1.1

**상태**: Draft (초안)

**최종 수정**: 2025-11-10

**소유자**: NEO GOD (Director)

**승인자**: Technical Lead (TBD)

**개정 이력**:
- v1.1 (2025-11-10): 초기 작성 (MVP 포함 + 향후 확장 기능)

**배포 범위**: Physical Computing Development Team, Hardware Team, Backend Team, QA Team

**변경 관리 프로세스**: GitHub Issues/PR 워크플로, 변경 시 TSD/SRD/VID 동시 업데이트

**참조 문서 (References)**:
- **[BRD v1.1](../requirements/BRD.md)** - 피지컬 컴퓨팅 아트워크 및 웹앱 통합 비즈니스 요구사항
- **[피지컬 컴퓨팅 MVP FRD](MVP_PHYSICAL_COMPUTING_FRD.md)** - MVP 기능 요구사항 문서
- **[피지컬 컴퓨팅 TSD](PHYSICAL_COMPUTING_TSD.md)** - 기술 설계 문서
- **[피지컬 컴퓨팅 SRD](PHYSICAL_COMPUTING_SRD.md)** - 소프트웨어 요구사항 문서

---

## 1. 문서 개요 (Introduction)

### 1.1 목적 (Purpose)

본 문서는 피지컬 컴퓨팅 아트워크의 전체 기능 요구사항을 정의합니다. MVP(Minimum Viable Product) 단계의 기능 요구사항과 향후 확장 기능을 포함하여, CuratorOdyssey 플랫폼과 연동된 완전한 피지컬 인터랙티브 아트워크 시스템을 구축하기 위한 기능 명세를 제공합니다.

**참고**: MVP 단계 기능 요구사항은 [피지컬 컴퓨팅 MVP FRD](MVP_PHYSICAL_COMPUTING_FRD.md)를 참조하세요.

### 1.2 범위 (Scope)

**In Scope (전체 버전 포함)**:
- MVP 기능 (하드웨어 작동성 검증)
  - 배 모형 불도저 제어 (모터 2개, 조이스틱)
  - 공 포집 검증 (그물망으로 탁구공/골프공/당구공 포집)
  - 센서 데이터 수집 (조도 센서, MPU-6050, IR 센서)
  - LED RGB 64 패널 표시
  - WiFi 통신 (HTTP POST)
- 향후 확장 기능
  - WebSocket 통신 (실시간 데이터 동기화)
  - AI 매칭 시스템 (Vertex AI 기반 유사 작가 검색)
  - Firestore 세션 데이터 저장
  - 보물 상자 선택 로직 (27가지 조합식)
  - CuratorOdyssey API 연동
  - 자동 모니터 제어
  - 결과 화면 자동 표시
  - 점수 계산 엔진 (CuratorOdyssey 가중치 시스템 적용)

**Out of Scope (범위 외)**:
- 멀티플레이어 동시 플레이 (단일 사용자 전용)
- 게임 데이터 영구 저장 (세션 데이터만 저장)
- 모바일 앱 지원 (웹앱 전용)
- 실시간 협업 기능

### 1.3 대상 독자 (Audience)

- Physical Computing 개발자 (ESP32-C3 펌웨어, Python 백엔드)
- 하드웨어 엔지니어 (배 모형 불도저 제작)
- 백엔드 개발자 (FastAPI, WebSocket 서버)
- AI/ML 엔지니어 (Vertex AI 통합)
- QA 엔지니어 (전체 시스템 테스트)

---

## 2. MVP 기능 요구사항 (요약)

본 섹션은 MVP 단계의 기능 요구사항을 요약합니다. 상세한 내용은 [피지컬 컴퓨팅 MVP FRD](MVP_PHYSICAL_COMPUTING_FRD.md)를 참조하세요.

### 2.1 MVP 기능 목록

1. **FR-MVP-001: 배 모형 불도저 제어**
   - 모터 2개로 전진 상태 유지
   - 조이스틱 입력에 따른 방향 조정

2. **FR-MVP-002: 공 포집 검증**
   - 그물망으로 탁구공/골프공/당구공 포집
   - 센서 데이터 수집 (조도 센서, MPU-6050, IR 센서)

3. **FR-MVP-003: LED RGB 64 패널 표시**
   - 게임 상태 표시
   - 공 수집 현황 표시

4. **FR-MVP-004: WiFi 통신**
   - HTTP POST 요청으로 센서 데이터 전송
   - 백엔드 API 연동

5. **FR-MVP-005: 로컬 로그 저장**
   - 센서 데이터 JSONL 형식 로그 저장
   - 파일 기반 데이터 저장

---

## 3. 향후 확장 기능 요구사항

### 3.1 FR-PHYS-001: 게임 시작 및 세션 관리

**설명**: 시스템은 게임 시작 시 고유 세션 ID를 생성하고, WebSocket 연결을 통한 실시간 데이터 동기화를 지원해야 한다.

**입력 (Input)**:
- 게임 시작 신호 (버튼 입력 또는 센서 트리거)

**출력 (Output)**:
- 세션 ID (고유 식별자)
- WebSocket 연결 상태
- 게임 상태 초기화 확인

**사전 조건 (Preconditions)**:
- 아두이노/ESP32 센서 시스템 초기화 완료
- 파이썬 백엔드 서버 실행 중
- Firestore 연결 가능

**사후 조건 (Postconditions)**:
- 세션 ID 생성 및 Firestore 저장
- WebSocket 연결 수립
- 게임 상태 초기화 (공 수집 = 0, 보물 상자 선택 = [])

**수용 기준 (AC-PHYS-001)**:
- 세션 생성 시간 < 500ms
- WebSocket 연결 성공률 ≥99%
- 세션 ID 고유성 보장 (중복 없음)

**테스트 케이스**: TC-PHYS-001 (세션 생성 및 WebSocket 연결)

**참조**: [BRD v1.1 Section 3.1](../requirements/BRD.md#31-fr-phys-001-게임-시작-및-세션-관리)

---

### 3.2 FR-PHYS-002: 공 수집 시스템 (노력)

**설명**: 시스템은 티어별 공(티어 1/2/3)과 축별 색상(제도/학술/담론/네트워크)을 감지하여 실시간으로 수집 개수를 추적하고, CuratorOdyssey 데이터 구조에 맞게 점수를 계산해야 한다.

**입력 (Input)**:
- 조도 센서 데이터 (공 감지)
- 공 색상 정보 (제도/학술/담론/네트워크)
- 공 크기 정보 (티어 1/2/3)

**출력 (Output)**:
- 공 수집 개수 (티어별, 축별)
- 실시간 점수 계산 결과
- WebSocket을 통한 실시간 업데이트

**사전 조건 (Preconditions)**:
- 게임 세션 활성화 상태
- 조도 센서 정상 작동
- 센서 캘리브레이션 완료

**사후 조건 (Postconditions)**:
- 공 수집 데이터 Firestore 저장
- 실시간 점수 계산 및 WebSocket 전송
- CuratorOdyssey 가중치 시스템 적용

**수용 기준 (AC-PHYS-002)**:
- 센서 감지 정확도 ≥95%
- 점수 계산 시간 <100ms
- CuratorOdyssey 일관성 검증 통과 (±0.5p)

**테스트 케이스**: TC-PHYS-002 (공 수집 및 점수 계산)

**참조**: [BRD v1.1 Section 3.2](../requirements/BRD.md#32-fr-phys-002-공-수집-시스템-노력)

---

### 3.3 FR-PHYS-003: 보물 상자 선택 시스템 (우연)

**설명**: 시스템은 각 나이대 구간(10대/20대/30대)에서 플레이어가 보물 상자 1개씩을 필수로 선택하도록 하고, 시간순으로 3개를 조합하여 주 페르소나를 생성해야 한다.

**입력 (Input)**:
- 보물 상자 선택 신호 (버튼 입력 또는 센서 트리거)
- 나이대 구간 정보 (10대/20대/30대)

**출력 (Output)**:
- 선택된 보물 상자 ID
- 주 페르소나 생성 결과
- 다음 구간 진행 가능 상태

**사전 조건 (Preconditions)**:
- 해당 나이대 구간 도달 완료
- 해당 나이대에서 아직 보물 상자 미선택
- 이전 나이대 보물 상자 선택 완료 (10대 → 20대 → 30대 순서)

**사후 조건 (Postconditions)**:
- 보물 상자 선택 데이터 Firestore 저장
- 주 페르소나 생성 및 저장
- 다음 구간 진행 가능 상태로 전환

**수용 기준 (AC-PHYS-003)**:
- 각 나이대에서 정확히 1개 선택 (필수)
- 선택 순서 검증 (10대 → 20대 → 30대)
- 주 페르소나 생성 정확도 100%

**테스트 케이스**: TC-PHYS-003 (보물 상자 선택 및 주 페르소나 생성)

**참조**: [BRD v1.1 Section 3.3](../requirements/BRD.md#33-fr-phys-003-보물-상자-선택-시스템-우연)

---

### 3.4 FR-PHYS-004: 점수 계산 엔진 (CuratorOdyssey 가중치 적용)

**설명**: 시스템은 공 수집 데이터를 CuratorOdyssey의 레이더 5축 및 선버스트 4축 구조에 맞게 변환하여 점수를 계산하고, ±0.5p 일관성 검증을 수행해야 한다.

**입력 (Input)**:
- 공 수집 데이터 (티어별, 축별 개수)
- CuratorOdyssey 가중치 시스템

**출력 (Output)**:
- 레이더 5축 점수 (I/F/A/M/Sedu)
- 선버스트 4축 점수 (제도/학술/담론/네트워크)
- 일관성 검증 결과 (±0.5p)

**점수 계산 알고리즘**:

**티어별 기본 점수**:
- 티어 1 (당구공): 10점 (높은 영향력)
- 티어 2 (골프공): 5점 (중간 영향력)
- 티어 3 (탁구공): 2점 (낮은 영향력)

**레이더 5축 매핑 규칙**:
- I (Institution) = 제도 축 티어 1 공 개수 × 0.7 × 10
- F (Fair) = 제도 축 티어 1 공 개수 × 0.3 × 10
- A (Award) = 학술 축 티어 1 공 개수 × 0.6 × 10
- M (Media) = 담론 축 티어 1 공 개수 × 0.8 × 10
- Sedu (Seduction) = 학술 축 티어 1 공 개수 × 0.15 × 10

**선버스트 4축 계산**:
- 제도 = (티어1×제도×10) + (티어2×제도×5) + (티어3×제도×2)
- 학술 = (티어1×학술×10) + (티어2×학술×5) + (티어3×학술×2)
- 담론 = (티어1×담론×10) + (티어2×담론×5) + (티어3×담론×2)
- 네트워크 = (티어1×네트워크×10) + (티어2×네트워크×5) + (티어3×네트워크×2)

**일관성 검증 (±0.5p)**:
- radar_sum = I + F + A + M + Sedu
- mapped_sum = (제도×0.7) + (제도×0.3) + (학술×0.6) + (담론×0.8) + (학술×0.15)
- difference = |radar_sum - mapped_sum|
- valid = difference ≤ 0.5

**사전 조건 (Preconditions)**:
- 공 수집 데이터 존재
- CuratorOdyssey 가중치 시스템 로드 완료

**사후 조건 (Postconditions)**:
- 레이더 5축 및 선버스트 4축 점수 계산 완료
- 일관성 검증 통과 (±0.5p)
- 영향력/인지도/가격 범위 계산 완료

**수용 기준 (AC-PHYS-004)**:
- 점수 계산 시간 <100ms
- 일관성 검증 통과율 100%
- CuratorOdyssey 데이터 구조와 일치도 100%

**테스트 케이스**: TC-PHYS-004 (점수 계산 및 일관성 검증)

**참조**: [BRD v1.1 Section 3.4](../requirements/BRD.md#34-fr-phys-004-점수-계산-엔진-curatorodyssey-가중치-적용)

---

### 3.5 FR-PHYS-005: AI 매칭 시스템

**설명**: 시스템은 주 페르소나(보물 상자 조합)와 스펙(공 수집 데이터)을 입력받아 CuratorOdyssey 작가 데이터베이스에서 유사한 작가를 검색하고, Vertex AI를 통해 매칭 결과 및 스토리를 생성해야 한다.

**입력 (Input)**:
- 주 페르소나 (보물 상자 조합 3개)
- 플레이어 스펙 (레이더 5축, 선버스트 4축 점수)

**출력 (Output)**:
- 매칭된 작가 정보 (1명)
- AI 생성 스토리
- 매칭 근거 및 유사도 점수

**AI 매칭 알고리즘**:

1. **보물 상자 조합식 조회**: 
   - 플레이어가 선택한 보물 상자 3개(box_ids)를 시간순으로 정렬 (10대 → 20대 → 30대)
   - `treasure_box_combinations` 컬렉션에서 해당 조합(combination_id) 조회
   - 조회된 조합의 `storytelling_keyword` 및 `similar_artists` 배열 획득

2. **우선 후보 작가 선정**:
   - 조회된 조합의 `similar_artists` 배열을 우선 후보 작가 리스트로 설정
   - 각 후보 작가의 `matching_rationale` 및 `keywords`를 매칭 근거로 활용

3. **CuratorOdyssey 작가 데이터 조회**:
   - 우선 후보 작가 리스트의 `name_en` 또는 `name_ko`를 사용하여 `artist_summary` 컬렉션에서 작가 데이터 조회
   - 우선 후보 작가가 없는 경우, `artist_summary` 컬렉션에서 모든 작가 데이터 조회

4. **Vertex AI 프롬프트 생성**:
   - 주 페르소나 (보물 상자 조합 이벤트 시퀀스)
   - 스토리텔링 키워드 (조합의 `storytelling_keyword`)
   - 플레이어 스펙 (레이더 5축, 선버스트 4축 점수)
   - 우선 후보 작가 리스트 및 매칭 근거 (`similar_artists` 배열)
   - 한국 특수 상황 해석 규칙 적용

5. **유사 작가 검색**:
   - Vertex AI가 우선 후보 작가 리스트와 플레이어 스펙을 비교하여 유사도 계산
   - 우선 후보 작가가 없는 경우, 전체 작가 목록과 비교

6. **최종 매칭 및 스토리 생성**:
   - 유사도 점수가 가장 높은 작가 1명 선정
   - 매칭된 작가와 플레이어의 유사성을 설명하는 스토리 생성
   - 조합의 `storytelling_keyword`를 활용하여 스토리 품질 향상

**사전 조건 (Preconditions)**:
- 주 페르소나 생성 완료 (보물 상자 3개 선택)
- 공 수집 데이터 및 점수 계산 완료
- Vertex AI API 키 설정 완료
- CuratorOdyssey API 접근 가능

**사후 조건 (Postconditions)**:
- 유사 작가 1명 매칭 완료
- AI 생성 스토리 생성 완료
- 매칭 결과 Firestore 저장

**수용 기준 (AC-PHYS-005)**:
- AI 매칭 시간 <30초
- 유사도 점수 ≥0.7 (70% 이상)
- 스토리 생성 품질 검증 통과

**테스트 케이스**: TC-PHYS-005 (AI 매칭 및 스토리 생성)

**참조**: [BRD v1.1 Section 3.5](../requirements/BRD.md#35-fr-phys-005-ai-매칭-시스템)

---

### 3.6 FR-PHYS-006: 자동 모니터 제어

**설명**: 시스템은 IR 센서로 배(보물 상자) 감지 시 WebSocket 신호를 전송하여 웹앱의 모니터를 자동으로 켜고, 결과 화면을 표시해야 한다.

**입력 (Input)**:
- IR 센서 감지 신호 (배 감지)

**출력 (Output)**:
- WebSocket 신호 전송 (모니터 켜기)
- 결과 화면 자동 표시

**사전 조건 (Preconditions)**:
- 게임 세션 활성화 상태
- IR 센서 정상 작동
- WebSocket 연결 수립
- 웹앱 실행 중

**사후 조건 (Postconditions)**:
- 모니터 자동 켜기 신호 전송
- 결과 화면으로 자동 전환
- 게임 종료 처리

**수용 기준 (AC-PHYS-006)**:
- IR 센서 감지 정확도 ≥95%
- 모니터 켜기 지연 <2초
- 결과 화면 표시 성공률 ≥95%

**테스트 케이스**: TC-PHYS-006 (IR 센서 감지 및 모니터 제어)

**참조**: [BRD v1.1 Section 3.6](../requirements/BRD.md#36-fr-phys-006-자동-모니터-제어)

---

### 3.7 FR-PHYS-007: 보물 상자 조합식 27가지

**설명**: 시스템은 10대, 20대, 30대 각 구간에서 선택된 보물 상자 1개씩을 조합하여 총 27가지(3×3×3)의 인생 궤적을 생성한다. 각 조합은 고유한 스토리텔링 키워드와 유사 작가 매칭 정보를 포함한다.

**입력 (Input)**:
- 보물 상자 선택 3개 (10대, 20대, 30대 각 1개)

**출력 (Output)**:
- 조합식 ID (1-27)
- 스토리텔링 키워드
- 우선 후보 작가 리스트

**보물 상자 정의**:

**10대 구간**:
- Box ID 1: 구설수가 생기다 (Negative)
- Box ID 2: 원하는 대학에 입학하다 (Positive)
- Box ID 3: 유명 큐레이터에게 눈에 띄다 (Positive)

**20대 구간**:
- Box ID 4: 대학교에서 퇴학당하다 (Negative)
- Box ID 5: 학술제에서 인정받다 (Positive)
- Box ID 6: 전속 계약이 해지되다 (Negative)

**30대 구간**:
- Box ID 7: 군에 입대하다 (Neutral) - 한국 특수 상황: 경력 단절로 해석
- Box ID 8: 리움에서 전시하다 (Positive)
- Box ID 9: 국제 비엔날레에 초대받다 (Positive)

**수용 기준 (AC-PHYS-007)**:
- 조합식 조회 정확도 100%
- 스토리텔링 키워드 매칭 정확도 100%
- 우선 후보 작가 리스트 제공 정확도 100%

**테스트 케이스**: TC-PHYS-007 (보물 상자 조합식 조회)

**참조**: [BRD v1.1 Section 3.7](../requirements/BRD.md#37-보물-상자-조합식-27가지-상세-정의)

---

## 4. 데이터 구조 및 스키마

### 4.1 Firestore 스키마 설계

**컬렉션 1: physical_game_sessions**

```json
{
  "session_id": "SESSION_123456",
  "started_at": "Timestamp",
  "ended_at": "Timestamp",
  "balls_collected": {
    "tier_1": {
      "count": 2,
      "axis_distribution": {
        "제도": 1,
        "학술": 0,
        "담론": 1,
        "네트워크": 0
      }
    }
  },
  "treasure_boxes_selected": [1, 5, 8],
  "main_persona": {
    "combination_id": 14,
    "storytelling_keyword": "학술적 기반의 탄탄한 국내 제도권 진입"
  },
  "calculated_scores": {
    "radar5": {
      "I": 7.0,
      "F": 3.0,
      "A": 0,
      "M": 8.0,
      "Sedu": 0
    },
    "sunburst_l1": {
      "제도": 10.0,
      "학술": 0,
      "담론": 10.0,
      "네트워크": 0
    }
  },
  "matched_artist": {
    "name_ko": "서도호",
    "name_en": "Do Ho Suh",
    "similarity_score": 0.85
  }
}
```

**컬렉션 2: treasure_box_combinations**

```json
{
  "combination_id": 14,
  "box_ids": [2, 5, 8],
  "storytelling_keyword": "학술적 기반의 탄탄한 국내 제도권 진입",
  "similar_artists": [
    {
      "name_ko": "서도호",
      "name_en": "Do Ho Suh",
      "matching_rationale": "엘리트 코스, 건축/개념적 접근, 국내 대표 작가"
    }
  ]
}
```

**참조**: [BRD v1.1 Section 4](../requirements/BRD.md#4-데이터-구조-및-스키마-data-structure--schema)

---

## 5. 참조 문서

- **[BRD v1.1](../requirements/BRD.md)** - 비즈니스 요구사항 문서
- **[피지컬 컴퓨팅 MVP FRD](MVP_PHYSICAL_COMPUTING_FRD.md)** - MVP 기능 요구사항 문서
- **[피지컬 컴퓨팅 TSD](PHYSICAL_COMPUTING_TSD.md)** - 기술 설계 문서
- **[피지컬 컴퓨팅 SRD](PHYSICAL_COMPUTING_SRD.md)** - 소프트웨어 요구사항 문서
- **[피지컬 컴퓨팅 API Spec](PHYSICAL_COMPUTING_API_SPEC.md)** - API 명세서

---

## 6. 부록

### 6.1 용어 정의

- **MVP (Minimum Viable Product)**: 최소 기능 제품, 핵심 기능만 포함하여 하드웨어 작동성을 검증하는 단계
- **주 페르소나 (Main Persona)**: 보물 상자 3개를 조합하여 생성된 플레이어의 인생 궤적
- **CuratorOdyssey 가중치 시스템**: CuratorOdyssey 플랫폼에서 사용하는 레이더 5축 및 선버스트 4축 점수 계산 알고리즘

### 6.2 약어 목록

- **FR**: Functional Requirement (기능 요구사항)
- **AC**: Acceptance Criteria (수용 기준)
- **TC**: Test Case (테스트 케이스)
- **API**: Application Programming Interface
- **WebSocket**: 실시간 양방향 통신 프로토콜
- **Firestore**: Google Cloud Firestore 데이터베이스
- **Vertex AI**: Google Cloud Vertex AI 서비스

---

**문서 종료**

