# CO-1016 CURATOR ODYSSEY: 피지컬 컴퓨팅 아트워크 및 웹앱 통합 BRD v1.0

## 문서 메타데이터 (Document Metadata)

문서명: CO-1016 CURATOR ODYSSEY Physical Computing Artwork & Web App Integration BRD v1.0

**버전**: 1.1

**최종 수정**: 2025-11-10

**소유자**: NEO GOD (Director)

**승인자**: Product Owner (TBD)

**개정 이력**:
- v1.0 (2025-11-09): 초기 작성, 피지컬 컴퓨팅 아트워크 및 웹앱 통합 요구사항 정의
- v1.1 (2025-11-10): 문서 동기화 및 참조 관계 확정

배포 범위: 하드웨어 개발팀, 백엔드 개발팀 (Python), 프론트엔드 개발팀 (React), 데이터 팀, QA 팀

변경 관리 프로세스: GitHub Issues/PR 워크플로, 변경 시 TSD/FRD/SRD 동시 업데이트

**참조 문서 (References)**:
- **[TSD v1.1](../TSD.md)** - Technical Design Document, 기존 웹앱 아키텍처
- **[FRD v1.1](FRD.md)** - Functional Requirements Document, Phase 1-4 기능 요구사항 및 API 엔드포인트 매핑
- **[SRD v1.1](SRD.md)** - Software Requirements Document, 수용 기준 및 기능 요구사항
- **[API Specification v1.1](../api/API_SPECIFICATION.md)** - RESTful API 엔드포인트 정의, JSON Schema
- **[FR ID 매핑 테이블](../FR_ID_MAPPING.md)** - SRD FR ID와 FRD FR ID 간 매핑 관계
- **[VID v2.0](../design/VID.md)** - Visual Interaction Design Document, UI/UX 설계
- **[IA v1.1](../architecture/IA.md)** - Information Architecture Document, 데이터 구조
- **[SITEMAP_WIREFRAME v2.1](../design/SITEMAP_WIREFRAME.md)** - Sitemap and Wireframe Functional Specification, 사이트맵 및 와이어프레임 명세
- **[VXD v1.0](../testing/VXD.md)** - Validation eXecution Document, 테스트 케이스
- **[피지컬 컴퓨팅 TSD](../physical-computing/PHYSICAL_COMPUTING_TSD.md)** - 피지컬 컴퓨팅 아트워크 기술 설계 문서
- **[피지컬 컴퓨팅 API Spec](../physical-computing/PHYSICAL_COMPUTING_API_SPEC.md)** - 피지컬 컴퓨팅 아트워크 API 명세서
- 회의록 1109.txt - 피지컬 컴퓨팅 아이데이션 회의록


## 1. 서론 (Introduction)

### 1.1 목적 (Purpose)

본 문서는 CuratorOdyssey 플랫폼과 연동된 피지컬 컴퓨팅 인터랙티브 아트워크의 비즈니스 요구사항을 정의한다. 플레이어는 물리적 조작을 통해 “노력(공 수집)”과 “우연(보물 상자)”의 조합으로 자신만의 예술가 스토리를 생성하고, AI가 유사한 실제 작가를 매칭하여 제시한다. 기존 CuratorOdyssey 웹앱의 데이터 구조와 의미론적 일관성을 유지하면서도 독립적인 피지컬 인터랙션 경험을 제공한다.

### 1.2 범위 (Scope)

### In Scope (범위 내)

피지컬 컴퓨팅 아트워크: - 아두이노/ESP32 기반 센서 시스템 (조도, 초음파, IR) - 파이썬 백엔드 (FastAPI, WebSocket) - 게임 메커니즘 (공 수집, 보물 상자 선택) - 점수 계산 엔진 (CuratorOdyssey 가중치 시스템 적용) - AI 매칭 시스템 (Vertex AI 기반 유사 작가 검색)

웹앱 통합: - 자동 모니터 제어 (배 감지 시 모니터 켜기) - 결과 화면 자동 표시 - CuratorOdyssey API 연동 (Phase 1-4 데이터 조회) - 비교 차트 표시 (플레이어 vs 매칭 작가)

인사이트 스코프: - 개인 레벨 인사이트 (플레이어별 결과 분석) - 집계 레벨 인사이트 (전체 플레이어 통계) - CuratorOdyssey 교차 분석 인사이트 (게임 데이터 vs 실제 작가 데이터)

### Out of Scope (범위 외)

멀티플레이어 동시 플레이 (단일 사용자 전용)

게임 데이터 영구 저장 (세션 데이터만 저장)

모바일 앱 지원 (웹앱 전용)

실시간 협업 기능

### 1.3 배경

CuratorOdyssey는 예술가의 경력 궤적을 데이터 기반으로 분석하는 플랫폼이다. 레이더 5축(I/F/A/M/Sedu)과 선버스트 4축(제도/학술/담론/네트워크)을 통해 현재 가치를 평가하고, 시계열 분석을 통해 커리어 궤적을 시각화한다.

피지컬 컴퓨팅 아트워크는 이러한 데이터 분석 개념을 물리적 인터랙션으로 전환한다. 플레이어는 공을 수집하는 “노력”과 보물 상자를 선택하는 “우연”을 통해 자신만의 예술가 스토리를 생성하고, CuratorOdyssey의 작가 데이터베이스와 매칭되어 유사한 실제 작가를 발견한다.

### 1.4 가정 및 제약 (Assumptions and Constraints)

하드웨어 제약: - 아두이노/ESP32 센서 시스템 (조도 센서 3개, 초음파 센서 1개, IR 센서 1개) - WiFi 통신 환경 필수 - 물리적 구조 제작 필요 (게임 보드, 컨테이너)

소프트웨어 제약: - 파이썬 백엔드 (FastAPI, WebSocket) - CuratorOdyssey API 호출 (기존 Firebase Functions 활용) - Vertex AI 통합 (월 $30 한도)

데이터 제약: - CuratorOdyssey 데이터 구조와의 일관성 유지 (±0.5p 검증) - 보물 상자 조합식 27가지 사전 정의 필요 - 게임 세션 데이터 Firestore 저장

성능 제약: - 게임 완료 시간: 5-10분 - 점수 계산 시간: <1초 - AI 매칭 시간: <30초 - 모니터 자동 켜기 지연: <2초

사용자 규모: - MVP: 동시 플레이어 1명 (단일 사용자) - 일일 활성 플레이어: 10-20명 (예상)


## 2. 비즈니스 요구사항 (Business Requirements)

### 2.1 프로젝트 비전

핵심 메시지: “노력과 우연이 만나 예술가가 된다”

비전:
데이터 기반 예술가 분석 플랫폼 CuratorOdyssey와 연동된 피지컬 인터랙티브 아트워크를 통해, 플레이어가 몰입형 경험을 통해 예술가의 경력 궤적을 이해하고, 자신만의 스토리를 생성하여 유사한 실제 작가를 발견할 수 있도록 한다.

### 2.2 비즈니스 목표

교육적 가치: 예술가 경력 분석 개념을 게임을 통해 직관적으로 이해

데이터 인사이트: 게임 플레이 데이터를 통해 플레이어 커뮤니티 패턴 분석

CuratorOdyssey 전환: 피지컬 게임 경험 후 웹앱으로 자연스러운 전환 유도

브랜드 확장: CuratorOdyssey의 물리적 확장으로 브랜드 인지도 향상

### 2.3 성공 지표 (KPI)

### 2.4 이해관계자 (Stakeholders)

### 2.5 RACI 매트릭스

범례: - R (Responsible): 실행 책임 - A (Accountable): 최종 승인 책임 - C (Consulted): 자문 역할 - I (Informed): 정보 공유 대상



## Part 1: 피지컬 컴퓨팅 아트워크 BRD

