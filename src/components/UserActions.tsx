"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }
  return <button type="button" className="logout-button" onClick={logout} disabled={loading}><LogOut size={15} />{loading ? "Keluar…" : "Keluar"}</button>;
}

export function CompleteLessonButton({ slug, completed }: { slug: string; completed: boolean }) {
  const [done, setDone] = useState(completed);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function complete() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/lessons/${encodeURIComponent(slug)}/complete`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Progres belum tersimpan.");
      setDone(true);
      setMessage("Progres tersimpan di akun Anda.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }
  return <div className="complete-control"><button onClick={complete} disabled={busy || done} className={`button ${done ? "button-success" : "button-primary"}`}>{busy ? "Menyimpan…" : done ? "Materi selesai" : "Tandai selesai"}</button>{message && <span role="status" className="form-note">{message}</span>}</div>;
}

export function RecordLessonView({ slug, enabled }: { slug: string; enabled: boolean }) {
  const sent = useRef(false);
  useEffect(() => {
    if (enabled && !sent.current) {
      sent.current = true;
      void fetch(`/api/lessons/${encodeURIComponent(slug)}/view`, { method: "POST" });
    }
  }, [slug, enabled]);
  return null;
}
