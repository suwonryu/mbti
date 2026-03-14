type SharedResultPayload = {
  success: boolean;
  data?: {
    snapshot: SharedResultSnapshot;
  };
};

export type SharedResultSnapshot = {
  mbtiCode: string;
  title: string;
  summary: string;
  description: string;
  shareTitle: string;
  shareDescription: string;
  imageUrl: string | null;
};

function getInternalApiBaseUrl() {
  return process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4001/api';
}

export async function fetchSharedResultSnapshot(shareToken: string) {
  try {
    const response = await fetch(`${getInternalApiBaseUrl()}/public/results/${shareToken}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as SharedResultPayload;

    if (!payload.success || !payload.data) {
      return null;
    }

    return payload.data.snapshot;
  } catch {
    return null;
  }
}
