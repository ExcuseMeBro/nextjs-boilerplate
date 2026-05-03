import { serverApi } from "@/lib/api/client";
import { env } from "@/lib/config/env";
import { getAccessToken } from "./tokens";
import type { AuthSession, AuthUser } from "./types";

type BackendMeResponse = AuthUser | { user: AuthUser } | { data: AuthUser };

function normalizeUser(payload: BackendMeResponse): AuthUser {
  const response = payload as { data?: AuthUser; user?: AuthUser };

  if (response.user) {
    return response.user;
  }

  if (response.data) {
    return response.data;
  }

  return payload as AuthUser;
}

export async function getServerSession(locale?: string): Promise<AuthSession> {
  const token = await getAccessToken();

  if (!token) {
    return {
      authenticated: false,
      user: null,
    };
  }

  const response = await serverApi.get<BackendMeResponse>(env.auth.mePath, {
    token,
    locale,
    cache: "no-store",
  });

  return {
    authenticated: true,
    user: normalizeUser(response.data),
  };
}
