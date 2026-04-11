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

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}
