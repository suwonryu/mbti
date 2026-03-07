export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(params: { code: string; message: string; status: number }) {
    super(params.message);
    this.name = 'ApiClientError';
    this.code = params.code;
    this.status = params.status;
  }
}

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4001/api';
}

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  const headers = new Headers(options?.headers ?? {});

  if (!headers.has('Content-Type') && options?.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (options?.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const text = await response.text();
  let payload: ApiEnvelope<T> | null = null;

  if (text) {
    try {
      payload = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      throw new ApiClientError({
        code: 'INVALID_JSON',
        message: '서버 응답을 해석할 수 없습니다.',
        status: response.status,
      });
    }
  }

  if (!payload) {
    throw new ApiClientError({
      code: 'EMPTY_RESPONSE',
      message: '빈 응답이 반환되었습니다.',
      status: response.status,
    });
  }

  if (!response.ok || !payload.success) {
    const code = payload.success ? `HTTP_${response.status}` : payload.error.code;
    const message = payload.success ? '요청 처리에 실패했습니다.' : payload.error.message;

    throw new ApiClientError({ code, message, status: response.status });
  }

  return payload.data;
}
