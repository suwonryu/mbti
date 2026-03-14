const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const PROTOCOL_RELATIVE_PATTERN = /^\/\//;

export function normalizeResultImageUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed) || PROTOCOL_RELATIVE_PATTERN.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  if (trimmed.startsWith('./')) {
    return `/${trimmed.slice(2)}`;
  }

  if (trimmed.includes('/')) {
    return `/${trimmed.replace(/^\/+/, '')}`;
  }

  return null;
}

export function getCharacterResultImagePath(mbtiCode: string) {
  return `/mbti-character/${mbtiCode}`;
}

export function getShareCardImagePath(shareToken: string) {
  return `/result/${shareToken}/card-image`;
}
