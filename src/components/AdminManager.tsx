"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Database, FileText, HelpCircle, Megaphone, Palette, Search, ShieldCheck, Users } from "lucide-react";

type Resource = "lessons" | "questions" | "events" | "settings" | "users" | "audit";
type Row = Record<string, unknown>;
type ThemePreview = { appName: string; tagline: string; primaryColor: string; secondaryColor: string; backgroundColor: string };
const nav: Array<{ id: Resource; title: string; icon: typeof FileText }> = [
  { id: "lessons", title: "Materi", icon: FileText }, { id: "questions", title: "Bank soal", icon: HelpCircle },
  { id: "events", title: "Acara", icon: Megaphone }, { id: "users", title: "Pengguna", icon: Users },
  { id: "settings", title: "Tampilan", icon: Palette }, { id: "audit", title: "Audit log", icon: ShieldCheck }
];

const examples: Record<Exclude<Resource, "users" | "audit">, object> = {
  lessons: { slug: "materi-baru", title: "Judul materi", summary: "Ringkasan materi", topic: "Topik", content: { objectives: [], sections: [{ heading: "Penjelasan", body: "Isi materi" }], example: "", reflection: "", summary: "" }, order: 11, durationMin: 10, difficulty: "BEGINNER", status: "DRAFT" },
  questions: { prompt: "Tulis pertanyaan yang jelas", type: "SINGLE_CHOICE", options: ["Pilihan A", "Pilihan B"], answer: "Pilihan A", explanation: "Jelaskan alasan jawaban.", topic: "Dekomposisi", profile: "TEEN", difficulty: "BEGINNER", weight: 1, isActive: false },
  events: { slug: "acara-baru", title: "Judul acara", description: "Deskripsi acara", category: "Tantangan", location: "Online", startAt: "2026-11-01T09:00:00.000Z", endAt: "2026-11-01T10:00:00.000Z", status: "SCHEDULED" },
  settings: { key: "theme", value: { appName: "KOMPITA", tagline: "Belajar Logika, Pecahkan Masalah, Bangun Masa Depan.", primaryColor: "#2563EB", secondaryColor: "#163A70", backgroundColor: "#F5F8FF" } }
};