### 3. 기능 요구사항 (Functional Requirements)

### 3.1 FR-PHYS-001: 게임 시작 및 세션 관리

설명: 시스템은 게임 시작 시 고유 세션 ID를 생성하고, WebSocket 연결을 통한 실시간 데이터 동기화를 지원해야 한다.

입력 (Input):

출력 (Output):

사전 조건 (Preconditions): - 아두이노/ESP32 센서 시스템 초기화 완료 - 파이썬 백엔드 서버 실행 중 - Firestore 연결 가능

사후 조건 (Postconditions): - 세션 ID 생성 및 Firestore 저장 - WebSocket 연결 수립 - 게임 상태 초기화 (공 수집 = 0, 보물 상자 선택 = [])

수용 기준 (AC-PHYS-001): - 세션 생성 시간 < 500ms - WebSocket 연결 성공률 ≥99% - 세션 ID 고유성 보장 (중복 없음)

테스트 케이스: TC-PHYS-001 (세션 생성 및 WebSocket 연결)


### 3.2 FR-PHYS-002: 공 수집 시스템 (노력)

설명: 시스템은 티어별 공(티어 1/2/3)과 축별 색상(제도/학술/담론/네트워크)을 감지하여 실시간으로 수집 개수를 추적하고, CuratorOdyssey 데이터 구조에 맞게 점수를 계산해야 한다.

입력 (Input):

출력 (Output):

사전 조건 (Preconditions): - 게임 세션 활성화 상태 - 조도 센서 정상 작동 - 센서 캘리브레이션 완료

사후 조건 (Postconditions): - 공 수집 데이터 Firestore 저장 - 실시간 점수 계산 및 WebSocket 전송 - CuratorOdyssey 가중치 시스템 적용

수용 기준 (AC-PHYS-002): - 센서 감지 정확도 ≥95% - 점수 계산 시간 <100ms - CuratorOdyssey 일관성 검증 통과 (±0.5p)

테스트 케이스: TC-PHYS-002 (공 수집 및 점수 계산)


### 3.3 FR-PHYS-003: 보물 상자 선택 시스템 (우연)

설명: 시스템은 각 나이대 구간(10대/20대/30대)에서 플레이어가 보물 상자 1개씩을 필수로 선택하도록 하고, 시간순으로 3개를 조합하여 주 페르소나를 생성해야 한다.

입력 (Input):

출력 (Output):

사전 조건 (Preconditions): - 해당 나이대 구간 도달 완료 - 해당 나이대에서 아직 보물 상자 미선택 - 이전 나이대 보물 상자 선택 완료 (10대 → 20대 → 30대 순서)

사후 조건 (Postconditions): - 보물 상자 선택 데이터 Firestore 저장 - 주 페르소나 생성 및 저장 - 다음 구간 진행 가능 상태로 전환

수용 기준 (AC-PHYS-003): - 각 나이대에서 정확히 1개 선택 (필수) - 선택 순서 검증 (10대 → 20대 → 30대) - 주 페르소나 생성 정확도 100%

테스트 케이스: TC-PHYS-003 (보물 상자 선택 및 주 페르소나 생성)

보물 상자 데이터 예시:

// 10대 구간 보물 상자
{ box_id: 1, age_group: "10대", position: 1, event_description: "구설수가 생기다", event_type: "negative" }
{ box_id: 2, age_group: "10대", position: 2, event_description: "원하는 대학에 입학하다", event_type: "positive" }
{ box_id: 3, age_group: "10대", position: 3, event_description: "유명 큐레이터에게 눈에 띄다", event_type: "positive" }

// 20대 구간 보물 상자
{ box_id: 4, age_group: "20대", position: 1, event_description: "대학교에서 퇴학당하다", event_type: "negative" }
{ box_id: 5, age_group: "20대", position: 2, event_description: "학술제에서 인정받다", event_type: "positive" }
{ box_id: 6, age_group: "20대", position: 3, event_description: "전속 계약이 해지되다", event_type: "negative" }

// 30대 구간 보물 상자
{ box_id: 7, age_group: "30대", position: 1, event_description: "군에 입대하다", event_type: "neutral" }
{ box_id: 8, age_group: "30대", position: 2, event_description: "리움에서 전시하다", event_type: "positive" }
{ box_id: 9, age_group: "30대", position: 3, event_description: "국제 비엔날레에 초대받다", event_type: "positive" }


### 3.4 FR-PHYS-004: 점수 계산 엔진 (CuratorOdyssey 가중치 적용)

설명: 시스템은 공 수집 데이터를 CuratorOdyssey의 레이더 5축 및 선버스트 4축 구조에 맞게 변환하여 점수를 계산하고, ±0.5p 일관성 검증을 수행해야 한다.

입력 (Input):

출력 (Output):

점수 계산 알고리즘:

티어별 기본 점수 (CuratorOdyssey 영향력 점수 매핑): - 티어 1 (당구공): 10점 (높은 영향력) - 티어 2 (골프공): 5점 (중간 영향력) - 티어 3 (탁구공): 2점 (낮은 영향력)

레이더 5축 매핑 규칙 (CuratorOdyssey 비즈니스 로직 반영):

I (Institution) = 제도 축 티어 1 공 개수 × 0.7 × 10
F (Fair) = 제도 축 티어 1 공 개수 × 0.3 × 10
A (Award) = 학술 축 티어 1 공 개수 × 0.6 × 10
M (Media) = 담론 축 티어 1 공 개수 × 0.8 × 10
Sedu (Seduction) = 학술 축 티어 1 공 개수 × 0.15 × 10

선버스트 4축 계산:

제도 = (티어1×제도×10) + (티어2×제도×5) + (티어3×제도×2)
학술 = (티어1×학술×10) + (티어2×학술×5) + (티어3×학술×2)
담론 = (티어1×담론×10) + (티어2×담론×5) + (티어3×담론×2)
네트워크 = (티어1×네트워크×10) + (티어2×네트워크×5) + (티어3×네트워크×2)

일관성 검증 (±0.5p):

radar_sum = I + F + A + M + Sedu
mapped_sum = (제도×0.7) + (제도×0.3) + (학술×0.6) + (담론×0.8) + (학술×0.15)
difference = |radar_sum - mapped_sum|
valid = difference ≤ 0.5

사전 조건 (Preconditions): - 공 수집 데이터 존재 - CuratorOdyssey 가중치 시스템 로드 완료

사후 조건 (Postconditions): - 레이더 5축 및 선버스트 4축 점수 계산 완료 - 일관성 검증 통과 (±0.5p) - 영향력/인지도/가격 범위 계산 완료

수용 기준 (AC-PHYS-004): - 점수 계산 시간 <100ms - 일관성 검증 통과율 100% - CuratorOdyssey 데이터 구조와 일치도 100%

테스트 케이스: TC-PHYS-004 (점수 계산 및 일관성 검증)


### 3.5 FR-PHYS-005: AI 매칭 시스템

설명: 시스템은 주 페르소나(보물 상자 조합)와 스펙(공 수집 데이터)을 입력받아 CuratorOdyssey 작가 데이터베이스에서 유사한 작가를 검색하고, Vertex AI를 통해 매칭 결과 및 스토리를 생성해야 한다.

입력 (Input):

출력 (Output):

AI 매칭 알고리즘:

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
   - 한국 특수 상황 해석 규칙 적용 (Section 3.7.2 참조)

5. **유사 작가 검색**:
   - Vertex AI가 우선 후보 작가 리스트와 플레이어 스펙을 비교하여 유사도 계산
   - 우선 후보 작가가 없는 경우, 전체 작가 목록과 비교

6. **최종 매칭 및 스토리 생성**:
   - 유사도 점수가 가장 높은 작가 1명 선정
   - 매칭된 작가와 플레이어의 유사성을 설명하는 스토리 생성
   - 조합의 `storytelling_keyword`를 활용하여 스토리 품질 향상

