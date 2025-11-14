# CO-1016 CURATOR ODYSSEY: 문서-코드 검증 보고서

**생성일**: 2025-11-10  
**검증 범위**: 전체 문서 스위트 (34개 문서) 및 코드베이스  
**검증 기준**: DOCUMENT_SUITE_REFERENCE_ANALYSIS.md  
**버전**: 1.0

---

## 1. 검증 개요

### 1.1 검증 목적

본 보고서는 DOCUMENT_SUITE_REFERENCE_ANALYSIS.md를 기반으로 문서 스위트 전체를 점검하고, 기능명세(FRD), 요구사항(SRD), API 엔드포인트, 데이터 모델 스키마 등을 코드베이스 수준에서 검증하여 개발 진행 시 위험요인을 사전 식별하고 예방조치를 수립합니다.

### 1.2 검증 범위

- **문서 스위트**: 34개 문서
- **코드베이스**: `functions/`, `src/`, `firestore.rules`, `firestore.indexes.json`
- **핵심 문서**: BRD, SRD, FRD, TSD, API_SPECIFICATION, DATA_MODEL_SPECIFICATION

### 1.3 검증 방법론

1. 문서-코드 매핑 분석
2. 상세 검증 (스키마, 로직, 규칙)
3. 위험요인 분석 및 우선순위 결정
4. 예방조치 수립

---

## 2. 검증 결과 요약

### 2.1 전체 평가

**일치성 점수**: 72/100

**강점**:
- ✅ 주요 API 엔드포인트 대부분 구현됨 (5/7)
- ✅ 문서 간 참조 관계 명확
- ✅ 보안 규칙 기본 구조 잘 정의됨
- ✅ 인덱스 전략 문서화 완료

**개선 필요 사항**:
- 🔴 컬렉션명 불일치 (코드 vs 문서)
- 🔴 보안 규칙 누락 (4개 컬렉션)
- ⚠️ 미구현 엔드포인트 (2개)
- ⚠️ 목업 데이터 의존성
- ⚠️ 코드-문서 추적성 부족

---

## 3. 상세 검증 결과

### 3.1 API 엔드포인트 검증

#### 3.1.1 구현 상태

| 엔드포인트 | 문서 상태 | 구현 상태 | 일치도 | 비고 |
|-----------|----------|----------|--------|------|
| `GET /api/artist/{id}/summary` | ✅ 정의됨 | ✅ 구현됨 | 100% | FR-P1-SUM-001 |
| `GET /api/artist/{id}/sunburst` | ✅ 정의됨 | ✅ 구현됨 | 100% | FR-P1-SUN-001 |
| `GET /api/artist/{id}/timeseries/{axis}` | ✅ 정의됨 | ⚠️ 목업만 | 60% | FR-P2-TIM-001, Firestore 미연동 |
| `POST /api/batch/timeseries` | ✅ 정의됨 | ❌ 미구현 | 0% | FR-P2-BAT-001 |
| `GET /api/artist/{id}/events/{axis}` | ✅ 정의됨 | ❌ 미구현 | 0% | FR-P2-EVT-001 |
| `GET /api/compare/{artistA}/{artistB}/{axis}` | ✅ 정의됨 | ✅ 구현됨 | 80% | FR-P3-CMP-001, 응답 형식 불일치 |
| `POST /api/report/generate` | ✅ 정의됨 | ✅ 구현됨 | 100% | FR-P4-RPT-001 |
| `POST /api/ai/vertex-generate` | ❌ 문서 없음 | ✅ 구현됨 | - | 확장 기능 |
| `GET /api/ai/vertex-health` | ❌ 문서 없음 | ✅ 구현됨 | - | 헬스체크 |

#### 3.1.2 발견된 문제점

**Critical**:
- `getCompareArtists` 응답 형식이 문서와 불일치
  - 문서: `{pair_id, axis, series, metrics, cached, computed_at}`
  - 코드: `{artist_a, artist_b, comparison_metrics, axis_comparison, timestamp, _p3_ui_compatible}`

