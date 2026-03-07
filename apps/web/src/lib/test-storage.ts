const SESSION_PREFIX = 'mbti:test:';

export function saveAnswers(slug: string, answers: Record<string, number>) {
  localStorage.setItem(`${SESSION_PREFIX}${slug}`, JSON.stringify(answers));
}

export function loadAnswers(slug: string): Record<string, number> {
  const raw = localStorage.getItem(`${SESSION_PREFIX}${slug}`);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

export function clearAnswers(slug: string) {
  localStorage.removeItem(`${SESSION_PREFIX}${slug}`);
}
