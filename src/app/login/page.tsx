import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  return <div className="auth-page"><section className="auth-aside"><Link className="brand brand-light" href="/"><span className="brand-mark"><BrainCircuit size={23} /></span><span><b>KOMPITA</b><small>BERPIKIR KOMPUTASIONAL</small></span></Link><div><p className="eyebrow">RUANG BELAJARMU</p><h1>Selangkah lebih dekat dengan solusi.</h1><p>Masuk untuk melanjutkan materi, menyimpan progres, dan melihat hasil latihanmu.</p></div><span className="auth-aside-foot"><ShieldCheck size={15} /> Sesi aman dengan cookie HTTP-only</span></section><section className="auth-main"><div className="auth-card"><span className="auth-icon"><BrainCircuit size={22} /></span><p className="eyebrow">SELAMAT DATANG KEMBALI</p><h2>Masuk ke akun</h2><p className="auth-description">Masukkan username dan password untuk melanjutkan perjalanan belajarmu.</p><AuthForm mode="login" /><div className="auth-help">Butuh bantuan terkait akun? Minta bantuan guru atau administrator KOMPITA.</div></div></section></div>;
}
