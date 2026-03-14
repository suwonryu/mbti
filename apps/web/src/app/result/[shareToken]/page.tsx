import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getShareCardImagePath, normalizeResultImageUrl } from '@/lib/result-image';
import { OG_IMAGE_SIZE } from '@/lib/og-images';
import { fetchSharedResultSnapshot } from '@/lib/shared-result';
import { ResultClient } from './result-client';

type ResultPageProps = {
  params: Promise<{
    shareToken: string;
  }>;
};

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

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { shareToken } = await params;
  const snapshot = await fetchSharedResultSnapshot(shareToken);

  if (!snapshot) {
    return {
      title: '결과를 찾을 수 없습니다',
      description: '유효하지 않은 결과 링크입니다.',
    };
  }

  const title = snapshot.shareTitle || `${snapshot.mbtiCode} 결과`;
  const description = snapshot.shareDescription || snapshot.summary;
  const origin = await getSiteOrigin();
  const imageUrl = toAbsoluteUrl(normalizeResultImageUrl(snapshot.imageUrl) ?? getShareCardImagePath(shareToken), origin);

  return {
    metadataBase: origin ? new URL(origin) : undefined,
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: imageUrl, width: OG_IMAGE_SIZE.width, height: OG_IMAGE_SIZE.height }],
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
