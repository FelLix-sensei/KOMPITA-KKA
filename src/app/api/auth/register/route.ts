import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isInvalidJson, jsonError, verifyRequestOrigin } from "@/lib/http";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  try {
    const input = registerSchema.parse(await request.json());
    const username = input.username.toLowerCase();
    const exists = await db.user.findUnique({ where: { username }, select: { id: true } });
    if (exists) return jsonError("Username tersebut sudah digunakan.", 409);
    await db.user.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(input.password, 12),
        displayName: input.displayName,
        profile: input.profile,
        role: "USER"
      }
    });
    return NextResponse.json({ message: "Akun berhasil dibuat. Silakan masuk." }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return jsonError("Data pendaftaran belum valid. Periksa kembali isian Anda.");
    if (isInvalidJson(error)) return jsonError("Format permintaan tidak valid.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return jsonError("Username tersebut sudah digunakan.", 409);
    console.error("Registration failed", error);
    return jsonError("Pendaftaran belum dapat diproses.", 500);
  }
}