사전 조건 (Preconditions): - 주 페르소나 생성 완료 (보물 상자 3개 선택) - 공 수집 데이터 및 점수 계산 완료 - Vertex AI API 키 설정 완료 - CuratorOdyssey API 접근 가능

사후 조건 (Postconditions): - 유사 작가 1명 매칭 완료 - AI 생성 스토리 생성 완료 - 매칭 결과 Firestore 저장

수용 기준 (AC-PHYS-005): - AI 매칭 시간 <30초 - 유사도 점수 ≥0.7 (70% 이상) - 스토리 생성 품질 검증 통과

테스트 케이스: TC-PHYS-005 (AI 매칭 및 스토리 생성)


### 3.6 FR-PHYS-006: 자동 모니터 제어

설명: 시스템은 IR 센서로 배(보물 상자) 감지 시 WebSocket 신호를 전송하여 웹앱의 모니터를 자동으로 켜고, 결과 화면을 표시해야 한다.

입력 (Input):

출력 (Output):

사전 조건 (Preconditions): - 게임 세션 활성화 상태 - IR 센서 정상 작동 - WebSocket 연결 수립 - 웹앱 실행 중

사후 조건 (Postconditions): - 모니터 자동 켜기 신호 전송 - 결과 화면으로 자동 전환 - 게임 종료 처리

수용 기준 (AC-PHYS-006): - IR 센서 감지 정확도 ≥95% - 모니터 켜기 지연 <2초 - 결과 화면 표시 성공률 ≥95%

테스트 케이스: TC-PHYS-006 (IR 센서 감지 및 모니터 제어)


### 3.7 보물 상자 조합식 27가지 상세 정의

설명: 시스템은 10대, 20대, 30대 각 구간에서 선택된 보물 상자 1개씩을 조합하여 총 27가지(3×3×3)의 인생 궤적을 생성한다. 각 조합은 고유한 스토리텔링 키워드와 유사 작가 매칭 정보를 포함한다.

#### 3.7.1 연령대별 보물 상자 정의

**10대 구간 보물 상자**:
- Box ID 1: 구설수가 생기다 (Negative)
- Box ID 2: 원하는 대학에 입학하다 (Positive)
- Box ID 3: 유명 큐레이터에게 눈에 띄다 (Positive)

**20대 구간 보물 상자**:
- Box ID 4: 대학교에서 퇴학당하다 (Negative)
- Box ID 5: 학술제에서 인정받다 (Positive)
- Box ID 6: 전속 계약이 해지되다 (Negative)

**30대 구간 보물 상자**:
- Box ID 7: 군에 입대하다 (Neutral) - 한국 특수 상황: 경력 단절로 해석
- Box ID 8: 리움에서 전시하다 (Positive)
- Box ID 9: 국제 비엔날레에 초대받다 (Positive)

#### 3.7.2 한국 특수 상황 해석 규칙

다음 이벤트는 한국 특수 상황으로 해석되며, AI 매칭 시스템에서 경력 궤적 분석에 반영된다:

- **"군에 입대하다" (Box ID 7)**: 경력 단절 (career disruption)로 해석
  - 작가 경력에서 활동 중단 기간, 매체 전환, 재정비 시기와 유사한 패턴으로 매칭

- **"대학교에서 퇴학당하다" (Box ID 4)**: 제도권 인정 부재 (lack of institutional recognition)로 해석
  - 정규 교육 과정 이탈, 아카데미즘 거부, 제도권 밖에서의 성공 패턴과 유사한 궤적으로 매칭

#### 3.7.3 27가지 조합식 전체 테이블

| No. | 조합식 (10대-20대-30대) | 스토리텔링 키워드 | 유사 작가 (한국명) | 유사 작가 (영문명) | 매칭 근거 |
|-----|----------------------|-----------------|------------------|-----------------|----------|
| 1 | (1 - 4 - 7) | 파격적 궤적의 순수 아웃사이더: 구설수 → 퇴학 → 군입대 | 헨리 마티스 | Henri Matisse | 초기 논란, 정규 교육 중단, 긴 경력 공백, 순수성 추구 |
| 2 | (1 - 4 - 8) | 논란 속에서 제도권에 편입되다: 구설수 → 퇴학 → 리움 전시 | 데미안 허스트 | Damien Hirst | 천재성, 스캔들, 비주류 성공, 제도적 구원 |
| 3 | (1 - 4 - 9) | 제도 이탈 후 국제적 인정: 구설수 → 퇴학 → 비엔날레 | 장 미셸 바스키아 | J. M. Basquiat | 천재성, 불운, 제도권 밖, 글로벌 아이콘 |
| 4 | (1 - 5 - 7) | 초기 구설수, 학술로 만회한 후의 공백: 구설수 → 학술 인정 → 군입대 | 에곤 실레 | Egon Schiele | 도덕적 논란, 비평적 지지, 단명/활동 중단 |
| 5 | (1 - 5 - 8) | 논란과 인정의 충돌, 국내 정상 등극: 구설수 → 학술 인정 → 리움 전시 | 백남준 | Nam June Paik | 아방가르드, 충격, 비평적 승리, 국내 거장 |
| 6 | (1 - 5 - 9) | 구설수로 시작, 비평을 거쳐 국제 거장으로: 구설수 → 학술 인정 → 비엔날레 | 신디 셔먼 | Cindy Sherman | 여성/젠더 담론, 비평적 우위, 글로벌 영향력 |
| 7 | (1 - 6 - 7) | 시장에서 버려진 후의 재정비: 구설수 → 계약 해지 → 군입대 | 잭슨 폴록 | Jackson Pollock | 초기 불안정, 시장 실패, 개인사적 침체, 재발견 |
| 8 | (1 - 6 - 8) | 시장의 배신을 극복하고 국내 성공: 구설수 → 계약 해지 → 리움 전시 | 마크 로스코 | Mark Rothko | 고독한 예술가, 상업적 절연, 기관의 재조명 |
| 9 | (1 - 6 - 9) | 논란과 좌절 끝에 세계를 얻다: 구설수 → 계약 해지 → 비엔날레 | 프리다 칼로 | Frida Kahlo | 고통, 상업적 좌절, 내러티브 강자, 세계적 영감 |
| 10 | (2 - 4 - 7) | 정통 엘리트의 이탈과 재시작: 명문대 → 퇴학 → 군입대 | 앤디 워홀 | Andy Warhol | 엘리트, 이단아, 정체성 전환, 팝 아트의 탄생 |
| 11 | (2 - 4 - 8) | 엘리트의 좌절, 국내 기관의 구원: 명문대 → 퇴학 → 리움 전시 | 이우환 | Lee Ufan | 지성주의, 정규 미술계 이탈, 단색화 거장 |
| 12 | (2 - 4 - 9) | 정통 교육의 파기, 국제적 성공: 명문대 → 퇴학 → 비엔날레 | 루이스 부르주아 | Louise Bourgeois | 억압, 개인사, 제도권에 대한 반발, 만년의 거장 |
| 13 | (2 - 5 - 7) | 정통 엘리트 코스의 일시적 멈춤: 명문대 → 학술 인정 → 군입대 | 데이비드 호크니 | David Hockney | 전통 회화, 비평적 지지, 경력의 전환점 |
| 14 | (2 - 5 - 8) | 학술적 기반의 탄탄한 국내 제도권 진입: 명문대 → 학술 인정 → 리움 전시 | 서도호 | Do Ho Suh | 엘리트 코스, 건축/개념적 접근, 국내 대표 작가 |
| 15 | (2 - 5 - 9) | 최정예 엘리트의 국제적 거장 궤적: 명문대 → 학술 인정 → 비엔날레 | 아이 웨이웨이 | Ai Weiwei | 제도적 완성, 비평가들의 지지, 국제적 담론 주도 |
| 16 | (2 - 6 - 7) | 성장통: 시장 실패 후 잠시 숨 고르기: 명문대 → 계약 해지 → 군입대 | 제프 쿤스 | Jeff Koons | 초기 성공, 상업적 논란, 재정비 및 리브랜딩 |
| 17 | (2 - 6 - 8) | 엘리트의 시련, 국내 핵심 기관의 지지: 명문대 → 계약 해지 → 리움 전시 | 김창열 | Kim Tschang-yeul | 긴 무명 기간, 시장의 실패, 국내 제도권의 명예 회복 |
| 18 | (2 - 6 - 9) | 시장의 배신을 딛고 국제적 명예를 얻다: 명문대 → 계약 해지 → 비엔날레 | 쿠사마 야요이 | Yayoi Kusama | 독창적 시각, 시장 실패, 만년의 국제적 성공 |
| 19 | (3 - 4 - 7) | 빠른 스카우트, 하지만 이탈과 공백: 큐레이터 발굴 → 퇴학 → 군입대 | 로이 리히텐슈타인 | Roy Lichtenstein | 조기 발굴, 정규 코스 이탈, 스타일의 급변 |
| 20 | (3 - 4 - 8) | 천재의 이탈, 국내 큐레이터의 구원: 큐레이터 발굴 → 퇴학 → 리움 전시 | 카라바조 | Caravaggio | 선택된 천재, 통제 불가능, 극적인 재조명 |
| 21 | (3 - 4 - 9) | 초기 발굴, 시장 이탈 후 세계적 명성: 큐레이터 발굴 → 퇴학 → 비엔날레 | 에바 헤세 | Eva Hesse | 촉망받는 여성 작가, 아카데미즘 거부, 국제적 담론 |
| 22 | (3 - 5 - 7) | 초기 발굴, 학술적 인정 후의 재정비: 큐레이터 발굴 → 학술 인정 → 군입대 | 리카르도 보필 | Ricardo Bofill | 조기 영재, 비평적 지지, 매체 전환/공백 |
| 23 | (3 - 5 - 8) | 최연소 천재의 국내 제도권 완벽 진입: 큐레이터 발굴 → 학술 인정 → 리움 전시 | 양혜규 | Haegue Yang | 큐레이터 우위, 비평적 지지, 국내 핵심 기관의 선택 |
| 24 | (3 - 5 - 9) | 초기 큐레이터 발굴, 비평-국제적 거장 루트: 큐레이터 발굴 → 학술 인정 → 비엔날레 | 게르하르트 리히터 | Gerhard Richter | 전통과 혁신, 비평적 우위, 동시대 최고 거장 |
| 25 | (3 - 6 - 7) | 최연소 스타의 추락과 재기 모색: 큐레이터 발굴 → 계약 해지 → 군입대 | 에드바르트 뭉크 | Edvard Munch | 천재의 고독, 시장의 외면, 정신적 침체 |
| 26 | (3 - 6 - 8) | 촉망받던 작가의 시장 실패와 국내 재조명: 큐레이터 발굴 → 계약 해지 → 리움 전시 | 알베르토 자코메티 | Alberto Giacometti | 입체파/초현실주의, 시장의 과도한 기대, 기관의 재평가 |
| 27 | (3 - 6 - 9) | 초기 스타, 시장 실패를 극복하고 세계적 성공: 큐레이터 발굴 → 계약 해지 → 비엔날레 | 마리나 아브라모비치 | Marina Abramović | 퍼포먼스 아트, 상업적 난항, 만년의 국제적 거장 |

