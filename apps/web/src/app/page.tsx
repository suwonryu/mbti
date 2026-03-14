import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-12">
      <section className="mbti-card w-full space-y-6 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Entertainment MBTI</p>
        <h1 className="text-4xl font-black leading-tight">5분 MBTI 심리테스트</h1>
        <p className="text-slate-600">짧은 질문에 답하고, 결과를 링크로 친구와 공유해 보세요.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link className="mbti-button" href="/intro">
            테스트 시작
          </Link>
        </div>
      </section>
    </main>
  );
}
