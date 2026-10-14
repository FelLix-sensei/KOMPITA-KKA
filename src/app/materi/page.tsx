import { BookOpenCheck } from "lucide-react";
import { db } from "@/lib/db";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import { LessonCatalog } from "@/components/LessonCatalog";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  let lessons: Array<{ slug: string; title: string; summary: string; topic: string; durationMin: number; difficulty: string }> = [];
  let completedSlugs: string[] = [];
  let unavailable = false;
  try {
    lessons = await db.lesson.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { slug: true, title: true, summary: true, topic: true, durationMin: true, difficulty: true } });
    const user = await getCurrentUser();
    if (user) {
      const progress = await db.lessonProgress.findMany({ where: { userId: user.id }, select: { lesson: { select: { slug: true } } } });
      completedSlugs = progress.map((item) => item.lesson.slug);
    }
  } catch (error) { console.error("Lesson catalog failed", error); unavailable = true; }
  return <div className="page-shell">
    <section className="page-hero lesson-hero"><div><p className="eyebrow"><BookOpenCheck size={14} /> RUANG BELAJAR</p><h1>Temukan cara baru<br /><span>menyelesaikan masalah.</span></h1><p>Mulai dari konsep paling dasar, lanjutkan dengan contoh, lalu uji pemahamanmu.</p></div><div className="page-hero-art"><span>01</span><div className="mini-flow"><i /><i /><i /><i /></div><b>Belajar runtut.<br />Berpikir merdeka.</b></div></section>
    {unavailable && <DatabaseNotice />}
    {lessons.length ? <LessonCatalog lessons={lessons} completedSlugs={completedSlugs} /> : !unavailable ? <div className="empty-state"><h2>Materi segera hadir</h2><p>Hubungkan database dan jalankan seed untuk menambahkan modul pembelajaran.</p></div> : null}
  </div>;
}