#### 3.7.4 조합식 매칭 로직

AI 매칭 시스템은 다음과 같은 순서로 작동한다:

1. **조합식 조회**: 플레이어가 선택한 보물 상자 3개(box_ids)를 시간순으로 정렬하여 `treasure_box_combinations` 컬렉션에서 조회
2. **우선 후보 작가 선정**: 조회된 조합의 `similar_artists` 배열을 우선 후보로 설정
3. **스토리텔링 키워드 적용**: 조합의 `storytelling_keyword`를 AI 프롬프트에 포함하여 매칭 정확도 향상
4. **최종 매칭**: Vertex AI가 우선 후보 작가 리스트와 플레이어 스펙을 비교하여 최종 매칭 작가 1명 선정


### 4. 데이터 구조 및 스키마 (Data Structure & Schema)

### 4.1 Firestore 스키마 설계

컬렉션 1: physical_game_sessions

{
  session_id: "SESSION_123456",  // PK
  started_at: Timestamp,
  ended_at: Timestamp,
  
  // 노력의 결과 (공 수집) - CuratorOdyssey 구조 반영
  balls_collected: {
    tier_1: {
      count: 2,
      axis_distribution: {
        "제도": 1,
        "학술": 0,
        "담론": 1,
        "네트워크": 0
      },
      calculated_scores: {
        radar5: {
          I: 7.0,   // 제도×1 × 0.7 × 10
          F: 3.0,   // 제도×1 × 0.3 × 10
          A: 0,
          M: 8.0,   // 담론×1 × 0.8 × 10
          Sedu: 0
        },
        sunburst_l1: {
          "제도": 10.0,
          "학술": 0,
          "담론": 10.0,
          "네트워크": 0
        }
      }
    },
    tier_2: {
      count: 3,
      axis_distribution: { /* ... */ },
      calculated_scores: { /* ... */ }
    },
    tier_3: {
      count: 5,
      axis_distribution: { /* ... */ },
      calculated_scores: { /* ... */ }
    }
  },
  
  // 우연의 결과 (보물 상자 - 시간순)
  treasure_boxes_selected: [
    {
      box_id: 1,
      age_group: "10대",
      event_description: "구설수가 생기다",
      sequence: 1,
      selected_at: Timestamp
    },
    {
      box_id: 4,
      age_group: "20대",
      event_description: "대학교에서 퇴학당하다",
      sequence: 2,
      selected_at: Timestamp
    },
    {
      box_id: 7,
      age_group: "30대",
      event_description: "군에 입대하다",
      sequence: 3,
      selected_at: Timestamp
    }
  ],
  
  // 계산된 메타데이터 (CuratorOdyssey 구조)
  calculated_metadata: {
    radar5: {
      I: 25.0,
      F: 10.0,
      A: 15.0,
      M: 20.0,
      Sedu: 3.0
    },
    sunburst_l1: {
      "제도": 35.0,
      "학술": 20.0,
      "담론": 30.0,
      "네트워크": 15.0
    },
    consistency_check: {
      radar_sum: 73.0,
      sunburst_sum: 100.0,
      mapped_sum: 72.5,
      difference: 0.5,
      valid: true
    },
    influence_score: 25.0,
    recognition_score: 15.0,
    artwork_price_range: "중상위",
    final_grade: "3등급"
  },
  
  // 주 페르소나 (보물 상자 조합)
  main_persona: {
    life_scenario: "구설수 → 퇴학 → 입대",
    event_sequence: [
      "구설수가 생기다",
      "대학교에서 퇴학당하다",
      "군에 입대하다"
    ],
    narrative_summary: "10대에 구설수가 생겼지만, 20대에 대학에서 퇴학당하고, 30대에 군에 입대한 인생"
  },
  
  // AI 매칭 결과
  ai_matching: {
    matched_artist_id: "ARTIST_0005",
    matched_artist_name: "뱅크시",
    similarity_score: 0.85,
    matching_reason: "유사한 인생 궤적과 작품 스타일",
    generated_story: "AI 생성 스토리 텍스트...",
    curator_odyssey_link: "/artist/ARTIST_0005"
  },
  
  created_at: Timestamp,
  updated_at: Timestamp
}

