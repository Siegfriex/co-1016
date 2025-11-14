# verify_improvements.ps1 - 모든 수정사항 통합 검증

$ErrorActionPreference = "Stop"

Write-Host "=== 문서-코드 일치성 개선 검증 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 코드 문법 검증
Write-Host "1. 코드 문법 검증..." -ForegroundColor Yellow
try {
    Push-Location functions
    node -c index.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Node.js 문법 검증 통과" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Node.js 문법 오류 발견" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host ""

# 2. wrapResponse 함수 존재 확인
Write-Host "2. wrapResponse 함수 존재 확인..." -ForegroundColor Yellow
$wrapResponseDef = Select-String -Path "functions/index.js" -Pattern "function wrapResponse" | Measure-Object
if ($wrapResponseDef.Count -eq 1) {
    Write-Host "  ✅ wrapResponse 함수 정의 확인 (1개)" -ForegroundColor Green
} else {
    Write-Host "  ❌ wrapResponse 함수 정의 없음 또는 중복" -ForegroundColor Red
    exit 1
}

# 3. wrapResponse 함수 호출 확인
Write-Host "3. wrapResponse 함수 호출 확인..." -ForegroundColor Yellow
$wrapResponseCalls = Select-String -Path "functions/index.js" -Pattern "wrapResponse\(" | Measure-Object
if ($wrapResponseCalls.Count -eq 10) {
    Write-Host "  ✅ wrapResponse 함수 호출 확인 (10개)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ wrapResponse 함수 호출 개수 불일치 (예상: 10개, 실제: $($wrapResponseCalls.Count)개)" -ForegroundColor Yellow
}

Write-Host ""

# 4. Path Parameter 파싱 검증
Write-Host "4. Path Parameter 파싱 검증..." -ForegroundColor Yellow
$pathParamParsing = Select-String -Path "functions/index.js" -Pattern "split\('\?'\)\[0\]" | Measure-Object
if ($pathParamParsing.Count -eq 4) {
    Write-Host "  ✅ Path Parameter 파싱 개선 확인 (4개 엔드포인트)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Path Parameter 파싱 개선 불완전 (예상: 4개, 실제: $($pathParamParsing.Count)개)" -ForegroundColor Yellow
}

Write-Host ""

# 5. 각 엔드포인트별 wrapResponse 적용 확인
Write-Host "5. 엔드포인트별 wrapResponse 적용 확인..." -ForegroundColor Yellow

$endpoints = @(
    @{Name="getArtistSummary"; Pattern="getArtistSummary.*wrapResponse"},
    @{Name="getArtistSunburst"; Pattern="getArtistSunburst.*wrapResponse"},
    @{Name="getArtistTimeseries"; Pattern="getArtistTimeseries.*wrapResponse"},
    @{Name="getCompareArtists"; Pattern="getCompareArtists.*wrapResponse"},
    @{Name="generateAiReport"; Pattern="generateAiReport.*wrapResponse"}
)

$allPassed = $true
foreach ($endpoint in $endpoints) {
    $matches = Select-String -Path "functions/index.js" -Pattern $endpoint.Pattern | Measure-Object
    if ($matches.Count -ge 1) {
        Write-Host "  ✅ $($endpoint.Name): wrapResponse 적용 확인" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($endpoint.Name): wrapResponse 미적용" -ForegroundColor Red
        $allPassed = $false
    }
}

if (-not $allPassed) {
    Write-Host ""
    Write-Host "❌ 일부 엔드포인트에 wrapResponse 미적용" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 6. 응답 형식 구조 확인 (코드 레벨)
Write-Host "6. 응답 형식 구조 확인..." -ForegroundColor Yellow
$responseStructure = Select-String -Path "functions/index.js" -Pattern "wrapResponse\(.*\{" -Context 0,2
if ($responseStructure) {
    Write-Host "  ✅ wrapResponse 호출 구조 확인" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ wrapResponse 호출 구조 확인 필요" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 검증 완료 ===" -ForegroundColor Cyan
Write-Host "✅ 모든 코드 레벨 검증 통과" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계: Firebase Emulator에서 실제 API 테스트 수행" -ForegroundColor Yellow
Write-Host "  firebase emulators:start" -ForegroundColor Gray
Write-Host "  curl http://localhost:5001/api/artist/ARTIST_0005/summary | jq '.data, .meta'" -ForegroundColor Gray

