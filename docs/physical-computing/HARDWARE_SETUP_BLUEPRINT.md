# 하드웨어 세팅 및 펌웨어 배포 블루프린트

ESP32-C3 하드웨어 세팅부터 펌웨어 업로드, 소스 코드 배포, 문서 동기화까지의 전체 프로세스 블루프린트

**버전**: v1.0  
**최종 수정**: 2025-11-13  
**환경**: Windows, USB-C 연결, 휴대폰 핫스팟 WiFi

## 목차

1. [개요](#개요)
2. [Phase별 상세 작업](#phase별-상세-작업)
3. [체크리스트](#체크리스트)
4. [문제 해결 가이드](#문제-해결-가이드)
5. [플로우차트](#플로우차트)
6. [빠른 참조 가이드](#빠른-참조-가이드)

## 개요

### 목표

- 기존 펌웨어 완전 삭제
- MicroPython 펌웨어 업로드
- 소스 코드 배포 및 검증
- 문서 동기화 및 정렬화

### 환경 정보

- **개발 환경**: Windows
- **연결 방식**: USB-C 케이블
- **WiFi 네트워크**: 휴대폰 핫스팟 ("류지환", "12345678")
- **백엔드 호스트**: 172.20.10.2 (핫스팟 네트워크)
- **COM 포트**: COM5 (예시, 실제 포트 번호 확인 필요)

### 예상 소요 시간

- Phase 1-2: 10분 (하드웨어 준비 및 펌웨어 삭제)
- Phase 3: 15분 (펌웨어 업로드)
- Phase 4: 10분 (소스 코드 업로드)
- Phase 5-6: 30분 (하드웨어 연결 및 테스트)
- Phase 7-8: 20분 (문서 동기화 및 검증)
- **총 예상 시간**: 약 1시간 25분

## Phase별 상세 작업

### Phase 1: 하드웨어 준비 및 검증

#### 1.1 하드웨어 연결 확인

**작업 단계**:
1. USB-C 케이블로 ESP32-C3 보드와 PC 연결
2. Windows 장치 관리자 열기 (`Win + X` → "장치 관리자")
3. "포트(COM 및 LPT)" 섹션에서 COM 포트 확인
4. COM 포트 번호 기록 (예: COM5)
5. 드라이버 설치 확인 (CP210x 또는 CH340)

**검증**:
- [ ] COM 포트가 장치 관리자에 표시됨
- [ ] 포트 번호 기록 완료
- [ ] 드라이버 정상 설치 확인

**출력물**: COM 포트 번호 (예: COM5)

#### 1.2 하드웨어 스펙 확인

**작업 단계**:
1. ESP32-C3 보드 모델 확인 (보드에 표시된 모델명 확인)
2. GPIO 핀 배치 확인 (보드 문서 참조)
3. 전원 공급 확인 (USB 전원 또는 외부 전원)
4. `platformio.ini`의 보드 설정과 일치하는지 확인

**검증**:
- [ ] 보드 모델 확인 완료
- [ ] `platformio.ini` 설정 일치 확인

**출력물**: 보드 모델 정보

### Phase 2: 기존 펌웨어 삭제

#### 2.1 기존 펌웨어 확인

**작업 단계**:
1. 시리얼 모니터 실행:
   ```cmd
   scripts\monitor.bat COM5
   ```
2. 현재 펌웨어 확인 (부팅 메시지 확인)
3. REPL 접근 시도 (`Ctrl+C`로 중단 후 REPL 프롬프트 확인)
4. 펌웨어 타입 확인 (Arduino, MicroPython, 기타)

**검증**:
- [ ] 현재 펌웨어 타입 확인 완료
- [ ] REPL 접근 가능 여부 확인

**출력물**: 현재 펌웨어 정보

#### 2.2 펌웨어 삭제 (Flash Erase)

**작업 단계**:
1. ESP32-C3 부트로더 모드 진입:
   - BOOT 버튼 누르고 있기
   - RESET 버튼 누르고 놓기
   - BOOT 버튼 놓기
2. 플래시 메모리 삭제 (스크립트 사용 권장):
   
   **Windows**:
   ```cmd
   scripts\erase_firmware.bat COM5
   ```
   
   **Linux/macOS**:
   ```bash
   ./scripts/erase_firmware.sh /dev/ttyUSB0
   ```
   
   **PowerShell**:
   ```powershell
   .\scripts\erase_firmware.ps1 -Port COM5
   ```
   
   또는 수동 실행:
   ```cmd
   python -m esptool --chip esp32c3 --port COM5 erase_flash
   ```
3. 삭제 완료 확인 (에러 메시지 없음 확인)

**검증**:
- [ ] 부트로더 모드 진입 성공
- [ ] 플래시 메모리 삭제 완료
- [ ] 에러 메시지 없음

**출력물**: 삭제 완료 로그

**주의사항**:
- 부트로더 모드 진입 실패 시 재시도
- COM 포트 접근 권한 확인
- 다른 프로그램이 포트 사용 중인지 확인
- 이레이즈 후에는 기존 펌웨어와 파일이 모두 삭제됩니다

### Phase 3: MicroPython 펌웨어 업로드

#### 3.1 펌웨어 파일 준비

**작업 단계**:
1. MicroPython 공식 사이트 방문:
   - URL: https://micropython.org/download/ESP32_GENERIC_C3/
2. 최신 버전 다운로드 (v1.26.1 이상 권장)
3. 펌웨어 파일을 `firmware/` 디렉토리에 저장
4. 파일명 확인: `firmware/esp32-c3-micropython.bin`

**검증**:
- [ ] 펌웨어 파일 다운로드 완료
- [ ] 파일 크기 확인 (일반적으로 1-2MB)
- [ ] 파일 경로 확인

**출력물**: 펌웨어 파일 경로

#### 3.2 펌웨어 업로드

**작업 단계**:
1. ESP32-C3 부트로더 모드 진입 (Phase 2.2와 동일)
2. 펌웨어 업로드 스크립트 실행:
   ```cmd
   scripts\upload_firmware.bat COM5
   ```
3. 업로드 진행 상황 확인 (진행률 표시)
4. 업로드 완료 확인 (에러 메시지 없음)

**검증**:
- [ ] 펌웨어 업로드 성공 확인
- [ ] 에러 메시지 없음 확인
- [ ] 업로드 시간 확인 (일반적으로 10-30초)

**출력물**: 업로드 완료 로그

#### 3.3 펌웨어 검증

**작업 단계**:
1. ESP32-C3 리셋 (RESET 버튼)
2. 시리얼 모니터로 REPL 접근:
   ```cmd
   REM CMD에서
   scripts\monitor.bat COM5
   ```
   ```powershell
   # PowerShell에서
   .\scripts\monitor.ps1 COM5
   ```
   
   **참고**: `mpremote` PATH 문제가 있는 경우 스크립트가 자동으로 `python -m mpremote`를 사용합니다.
3. REPL에서 펌웨어 버전 확인:
   ```python
   >>> import sys
   >>> print(sys.version)
   ```
4. 기본 기능 테스트:
   ```python
   >>> from machine import Pin
   >>> pin = Pin(2, Pin.OUT)
   >>> pin.value(1)
   >>> pin.value(0)
   ```

**검증**:
- [ ] REPL 프롬프트 (`>>>`) 표시 확인
- [ ] MicroPython 버전 출력 확인
- [ ] 기본 명령어 실행 확인

**출력물**: 펌웨어 버전 정보

### Phase 4: 소스 코드 업로드 및 설정

#### 4.1 WiFi 설정 업데이트

**작업 단계**:
1. `src/config.py` 파일 열기
2. WiFi 설정 수정:
   ```python
   WIFI_SSID = "류지환"
   WIFI_PASSWORD = "12345678"
   ```
3. 백엔드 호스트 설정:
   ```python
   BACKEND_HOST = "172.20.10.2"
   BACKEND_PORT = 8000
   ```
4. 파일 저장

**검증**:
- [ ] WiFi SSID/비밀번호 정확성 확인
- [ ] 백엔드 호스트 IP 확인

**출력물**: 업데이트된 `src/config.py`

#### 4.2 소스 코드 업로드

**작업 단계**:
1. 파일 업로드 스크립트 실행:
   ```cmd
   scripts\upload_files.bat COM5
   ```
2. 업로드 진행 상황 확인
3. 각 파일 업로드 성공 확인

**업로드 순서** (중요):
1. config.py
2. motor_control.py
3. sensor_reader.py
4. led_panel.py
5. wifi_client.py
6. game_state.py
7. performance.py
8. main.py
9. boot.py (마지막)

**검증**:
- [ ] 모든 파일 업로드 성공 확인
- [ ] 파일 크기 확인
- [ ] 에러 메시지 없음 확인

**출력물**: 업로드 완료 로그

#### 4.3 파일 시스템 검증

**작업 단계**:
1. REPL에서 파일 목록 확인:
   ```python
   >>> import os
   >>> os.listdir()
   ```
2. 주요 파일 존재 확인:
   - boot.py
   - main.py
   - config.py
   - motor_control.py
   - sensor_reader.py
   - led_panel.py
   - wifi_client.py
   - game_state.py
   - performance.py

**검증**:
- [ ] 모든 필수 파일 존재 확인
- [ ] 파일 이름 정확성 확인

**출력물**: 파일 목록

### Phase 5: 하드웨어 연결 및 테스트

#### 5.1 GPIO 핀 연결

**작업 단계**:
1. GPIO 핀 할당 확인 (`src/config.py` 또는 `docs/MVP_PHYSICAL_COMPUTING_TSD.md`)
2. 모터 연결 (GPIO 2, 3, 4, 5)
3. 센서 연결 (GPIO 6, 7, 8, 12)
4. 조이스틱 연결 (GPIO 9, 10, 11)
5. LED 패널 연결 (GPIO 13, 14, 15)
6. 공통 그라운드 연결 확인
7. 전원 공급 확인

**상세 연결 방법**: [하드웨어 연결 가이드](HARDWARE_CONNECTION_GUIDE.md) 참조

**검증**:
- [ ] 모든 핀 연결 확인
- [ ] 연결 품질 확인 (느슨한 연결 없음)
- [ ] 전원 공급 확인

**출력물**: 하드웨어 연결 다이어그램

#### 5.2 부팅 테스트

**작업 단계**:
1. ESP32-C3 리셋 (RESET 버튼)
2. 시리얼 모니터로 부팅 로그 확인:
   ```cmd
   scripts\monitor.bat COM5
   ```
3. 부팅 로그 확인:
   - "ESP32-C3 MVP Booting..." 메시지
   - 모듈 초기화 메시지
   - WiFi 연결 시도 메시지
4. 에러 메시지 확인

**검증**:
- [ ] 부팅 성공 확인
- [ ] boot.py 자동 실행 확인
- [ ] main.py 자동 실행 확인
- [ ] 에러 없음 확인

**출력물**: 부팅 로그

#### 5.3 개별 모듈 테스트

**작업 단계**:
1. **모터 테스트**:
   ```python
   >>> from motor_control import MotorController
   >>> motor = MotorController()
   >>> motor.set_direction(2048)  # 중앙값 (직진)
   ```
2. **센서 테스트**:
   ```python
   >>> from sensor_reader import SensorReader
   >>> sensor = SensorReader()
   >>> print(sensor.read_light_sensor())
   >>> print(sensor.read_ultrasonic())
   >>> print(sensor.read_ir_sensor())
   ```
3. **LED 패널 테스트**:
   ```python
   >>> from led_panel import LEDPanel
   >>> led = LEDPanel()
   >>> led.set_pixel(0, 0, 255, 0, 0)  # 빨간색
   >>> led.show()
   ```
4. **WiFi 테스트**:
   ```python
   >>> from wifi_client import WiFiClient
   >>> wifi = WiFiClient()
   >>> wifi.connect()
   ```

**검증**:
- [ ] 각 모듈 기본 동작 확인
- [ ] 센서 값 정상 범위 확인
- [ ] 에러 없음 확인

**출력물**: 모듈별 테스트 결과

### Phase 6: 통합 테스트

#### 6.1 메인 루프 실행

**작업 단계**:
1. ESP32-C3 리셋
2. 시리얼 모니터로 메인 루프 실행 확인
3. 센서 읽기 주기 확인 (100ms)
4. 모터 제어 반응 확인
5. LED 패널 업데이트 확인 (33ms)
6. WiFi 통신 확인 (백엔드 실행 중인 경우)

**검증**:
- [ ] 메인 루프 정상 실행 확인
- [ ] 루프 주기 확인 (100ms)
- [ ] 메모리 사용량 확인
- [ ] GC 발생 빈도 확인

**출력물**: 통합 테스트 로그

#### 6.2 하드웨어-소프트웨어 통합 테스트

**작업 단계**:
1. 조이스틱 입력 → 모터 제어 확인
2. 조도 센서 변화 → LED 패널 반응 확인
3. 초음파 센서 거리 → 게임 상태 변경 확인
4. IR 센서 감지 → 게임 종료 확인
5. WiFi 통신 → 백엔드 데이터 전송 확인

**검증**:
- [ ] 모든 인터랙션 정상 동작 확인
- [ ] 지연 시간 확인
- [ ] 에러 없음 확인

**출력물**: 통합 테스트 결과

### Phase 7: 문서 동기화 및 정렬화

#### 7.1 설정 파일 문서 동기화

**작업 단계**:
1. `docs/USER_CONFIGURATION_GUIDE.md` 업데이트
2. `docs/BUILD_DEPLOY.md` 업데이트
3. `docs/INSTALL_WINDOWS.md` 업데이트
4. `README.md` 업데이트

**검증**:
- [ ] 모든 문서의 설정 정보 일치 확인
- [ ] 예시 코드 정확성 확인

#### 7.2 하드웨어 스펙 문서 동기화

**작업 단계**:
1. `docs/MVP_PHYSICAL_COMPUTING_TSD.md` 검토
2. 실제 연결과 문서 불일치 시 업데이트
3. 하드웨어 연결 가이드 작성/업데이트

**검증**:
- [ ] 문서와 실제 연결 일치 확인
- [ ] 누락된 정보 보완

#### 7.3 개발 가이드 문서 정렬화

**작업 단계**:
1. `docs/DEVELOPMENT_GUIDE.md` 검토 및 업데이트
2. `docs/DEBUGGING_GUIDE.md` 검토 및 업데이트
3. `docs/TROUBLESHOOTING.md` 검토 및 업데이트
4. 문서 간 참조 링크 확인 및 수정

**검증**:
- [ ] 문서 간 일관성 확인
- [ ] 명령어 정확성 확인
- [ ] 링크 동작 확인

### Phase 8: 검증 및 완료

#### 8.1 전체 시스템 검증

**작업 단계**:
1. 하드웨어 연결 재확인
2. 펌웨어 버전 확인
3. 소스 코드 버전 확인
4. WiFi 연결 확인
5. 백엔드 통신 확인 (백엔드 실행 중인 경우)
6. 모든 센서 동작 확인
7. 모든 액추에이터 동작 확인

**검증**:
- [ ] 모든 기능 정상 동작 확인
- [ ] 성능 요구사항 충족 확인

**출력물**: 최종 검증 리포트

#### 8.2 문서 최종 검토

**작업 단계**:
1. 모든 문서 일관성 검토
2. 링크 동작 확인
3. 예시 코드 정확성 확인
4. 오타 및 문법 검토

**검증**:
- [ ] 문서 품질 확인
- [ ] 완성도 확인

**출력물**: 최종 문서 세트

## 체크리스트

전체 체크리스트는 [하드웨어 세팅 체크리스트](HARDWARE_SETUP_CHECKLIST.md) 참조

## 문제 해결 가이드

### 부트로더 모드 진입 실패

**증상**: esptool.py가 보드를 인식하지 못함

**해결**:
1. USB 케이블 재연결
2. 다른 USB 포트 시도
3. BOOT 버튼과 RESET 버튼 타이밍 조정
4. 드라이버 재설치

**상세 가이드**: [문제 해결 가이드](TROUBLESHOOTING.md#부트로더-모드-진입-실패)

### 펌웨어 업로드 실패

**증상**: 업로드 중 에러 발생

**해결**:
1. COM 포트 번호 확인
2. 다른 프로그램이 포트 사용 중인지 확인
3. 보드레이트 낮추기 (115200)
4. 펌웨어 파일 무결성 확인

**상세 가이드**: [문제 해결 가이드](TROUBLESHOOTING.md#펌웨어-업로드-실패)

### 파일 업로드 실패

**증상**: mpremote가 파일을 업로드하지 못함

**해결**:
1. REPL 접근 가능 여부 확인
2. 파일 크기 확인 (메모리 부족 가능)
3. 파일 이름 확인 (특수 문자 없음)
4. 파일 시스템 포맷 확인

**상세 가이드**: [문제 해결 가이드](TROUBLESHOOTING.md#파일-업로드-실패)

### mpremote PATH 문제

**증상**: `mpremote: 'mpremote' 용어가 인식되지 않습니다`

**해결**:
1. 스크립트 사용 (자동으로 python -m mpremote 사용):
   ```cmd
   scripts\monitor.bat COM5
   scripts\upload_files.bat COM5
   ```
2. 직접 python -m mpremote 사용:
   ```cmd
   python -m mpremote connect COM5 run
   ```
3. PATH에 스크립트 디렉토리 추가 (설치 메시지 참조)

**상세 가이드**: [문제 해결 가이드](TROUBLESHOOTING.md#mpremote-path-문제)

### WiFi 연결 실패

**증상**: WiFi 연결이 되지 않음

**해결**:
1. SSID/비밀번호 정확성 확인
2. 핫스팟 활성화 확인
3. 네트워크 범위 확인
4. 타임아웃 값 증가

**상세 가이드**: [문제 해결 가이드](TROUBLESHOOTING.md#wifi-연결-실패)

## 플로우차트

### 전체 프로세스 플로우

```
시작
  │
  ├─> Phase 1: 하드웨어 준비
  │     ├─> USB 연결 확인
  │     └─> COM 포트 확인
  │
  ├─> Phase 2: 기존 펌웨어 삭제
  │     ├─> 펌웨어 확인
  │     └─> 플래시 삭제
  │
  ├─> Phase 3: MicroPython 펌웨어 업로드
  │     ├─> 펌웨어 다운로드
  │     ├─> 펌웨어 업로드
  │     └─> 펌웨어 검증
  │
  ├─> Phase 4: 소스 코드 업로드
  │     ├─> WiFi 설정 업데이트
  │     ├─> 파일 업로드
  │     └─> 파일 시스템 검증
  │
  ├─> Phase 5: 하드웨어 연결
  │     ├─> GPIO 핀 연결
  │     ├─> 부팅 테스트
  │     └─> 개별 모듈 테스트
  │
  ├─> Phase 6: 통합 테스트
  │     ├─> 메인 루프 실행
  │     └─> 하드웨어-소프트웨어 통합 테스트
  │
  ├─> Phase 7: 문서 동기화
  │     ├─> 설정 파일 문서 동기화
  │     ├─> 하드웨어 스펙 문서 동기화
  │     └─> 개발 가이드 문서 정렬화
  │
  └─> Phase 8: 검증 및 완료
        ├─> 전체 시스템 검증
        └─> 문서 최종 검토
            │
            └─> 완료
```

### 펌웨어 업로드 플로우

```
시작
  │
  ├─> 부트로더 모드 진입
  │     ├─> BOOT 버튼 누르기
  │     ├─> RESET 버튼 누르고 놓기
  │     └─> BOOT 버튼 놓기
  │
  ├─> 펌웨어 업로드
  │     ├─> esptool.py 실행
  │     └─> 업로드 진행 확인
  │
  ├─> 업로드 완료 확인
  │     ├─> 에러 메시지 확인
  │     └─> 성공 메시지 확인
  │
  ├─> ESP32-C3 리셋
  │
  ├─> REPL 접근 확인
  │
  └─> 펌웨어 버전 확인
        │
        └─> 완료
```

## 빠른 참조 가이드

### 필수 명령어

**Windows CMD 환경**:

```cmd
REM 환경 검증
scripts\verify_environment.bat

REM 펌웨어 업로드
scripts\upload_firmware.bat COM5

REM 파일 업로드
scripts\upload_files.bat COM5

REM 시리얼 모니터
scripts\monitor.bat COM5
```

**Windows PowerShell 환경**:

```powershell
# 환경 검증
.\scripts\verify_environment.ps1

# 펌웨어 업로드 (CMD 스크립트 사용)
scripts\upload_firmware.bat COM5

# 파일 업로드
.\scripts\upload_files.ps1 COM5

# 시리얼 모니터
.\scripts\monitor.ps1 COM5
```

**참고**: 모든 스크립트가 `python -m mpremote`를 자동으로 사용하여 PATH 문제를 해결합니다.

### WiFi 설정

```python
# src/config.py
WIFI_SSID = "류지환"
WIFI_PASSWORD = "12345678"
BACKEND_HOST = "172.20.10.2"
BACKEND_PORT = 8000
```

### GPIO 핀 할당

| 핀 | 구성요소 |
|----|---------|
| GPIO 0 | 조이스틱 Y |
| GPIO 1 | 조이스틱 X |
| GPIO 2 | 모터 우측 PWM |
| GPIO 3 | 모터 우측 방향 |
| GPIO 4 | 조도 센서 (CDS) |
| GPIO 5 | MPU-6050 SDA |
| GPIO 6 | MPU-6050 SCL |
| GPIO 8 | 모터 좌측 PWM |
| GPIO 9 | 모터 좌측 방향 |
| GPIO 11 | 조이스틱 버튼 |
| GPIO 12 | IR 센서 |
| GPIO 20 | LED NEO (WS2812B) |

### 문제 해결 빠른 참조

| 문제 | 해결 방법 |
|------|----------|
| COM 포트 인식 실패 | 드라이버 재설치, USB 케이블 확인 |
| 부트로더 모드 진입 실패 | 타이밍 조정, USB 포트 변경 |
| 펌웨어 업로드 실패 | COM 포트 확인, 보드레이트 낮추기 |
| 파일 업로드 실패 | REPL 접근 확인, 파일 크기 확인 |
| WiFi 연결 실패 | SSID/비밀번호 확인, 핫스팟 활성화 확인 |

## 비상 상황 대응 가이드

### 펌웨어 업로드 실패로 인한 브릭

**증상**: ESP32-C3가 응답하지 않음

**해결**:
1. 부트로더 모드 강제 진입
2. 펌웨어 재업로드
3. 플래시 메모리 완전 삭제 후 재시도

### 파일 시스템 손상

**증상**: 파일이 업로드되지 않거나 읽을 수 없음

**해결**:
1. 파일 시스템 포맷:
   ```python
   >>> import os
   >>> os.mkfs('/flash')
   ```
2. 파일 재업로드

### 하드웨어 연결 오류

**증상**: 센서/모터가 작동하지 않음

**해결**:
1. GPIO 핀 연결 재확인
2. 공통 그라운드 확인
3. 전원 공급 확인
4. 핀 할당 확인 (`config.py`)

## 참고 자료

- [하드웨어 세팅 체크리스트](HARDWARE_SETUP_CHECKLIST.md)
- [하드웨어 연결 가이드](HARDWARE_CONNECTION_GUIDE.md)
- [빌드 및 배포 가이드](BUILD_DEPLOY.md)
- [문제 해결 가이드](TROUBLESHOOTING.md)
- [개발 가이드](DEVELOPMENT_GUIDE.md)
- [디버깅 가이드](DEBUGGING_GUIDE.md)

## 다음 단계

하드웨어 세팅 완료 후:
1. 백엔드 개발 및 배포
2. 웹앱 개발 및 배포
3. 전체 시스템 통합 테스트
4. 프로덕션 배포 준비

