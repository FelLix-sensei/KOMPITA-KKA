import Link from "next/link";
import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, CircleHelp, KeyRound, LogOut, Settings2, Sparkles, Trophy } from "lucide-react";

const steps = [
  { icon: KeyRound, title: "Buat akun atau masuk", body: "Pilih Daftar untuk membuat username dan password. Tidak perlu email atau akun Google. Jika sudah terdaftar, gunakan halaman Masuk." },
  { icon: Settings2, title: "Pilih profil belajar", body: "Saat daftar, pilih mode Anak, Remaja, atau Dewasa. Mode Remaja menjadi pilihan awal untuk siswa kelas VII. Kamu bisa menggantinya di Pengaturan akun." },
  { icon: BookOpen, title: "Pilih materi", body: "Buka menu Materi, telusuri modul, lalu pilih topik yang ingin dipelajari. Setiap materi memuat tujuan, contoh, ringkasan, dan pertanyaan refleksi." },
  { icon: Sparkles, title: "Selesaikan materi", body: "Baca penjelasan dan contoh. Jika sudah, masuk ke akun untuk menandai materi selesai. Statusnya tersimpan dan dapat dilihat lagi pada Dashboard." },
  { icon: CircleHelp, title: "Kerjakan latihan", body: "Pilih kuis atau latihan pada akhir materi. Jawab semua soal, gunakan navigasi sebelumnya/berikutnya, lalu pilih Akhiri kuis dan konfirmasi pengiriman." },
  { icon: ChartNoAxesColumnIncreasing, title: "Pahami hasil dan progres", body: "Setelah dikirim, nilai, jawaban, pembahasan, dan waktu pengerjaan tersimpan di akun. Grafik dan status pemahaman memakai aktivitas nyata; suatu topik memerlukan sedikitnya tiga jawaban untuk indikator." },
  { icon: Trophy, title: "Kumpulkan pencapaian", body: "Badge diberikan dari aktivitas tercatat, seperti menyelesaikan materi pertama atau lima materi. Poin belajar dihitung dari materi selesai dan percobaan kuis yang tersimpan." },
  { icon: Settings2, title: "Atur profil dan keamanan", body: "Di bagian Pengaturan akun, ubah nama tampilan atau mode belajar. Password bisa diganti dengan password kuat minimal 10 karakter, termasuk huruf besar, huruf kecil, dan angka." },
  { icon: LogOut, title: "Keluar dengan aman", body: "Gunakan tombol Keluar pada navigasi. Sesi akan dihapus dari server dan cookie sesi HTTP-only dibersihkan." }
];

export default function GuidePage() {
  return <div className="page-shell guide-page"><header className="page-title-block"><p className="eyebrow">PANDUAN PENGGUNAAN</p><h1>Mulai belajar tanpa bingung.</h1><p>Kenali fitur KOMPITA dan gunakan progresmu untuk menentukan langkah belajar berikutnya.</p></header><div className="guide-layout"><aside className="guide-note"><div className="side-icon"><BookOpen size={19} /></div><h2>Belajar dengan alur yang sederhana.</h2><p>Kamu bisa membaca materi tanpa akun. Akun dibutuhkan untuk menyimpan kuis, nilai, pencapaian, dan progres pribadi.</p><Link href="/register" className="button button-primary">Buat akun <ArrowRight size={15} /></Link></aside><div className="guide-steps">{steps.map(({ icon: Icon, title, body }, index) => <article className="guide-step" key={title}><span className="guide-step-number">{String(index + 1).padStart(2, "0")}</span><span className="guide-step-icon"><Icon size={19} /></span><div><h2>{title}</h2><p>{body}</p></div></article>)}</div></div><section className="help-banner"><h2>Siap memulai?</h2><p>Pilih modul pengenalan dan mulai dari konsep paling dasar.</p><Link className="button button-white" href="/materi/pengenalan-berpikir-komputasional">Mulai belajar <ArrowRight size={16} /></Link></section></div>;
}
