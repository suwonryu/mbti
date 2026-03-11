const MBTI_CODES = [
  'ISTJ',
  'ISFJ',
  'INFJ',
  'INTJ',
  'ISTP',
  'ISFP',
  'INFP',
  'INTP',
  'ESTP',
  'ESFP',
  'ENFP',
  'ENTP',
  'ESTJ',
  'ESFJ',
  'ENFJ',
  'ENTJ',
] as const;

type MbtiCode = (typeof MBTI_CODES)[number];

const MBTI_LABELS: Record<MbtiCode, string> = {
  ISTJ: 'Logistician',
  ISFJ: 'Defender',
  INFJ: 'Advocate',
  INTJ: 'Architect',
  ISTP: 'Virtuoso',
  ISFP: 'Adventurer',
  INFP: 'Mediator',
  INTP: 'Logician',
  ESTP: 'Entrepreneur',
  ESFP: 'Entertainer',
  ENFP: 'Campaigner',
  ENTP: 'Debater',
  ESTJ: 'Executive',
  ESFJ: 'Consul',
  ENFJ: 'Protagonist',
  ENTJ: 'Commander',
};

const PALETTE_BY_GROUP: Record<string, { bgStart: string; bgEnd: string; accent: string; card: string }> = {
  analyst: { bgStart: '#f4f8ff', bgEnd: '#d9e8ff', accent: '#3b82f6', card: '#ffffff' },
  diplomat: { bgStart: '#f4fff8', bgEnd: '#d7f7e5', accent: '#10b981', card: '#ffffff' },
  sentinel: { bgStart: '#fff8f1', bgEnd: '#ffe2c7', accent: '#f97316', card: '#ffffff' },
  explorer: { bgStart: '#fff7fa', bgEnd: '#ffdbe9', accent: '#ec4899', card: '#ffffff' },
};

function isMbtiCode(value: string): value is MbtiCode {
  return (MBTI_CODES as readonly string[]).includes(value);
}

function getGroup(code: MbtiCode) {
  if (code.includes('N') && code.includes('T')) {
    return 'analyst' as const;
  }

  if (code.includes('N') && code.includes('F')) {
    return 'diplomat' as const;
  }

  if (code.includes('S') && code.includes('J')) {
    return 'sentinel' as const;
  }

  return 'explorer' as const;
}

function getTraitBadgeIcon(letter: string) {
  switch (letter) {
    case 'E':
      return '<circle cx="0" cy="0" r="6" fill="#fff"/><circle cx="16" cy="0" r="4" fill="#fff"/><circle cx="-14" cy="2" r="3" fill="#fff"/>';
    case 'I':
      return '<rect x="-10" y="-8" width="20" height="16" rx="2" fill="#fff"/><line x1="-5" y1="-4" x2="5" y2="-4" stroke="#94a3b8" stroke-width="1.5"/><line x1="-5" y1="0" x2="5" y2="0" stroke="#94a3b8" stroke-width="1.5"/>';
    case 'S':
      return '<path d="M0 -9 L8 0 L0 9 L-8 0 Z" fill="#fff"/><circle cx="0" cy="0" r="2.5" fill="#94a3b8"/>';
    case 'N':
      return '<path d="M0 -10 L3 -3 L10 -3 L4 1 L6 8 L0 4 L-6 8 L-4 1 L-10 -3 L-3 -3 Z" fill="#fff"/>';
    case 'T':
      return '<path d="M0 -10 L3 -6 L8 -6 L10 -1 L7 3 L8 8 L3 8 L0 11 L-3 8 L-8 8 L-7 3 L-10 -1 L-8 -6 L-3 -6 Z" fill="#fff"/><circle cx="0" cy="1" r="3" fill="#94a3b8"/>';
    case 'F':
      return '<path d="M0 9 C-7 3 -10 0 -10 -4 C-10 -7 -7 -10 -4 -10 C-2 -10 -1 -9 0 -7 C1 -9 2 -10 4 -10 C7 -10 10 -7 10 -4 C10 0 7 3 0 9 Z" fill="#fff"/>';
    case 'J':
      return '<rect x="-9" y="-10" width="18" height="20" rx="2" fill="#fff"/><line x1="-5" y1="-5" x2="5" y2="-5" stroke="#94a3b8" stroke-width="1.5"/><line x1="-5" y1="0" x2="5" y2="0" stroke="#94a3b8" stroke-width="1.5"/><line x1="-5" y1="5" x2="2" y2="5" stroke="#94a3b8" stroke-width="1.5"/>';
    case 'P':
      return '<circle cx="0" cy="0" r="3.5" fill="#fff"/><path d="M0 -11 L0 -6 M0 11 L0 6 M11 0 L6 0 M-11 0 L-6 0 M8 -8 L5 -5 M-8 8 L-5 5 M8 8 L5 5 M-8 -8 L-5 -5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
    default:
      return '';
  }
}

