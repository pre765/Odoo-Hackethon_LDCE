const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");
const authTokenKey = "globetrotter.authToken";

interface ApiErrorBody {
  error?: string;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export function getAuthToken() {
  return window.localStorage.getItem(authTokenKey);
}

export function setAuthToken(token: string | null) {
  if (token) window.localStorage.setItem(authTokenKey, token);
  else window.localStorage.removeItem(authTokenKey);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { authenticated?: boolean } = {},
): Promise<T> {
  const { authenticated = false, headers, ...requestOptions } = options;
  const token = authenticated ? getAuthToken() : null;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...requestOptions,
    headers: {
      ...(requestOptions.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    if (response.status === 401 && authenticated) setAuthToken(null);
    throw new ApiRequestError(body.error ?? "Unable to complete this request.", response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
