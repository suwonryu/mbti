FROM node:20-alpine AS builder

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages/shared packages/shared
COPY scripts/docker scripts/docker

RUN pnpm --filter @mbti/shared build
RUN pnpm --filter @mbti/api prisma:generate
RUN pnpm --filter @mbti/api build
RUN chmod +x /app/scripts/docker/api-entrypoint.sh

FROM node:20-alpine AS runtime

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable

COPY --from=builder /app /app

EXPOSE 4000

CMD ["sh", "scripts/docker/api-entrypoint.sh"]
