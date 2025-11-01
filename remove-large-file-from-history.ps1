# Git 커밋 히스토리에서 큰 파일 완전 제거 스크립트

Write-Host "=== 커밋 히스토리에서 큰 파일 완전 제거 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 현재 브랜치 확인
Write-Host "[1/6] 현재 브랜치 확인..." -ForegroundColor Yellow
git branch --show-current
Write-Host ""

# 2. 큰 파일이 포함된 커밋 확인
Write-Host "[2/6] 큰 파일이 포함된 커밋 확인..." -ForegroundColor Yellow
git log --all --pretty=format:"%h %s" --name-only | Select-String "node_modules/.cache" | Select-Object -First 5
Write-Host ""

# 3. filter-branch로 커밋 히스토리에서 큰 파일 제거
Write-Host "[3/6] 커밋 히스토리에서 큰 파일 제거 중..." -ForegroundColor Yellow
Write-Host "  이 작업은 시간이 걸릴 수 있습니다..." -ForegroundColor Yellow
git filter-branch --force --index-filter "git rm -r --cached --ignore-unmatch node_modules/.cache" --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 큰 파일 제거 완료" -ForegroundColor Green
} else {
    Write-Host "  ! filter-branch 실패" -ForegroundColor Red
    Write-Host "  대안 방법을 시도합니다..." -ForegroundColor Yellow
    
    # 대안: BFG Repo-Cleaner 사용 (설치 필요)
    Write-Host "  BFG Repo-Cleaner를 사용하거나, 새 브랜치로 재시작하세요." -ForegroundColor Yellow
    exit 1
}

# 4. .gitignore 확인
Write-Host "[4/6] .gitignore 확인 중..." -ForegroundColor Yellow
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

# 5. 변경사항 커밋
Write-Host "[5/6] 변경사항 커밋 중..." -ForegroundColor Yellow
git add .gitignore
git commit -m "chore: node_modules 캐시를 .gitignore에 추가" 2>&1 | Out-Null
Write-Host "  ✓ 커밋 완료" -ForegroundColor Green

# 6. 강제 푸시
Write-Host "[6/6] 강제 푸시 중..." -ForegroundColor Yellow
Write-Host "  원격 저장소의 히스토리가 변경됩니다." -ForegroundColor Yellow
$confirm = Read-Host "  계속하시겠습니까? (Y/N)"
if ($confirm -eq "Y" -or $confirm -eq "y") {
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

