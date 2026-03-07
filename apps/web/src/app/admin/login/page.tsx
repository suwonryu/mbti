'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { getAdminMe, loginAdmin } from '@/lib/api/admin';
import { ApiClientError } from '@/lib/api/client';
import {
  clearAdminAccessToken,
  getAdminAccessToken,
  setAdminAccessToken,
} from '@/lib/auth/admin-auth';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

function resolveNextPath(next: string | null) {
  if (!next || !next.startsWith('/admin')) {
    return '/admin';
  }

  return next;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/admin');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin1234!');
  const [existingToken, setExistingToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setNextPath(resolveNextPath(new URLSearchParams(window.location.search).get('next')));
    setExistingToken(getAdminAccessToken());
  }, []);

  const meQuery = useQuery({
    queryKey: ['admin-login-me', existingToken],
    queryFn: () => getAdminMe(existingToken as string),
    enabled: typeof existingToken === 'string' && existingToken.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.isSuccess) {
      router.replace(nextPath);
      return;
    }

    if (meQuery.isError) {
      clearAdminAccessToken();
      setExistingToken(null);
    }
  }, [meQuery.isSuccess, meQuery.isError, nextPath, router]);

  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      setAdminAccessToken(data.accessToken);
      router.replace(nextPath);
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-12">
      <section className="mbti-card w-full space-y-5 p-8">
        <h1 className="text-4xl font-black">관리자 로그인</h1>
        <p className="text-slate-600">인증 성공 시 관리자 대시보드로 이동합니다.</p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="admin-email">
              이메일
            </label>
            <input
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 outline-none ring-accent/30 focus:ring"
              id="admin-email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="admin-password">
              비밀번호
            </label>
            <input
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 outline-none ring-accent/30 focus:ring"
              id="admin-password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </div>

          {loginMutation.isError ? (
            <p className="text-sm text-red-600">{getErrorMessage(loginMutation.error)}</p>
          ) : null}

          <button className="mbti-button w-full justify-center" disabled={loginMutation.isPending || meQuery.isLoading} type="submit">
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </section>
    </main>
  );
}