export function AdminManager() {
  const [active, setActive] = useState<Resource>("lessons");
  const [rows, setRows] = useState<Row[]>([]);
  const [json, setJson] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState<{ users: number; attempts: number; mean: number; lessons: number; events: number; mostViewed: Array<{ title?: string; viewCount: number }>; difficult: Array<{ prompt?: string; incorrectResponses: number }> }>({ users: 0, attempts: 0, mean: 0, lessons: 0, events: 0, mostViewed: [], difficult: [] });

  async function load(resource = active) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/${resource}${resource === "users" && query ? `?q=${encodeURIComponent(query)}` : ""}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Data tidak dapat dimuat.");
      setRows(result.data);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Data tidak dapat dimuat."); }
    finally { setBusy(false); }
  }
  useEffect(() => { void load(active); }, [active]);
  useEffect(() => {
    fetch("/api/admin/stats").then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setStats({ users: data.data.users, attempts: data.data.attempts, mean: data.data.averageScore, lessons: data.data.lessons, events: data.data.activeEvents, mostViewed: data.data.mostViewedLessons, difficult: data.data.difficultQuestions });
    }).catch((error) => setMessage(error instanceof Error ? error.message : "Statistik belum tersedia."));
  }, []);

  function selectRow(row: Row) {
    setSelectedId(String(row.id ?? row.key ?? ""));
    setJson(JSON.stringify(row, null, 2));
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const data = JSON.parse(json) as Row;
      const isCreate = !selectedId || active === "settings";
      const payload = isCreate ? data : { id: selectedId, data: Object.fromEntries(Object.entries(data).filter(([key]) => !["id", "createdAt", "updatedAt", "progress", "questions", "responses", "sessions", "quizAttempts", "achievements"].includes(key))) };
      const method = isCreate ? "POST" : "PATCH";
      const response = await fetch(`/api/admin/${active}`, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Perubahan tidak dapat disimpan.");
      setMessage("Perubahan berhasil disimpan.");
      setSelectedId(""); setJson(""); await load(active);
    } catch (error) { setMessage(error instanceof Error ? error.message : "JSON belum valid."); }
    finally { setBusy(false); }
  }
  async function archive(row: Row) {
    const id = String(row.id ?? "");
    if (!id || !window.confirm("Arsipkan atau nonaktifkan data ini? Riwayat terkait tetap dipertahankan.")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/${active}`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage("Data diarsipkan/nonaktifkan.");
      await load(active);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Tindakan gagal."); }
    finally { setBusy(false); }
  }
  const current = nav.find((item) => item.id === active)!;
  const Icon = current.icon;
  let themePreview: ThemePreview | null = null;
  if (active === "settings") {
    try {
      const parsed = JSON.parse(json) as { key?: string; value?: Record<string, unknown> };
      const value = parsed.value;
      if (parsed.key === "theme" && value && typeof value.appName === "string" && typeof value.tagline === "string"
        && [value.primaryColor, value.secondaryColor, value.backgroundColor].every((color) => typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color))) {
        themePreview = {
          appName: value.appName,
          tagline: value.tagline,
          primaryColor: value.primaryColor as string,
          secondaryColor: value.secondaryColor as string,
          backgroundColor: value.backgroundColor as string
        };
      }
    } catch {
      themePreview = null;
    }
  }
  return <div className="admin-shell">
    <aside className="admin-sidebar"><div className="admin-identity"><span className="brand-mark"><ShieldCheck size={20} /></span><div><b>Admin KOMPITA</b><small>PANEL PENGELOLAAN</small></div></div><nav aria-label="Menu administrasi">{nav.map((item) => { const ItemIcon = item.icon; return <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => { setActive(item.id); setJson(""); setSelectedId(""); setMessage(""); }}><ItemIcon size={18} />{item.title}</button>; })}</nav><div className="admin-sidebar-note"><Database size={17} /><span>Data tersimpan di PostgreSQL</span></div></aside>
    <div className="admin-main"><div className="admin-heading"><div><p className="eyebrow">KONTROL WEBSITE</p><h1>{current.title}</h1><p>Kelola konten KOMPITA tanpa mengubah source code.</p></div><span className="badge badge-blue">Akses administrator</span></div>
      <div className="admin-stats"><div><span>Total materi</span><b>{stats.lessons || "—"}</b></div><div><span>Pengguna terdaftar</span><b>{stats.users || "—"}</b></div><div><span>Percobaan kuis</span><b>{stats.attempts}</b></div><div><span>Rata-rata kuis</span><b>{stats.attempts ? `${stats.mean}%` : "—"}</b></div><div><span>Acara aktif</span><b>{stats.events}</b></div></div>
      <div className="admin-insights"><section><h2>Materi paling sering dibuka</h2>{stats.mostViewed.length ? stats.mostViewed.map((item, index) => <p key={`${item.title}-${index}`}><span>{item.title}</span><b>{item.viewCount}×</b></p>) : <small>Belum ada aktivitas membuka materi.</small>}</section><section><h2>Soal paling sering salah</h2>{stats.difficult.length ? stats.difficult.slice(0, 3).map((item, index) => <p key={`${item.prompt}-${index}`}><span>{item.prompt}</span><b>{item.incorrectResponses}×</b></p>) : <small>Belum ada jawaban salah yang tercatat.</small>}</section></div>
      <div className="admin-workspace"><section className="admin-list-card"><div className="admin-list-heading"><h2><Icon size={18} /> {current.title}</h2><button className="button button-quiet" onClick={() => { setSelectedId(""); setJson(JSON.stringify(examples[active as keyof typeof examples] ?? {}, null, 2)); }} disabled={active === "users" || active === "audit"}>+ Tambah</button></div>
        {active === "users" && <form className="admin-search" onSubmit={(e) => { e.preventDefault(); void load("users"); }}><input aria-label="Cari pengguna" placeholder="Cari username atau nama…" value={query} onChange={(e) => setQuery(e.target.value)} /><button aria-label="Cari"><Search size={16} /></button></form>}
        {busy && !rows.length ? <p className="muted-text">Memuat data…</p> : rows.length ? <div className="admin-record-list">{rows.map((row, index) => <div className="admin-record" key={String(row.id ?? row.key ?? index)}><button className="record-select" onClick={() => selectRow(row)}><b>{String(row.title ?? row.prompt ?? row.username ?? row.key ?? row.action ?? "Data")}</b><small>{String(row.topic ?? row.slug ?? row.displayName ?? row.objectType ?? row.status ?? "")}</small></button>{["lessons", "questions", "events"].includes(active) && <button className="record-archive" onClick={() => void archive(row)} title="Arsipkan/nonaktifkan">Arsip</button>}{active === "users" && row.role !== "ADMIN" && <button className="record-archive" onClick={() => void (async () => { const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: row.id, data: { isActive: !row.isActive } }) }); const result = await response.json(); setMessage(response.ok ? "Status akun diperbarui." : result.error); await load("users"); })()}>{row.isActive ? "Nonaktifkan" : "Aktifkan"}</button>}</div>)}</div> : <p className="muted-text">Belum ada data pada bagian ini.</p>}
      </section>
      <section className="admin-editor"><div className="admin-list-heading"><h2>{selectedId ? "Edit data" : "Editor konten"}</h2>{selectedId && <button className="text-button" onClick={() => { setSelectedId(""); setJson(""); }}>Batal edit</button>}</div>
        {active === "audit" || active === "users" ? <div className="admin-help"><ShieldCheck size={20} /><p>{active === "audit" ? "Riwayat perubahan menampilkan aktor, tindakan, objek, dan waktu tanpa mencatat password." : "Pilih pengguna di daftar untuk melihat detail aman. Status akun dapat diubah dari daftar."}</p></div> :
          <form onSubmit={save}><label className="json-label">Dokumen JSON{active === "settings" && <small>Gunakan key `theme` dan sesuaikan appName, tagline, primaryColor, secondaryColor, dan backgroundColor. Pratinjau di bawah berubah sebelum disimpan.</small>}<textarea rows={20} spellCheck={false} value={json} onChange={(event) => setJson(event.target.value)} placeholder="Pilih data untuk diedit atau klik + Tambah, lalu isi JSON yang valid." /></label>{themePreview && <div className="theme-preview" style={{ background: themePreview.backgroundColor, borderColor: themePreview.primaryColor }}><span style={{ color: themePreview.secondaryColor }}>{themePreview.appName}</span><p style={{ color: themePreview.secondaryColor }}>{themePreview.tagline}</p><button type="button" style={{ background: themePreview.primaryColor }}>Pratinjau tombol</button></div>}<button className="button button-primary" disabled={!json || busy}>Simpan perubahan</button></form>}
        {message && <p role="status" className="form-note">{message}</p>}
      </section></div>
    </div>
  </div>;
}
