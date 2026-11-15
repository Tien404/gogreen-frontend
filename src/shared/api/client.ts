import axios, { AxiosHeaders, type AxiosAdapter } from "axios";
import type { Operations } from "./contract.generated";
import { ApiError, apiErrorFromResponse } from "./errors";

type Operation = keyof Operations;
type RequestOptions<K extends Operation> = Omit<Operations[K], "response"> & {
  signal?: AbortSignal;
  onHeaders?: (headers: Headers) => void;
  onUnauthorized?: "clear-session" | "ignore";
};
type RequiredOptions<K extends Operation> = Operations[K] extends
  { params: object } | { body: object } | { query: object }
  ? [options: RequestOptions<K>]
  : [options?: RequestOptions<K>];

type ClientConfig = {
  baseUrl: string;
  onUnauthorized?: () => void;
  adapter?: AxiosAdapter;
  readCsrf?: () => string | undefined;
};

function csrfCookie(): string | undefined {
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("mobility_csrf="));
  return cookie?.slice("mobility_csrf=".length);
}

export function createApiClient({
  baseUrl,
  onUnauthorized,
  adapter,
  readCsrf = csrfCookie,
}: ClientConfig) {
  const http = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    withXSRFToken: false,
    timeout: 15_000,
    responseType: "text",
    validateStatus: () => true,
    adapter,
  });

  return {
    async request<K extends Operation>(
      operation: K,
      ...args: RequiredOptions<K>
    ): Promise<Operations[K]["response"]> {
      const options = args[0] as
        | {
            params?: Record<string, string | number>;
            query?: Record<
              string,
              string | number | boolean | null | undefined
            >;
            body?: unknown;
            signal?: AbortSignal;
            onHeaders?: (headers: Headers) => void;
            onUnauthorized?: "clear-session" | "ignore";
          }
        | undefined;
      const [method, template] = operation.split(" ");
      const path = template.replace(/\{([^}]+)\}/g, (_, name: string) => {
        const value = options?.params?.[name];
        if (value === undefined)
          throw new TypeError(`Missing path parameter: ${name}`);
        return encodeURIComponent(value);
      });
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(options?.query ?? {})) {
        if (value !== undefined && value !== null)
          query.set(key, String(value));
      }
      const headers = new AxiosHeaders({ Accept: "application/json" });
      if (options?.body !== undefined)
        headers.set("Content-Type", "application/json");
      if (method !== "GET" && operation !== "POST /sessions") {
        const csrf = readCsrf();
        if (csrf) headers.set("X-CSRF-Token", csrf);
      }

      let response;
      try {
        response = await http.request<string>({
          url: `${path}${query.size ? `?${query}` : ""}`,
          method,
          headers,
          data: options?.body,
          signal: options?.signal,
        });
      } catch (error) {
        options?.signal?.throwIfAborted();
        if (axios.isCancel(error)) throw error;
        throw new ApiError(
          0,
          "NETWORK_ERROR",
          "Could not reach the server.",
          true,
        );
      }

      options?.signal?.throwIfAborted();
      const ok = response.status >= 200 && response.status < 300;
      if (ok && options?.onHeaders) {
        const entries = Object.entries(response.headers)
          .filter(([, value]) => value != null && value !== false)
          .map(([name, value]): [string, string] => [name, String(value)]);
        options.onHeaders(new Headers(entries));
      }
      if (response.status === 204)
        return undefined as Operations[K]["response"];

      let payload: unknown = null;
      try {
        payload = JSON.parse(response.data);
      } catch {
        // A proxy can return HTML or an empty body for an HTTP error.
      }
      if (!ok) {
        if (response.status === 401 && options?.onUnauthorized !== "ignore")
          onUnauthorized?.();
        throw apiErrorFromResponse(response.status, payload);
      }
      if (payload === null)
        throw new ApiError(
          502,
          "INVALID_RESPONSE",
          "Expected JSON from the API.",
          true,
        );
      return payload as Operations[K]["response"];
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