function buildCharacterSvg(code: MbtiCode) {
  const group = getGroup(code);
  const palette = PALETTE_BY_GROUP[group];
  const [first, second, third, fourth] = code.split('');

  const badges = [
    { x: 330, y: 170, letter: first },
    { x: 870, y: 170, letter: second },
    { x: 330, y: 460, letter: third },
    { x: 870, y: 460, letter: fourth },
  ];

  const label = MBTI_LABELS[code];
  const traitText = `${first}/${second}/${third}/${fourth} preferences`;

  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.bgStart}" />
      <stop offset="1" stop-color="${palette.bgEnd}" />
    </linearGradient>
    <filter id="shadow" x="220" y="70" width="760" height="500" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="14"/>
      <feGaussianBlur stdDeviation="18"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.12 0 0 0 0 0.17 0 0 0 0 0.24 0 0 0 0.16 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_1"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_1" result="shape"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="160" cy="90" r="120" fill="#ffffff88" />
  <circle cx="1050" cy="550" r="140" fill="#ffffff66" />

  <g filter="url(#shadow)">
    <rect x="260" y="90" width="680" height="450" rx="34" fill="${palette.card}" stroke="#e2e8f0" stroke-width="2" />
  </g>

  <text x="340" y="154" fill="${palette.accent}" font-family="Pretendard, SUIT, sans-serif" font-size="28" font-weight="700" letter-spacing="4">YOUR TYPE</text>
  <text x="340" y="232" fill="#0f172a" font-family="Pretendard, SUIT, sans-serif" font-size="72" font-weight="800">${code}</text>
  <text x="340" y="275" fill="#334155" font-family="Pretendard, SUIT, sans-serif" font-size="34" font-weight="700">${label}</text>
  <text x="340" y="314" fill="#475569" font-family="Pretendard, SUIT, sans-serif" font-size="24" font-weight="500">${traitText}</text>

  <g transform="translate(635 375)">
    <ellipse cx="0" cy="114" rx="130" ry="24" fill="#0f172a18" />
    <circle cx="0" cy="-74" r="46" fill="#f8d8b8" />
    <path d="M-42 -84 C-34 -118, 34 -118, 42 -84 L42 -66 L-42 -66 Z" fill="${palette.accent}" />
    <circle cx="-14" cy="-76" r="4" fill="#0f172a" />
    <circle cx="14" cy="-76" r="4" fill="#0f172a" />
    <path d="M-12 -57 C-4 -49, 4 -49, 12 -57" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
    <rect x="-62" y="-20" width="124" height="148" rx="28" fill="${palette.accent}" />
    <rect x="-18" y="-12" width="36" height="36" rx="10" fill="#ffffff88" />
    <rect x="-104" y="8" width="42" height="16" rx="8" fill="${palette.accent}" />
    <rect x="62" y="8" width="42" height="16" rx="8" fill="${palette.accent}" />
  </g>

  ${badges
    .map(
      (badge) => `
  <g transform="translate(${badge.x} ${badge.y})">
    <circle cx="0" cy="0" r="34" fill="${palette.accent}" />
    <g>${getTraitBadgeIcon(badge.letter)}</g>
    <text x="0" y="52" text-anchor="middle" fill="#334155" font-family="Pretendard, SUIT, sans-serif" font-size="18" font-weight="700">${badge.letter}</text>
  </g>`
    )
    .join('')}
</svg>`.trim();
}

export async function GET(_request: Request, { params }: { params: Promise<{ mbtiCode: string }> }) {
  const { mbtiCode } = await params;
  const normalized = mbtiCode.toUpperCase();

  if (!isMbtiCode(normalized)) {
    return new Response('Not Found', { status: 404 });
  }

  const svg = buildCharacterSvg(normalized);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
