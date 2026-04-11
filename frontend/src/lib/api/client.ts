type ApiRequestOptions = {
  signal?: AbortSignal;
};

function getApiBaseUrl() {
  if (import.meta.env.DEV) {
    return "/api";
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }

  return baseUrl.replace(/\/+$/, "");
}

export async function apiGet(path: string, options: ApiRequestOptions = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal: options.signal,
  });

  const payload = await response.json();

  if (!response.ok) {
    if (hasErrorMessage(payload)) {
      throw new Error(payload.message);
    }

    throw new Error(`API request failed with status ${response.status}`);
  }

  return payload;
}

function hasErrorMessage(value: unknown): value is { message: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return typeof (value as { message?: unknown }).message === "string";
}