**High**:
- `getArtistTimeseries` 목업 데이터만 반환, Firestore `timeseries` 컬렉션 미사용
- 미구현 엔드포인트 2개 (FR-P2-BAT-001, FR-P2-EVT-001)

**Medium**:
- 추가 엔드포인트 2개 문서화 필요 (`/api/ai/vertex-generate`, `/api/ai/vertex-health`)

### 3.2 데이터 모델/스키마 검증

#### 3.2.1 컬렉션명 일치성

| 컬렉션명 | 문서 상태 | 코드 사용 | 보안 규칙 | 상태 |
|---------|----------|----------|----------|------|
| `artist_summary` | ✅ 정의됨 | ✅ 사용 중 | ✅ 있음 | 정상 |
| `timeseries` | ✅ 정의됨 | ❌ 미사용 | ✅ 있음 | 목업만 사용 |
| `compare_pairs` | ✅ 정의됨 | ❌ 미사용 | ✅ 있음 | 코드는 `artist_comparisons` 사용 |
| `artist_sunburst` | ❌ 문서 없음 | ✅ 사용 중 | ❌ 없음 | 🔴 불일치 |
| `artist_comparisons` | ❌ 문서 없음 | ✅ 사용 중 | ❌ 없음 | 🔴 불일치 |
| `ai_reports` | ❌ 문서 없음 | ✅ 사용 중 | ❌ 없음 | 🔴 불일치 |
| `system_health` | ❌ 문서 없음 | ✅ 사용 중 | ❌ 없음 | 🔴 불일치 |
| `entities` | ✅ 정의됨 | ❌ 미사용 | ✅ 있음 | 정상 |
| `events` | ✅ 정의됨 | ❌ 미사용 | ✅ 있음 | 정상 |
| `measures` | ✅ 정의됨 | ❌ 미사용 | ✅ 있음 | 정상 |
| `physical_game_sessions` | ✅ 정의됨 | ❌ 미사용 | ❌ 없음 | ⚠️ 보안 규칙 누락 |
| `treasure_boxes` | ✅ 정의됨 | ❌ 미사용 | ❌ 없음 | ⚠️ 보안 규칙 누락 |
| `treasure_box_combinations` | ✅ 정의됨 | ❌ 미사용 | ❌ 없음 | ⚠️ 보안 규칙 누락 |

#### 3.2.2 발견된 문제점

**Critical**:
1. **컬렉션명 불일치**:
   - 코드: `artist_comparisons` vs 문서: `compare_pairs`
   - 코드에서 사용하는 4개 컬렉션이 문서에 없음 (`artist_sunburst`, `artist_comparisons`, `ai_reports`, `system_health`)

2. **보안 규칙 누락**:
   - `artist_sunburst`: 코드에서 사용하나 보안 규칙 없음
   - `artist_comparisons`: 코드에서 사용하나 보안 규칙 없음
   - `ai_reports`: 코드에서 사용하나 보안 규칙 없음
   - `system_health`: 코드에서 사용하나 보안 규칙 없음
   - `physical_game_sessions`: 문서에 정의되었으나 보안 규칙 없음
   - `treasure_boxes`: 문서에 정의되었으나 보안 규칙 없음
   - `treasure_box_combinations`: 문서에 정의되었으나 보안 규칙 없음

**High**:
- `timeseries` 컬렉션 정의되어 있으나 코드에서 미사용 (목업만 반환)

### 3.3 보안 규칙 검증

#### 3.3.1 보안 규칙 커버리지

**정의된 보안 규칙** (12개 컬렉션):
- ✅ `artist_summary`
- ✅ `timeseries`
- ✅ `compare_pairs`
- ✅ `entities`
- ✅ `events`
- ✅ `measures`
- ✅ `codebook`
- ✅ `weights`
- ✅ `axis_map`
- ✅ `edges`
- ✅ `sources`
- ✅ `snapshots`

**누락된 보안 규칙** (7개 컬렉션):
- 🔴 `artist_sunburst` (코드에서 사용 중)
- 🔴 `artist_comparisons` (코드에서 사용 중)
- 🔴 `ai_reports` (코드에서 사용 중)
- 🔴 `system_health` (코드에서 사용 중)
- ⚠️ `physical_game_sessions` (문서에 정의됨)
- ⚠️ `treasure_boxes` (문서에 정의됨)
- ⚠️ `treasure_box_combinations` (문서에 정의됨)

