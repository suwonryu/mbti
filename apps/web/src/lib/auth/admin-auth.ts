const ADMIN_TOKEN_KEY = 'mbti:admin:access-token';

export function getAdminAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminAccessToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminAccessToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