컬렉션 2: treasure_boxes

{
  box_id: 1,  // PK
  age_group: "10대",  // "10대" | "20대" | "30대"
  position: 1,  // 해당 나이대 내 위치 (1, 2, 3)
  event_description: "구설수가 생기다",
  event_type: "negative" | "positive" | "neutral",
  metadata: {
    category: "네트워크",
    impact_level: "high" | "medium" | "low"
  },
  created_at: Timestamp
}

컬렉션 3: treasure_box_combinations (참조용)

{
  combination_id: "COMBO_001",  // PK (COMBO_001 ~ COMBO_027)
  box_ids: [1, 4, 7],  // 정렬된 배열 (시간순, 10대-20대-30대)
  story_template: "구설수 → 퇴학 → 입대",  // 이벤트 시퀀스 템플릿
  storytelling_keyword: "파격적 궤적의 순수 아웃사이더",  // 스토리텔링 키워드 (Section 3.7.3 참조)
  similar_artists: [
    {
      name_ko: "헨리 마티스",  // 한국명
      name_en: "Henri Matisse",  // 영문명
      matching_rationale: "초기 논란, 정규 교육 중단, 긴 경력 공백, 순수성 추구",  // 매칭 근거
      keywords: ["초기 논란", "정규 교육 중단", "긴 경력 공백", "순수성 추구"]  // 키워드 배열
    }
    // 추가 유사 작가 가능 (향후 확장)
  ],
  rarity: "common" | "rare" | "epic",  // 희귀도 (자동 계산 또는 수동 설정)
  created_at: Timestamp,
  updated_at: Timestamp
}

### 4.2 CuratorOdyssey 데이터 구조 매핑

매핑 규칙 상세:

레이더 5축 매핑: - I (Institution): 제도 축 티어 1 공 × 0.7 × 10 - F (Fair): 제도 축 티어 1 공 × 0.3 × 10 - A (Award): 학술 축 티어 1 공 × 0.6 × 10 - M (Media): 담론 축 티어 1 공 × 0.8 × 10 - Sedu (Seduction): 학술 축 티어 1 공 × 0.15 × 10

선버스트 4축 계산: - 각 축별로 티어 1/2/3 공의 가중치 합산 - 티어 1: ×10, 티어 2: ×5, 티어 3: ×2

일관성 검증: - 레이더 합계와 선버스트 매핑 합계의 차이 ≤0.5 - CuratorOdyssey의 dataQualityValidator.js 로직 반영


### 5. 게이미피케이션 요소 (Gamification Elements)

### 5.1 진행도 시스템

체크포인트 진행도: - 10대 구간 도달: 33% - 20대 구간 도달: 66% - 30대 구간 도달: 100%

시각적 피드백: - 실시간 진행도 바 표시 - 각 구간별 애니메이션 효과 - 보물 상자 선택 시 특수 효과

### 5.2 성취 시스템

성취 배지: - “노력의 달인”: 티어 1 공 5개 이상 수집 - “균형잡힌 작가”: 4축 모두 공 수집 - “운명의 선택”: 특정 보물 상자 조합 달성 (예: [1,4,7] 조합) - “완벽한 일관성”: 일관성 검증 차이 <0.1p

### 5.3 리더보드 시스템

랭킹 기준: - 최종 점수 (레이더 합계) - 영향력 점수 - 일관성 점수 (차이가 작을수록 높은 점수)

주간/월간 리더보드: - 상위 10명 표시 - CuratorOdyssey 작가와 비교 가능


### 6. 인사이트 스코프 정의 (Insights Scope)

### 6.1 개인 레벨 인사이트

플레이어별 게임 결과 분석: - 점수 분포 (레이더 5축, 선버스트 4축) - 티어별 수집 패턴 (티어 1/2/3 비율) - 축별 수집 패턴 (제도/학술/담론/네트워크 비율) - 노력 vs 우연 균형 분석 (공 수집 vs 보물 상자 영향)

매칭된 작가와의 유사도 상세 분석: - 레이더 5축 비교 차트 - 선버스트 4축 비교 차트 - 시계열 궤적 비교 (Phase 2 데이터 활용) - 유사도 점수 상세 분석

### 6.2 집계 레벨 인사이트

전체 플레이어 통계 대시보드: - 평균 점수 분포 - 인기 보물 상자 조합 Top 10 - 티어별 수집 패턴 통계 - 축별 수집 패턴 통계

시간대별 플레이 패턴 분석: - 시간대별 플레이 횟수 - 시간대별 평균 점수 - 시간대별 인기 보물 상자 조합

### 6.3 CuratorOdyssey 교차 분석 인사이트

게임 플레이어 vs 실제 작가 비교: - 플레이어 커뮤니티 점수 분포 vs 실제 작가 점수 분포 - 플레이어 보물 상자 조합 vs 실제 작가 인생 이벤트 패턴 - 게임 밸런스 검증 (실제 작가 분포와의 일치도)

유사도 분포 분석: - AI 매칭 유사도 점수 분포 - 매칭 정확도 검증 (실제 작가와의 유사도)



## Part 2: 웹앱 통합 BRD

### 7. 웹앱 통합 개요

### 7.1 통합 목적

피지컬 게임 결과를 CuratorOdyssey 웹앱으로 자연스럽게 연결하여, 플레이어가 자신의 결과와 유사한 작가를 더 깊이 탐색할 수 있도록 한다.

### 7.2 통합 수준

자동 모니터 제어: 배 감지 시 모니터 자동 켜기

결과 화면 자동 표시: 게임 종료 시 웹앱 결과 페이지로 자동 전환

CuratorOdyssey API 연동: 매칭된 작가 상세 정보 조회 (Phase 1-4)


### 8. 웹앱 기능 요구사항

### 8.1 FR-WEB-001: 모니터 자동 켜기

설명: 웹앱은 WebSocket으로 배 감지 신호를 수신하면 모니터를 자동으로 켜고 전체화면 모드로 전환해야 한다.

입력 (Input):

출력 (Output): - 모니터 켜기 성공/실패 상태 - 전체화면 모드 활성화 상태

사전 조건 (Preconditions): - 웹앱 실행 중 - WebSocket 연결 수립 - 브라우저 전체화면 API 지원

사후 조건 (Postconditions): - 모니터 자동 켜기 (HDMI CEC 또는 전체화면) - 결과 화면으로 자동 전환

수용 기준 (AC-WEB-001): - 모니터 켜기 지연 <2초 - 전체화면 전환 성공률 ≥95%

테스트 케이스: TC-WEB-001 (모니터 자동 제어)


### 8.2 FR-WEB-002: 게임 결과 표시

설명: 웹앱은 게임 세션 데이터를 받아 주 페르소나, 노력 스펙, CuratorOdyssey 레이더/선버스트 차트, AI 매칭 결과를 표시해야 한다.

입력 (Input):

출력 (Output): - 결과 화면 렌더링 (주 페르소나, 스펙, 차트, 매칭 결과)

화면 구성:

┌─────────────────────────────────┐
│   게임 결과                      │
│                                 │
│   [주 페르소나]                  │
│   ────────────────────────────  │
│   10대: 구설수가 생기다         │
│   20대: 대학교에서 퇴학당하다   │
│   30대: 군에 입대하다           │
│                                 │
│   [노력의 결과]                  │
│   ────────────────────────────  │
│   레이더 차트 (5축)             │
│   [D3.js Radar Chart]           │
│                                 │
│   선버스트 차트 (4축)           │
│   [D3.js Sunburst Chart]        │
│                                 │
│   [당신과 유사한 작가]           │
│   ────────────────────────────  │
│   뱅크시 (유사도: 85%)         │
│   [작가 프로필 카드]             │
│                                 │
│   [CuratorOdyssey에서 더        │
│    알아보기] → /artist/ARTIST_0005│
└─────────────────────────────────┘

