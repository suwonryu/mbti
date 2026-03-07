#!/bin/sh
set -eu

cd /app

retries="${DB_MIGRATION_RETRIES:-20}"
count=0

until pnpm --filter @mbti/api prisma:migrate:deploy; do
  count=$((count + 1))

  if [ "$count" -ge "$retries" ]; then
    echo "[api-entrypoint] prisma migrate deploy failed after $retries retries."
    exit 1
  fi

  echo "[api-entrypoint] DB not ready. retrying in 3s... ($count/$retries)"
  sleep 3
done

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[api-entrypoint] running seed..."
  pnpm --filter @mbti/api prisma:seed
fi

echo "[api-entrypoint] starting API..."
exec pnpm --filter @mbti/api start:prod
