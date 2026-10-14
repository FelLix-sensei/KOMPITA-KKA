# KOMPITA — Berpikir Komputasional Interaktif

KOMPITA adalah aplikasi pembelajaran Informatika kelas VII berbasis Next.js App Router, TypeScript, Prisma, dan PostgreSQL. Akun, sesi, progres, percobaan kuis, pencapaian, acara, pengaturan tema, dan audit admin disimpan di database; browser tidak menggunakan `localStorage` untuk data tersebut.

## Fitur yang sudah tersedia

- Beranda responsif, katalog dan 10 halaman materi dengan tujuan, contoh, refleksi, dan ringkasan.
- Registrasi username/password (bcrypt), cookie sesi HTTP-only, logout, pembatasan percobaan login, ganti password, dan role `USER`/`ADMIN`.
- Dashboard dengan poin, progres materi, riwayat/nilai kuis, tren, kompetensi, rekomendasi, dan badge yang dihitung dari aktivitas tersimpan.
- Bank awal 120 soal untuk 10 topik, termasuk pilihan tunggal, benar/salah, pilihan ganda jamak, serta jawaban singkat. Penilaian dan pembahasan berlangsung di server.
- Acara/pengumuman, panduan penggunaan, serta panel admin dengan pengelolaan materi, soal, acara, status pengguna, pengaturan tema, statistik, dan audit log.
- Seed aman dan idempoten untuk data konten dan akun admin awal. Akun admin yang sudah ada tidak di-reset saat seed diulang.

## Persyaratan

- Node.js 20 atau lebih baru dan npm.
- PostgreSQL yang dapat dijangkau dari komputer lokal dan Vercel, misalnya Neon atau Supabase.
- Akun GitHub dan Vercel untuk deployment dashboard.

## Jalankan secara lokal

1. Pasang Node.js 20+, lalu buka terminal pada folder proyek.
2. Pasang dependensi:

   ```bash
   npm install
   ```

3. Salin `.env.example` menjadi `.env`. Isi `DATABASE_URL` dan `DIRECT_URL` dengan koneksi PostgreSQL milikmu (gunakan SSL untuk database hosted). Buat nilai acak panjang untuk `SESSION_SECRET`. Jangan commit `.env`.
4. Atur variabel seed admin di `.env`: `ADMIN_USERNAME=ftnfellix` dan `ADMIN_INITIAL_PASSWORD` dengan password awal yang diberikan kepada pemilik proyek. Password itu hanya dibaca saat akun admin pertama kali dibuat.
5. Buat dan jalankan migration:

   ```bash
   npx prisma migrate dev --name init
   ```

   Migration tersimpan di `prisma/migrations/` dan harus ikut di-commit. Jika berkas migration awal sudah ada pada checkout, perintah yang dipakai adalah `npm run db:migrate:dev`.
6. Isi database dengan materi, soal, pengaturan tema awal, badge, event contoh, dan admin:

   ```bash
   npm run db:seed
   ```

   Periksa output: seharusnya tertulis 10 materi dan sedikitnya 120 soal aktif. Tanpa kedua variabel admin, seed sengaja melewati pembuatan admin dan memberi peringatan.
7. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

8. Buka `http://localhost:3000`. Buat akun siswa dari menu Daftar. Login sebagai admin melalui username/password seed; segera ganti password awal melalui Dashboard sebelum menggunakan menu admin.

## Langkah demi langkah deploy ke Vercel

### A. Siapkan PostgreSQL

1. Buat database PostgreSQL di Neon atau Supabase.
2. Salin koneksi **pooled/runtime** untuk `DATABASE_URL` dan koneksi **direct/non-pooled** untuk `DIRECT_URL` bila provider memisahkan keduanya. Kedua koneksi harus mengarah ke database yang sama dan mengaktifkan SSL.
3. Simpan kedua URL secara privat. Jangan menaruh URL database di source code, screenshot publik, atau file yang di-commit.

### B. Unggah source code ke GitHub

1. Buat repository baru di GitHub. Untuk repository publik, pastikan tidak ada file `.env` atau kredensial di dalamnya.
2. Dari terminal pada folder proyek, buat repository Git dan kirim source:

   ```bash
   git init
   git add .
   git commit -m "Build KOMPITA learning application"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
   git push -u origin main
   ```

   Ganti `USERNAME/NAMA-REPOSITORY` dengan repository milikmu. File `.env` diabaikan oleh `.gitignore`; `.env.example` hanya berisi placeholder.

### C. Buat proyek Vercel

