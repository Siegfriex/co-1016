# MVP 코드 알고리즘 문서

ESP32-C3 MVP 펌웨어의 주요 알고리즘 상세 설명

## 1. 모터 제어 알고리즘

### 1.1 조이스틱 입력 처리

**목적**: 조이스틱 X축 값을 읽어 모터 방향을 결정합니다.

**입력**: 조이스틱 X축 값 (GPIO 1, 0-4095, 중앙 ~2048)

**출력**: 모터 PWM 및 방향 신호

**알고리즘**:

```
1. 조이스틱 X값 읽기: joystick_x (0-4095)
2. 중앙값에서 오프셋 계산: x_offset = joystick_x - JOYSTICK_CENTER (2048)
3. 데드존 체크:
   IF abs(x_offset) < JOYSTICK_DEADZONE (50):
       → 직진 모드
   ELIF x_offset < -JOYSTICK_DEADZONE:
       → 좌회전 모드
   ELSE:  // x_offset > JOYSTICK_DEADZONE
       → 우회전 모드
4. 모터 제어 신호 출력
```

**시간 복잡도**: O(1)

**공간 복잡도**: O(1)

**성능**: 실행 시간 <1ms

### 1.2 모터 제어 모드

#### 직진 모드
- 좌측 모터 (GPIO 8): PWM=512, 방향=FORWARD
- 우측 모터 (GPIO 2): PWM=512, 방향=FORWARD

#### 좌회전 모드
- 좌측 모터 (GPIO 8): PWM=256, 방향=REVERSE
- 우측 모터 (GPIO 2): PWM=512, 방향=FORWARD

#### 우회전 모드
- 좌측 모터 (GPIO 8): PWM=512, 방향=FORWARD
- 우측 모터 (GPIO 2): PWM=256, 방향=REVERSE

### 1.3 RC 카 스타일 차동 구동 알고리즘

**목적**: 조이스틱 X/Y 값을 모두 활용하여 부드러운 방향 제어를 수행합니다.

**입력**: 
- 조이스틱 X축 값 (GPIO 1, 0-4095, 중앙 2048)
- 조이스틱 Y축 값 (GPIO 0, 0-4095, 중앙 2048)
- 기본 속도 단계 (1-5단)

**출력**: 좌측/우측 모터 PWM 값 및 방향 신호

**알고리즘**:

```
1. 중앙값에서 오프셋 계산:
   x_offset = joystick_x - JOYSTICK_CENTER (2048)
   y_offset = joystick_y - JOYSTICK_CENTER (2048)

2. 데드존 체크:
   IF abs(x_offset) < JOYSTICK_DEADZONE (50):
       x_offset = 0
   IF abs(y_offset) < JOYSTICK_DEADZONE (50):
       y_offset = 0

3. 스로틀 계산 (Y축: 전후진 속도):
   throttle = abs(y_offset) / JOYSTICK_CENTER  // 0.0 ~ 1.0
   throttle = min(1.0, throttle)  // 최대 1.0으로 제한

4. 스티어링 계산 (X축: 좌우 회전):
   steering = x_offset / JOYSTICK_CENTER  // -1.0 ~ 1.0
   steering = max(-1.0, min(1.0, steering))  // 범위 제한

5. 기본 속도에 스로틀 적용:
   speed = base_speed * throttle
   // base_speed는 속도 단계에 따라 결정 (102, 204, 307, 512, 716)

6. 좌우 모터 속도 차이 계산 (차동 구동):
   steering_offset = speed * steering * 0.5  // 회전 강도 50%
   left_speed = speed + steering_offset
   right_speed = speed - steering_offset

7. 속도 범위 제한 (0-1023):
   left_speed = max(0, min(1023, left_speed))
   right_speed = max(0, min(1023, right_speed))

8. 모터 제어 신호 출력:
   - 좌측 모터: PWM=left_speed, 방향=모드에 따라 (FORWARD/REVERSE)
   - 우측 모터: PWM=right_speed, 방향=모드에 따라 (FORWARD/REVERSE)
```

**시간 복잡도**: O(1)

**공간 복잡도**: O(1)

**성능**: 실행 시간 <1ms

**특징**:
- 부드러운 회전: 스티어링 오프셋을 통해 자연스러운 회전 구현
- 속도 조절: 스로틀을 통해 전후진 속도 조절 가능
- 차동 구동: 좌우 모터 속도 차이로 회전 구현

### 1.4 속도 단계 시스템

**목적**: 모터 속도를 5단계로 제어합니다.

