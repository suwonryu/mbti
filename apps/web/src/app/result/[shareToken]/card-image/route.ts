import { ImageResponse } from 'next/og';
import { OG_IMAGE_SIZE, renderSharedResultCard } from '@/lib/og-images';
import { fetchSharedResultSnapshot } from '@/lib/shared-result';

type RouteContext = {
  params: Promise<{
    shareToken: string;
  }>;
};

export const runtime = 'edge';

export async function GET(_: Request, { params }: RouteContext) {
  const { shareToken } = await params;
  const snapshot = await fetchSharedResultSnapshot(shareToken);

  if (!snapshot) {
    return new Response('Not found', { status: 404 });
  }

  return new ImageResponse(renderSharedResultCard(snapshot), {
    ...OG_IMAGE_SIZE,
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300',
    },
  });
}
