import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompleteLessonButton, RecordLessonView } from "@/components/UserActions";
import { DatabaseNotice } from "@/components/DatabaseNotice";

export const dynamic = "force-dynamic";
type Content = { objectives?: string[]; sections?: Array<{ heading: string; body: string }>; example?: string; reflection?: string; summary?: string };

export default async function LessonDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  let lesson: Awaited<ReturnType<typeof db.lesson.findUnique>> = null;
  let progress = false;
  try {
    lesson = await db.lesson.findFirst({ where: { slug, status: "PUBLISHED" } });
    if (lesson && user) progress = Boolean(await db.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } }));
  } catch (error) { console.error("Lesson detail query failed", error); return <div className="page-shell"><DatabaseNotice /></div>; }
  if (!lesson) notFound();
  const content = lesson.content as Content;
  const profileMessage = user?.profile === "CHILD"
    ? "Mode Anak · Pecahkan masalah ini satu langkah kecil demi satu langkah. Setiap ide adalah awal yang bagus."
    : user?.profile === "ADULT"
    ? "Mode Dewasa · Perhatikan batasan, pilihan alternatif, dan alasan di balik setiap keputusan."
    : "Mode Remaja · Hubungkan konsep dengan kegiatan sekolah dan tantangan sehari-hari.";
  const nextLesson = lesson.nextLessonSlug ? await db.lesson.findFirst({ where: { slug: lesson.nextLessonSlug, status: "PUBLISHED" }, select: { slug: true, title: true } }) : null;
  return <article className="lesson-detail page-shell"><RecordLessonView slug={lesson.slug} enabled={Boolean(user)} />
    <Link href="/materi" className="back-link"><ArrowLeft size={16} /> Semua materi</Link>
    <header className="lesson-detail-header"><span className="eyebrow">MODUL {String(lesson.order).padStart(2, "0")} · {lesson.topic}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p><div className="lesson-meta"><span>{lesson.durationMin} menit</span><span>{lesson.difficulty === "BEGINNER" ? "Tingkat dasar" : lesson.difficulty === "ADVANCED" ? "Tingkat lanjut" : "Tingkat menengah"}</span></div></header>
    <div className="lesson-content-layout"><div className="lesson-body">
      <section className="objectives-card"><h2><ListChecks size={20} /> Tujuan pembelajaran</h2><ul>{(content.objectives ?? []).map((goal) => <li key={goal}>{goal}</li>)}</ul></section>
      <section className="learning-mode-card"><span>MODE BELAJAR</span><p>{profileMessage}</p><small>Soal latihan juga memprioritaskan contoh yang ditandai sesuai profil akunmu.</small></section>
      {(content.sections ?? []).map((section, index) => <section className="lesson-section" key={section.heading}><span className="section-number">{String(index + 1).padStart(2, "0")}</span><div><h2>{section.heading}</h2><p>{section.body}</p></div></section>)}
      {content.example && <section className="example-card"><div><Lightbulb size={20} /><b>Contoh dalam keseharian</b></div><p>{content.example}</p></section>}
      {content.summary && <section className="summary-card"><h2><CheckCircle2 size={20} /> Ringkasan</h2><p>{content.summary}</p></section>}
      {content.reflection && <section className="reflection-card"><span>COBA RENUNGKAN</span><p>{content.reflection}</p></section>}
      <section className="lesson-end-card"><h2>Saatnya coba latihan.</h2><p>Gunakan latihan topik ini untuk memeriksa pemahaman. Pembahasan muncul setelah kamu mengirim jawaban.</p><Link className="button button-outline" href={`/kuis?topik=${encodeURIComponent(lesson.topic)}`}>Latihan topik <ArrowRight size={16} /></Link></section>
      <div className="lesson-next-row">{user ? <CompleteLessonButton slug={lesson.slug} completed={progress} /> : <Link href="/login" className="button button-primary">Masuk untuk menyimpan progres</Link>}{nextLesson && <Link className="next-lesson-link" href={`/materi/${nextLesson.slug}`}><span>MODUL BERIKUTNYA</span><b>{nextLesson.title} <ArrowRight size={15} /></b></Link>}</div>
    </div><aside className="lesson-aside"><div><span>SEDANG DIPELAJARI</span><b>{lesson.title}</b><p>Luangkan waktu untuk memahami contoh sebelum lanjut ke latihan.</p></div><Link href="/panduan">Butuh bantuan belajar? <ArrowRight size={14} /></Link></aside></div>
  </article>;
}