**속도 단계**:
- 1단: PWM 102 (10% 속도) - 기본 시작
- 2단: PWM 204 (20% 속도)
- 3단: PWM 307 (30% 속도)
- 4단: PWM 512 (50% 속도)
- 5단: PWM 716 (70% 속도)

**알고리즘**:
```
1. 시스템 시작 시 기본 속도 단계 설정 (1단)
2. 버튼 입력에 따라 속도 조절:
   - 속도 낮추기: 현재 단계 - 1 (최소 1단)
   - 속도 올리기: 현재 단계 + 1 (최대 5단)
3. 속도 단계에 따라 base_speed 업데이트
```

## 2. 버튼 클릭 패턴 처리 알고리즘

### 2.1 버튼 디바운싱

**목적**: 버튼 입력의 채터링을 제거합니다.

**알고리즘**:
```
1. 버튼 상태 읽기
2. 이전 상태와 비교
3. 상태 변경 감지 시:
   IF 현재 시간 - 마지막 변경 시간 > 디바운싱 시간 (50ms):
       → 상태 변경 인정
   ELSE:
       → 무시 (채터링)
```

### 2.2 클릭 패턴 감지

**목적**: 단일 버튼의 다양한 클릭 패턴을 감지합니다.

**클릭 패턴**:
- **1번 클릭**: 시스템 시작/재개 토글
- **2번 연타**: 시스템 완전 중지
- **길게 500ms**: 전진 모드 설정
- **길게 1000ms**: 후진 모드 설정
- **짧게 누르기**: 속도 1단 낮추기
- **클릭 후 다시 누르기**: 속도 1단 올리기

**알고리즘**:
```
1. 버튼 눌림 감지 (디바운싱 적용)
2. 누르기 시작 시간 기록
3. 버튼 떼어짐 감지
4. 누르기 지속 시간 계산:
   duration = 현재 시간 - 누르기 시작 시간

5. 패턴 결정:
   IF duration >= 1000ms:
       → 후진 모드 설정
   ELIF duration >= 500ms:
       → 전진 모드 설정
   ELIF 이전 클릭과의 시간 간격 < 연타 윈도우 (500ms):
       → 클릭 횟수 증가
       → 연타 윈도우 대기 (500ms)
       → 최대 2번까지 감지
   ELSE:
       → 단일 클릭 또는 속도 조절

6. 클릭 횟수에 따라 동작 결정:
   IF 클릭 횟수 == 2:
       → 시스템 중지
   ELIF 클릭 횟수 == 1:
       → 시스템 시작/재개 또는 속도 조절
```

**시간 복잡도**: O(1)

**공간 복잡도**: O(1)

**성능**: 실행 시간 <5ms (연타 윈도우 대기 시간 포함)

## 3. 조이스틱 방향 LED 표시 알고리즘

### 3.1 방향 표시 프로세스

**목적**: 조이스틱 방향과 지속 시간에 따라 LED 패널에 시각적 피드백을 제공합니다.

**입력**:
- 조이스틱 X축 값 (0-4095, 중앙 2048)
- 방향 입력 지속 시간 (밀리초)

**출력**: LED 패널 픽셀 색상 (8x8 매트릭스)

**알고리즘**:
```
1. 중앙값에서 오프셋 계산:
   x_offset = joystick_x - JOYSTICK_CENTER (2048)

2. 데드존 체크:
   IF abs(x_offset) < JOYSTICK_DEADZONE (50):
       → 중앙 4개 LED만 표시 (기본 색상)
       RETURN

3. 방향 결정:
   direction = 1 IF x_offset > 0 ELSE -1  // 1: 우측, -1: 좌측

4. 지속 시간에 따른 열 개수 계산:
   column_count = min(4, duration_ms / 100ms + 1)
   // 100ms당 1열씩 증가, 최대 4열

5. 중앙 4개 LED 기본 표시:
   - 좌표: (3,3), (4,3), (3,4), (4,4)
   - 색상: 기본 색상 (초록)

6. 방향에 따라 열 확장:
   FOR col IN 1 TO column_count:
       IF direction > 0:  // 우측
           x_pos = 3 + 1 + col
           IF x_pos >= 8:  // 가장자리 도달
               → 가장자리 열 전체 빨간색 표시
               BREAK
           ELSE:
               → 해당 열 기본 색상 표시
       ELSE:  // 좌측
           x_pos = 3 - col
           IF x_pos < 0:  // 가장자리 도달
               → 가장자리 열 전체 빨간색 표시
               BREAK
           ELSE:
               → 해당 열 기본 색상 표시

7. LED 패널 업데이트
```

