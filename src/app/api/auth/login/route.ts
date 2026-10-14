import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { isInvalidJson, jsonError, verifyRequestOrigin } from "@/lib/http";
import { usernameSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

export async function POST(request: Request) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  try {
    const body = await request.json();
    const username = usernameSchema.parse(body.username).toLowerCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 72) : "";
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipKey = createHash("sha256").update(`${forwarded}:${username}`).digest("hex");
    const userKey = createHash("sha256").update(`username:${username}`).digest("hex");
    const since = new Date(Date.now() - 15 * 60 * 1000);
    const count = await db.loginAttempt.count({ where: { key: { in: [ipKey, userKey] }, createdAt: { gte: since } } });
    if (count >= 8) return jsonError("Terlalu banyak percobaan. Coba kembali dalam 15 menit.", 429);
    await db.loginAttempt.createMany({ data: [{ key: ipKey }, { key: userKey }] });
    const user = await db.user.findUnique({ where: { username } });
    const valid = user?.isActive && await bcrypt.compare(password, user.passwordHash);
    if (!valid || !user) return jsonError("Nama pengguna atau password tidak sesuai.", 401);
    await db.loginAttempt.deleteMany({ where: { key: { in: [ipKey, userKey] } } });
    await createSession(user.id);
    return NextResponse.json({
      user: { username: user.username, displayName: user.displayName, role: user.role, mustChangePassword: user.mustChangePassword }
    });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return jsonError("Nama pengguna atau password tidak sesuai.", 401);
    if (isInvalidJson(error)) return jsonError("Format permintaan tidak valid.");
    console.error("Login failed", error);
    return jsonError("Login belum dapat diproses.", 500);
  }
}
