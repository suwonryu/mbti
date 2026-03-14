'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ShareButton } from '@/components/share-button';
import { ApiClientError } from '@/lib/api/client';
import { getSharedResult } from '@/lib/api/public';
import { getCharacterResultImagePath, normalizeResultImageUrl } from '@/lib/result-image';

type ResultClientProps = {
  shareToken: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return '유효하지 않은 결과 링크입니다.';
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

export function ResultClient({ shareToken }: ResultClientProps) {
  const resultQuery = useQuery({
    queryKey: ['shared-result', shareToken],
    queryFn: () => getSharedResult(shareToken),
    enabled: Boolean(shareToken),
  });
  const snapshot = resultQuery.data?.snapshot;
  const fallbackImageUrl = snapshot ? getCharacterResultImagePath(snapshot.mbtiCode) : '';
  const preferredImageUrl = normalizeResultImageUrl(snapshot?.imageUrl) ?? fallbackImageUrl;
  const [imageSrc, setImageSrc] = useState(fallbackImageUrl);

  useEffect(() => {
    setImageSrc(preferredImageUrl);
  }, [preferredImageUrl]);

  if (resultQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="mbti-card w-full p-8 text-center">
          <p className="text-slate-600">결과를 불러오는 중입니다...</p>
        </section>
      </main>
    );
  }

  if (resultQuery.isError || !snapshot) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="mbti-card w-full space-y-4 p-8 text-center">
          <h1 className="text-2xl font-bold">유효하지 않은 결과 링크입니다.</h1>
          <p className="text-slate-600">{getErrorMessage(resultQuery.error)}</p>
          <Link className="mbti-button inline-flex" href="/">
            홈으로 이동
          </Link>
        </section>
      </main>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const strengths = toStringArray(snapshot.strengths);
  const cautions = toStringArray(snapshot.cautions);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
      <section className="mbti-card w-full space-y-6 p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Your Result</p>
        <h1 className="text-4xl font-black">{snapshot.mbtiCode}</h1>
        <h2 className="text-2xl font-bold">{snapshot.title}</h2>
        <p className="text-slate-700">{snapshot.summary}</p>

        <img
          alt={`${snapshot.mbtiCode} result`}
          className="w-full rounded-2xl border border-orange-100 object-cover"
          onError={() => {
            if (imageSrc !== fallbackImageUrl) {
              setImageSrc(fallbackImageUrl);
            }
          }}
          src={imageSrc}
        />

        <section className="space-y-2">
          <h3 className="text-lg font-bold">설명</h3>
          <p className="text-slate-700">{snapshot.description}</p>
        </section>

        {strengths.length > 0 ? (
          <section className="space-y-2">
            <h3 className="text-lg font-bold">강점</h3>
            <ul className="list-disc space-y-1 pl-6 text-slate-700">
              {strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {cautions.length > 0 ? (
          <section className="space-y-2">
            <h3 className="text-lg font-bold">주의점</h3>
            <ul className="list-disc space-y-1 pl-6 text-slate-700">
              {cautions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <ShareButton title={snapshot.shareTitle} text={snapshot.shareDescription} url={currentUrl} />

        <p className="rounded-xl bg-orange-50 p-4 text-sm text-slate-600">
          이 결과는 재미를 위한 간이 테스트이며 정식 MBTI 검사가 아닙니다.
        </p>
      </section>
    </main>
  );
}
