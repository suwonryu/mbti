import Link from 'next/link';

export default function ErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
      <section className="mbti-card w-full space-y-4 p-8 text-center">
        <h1 className="text-2xl font-bold">오류가 발생했습니다.</h1>
        <p className="text-slate-600">잠시 후 다시 시도해 주세요.</p>
        <Link className="mbti-button inline-flex" href="/">
          홈으로 이동
        </Link>
      </section>
    </main>
  );
}
