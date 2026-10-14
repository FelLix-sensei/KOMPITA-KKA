import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { developer } from "@/lib/content";

export function SiteFooter({ appName = "KOMPITA", tagline = "Belajar logika, pecahkan masalah, bangun masa depan." }: { appName?: string; tagline?: string }) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <span className="brand-mark"><BrainCircuit size={22} /></span>
            <span><b>{appName}</b><small>BERPIKIR KOMPUTASIONAL</small></span>
          </Link>
          <p>{tagline}</p>
        </div>
        <div className="footer-links"><b>Jelajahi</b><Link href="/materi">Materi belajar</Link><Link href="/kuis">Kuis interaktif</Link><Link href="/panduan">Panduan penggunaan</Link></div>
        <div className="footer-links"><b>Informasi</b><Link href="/acara">Acara & pengumuman</Link><Link href="/tentang">Tentang KOMPITA</Link><Link href="/login">Masuk akun</Link></div>
      </div>
      <div className="developer-credit">
        <span>Dikembangkan oleh <strong>{developer.name}</strong></span>
        <span>Siswa Kelas {developer.className} — {developer.school}</span>
        <span>Media Pembelajaran Interaktif Berpikir Komputasional</span>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} KOMPITA</span><span>Belajar selangkah demi selangkah.</span></div>
    </footer>
  );
}
