import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, jsonError, verifyRequestOrigin } from "@/lib/http";
import { NextResponse } from "next/server";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  try {
    const user = await requireUser();
    const { slug } = await context.params;
    const lesson = await db.lesson.findUnique({ where: { slug }, select: { id: true, status: true } });
    if (!lesson || lesson.status !== "PUBLISHED") return jsonError("Materi tidak ditemukan.", 404);
    const progress = await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      update: {},
      create: { userId: user.id, lessonId: lesson.id }
    });
    const completed = await db.lessonProgress.count({ where: { userId: user.id } });
    const badge = slug === "evaluasi-akhir"
      ? await db.achievement.findUnique({ where: { slug: "pemecah-masalah" }, select: { id: true } })
      : completed === 1
      ? await db.achievement.findUnique({ where: { slug: "langkah-pertama" }, select: { id: true } })
      : completed >= 5 ? await db.achievement.findUnique({ where: { slug: "konsisten-belajar" }, select: { id: true } }) : null;
    if (badge) {
      await db.userAchievement.upsert({
        where: { userId_achievementId: { userId: user.id, achievementId: badge.id } },
        update: {},
        create: { userId: user.id, achievementId: badge.id }
      });
    }
    return NextResponse.json({ completedAt: progress.completedAt, completedCount: completed });
  } catch (error) {
    return apiError(error);
  }
}
