# Git 큰 파일 제거 및 푸시 해결 스크립트

Write-Host "=== Git 큰 파일 제거 스크립트 ===" -ForegroundColor Cyan
Write-Host ""

# 1. index.lock 파일 제거
Write-Host "1. index.lock 파일 제거 중..." -ForegroundColor Yellow
if (Test-Path ".git/index.lock") {
    Remove-Item ".git/index.lock" -Force
    Write-Host "index.lock 파일 제거 완료" -ForegroundColor Green
} else {
    Write-Host "index.lock 파일이 없습니다." -ForegroundColor Yellow
}
Write-Host ""

# 2. 큰 파일이 포함된 커밋 확인
Write-Host "2. 큰 파일 확인 중..." -ForegroundColor Yellow
git ls-files | Select-String "node_modules/.cache" | ForEach-Object {
    Write-Host "  발견: $_" -ForegroundColor Red
}
Write-Host ""

# 3. 큰 파일을 Git에서 제거 (실제 파일은 유지)
Write-Host "3. 큰 파일을 Git 추적에서 제거 중..." -ForegroundColor Yellow
git rm -r --cached node_modules/.cache 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "큰 파일 제거 완료" -ForegroundColor Green
} else {
    Write-Host "큰 파일이 이미 제거되었거나 없습니다." -ForegroundColor Yellow
}
Write-Host ""

# 4. .gitignore 확인 및 추가
Write-Host "4. .gitignore 확인 중..." -ForegroundColor Yellow
$gitignoreContent = ""
if (Test-Path .gitignore) {
    $gitignoreContent = Get-Content .gitignore -Raw
}

if ($gitignoreContent -notmatch "node_modules/") {
    Add-Content .gitignore "`n# Node modules`nnode_modules/"
    Write-Host ".gitignore에 node_modules 추가 완료" -ForegroundColor Green
} else {
    Write-Host ".gitignore에 이미 node_modules가 포함되어 있습니다." -ForegroundColor Yellow
}
Write-Host ""

# 5. 변경사항 스테이징
Write-Host "5. 변경사항 스테이징 중..." -ForegroundColor Yellow
git add .gitignore
if (Test-Path "node_modules/.cache") {
    git rm -r --cached node_modules/.cache 2>&1 | Out-Null
}
Write-Host "스테이징 완료" -ForegroundColor Green
Write-Host ""

# 6. 이전 커밋 확인
Write-Host "6. 최근 커밋 확인:" -ForegroundColor Yellow
git log --oneline -3
Write-Host ""

# 7. 커밋 히스토리 재작성 방법 제시
Write-Host "=== 다음 단계 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "방법 1: 커밋 히스토리에서 큰 파일 완전 제거 (권장)" -ForegroundColor Yellow
Write-Host "  git filter-branch --force --index-filter `"git rm -r --cached --ignore-unmatch node_modules/.cache`" --prune-empty --tag-name-filter cat -- --all" -ForegroundColor White
Write-Host ""
Write-Host "방법 2: 이전 커밋으로 돌아가서 새로 커밋 (간단)" -ForegroundColor Yellow
Write-Host "  git reset --soft HEAD~1" -ForegroundColor White
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m `"docs: TSD v1.1 업데이트 및 문서 스위트 통합`"" -ForegroundColor White
Write-Host ""
Write-Host "방법 3: 새 브랜치에서 시작 (가장 안전)" -ForegroundColor Yellow
Write-Host "  git checkout -b 1102-clean" -ForegroundColor White
Write-Host "  git reset --hard origin/1016" -ForegroundColor White
Write-Host "  git checkout 1102 -- ." -ForegroundColor White
Write-Host "  git rm -r --cached node_modules/.cache" -ForegroundColor White
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m `"docs: TSD v1.1 업데이트`"" -ForegroundColor White
Write-Host "  git push -u origin 1102-clean" -ForegroundColor White
Write-Host ""

$choice = Read-Host "원하는 방법을 선택하세요 (1/2/3 또는 Enter로 종료)"
if ($choice -eq "1") {
    Write-Host "방법 1 실행 중..." -ForegroundColor Yellow
    git filter-branch --force --index-filter "git rm -r --cached --ignore-unmatch node_modules/.cache" --prune-empty --tag-name-filter cat -- --all
    Write-Host "완료. 이제 강제 푸시하세요: git push -u origin 1102 --force" -ForegroundColor Green
} elseif ($choice -eq "2") {
    Write-Host "방법 2 실행 중..." -ForegroundColor Yellow
    git reset --soft HEAD~1
    Write-Host "이제 다음 명령을 실행하세요:" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m `"docs: TSD v1.1 업데이트 및 문서 스위트 통합`"" -ForegroundColor White
    Write-Host "  git push -u origin 1102 --force" -ForegroundColor White
} elseif ($choice -eq "3") {
    Write-Host "방법 3 실행 중..." -ForegroundColor Yellow
    git checkout -b 1102-clean
    git reset --hard origin/1016
    git checkout 1102 -- .
    git rm -r --cached node_modules/.cache 2>&1 | Out-Null
    git add .
    git commit -m "docs: TSD v1.1 업데이트 및 문서 스위트 통합"
    git push -u origin 1102-clean
    Write-Host "완료! 브랜치 1102-clean가 생성되었습니다." -ForegroundColor Green
}