**시간 복잡도**: O(n) where n = 확장 열 수 (최대 4)

**공간 복잡도**: O(1)

**성능**: 실행 시간 ~5-10ms

**특징**:
- 중앙에서 시작하여 방향에 따라 확장
- 지속 시간에 비례하여 확장 범위 증가
- 가장자리 도달 시 빨간색으로 경고 표시

## 4. 조도 센서 안전 정지 알고리즘

### 4.1 안전 정지 프로세스

**목적**: 조도 센서 값의 급격한 변화를 감지하여 시스템을 안전하게 정지시킵니다.

**입력**: 조도 센서 값 (0-4095)

**출력**: 시스템 일시정지/재개 신호

**알고리즘**:
```
1. 첫 읽기 시 기준값 설정:
   IF baseline == None:
       baseline = 현재 조도 센서 값
       RETURN

2. 변동량 계산:
   variation = abs(현재 값 - baseline)

3. 안전 정지 조건 확인:
   IF variation > 임계값 (200 ADC):
       → 안전 정지 활성화
       → 모터 정지
       → 시스템 일시정지 상태 설정

4. 기준값 복귀 확인:
   IF variation < 임계값 * 복귀 비율 (0.5):
       → 안전 정지 해제
       → 시스템 재개
       → 모터 전진 모드 복귀
```

**시간 복잡도**: O(1)

**공간 복잡도**: O(1)

**성능**: 실행 시간 <1ms

**특징**:
- 첫 읽기 시 자동 기준값 설정
- 임계값 초과 시 즉시 정지
- 기준값 복귀 시 자동 재개

## 5. 초음파 센서 거리 계산 알고리즘 (현재 사용 안함)

**참고**: 초음파 센서는 현재 MVP에서 사용하지 않습니다. 아래 알고리즘은 참고용입니다.

### 2.1 거리 측정 프로세스 (비활성화)

**목적**: HC-SR04 초음파 센서를 사용하여 거리를 측정합니다. (현재 비활성화)

**입력**: 없음 (센서 하드웨어)

**출력**: 거리 (cm), 항상 -1 반환 (사용 안함)

**알고리즘** (참고용):

```
1. Trigger 핀 초기화: LOW
2. 2μs 대기
3. Trigger 핀 HIGH 출력
4. 10μs 대기 (펄스 폭)
5. Trigger 핀 LOW 출력
6. Echo 핀에서 HIGH 신호 대기 (타임아웃 30ms)
   IF 타임아웃:
       RETURN -1
7. HIGH 신호 시작 시점 기록: pulse_start
8. Echo 핀에서 LOW 신호 대기 (타임아웃 30ms)
   IF 타임아웃:
       RETURN -1
9. LOW 신호 시작 시점 기록: pulse_end
10. 펄스 폭 계산: pulse_width = pulse_end - pulse_start
11. 거리 계산: distance = (pulse_width * 0.034) / 2
    - 음속: 340m/s = 0.034cm/μs
    - 왕복 거리이므로 2로 나눔
12. 범위 확인 (2cm ~ 400cm)
    IF distance < 2 OR distance > 400:
        RETURN -1
13. RETURN distance
```

**현재 구현**: 항상 -1 반환 (사용 안함)

**시간 복잡도**: O(1)

**공간 복잡도**: O(1)

**성능**: 실행 시간 <1ms (단순 반환)

## 3. 센서 데이터 변경 감지 알고리즘

### 3.1 변경 감지 프로세스

**목적**: 센서 데이터가 변경되었는지 확인하여 불필요한 WiFi 전송을 방지합니다.

**입력**: 현재 센서 데이터 딕셔너리

**출력**: 변경 여부 (bool)

**알고리즘**:

```
1. 변경 플래그 초기화: changed = False
2. 조도 센서 값 비교 (GPIO 4):
   IF current_data["light_value"] != prev_light_value:
       changed = True
3. 초음파 센서는 사용 안함 (변경 확인 생략)
4. IR 센서 감지 상태 비교 (GPIO 12):
   IF current_data["ir_detected"] != prev_ir_detected:
       changed = True
5. 변경된 경우 이전 값 업데이트:
   IF changed:
       prev_light_value = current_data["light_value"]
       prev_ir_detected = current_data["ir_detected"]
6. RETURN changed
```

**시간 복잡도**: O(1)

**공간 복잡도**: O(1)

**성능**: 실행 시간 <1ms (초음파 센서 제거로 인한 성능 향상)

