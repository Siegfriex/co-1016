# Windows 설치 가이드

ESP32-C3 MVP Windows 환경 설치 가이드

## 목차

1. [필수 소프트웨어 설치](#필수-소프트웨어-설치)
2. [USB 드라이버 설치](#usb-드라이버-설치)
3. [개발 도구 설치](#개발-도구-설치)
4. [환경 검증](#환경-검증)
5. [문제 해결](#문제-해결)

## 필수 소프트웨어 설치

### 1. Python 설치

1. Python 3.7 이상 다운로드:
   - https://www.python.org/downloads/
   - 버전: 3.7 이상 권장

2. 설치 시 옵션:
   - ✅ "Add Python to PATH" 체크
   - ✅ "Install pip" 체크

3. 설치 확인:
   ```cmd
   python --version
   pip --version
   ```

### 2. Git 설치

1. Git 다운로드:
   - https://git-scm.com/download/win

2. 설치 확인:
   ```cmd
   git --version
   ```

3. Git 사용자 설정:
   ```cmd
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

### 3. VS Code 설치 (선택사항)

1. VS Code 다운로드:
   - https://code.visualstudio.com/

2. PlatformIO 확장 설치:
   - VS Code에서 확장 검색: "PlatformIO IDE"
   - 설치 및 재시작

## USB 드라이버 설치

### ESP32-C3 USB 드라이버

Windows 10/11은 대부분 자동으로 드라이버를 설치하지만, 수동 설치가 필요한 경우:

1. **CP210x 드라이버** (대부분의 ESP32-C3 보드):
   - 다운로드: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
   - 설치 후 재부팅

2. **CH340 드라이버** (일부 보드):
   - 다운로드: http://www.wch.cn/downloads/CH341SER_EXE.html
   - 설치 후 재부팅

### COM 포트 확인

1. 장치 관리자 열기:
   - `Win + X` → "장치 관리자"

2. "포트(COM 및 LPT)" 섹션 확인:
   - "USB 직렬 장치 (COM5)" 등 표시 확인
   - COM 포트 번호 기록

3. 포트가 보이지 않으면:
   - USB 케이블 재연결
   - 다른 USB 포트 시도
   - 드라이버 재설치

## 개발 도구 설치

### 자동 설치 스크립트 사용

```cmd
cd C:\tthony
scripts\install_dependencies.bat
```

### 수동 설치

1. **esptool.py 설치**:
   ```cmd
   pip install esptool
   ```

2. **mpremote 설치**:
   ```cmd
   pip install mpremote
   ```

   **주의**: Windows Store Python 사용 시 PATH 문제가 발생할 수 있습니다.
   - 증상: `mpremote: 'mpremote' 용어가 인식되지 않습니다`
   - 해결: `python -m mpremote` 사용 (모든 스크립트가 자동으로 처리)
   - 또는 PATH에 스크립트 디렉토리 추가 (설치 메시지 참조)

3. **PlatformIO Core 설치** (VS Code 확장 미사용 시):
   ```cmd
   pip install platformio
   ```

## 환경 검증

### 검증 스크립트 실행

```cmd
scripts\verify_environment.bat
```

### 수동 검증

1. **Python 확인**:
   ```cmd
   python --version
   ```

2. **도구 확인**:
   ```cmd
   esptool.py version
   python -m mpremote --version
   pio --version
   ```

   **참고**: `mpremote --version`이 작동하지 않으면 `python -m mpremote --version` 사용

3. **COM 포트 확인**:
   - 장치 관리자에서 확인
   - 또는 PowerShell:
     ```powershell
     Get-CimInstance Win32_SerialPort | Select-Object Name, DeviceID
     ```

## 문제 해결

### Python이 인식되지 않음

**증상**: `python` 명령어가 작동하지 않음

**해결**:
1. PATH 환경 변수 확인
2. Python 재설치 시 "Add Python to PATH" 체크
3. 명령 프롬프트 재시작

### mpremote PATH 문제

**증상**: `mpremote: 'mpremote' 용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다`

**원인**: Windows Store Python 사용 시 스크립트 디렉토리가 PATH에 없음

**해결 방법**:
1. `python -m mpremote` 사용 (권장):
   ```cmd
   python -m mpremote connect COM5 run
   ```
2. 스크립트 사용 (자동으로 python -m mpremote 사용):
   ```cmd
   scripts\monitor.bat COM5
   scripts\upload_files.bat COM5
   ```
3. PATH에 스크립트 디렉토리 추가 (설치 메시지의 경로 참조)

자세한 내용은 [문제 해결 가이드](TROUBLESHOOTING.md#mpremote-path-문제) 참조

### COM 포트가 보이지 않음

**증상**: 장치 관리자에 COM 포트가 없음

**해결**:
1. USB 케이블 확인 (데이터 전송 지원)
2. 다른 USB 포트 시도
3. 드라이버 재설치
4. 보드 재연결

### pip 설치 실패

**증상**: `pip install` 실행 시 에러

**해결**:
1. pip 업그레이드:
   ```cmd
   python -m pip install --upgrade pip
   ```

2. 관리자 권한으로 실행:
   - 명령 프롬프트를 관리자 권한으로 실행

3. 방화벽/프록시 확인

### esptool.py 실행 오류

**증상**: `esptool.py` 명령어가 작동하지 않음

**해결**:
1. Python Scripts 디렉토리가 PATH에 있는지 확인
2. 전체 경로로 실행:
   ```cmd
   python -m esptool version
   ```

## 다음 단계

환경 설정 완료 후:
1. [펌웨어 업로드 가이드](BUILD_DEPLOY.md#펌웨어-업로드) 참조
2. [파일 업로드 가이드](BUILD_DEPLOY.md#파일-업로드) 참조
3. [개발 가이드](DEVELOPMENT_GUIDE.md) 참조
4. [하드웨어 세팅 체크리스트](HARDWARE_SETUP_CHECKLIST.md) 참조

## 실제 설정 예시

**WiFi 설정** (`src/config.py`):
```python
WIFI_SSID = "류지환"        # 휴대폰 핫스팟
WIFI_PASSWORD = "12345678"
BACKEND_HOST = "172.20.10.2"  # 핫스팟 네트워크의 PC IP
```

**COM 포트 확인**:
- 장치 관리자에서 "USB 직렬 장치" 확인
- 예: COM5, COM6 등

