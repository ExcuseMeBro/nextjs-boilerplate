import { NextResponse } from "next/server";
import type { ApiError } from "@/lib/api/types";

/** Backend error payloads and network diagnostics are not a public auth contract. */
export function authErrorResponse(error: ApiError) {
  return NextResponse.json(
    {
      message:
        error.status >= 500
          ? "Authentication service unavailable."
          : "Authentication request failed.",
    },
    { status: error.status },
  );
}
