# 문서 간 불일치 사항 보고서

**작성일**: 2025-11-10  
**작성자**: AI Assistant  
**버전**: 1.0

## 1. 개요

본 보고서는 BRD.md에 새로 추가된 **보물 상자 조합식 27가지** 및 **피지컬 컴퓨팅 아트워크** 관련 정보가 다른 문서들과 일치하는지 확인한 결과를 정리합니다.

## 2. 분석 대상 문서

1. **BRD.md** (기준 문서) - v1.1, 최종 수정: 2025-11-10
2. **Data Model Spec** - v1.0, 최종 수정: 2025-01-XX
3. **TSD.md** - v1.1, 최종 수정: 2025-11-10
4. **FRD.md** - v1.1, 최종 수정: 2025-11-10
5. **SRD.md** - v1.1, 최종 수정: 2025-11-10
6. **API Spec** - v1.1, 최종 수정: 2025-11-10

## 3. 불일치 사항 상세

### 3.1 Data Model Spec 불일치 (High 우선순위)

**파일**: `docs/data/DATA_MODEL_SPECIFICATION.md`

**문제**: 피지컬 컴퓨팅 아트워크 관련 컬렉션 3개가 누락됨

**누락된 컬렉션**:

1. **`physical_game_sessions`**
   - BRD Section 4.1에 정의됨
   - 게임 세션 데이터 저장
   - 필드: session_id, balls_collected, treasure_boxes_selected, calculated_metadata, main_persona, ai_matching 등

2. **`treasure_boxes`**
   - BRD Section 4.1에 정의됨
   - 보물 상자 메타데이터 (9개: 10대 3개, 20대 3개, 30대 3개)
   - 필드: box_id, age_group, position, event_description, event_type, metadata

3. **`treasure_box_combinations`**
   - BRD Section 4.1에 정의됨 (확장된 스키마)
   - 27가지 조합식 참조 데이터
   - 필드: combination_id, box_ids, story_template, **storytelling_keyword** (신규), **similar_artists** (신규 배열), rarity

**현재 상태**:
- Data Model Spec Section 1.2에 "총 12개 컬렉션"으로 명시되어 있으나, 피지컬 컴퓨팅 컬렉션은 포함되지 않음
- Section 3 (컬렉션 스키마 상세)에 피지컬 컴퓨팅 컬렉션 정의 없음
- ER 다이어그램에도 포함되지 않음

**영향도**: High
- 데이터 아키텍처 문서에 핵심 컬렉션이 누락되어 구현 시 혼란 가능
- Firestore 스키마 설계 시 참조할 수 없음

**권장 조치**: Data Model Spec Section 3에 피지컬 컴퓨팅 컬렉션 3개 추가

---

### 3.2 TSD.md 불일치 (Medium 우선순위)

**파일**: `TSD.md`

**문제**: 피지컬 컴퓨팅 아트워크 관련 기술 설계가 없음

**누락된 내용**:

1. **피지컬 컴퓨팅 아트워크 아키텍처**
   - Python FastAPI 백엔드 설계
   - 아두이노/ESP32 센서 시스템 통신
   - WebSocket 통신 프로토콜

2. **treasure_box_combinations 컬렉션 조회 로직**
   - 조합식 조회 알고리즘
   - 우선 후보 작가 선정 로직

3. **AI 매칭 시스템 (FR-PHYS-005) 기술 설계**
   - Vertex AI 통합 상세
   - 프롬프트 생성 로직
   - 유사도 계산 알고리즘

**현재 상태**:
- TSD.md는 CuratorOdyssey 웹앱에만 집중
- 피지컬 컴퓨팅 아트워크는 별도 프로젝트로 언급되지 않음

**영향도**: Medium
- 피지컬 컴퓨팅 아트워크가 별도 프로젝트라면 TSD에 포함하지 않아도 됨
- 단, BRD에서 웹앱 통합을 명시하고 있으므로 통합 부분은 기술 설계 필요

**권장 조치**: 
- 피지컬 컴퓨팅 아트워크를 별도 프로젝트로 분리할 경우, TSD에 별도 섹션 추가 또는 별도 문서 생성
- 웹앱 통합 부분(WebSocket 수신, 결과 화면 표시)은 TSD에 포함

---

### 3.3 FRD/SRD 불일치 (Low 우선순위)

**파일**: `docs/requirements/FRD.md`, `docs/requirements/SRD.md`

**문제**: FR-PHYS-005 (AI 매칭 시스템) 관련 내용이 없음

**현재 상태**:
- FRD.md와 SRD.md 모두 CuratorOdyssey 웹앱의 Phase 1-4 기능만 다룸
- 피지컬 컴퓨팅 아트워크 관련 FR이 없음

**분석**:
- BRD.md는 피지컬 컴퓨팅 아트워크를 별도 프로젝트로 정의하고 있음
- 웹앱 통합 부분(FR-WEB-001~004)은 BRD에만 정의되어 있음

**영향도**: Low
- 피지컬 컴퓨팅 아트워크가 별도 프로젝트라면 FRD/SRD에 포함하지 않아도 됨
- 웹앱 통합 기능(FR-WEB-001~004)은 FRD에 추가 고려 가능

