# Git 상태 확인 및 복구 가이드

## 현재 상태 확인 명령어

다음 명령어들을 PowerShell에서 순서대로 실행하세요:

```powershell
# 1. Git 저장소인지 확인
git status

# 2. 현재 브랜치 확인
git branch

# 3. 원격 저장소 확인
git remote -v

# 4. 스테이징된 파일 확인
git diff --cached --name-only

# 5. 커밋되지 않은 변경사항 확인
git diff --name-only

# 6. 최근 커밋 확인
git log --oneline -5
```

## 일반적인 오류 및 해결 방법

### 오류 1: "not a git repository"
**원인**: Git 저장소가 초기화되지 않음
**해결**:
```powershell
git init
git remote add origin git@github.com:Siegfriex/co-1016.git
git add .
git commit -m "Initial commit"
git checkout -b 1102
git push -u origin 1102
```

### 오류 2: "branch already exists"
**원인**: 브랜치 1102가 이미 존재
**해결**:
```powershell
# 기존 브랜치로 전환
git checkout 1102

# 또는 다른 이름으로 브랜치 생성
git checkout -b 1102-backup
```

### 오류 3: "nothing to commit"
**원인**: 변경사항이 이미 커밋되었거나 스테이징되지 않음
**해결**:
```powershell
# 변경사항 확인
git status --short

# 변경사항이 있으면 스테이징
git add .

# 다시 커밋 시도
git commit -m "docs: TSD v1.1 업데이트"
```

### 오류 4: SSH 키 인증 오류
**원인**: GitHub SSH 키가 설정되지 않음
**해결**:
```powershell
# SSH 키 확인
ssh -T git@github.com

# 또는 HTTPS로 변경
git remote set-url origin https://github.com/Siegfriex/co-1016.git
```

### 오류 5: "permission denied" 또는 "access denied"
**원인**: GitHub 접근 권한 문제
**해결**:
```powershell
# HTTPS로 변경하고 Personal Access Token 사용
git remote set-url origin https://github.com/Siegfriex/co-1016.git
```

## 안전한 복구 절차

만약 문제가 발생했다면 다음 순서로 복구하세요:

```powershell
# 1. 현재 상태 확인
git status

# 2. 변경사항이 있다면 안전하게 저장
git stash

# 3. 브랜치 확인
git branch -a

# 4. 필요시 브랜치 생성/전환
git checkout -b 1102

# 5. stash한 변경사항 복원
git stash pop

# 6. 변경사항 스테이징
git add .

# 7. 커밋
git commit -m "docs: TSD v1.1 업데이트"

# 8. 푸시
git push -u origin 1102
```

## 파일이 삭제되었는지 확인

다음 파일들이 존재하는지 확인하세요:
- TSD.md
- docs/requirements/FRD.md
- docs/testing/VXD.md
- docs/design/VID.md
- docs/architecture/IA.md
- docs/api/API_SPECIFICATION.md

파일이 없다면:
```powershell
# Git에서 복원
git checkout HEAD -- <파일경로>

# 또는 모든 변경사항 복원
git checkout .
```

