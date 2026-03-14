import { ImageResponse } from 'next/og';
import { OG_IMAGE_SIZE, isMbtiCode, renderCharacterImage } from '@/lib/og-images';

export const runtime = 'edge';

export async function GET(_request: Request, { params }: { params: Promise<{ mbtiCode: string }> }) {
  const { mbtiCode } = await params;
  const normalized = mbtiCode.toUpperCase();

  if (!isMbtiCode(normalized)) {
    return new Response('Not Found', { status: 404 });
  }

  return new ImageResponse(renderCharacterImage(normalized), {
    ...OG_IMAGE_SIZE,
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
