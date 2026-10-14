import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return <div className="page-shell not-found-page"><span><SearchX size={28} /></span><p className="eyebrow">HALAMAN TIDAK DITEMUKAN</p><h1>Sepertinya halaman ini tidak ada.</h1><p>Periksa kembali alamatnya atau lanjutkan belajar dari katalog materi.</p><Link href="/materi" className="button button-primary"><ArrowLeft size={15} /> Kembali ke materi</Link></div>;
}
