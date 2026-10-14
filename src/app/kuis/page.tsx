import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CircleHelp, LockKeyhole, Sparkles } from "lucide-react";
import { QuizRunner } from "@/components/QuizRunner";
import { getCurrentUser } from "@/lib/auth";

export default async function QuizPage({ searchParams }: { searchParams: Promise<{ topik?: string }> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  if (user?.mustChangePassword) redirect("/dashboard");
  if (!user) return <div className="page-shell quiz-page"><div className="quiz-intro"><p className="eyebrow"><Sparkles size={14} /> LATIHAN INTERAKTIF</p><h1>Uji logikamu.<br /><span>Tumbuh dari setiap jawaban.</span></h1><p>Latihan di KOMPITA menyimpan hasil pada akunmu agar perkembangan belajarmu tercatat.</p><div className="login-gate"><LockKeyhole size={20} /><div><b>Masuk untuk menyimpan hasil kuis.</b><p>Daftar gratis jika kamu belum mempunyai akun.</p></div><Link className="button button-primary" href="/login">Masuk <ArrowRight size={16} /></Link></div></div></div>;
  return <div className="page-shell quiz-page"><div className="quiz-intro"><p className="eyebrow"><CircleHelp size={14} /> LATIHAN INTERAKTIF · {user.profile === "CHILD" ? "MODE ANAK" : user.profile === "ADULT" ? "MODE DEWASA" : "MODE REMAJA"}</p><h1>Uji logikamu.<br /><span>Tumbuh dari setiap jawaban.</span></h1><p>{params.topik ? `Latihan untuk topik ${params.topik}.` : "Sepuluh soal pilihan dari bank soal KOMPITA. Jawaban dan pembahasan akan muncul setelah kuis dikirim."}</p></div><QuizRunner topic={params.topik} /></div>;
}
