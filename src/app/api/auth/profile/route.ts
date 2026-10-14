import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, isInvalidJson, jsonError, verifyRequestOrigin } from "@/lib/http";
import { passwordSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  profile: z.enum(["CHILD", "TEEN", "ADULT"])
});

export async function PATCH(request: Request) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Silakan masuk untuk melanjutkan.", 401);
    if (user.mustChangePassword) return jsonError("Ganti password awal sebelum mengubah pengaturan lain.", 403);
    const data = profileSchema.parse(await request.json());
    const updated = await db.user.update({ where: { id: user.id }, data, select: { displayName: true, profile: true } });
    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return jsonError("Profil belum valid.");
    if (isInvalidJson(error)) return jsonError("Format permintaan tidak valid.");
    return apiError(error);
  }
}

export async function POST(request: Request) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Silakan masuk untuk melanjutkan.", 401);
    const input = z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema }).parse(await request.json());
    const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    if (!(await bcrypt.compare(input.currentPassword, record.passwordHash))) return jsonError("Password saat ini tidak sesuai.", 400);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(input.newPassword, 12), mustChangePassword: false }
    });
    return NextResponse.json({ message: "Password berhasil diperbarui." });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return jsonError("Password baru belum memenuhi kebijakan keamanan.");
    if (isInvalidJson(error)) return jsonError("Format permintaan tidak valid.");
    return apiError(error);
  }
}
