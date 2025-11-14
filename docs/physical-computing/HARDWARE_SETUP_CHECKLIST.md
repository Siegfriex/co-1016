# 하드웨어 세팅 체크리스트

ESP32-C3 하드웨어 세팅 단계별 체크리스트

## Phase 1: 하드웨어 준비 및 검증

### 1.1 하드웨어 연결 확인

- [ ] USB-C 케이블로 ESP32-C3 보드와 PC 연결
- [ ] COM 포트 확인 (장치 관리자 또는 `ipconfig`)
- [ ] 드라이버 설치 확인 (CP210x 또는 CH340)
- [ ] COM 포트 번호 기록: `___________`

**COM 포트 확인 방법**:
```cmd
# Windows 장치 관리자에서 확인
# 또는 PowerShell에서:
Get-CimInstance Win32_SerialPort | Select-Object Name, DeviceID
```

### 1.2 하드웨어 스펙 확인

- [ ] 보드 모델 확인 (DevKitM-1, DevKitC-02 등)
- [ ] GPIO 핀 배치 확인
- [ ] 전원 공급 확인 (USB 전원 또는 외부 전원)
- [ ] `platformio.ini`의 보드 설정과 일치하는지 확인

**보드 모델 정보**: `___________`

## Phase 2: 기존 펌웨어 삭제

### 2.1 기존 펌웨어 확인

- [ ] 시리얼 모니터로 현재 펌웨어 확인
- [ ] REPL 접근 시도
- [ ] 펌웨어 타입 확인 (Arduino, MicroPython, 기타)

**현재 펌웨어 정보**: `___________`

### 2.2 펌웨어 삭제 (Flash Erase)

- [ ] ESP32-C3 부트로더 모드 진입
  - BOOT 버튼 누르고 있기
  - RESET 버튼 누르고 놓기
  - BOOT 버튼 놓기
- [ ] esptool.py로 플래시 메모리 삭제:
  ```cmd
  esptool.py --chip esp32c3 --port COM5 erase_flash
  ```
- [ ] 삭제 완료 확인

**주의사항**:
- 부트로더 모드 진입 실패 시 재시도
- COM 포트 접근 권한 확인

## Phase 3: MicroPython 펌웨어 업로드

### 3.1 펌웨어 파일 준비

- [ ] MicroPython 공식 사이트에서 ESP32-C3 펌웨어 다운로드
  - URL: https://micropython.org/download/ESP32_GENERIC_C3/
  - 버전: v1.26.1 이상 권장
- [ ] 펌웨어 파일을 `firmware/` 디렉토리에 저장
- [ ] 파일명 확인: `firmware/esp32-c3-micropython.bin`

**펌웨어 파일 경로**: `___________`

### 3.2 펌웨어 업로드

- [ ] ESP32-C3 부트로더 모드 진입
- [ ] 펌웨어 업로드 스크립트 실행:
  ```cmd
  scripts\upload_firmware.bat COM5
  ```
- [ ] 업로드 진행 상황 확인
- [ ] 업로드 완료 확인

**업로드 시간**: `___________` (일반적으로 10-30초)

### 3.3 펌웨어 검증

- [ ] ESP32-C3 리셋 (RESET 버튼)
- [ ] 시리얼 모니터로 REPL 접근:
  ```cmd
  scripts\monitor.bat COM5
  ```
- [ ] REPL에서 펌웨어 버전 확인:
  ```python
  >>> import sys
  >>> print(sys.version)
  ```
- [ ] 기본 기능 테스트:
  ```python
  >>> from machine import Pin
  >>> pin = Pin(2, Pin.OUT)
  >>> pin.value(1)
  ```

**펌웨어 버전**: `___________`

## Phase 4: 소스 코드 업로드 및 설정

### 4.1 WiFi 설정 업데이트

- [ ] `src/config.py` 파일 열기
- [ ] WiFi 설정 수정:
  ```python
  WIFI_SSID = "류지환"
  WIFI_PASSWORD = "12345678"
  ```
- [ ] 백엔드 호스트 설정:
  ```python
  BACKEND_HOST = "172.20.10.2"
  BACKEND_PORT = 8000
  ```
- [ ] 파일 저장

### 4.2 소스 코드 업로드

- [ ] 파일 업로드 스크립트 실행:
  ```cmd
  scripts\upload_files.bat COM5
  ```
- [ ] 업로드 진행 상황 확인
- [ ] 각 파일 업로드 성공 확인

**업로드된 파일 목록**:
- [ ] config.py
- [ ] motor_control.py
- [ ] sensor_reader.py
- [ ] led_panel.py
- [ ] wifi_client.py
- [ ] game_state.py
- [ ] performance.py
- [ ] main.py
- [ ] boot.py

### 4.3 파일 시스템 검증

