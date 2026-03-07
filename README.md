# MBTI Test Monorepo

`init.md` 기반 MVP를 Docker 중심으로 실행/배포할 수 있게 구성한 모노레포입니다.

## 구성

- `apps/web`: Next.js(App Router) 사용자/관리자 웹
- `apps/api`: NestJS API (공개 API + 관리자 인증/CRUD)
- `packages/shared`: 공통 타입/검증/MBTI 계산 로직
- `docker/`: 웹/API Dockerfile
- `docker-compose.local.yml`: 로컬 통합 실행
- `docker-compose.prod.yml`: 운영 배포용 통합 실행

## Local Docker 실행

```bash
pnpm docker:local:up
```

접속:

- Web: `http://localhost:3000`
- API: `http://localhost:4001/api`
- Postgres: `localhost:5432` (`mbti`/`mbti`)

중지:

```bash
pnpm docker:local:down
```

로그:

```bash
pnpm docker:local:logs
```

로컬 compose는 API 컨테이너 시작 시 아래를 자동 실행합니다.

1. `prisma migrate deploy`
2. `RUN_SEED=true` 이므로 seed 실행
3. API 서버 시작

기본 관리자 계정(seed):

- email: `admin@example.com`
- password: `admin1234!`
- 로그인 후 `Authorization: Bearer <token>`으로 관리자 API 호출

## Production Docker 배포

1. `.env.prod.example` 복사

```bash
cp .env.prod.example .env.prod
```

2. `.env.prod` 값 수정

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_BASE_URL`
- `INTERNAL_API_BASE_URL` (기본값 `http://api:4000/api`)
- `API_BIND_HOST`, `WEB_BIND_HOST` (기본 `127.0.0.1`)

3. 배포 실행

```bash
pnpm docker:prod:up
```

또는 서버에서 `pnpm` 없이 Docker만으로 실행:

```bash
./scripts/deploy/prod-up.sh
```

`local`과 `prod`는 내부적으로 서로 다른 Compose project(`mbti-local`, `mbti-prod`)를 사용해 컨테이너 충돌을 줄입니다.

중지:

```bash
pnpm docker:prod:down
```

또는:

```bash
./scripts/deploy/prod-down.sh
```

로그:

```bash
pnpm docker:prod:logs
```

또는:

```bash
./scripts/deploy/prod-logs.sh
```

주의:

- `NEXT_PUBLIC_API_BASE_URL`은 웹 클라이언트 번들에 주입되므로 빌드 시점 값입니다.
- `INTERNAL_API_BASE_URL`은 Next.js 서버 컴포넌트/메타데이터 생성 시 사용하는 내부 API 주소입니다.
- 운영에서 API 도메인이 바뀌면 웹 이미지를 다시 빌드/배포해야 합니다.
- 운영에서는 `RUN_SEED=false` 유지 권장.
- 리버스 프록시를 붙일 경우 `NEXT_PUBLIC_API_BASE_URL=/api`를 권장합니다.
- prod compose는 기본적으로 `127.0.0.1`에만 포트를 바인딩합니다.

## 관리자 API 상태

- `POST /api/admin/auth/login`: Prisma 관리자 계정 기반 JWT 발급
- `GET /api/admin/auth/me`: JWT 기반 현재 관리자 조회
- 아래 엔드포인트는 JWT 인증 필수
  - `GET /api/admin/tests`, `GET /api/admin/tests/:id`, `PATCH /api/admin/tests/:id`
  - `PATCH /api/admin/tests/:id/status`
  - `PUT /api/admin/tests/:id/settings`
  - `GET/PUT /api/admin/tests/:id/answer-scale`
  - `GET/POST /api/admin/tests/:id/questions`, `PUT/DELETE /api/admin/questions/:questionId`
  - `PATCH /api/admin/tests/:id/questions/order`
  - `GET/POST /api/admin/tests/:id/results`, `PUT/DELETE /api/admin/results/:resultId`
  - `GET /api/admin/tests/:id/preview`
- `PATCH /api/admin/tests/:id/status`에서 `published` 전환 시 사전 검증 실행
  - 기본정보
  - 활성 질문 수/축별 질문
  - 16개 MBTI 결과
  - 선택지 1~5 문구

## Non-Docker 개발(옵션)

```bash
pnpm install
pnpm dev:api
pnpm dev:web
```

## 품질 검증

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
