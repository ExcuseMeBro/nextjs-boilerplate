export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  token?: string | null;
  locale?: string;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  timeoutMs?: number;
};

export type ApiSuccessResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

export type ApiErrorPayload = {
  message: string;
  status: number;
  details?: unknown;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.details = payload.details;
  }
}