- [ ] REPL에서 파일 목록 확인:
  ```python
  >>> import os
  >>> os.listdir()
  ```
- [ ] 모든 필수 파일 존재 확인

## Phase 5: 하드웨어 연결 및 테스트

### 5.1 GPIO 핀 연결

- [ ] GPIO 핀 할당 확인 (`src/config.py` 또는 `docs/MVP_PHYSICAL_COMPUTING_TSD.md`)
- [ ] 모터 연결:
  - [ ] GPIO 2: 모터 우측 PWM
  - [ ] GPIO 3: 모터 우측 방향
  - [ ] GPIO 8: 모터 좌측 PWM
  - [ ] GPIO 9: 모터 좌측 방향
- [ ] 센서 연결:
  - [ ] GPIO 4: 조도 센서 (CDS)
  - [ ] GPIO 5: MPU-6050 SDA (I2C)
  - [ ] GPIO 6: MPU-6050 SCL (I2C)
  - [ ] GPIO 12: IR 센서
- [ ] 조이스틱 연결:
  - [ ] GPIO 1: 조이스틱 X축
  - [ ] GPIO 0: 조이스틱 Y축
  - [ ] GPIO 11: 조이스틱 버튼
- [ ] LED 패널 연결:
  - [ ] GPIO 20: LED NEO (WS2812B 단일 핀)
- [ ] 초음파 센서: 사용 안함
- [ ] 공통 그라운드 연결 확인
- [ ] 전원 공급 확인

### 5.2 부팅 테스트

- [ ] ESP32-C3 리셋 (RESET 버튼)
- [ ] 시리얼 모니터로 부팅 로그 확인:
  ```cmd
  scripts\monitor.bat COM5
  ```
- [ ] 부팅 로그 확인:
  - [ ] "ESP32-C3 MVP Booting..." 메시지
  - [ ] 모듈 초기화 메시지
  - [ ] WiFi 연결 시도 메시지
- [ ] 에러 메시지 확인

### 5.3 개별 모듈 테스트

- [ ] **모터 테스트**:
  - [ ] REPL에서 모터 제어 테스트
  - [ ] 좌/우 회전 확인
- [ ] **센서 테스트**:
  - [ ] 조도 센서 값 읽기
  - [ ] 초음파 센서 거리 측정
  - [ ] IR 센서 상태 확인
  - [ ] 조이스틱 입력 확인
- [ ] **LED 패널 테스트**:
  - [ ] LED 패널 초기화 확인
  - [ ] 픽셀 표시 테스트
- [ ] **WiFi 테스트**:
  - [ ] WiFi 연결 확인
  - [ ] 백엔드 연결 테스트 (백엔드가 실행 중인 경우)

## Phase 6: 통합 테스트

### 6.1 메인 루프 실행

- [ ] ESP32-C3 리셋
- [ ] 시리얼 모니터로 메인 루프 실행 확인
- [ ] 센서 읽기 주기 확인 (100ms)
- [ ] 모터 제어 반응 확인
- [ ] LED 패널 업데이트 확인 (33ms)
- [ ] WiFi 통신 확인 (백엔드 실행 중인 경우)

### 6.2 하드웨어-소프트웨어 통합 테스트

- [ ] 조이스틱 입력 → 모터 제어 확인
- [ ] 조도 센서 변화 → LED 패널 반응 확인
- [ ] 초음파 센서 거리 → 게임 상태 변경 확인
- [ ] IR 센서 감지 → 게임 종료 확인
- [ ] WiFi 통신 → 백엔드 데이터 전송 확인

## Phase 7: 문서 동기화

- [ ] 설정 파일 문서 동기화 완료
- [ ] 하드웨어 스펙 문서 동기화 완료
- [ ] 개발 가이드 문서 정렬화 완료
- [ ] 최종 개발 블루프린트 문서 작성 완료

## Phase 8: 검증 및 완료

- [ ] 전체 시스템 검증 완료
- [ ] 문서 최종 검토 완료

## 문제 해결

### 부트로더 모드 진입 실패
- USB 케이블 재연결
- 다른 USB 포트 시도
- BOOT 버튼과 RESET 버튼 타이밍 조정
- 드라이버 재설치

### 펌웨어 업로드 실패
- COM 포트 번호 확인
- 다른 프로그램이 포트 사용 중인지 확인
- 보드레이트 낮추기 (115200)
- 펌웨어 파일 무결성 확인

### 파일 업로드 실패
- REPL 접근 가능 여부 확인
- 파일 크기 확인 (메모리 부족 가능)
- 파일 이름 확인 (특수 문자 없음)
- 파일 시스템 포맷 확인

### WiFi 연결 실패
- SSID/비밀번호 정확성 확인
- 핫스팟 활성화 확인
- 네트워크 범위 확인
- 타임아웃 값 증가

