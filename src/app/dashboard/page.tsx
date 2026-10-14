import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Award, BookOpenCheck, ChartNoAxesColumnIncreasing, CircleHelp, Compass, LockKeyhole, Sparkles, Target } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { learningStatus } from "@/lib/content";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import { ProfileSettings } from "@/components/ProfileSettings";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) return <div className="page-shell forced-password-page"><div className="forced-password-card"><span className="auth-icon"><LockKeyhole size={22} /></span><p className="eyebrow">TINDAKAN KEAMANAN DIPERLUKAN</p><h1>Ganti password awal.</h1><p>Akun administrator ini masih menggunakan password awal. Buat password baru untuk membuka dashboard dan fitur admin.</p><ProfileSettings displayName={user.displayName} profile={user.profile} mustChangePassword forceChangeOnly /></div></div>;
  let unavailable = false;
  let totalLessons = 0;
  let progress: Array<{ lesson: { slug: string; title: string; topic: string; order: number }; completedAt: Date }> = [];
  let lastOpened: { lesson: { slug: string; title: string }; viewedAt: Date } | null = null;
  let attempts: Array<{ score: number; correct: number; total: number; createdAt: Date }> = [];
  let attemptStats = { count: 0, average: 0, best: 0 };
  let topicResponses: Array<{ isCorrect: boolean; topicCopy: string }> = [];
  let attemptAggregate: { _count: { _all: number }; _avg: { score: number | null }; _max: { score: number | null } } = { _count: { _all: 0 }, _avg: { score: null }, _max: { score: null } };
  let responseRows: Array<{ isCorrect: boolean; topicCopy: string }> = [];
  let badges: Array<{ achievement: { title: string; description: string }; earnedAt: Date }> = [];
  let events: Array<{ slug: string; title: string; startAt: Date }> = [];
  try {
    [totalLessons, progress, attempts, badges, events, lastOpened, attemptAggregate, responseRows] = await Promise.all([
      db.lesson.count({ where: { status: "PUBLISHED" } }),
      db.lessonProgress.findMany({ where: { userId: user.id }, include: { lesson: { select: { slug: true, title: true, topic: true, order: true } } }, orderBy: { completedAt: "desc" } }),
      db.quizAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20, select: { score: true, correct: true, total: true, createdAt: true } }),
      db.userAchievement.findMany({ where: { userId: user.id }, include: { achievement: { select: { title: true, description: true } } }, orderBy: { earnedAt: "desc" } }),
      db.event.findMany({ where: { status: { in: ["ACTIVE", "SCHEDULED"] }, endAt: { gte: new Date() } }, orderBy: { startAt: "asc" }, take: 2, select: { slug: true, title: true, startAt: true } }),
      db.lessonView.findFirst({ where: { userId: user.id }, orderBy: { viewedAt: "desc" }, select: { viewedAt: true, lesson: { select: { slug: true, title: true } } } }),
      db.quizAttempt.aggregate({ where: { userId: user.id }, _count: { _all: true }, _avg: { score: true }, _max: { score: true } }),
      db.quizResponse.findMany({ where: { attempt: { userId: user.id } }, select: { isCorrect: true, topicCopy: true } })
    ]);
    attemptStats = { count: attemptAggregate._count._all, average: Math.round(attemptAggregate._avg.score ?? 0), best: Math.round(attemptAggregate._max.score ?? 0) };
    topicResponses = responseRows;
  } catch (error) { console.error("Dashboard query failed", error); unavailable = true; }
  const scoreAverage = attemptStats.average;
  const points = progress.length * 10 + attemptStats.count * 5;
  const activity: Record<string, { total: number; correct: number }> = {};
  for (const response of topicResponses) {
    const topic = activity[response.topicCopy] ?? { total: 0, correct: 0 };
    topic.total += 1;
    topic.correct += Number(response.isCorrect);
    activity[response.topicCopy] = topic;
  }
  const topics = Object.entries(activity).map(([name, item]) => ({ name, count: item.total, accuracy: Math.round(item.correct / item.total * 100) }));
  const lastAttempts = [...attempts].slice(0, 8).reverse();
  const lastLesson = progress[0]?.lesson;
  const recommendation = topics.find((item) => item.count >= 3 && item.accuracy < 70);
  return <div className="dashboard-shell">
    <section className="dashboard-welcome"><div><p className="eyebrow">RUANG BELAJARMU</p><h1>Halo, {user.displayName} <span className="wave">✦</span></h1><p>Perjalanan hebat dibangun dari langkah-langkah kecil yang konsisten.</p></div><Link className="button button-white" href={lastLesson ? `/materi/${lastLesson.slug}` : "/materi"}>{lastLesson ? "Lanjutkan belajar" : "Mulai belajar"} <ArrowRight size={16} /></Link></section>
    {unavailable && <DatabaseNotice />}
    <div className="dashboard-body"><div className="dashboard-primary">
      <section className="metric-grid"><article><span className="metric-icon blue"><Sparkles size={18} /></span><span>Poin belajar</span><b>{points}</b><small>{progress.length} materi · {attemptStats.count} percobaan</small></article><article><span className="metric-icon violet"><ChartNoAxesColumnIncreasing size={18} /></span><span>Rata-rata nilai</span><b>{attemptStats.count ? `${scoreAverage}%` : "—"}</b><small>{attemptStats.count ? "berdasarkan semua percobaan" : "belum ada percobaan"}</small></article><article><span className="metric-icon green"><BookOpenCheck size={18} /></span><span>Materi selesai</span><b>{progress.length}<small> / {totalLessons}</small></b><small>progres tersimpan</small></article><article><span className="metric-icon amber"><CircleHelp size={18} /></span><span>Kuis dikerjakan</span><b>{attemptStats.count}</b><small>semua percobaan tercatat</small></article></section>
      <section className="dashboard-card progress-card"><div className="card-heading"><div><p className="eyebrow">JEJAK PERKEMBANGAN</p><h2>Hasil latihanmu</h2></div><Link href="/kuis">Latihan lagi <ArrowRight size={15} /></Link></div>
        {attemptStats.count ? <><div className="score-chart" aria-label="Grafik nilai dari delapan percobaan terakhir">{lastAttempts.map((attempt, i) => <div key={`${attempt.createdAt.toISOString()}-${i}`} className="chart-col"><span style={{ height: `${Math.max(attempt.score, 5)}%` }} title={`Nilai ${Math.round(attempt.score)}`} /><small>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(attempt.createdAt)}</small></div>)}</div><div className="chart-legend"><span><i className="legend-dot" /> Nilai percobaan terakhir</span><b>Nilai terbaik: {attemptStats.best}%</b></div></> : <div className="dashboard-empty"><div className="empty-icon"><ChartNoAxesColumnIncreasing size={22} /></div><div><b>Grafikmu akan muncul setelah latihan pertama.</b><p>Mulai dari kuis singkat untuk membuat catatan perkembangan.</p></div><Link className="button button-outline button-small" href="/kuis">Mulai latihan</Link></div>}
      </section>
      <section className="dashboard-card topic-card"><div className="card-heading"><div><p className="eyebrow">DATA PEMAHAMAN</p><h2>Kompetensi per topik</h2></div><span className="small-muted">Butuh 3 jawaban untuk indikator</span></div>
        {topics.length ? <div className="topic-progress-list">{topics.map((item) => <div className="topic-progress" key={item.name}><div className="topic-progress-label"><b>{item.name}</b><span>{learningStatus(item.accuracy, item.count)}</span></div><div className="topic-progress-track"><i style={{ width: `${item.count >= 3 ? item.accuracy : 0}%` }} /></div><small>{item.count >= 3 ? `${item.accuracy}% ketepatan · ${item.count} jawaban` : `Data belum cukup · ${item.count} jawaban tercatat`}</small></div>)}</div> : <div className="dashboard-empty"><p>Kerjakan latihan pada beberapa topik. Status pemahaman ditampilkan setelah tersedia sedikitnya tiga jawaban terkait.</p><Link href="/materi" className="text-link">Jelajahi materi <ArrowRight size={15} /></Link></div>}
      </section>
      <section className="dashboard-card history-card"><div className="card-heading"><div><p className="eyebrow">AKTIVITAS TERBARU</p><h2>Riwayat belajar</h2></div></div>{attempts.length ? <div className="activity-list">{attempts.slice(0, 5).map((attempt) => <div className="activity-row" key={attempt.createdAt.toISOString()}><span className="activity-icon"><CircleHelp size={17} /></span><div><b>Kuis latihan</b><small>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(attempt.createdAt)} · {attempt.correct}/{attempt.total} benar</small></div><strong>{Math.round(attempt.score)}%</strong></div>)}</div> : <div className="empty-state compact"><p>Aktivitasmu akan tersimpan di sini setelah mengerjakan kuis atau menyelesaikan materi.</p></div>}</section>
    </div><aside className="dashboard-sidebar">
      <section className="dashboard-side-card continue-card"><div className="side-icon"><Compass size={20} /></div><p className="eyebrow">LANGKAH BERIKUTNYA</p><h2>{lastOpened ? "Lanjutkan perjalananmu." : "Mulai dari dasar."}</h2><p>{lastOpened ? `Materi terakhir dibuka: ${lastOpened.lesson.title}.` : lastLesson ? `Materi terakhir yang kamu selesaikan: ${lastLesson.title}.` : "Modul pertama mengenalkan cara berpikir terstruktur untuk memecahkan masalah."}</p><Link className="button button-primary" href={lastOpened ? `/materi/${lastOpened.lesson.slug}` : lastLesson ? "/materi" : "/materi/pengenalan-berpikir-komputasional"}>{lastOpened ? "Lanjutkan belajar" : lastLesson ? "Pilih materi berikutnya" : "Mulai modul 1"} <ArrowRight size={15} /></Link></section>
      <section className="dashboard-side-card recommendation-card"><div className="side-icon amber"><Target size={20} /></div><p className="eyebrow">REKOMENDASI</p><h2>{recommendation ? `Latih ${recommendation.name}` : "Terus eksplorasi"}</h2><p>{recommendation ? "Beberapa jawaban terakhir menunjukkan topik ini layak dilatih lagi. Coba materi dan latihan yang relevan." : "Pilih topik berbeda untuk membangun pemahaman yang lebih merata."}</p><Link href={recommendation ? `/kuis?topik=${encodeURIComponent(recommendation.name)}` : "/materi"} className="text-link">Jelajahi latihan <ArrowRight size={15} /></Link></section>
      <section className="dashboard-side-card achievements-card"><div className="card-heading"><div><p className="eyebrow">PENCAPAIAN</p><h2>Badge belajar</h2></div><Award size={19} /></div>{badges.length ? badges.map((badge) => <div className="badge-row" key={badge.achievement.title}><span><Award size={18} /></span><div><b>{badge.achievement.title}</b><small>{badge.achievement.description}</small></div></div>) : <p className="muted-text">Selesaikan materi untuk membuka pencapaian pertamamu.</p>}</section>
      {events.length > 0 && <section className="dashboard-side-card event-mini-card"><p className="eyebrow">ACARA & PENGUMUMAN</p>{events.map((event) => <Link key={event.slug} href={`/acara/${event.slug}`}><b>{event.title}</b><small>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(event.startAt)}</small></Link>)}</section>}
    </aside></div>
    <section className="profile-settings-section"><div><p className="eyebrow">PREFERENSI</p><h2>Pengaturan akun</h2><p>Ubah nama tampilan, mode belajar, atau password akun.</p></div><ProfileSettings displayName={user.displayName} profile={user.profile} mustChangePassword={user.mustChangePassword} /></section>
  </div>;
}
