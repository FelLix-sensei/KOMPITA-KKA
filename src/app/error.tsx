"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Application page error", error); }, [error]);
  return <div className="page-shell not-found-page"><span><RefreshCw size={25} /></span><p className="eyebrow">TERJADI GANGGUAN</p><h1>Halaman belum dapat dimuat.</h1><p>Periksa koneksi atau coba muat kembali. Data akun dan progres tetap tersimpan di database.</p><button className="button button-primary" onClick={reset}>Coba lagi</button></div>;
}
