# Git 큰 파일 제거 및 푸시 자동화 스크립트
# 실행: .\fix-and-push.ps1

Write-Host "=== Git 큰 파일 제거 및 푸시 ===" -ForegroundColor Cyan
Write-Host ""

# 1. index.lock 제거
Write-Host "[1/7] index.lock 파일 제거 중..." -ForegroundColor Yellow
if (Test-Path ".git/index.lock") {
    Remove-Item ".git/index.lock" -Force
    Write-Host "  ✓ index.lock 제거 완료" -ForegroundColor Green
} else {
    Write-Host "  ✓ index.lock 파일 없음" -ForegroundColor Green
}

# 2. 현재 상태 확인
Write-Host "[2/7] 현재 상태 확인 중..." -ForegroundColor Yellow
git status --short | Select-Object -First 10
Write-Host ""

# 3. 큰 파일을 Git 추적에서 제거
Write-Host "[3/7] 큰 파일 제거 중..." -ForegroundColor Yellow
git rm -r --cached node_modules/.cache 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 큰 파일 제거 완료" -ForegroundColor Green
} else {
    Write-Host "  ! 큰 파일이 이미 제거되었거나 없습니다" -ForegroundColor Yellow
}

# 4. .gitignore 확인 및 업데이트
Write-Host "[4/7] .gitignore 확인 중..." -ForegroundColor Yellow
if (-not (Test-Path .gitignore)) {
    New-Item .gitignore -ItemType File | Out-Null
}
$gitignoreContent = Get-Content .gitignore -Raw -ErrorAction SilentlyContinue
if ($gitignoreContent -notmatch "node_modules/") {
    Add-Content .gitignore "`n# Node modules`nnode_modules/" -NoNewline
    Write-Host "  ✓ .gitignore 업데이트 완료" -ForegroundColor Green
} else {
    Write-Host "  ✓ .gitignore 확인 완료" -ForegroundColor Green
}

# 5. 이전 커밋으로 리셋 (변경사항 유지)
Write-Host "[5/7] 커밋 히스토리 수정 중..." -ForegroundColor Yellow
git reset --soft HEAD~1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 이전 커밋으로 리셋 완료" -ForegroundColor Green
} else {
    Write-Host "  ! 리셋 실패 (이미 최신 상태일 수 있음)" -ForegroundColor Yellow
}

# 6. 변경사항 스테이징
Write-Host "[6/7] 변경사항 스테이징 중..." -ForegroundColor Yellow
git add .
Write-Host "  ✓ 스테이징 완료" -ForegroundColor Green

# 7. 커밋
Write-Host "[7/7] 커밋 중..." -ForegroundColor Yellow
$commitMessage = "docs: TSD v1.1 업데이트 및 문서 스위트 통합

- TSD v1.1: FRD/VXD/VID/IA 통합 검증 완료
- 배치 API 및 이벤트 API 추가
- 성능 제약 명시화 (p95 <300ms, 토큰 <50K)
- API 구현 섹션 추가 (JSON Schema 검증 코드 포함)
- VXD 테스트 케이스 통합
- 추적성 매트릭스 추가
- IA ER 다이어그램 통합
- VID 컴포넌트 설계 통합"

git commit -m $commitMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 커밋 완료" -ForegroundColor Green
} else {
    Write-Host "  ! 커밋 실패" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== 푸시 준비 완료 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "다음 명령을 실행하여 푸시하세요:" -ForegroundColor Yellow
Write-Host "  git push -u origin 1102 --force" -ForegroundColor White
Write-Host ""
$push = Read-Host "지금 푸시하시겠습니까? (Y/N)"
if ($push -eq "Y" -or $push -eq "y") {
    Write-Host ""
    Write-Host "푸시 중..." -ForegroundColor Yellow
    git push -u origin 1102 --force
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== 성공! ===" -ForegroundColor Green
        Write-Host "브랜치 1102가 성공적으로 푸시되었습니다." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "=== 푸시 실패 ===" -ForegroundColor Red
        Write-Host "오류를 확인하고 다시 시도해주세요." -ForegroundColor Red
    }
} else {
    Write-Host "푸시가 취소되었습니다." -ForegroundColor Yellow
}