사전 조건 (Preconditions): - 게임 세션 완료 - 세션 데이터 Firestore 저장 완료 - CuratorOdyssey API 접근 가능

사후 조건 (Postconditions): - 결과 화면 렌더링 완료 - CuratorOdyssey 차트 표시 완료 - 매칭 작가 정보 표시 완료

수용 기준 (AC-WEB-002): - 결과 화면 로딩 시간 <2초 - 차트 렌더링 시간 <1초 - CuratorOdyssey 링크 클릭 가능

테스트 케이스: TC-WEB-002 (결과 화면 표시)


### 8.3 FR-WEB-003: CuratorOdyssey 작가 데이터 조회

**설명**: 웹앱은 매칭된 작가의 Phase 1-4 데이터를 CuratorOdyssey API를 통해 조회하여 비교 차트를 표시해야 한다.

**FRD 연계**: 본 요구사항은 다음 FRD FR과 연계됩니다:
- [FR-P1-SUM-001](FRD.md#fr-p1-sum-001-아티스트-요약-데이터-조회): 아티스트 요약 데이터 조회
- [FR-P2-TIM-001](FRD.md#fr-p2-tim-001-시계열-데이터-조회): 시계열 데이터 조회 (단일 축)
- [FR-P2-BAT-001](FRD.md#fr-p2-bat-001-배치-시계열-데이터-조회): 배치 시계열 데이터 조회 (다중 축)
- [FR-P3-CMP-001](FRD.md#fr-p3-cmp-001-두-아티스트-비교-데이터-조회): 두 아티스트 비교 데이터 조회

**입력 (Input)**:

**출력 (Output)**: 
- 매칭 작가의 Phase 1-4 데이터
- 비교 차트 데이터

**API 엔드포인트 활용**: 
- `GET /api/artist/{id}/summary` (Phase 1) - [FRD: FR-P1-SUM-001](FRD.md#fr-p1-sum-001-아티스트-요약-데이터-조회), [API Spec Section 4.2](../api/API_SPECIFICATION.md#get-apipartistidsummary)
- `POST /api/batch/timeseries` (Phase 2) - [FRD: FR-P2-BAT-001](FRD.md#fr-p2-bat-001-배치-시계열-데이터-조회), [API Spec Section 4.3](../api/API_SPECIFICATION.md#post-apibatchtimeseries)
- `GET /api/compare/{playerSessionId}/{matchedArtistId}/{axis}` (Phase 3, 확장 필요) - [FRD: FR-P3-CMP-001](FRD.md#fr-p3-cmp-001-두-아티스트-비교-데이터-조회), [API Spec Section 4.4](../api/API_SPECIFICATION.md#get-apicompareartistaartistbaxis)

사전 조건 (Preconditions): - 매칭 작가 ID 존재 - CuratorOdyssey API 접근 가능

사후 조건 (Postconditions): - 매칭 작가 데이터 조회 완료 - 비교 차트 렌더링 완료

수용 기준 (AC-WEB-003): - API 호출 시간 <2초 - 비교 차트 렌더링 시간 <1초

테스트 케이스: TC-WEB-003 (CuratorOdyssey API 연동)


### 8.4 FR-WEB-004: 비교 차트 표시 (플레이어 vs 매칭 작가)

설명: 웹앱은 플레이어의 게임 결과와 매칭된 작가의 실제 데이터를 비교하여 차트로 표시해야 한다.

비교 항목: - 레이더 5축 비교 (플레이어 vs 작가) - 선버스트 4축 비교 (플레이어 vs 작가) - 시계열 궤적 비교 (Phase 2 데이터, 향후 확장)

사전 조건 (Preconditions): - 플레이어 세션 데이터 존재 - 매칭 작가 데이터 조회 완료

사후 조건 (Postconditions): - 비교 차트 렌더링 완료 - 유사도 점수 표시 완료

수용 기준 (AC-WEB-004): - 비교 차트 렌더링 시간 <1초 - 유사도 점수 정확도 100%

테스트 케이스: TC-WEB-004 (비교 차트 표시)


### 9. 데이터 흐름 설계

### 9.1 전체 데이터 흐름 Sequence Diagram

sequenceDiagram
    participant P as 피지컬 게임
    participant A as 아두이노/ESP32
    participant B as 파이썬 백엔드
    participant W as 웹앱
    participant C as CuratorOdyssey API
    participant D as Firestore
    participant AI as Vertex AI
    
    P->>A: 게임 시작 (전진 버튼)
    A->>B: WebSocket 연결
    B->>D: 세션 생성
    B->>W: 세션 시작 알림
    
    loop 게임 진행
        P->>A: 방향타 조작
        A->>B: 공 수집 이벤트
        B->>B: 점수 계산 (CuratorOdyssey 가중치)
        B->>D: 실시간 저장
        B->>W: WebSocket 업데이트
        W->>P: 수집 현황 표시
    end
    
    P->>A: 보물 상자 선택 (각 나이대 1개씩)
    A->>B: 보물 상자 ID 전송
    B->>B: 주 페르소나 생성
    B->>D: 보물 상자 선택 저장
    
    P->>A: 골인 지점 도달
    A->>B: IR 센서 감지 (배 감지)
    B->>W: WebSocket (treasure_box_detected)
    W->>W: 모니터 켜기 (전체화면)
    W->>W: 결과 화면 전환
    
    B->>B: 최종 점수 계산
    B->>C: CuratorOdyssey 작가 데이터 조회
    C->>B: 작가 목록 반환
    
    B->>AI: 매칭 요청 (주 페르소나 + 스펙)
    AI->>B: 매칭 결과 반환
    
    B->>D: 최종 결과 저장
    B->>W: 결과 데이터 전송
    
    W->>C: 매칭 작가 상세 조회 (Phase 1-4)
    C->>W: Phase 1-4 데이터 반환
    
    W->>W: 결과 화면 렌더링
    W->>W: 비교 차트 표시

### 9.2 WebSocket 통신 프로토콜

이벤트 타입:


### 10. 기술 요구사항 (Technical Requirements)

### 10.1 하드웨어 사양

아두이노/ESP32: - 모델: ESP32 (WiFi 내장) 또는 아두이노 Uno + WiFi 모듈 - 센서: - 조도 센서 3개 (티어별 공 감지) - 초음파 센서 1개 (진입 감지) - IR 센서 1개 (배 감지)

물리적 구조: - 게임 보드: 경사각 15-20도 - 수집 컨테이너: 티어별 분리 구역, 경사각 30도 - 보물 상자 배치: 각 나이대 구간 중간에 3개씩 배치

### 10.2 소프트웨어 스택

백엔드 (Python): - Python 3.10+ - FastAPI (WebSocket 지원) - pyserial (아두이노 시리얼 통신) - Firebase Admin SDK (Python) - asyncio (비동기 처리)

웹앱 (React): - React 18 (기존 CuratorOdyssey) - D3.js 7 (레이더/선버스트 차트 재사용) - WebSocket 클라이언트 - React Router (결과 페이지 라우팅)

### 10.3 통신 프로토콜

WebSocket: - 프로토콜: WSS (프로덕션), WS (개발) - 포트: 8000 (파이썬 백엔드) - 재연결 로직: 자동 재연결 (지수 백오프)

REST API: - CuratorOdyssey API 활용 (기존 Firebase Functions) - Base URL: https://co-1016.web.app/api


### 11. 사용자 경험 플로우 (User Experience Flow)

### 11.1 전체 플로우

게임 시작: 시작점에서 전진 버튼 누르기 → 세션 생성

10대 구간: 공 수집 → 보물 상자 선택 (3개 중 1개 필수)

20대 구간: 공 수집 → 보물 상자 선택 (3개 중 1개 필수)

30대 구간: 공 수집 → 보물 상자 선택 (3개 중 1개 필수)

골인: 골인 지점 도달 → IR 센서 배 감지

결과 표시: 모니터 자동 켜기 → 결과 화면 자동 표시

CuratorOdyssey 탐색: 매칭 작가 클릭 → CuratorOdyssey 웹앱으로 이동

### 11.2 화면 구성

대기 화면: - CuratorOdyssey 브랜딩 - “게임 시작” 버튼

게임 진행 화면: - 실시간 수집 현황 - 진행도 바 - 현재 구간 표시

보물 상자 선택 화면 (각 나이대별): - 3개 보물 상자 표시 - 각 상자 설명 - “선택” 버튼

결과 화면 (자동 표시): - 주 페르소나 표시 - 레이더/선버스트 차트 - 매칭 작가 프로필 - CuratorOdyssey 링크


### 12. 인사이트 스코프 상세 정의

### 12.1 개인 레벨 인사이트

플레이어별 게임 결과 분석: - 점수 분포 시각화 (레이더 5축, 선버스트 4축) - 티어별 수집 패턴 분석 (티어 1/2/3 비율) - 축별 수집 패턴 분석 (제도/학술/담론/네트워크 비율) - 노력 vs 우연 균형 분석 (공 수집 점수 vs 보물 상자 영향)

매칭된 작가와의 유사도 상세 분석: - 레이더 5축 비교 차트 (플레이어 vs 작가) - 선버스트 4축 비교 차트 (플레이어 vs 작가) - 유사도 점수 상세 분석 (각 축별 유사도)

### 12.2 집계 레벨 인사이트

전체 플레이어 통계 대시보드: - 평균 점수 분포 히스토그램 - 인기 보물 상자 조합 Top 10 (27가지 조합 중) - 티어별 수집 패턴 통계 (전체 플레이어 평균) - 축별 수집 패턴 통계 (전체 플레이어 평균)

시간대별 플레이 패턴 분석: - 시간대별 플레이 횟수 (시간대별 히트맵) - 시간대별 평균 점수 - 시간대별 인기 보물 상자 조합

### 12.3 CuratorOdyssey 교차 분석 인사이트

게임 플레이어 vs 실제 작가 비교: - 플레이어 커뮤니티 점수 분포 vs 실제 작가 점수 분포 (히스토그램 비교) - 플레이어 보물 상자 조합 vs 실제 작가 인생 이벤트 패턴 (패턴 매칭 분석) - 게임 밸런스 검증 (실제 작가 분포와의 일치도, ±5% 허용)

유사도 분포 분석: - AI 매칭 유사도 점수 분포 (0-1 범위 히스토그램) - 매칭 정확도 검증 (실제 작가와의 유사도, 평균 ≥0.7 목표)

인사이트 제공 방법: - 웹앱 대시보드 (관리자용) - 주간 리포트 (이메일 또는 웹앱 알림) - CuratorOdyssey 확장 페이지 (공개 또는 인증 사용자용)


## 13. 부록 (Appendix)

### 13.1 용어집 (Glossary)

### 13.2 추적성 매트릭스 (Traceability Matrix)

### 13.3 미결정 사항 (Open Questions)

~~보물 상자 조합식 27가지 최종 확정 (현재 개념만 정의)~~ → Section 3.7로 이동 완료

모니터 자동 제어 방법 최종 선택 (HDMI CEC vs GPIO vs 웹앱 전체화면)

게임 세션 데이터 보관 기간 (TTL 정책)

멀티플레이어 지원 여부 (향후 확장)


문서 완료일: 2025-11-09
다음 검토일: 2025-11-16
승인 대기: Product Owner


| 지표 | 목표 | 측정 방법 |
| --- | --- | --- |
| 게임 완료율 | ≥80% | 세션 완료 수 / 시작 수 |
| 평균 플레이 시간 | 5-10분 | 세션 시간 추적 |
| AI 매칭 만족도 | ≥4.0/5.0 | 사용자 설문 (1-5점 척도) |
| CuratorOdyssey 전환율 | ≥30% | 결과 화면 → 웹앱 클릭 수 |
| 데이터 일관성 | ±0.5p | 점수 계산 검증 (±0.5p 허용 오차) |
| 모니터 자동 켜기 성공률 | ≥95% | IR 센서 감지 → 모니터 켜기 성공률 |
| 점수 계산 정확도 | 100% | CuratorOdyssey 가중치 시스템 일치도 |


| 역할 | 담당자 | 책임 | 주요 작업 |
| --- | --- | --- | --- |
| PO | 류지환 | 요구사항 우선순위화, 승인 | 요구사항 승인, 변경 관리 |
| 하드웨어 팀 | 김현태 | 센서 시스템 구축 및 플랫폼 구축 | 아두이노/ESP32 프로그래밍, 센서 배치 + 플랫폼 |
| 백엔드 팀 (Python) | 류지환 | 파이썬 백엔드 개발 | FastAPI 서버, WebSocket 통신, 점수 계산 |
| 프론트엔드 팀 | 류지환 | 웹앱 통합, 결과 화면 | React 컴포넌트, CuratorOdyssey API 연동 |
| 데이터 팀 | 류지환 | 데이터 스키마 설계 | Firestore 스키마, 보물 상자 조합식 DB |
| QA 팀 | 김현태 | 테스트/수용 기준 검증 | 하드웨어 테스트, 소프트웨어 테스트 |


| 요구사항 유형 | PO | 하드웨어 | 백엔드 | 프론트엔드 | 데이터 | QA |
| --- | --- | --- | --- | --- | --- | --- |
| FR (기능) | A | R | R | R | C | I |
| 하드웨어 사양 | R | A | C | I | I | C |
| 데이터 스키마 | A | I | C | I | R | C |
| 점수 계산 로직 | R | I | R | I | A | C |
| 웹앱 통합 | A | I | C | R | C | C |
| AI 매칭 | R | I | R | C | C | A |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| action | string | Yes | Enum: "start" | 게임 시작 액션 |
| player_id | string | No | Pattern: ^PLAYER_\d{4}$ | 플레이어 ID (옵션) |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| session_id | string | Yes | Pattern: ^SESSION_\d{6}$ | 세션 ID |
| started_at | string | Yes | ISO 8601 | 시작 시간 |
| websocket_url | string | Yes | URL 형식 | WebSocket 연결 URL |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| session_id | string | Yes | Pattern: ^SESSION_\d{6}$ | 세션 ID |
| ball_data | object | Yes | - | 공 감지 데이터 |
| ball_data.tier | integer | Yes | Enum: 1, 2, 3 | 티어 (1=당구공, 2=골프공, 3=탁구공) |
| ball_data.axis | string | Yes | Enum: 제도, 학술, 담론, 네트워크 | 축 이름 |
| ball_data.count | integer | Yes | Minimum: 1 | 수집 개수 |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| balls_collected | object | Yes | - | 수집된 공 데이터 |
| balls_collected.tier_{tier} | object | Yes | - | 티어별 수집 데이터 |
| balls_collected.tier_{tier}.count | integer | Yes | Minimum: 0 | 총 수집 개수 |
| balls_collected.tier_{tier}.axis_distribution | object | Yes | - | 축별 분포 |
| calculated_scores | object | Yes | - | 계산된 점수 |
| calculated_scores.radar5 | object | Yes | Required: I, F, A, M, Sedu | 레이더 5축 점수 |
| calculated_scores.sunburst_l1 | object | Yes | Required: 제도, 학술, 담론, 네트워크 | 선버스트 4축 점수 |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| session_id | string | Yes | Pattern: ^SESSION_\d{6}$ | 세션 ID |
| age_group | string | Yes | Enum: "10대", "20대", "30대" | 나이대 구간 |
| box_id | integer | Yes | Range: 1-9 | 보물 상자 ID (해당 나이대 내 1-3) |
| sequence | integer | Yes | Range: 1-3 | 선택 순서 (시간순) |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| treasure_boxes_selected | array[object] | Yes | Length: 3 | 선택된 보물 상자 배열 (시간순) |
| treasure_boxes_selected[].box_id | integer | Yes | Range: 1-9 | 보물 상자 ID |
| treasure_boxes_selected[].age_group | string | Yes | Enum | 나이대 구간 |
| treasure_boxes_selected[].event_description | string | Yes | - | 이벤트 설명 |
| treasure_boxes_selected[].sequence | integer | Yes | Range: 1-3 | 선택 순서 |
| main_persona | object | Yes | - | 주 페르소나 |
| main_persona.life_scenario | string | Yes | - | 인생 시나리오 문자열 |
| main_persona.event_sequence | array[string] | Yes | Length: 3 | 이벤트 순서 배열 |
| main_persona.narrative_summary | string | Yes | - | 내러티브 요약 |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| balls_collected | object | Yes | - | 공 수집 데이터 (FR-PHYS-002 출력) |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| calculated_metadata | object | Yes | - | 계산된 메타데이터 |
| calculated_metadata.radar5 | object | Yes | Required: I, F, A, M, Sedu | 레이더 5축 점수 (0-100) |
| calculated_metadata.sunburst_l1 | object | Yes | Required: 제도, 학술, 담론, 네트워크 | 선버스트 4축 점수 (0-100) |
| calculated_metadata.consistency_check | object | Yes | - | 일관성 검증 결과 |
| calculated_metadata.consistency_check.valid | boolean | Yes | - | 검증 통과 여부 |
| calculated_metadata.consistency_check.difference | number | Yes | Range: 0-0.5 | 오차 값 |
| calculated_metadata.influence_score | number | Yes | Range: 0-100 | 영향력 점수 |
| calculated_metadata.recognition_score | number | Yes | Range: 0-100 | 인지도 점수 |
| calculated_metadata.artwork_price_range | string | Yes | Enum: "상위", "중상위", "중위", "하위" | 작품 가격 범위 |
| calculated_metadata.final_grade | string | Yes | Enum: "1등급", "2등급", "3등급", "4등급", "5등급" | 최종 등급 |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| session_id | string | Yes | Pattern: ^SESSION_\d{6}$ | 세션 ID |
| main_persona | object | Yes | - | 주 페르소나 (FR-PHYS-003 출력) |
| calculated_metadata | object | Yes | - | 계산된 메타데이터 (FR-PHYS-004 출력) |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| ai_matching | object | Yes | - | AI 매칭 결과 |
| ai_matching.matched_artist_id | string | Yes | Pattern: ^ARTIST_\d{4}$ | 매칭된 작가 ID |
| ai_matching.matched_artist_name | string | Yes | - | 매칭된 작가 이름 |
| ai_matching.similarity_score | number | Yes | Range: 0-1 | 유사도 점수 |
| ai_matching.matching_reason | string | Yes | - | 매칭 이유 설명 |
| ai_matching.generated_story | string | Yes | - | AI 생성 스토리 텍스트 |
| ai_matching.curator_odyssey_link | string | Yes | URL 형식 | CuratorOdyssey 작가 페이지 링크 |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| sensor_type | string | Yes | Enum: "ir" | 센서 타입 |
| detected_object | string | Yes | Enum: "treasure_box" | 감지된 객체 |
| session_id | string | Yes | Pattern: ^SESSION_\d{6}$ | 세션 ID |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| event | string | Yes | Enum: "treasure_box_detected" | 이벤트 타입 |
| session_id | string | Yes | Pattern: ^SESSION_\d{6}$ | 세션 ID |
| timestamp | number | Yes | Unix timestamp | 이벤트 발생 시간 |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| event | string | Yes | Enum: "treasure_box_detected" | 이벤트 타입 |
| session_id | string | Yes | Pattern: ^SESSION_\d{6}$ | 세션 ID |
| timestamp | number | Yes | Unix timestamp | 이벤트 발생 시간 |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| session_id | string | Yes | Pattern: ^SESSION_\d{6}$ | 세션 ID |


| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- |
| matched_artist_id | string | Yes | Pattern: ^ARTIST_\d{4}$ | 매칭된 작가 ID |
| player_session_id | string | Yes | Pattern: ^SESSION_\d{6}$ | 플레이어 세션 ID |


| 이벤트 | 방향 | 설명 | 데이터 구조 |
| --- | --- | --- | --- |
| game_start | B→W | 게임 시작 알림 | {session_id, started_at} |
| ball_collected | B→W | 공 수집 업데이트 | {tier, axis, count, calculated_scores} |
| treasure_box_selected | B→W | 보물 상자 선택 | {box_id, age_group, sequence, main_persona} |
| treasure_box_detected | B→W | 배 감지 (모니터 켜기 트리거) | {session_id, timestamp} |
| game_complete | B→W | 게임 완료 | {session_id, final_results, ai_matching} |


| 용어 | 정의 |
| --- | --- |
| 노력 | 공 수집을 통한 플레이어의 선택적 행동 |
| 우연 | 보물 상자를 통한 통제 불가능한 인생의 전환점 |
| 주 페르소나 | 보물 상자 3개의 시간순 조합으로 생성된 인생 시나리오 |
| 스펙 | 공 수집 데이터로 계산된 영향력/인지도/작품 가격 메타데이터 |
| 티어 | 공의 크기 및 난이도 (1=당구공, 2=골프공, 3=탁구공) |
| 축 | CuratorOdyssey의 4축 (제도/학술/담론/네트워크) |
| 일관성 검증 | 레이더 합계와 선버스트 매핑 합계의 차이 검증 (±0.5p 허용) |


| FR ID | 설명 | API 엔드포인트 | 테스트 케이스 | 데이터 스키마 | 상태 |
| --- | --- | --- | --- | --- | --- |
| FR-PHYS-001 | 게임 시작 및 세션 관리 | WebSocket 연결 | TC-PHYS-001 | physical_game_sessions | 🔄 구현 필요 |
| FR-PHYS-002 | 공 수집 시스템 | WebSocket 이벤트 | TC-PHYS-002 | physical_game_sessions.balls_collected | 🔄 구현 필요 |
| FR-PHYS-003 | 보물 상자 선택 시스템 | WebSocket 이벤트 | TC-PHYS-003 | physical_game_sessions.treasure_boxes_selected | 🔄 구현 필요 |
| FR-PHYS-004 | 점수 계산 엔진 | 내부 로직 | TC-PHYS-004 | physical_game_sessions.calculated_metadata | 🔄 구현 필요 |
| FR-PHYS-005 | AI 매칭 시스템 | 내부 로직 + Vertex AI | TC-PHYS-005 | physical_game_sessions.ai_matching | 🔄 구현 필요 |
| FR-PHYS-006 | 자동 모니터 제어 | WebSocket 이벤트 | TC-PHYS-006 | - | 🔄 구현 필요 |
| FR-WEB-001 | 모니터 자동 켜기 | WebSocket 수신 | TC-WEB-001 | - | 🔄 구현 필요 |
| FR-WEB-002 | 게임 결과 표시 | WebSocket 수신 | TC-WEB-002 | - | 🔄 구현 필요 |
| FR-WEB-003 | CuratorOdyssey 작가 데이터 조회 | GET /api/artist/{id}/summary | TC-WEB-003 | artist_summary | ✅ 기존 API 활용 |
| FR-WEB-004 | 비교 차트 표시 | GET /api/compare/{A}/{B}/{axis} (확장) | TC-WEB-004 | compare_pairs | 🔄 확장 필요 |
