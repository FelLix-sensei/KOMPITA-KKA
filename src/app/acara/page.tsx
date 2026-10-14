import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Megaphone } from "lucide-react";
import { db } from "@/lib/db";
import { DatabaseNotice } from "@/components/DatabaseNotice";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let events: Array<{ slug: string; title: string; description: string; category: string; location: string | null; startAt: Date; endAt: Date; status: string }> = [];
  let unavailable = false;
  try {
    events = await db.event.findMany({ where: { status: { in: ["ACTIVE", "SCHEDULED", "COMPLETED"] } }, orderBy: { startAt: "asc" } });
  } catch (error) { console.error("Event list query failed", error); unavailable = true; }
  return <div className="page-shell events-page"><header className="page-title-block"><p className="eyebrow"><Megaphone size={14} /> KABAR KOMPITA</p><h1>Acara & pengumuman.</h1><p>Tantangan dan kabar belajar yang dikelola langsung melalui panel admin.</p></header>{unavailable && <DatabaseNotice />}{events.length ? <div className="events-grid">{events.map((event) => <article className="event-card" key={event.slug}><div className="event-card-art"><span>{event.category}</span><CalendarDays size={35} /></div><div className="event-card-content"><span className={`event-status ${event.status.toLowerCase()}`}>{event.status === "ACTIVE" ? "Berlangsung" : event.status === "SCHEDULED" ? "Terjadwal" : "Selesai"}</span><h2><Link href={`/acara/${event.slug}`}>{event.title}</Link></h2><p>{event.description}</p><div className="event-card-meta"><span><CalendarDays size={14} />{new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(event.startAt)}</span>{event.location && <span><MapPin size={14} />{event.location}</span>}</div><Link className="text-link" href={`/acara/${event.slug}`}>Lihat detail <ArrowRight size={15} /></Link></div></article>)}</div> : !unavailable ? <div className="empty-state"><div className="empty-icon"><CalendarDays size={22} /></div><h2>Belum ada acara</h2><p>Pengumuman terbaru akan tampil di sini setelah dipublikasikan.</p></div> : null}</div>;
}
