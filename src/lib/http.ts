import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function isInvalidJson(error: unknown) {
  return error instanceof SyntaxError;
}

export function verifyRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const received = new URL(origin).origin;
    const requestOrigin = new URL(request.url).origin;
    const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin : requestOrigin;
    return received === requestOrigin || received === configuredOrigin;
  } catch {
    return false;
  }
}

export function apiError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHENTICATED") return jsonError("Silakan masuk untuk melanjutkan.", 401);
  if (error instanceof Error && error.message === "FORBIDDEN") return jsonError("Anda tidak memiliki izin untuk tindakan ini.", 403);
  if (error instanceof Error && error.message === "PASSWORD_CHANGE_REQUIRED") return jsonError("Ganti password awal melalui pengaturan akun sebelum melanjutkan.", 403);
  console.error("API request failed", error);
  return jsonError("Terjadi kesalahan. Silakan coba kembali.", 500);
}
