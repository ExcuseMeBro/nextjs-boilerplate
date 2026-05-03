import { cookies } from "next/headers";
import { env } from "@/lib/config/env";
import type { AuthTokens } from "./types";

type TokenLike = {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
};

const ACCESS_MAX_AGE_SECONDS = 60 * 15;
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function extractTokens(payload: unknown): AuthTokens | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as TokenLike & { data?: TokenLike; tokens?: TokenLike };
  const tokenSource = root.tokens ?? root.data ?? root;
  const accessToken =
    tokenSource.accessToken ?? tokenSource.access_token ?? tokenSource.access ?? tokenSource.token;
  const refreshToken = tokenSource.refreshToken ?? tokenSource.refresh_token ?? tokenSource.refresh;

  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(env.auth.accessCookie)?.value ?? null;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(env.auth.refreshCookie)?.value ?? null;
}

export async function setAuthCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();
  const secure = env.isProduction;

  cookieStore.set(env.auth.accessCookie, tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ACCESS_MAX_AGE_SECONDS,
  });

  if (tokens.refreshToken) {
    cookieStore.set(env.auth.refreshCookie, tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: REFRESH_MAX_AGE_SECONDS,
    });
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(env.auth.accessCookie);
  cookieStore.delete(env.auth.refreshCookie);
}
