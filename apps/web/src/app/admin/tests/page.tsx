'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AdminAuthGate } from '@/components/admin/admin-auth-gate';
import { getAdminTests } from '@/lib/api/admin';
import { ApiClientError } from '@/lib/api/client';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return '테스트 목록을 불러오지 못했습니다.';
}

export default function AdminTestsPage() {
  return (
    <AdminAuthGate>
      {({ token }) => <AdminTestsContent token={token} />}
    </AdminAuthGate>
  );
}

function AdminTestsContent({ token }: { token: string }) {
  const testsQuery = useQuery({
    queryKey: ['admin-tests', token],
    queryFn: () => getAdminTests(token),
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
      <section className="mbti-card w-full space-y-5 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">테스트 목록</h1>
          <Link className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold" href="/admin">
            대시보드
          </Link>
        </div>

        {testsQuery.isLoading ? <p className="text-slate-600">목록을 불러오는 중...</p> : null}
        {testsQuery.isError ? <p className="text-sm text-red-600">{getErrorMessage(testsQuery.error)}</p> : null}

        {testsQuery.data ? (
          <div className="space-y-3">
            {testsQuery.data.items.map((item) => (
              <Link
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 transition hover:border-orange-300"
                href={`/admin/tests/${item.id}`}
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">slug: {item.slug}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.status}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
