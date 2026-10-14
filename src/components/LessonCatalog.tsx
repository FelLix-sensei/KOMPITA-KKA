"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Search } from "lucide-react";

type Lesson = { slug: string; title: string; summary: string; topic: string; durationMin: number; difficulty: string };

export function LessonCatalog({ lessons, completedSlugs = [] }: { lessons: Lesson[]; completedSlugs?: string[] }) {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("Semua topik");
  const [difficulty, setDifficulty] = useState("Semua tingkat");
  const topics = useMemo(() => ["Semua topik", ...new Set(lessons.map((lesson) => lesson.topic))], [lessons]);
  const filtered = lessons.filter((lesson) => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return (!query || `${lesson.title} ${lesson.summary} ${lesson.topic}`.toLocaleLowerCase("id-ID").includes(query))
      && (topic === "Semua topik" || lesson.topic === topic)
      && (difficulty === "Semua tingkat" || lesson.difficulty === difficulty);
  });
  return <>
    <div className="catalog-toolbar">
      <div><span className="catalog-count">{filtered.length}</span> modul pembelajaran</div>
      <div className="catalog-filters">
        <label className="search-box"><Search size={17} /><input type="search" placeholder="Cari materi…" aria-label="Cari materi" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <label className="filter-select"><span className="sr-only">Filter topik</span><select value={topic} onChange={(event) => setTopic(event.target.value)}>{topics.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="filter-select"><span className="sr-only">Filter tingkat kesulitan</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Semua tingkat</option><option value="BEGINNER">Dasar</option><option value="INTERMEDIATE">Menengah</option><option value="ADVANCED">Lanjutan</option></select></label>
      </div>
    </div>
    {filtered.length ? <div className="catalog-grid">{filtered.map((lesson, i) => {
      const done = completedSlugs.includes(lesson.slug);
      return <article className={`catalog-card ${done ? "catalog-completed" : ""}`} key={lesson.slug}><div className="catalog-card-top"><span className="module-number">MODUL {String(i + 1).padStart(2, "0")}</span><span className={`difficulty-pill ${lesson.difficulty.toLowerCase()}`}>{lesson.difficulty === "BEGINNER" ? "Dasar" : lesson.difficulty === "ADVANCED" ? "Lanjutan" : "Menengah"}</span></div>{done && <span className="completed-label"><CheckCircle2 size={13} /> Selesai</span>}<span className="lesson-topic">{lesson.topic}</span><h2><Link href={`/materi/${lesson.slug}`}>{lesson.title}</Link></h2><p>{lesson.summary}</p><div className="catalog-card-bottom"><span><Clock3 size={15} /> {lesson.durationMin} menit</span><Link aria-label={`${done ? "Buka kembali" : "Mulai"} ${lesson.title}`} href={`/materi/${lesson.slug}`}><ArrowRight size={18} /></Link></div></article>;
    })}</div> : <div className="empty-state"><h2>Materi tidak ditemukan</h2><p>Coba kata pencarian atau filter yang berbeda.</p><button className="button button-outline" onClick={() => { setSearch(""); setTopic("Semua topik"); setDifficulty("Semua tingkat"); }}>Hapus filter</button></div>}
  </>;
}