**참고**: 초음파 센서는 현재 사용하지 않습니다.

## 4. WiFi 통신 알고리즘

### 4.1 WiFi 연결 프로세스

**목적**: WiFi 네트워크에 연결합니다.

**입력**: SSID, 비밀번호

**출력**: 연결 성공 여부 (bool)

**알고리즘**:

```
1. WiFi Station 모드 활성화
2. WiFi 연결 시도: wlan.connect(SSID, PASSWORD)
3. 연결 대기 루프 (최대 WIFI_CONNECT_TIMEOUT 초):
   FOR timeout = WIFI_CONNECT_TIMEOUT TO 0:
       IF wlan.isconnected():
           ip_address = wlan.ifconfig()[0]
           connected = True
           RETURN True
       sleep(1)
       timeout -= 1
4. 연결 실패:
   connected = False
   RETURN False
```

**시간 복잡도**: O(n) where n = WIFI_CONNECT_TIMEOUT

**공간 복잡도**: O(1)

**성능**: 실행 시간 ~5-20초 (네트워크 상태에 따라)

### 4.2 HTTP POST 요청 전송

**목적**: 센서 데이터를 HTTP POST 요청으로 백엔드에 전송합니다.

**입력**: 센서 타입, 센서 ID, 데이터 딕셔너리

**출력**: 전송 성공 여부 (bool)

**알고리즘**:

```
1. WiFi 연결 상태 확인
   IF NOT connected:
       RETURN False
2. JSON 데이터 생성:
   payload = {
       "sensor_type": sensor_type,
       "sensor_id": sensor_id,
       **data,
       "timestamp": ticks_ms()
   }
   json_data = json.dumps(payload)
3. 소켓 주소 해석: addr = getaddrinfo(HOST, PORT)
4. 소켓 생성 및 연결:
   s = socket.socket()
   s.settimeout(HTTP_TIMEOUT)
   s.connect(addr)
5. HTTP POST 요청 생성:
   request = "POST /api/sensor-data HTTP/1.1\r\n"
   request += "Host: {HOST}:{PORT}\r\n"
   request += "Content-Type: application/json\r\n"
   request += "Content-Length: {len(json_data)}\r\n"
   request += "\r\n"
   request += json_data
6. 요청 전송: s.send(request.encode())
7. 응답 대기: response = s.recv(1024)
8. 소켓 닫기: s.close()
9. 응답 파싱:
   IF "status" in response AND "ok" in response:
       RETURN True
   ELSE:
       RETURN False
```

**시간 복잡도**: O(1)

**공간 복잡도**: O(n) where n = JSON 데이터 크기

**성능**: 실행 시간 ~100-500ms (네트워크 상태에 따라)

**에러 처리**: 타임아웃, 연결 실패 등 예외 처리 포함

## 5. 게임 상태 머신 알고리즘

### 5.1 상태 전환 프로세스

**목적**: 센서 데이터를 기반으로 게임 상태를 전환합니다.

**입력**: 센서 데이터 딕셔너리

**출력**: 상태 변경 여부 (bool)

**알고리즘**:

```
1. 이전 상태 저장: previous_state = state
2. 현재 상태에 따라 조건 확인:
   
   CASE state:
       INIT:
           → WAITING (항상 전환)
       
       WAITING:
           IF distance > 0 AND distance < ULTRASONIC_ENTRY_THRESHOLD:
               → GAME_START
       
       GAME_START:
           → AGE_10 (항상 전환)
       
       AGE_10:
           IF 보물 상자 선택:
               → AGE_20
       
       AGE_20:
           IF 보물 상자 선택:
               → AGE_30
       
       AGE_30:
           IF 보물 상자 선택:
               → FINISHED
       
       FINISHED:
           IF ir_detected:
               → (게임 종료)
3. 상태 변경 시:
   state_changed = True
   로그 출력
4. RETURN state_changed
```

**시간 복잡도**: O(1)

**공간 복잡도**: O(1)

**성능**: 실행 시간 <1ms

**상태 전환 조건**:
- INIT → WAITING: 시스템 초기화 완료
- WAITING → GAME_START: 초음파 센서로 진입점 감지
- GAME_START → AGE_10: 게임 시작
- AGE_10 → AGE_20: 보물 상자 선택
- AGE_20 → AGE_30: 보물 상자 선택
- AGE_30 → FINISHED: 보물 상자 선택
- FINISHED: IR 센서로 골인 감지

## 6. LED 패널 업데이트 알고리즘

### 6.1 게임 상태별 패턴 생성

