import type { CSSProperties, ReactElement } from 'react';
import type { SharedResultSnapshot } from './shared-result';

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

const PALETTE_BY_GROUP: Record<string, { bgStart: string; bgEnd: string; accent: string; accentSoft: string }> = {
  analyst: { bgStart: '#eff6ff', bgEnd: '#dbeafe', accent: '#2563eb', accentSoft: '#bfdbfe' },
  diplomat: { bgStart: '#ecfdf5', bgEnd: '#d1fae5', accent: '#059669', accentSoft: '#a7f3d0' },
  sentinel: { bgStart: '#fff7ed', bgEnd: '#ffedd5', accent: '#ea580c', accentSoft: '#fdba74' },
  explorer: { bgStart: '#fdf2f8', bgEnd: '#fce7f3', accent: '#db2777', accentSoft: '#f9a8d4' },
};

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

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

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
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
    lines[maxLines - 1] = truncate(lines[maxLines - 1], maxLength - 3);
  }

  return lines;
}

export function isMbtiCode(value: string): value is MbtiCode {
  return (MBTI_CODES as readonly string[]).includes(value);
}

export function renderCharacterImage(code: MbtiCode): ReactElement {
  const palette = PALETTE_BY_GROUP[getGroup(code)];
  const traitBadges = code.split('');

  return (
    <div
      style={{
        ...rootStyle,
        background: `linear-gradient(135deg, ${palette.bgStart} 0%, ${palette.bgEnd} 100%)`,
      }}
    >
      <div style={{ ...orbStyle, top: 46, left: 42, width: 220, height: 220, opacity: 0.55 }} />
      <div style={{ ...orbStyle, right: 28, bottom: 32, width: 260, height: 260, opacity: 0.42 }} />
      <div style={cardStyle}>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 520 }}>
            <div style={{ color: palette.accent, fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>YOUR TYPE</div>
            <div style={{ marginTop: 28, fontSize: 94, fontWeight: 800, lineHeight: 0.95 }}>{code}</div>
            <div style={{ marginTop: 18, fontSize: 38, fontWeight: 700 }}>{MBTI_LABELS[code]}</div>
            <div style={{ marginTop: 12, fontSize: 26, color: '#475569' }}>
              {traitBadges.join(' / ')}
              {' '}
              preferences
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
              {traitBadges.slice(0, 2).map((letter) => (
                <div key={letter} style={{ ...badgeStyle, background: palette.accentSoft }}>
                  <div style={{ ...badgeCircleStyle, background: palette.accent }}>{letter}</div>
                </div>
              ))}
            </div>
            <div style={{ position: 'relative', display: 'flex', width: 250, height: 250, alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', bottom: 10, width: 210, height: 34, borderRadius: 999, background: 'rgba(15, 23, 42, 0.10)' }} />
              <div style={{ position: 'absolute', top: 26, width: 92, height: 92, borderRadius: 999, background: '#f8d8b8' }} />
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  width: 104,
                  height: 44,
                  borderRadius: 999,
                  background: palette.accent,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 110,
                  width: 148,
                  height: 132,
                  borderRadius: 34,
                  background: palette.accent,
                }}
              />
              <div style={{ position: 'absolute', top: 144, left: 18, width: 46, height: 18, borderRadius: 999, background: palette.accent }} />
              <div style={{ position: 'absolute', top: 144, right: 18, width: 46, height: 18, borderRadius: 999, background: palette.accent }} />
              <div style={{ position: 'absolute', top: 76, left: 108, width: 8, height: 8, borderRadius: 999, background: '#0f172a' }} />
              <div style={{ position: 'absolute', top: 76, right: 108, width: 8, height: 8, borderRadius: 999, background: '#0f172a' }} />
              <div style={{ position: 'absolute', top: 98, width: 32, height: 10, borderBottom: '3px solid #0f172a', borderRadius: 999 }} />
            </div>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
              {traitBadges.slice(2).map((letter) => (
                <div key={letter} style={{ ...badgeStyle, background: palette.accentSoft }}>
                  <div style={{ ...badgeCircleStyle, background: palette.accent }}>{letter}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function renderSharedResultCard(snapshot: SharedResultSnapshot): ReactElement {
  const title = truncate(snapshot.title || `${snapshot.mbtiCode} 유형`, 32);
  const summary = splitIntoLines(snapshot.summary || snapshot.shareDescription || '', 28, 3);

  return (
    <div style={{ ...rootStyle, background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
      <div style={{ ...orbStyle, top: 36, left: 56, width: 200, height: 200, opacity: 0.5 }} />
      <div style={{ ...orbStyle, right: 54, bottom: 36, width: 250, height: 250, opacity: 0.32 }} />
      <div style={{ ...cardStyle, flexDirection: 'row', gap: 40, alignItems: 'stretch' }}>
        <div style={{ width: 14, borderRadius: 999, background: 'linear-gradient(180deg, #f97316 0%, #fdba74 100%)' }} />
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 650 }}>
              <div style={{ color: '#f97316', fontSize: 26, fontWeight: 700, letterSpacing: 5 }}>YOUR RESULT</div>
              <div style={{ marginTop: 42, fontSize: 96, fontWeight: 800, lineHeight: 0.92 }}>{snapshot.mbtiCode}</div>
              <div style={{ marginTop: 18, fontSize: 50, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 28, color: '#475569', lineHeight: 1.35 }}>
                {summary.length > 0 ? summary.map((line) => <div key={line}>{line}</div>) : <div>MBTI 결과를 확인해 보세요.</div>}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                minWidth: 182,
                padding: '16px 22px',
                borderRadius: 999,
                background: '#fff7ed',
                color: '#c2410c',
                fontSize: 24,
                fontWeight: 700,
                border: '1px solid #fdba74',
              }}
            >
              MBTI SHARE
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: 24, fontWeight: 600 }}>MBTI 심리테스트 공유 결과</div>
            <div
              style={{
                display: 'flex',
                padding: '14px 22px',
                borderRadius: 24,
                background: '#fff',
                border: '1px solid #fed7aa',
                color: '#7c2d12',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {snapshot.mbtiCode}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const rootStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  position: 'relative',
  overflow: 'hidden',
  padding: '48px',
  fontFamily: 'sans-serif',
  color: '#0f172a',
};

const orbStyle: CSSProperties = {
  position: 'absolute',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.85)',
};

const cardStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  width: '100%',
  height: '100%',
  padding: '44px 48px',
  borderRadius: 36,
  background: 'rgba(255,255,255,0.96)',
  border: '1px solid rgba(226,232,240,0.95)',
  boxShadow: '0 24px 70px rgba(15, 23, 42, 0.10)',
};

const badgeStyle: CSSProperties = {
  display: 'flex',
  width: 104,
  height: 104,
  borderRadius: 28,
  alignItems: 'center',
  justifyContent: 'center',
};

const badgeCircleStyle: CSSProperties = {
  display: 'flex',
  width: 64,
  height: 64,
  borderRadius: 999,
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: 28,
  fontWeight: 800,
};
