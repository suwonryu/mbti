아래처럼 **중복을 줄이고 바로 전달 가능한 형태**로 정리하면 됩니다.

````md
# MBTI 심리테스트 웹 서비스 MVP 개발 지침

## 1. 목표
간단한 심리테스트를 통해 사용자의 MBTI 형태 결과를 제공하는 웹 서비스를 구현한다.

- 사용자는 로그인 없이 테스트 가능
- 질문은 1~5점 척도로 응답
- 결과 확인 후 공유 가능
- 관리자 페이지에서 질문, 선택지 문구, 결과 콘텐츠를 수정 가능
- 이 서비스는 정식 MBTI 검사가 아닌 엔터테인먼트형 테스트다

---

## 2. 기술 스택

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Query
- Zustand

### Backend
- NestJS
- TypeScript
- Prisma
- PostgreSQL
- JWT 기반 관리자 인증

### Common
- strict mode
- ESLint / Prettier
- DTO / validation 적용
- README 작성
- seed 데이터 포함

---

## 3. 저장소 구조
모노레포 기준으로 구성한다.

- `apps/web`
- `apps/api`
- `packages/shared`

`packages/shared`에는 공통 타입, enum, validation schema를 둔다.

---

## 4. 사용자 기능

### 페이지
- `/` : 랜딩 페이지
- `/intro` : 테스트 소개
- `/test/[slug]` : 테스트 진행
- `/result/[shareToken]` : 결과 / 공유 결과
- `/error` : 에러 페이지

### 요구사항
- 1문항 1화면 방식
- 진행률 바 표시
- 답변 전에는 다음 버튼 비활성화
- 이전 버튼 사용 시 기존 답변 유지
- 답변은 localStorage에 임시 저장
- 제출 후 localStorage 정리
- 결과 페이지에서 링크 복사 및 공유 가능
- Web Share API 우선 사용, 미지원 시 클립보드 복사
- 모바일 우선 반응형

---

## 5. 관리자 기능

### 페이지
- `/admin/login`
- `/admin`
- `/admin/tests`
- `/admin/tests/[id]`

### 기능
- 관리자 로그인
- 대시보드
- 테스트 기본 정보 관리
- 질문 CRUD
- 질문 순서 변경
- 질문 활성/비활성
- 공통 선택지 문구 수정
- 16개 MBTI 결과 CRUD
- 공개/비공개 설정
- tie-break rule 설정
- 프리뷰

---

## 6. 점수 규칙

### 사용자 응답값
- 1 = 매우 그렇다
- 2 = 그렇다
- 3 = 보통이다
- 4 = 아니다
- 5 = 매우 아니다

### 내부 점수 변환
- 1 -> +2
- 2 -> +1
- 3 -> 0
- 4 -> -1
- 5 -> -2

이 점수 규칙은 고정한다.

---

## 7. MBTI 계산 규칙

각 질문은 아래 속성을 가진다.

- `dimension`: `EI` | `SN` | `TF` | `JP`
- `positiveTrait`: `E` | `I` | `S` | `N` | `T` | `F` | `J` | `P`

예시:
- 질문: “사람들과 함께 있을 때 에너지를 얻는다”
- `dimension = EI`
- `positiveTrait = E`

이 경우:
- 1 선택 시 E +2
- 5 선택 시 I +2

### 축별 판정
- EI > 0 => E
- EI < 0 => I
- EI = 0 => tie-break rule 적용

SN / TF / JP도 동일하게 처리한다.

### 기본 tie-break rule
- EI 동점 => I
- SN 동점 => N
- TF 동점 => T
- JP 동점 => J

테스트 설정에서 수정 가능하게 구현한다.

---

## 8. 공유 정책
- 결과 제출 시점의 결과 스냅샷을 저장한다
- 공유 링크는 저장된 스냅샷을 보여준다
- 관리자가 이후 결과 문구를 수정해도 기존 공유 링크는 유지되어야 한다
- `shareToken`은 예측 불가능한 랜덤 문자열이어야 한다

---

## 9. 공개 정책

### 테스트 상태
- `draft`
- `published`

### draft
- 사용자 접근 불가
- 관리자 프리뷰만 가능

### published
- 사용자 접근 가능
- 테스트 제출 가능
- 공유 링크 생성 가능

### published 전 검증 조건
1. 테스트 기본 정보가 입력되어 있어야 함
2. 활성 질문이 1개 이상 있어야 함
3. EI / SN / TF / JP 각 축에 최소 1개 이상의 활성 질문이 있어야 함
4. 16개 MBTI 결과가 모두 등록되어 있어야 함
5. 선택지 1~5 문구가 모두 존재해야 함

---

## 10. 데이터 모델

### admins
- id
- email
- passwordHash
- name
- role
- createdAt
- updatedAt

### tests
- id
- title
- slug
- description
- introText
- thumbnailUrl
- status
- createdAt
- updatedAt

### testSettings
- id
- testId
- tieEI
- tieSN
- tieTF
- tieJP
- shareEnabled
- createdAt
- updatedAt

### answerScales
- id
- testId
- value (1~5)
- label
- scoreWeight
- sortOrder

주의:
- `value`와 `scoreWeight`는 고정
- 관리자는 `label`만 수정 가능

### questions
- id
- testId
- questionText
- dimension
- positiveTrait
- sortOrder
- isActive
- createdAt
- updatedAt

