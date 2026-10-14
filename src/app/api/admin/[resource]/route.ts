import { requireAdmin } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { apiError, isInvalidJson, jsonError, verifyRequestOrigin } from "@/lib/http";
import { NextResponse } from "next/server";
import { z } from "zod";

const resourceSchema = z.enum(["lessons", "questions", "events", "settings", "users", "audit", "stats"]);

async function logAction(actorId: string, action: string, objectType: string, objectId: string | null, details?: unknown) {
  await db.adminAuditLog.create({
    data: { actorId, action, objectType, objectId, details: details === undefined ? undefined : details as Prisma.InputJsonValue }
  });
}

function luminance(hex: string) {
  const channels = hex.slice(1).match(/.{2}/g)?.map((value) => parseInt(value, 16) / 255) ?? [];
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

function contrastRatio(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function validQuestionAnswer(type: string, options: string[], answer: unknown) {
  if (type === "SINGLE_CHOICE" || type === "TRUE_FALSE") return typeof answer === "string" && options.includes(answer);
  if (type === "MULTIPLE_CHOICE") {
    return Array.isArray(answer) && answer.length > 0 && answer.every((item) => typeof item === "string" && options.includes(item))
      && new Set(answer).size === answer.length;
  }
  if (type === "SHORT_ANSWER") {
    const accepted = typeof answer === "string" ? [answer] : answer;
    return Array.isArray(accepted) && accepted.length > 0 && accepted.every((item) => typeof item === "string" && item.trim().length > 0);
  }
  return false;
}

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await requireAdmin();
    const { resource: raw } = await context.params;
    const parsed = resourceSchema.safeParse(raw);
    if (!parsed.success) return jsonError("Jenis data tidak dikenal.", 404);
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("q")?.slice(0, 80);
    if (parsed.data === "stats") {
      const [users, attempts, lessons, events, failedByQuestion, viewedLessons] = await Promise.all([
        db.user.count({ where: { role: "USER" } }),
        db.quizAttempt.aggregate({ _count: { _all: true }, _avg: { score: true } }),
        db.lesson.count(),
        db.event.count({ where: { status: { in: ["ACTIVE", "SCHEDULED"] }, endAt: { gte: new Date() } } }),
        db.quizResponse.groupBy({ by: ["questionId"], where: { isCorrect: false }, _count: { _all: true }, orderBy: { _count: { questionId: "desc" } }, take: 5 }),
        db.lessonView.groupBy({ by: ["lessonId"], _count: { _all: true }, orderBy: { _count: { lessonId: "desc" } }, take: 5 })
      ]);
      const [failedQuestions, viewedLessonRecords] = await Promise.all([
        db.quizQuestion.findMany({ where: { id: { in: failedByQuestion.map((item) => item.questionId) } }, select: { id: true, prompt: true, topic: true } }),
        db.lesson.findMany({ where: { id: { in: viewedLessons.map((item) => item.lessonId) } }, select: { id: true, title: true, topic: true } })
      ]);
      const promptById = new Map(failedQuestions.map((item) => [item.id, item]));
      const lessonById = new Map(viewedLessonRecords.map((item) => [item.id, item]));
      return NextResponse.json({
        data: {
          users, attempts: attempts._count._all, averageScore: Math.round(attempts._avg.score ?? 0),
          lessons, activeEvents: events,
          difficultQuestions: failedByQuestion.map((item) => ({ ...promptById.get(item.questionId), incorrectResponses: item._count._all })),
          mostViewedLessons: viewedLessons.map((item) => ({ ...lessonById.get(item.lessonId), viewCount: item._count._all }))
        }
      });
    }
    const data = parsed.data === "lessons"
      ? await db.lesson.findMany({ orderBy: { order: "asc" } })
      : parsed.data === "questions"
      ? await db.quizQuestion.findMany({ orderBy: [{ topic: "asc" }, { createdAt: "desc" }], take: 250 })
      : parsed.data === "events"
      ? await db.event.findMany({ orderBy: { startAt: "desc" }, take: 100 })
      : parsed.data === "settings"
      ? await db.siteSetting.findMany({ where: { key: { not: "_internal_seed_v1" } }, orderBy: { key: "asc" } })
      : parsed.data === "users"
      ? await db.user.findMany({
          where: term ? { OR: [{ username: { contains: term, mode: "insensitive" } }, { displayName: { contains: term, mode: "insensitive" } }] } : undefined,
          select: { id: true, username: true, displayName: true, role: true, isActive: true, profile: true, createdAt: true },
          orderBy: { createdAt: "desc" }, take: 100
        })
      : await db.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  try {
    const admin = await requireAdmin();
    const { resource: raw } = await context.params;
    const resource = resourceSchema.parse(raw);
    const body = await request.json();
    if (resource === "lessons") {
      const input = z.object({
        slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
        title: z.string().min(3).max(160),
        summary: z.string().min(5).max(300),
        topic: z.string().min(2).max(60),
        content: z.record(z.string(), z.unknown()),
        order: z.number().int().min(0).default(0),
        durationMin: z.number().int().min(1).max(300).default(10),
        difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT")
      }).parse(body);
      const created = await db.lesson.create({
        data: {
          slug: input.slug, title: input.title, summary: input.summary, topic: input.topic,
          content: input.content as Prisma.InputJsonValue, order: input.order, durationMin: input.durationMin,
          difficulty: input.difficulty, status: input.status
        }
      });
      await logAction(admin.id, "CREATE", "lesson", created.id, { slug: created.slug });
      return NextResponse.json({ data: created }, { status: 201 });
    }
    if (resource === "questions") {
      const input = z.object({
        prompt: z.string().min(5).max(3000),
        type: z.enum(["SINGLE_CHOICE", "TRUE_FALSE", "MULTIPLE_CHOICE", "SHORT_ANSWER"]),
        options: z.array(z.string().trim().min(1).max(300)).max(20),
        answer: z.unknown().refine((value) => value !== null && value !== undefined, "Jawaban benar wajib diisi."),
        explanation: z.string().min(3).max(3000),
        topic: z.string().min(2).max(60),
        profile: z.enum(["CHILD", "TEEN", "ADULT"]).default("TEEN"),
        difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
        weight: z.number().int().min(1).max(100).default(1),
        isActive: z.boolean().default(false)
      }).parse(body);
      if (!validQuestionAnswer(input.type, input.options, input.answer)) return jsonError("Kunci jawaban harus sesuai dengan jenis soal dan pilihan yang tersedia.");
      const created = await db.quizQuestion.create({
        data: {
          prompt: input.prompt, type: input.type, options: input.options,
          answer: input.answer as Prisma.InputJsonValue, explanation: input.explanation, topic: input.topic,
          profile: input.profile, difficulty: input.difficulty, weight: input.weight, isActive: input.isActive
        }
      });
      await logAction(admin.id, "CREATE", "quiz_question", created.id, { topic: created.topic });
      return NextResponse.json({ data: created }, { status: 201 });
    }
    if (resource === "events") {
      const input = z.object({
        slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
        title: z.string().min(3).max(160),
        description: z.string().min(10).max(10000),
        category: z.string().min(2).max(60),
        imageUrl: z.string().url().max(500).nullable().optional(),
        location: z.string().max(160).nullable().optional(),
        startAt: z.coerce.date(),
        endAt: z.coerce.date(),
        status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE", "COMPLETED", "ARCHIVED"]).default("DRAFT")
      }).refine((value) => value.endAt >= value.startAt, { message: "Tanggal akhir harus setelah tanggal mulai." }).parse(body);
      const created = await db.event.create({ data: input });
      await logAction(admin.id, "CREATE", "event", created.id, { slug: created.slug });
      return NextResponse.json({ data: created }, { status: 201 });
    }
    if (resource === "settings") {
      const input = z.object({ key: z.string().min(2).max(80), value: z.unknown() }).parse(body);
      let value = input.value;
      if (input.key === "theme") {
        const theme = z.object({
          appName: z.string().trim().min(2).max(40),
          tagline: z.string().trim().min(4).max(120),
          primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/)
        }).parse(value);
        if (contrastRatio(theme.primaryColor, "#FFFFFF") < 4.5 || contrastRatio(theme.secondaryColor, "#FFFFFF") < 4.5 || contrastRatio(theme.backgroundColor, "#172033") < 4.5) {
          return jsonError("Warna tema tidak memenuhi kontras minimum untuk teks yang terbaca.");
        }
        value = theme;
      }
      const saved = await db.siteSetting.upsert({
        where: { key: input.key },
        update: { value: value as Prisma.InputJsonValue, updatedBy: admin.id },
        create: { key: input.key, value: value as Prisma.InputJsonValue, updatedBy: admin.id }
      });
      await logAction(admin.id, "UPDATE", "site_setting", saved.key);
      return NextResponse.json({ data: saved });
    }
    return jsonError("Jenis data ini tidak menerima pembuatan melalui endpoint.", 405);
  } catch (error) {
    if (error instanceof Error && "issues" in error) return jsonError("Data belum valid atau slug sudah digunakan.");
    if (isInvalidJson(error)) return jsonError("Format permintaan tidak valid.");
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  try {
    const admin = await requireAdmin();
    const resource = resourceSchema.parse((await context.params).resource);
    const body = z.object({ id: z.string().min(1), data: z.record(z.string(), z.unknown()) }).parse(await request.json());
    if (resource === "users") {
      const allowed = z.object({ isActive: z.boolean().optional(), displayName: z.string().trim().min(2).max(80).optional() }).parse(body.data);
      const updated = await db.user.update({ where: { id: body.id }, data: allowed, select: { id: true, username: true, displayName: true, role: true, isActive: true } });
      await logAction(admin.id, "UPDATE", "user", updated.id, allowed);
      return NextResponse.json({ data: updated });
    }
    if (resource === "lessons") {
      const allowed = z.object({
        title: z.string().min(3).max(160).optional(), summary: z.string().min(5).max(300).optional(),
        topic: z.string().min(2).max(60).optional(), content: z.record(z.string(), z.unknown()).optional(),
        order: z.number().int().min(0).optional(), durationMin: z.number().int().min(1).max(300).optional(),
        difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional()
      }).parse(body.data);
      const { content, ...lessonFields } = allowed;
      const updated = await db.lesson.update({
        where: { id: body.id },
        data: { ...lessonFields, ...(content === undefined ? {} : { content: content as Prisma.InputJsonValue }) }
      });
      await logAction(admin.id, "UPDATE", "lesson", body.id, { status: allowed.status });
      return NextResponse.json({ data: updated });
    }
    if (resource === "questions") {
      const allowed = z.object({
        prompt: z.string().min(5).max(3000).optional(), type: z.enum(["SINGLE_CHOICE", "TRUE_FALSE", "MULTIPLE_CHOICE", "SHORT_ANSWER"]).optional(),
        options: z.array(z.string().trim().min(1).max(300)).max(20).optional(), answer: z.unknown().refine((value) => value !== null && value !== undefined).optional(),
        explanation: z.string().min(3).max(3000).optional(), topic: z.string().min(2).max(60).optional(),
        profile: z.enum(["CHILD", "TEEN", "ADULT"]).optional(), difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
        weight: z.number().int().min(1).max(100).optional(), isActive: z.boolean().optional()
      }).parse(body.data);
      if (allowed.type !== undefined || allowed.options !== undefined || allowed.answer !== undefined) {
        const existing = await db.quizQuestion.findUnique({ where: { id: body.id }, select: { type: true, options: true, answer: true } });
        if (!existing) return jsonError("Soal tidak ditemukan.", 404);
        const type = allowed.type ?? existing.type;
        const options = allowed.options ?? (Array.isArray(existing.options) ? existing.options.map(String) : []);
        const answer = allowed.answer ?? existing.answer;
        if (!validQuestionAnswer(type, options, answer)) return jsonError("Kunci jawaban harus sesuai dengan jenis soal dan pilihan yang tersedia.");
      }
      const updated = await db.quizQuestion.update({
        where: { id: body.id },
        data: { ...allowed, ...(allowed.answer === undefined ? {} : { answer: allowed.answer as Prisma.InputJsonValue }) }
      });
      await logAction(admin.id, "UPDATE", "quiz_question", body.id, { topic: allowed.topic, isActive: allowed.isActive });
      return NextResponse.json({ data: updated });
    }
    if (resource === "events") {
      const allowed = z.object({
        title: z.string().min(3).max(160).optional(), description: z.string().min(10).max(10000).optional(),
        category: z.string().min(2).max(60).optional(), location: z.string().max(160).nullable().optional(),
        startAt: z.coerce.date().optional(), endAt: z.coerce.date().optional(),
        status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional()
      }).parse(body.data);
      const updated = await db.event.update({ where: { id: body.id }, data: allowed });
      await logAction(admin.id, "UPDATE", "event", body.id, { status: allowed.status });
      return NextResponse.json({ data: updated });
    }
    return jsonError("Perubahan tidak didukung untuk jenis data ini.", 405);
  } catch (error) {
    if (error instanceof Error && "issues" in error) return jsonError("Perubahan belum valid.");
    if (isInvalidJson(error)) return jsonError("Format permintaan tidak valid.");
    return apiError(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!verifyRequestOrigin(request)) return jsonError("Permintaan tidak valid.", 403);
  try {
    const admin = await requireAdmin();
    const resource = resourceSchema.parse((await context.params).resource);
    const { id } = z.object({ id: z.string().min(1) }).parse(await request.json());
    if (resource === "lessons") {
      const result = await db.lesson.update({ where: { id }, data: { status: "ARCHIVED" }, select: { id: true } });
      await logAction(admin.id, "ARCHIVE", "lesson", id);
      return NextResponse.json({ data: result });
    }
    if (resource === "questions") {
      const result = await db.quizQuestion.update({ where: { id }, data: { isActive: false }, select: { id: true } });
      await logAction(admin.id, "DISABLE", "quiz_question", id);
      return NextResponse.json({ data: result });
    }
    if (resource === "events") {
      const result = await db.event.update({ where: { id }, data: { status: "ARCHIVED" }, select: { id: true } });
      await logAction(admin.id, "ARCHIVE", "event", id);
      return NextResponse.json({ data: result });
    }
    return jsonError("Penghapusan tidak didukung untuk jenis data ini.", 405);
  } catch (error) {
    if (error instanceof Error && "issues" in error) return jsonError("Permintaan tidak valid.");
    if (isInvalidJson(error)) return jsonError("Format permintaan tidak valid.");
    return apiError(error);
  }
}
