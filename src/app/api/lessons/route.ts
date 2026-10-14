import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const lessons = await db.lesson.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { id: true, slug: true, title: true, summary: true, topic: true, order: true, durationMin: true, difficulty: true }
    });
    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("Lessons query failed", error);
    return NextResponse.json({ error: "Materi belum dapat dimuat. Pastikan database telah dikonfigurasi dan di-seed." }, { status: 503 });
  }
}
