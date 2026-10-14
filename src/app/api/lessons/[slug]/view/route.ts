import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, jsonError, verifyRequestOrigin } from "@/lib/http";
import { NextResponse } from "next/server";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  try {
    const user = await requireUser();
    const { slug } = await context.params;
    const lesson = await db.lesson.findFirst({ where: { slug, status: "PUBLISHED" }, select: { id: true } });
    if (!lesson) return jsonError("Materi tidak ditemukan.", 404);
    await db.lessonView.create({ data: { userId: user.id, lessonId: lesson.id } });
    return NextResponse.json({ recorded: true });
  } catch (error) {
    return apiError(error);
  }
}
