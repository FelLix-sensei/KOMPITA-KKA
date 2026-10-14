"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setMessage("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Permintaan belum berhasil.");
      setSuccess(true);
      setMessage(data.message ?? "Berhasil masuk.");
      if (!isRegister) {
        router.push(data.user?.role === "ADMIN" ? "/admin" : "/dashboard");
        router.refresh();
      } else {
        formElement.reset();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan. Coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {isRegister && <label>Nama tampilan<input name="displayName" required minLength={2} maxLength={80} autoComplete="name" placeholder="Nama yang ingin ditampilkan" /></label>}
      <label>Username<input name="username" required minLength={3} maxLength={32} autoComplete={isRegister ? "username" : "username"} placeholder="Contoh: pelajarhebat" /></label>
      <label>Password<span className="password-field"><input name="password" type={showPassword ? "text" : "password"} required minLength={isRegister ? 10 : 1} maxLength={72} autoComplete={isRegister ? "new-password" : "current-password"} placeholder={isRegister ? "Min. 10 karakter, huruf besar, kecil, angka" : "Masukkan password"} /><button type="button" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
      {isRegister && <>
        <label>Konfirmasi password<input name="confirmPassword" type="password" required minLength={10} maxLength={72} autoComplete="new-password" placeholder="Ulangi password" /></label>
        <label>Profil belajar<select name="profile" defaultValue="TEEN"><option value="CHILD">Anak</option><option value="TEEN">Remaja (kelas VII)</option><option value="ADULT">Dewasa</option></select><small>Mode dapat diubah kapan saja tanpa menghapus riwayat belajar.</small></label>
      </>}
      <button className="button button-primary auth-submit" type="submit" disabled={loading}><LockKeyhole size={17} />{loading ? "Memproses…" : isRegister ? "Buat akun" : "Masuk ke akun"}</button>
      {message && <p role={success ? "status" : "alert"} className={`form-message ${success ? "success-text" : "error-text"}`}>{message}</p>}
      <p className="auth-switch">{isRegister ? "Sudah punya akun?" : "Belum memiliki akun?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Masuk" : "Daftar gratis"}</Link></p>
    </form>
  );
}
