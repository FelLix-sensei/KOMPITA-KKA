import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <div className="auth-page"><section className="auth-aside register-aside"><Link className="brand brand-light" href="/"><span className="brand-mark"><BrainCircuit size={23} /></span><span><b>KOMPITA</b><small>BERPIKIR KOMPUTASIONAL</small></span></Link><div><p className="eyebrow">MULAI PERJALANAN BELAJARMU</p><h1>Setiap pemecah masalah hebat pernah mulai dari awal.</h1><p>Buat akun untuk menyimpan hasil belajar dan melihat perkembanganmu dari waktu ke waktu.</p></div><span className="auth-aside-foot"><ShieldCheck size={15} /> Password disimpan dalam bentuk hash</span></section><section className="auth-main"><div className="auth-card"><span className="auth-icon"><BrainCircuit size={22} /></span><p className="eyebrow">BUAT AKUN BARU</p><h2>Gabung di KOMPITA</h2><p className="auth-description">Pendaftaran tidak memerlukan email atau akun Google.</p><AuthForm mode="register" /><div className="auth-help">Gunakan password yang kuat dan jangan bagikan password kepada siapa pun.</div></div></section></div>;
}
