import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './client';

describe('apiRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends bearer token when token option is provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { ok: true } }), {
        status: 200,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const data = await apiRequest<{ ok: boolean }>('/admin/auth/me', {
      token: 'test-token',
    });

    expect(data.ok).toBe(true);
    const requestOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = requestOptions.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('throws ApiClientError for API failure response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: '인증 토큰이 유효하지 않습니다.',
          },
        }),
        { status: 401 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest('/admin/auth/me')).rejects.toMatchObject({
      code: 'INVALID_TOKEN',
      status: 401,
    });
  });
});
