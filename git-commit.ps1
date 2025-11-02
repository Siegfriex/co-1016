# Git 변경사항 스테이징 및 커밋 스크립트
# 실행: PowerShell에서 .\git-commit.ps1 실행

$ErrorActionPreference = "Stop"

Write-Host "=== Git 변경사항 스테이징 및 커밋 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 현재 상태 확인
Write-Host "1. Git 상태 확인 중..." -ForegroundColor Yellow
git status
Write-Host ""

# 2. 변경된 파일 확인
Write-Host "2. 변경된 파일:" -ForegroundColor Yellow
git status --short
Write-Host ""

# 3. 모든 변경사항 스테이징
Write-Host "3. 모든 변경사항 스테이징 중..." -ForegroundColor Yellow
git add .
Write-Host "스테이징 완료" -ForegroundColor Green
Write-Host ""

# 4. 스테이징 확인
Write-Host "4. 스테이징된 변경사항:" -ForegroundColor Yellow
git status --short
Write-Host ""

# 5. 커밋 메시지
$commitMessage = @"
docs: 사이트맵 및 와이어프레임 기능명세 추가

- 사이트맵 구조 문서화 (Phase 1-4 전체 네비게이션)
- 각 페이지별 와이어프레임 레이아웃 정의
- 기능명세 테이블 (FEAT-*-*** 형식)
- API 엔드포인트 매핑
- 반응형 레이아웃 사양
- 추적성 매트릭스 (FRD FR ID 연계)
- VID v1.0, IA v1.0 기반 작성
"@

Write-Host "5. 커밋 메시지:" -ForegroundColor Yellow
Write-Host $commitMessage
Write-Host ""

# 6. 커밋
Write-Host "6. 커밋 중..." -ForegroundColor Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== 커밋 완료! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "다음 명령으로 푸시할 수 있습니다:" -ForegroundColor Yellow
    Write-Host "  git push origin 1102" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "=== 커밋 중 오류 발생 ===" -ForegroundColor Red
    Write-Host "변경사항이 없거나 오류가 발생했습니다." -ForegroundColor Red
}

