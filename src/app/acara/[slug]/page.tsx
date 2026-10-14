import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Megaphone } from "lucide-react";
import { db } from "@/lib/db";
import { DatabaseNotice } from "@/components/DatabaseNotice";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let event;
  try { event = await db.event.findFirst({ where: { slug, status: { in: ["ACTIVE", "SCHEDULED", "COMPLETED"] } } }); }
  catch (error) { console.error("Event detail query failed", error); return <div className="page-shell"><DatabaseNotice /></div>; }
  if (!event) notFound();
  return <article className="page-shell event-detail"><Link href="/acara" className="back-link"><ArrowLeft size={16} /> Semua acara</Link><div className="event-detail-banner"><Megaphone size={38} /><span>{event.category}</span></div><div className="event-detail-content"><span className={`event-status ${event.status.toLowerCase()}`}>{event.status === "ACTIVE" ? "Berlangsung" : event.status === "SCHEDULED" ? "Terjadwal" : "Selesai"}</span><h1>{event.title}</h1><p className="event-detail-description">{event.description}</p><div className="event-detail-info"><span><CalendarDays size={17} /><span><b>Waktu</b>{new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(event.startAt)} – {new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short" }).format(event.endAt)}</span></span>{event.location && <span><MapPin size={17} /><span><b>Lokasi / informasi</b>{event.location}</span></span>}</div></div></article>;
}
