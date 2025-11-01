# 방법 2: 새 브랜치로 깨끗하게 시작 (가장 안전)

Write-Host "=== 새 브랜치로 깨끗하게 시작 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 깨끗한 새 브랜치 생성
Write-Host "[1/7] 새 브랜치 생성 중..." -ForegroundColor Yellow
git checkout -b 1102-clean
Write-Host "  ✓ 브랜치 1102-clean 생성 완료" -ForegroundColor Green

# 2. 1016 브랜치를 기준으로 리셋
Write-Host "[2/7] 1016 브랜치를 기준으로 리셋 중..." -ForegroundColor Yellow
git reset --hard origin/1016
Write-Host "  ✓ 리셋 완료" -ForegroundColor Green

# 3. 1102 브랜치의 파일들 가져오기 (큰 파일 제외)
Write-Host "[3/7] 1102 브랜치의 파일들 가져오기 중..." -ForegroundColor Yellow
git checkout 1102 -- . 2>&1 | Out-Null
Write-Host "  ✓ 파일 가져오기 완료" -ForegroundColor Green

# 4. 큰 파일 제거
Write-Host "[4/7] 큰 파일 제거 중..." -ForegroundColor Yellow
git rm -r --cached node_modules/.cache 2>&1 | Out-Null
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Write-Host "  ✓ 큰 파일 제거 완료" -ForegroundColor Green

# 5. .gitignore 확인 및 업데이트
Write-Host "[5/7] .gitignore 확인 중..." -ForegroundColor Yellow
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

# 6. 모든 파일 스테이징 (node_modules/.cache 제외)
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

# 8. 푸시
Write-Host ""
Write-Host "=== 푸시 준비 완료 ===" -ForegroundColor Cyan
Write-Host "브랜치: 1102-clean" -ForegroundColor Yellow
Write-Host ""
$push = Read-Host "푸시하시겠습니까? (Y/N)"
if ($push -eq "Y" -or $push -eq "y") {
    Write-Host ""
    Write-Host "푸시 중..." -ForegroundColor Yellow
    git push -u origin 1102-clean
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== 성공! ===" -ForegroundColor Green
        Write-Host "브랜치 1102-clean가 성공적으로 푸시되었습니다." -ForegroundColor Green
        Write-Host ""
        Write-Host "다음 단계:" -ForegroundColor Yellow
        Write-Host "  - GitHub에서 1102-clean 브랜치 확인" -ForegroundColor White
        Write-Host "  - 확인 후 1102 브랜치를 삭제하고 1102-clean를 1102로 이름 변경 가능" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "=== 푸시 실패 ===" -ForegroundColor Red
        Write-Host "오류를 확인하고 다시 시도해주세요." -ForegroundColor Red
    }
} else {
    Write-Host "푸시가 취소되었습니다." -ForegroundColor Yellow
}

