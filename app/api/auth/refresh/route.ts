import { NextResponse } from "next/server";
import { serverApi } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import { authErrorResponse } from "@/lib/auth/errors";
import { extractTokens, getRefreshToken, setAuthCookies } from "@/lib/auth/tokens";
import { env } from "@/lib/config/env";

export async function POST(request: Request) {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ message: "Refresh token is missing." }, { status: 401 });
  }

  try {
    const response = await serverApi.post<unknown>(
      env.auth.refreshPath,
      { refresh: refreshToken, refreshToken, refresh_token: refreshToken },
      {
        locale: request.headers.get("accept-language") ?? undefined,
        cache: "no-store",
      },
    );

    const tokens = extractTokens(response.data);

    if (!tokens) {
      return NextResponse.json(
        { message: "Backend refresh response did not include an access token." },
        { status: 502 },
      );
    }

    await setAuthCookies({ ...tokens, refreshToken: tokens.refreshToken ?? refreshToken });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return authErrorResponse(error);
    }

    return NextResponse.json({ message: "Unexpected refresh error." }, { status: 500 });
  }
}
