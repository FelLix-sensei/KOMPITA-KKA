import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, isInvalidJson, jsonError, verifyRequestOrigin } from "@/lib/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  try {
    const user = await requireUser();
    const input = z.object({
      topic: z.string().max(60).optional(),
      lessonSlug: z.string().max(100).optional(),
      difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
      limit: z.number().int().min(5).max(25).default(10)
    }).parse(await request.json());
    const lesson = input.lessonSlug ? await db.lesson.findUnique({ where: { slug: input.lessonSlug }, select: { id: true } }) : null;
    const questions = await db.quizQuestion.findMany({
      where: {
        isActive: true,
        ...(input.topic ? { topic: input.topic } : {}),
        ...(input.lessonSlug ? { lessonId: lesson?.id ?? "__missing__" } : {}),
        ...(input.difficulty ? { difficulty: input.difficulty } : {})
      },
      take: 150,
      orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
      select: { id: true, prompt: true, type: true, options: true, topic: true, difficulty: true, weight: true, profile: true }
    });
    if (questions.length < 5) return jsonError("Belum tersedia cukup soal untuk pilihan tersebut.", 404);
    const preferred = questions.filter((question) => question.profile === user.profile);
    const fallback = questions.filter((question) => question.profile !== user.profile);
    const shuffled = (items: typeof questions) => {
      const copy = [...items];
      for (let index = copy.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[other]] = [copy[other], copy[index]];
      }
      return copy;
    };
    const selected = [...shuffled(preferred), ...shuffled(fallback)].slice(0, Math.min(input.limit, questions.length));
    const quizSession = await db.learningQuizSession.create({
      data: {
        userId: user.id,
        questionIds: selected.map((question) => question.id),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
    return NextResponse.json({ questions: selected.map(({ profile: _profile, ...question }) => question), quizSessionId: quizSession.id });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return jsonError("Pilihan kuis tidak valid.");
    if (isInvalidJson(error)) return jsonError("Format permintaan tidak valid.");
    return apiError(error);
  }
}