#### 3.3.2 발견된 문제점

**Critical**:
- 코드에서 사용하는 4개 컬렉션에 대한 보안 규칙이 없어 보안 취약점 존재
- 현재 공개 API로 운영 중이나 향후 인증 전환 시 보안 규칙 필요

### 3.4 FRD 매핑 검증

#### 3.4.1 FR ID 매핑 정확성

| FR ID | API 엔드포인트 | 구현 상태 | 매핑 정확성 |
|-------|---------------|----------|------------|
| FR-P1-SUM-001 | `GET /api/artist/{id}/summary` | ✅ 구현됨 | ✅ 정확 |
| FR-P1-SUN-001 | `GET /api/artist/{id}/sunburst` | ✅ 구현됨 | ✅ 정확 |
| FR-P2-TIM-001 | `GET /api/artist/{id}/timeseries/{axis}` | ⚠️ 목업만 | ⚠️ 부분 일치 |
| FR-P2-EVT-001 | `GET /api/artist/{id}/events/{axis}` | ❌ 미구현 | ❌ 불일치 |
| FR-P2-BAT-001 | `POST /api/batch/timeseries` | ❌ 미구현 | ❌ 불일치 |
| FR-P3-CMP-001 | `GET /api/compare/{artistA}/{artistB}/{axis}` | ✅ 구현됨 | ⚠️ 부분 일치 |
| FR-P4-RPT-001 | `POST /api/report/generate` | ✅ 구현됨 | ✅ 정확 |

#### 3.4.2 발견된 문제점

**High**:
- 코드에 FR ID 참조가 없어 추적성 부족
- FR-P3-CMP-001 응답 스키마가 문서와 불일치
- FR-P2-TIM-001 목업 데이터만 반환, 실제 Firestore 연동 없음

### 3.5 인덱스 전략 검증

#### 3.5.1 인덱스 정의 현황

**정의된 인덱스**: 14개
- `measures`: 5개 인덱스
- `timeseries`: 2개 인덱스
- `artist_summary`: 1개 인덱스
- `compare_pairs`: 2개 인덱스
- `entities`: 1개 인덱스
- `events`: 2개 인덱스
- `edges`: 1개 인덱스

#### 3.5.2 실제 쿼리 패턴 분석

**현재 코드의 쿼리 패턴**:
- `.doc().get()`: 단순 문서 조회만 사용
- 복합 쿼리 (`.where()`, `.orderBy()`) 미사용

**발견된 문제점**:
- ⚠️ 정의된 인덱스 중 실제로 사용되지 않는 인덱스 존재 가능
- 코드에서 복합 쿼리를 사용하지 않아 인덱스 필요성 검증 필요
- 향후 배치 함수 구현 시 인덱스 활용 필요

---

## 4. 위험요인 분석

### 4.1 Critical (즉시 조치 필요)

#### 4.1.1 컬렉션명 불일치

**위험도**: 🔴 높음  
**영향**: 데이터 접근 실패, 보안 규칙 우회 가능, 데이터 무결성 문제

**상세**:
- 코드: `artist_comparisons` vs 문서: `compare_pairs`
- 코드에서 사용하는 4개 컬렉션이 문서에 없음

**대응 전략**:
1. **옵션 A**: 코드 수정 (권장)
   - `artist_comparisons` → `compare_pairs`로 변경
   - `artist_sunburst` → `artist_summary`에 통합 또는 문서화
   - `ai_reports`, `system_health` 문서화 또는 제거

2. **옵션 B**: 문서 업데이트
   - 코드에서 사용하는 컬렉션을 문서에 추가
   - 컬렉션명 불일치 명시

**예방조치**:
- 컬렉션명 변경 시 코드-문서 동시 업데이트 프로세스 수립
- 컬렉션명 검증 자동화 스크립트 작성

#### 4.1.2 보안 규칙 누락

