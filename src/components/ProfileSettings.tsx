"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileSettings({ displayName, profile, mustChangePassword, forceChangeOnly = false }: { displayName: string; profile: string; mustChangePassword: boolean; forceChangeOnly?: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage("Profil tersimpan.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Profil belum tersimpan."); }
    finally { setBusy(false); }
  }
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (data.newPassword !== data.confirmPassword) { setMessage("Konfirmasi password tidak cocok."); setBusy(false); return; }
    try {
      const response = await fetch("/api/auth/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      form.reset(); setMessage(result.message); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Password belum dapat diperbarui."); }
    finally { setBusy(false); }
  }
  return <div className="settings-stack">
    {!forceChangeOnly && <form className="settings-form" onSubmit={saveProfile}><h3>Profil belajar</h3><label>Nama tampilan<input name="displayName" required minLength={2} maxLength={80} defaultValue={displayName} /></label><label>Mode belajar<select name="profile" defaultValue={profile}><option value="CHILD">Anak</option><option value="TEEN">Remaja (kelas VII)</option><option value="ADULT">Dewasa</option></select></label><button className="button button-primary" disabled={busy}><Save size={16} /> Simpan profil</button></form>}
    <form className="settings-form" onSubmit={changePassword}><h3>Keamanan akun {mustChangePassword && <span className="badge badge-warning">Wajib diganti</span>}</h3><label>Password saat ini<input name="currentPassword" type="password" required autoComplete="current-password" /></label><label>Password baru<input name="newPassword" type="password" required minLength={10} maxLength={72} autoComplete="new-password" /><small>Min. 10 karakter, berisi huruf besar, huruf kecil, dan angka.</small></label><label>Konfirmasi password baru<input name="confirmPassword" type="password" required minLength={10} maxLength={72} autoComplete="new-password" /></label><button className="button button-outline" disabled={busy}>Perbarui password</button></form>
    {message && <p role="status" className="form-note">{message}</p>}
  </div>;
}
