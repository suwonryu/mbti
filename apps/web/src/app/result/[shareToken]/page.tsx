import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { ResultClient } from './result-client';

type ResultPageProps = {
  params: Promise<{
    shareToken: string;
  }>;
};

type SharedResultPayload = {
  success: boolean;
  data?: {
    snapshot: {
      mbtiCode: string;
      title: string;
      summary: string;
      shareTitle: string;
      shareDescription: string;
      imageUrl: string | null;
    };
  };
};

function getApiBaseUrl() {
  return process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4001/api';
}

async function getSiteOrigin() {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? process.env.SITE_URL;

  if (envOrigin) {
    return envOrigin;
  }

  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get('x-forwarded-host');
  const host = forwardedHost ?? requestHeaders.get('host');

  if (!host) {
    return 'http://localhost:3000';
  }

  const forwardedProto = requestHeaders.get('x-forwarded-proto');
  const protocol = forwardedProto ?? (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return `${protocol}://${host}`;
}

function toAbsoluteUrl(url: string, origin: string) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return new URL(url, origin).toString();
}

async function fetchSharedResult(shareToken: string) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/public/results/${shareToken}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as SharedResultPayload;

    if (!payload.success || !payload.data) {
      return null;
    }

    return payload.data.snapshot;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { shareToken } = await params;
  const snapshot = await fetchSharedResult(shareToken);

  if (!snapshot) {
    return {
      title: '결과를 찾을 수 없습니다',
      description: '유효하지 않은 결과 링크입니다.',
    };
  }

  const title = snapshot.shareTitle || `${snapshot.mbtiCode} 결과`;
  const description = snapshot.shareDescription || snapshot.summary;
  const origin = await getSiteOrigin();
  const imageUrl = toAbsoluteUrl(snapshot.imageUrl?.trim() || `/api/mbti-character/${snapshot.mbtiCode}`, origin);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { shareToken } = await params;
  return <ResultClient shareToken={shareToken} />;
}
