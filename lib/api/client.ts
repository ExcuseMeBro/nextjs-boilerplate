import { env } from "@/lib/config/env";
import { ApiError, type ApiRequestOptions, type ApiSuccessResponse } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;
const JSON_CONTENT_TYPES = ["application/json", "application/problem+json"];

function buildUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function normalizeErrorMessage(status: number, payload: unknown) {
  if (payload && typeof payload === "object") {
    if ("message" in payload && typeof payload.message === "string") {
      return payload.message;
    }

    if ("detail" in payload && typeof payload.detail === "string") {
      return payload.detail;
    }

    if ("error" in payload && typeof payload.error === "string") {
      return payload.error;
    }
  }

  return `Request failed with status ${status}`;
}

async function readResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = JSON_CONTENT_TYPES.some((type) => contentType.includes(type));

  if (isJson) {
    return response.json();
  }

  return response.text();
}

export function createApiClient(baseUrl = env.serverApiBaseUrl) {
  async function request<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiSuccessResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");

    if (options.locale) {
      headers.set("Accept-Language", options.locale);
    }

    if (options.token) {
      headers.set("Authorization", `Bearer ${options.token}`);
    }

    const hasBody = options.body !== undefined;
    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    try {
      const response = await fetch(buildUrl(baseUrl, path), {
        method: options.method ?? "GET",
        headers,
        body: hasBody ? JSON.stringify(options.body) : undefined,
        cache: options.cache ?? "no-store",
        next: options.next,
        signal: controller.signal,
      });

      const payload = await readResponseBody(response);

      if (!response.ok) {
        throw new ApiError({
          message: normalizeErrorMessage(response.status, payload),
          status: response.status,
          details: payload,
        });
      }

      return {
        data: payload as T,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError({
          message: "Request timed out.",
          status: 408,
        });
      }

      throw new ApiError({
        message: error instanceof Error ? error.message : "Unknown network error.",
        status: 500,
        details: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    request,
    get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, body, method: "POST" }),
    put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, body, method: "PUT" }),
    patch: <T>(
      path: string,
      body?: unknown,
      options?: Omit<ApiRequestOptions, "method" | "body">,
    ) => request<T>(path, { ...options, body, method: "PATCH" }),
    delete: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "DELETE" }),
  };
}

export const api = createApiClient(env.publicApiBaseUrl);
export const serverApi = createApiClient(env.serverApiBaseUrl);
