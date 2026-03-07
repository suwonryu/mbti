import Link from 'next/link';

export default function IntroPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
      <section className="mbti-card w-full space-y-4 p-8">
        <h1 className="text-3xl font-extrabold">테스트 소개</h1>
        <p className="text-slate-700">문항별로 1~5점 척도로 답변하고, 모든 문항 완료 후 결과를 확인할 수 있습니다.</p>
        <ul className="list-disc space-y-1 pl-6 text-slate-600">
          <li>1문항 1화면 진행</li>
          <li>이전/다음 이동 시 답변 유지</li>
          <li>제출 후 결과 링크 공유 가능</li>
        </ul>
        <Link className="mbti-button inline-flex" href="/test/basic-mbti">
          테스트 시작하기
        </Link>
      </section>
    </main>
  );
}
