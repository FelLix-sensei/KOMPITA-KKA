import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, isInvalidJson, jsonError, verifyRequestOrigin } from "@/lib/http";
import { hasExactQuestionSet, isCorrectAnswer } from "@/lib/validation";
import { NextResponse } from "next/server";
import { z } from "zod";

const submissionSchema = z.object({
  quizSessionId: z.string().min(1),
  responses: z.array(z.object({ questionId: z.string().min(1), answer: z.unknown().refine((answer) => answer !== undefined) })).min(1).max(25)
});

function toReview(attempt: {
  id: string;
  score: number;
  correct: number;
  total: number;
  durationSec: number | null;
  responses: Array<{
    questionId: string;
    promptCopy: string;
    topicCopy: string;
    submitted: Prisma.JsonValue;
    isCorrect: boolean;
    answerCopy: Prisma.JsonValue;
    explanationCopy: string;
    question: { topic: string };
  }>;
}) {
  return {
    attemptId: attempt.id,
    score: attempt.score,
    correct: attempt.correct,
    total: attempt.total,
    durationSec: attempt.durationSec ?? 0,
    review: attempt.responses.map((response) => ({
      questionId: response.questionId,
      prompt: response.promptCopy,
      topic: response.topicCopy,
      submitted: response.submitted,
      correct: response.isCorrect,
      answer: response.answerCopy,
      explanation: response.explanationCopy
    }))
  };
}

export async function POST(request: Request) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  let userId: string | undefined;
  let quizSessionId: string | undefined;
  try {
    const user = await requireUser();
    userId = user.id;
    const input = submissionSchema.parse(await request.json());
    quizSessionId = input.quizSessionId;
    const existing = await db.quizAttempt.findUnique({
      where: { quizSessionId },
      include: { responses: { include: { question: { select: { topic: true } } } } }
    });
    if (existing) {
      if (existing.userId !== user.id) return jsonError("Sesi kuis tidak valid.", 403);
      return NextResponse.json(toReview(existing));
    }

    const session = await db.learningQuizSession.findFirst({
      where: { id: quizSessionId, userId: user.id, consumedAt: null, expiresAt: { gt: new Date() } }
    });
    if (!session || !Array.isArray(session.questionIds)) return jsonError("Sesi kuis telah berakhir atau tidak ditemukan.", 409);
    const expectedIds = session.questionIds.map(String);
    const submittedAnswers = new Map(input.responses.map((response) => [response.questionId, response.answer]));
    if (submittedAnswers.size !== input.responses.length || !hasExactQuestionSet(expectedIds, input.responses.map((response) => response.questionId))) {
      return jsonError("Jawaban harus dikirim tepat satu kali untuk setiap soal dalam sesi ini.");
    }
    const questions = await db.quizQuestion.findMany({
      where: { id: { in: expectedIds }, isActive: true },
      select: { id: true, prompt: true, type: true, answer: true, explanation: true, topic: true, weight: true }
    });
    if (questions.length !== expectedIds.length) return jsonError("Sebagian soal sudah tidak tersedia.", 409);
    const questionsById = new Map(questions.map((question) => [question.id, question]));
    const orderedQuestions = expectedIds.flatMap((id) => {
      const question = questionsById.get(id);
      return question ? [question] : [];
    });
    if (orderedQuestions.length !== expectedIds.length) return jsonError("Urutan soal sesi tidak valid.", 409);
    const evaluated = orderedQuestions.map((question) => {
      const submitted = submittedAnswers.get(question.id);
      const correct = isCorrectAnswer(question.type, submitted, question.answer);
      return { question, submitted, correct, earned: correct ? question.weight : 0 };
    });
    const totalWeight = questions.reduce((sum, question) => sum + question.weight, 0);
    const score = totalWeight ? Math.round(evaluated.reduce((sum, item) => sum + item.earned, 0) / totalWeight * 100) : 0;
    const durationSec = Math.max(0, Math.min(24 * 60 * 60, Math.round((Date.now() - session.startedAt.getTime()) / 1000)));
    const attempt = await db.$transaction(async (tx) => {
      const consumed = await tx.learningQuizSession.updateMany({
        where: { id: session.id, userId: user.id, consumedAt: null, expiresAt: { gt: new Date() } },
        data: { consumedAt: new Date() }
      });
      if (consumed.count !== 1) throw new Error("QUIZ_SESSION_ALREADY_USED");
      return tx.quizAttempt.create({
        data: {
          userId: user.id,
          quizSessionId: session.id,
          score,
          correct: evaluated.filter((item) => item.correct).length,
          total: evaluated.length,
          durationSec,
          responses: {
            create: evaluated.map((item) => ({
              questionId: item.question.id,
              submitted: item.submitted === null ? Prisma.JsonNull : item.submitted as Prisma.InputJsonValue,
              isCorrect: item.correct,
              earned: item.earned,
              promptCopy: item.question.prompt,
              topicCopy: item.question.topic,
              answerCopy: item.question.answer as Prisma.InputJsonValue,
              explanationCopy: item.question.explanation
            }))
          }
        },
        include: { responses: { include: { question: { select: { topic: true } } } } }
      });
    });
    return NextResponse.json(toReview(attempt));
  } catch (error) {
    if (error instanceof Error && "issues" in error) return jsonError("Format jawaban tidak valid.");
    if (isInvalidJson(error)) return jsonError("Format permintaan tidak valid.");
    const uniqueConflict = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
    const usedSession = error instanceof Error && error.message === "QUIZ_SESSION_ALREADY_USED";
    if ((uniqueConflict || usedSession) && userId && quizSessionId) {
      const previous = await db.quizAttempt.findUnique({
        where: { quizSessionId },
        include: { responses: { include: { question: { select: { topic: true } } } } }
      });
      if (previous?.userId === userId) return NextResponse.json(toReview(previous));
    }
    return apiError(error);
  }
}
