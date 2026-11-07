import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";

// Override all auth configuration before importing modules; never consume local secrets.
Object.assign(process.env, {
  API_BASE_URL: "https://backend.invalid/api",
  NEXT_PUBLIC_API_BASE_URL: "https://backend.invalid/api",
  AUTH_LOGIN_PATH: "/auth/login",
  AUTH_REFRESH_PATH: "/auth/refresh",
  AUTH_ME_PATH: "/auth/me",
  AUTH_ACCESS_COOKIE: "test_access",
  AUTH_REFRESH_COOKIE: "test_refresh",
});
const values = new Map();
const writes = [];
const deletes = [];
mock.module("next/headers", () => ({
  cookies: async () => ({
    get: (name) => (values.has(name) ? { value: values.get(name) } : undefined),
    set: (name, value, options) => {
      values.set(name, value);
      writes.push({ name, value, options });
    },
    delete: (name) => {
      values.delete(name);
      deletes.push(name);
    },
  }),
}));
const { POST: login } = await import("../app/api/auth/login/route");
const { POST: refresh } = await import("../app/api/auth/refresh/route");
const { POST: logout } = await import("../app/api/auth/logout/route");
const { GET: me } = await import("../app/api/auth/me/route");
const { extractTokens } = await import("../lib/auth/tokens");
const { createApiClient } = await import("../lib/api/client");
const { ApiError } = await import("../lib/api/types");
const { env } = await import("../lib/config/env");
const originalFetch = globalThis.fetch;
let upstream;
beforeEach(() => {
  values.clear();
  writes.length = 0;
  deletes.length = 0;
  upstream = mock(async () => {
    throw new Error("Unconfigured mock; network is forbidden");
  });
  globalThis.fetch = upstream;
});
afterAll(() => {
  globalThis.fetch = originalFetch;
  mock.restore();
});
const json = (data, status = 200) => Response.json(data, { status });
const request = (body = { email: "test@example.invalid", password: "dummy-password" }) =>
  new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "accept-language": "uz", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
function seed() {
  values.set(env.auth.accessCookie, "dummy-access");
  values.set(env.auth.refreshCookie, "dummy-refresh");
}