**권장 조치**: 
- 피지컬 컴퓨팅 아트워크를 별도 프로젝트로 유지할 경우, FRD/SRD에 추가하지 않음
- 웹앱 통합 기능만 FRD에 추가할지 결정 필요

---

### 3.4 API Spec 불일치 (Low 우선순위)

**파일**: `docs/api/API_SPECIFICATION.md`

**문제**: 피지컬 컴퓨팅 아트워크 관련 API 엔드포인트가 없음

**현재 상태**:
- API Spec은 CuratorOdyssey 웹앱의 RESTful API만 정의
- 피지컬 컴퓨팅 아트워크는 Python FastAPI 백엔드로 별도 운영

**분석**:
- BRD.md에 따르면 피지컬 게임 백엔드는 Python FastAPI로 별도 운영
- 웹앱은 WebSocket으로 피지컬 게임 백엔드와 통신
- 웹앱이 사용하는 CuratorOdyssey API는 기존 API Spec에 정의되어 있음

**영향도**: Low
- 피지컬 컴퓨팅 아트워크 API는 별도 문서로 분리 가능
- 웹앱 통합을 위한 WebSocket 프로토콜은 API Spec에 추가 고려 가능

**권장 조치**: 
- 피지컬 컴퓨팅 아트워크 API는 별도 문서로 분리
- WebSocket 통신 프로토콜만 API Spec에 추가할지 결정 필요

---

## 4. 우선순위별 정리

### Critical (즉시 수정 필요)
없음

### High (높은 우선순위)
1. **Data Model Spec 업데이트**: 피지컬 컴퓨팅 컬렉션 3개 추가
   - `physical_game_sessions`
   - `treasure_boxes`
   - `treasure_box_combinations` (확장된 스키마 포함)

### Medium (중간 우선순위)
2. **TSD.md 업데이트**: 피지컬 컴퓨팅 아트워크 기술 설계 추가 또는 별도 문서 분리 결정

### Low (낮은 우선순위)
3. **FRD/SRD 업데이트**: 웹앱 통합 기능(FR-WEB-001~004) 추가 여부 결정
4. **API Spec 업데이트**: WebSocket 통신 프로토콜 추가 여부 결정

---

## 5. 의도적 제외 vs 실제 누락

### 의도적 제외로 판단되는 항목
- **FRD/SRD의 FR-PHYS-005**: 피지컬 컴퓨팅 아트워크가 별도 프로젝트이므로 의도적 제외 가능
- **API Spec의 피지컬 컴퓨팅 API**: 별도 Python FastAPI 백엔드이므로 별도 문서로 분리 가능

### 실제 누락으로 판단되는 항목
- **Data Model Spec의 피지컬 컴퓨팅 컬렉션**: Firestore에 저장되는 데이터이므로 반드시 포함 필요
- **TSD.md의 웹앱 통합 부분**: BRD에서 웹앱 통합을 명시하고 있으므로 기술 설계 필요

---

## 6. 권장 조치 사항

### 즉시 조치 (High 우선순위)

1. **Data Model Spec 업데이트**
   - Section 1.2: 컬렉션 수를 "총 15개"로 수정 (기존 12개 + 피지컬 컴퓨팅 3개)
   - Section 3: 피지컬 컴퓨팅 아트워크 컬렉션 3개 추가
     - 3.3 피지컬 컴퓨팅 아트워크 컬렉션 (신규 섹션)
     - 3.3.1 physical_game_sessions
     - 3.3.2 treasure_boxes
     - 3.3.3 treasure_box_combinations
   - Section 4 (인덱스 전략): 피지컬 컴퓨팅 컬렉션 인덱스 추가
   - Section 5 (보안 규칙): 피지컬 컴퓨팅 컬렉션 보안 규칙 추가

### 검토 필요 (Medium/Low 우선순위)

2. **프로젝트 분리 결정**
   - 피지컬 컴퓨팅 아트워크를 별도 프로젝트로 유지할지, 통합 프로젝트로 관리할지 결정
   - 별도 프로젝트로 유지할 경우:
     - TSD.md에 별도 섹션 추가 또는 별도 TSD 문서 생성
     - FRD/SRD는 웹앱 통합 부분만 추가
     - API Spec은 WebSocket 프로토콜만 추가
   - 통합 프로젝트로 관리할 경우:
     - 모든 문서에 피지컬 컴퓨팅 아트워크 관련 내용 추가

3. **문서 참조 관계 업데이트**
   - BRD.md의 참조 문서 섹션에 피지컬 컴퓨팅 관련 문서 링크 추가 (별도 문서 생성 시)
   - Data Model Spec 업데이트 후 BRD.md와의 일관성 확인

---

## 7. 다음 단계

1. **Phase 3 실행**: Data Model Spec 업데이트 (High 우선순위)
2. **프로젝트 분리 결정**: 피지컬 컴퓨팅 아트워크를 별도 프로젝트로 유지할지 결정
3. **문서 업데이트**: 결정에 따라 TSD, FRD/SRD, API Spec 업데이트

---

**문서 버전**: v1.0  
**다음 검토일**: 프로젝트 분리 결정 후