1. Masuk ke [vercel.com](https://vercel.com), pilih **Add New → Project**, lalu hubungkan akun GitHub.
2. Import repository KOMPITA. Framework akan dikenali sebagai **Next.js**. `vercel.json` sudah mengatur build untuk memvalidasi environment, menerapkan migration, mengisi data awal, lalu menjalankan build Next.js secara otomatis.
3. Sebelum deploy, buka **Project → Settings → Environment Variables**. Tambahkan variabel berikut untuk environment yang akan digunakan:

   | Variable | Nilai |
   |---|---|
   | `DATABASE_URL` | URL PostgreSQL runtime/pooled |
   | `DIRECT_URL` | URL direct PostgreSQL untuk Prisma |
   | `SESSION_SECRET` | Nilai acak rahasia minimal 32 karakter; berbeda dari password database |
   | `ADMIN_USERNAME` | `ftnfellix` |
   | `ADMIN_INITIAL_PASSWORD` | Password awal dari brief proyek; masukkan langsung di Vercel, jangan di source code |

   `NEXT_PUBLIC_APP_URL` bersifat opsional; jika diisi, gunakan origin URL produksi persis tanpa path. Tanpanya, aplikasi memeriksa origin request yang sedang dilayani. Jangan awali nama variabel server-only dengan `NEXT_PUBLIC_`. Setiap environment Vercel yang akan di-deploy harus memiliki lima variabel wajib di atas serta database terpisah; jangan arahkan Preview ke database Production.
4. Simpan Environment Variables, lalu deploy branch produksi dari halaman **Deployments**.

### D. Verifikasi deployment

1. Saat proses build, `vercel-build` menjalankan `prisma migrate deploy`, seed awal, lalu build aplikasi. Seed membuat admin dan data pembelajaran sekali saja; proses build berikutnya tidak akan menimpa konten yang sudah diedit admin. Build akan gagal dengan pesan environment yang belum diatur bila ada variabel wajib yang hilang.
2. Periksa log deployment untuk memastikan seed melaporkan **10 lessons** dan **120 active questions** serta deployment berstatus **Ready**. Jika migration gagal, periksa URL direct, izin database, SSL, dan log Prisma sebelum mencoba lagi.
3. Buka URL produksi. Daftar akun siswa, kerjakan kuis, refresh dashboard, dan pastikan hasil tetap tersimpan.
4. Login admin menggunakan username dan password awal yang dimasukkan ke environment. Segera ganti password, logout, lalu login kembali untuk memastikan perubahan berhasil.
5. Dari akun siswa biasa, coba buka `/admin`; aplikasi harus mengarahkan kembali ke dashboard. Pastikan API admin juga menolak akun non-admin.

### E. Setiap kali ada perubahan schema

1. Buat migration di lokal setelah mengubah `prisma/schema.prisma`:

   ```bash
   npx prisma migrate dev --name NAMA_PERUBAHAN
   ```

2. Commit folder migration bersama source code dan push ke GitHub.
3. Build Vercel akan otomatis menerapkan migration dan seed sebelum membangun aplikasi.
4. Seed berjalan otomatis pada deployment pertama yang berhasil dan hanya sekali per database. Jangan gunakan satu database bersama antara Preview dan Production.

## Pengelolaan konten

Login sebagai admin lalu buka **Admin**. Pilih Materi, Bank soal, Acara, Tampilan, Pengguna, atau Audit log. Tombol tambah memuat contoh JSON; pilih record untuk mengedit JSON-nya. Materi baru berstatus draft secara default, sehingga perlu diubah ke `PUBLISHED` untuk muncul di katalog. Penghapusan materi/acara dilakukan sebagai arsip; soal dinonaktifkan agar riwayat percobaan lama tetap utuh. Pada pengaturan `theme`, warna harus berformat hex enam digit dan pengaturan tersimpan diterapkan pada pemuatan halaman berikutnya.

## Keamanan dan batasan deployment

- Tidak ada kredensial database, `SESSION_SECRET`, atau password admin di bundle browser maupun `.env.example`.
- Pendaftaran selalu membuat role `USER`; perubahan status admin dan operasi konten hanya tersedia melalui pemeriksaan role server.
- Sesi memakai token acak yang hanya disimpan dalam bentuk hash di database dan dikirim ke browser dengan cookie HTTP-only, SameSite Lax, dan Secure pada produksi.
- Endpoint perubahan data memeriksa origin, memvalidasi payload, dan membatasi akses berdasarkan sesi. Login membatasi percobaan per username/IP.
- Progres topik belum menyatakan penguasaan sebelum ada minimal tiga jawaban terkait. Nilai, jawaban, dan pembahasan dihitung/dicatat dari data kuis.
- Upload file, pemulihan akun tanpa email, onboarding, timer ujian, leaderboard, dan tipe interaksi matching/drag-sort belum disediakan. Kuis awal menggunakan mode latihan dan menampilkan pembahasan sesudah pengiriman; jangan mengiklankan fitur yang belum tersedia.
- Admin dapat mengelola materi, soal, acara, pengguna, tema, statistik agregat, serta melihat audit log. Statistik kunjungan materi belum direkam.
- Aplikasi belum dapat dianggap siap digunakan sebelum database berhasil dimigrasi/di-seed, akun admin diverifikasi, dan environment Vercel sudah disetel.

## Perintah penting

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan lokal |
| `npm run build` | Generate Prisma Client dan build produksi |
| `npm run start` | Jalankan build produksi secara lokal |
| `npx prisma migrate dev --name init` | Buat dan terapkan migration pada database pengembangan |
| `npx prisma migrate deploy` | Terapkan migration yang sudah di-commit |
| `npm run db:seed` | Seed konten dan admin awal secara idempoten |
| `npx prisma studio` | Inspeksi database secara lokal; jangan mengekspos ke internet |

## Troubleshooting

- **`Environment variable not found`** — pastikan `.env` lokal atau Vercel Environment Variables memiliki `DATABASE_URL` dan `DIRECT_URL`.
- **Prisma tidak dapat tersambung saat migration** — gunakan `DIRECT_URL` non-pooled, pastikan allowlist jaringan/SSL provider, dan pastikan database aktif.
- **Materi/soal kosong** — jalankan `npx prisma migrate deploy` lalu `npx prisma db seed`; periksa output seed.
- **Admin tidak bisa login** — cek `ADMIN_USERNAME`/`ADMIN_INITIAL_PASSWORD`, kecocokan huruf username, dan apakah seed menampilkan admin berhasil dibuat. Mengubah env setelah admin dibuat tidak mengubah password tersimpan.
- **Sesi tidak berlaku di domain Vercel** — bila `NEXT_PUBLIC_APP_URL` diatur, pastikan nilainya memakai origin domain persis (tanpa path), kemudian redeploy.
- **Build gagal setelah mengganti schema** — buat migration, jalankan `npm run db:generate`, lalu build lagi.
