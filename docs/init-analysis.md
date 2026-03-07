# init.md 분석 요약

## 1. 요구사항 핵심

- 모노레포 구조: `apps/web`, `apps/api`, `packages/shared`
- 사용자 흐름: 랜딩 -> 소개 -> 테스트 -> 결과 공유
- 관리자 흐름: 로그인 -> 테스트/질문/결과/설정 관리
- MBTI 계산 규칙 고정
  - 응답점수: `1=+2, 2=+1, 3=0, 4=-1, 5=-2`
  - 축 판정: `>0 왼쪽 trait`, `<0 오른쪽 trait`, `=0 tie-break`
- 공유 정책: 제출 시점 스냅샷 저장, shareToken 기반 조회

## 2. 초기 구조에서 반영한 항목

- 웹 라우트 골격 + 모바일 우선 UI
- 테스트 페이지 핵심 UX(진행률/비활성 다음 버튼/임시저장)
- 결과 공유 버튼(Web Share API fallback)
- API 엔드포인트 골격(공개/관리자)
- Prisma 스키마 초안(핵심 모델 전부 포함)
- 공통 계산 로직 + 단위 테스트

## 3. 현재 상태

- 관리자 인증(JWT) 구현 완료
- 공개 API에서 `dimension`, `positiveTrait` 비노출 적용 완료
- published 전 검증 조건 로직 구현 완료
- 16개 MBTI 결과 seed + 관리자 CRUD UI 구현 완료
- 결과 페이지 OG 메타 서버사이드 생성 완료
- rate limit / audit log 저장은 운영 안정화 단계에서 추가 권장

## 4. 권장 구현 순서

1. Prisma migration 생성 및 repository 계층 구현
2. submit API 완성(검증 + 스코어 계산 + 스냅샷 저장)
3. 결과 조회 API 완성(shareToken)
4. 웹에서 실제 API 연동(React Query)
5. 관리자 CRUD + 상태 전환 + 프리뷰
