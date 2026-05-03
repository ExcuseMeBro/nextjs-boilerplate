import { NextResponse } from "next/server";
import { z } from "zod";
import { serverApi } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import { extractTokens, setAuthCookies } from "@/lib/auth/tokens";
import { env } from "@/lib/config/env";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 400 });
  }

  try {
    const response = await serverApi.post<unknown>(env.auth.loginPath, parsed.data, {
      locale: request.headers.get("accept-language") ?? undefined,
      cache: "no-store",
    });

    const tokens = extractTokens(response.data);

    if (!tokens) {
      return NextResponse.json(
        { message: "Backend login response did not include an access token." },
        { status: 502 },
      );
    }

    await setAuthCookies(tokens);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status },
      );
    }

    return NextResponse.json({ message: "Unexpected login error." }, { status: 500 });
  }
}
