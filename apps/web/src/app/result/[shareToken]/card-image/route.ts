import { fetchSharedResultSnapshot } from '@/lib/shared-result';

type RouteContext = {
  params: Promise<{
    shareToken: string;
  }>;
};

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function splitIntoLines(value: string, maxLength: number, maxLines: number) {
  const normalized = value.trim().replace(/\s+/g, ' ');

  if (!normalized) {
    return [] as string[];
  }

  const lines: string[] = [];
  let remaining = normalized;

  while (remaining && lines.length < maxLines) {
    if (remaining.length <= maxLength) {
      lines.push(remaining);
      break;
    }

    const slice = remaining.slice(0, maxLength + 1);
    const breakIndex = slice.lastIndexOf(' ');

    if (breakIndex > Math.floor(maxLength / 2)) {
      lines.push(slice.slice(0, breakIndex));
      remaining = remaining.slice(breakIndex + 1).trim();
      continue;
    }

    lines.push(remaining.slice(0, maxLength));
    remaining = remaining.slice(maxLength).trim();
  }

  if (remaining && lines.length === maxLines) {
    lines[maxLines - 1] = truncate(lines[maxLines - 1], maxLength - 1);
  }

  return lines.map((line) => escapeXml(line));
}

export async function GET(_: Request, { params }: RouteContext) {
  const { shareToken } = await params;
  const snapshot = await fetchSharedResultSnapshot(shareToken);

  if (!snapshot) {
    return new Response('Not found', { status: 404 });
  }

  const title = escapeXml(truncate(snapshot.title || `${snapshot.mbtiCode} 유형`, 40));
  const summaryLines = splitIntoLines(snapshot.summary || snapshot.shareDescription || '', 36, 2);
  const mbtiCode = escapeXml(snapshot.mbtiCode);
  const summaryMarkup = summaryLines
    .map((line, index) => `<tspan x="160" dy="${index === 0 ? 0 : 42}">${line}</tspan>`)
    .join('');

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFF7ED" />
          <stop offset="1" stop-color="#FFEDD5" />
        </linearGradient>
        <linearGradient id="accent" x1="160" y1="120" x2="1040" y2="510" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF6B3D" />
          <stop offset="1" stop-color="#FDBA74" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)" />
      <rect x="74" y="74" width="1052" height="482" rx="40" fill="white" fill-opacity="0.96" />
      <rect x="110" y="110" width="12" height="410" rx="6" fill="url(#accent)" />
      <text x="160" y="150" fill="#F97316" font-family="system-ui, sans-serif" font-size="28" font-weight="700" letter-spacing="6">YOUR RESULT</text>
      <text x="160" y="270" fill="#1E293B" font-family="system-ui, sans-serif" font-size="98" font-weight="800">${mbtiCode}</text>
      <text x="160" y="350" fill="#1E293B" font-family="system-ui, sans-serif" font-size="52" font-weight="700">${title}</text>
      <text x="160" y="420" fill="#475569" font-family="system-ui, sans-serif" font-size="30" font-weight="500">${summaryMarkup}</text>
      <text x="160" y="520" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="24" font-weight="600">MBTI 심리테스트 공유 결과</text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300',
    },
  });
}
