'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminAuthGate } from '@/components/admin/admin-auth-gate';
import { clearAdminAccessToken } from '@/lib/auth/admin-auth';

export default function AdminDashboardPage() {
  const router = useRouter();

  const onLogout = () => {
    clearAdminAccessToken();
    router.replace('/admin/login');
  };

  return (
    <AdminAuthGate>
      {({ admin }) => (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
          <section className="mbti-card w-full space-y-5 p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-black">관리자 대시보드</h1>
              <button className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold" onClick={onLogout} type="button">
                로그아웃
              </button>
            </div>

            <p className="text-slate-700">
              로그인 계정: <span className="font-semibold">{admin.name}</span> ({admin.email})
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link className="mbti-button inline-flex" href="/admin/tests">
                테스트 관리로 이동
              </Link>
            </div>
          </section>
        </main>
      )}
    </AdminAuthGate>
  );
}