describe("auth route handlers using real API client and cookie helpers", () => {
  test.each([
    { access: "a", refresh: "r" },
    { accessToken: "a", refreshToken: "r" },
    { data: { access_token: "a", refresh_token: "r" } },
    { tokens: { token: "a", refresh: "r" } },
  ])("login accepts supported backend token shape %j", async (tokens) => {
    upstream.mockResolvedValue(json(tokens));
    const response = await login(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(writes.map(({ value }) => value)).toEqual(["a", "r"]);
    for (const { options } of writes)
      expect(options).toMatchObject({
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "lax",
        path: "/",
      });
    expect(writes.map(({ options }) => options.maxAge)).toEqual([900, 2592000]);
    const [url, init] = upstream.mock.calls[0];
    expect(url).toBe(`${env.serverApiBaseUrl}${env.auth.loginPath}`);
    expect(init.headers.get("Accept-Language")).toBe("uz");
    expect(init.cache).toBe("no-store");
    expect(JSON.parse(init.body)).toEqual({
      email: "test@example.invalid",
      password: "dummy-password",
    });
  });
  test.each([
    null,
    {},
    { email: "wrong", password: "x" },
    { email: "test@example.invalid", password: "" },
    { email: "test@example.invalid", password: 1 },
  ])("invalid login input %j", async (body) => {
    expect((await login(request(body))).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
    expect(writes).toHaveLength(0);
  });
  test("malformed JSON is 400 without calling backend", async () => {
    expect(
      (await login(new Request("http://localhost", { method: "POST", body: "{" }))).status,
    ).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  test.each([
    null,
    {},
    { access: 123 },
    { access: {} },
    { access: "" },
    { access: "a", refresh: 123 },
    { tokens: "wrong" },
  ])("invalid upstream token response %j", async (payload) => {
    expect(extractTokens(payload)).toBeNull();
    upstream.mockImplementation(async () => json(payload));
    expect((await login(request())).status).toBe(502);
    values.set(env.auth.refreshCookie, "old-refresh");
    expect((await refresh(request())).status).toBe(502);
    expect(writes).toHaveLength(0);
  });
  test("refresh requires cookie and never calls backend without it", async () => {
    expect((await refresh(request())).status).toBe(401);
    expect(upstream).not.toHaveBeenCalled();
  });
  test.each([
    true,
    false,
  ])("refresh rotates access and retains/rotates refresh (rotate=%s)", async (rotate) => {
    seed();
    upstream.mockResolvedValue(
      json({ access: "new-access", ...(rotate ? { refresh: "new-refresh" } : {}) }),
    );
    expect((await refresh(request())).status).toBe(200);
    expect(values.get(env.auth.refreshCookie)).toBe(rotate ? "new-refresh" : "dummy-refresh");
    expect(values.get(env.auth.accessCookie)).toBe("new-access");
    const [url, init] = upstream.mock.calls[0];
    expect(url).toBe(`${env.serverApiBaseUrl}${env.auth.refreshPath}`);
    expect(JSON.parse(init.body)).toEqual({
      refresh: "dummy-refresh",
      refreshToken: "dummy-refresh",
      refresh_token: "dummy-refresh",
    });
    expect(init.headers.get("Accept-Language")).toBe("uz");
  });
  test("me without access is unauthenticated, no upstream", async () => {
    const response = await me(request());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ authenticated: false, user: null });
    expect(upstream).not.toHaveBeenCalled();
  });
  test.each(["direct", "user", "data"])("me normalizes %s user payload", async (shape) => {
    seed();
    const user = { id: "dummy-id", email: "test@example.invalid" };
    upstream.mockResolvedValue(json(shape === "direct" ? user : { [shape]: user }));
    const response = await me(request());
    expect(await response.json()).toEqual({ authenticated: true, user });
    const [url, init] = upstream.mock.calls[0];
    expect(url).toBe(`${env.serverApiBaseUrl}${env.auth.mePath}`);
    expect(init.headers.get("Authorization")).toBe("Bearer dummy-access");
    expect(init.headers.get("Accept-Language")).toBe("uz");
  });
  test("logout clears both cookies and is idempotent without upstream", async () => {
    seed();
    for (let i = 0; i < 2; i++) expect(await (await logout()).json()).toEqual({ ok: true });
    expect(values.size).toBe(0);
    expect(deletes).toEqual([
      env.auth.accessCookie,
      env.auth.refreshCookie,
      env.auth.accessCookie,
      env.auth.refreshCookie,
    ]);
    expect(upstream).not.toHaveBeenCalled();
  });
  for (const [name, handler] of [
    ["login", login],
    ["refresh", refresh],
    ["me", me],
  ]) {
    test.each([
      401, 403, 429, 503,
    ])(`${name} preserves error status %s, not backend internals`, async (status) => {
      seed();
      upstream.mockResolvedValue(
        json({ message: "private backend diagnostic", token: "dummy-sensitive-marker" }, status),
      );
      const response = await handler(request());
      expect(response.status).toBe(status);
      const body = await response.text();
      expect(body).not.toContain("private backend diagnostic");
      expect(body).not.toContain("dummy-sensitive-marker");
      expect(writes).toHaveLength(0);
    });
    test(`${name} network/malformed upstream errors are safe`, async () => {
      seed();
      upstream.mockRejectedValue(new Error("private-network-host"));
      let response = await handler(request());
      expect(response.status).toBe(500);
      expect(await response.text()).not.toContain("private-network-host");
      upstream.mockResolvedValue(
        new Response("{", { headers: { "content-type": "application/json" } }),
      );
      response = await handler(request());
      expect(response.status).toBe(500);
      expect(writes).toHaveLength(0);
    });
  }
});

describe("API transport", () => {
  const api = createApiClient("https://backend.invalid/api/");
  test("JSON request, auth/locale headers and response metadata", async () => {
    upstream.mockResolvedValue(json({ id: 1 }, 201));
    const result = await api.post("/items", { name: "test" }, { token: "dummy", locale: "ru" });
    expect(result.data).toEqual({ id: 1 });
    expect(result.status).toBe(201);
    const [url, init] = upstream.mock.calls[0];
    expect(url).toBe("https://backend.invalid/api/items");
    expect(init.method).toBe("POST");
    expect(init.headers.get("Authorization")).toBe("Bearer dummy");
    expect(init.headers.get("Accept-Language")).toBe("ru");
    expect(init.headers.get("Content-Type")).toBe("application/json");
    expect(init.cache).toBe("no-store");
  });
  test("204 and plain text", async () => {
    upstream.mockResolvedValue(new Response(null, { status: 204 }));
    expect((await api.delete("/items/1")).data).toBeNull();
    upstream.mockResolvedValue(new Response("plain"));
    expect((await api.get("/text")).data).toBe("plain");
  });
  test.each(["message", "detail", "error"])("typed problem+json error %s", async (field) => {
    upstream.mockResolvedValue(
      new Response(JSON.stringify({ [field]: "invalid" }), {
        status: 422,
        headers: { "content-type": "application/problem+json" },
      }),
    );
    try {
      await api.get("/error");
      throw new Error("must reject");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(422);
      expect(error.message).toBe("invalid");
    }
  });
  test("timeout aborts request and maps to typed 408", async () => {
    upstream.mockImplementation(
      (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("aborted", "AbortError")),
            { once: true },
          );
        }),
    );
    await expect(api.get("/slow", { timeoutMs: 5 })).rejects.toMatchObject({
      status: 408,
      message: "Request timed out.",
    });
  });
});
