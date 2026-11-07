import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/types";
import { authErrorResponse } from "@/lib/auth/errors";
import { getServerSession } from "@/lib/auth/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(request.headers.get("accept-language") ?? undefined);

    if (!session.authenticated) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof ApiError) {
      return authErrorResponse(error);
    }

    return NextResponse.json({ message: "Unexpected session error." }, { status: 500 });
  }
}
