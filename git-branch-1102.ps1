# Git 브랜치 1102 생성 및 푸시 스크립트
# 실행: PowerShell에서 .\git-branch-1102.ps1 실행

Write-Host "=== Git 브랜치 1102 생성 및 푸시 스크립트 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 현재 상태 확인
Write-Host "1. 현재 Git 상태 확인 중..." -ForegroundColor Yellow
git status
Write-Host ""

# 2. 변경사항 확인
Write-Host "2. 변경된 파일 확인 중..." -ForegroundColor Yellow
git status --short
Write-Host ""

# 확인 요청
$confirm = Read-Host "모든 변경사항을 스테이징하시겠습니까? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "작업이 취소되었습니다." -ForegroundColor Red
    exit
}

# 3. 모든 변경사항 스테이징
Write-Host "3. 모든 변경사항 스테이징 중..." -ForegroundColor Yellow
git add .
Write-Host "스테이징 완료" -ForegroundColor Green
Write-Host ""

# 4. 스테이징 확인
Write-Host "4. 스테이징된 변경사항 확인:" -ForegroundColor Yellow
git status --short
Write-Host ""

# 5. 브랜치 생성 및 전환
Write-Host "5. 브랜치 1102 생성 및 전환 중..." -ForegroundColor Yellow
git checkout -b 1102
if ($LASTEXITCODE -ne 0) {
    Write-Host "브랜치가 이미 존재합니다. 기존 브랜치로 전환합니다." -ForegroundColor Yellow
    git checkout 1102
}
Write-Host "브랜치 1102로 전환 완료" -ForegroundColor Green
Write-Host ""

# 6. 커밋 메시지
$commitMessage = @"
docs: TSD v1.1 업데이트 및 문서 스위트 통합

- TSD v1.1: FRD/VXD/VID/IA 통합 검증 완료
- 배치 API 및 이벤트 API 추가
- 성능 제약 명시화 (p95 <300ms, 토큰 <50K)
- API 구현 섹션 추가 (JSON Schema 검증 코드 포함)
- VXD 테스트 케이스 통합
- 추적성 매트릭스 추가
- IA ER 다이어그램 통합
- VID 컴포넌트 설계 통합
"@

Write-Host "6. 커밋 메시지:" -ForegroundColor Yellow
Write-Host $commitMessage
Write-Host ""

$confirmCommit = Read-Host "위 메시지로 커밋하시겠습니까? (Y/N)"
if ($confirmCommit -ne "Y" -and $confirmCommit -ne "y") {
    Write-Host "커밋이 취소되었습니다." -ForegroundColor Red
    exit
}

# 7. 커밋
Write-Host "7. 커밋 중..." -ForegroundColor Yellow
git commit -m $commitMessage
Write-Host "커밋 완료" -ForegroundColor Green
Write-Host ""

# 8. 원격 저장소 확인
Write-Host "8. 원격 저장소 확인 중..." -ForegroundColor Yellow
git remote -v
Write-Host ""

# 원격 저장소가 없으면 추가
$remoteExists = git remote | Select-String -Pattern "^origin$"
if (-not $remoteExists) {
    Write-Host "원격 저장소를 추가합니다..." -ForegroundColor Yellow
    git remote add origin git@github.com:Siegfriex/co-1016.git
    Write-Host "원격 저장소 추가 완료" -ForegroundColor Green
    Write-Host ""
}

# 9. 푸시
Write-Host "9. 브랜치 푸시 중..." -ForegroundColor Yellow
Write-Host "원격 저장소: git@github.com:Siegfriex/co-1016.git" -ForegroundColor Cyan
Write-Host "브랜치: 1102" -ForegroundColor Cyan
Write-Host ""

$confirmPush = Read-Host "푸시하시겠습니까? (Y/N)"
if ($confirmPush -ne "Y" -and $confirmPush -ne "y") {
    Write-Host "푸시가 취소되었습니다." -ForegroundColor Yellow
    Write-Host "나중에 다음 명령으로 푸시할 수 있습니다:" -ForegroundColor Yellow
    Write-Host "  git push -u origin 1102" -ForegroundColor Cyan
    exit
}

git push -u origin 1102

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== 성공적으로 완료되었습니다! ===" -ForegroundColor Green
    Write-Host "브랜치 1102가 생성되고 푸시되었습니다." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=== 푸시 중 오류 발생 ===" -ForegroundColor Red
    Write-Host "오류를 확인하고 다시 시도해주세요." -ForegroundColor Red
}

