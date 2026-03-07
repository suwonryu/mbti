'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAdminMe, type AdminUser } from '@/lib/api/admin';
import { clearAdminAccessToken, getAdminAccessToken } from '@/lib/auth/admin-auth';

type AdminAuthGateProps = {
  children: (context: { token: string; admin: AdminUser }) => React.ReactNode;
};

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setToken(getAdminAccessToken());
  }, []);

  const meQuery = useQuery({
    queryKey: ['admin-me', token],
    queryFn: () => getAdminMe(token as string),
    enabled: typeof token === 'string' && token.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (token === undefined) {
      return;
    }

    if (!token) {
      const next = pathname || '/admin';
      router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (meQuery.isError) {
      clearAdminAccessToken();
      const next = pathname || '/admin';
      router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
    }
  }, [token, pathname, router, meQuery.isError]);

  if (token === undefined || meQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="mbti-card w-full p-8 text-center">
          <p className="text-slate-600">관리자 인증 확인 중...</p>
        </section>
      </main>
    );
  }

  if (!token || !meQuery.data) {
    return null;
  }

  return <>{children({ token, admin: meQuery.data })}</>;
}
