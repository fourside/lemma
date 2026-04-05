const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const refreshedToken = res.headers.get("X-Refreshed-Token");
  if (refreshedToken) {
    setToken(refreshedToken);
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      window.location.href = "/login";
    }
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : `HTTP ${res.status}`;
    throw new Error(message);
  }

  const json: T = await res.json();
  return json;
}

export const swrFetcher = <T>(path: string): Promise<T> => apiFetch<T>(path);
