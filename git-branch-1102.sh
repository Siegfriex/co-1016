#!/bin/bash
# Git 브랜치 1102 생성 및 푸시 스크립트 (Linux/Mac용)
# 실행: chmod +x git-branch-1102.sh && ./git-branch-1102.sh

echo "=== Git 브랜치 1102 생성 및 푸시 스크립트 ==="
echo ""

# 1. 현재 상태 확인
echo "1. 현재 Git 상태 확인 중..."
git status
echo ""

# 2. 변경사항 확인
echo "2. 변경된 파일 확인 중..."
git status --short
echo ""

# 확인 요청
read -p "모든 변경사항을 스테이징하시겠습니까? (Y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "작업이 취소되었습니다."
    exit 1
fi

# 3. 모든 변경사항 스테이징
echo "3. 모든 변경사항 스테이징 중..."
git add .
echo "스테이징 완료"
echo ""

# 4. 스테이징 확인
echo "4. 스테이징된 변경사항 확인:"
git status --short
echo ""

# 5. 브랜치 생성 및 전환
echo "5. 브랜치 1102 생성 및 전환 중..."
git checkout -b 1102 2>/dev/null || git checkout 1102
echo "브랜치 1102로 전환 완료"
echo ""

# 6. 커밋
echo "6. 커밋 중..."
git commit -m "docs: TSD v1.1 업데이트 및 문서 스위트 통합

- TSD v1.1: FRD/VXD/VID/IA 통합 검증 완료
- 배치 API 및 이벤트 API 추가
- 성능 제약 명시화 (p95 <300ms, 토큰 <50K)
- API 구현 섹션 추가 (JSON Schema 검증 코드 포함)
- VXD 테스트 케이스 통합
- 추적성 매트릭스 추가
- IA ER 다이어그램 통합
- VID 컴포넌트 설계 통합"
echo "커밋 완료"
echo ""

# 7. 원격 저장소 확인
echo "7. 원격 저장소 확인 중..."
git remote -v
echo ""

# 원격 저장소가 없으면 추가
if ! git remote | grep -q "^origin$"; then
    echo "원격 저장소를 추가합니다..."
    git remote add origin git@github.com:Siegfriex/co-1016.git
    echo "원격 저장소 추가 완료"
    echo ""
fi

# 8. 푸시
echo "8. 브랜치 푸시 중..."
echo "원격 저장소: git@github.com:Siegfriex/co-1016.git"
echo "브랜치: 1102"
echo ""

read -p "푸시하시겠습니까? (Y/N): " confirmPush
if [[ ! $confirmPush =~ ^[Yy]$ ]]; then
    echo "푸시가 취소되었습니다."
    echo "나중에 다음 명령으로 푸시할 수 있습니다:"
    echo "  git push -u origin 1102"
    exit 0
fi

git push -u origin 1102

if [ $? -eq 0 ]; then
    echo ""
    echo "=== 성공적으로 완료되었습니다! ==="
    echo "브랜치 1102가 생성되고 푸시되었습니다."
else
    echo ""
    echo "=== 푸시 중 오류 발생 ==="
    echo "오류를 확인하고 다시 시도해주세요."
fi

