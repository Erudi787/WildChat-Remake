export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => Promise<string | null>;
}

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, getToken } = config;

  async function fetchWithAuth(
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = new Headers(options.headers);
    if (getToken) {
      const token = await getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return fetch(`${baseUrl}${path}`, { ...options, headers });
  }

  return {
    get: (path: string) => fetchWithAuth(path, { method: "GET" }),
    post: (path: string, body?: unknown) =>
      fetchWithAuth(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      }),
    put: (path: string, body?: unknown) =>
      fetchWithAuth(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      }),
    delete: (path: string) => fetchWithAuth(path, { method: "DELETE" }),
  };
}