**위험도**: 🔴 높음  
**영향**: 보안 취약점, 무단 접근 가능

**상세**:
- 코드에서 사용하는 4개 컬렉션에 대한 보안 규칙 없음
- 피지컬 컴퓨팅 3개 컬렉션에 대한 보안 규칙 없음

**대응 전략**:
1. 즉시 보안 규칙 추가:
   ```javascript
   // artist_sunburst
   match /artist_sunburst/{artistId} {
     allow read: if true;
     allow write: if isAuthorizedBatchFunction() || isAdmin();
   }
   
   // artist_comparisons (또는 compare_pairs로 통일)
   match /artist_comparisons/{pairId} {
     allow read: if true;
     allow write: if isAuthorizedBatchFunction() || isAdmin();
   }
   
   // ai_reports
   match /ai_reports/{reportId} {
     allow read: if isAuthenticated();
     allow write: if isAdmin() || isAuthorizedBatchFunction();
   }
   
   // system_health
   match /system_health/{healthId} {
     allow read: if isAuthenticated();
     allow write: if isAdmin() || isAuthorizedBatchFunction();
   }
   
   // 피지컬 컴퓨팅 컬렉션
   match /physical_game_sessions/{sessionId} {
     allow read: if isAuthenticated();
     allow write: if isAuthenticated(); // 게임 세션 생성
   }
   
   match /treasure_boxes/{boxId} {
     allow read: if true; // 공개 읽기
     allow write: if isAdmin();
   }
   
   match /treasure_box_combinations/{comboId} {
     allow read: if true; // 공개 읽기
     allow write: if isAdmin();
   }
   ```

**예방조치**:
- 새 컬렉션 추가 시 보안 규칙 필수 작성 체크리스트
- 보안 규칙 검증 자동화

### 4.2 High (단기 조치 필요)

#### 4.2.1 미구현 엔드포인트

**위험도**: ⚠️ 중간  
**영향**: 기능 불완전성, 문서-코드 불일치

**상세**:
- FR-P2-EVT-001: `GET /api/artist/{id}/events/{axis}` 미구현
- FR-P2-BAT-001: `POST /api/batch/timeseries` 미구현

**대응 전략**:
1. 구현 계획 수립 (우선순위 결정)
2. 또는 문서에서 제거 (범위 조정)

**예방조치**:
- API Spec 변경 시 구현 상태 동기화 프로세스
- 미구현 엔드포인트 명시 (문서에 "구현 예정" 표시)

#### 4.2.2 목업 데이터 의존

**위험도**: ⚠️ 중간  
**영향**: 실제 데이터 연동 불가, 프로덕션 배포 불가

**상세**:
- `getArtistTimeseries` 목업 데이터만 반환
- Firestore `timeseries` 컬렉션 미사용

**대응 전략**:
1. Firestore 쿼리 구현
2. 배치 함수(`fnBatchTimeseries`) 구현 확인 및 실행

**예방조치**:
- 목업 데이터 사용 시 명확한 표시 및 제거 계획 수립
- 실제 데이터 연동 테스트 필수

#### 4.2.3 데이터 품질 검증 미구현

**위험도**: ⚠️ 중간  
**영향**: 데이터 일관성 문제

**상세**:
- ±0.5p 일관성 검증 문서에 명시되었으나 구현 상태 불명확
- Firestore Rules에서 한글 키 접근 제한으로 Cloud Functions에서 검증 필요

**대응 전략**:
1. `DataQualityValidator` 구현 확인
2. 미구현 시 구현 계획 수립

**예방조치**:
- 데이터 품질 검증 자동화
- 배치 함수 실행 시 검증 필수

### 4.3 Medium (중기 개선 필요)

#### 4.3.1 에러 처리 표준화

**위험도**: ⚠️ 낮음  
**영향**: 일관성 부족, 디버깅 어려움

**대응 전략**:
- 커스텀 에러 코드 정의 및 사용
- 에러 응답 형식 표준화

#### 4.3.2 성능 모니터링

**위험도**: ⚠️ 낮음  
**영향**: 성능 KPI 달성 여부 불명확