### mbtiResults
- id
- testId
- mbtiCode
- title
- summary
- description
- strengthsJson
- cautionsJson
- shareTitle
- shareDescription
- imageUrl
- updatedAt

### testAttempts
- id
- testId
- answersJson
- scoresJson
- resultMbti
- resultSnapshotJson
- shareToken
- isShared
- createdAt

### auditLogs
- id
- adminId
- action
- targetType
- targetId
- beforeJson
- afterJson
- createdAt

---

## 11. API 요구사항

### 공통 응답 형식
성공:
```json
{
  "success": true,
  "data": {}
}
````

실패:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "유효하지 않은 결과 링크입니다."
  }
}
```

### 공개 API

* `GET /api/public/tests/:slug`
* `GET /api/public/tests/:slug/questions`
* `POST /api/public/tests/:slug/submit`
* `GET /api/public/results/:shareToken`

주의:

* 공개 API에서는 `dimension`, `positiveTrait` 같은 채점용 메타데이터를 절대 노출하지 않는다

### 관리자 API

#### 인증

* `POST /api/admin/auth/login`
* `GET /api/admin/auth/me`

#### 테스트

* `GET /api/admin/tests`
* `GET /api/admin/tests/:id`
* `PATCH /api/admin/tests/:id/status`
* `PUT /api/admin/tests/:id/settings`

#### 질문

* `GET /api/admin/tests/:id/questions`
* `POST /api/admin/tests/:id/questions`
* `PUT /api/admin/questions/:questionId`
* `DELETE /api/admin/questions/:questionId`
* `PATCH /api/admin/tests/:id/questions/order`

#### 선택지

* `GET /api/admin/tests/:id/answer-scale`
* `PUT /api/admin/tests/:id/answer-scale`

#### 결과

* `GET /api/admin/tests/:id/results`
* `PUT /api/admin/results/:resultId`

#### 프리뷰

* `GET /api/admin/tests/:id/preview`

---

## 12. 유효성 검증

### 질문

* `questionText`: 5~200자 권장
* `dimension`: `EI`, `SN`, `TF`, `JP`만 허용
* `positiveTrait`: 해당 dimension에 맞는 값만 허용

### 제출

* 모든 활성 질문에 대한 답변이 있어야 함
* `answer`는 1~5만 허용
* `questionId` 중복 제출 금지

### 결과

* `mbtiCode`는 16개 MBTI 코드 중 하나만 허용

---

## 13. 보안 / 운영 규칙

* 관리자 비밀번호는 해시 저장
* 관리자 API는 인증 미들웨어 적용
* 공개 API에 rate limit 적용
* audit log 저장
* 결과 저장 시 결과 스냅샷도 함께 저장
* 프론트/백엔드 모두 입력값 검증

---

## 14. SEO / 메타

* 랜딩 페이지 메타 태그 설정
* 결과 페이지는 shareToken 기준으로 title / description / image 메타 생성
* OG 이미지가 노출되도록 처리
* 결과 페이지 메타는 서버 기준으로 생성 가능해야 함

---

## 15. 시드 데이터

반드시 포함할 것:

1. 기본 관리자 계정 1개
2. 테스트 1개
3. 공통 선택지 5개
4. 샘플 질문 12~16개
5. MBTI 결과 16개 전부
6. 기본 tie-break 설정

### 샘플 질문 조건

* EI / SN / TF / JP 각 축이 균형 있게 포함되어야 함
* 한국어 문장으로 자연스럽게 작성

---

## 16. 결과 페이지 문구

결과 페이지 하단에 아래 취지의 안내 문구를 반드시 넣는다.

* 이 결과는 재미를 위한 간이 테스트이며 정식 MBTI 검사가 아닙니다.

---

## 17. 코드 품질

* TypeScript strict mode
* ESLint / Prettier 설정
* 프론트는 컴포넌트 / API 레이어 분리
* 백엔드는 module / controller / service / repository 계층 분리
* Prisma schema / migration 포함
* 주요 계산 로직 단위 테스트 작성

### 최소 테스트 항목

* 점수 변환 테스트
* 축별 계산 테스트
* 동점 처리 테스트
* submit API 유효성 테스트

---

## 18. 작업 순서

1. 모노레포 초기 세팅
2. DB schema / migration / seed 작성
3. 백엔드 인증 및 공개 API 구현
4. MBTI 계산 로직 및 테스트 작성
5. 프론트 사용자 페이지 구현
6. 관리자 페이지 구현
7. 공유 메타 / OG 처리
8. README 정리

---

## 19. 완료 조건

아래가 모두 동작해야 한다.

1. 랜딩에서 테스트 시작 가능
2. 모든 질문 답변 후 결과 확인 가능
3. 결과 링크를 새 브라우저에서 열면 동일 결과 확인 가능
4. 관리자 로그인 가능
5. 질문 추가 / 수정 / 삭제 가능
6. 선택지 문구 수정 가능
7. 결과 문구 수정 가능
8. 테스트를 draft / published로 전환 가능
9. published 상태에서만 사용자 제출 가능
10. 기존 공유 링크는 결과 스냅샷 유지

---

## 20. 최종 산출물

* 실행 방법
* 환경변수 예시
* seed 실행 방법
* 관리자 로그인 계정 예시
* 주요 디렉토리 설명
* 구현 기능 체크리스트

```

원하면 이걸 바로 **코덱스 1차 프롬프트(백엔드 우선)** / **2차 프롬프트(프론트 우선)** 로 분리해서 더 실무형으로 정리해드리겠습니다.
```