**목적**: 게임 상태에 따라 LED 패널에 패턴을 표시합니다.

**입력**: 게임 상태 문자열

**출력**: 없음 (LED 패널에 표시)

**알고리즘**:

```
1. 버퍼 클리어: buffer = [[(0,0,0) for x in range(8)] for y in range(8)]
2. 상태에 따라 패턴 생성:
   
   CASE state:
       INIT:
           모든 픽셀을 흰색(255,255,255)으로 설정
           표시
           200ms 대기
           클리어
       
       WAITING:
           중앙 점 4개를 초록색(0,255,0)으로 설정:
           (3,3), (4,3), (3,4), (4,4)
       
       PLAYING / GAME_START / AGE_10/20/30:
           진행 방향 화살표를 파란색(0,0,255)으로 설정:
           - 화살표 몸통: (2,3), (2,4), (2,5)
           - 화살표 화살촉: (5,3), (6,3), (7,3), (8,3), (9,3)
       
       FINISHED:
           모든 픽셀을 노란색(255,255,0)으로 설정
3. 버퍼를 LED 패널로 전송: show()
```

**시간 복잡도**: O(n) where n = LED_TOTAL (64)

**공간 복잡도**: O(n) where n = LED_TOTAL (64)

**성능**: 실행 시간 ~20-30ms

**업데이트 주기**: 33ms (30fps)

## 7. 메인 루프 알고리즘

### 7.1 메인 루프 프로세스

**목적**: 모든 모듈을 통합하여 게임을 실행합니다.

**입력**: 없음

**출력**: 없음 (무한 루프)

**알고리즘**:

```
1. 모듈 초기화:
   motor = MotorController()
   sensor = SensorReader()
   led = LEDPanel()
   wifi = WiFiClient()
   game_state = GameState()
2. WiFi 연결 시도
3. 초기 LED 표시
4. 메인 루프:
   WHILE True:
       loop_start_time = ticks_ms()
       
       # 센서 읽기 (100ms 주기)
       IF ticks_diff(now, last_sensor_read_time) >= 100ms:
           sensor_data = sensor.read_all()
           
           # 모터 제어
           motor.set_direction(sensor_data["joystick"]["x"])
           
           # 게임 상태 업데이트
           state_changed = game_state.update(sensor_data)
           
           # 센서 데이터 변경 시 WiFi 전송
           IF sensor.has_changed(sensor_data):
               wifi.send_sensor_data_with_retry(...)
       
       # LED 업데이트 (33ms 주기)
       IF ticks_diff(now, last_led_update_time) >= 33ms:
           led.display_game_state(game_state.get_state())
       
       # 골인 감지
       IF sensor_data["ir_detected"] AND game_state.get_state() == FINISHED:
           motor.stop()
           led.display_game_state(FINISHED)
           BREAK
       
       # 루프 주기 유지 (100ms)
       sleep_ms(max(0, 100ms - loop_duration))
```

**시간 복잡도**: O(1) per iteration

**공간 복잡도**: O(1)

**성능**: 
- 루프 주기: 100ms (10Hz)
- 센서 읽기: ~30ms
- 모터 제어: <1ms
- LED 업데이트: ~20-30ms
- WiFi 전송: ~100-500ms (비동기, 블로킹)

## 8. 성능 최적화

### 8.1 센서 읽기 최적화
- 센서 읽기 주기: 100ms (10Hz)
- 변경 감지로 불필요한 WiFi 전송 방지
- 초음파 센서 타임아웃: 30ms

### 8.2 WiFi 통신 최적화
- 재시도 로직으로 일시적 네트워크 오류 처리
- 타임아웃 설정으로 무한 대기 방지
- 연결 상태 확인으로 불필요한 연결 시도 방지

### 8.3 메모리 최적화
- LED 버퍼: 8x8x3 = 192 bytes
- 센서 데이터: ~100 bytes
- 전체 메모리 사용량: <1KB

## 9. 에러 처리

### 9.1 예외 처리 전략
- 모든 모듈에서 try-except 블록 사용
- 에러 발생 시 로그 출력 및 계속 실행
- 치명적 에러 시 정리 작업 수행

### 9.2 재시도 로직
- WiFi 연결: 최대 3회 재시도
- HTTP 요청: 최대 3회 재시도
- 재시도 간격: 1-5초

## 10. 참조

- [MVP TSD](MVP_PHYSICAL_COMPUTING_TSD.md) - 기술 설계 문서
- [MVP SRD](MVP_PHYSICAL_COMPUTING_SRD.md) - 소프트웨어 요구사항 문서