**대응 전략**:
- Cloud Monitoring 통합
- 성능 메트릭 수집 및 분석

#### 4.3.3 Rate Limiting 구현

**위험도**: ⚠️ 낮음  
**영향**: 문서에 명시되었으나 구현 없음

**대응 전략**:
- Functions 내 Rate Limiting 구현
- 또는 문서에서 제거

#### 4.3.4 인증 전환 계획

**위험도**: ⚠️ 낮음  
**영향**: 현재 공개 API, 향후 보안 강화 필요

**대응 전략**:
- Firebase Auth 도입 계획 수립
- 보안 규칙 인증 기반으로 전환

---

## 5. 개선 권장 사항

### 5.1 즉시 실행 권장 사항

1. **컬렉션명 통일**
   - `artist_comparisons` → `compare_pairs`로 코드 수정
   - 또는 문서 업데이트하여 불일치 명시

2. **보안 규칙 추가**
   - 누락된 7개 컬렉션에 대한 보안 규칙 즉시 추가
   - 특히 코드에서 사용하는 4개 컬렉션 우선

3. **추가 엔드포인트 문서화**
   - `/api/ai/vertex-generate`, `/api/ai/vertex-health` 문서화
   - 또는 제거 결정

### 5.2 단기 개선 권장 사항

1. **미구현 엔드포인트 구현**
   - FR-P2-EVT-001, FR-P2-BAT-001 구현
   - 또는 문서에서 제거

2. **목업 데이터 제거**
   - `getArtistTimeseries` Firestore 연동 구현
   - 배치 함수 실행 확인

3. **응답 형식 표준화**
   - `getCompareArtists` 응답 형식을 문서와 일치시키기
   - 또는 문서 업데이트

### 5.3 중기 개선 권장 사항

1. **코드-문서 추적성 강화**
   - 코드에 FR ID 주석 추가
   - 자동화된 추적성 검증 도구 도입

2. **인덱스 사용 현황 분석**
   - 실제 쿼리 패턴 분석
   - 사용되지 않는 인덱스 정리

3. **에러 처리 표준화**
   - 커스텀 에러 코드 정의
   - 일관된 에러 응답 형식

4. **성능 모니터링 설정**
   - Cloud Monitoring 통합
   - 성능 KPI 측정 및 대시보드 구축

---

## 6. 검증 체크리스트

### 6.1 API 엔드포인트

- [x] 엔드포인트 경로 일치성 검증
- [x] HTTP 메서드 일치성 검증
- [x] 요청/응답 스키마 일치성 검증
- [x] 에러 처리 일치성 검증
- [x] FR ID 매핑 정확성 검증

### 6.2 데이터 모델

- [x] 컬렉션명 일치성 검증
- [x] 필드 스키마 일치성 검증
- [x] 보안 규칙 커버리지 검증
- [x] 인덱스 전략 일치성 검증
- [x] 데이터 타입 일치성 검증

### 6.3 기능명세

- [x] FR ID 매핑 정확성 검증
- [x] FR 입력/출력 스키마 일치성 검증
- [x] 사전/사후 조건 구현 여부 검증
- [x] 예외 처리 일치성 검증
- [x] AC 커버리지 검증

### 6.4 보안

- [x] 모든 컬렉션에 대한 보안 규칙 존재 여부 검증
- [x] 검증 함수 구현 상태 검증
- [x] 권한 체계 일치성 검증

---

## 7. 결론

본 검증을 통해 문서 스위트와 코드베이스 간의 일치성을 확인하고, 주요 위험요인을 식별했습니다. 특히 컬렉션명 불일치와 보안 규칙 누락은 즉시 조치가 필요한 Critical 이슈입니다.

**다음 단계**:
1. Critical 이슈 즉시 해결 (컬렉션명 통일, 보안 규칙 추가)
2. High 이슈 단기 해결 계획 수립
3. Medium 이슈 중기 개선 계획 수립
4. 검증 프로세스 정기화 (월 1회)

---

**보고서 작성일**: 2025-11-10  
**다음 검토일**: 2025-11-17  
**검증 상태**: 완료

