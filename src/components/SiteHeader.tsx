import Link from "next/link";
import { ArrowUpRight, BrainCircuit } from "lucide-react";
import type { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./UserActions";

type User = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export function SiteHeader({ user, appName = "KOMPITA" }: { user: User | null; appName?: string }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="KOMPITA, beranda">
          <span className="brand-mark"><BrainCircuit size={23} strokeWidth={2.2} /></span>
          <span><b>{appName}</b><small>BERPIKIR KOMPUTASIONAL</small></span>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          <Link href="/">Beranda</Link>
          <Link href="/materi">Materi</Link>
          <Link href="/kuis">Kuis</Link>
          <Link href="/acara">Acara</Link>
          <Link href="/panduan">Panduan</Link>
          <Link href="/tentang">Tentang</Link>
        </nav>
        <div className="header-actions">
          {user ? <>
            {user.role === "ADMIN" && <Link className="header-admin" href="/admin">Admin</Link>}
            <Link className="button button-small button-primary" href="/dashboard">Dashboard <ArrowUpRight size={15} /></Link>
            <LogoutButton />
          </> : <>
            <Link className="header-login" href="/login">Masuk</Link>
            <Link className="button button-small button-primary" href="/register">Daftar gratis <ArrowUpRight size={15} /></Link>
          </>}
        </div>
      </div>
    </header>
  );
}
