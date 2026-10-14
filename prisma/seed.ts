import { PrismaClient, Difficulty, LearningProfile, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const lessons = [
  {
    slug: "pengenalan-berpikir-komputasional", title: "Pengenalan Berpikir Komputasional", topic: "Berpikir Komputasional", durationMin: 12,
    summary: "Cara berpikir runtut untuk memecahkan masalah, dengan atau tanpa komputer.",
    content: {
      objectives: ["Menjelaskan arti berpikir komputasional.", "Menghubungkan empat konsep utama dengan masalah sehari-hari."],
      sections: [
        { heading: "Apa itu berpikir komputasional?", body: "Berpikir komputasional adalah cara menyusun solusi masalah secara logis, terstruktur, dan dapat dijalankan. Ini bukan berarti hanya belajar memakai komputer. Kita menggunakan cara berpikir ini saat merencanakan kegiatan, mencari rute, atau menyusun aturan permainan." },
        { heading: "Empat cara yang saling melengkapi", body: "Dekomposisi membagi masalah besar; pengenalan pola mencari kesamaan; abstraksi memilih informasi penting; algoritma menyusun langkah solusi. Hasilnya perlu diuji dan diperbaiki." },
        { heading: "Contoh sehari-hari", body: "Saat menyiapkan pameran kelas, kelompok membagi tugas (dekomposisi), menggunakan kembali pola susunan stan yang berhasil (pola), fokus pada ukuran ruang dan kebutuhan pengunjung (abstraksi), lalu menulis urutan persiapan (algoritma)." }
      ],
      example: "Coba pikirkan cara menyiapkan tas sekolah. Tentukan bagian pekerjaan, cari hal yang selalu perlu dibawa, abaikan detail yang tidak terkait, lalu tulis urutannya.",
      reflection: "Masalah apa di rumah atau sekolah yang akan lebih mudah jika langkah penyelesaiannya ditulis dengan jelas?",
      summary: "Berpikir komputasional adalah proses pemecahan masalah yang terstruktur. Empat konsep utamanya dapat dipakai bersama dan hasil solusi perlu diuji."
    }
  },
  {
    slug: "dekomposisi", title: "Dekomposisi", topic: "Dekomposisi", durationMin: 10,
    summary: "Membagi masalah kompleks menjadi bagian yang lebih kecil dan mudah ditangani.",
    content: {
      objectives: ["Menguraikan masalah menjadi submasalah.", "Menentukan pembagian tugas yang saling mendukung."],
      sections: [
        { heading: "Memecah masalah", body: "Dekomposisi adalah membagi masalah besar menjadi bagian kecil. Setiap bagian lebih mudah dipahami, dikerjakan, dan diperiksa. Bagian dapat dikerjakan berurutan atau oleh beberapa orang sekaligus." },
        { heading: "Contoh: persiapan ujian", body: "Masalah 'siap menghadapi ujian' dapat diurai menjadi mendata mata pelajaran, mengumpulkan bahan, membuat jadwal, belajar per topik, beristirahat, dan mengecek perlengkapan." },
        { heading: "Pembagian yang baik", body: "Pastikan submasalah mencakup kebutuhan utama, tidak tumpang tindih secara membingungkan, dan memiliki hasil yang dapat diperiksa. Jika tugas masih terlalu besar, uraikan lagi." }
      ],
      example: "Untuk membuat majalah kelas, uraikan menjadi menentukan tema, mengumpulkan tulisan, menyunting, membuat ilustrasi, menata halaman, dan memeriksa hasil cetak.",
      reflection: "Pekerjaan kelompok apa yang dapat kamu bagi menjadi beberapa tugas yang jelas?",
      summary: "Dekomposisi mengurangi kerumitan dengan membagi pekerjaan menjadi submasalah yang bisa ditangani dan diperiksa."
    }
  },
  {
    slug: "pengenalan-pola", title: "Pengenalan Pola", topic: "Pengenalan Pola", durationMin: 10,
    summary: "Menemukan kesamaan, perbedaan, dan aturan yang berulang pada data atau kejadian.",
    content: {
      objectives: ["Menemukan aturan dari urutan atau kejadian.", "Menggunakan pola yang ditemukan untuk memperkirakan langkah berikut."],
      sections: [
        { heading: "Mencari keteraturan", body: "Pola adalah keteraturan yang berulang atau hubungan yang dapat dikenali. Pola bisa berupa angka, bentuk, jadwal, maupun kejadian. Catat apa yang berubah dan apa yang tetap." },
        { heading: "Menyusun aturan", body: "Urutan 3, 6, 9, 12 bertambah tiga setiap langkah, sehingga berikutnya 15. Periksa beberapa pasangan data sebelum menyimpulkan aturan agar tidak terburu-buru." },
        { heading: "Manfaat pola", body: "Jika dua masalah memiliki pola serupa, kita dapat memakai strategi yang pernah berhasil. Namun, tetap periksa apakah kondisi pentingnya benar-benar sama." }
      ],
      example: "Jadwal piket berulang setiap lima hari sekolah. Dengan mengenali siklusnya, kamu bisa memperkirakan giliran berikut tanpa menyusun ulang dari awal.",
      reflection: "Pola apa yang kamu temukan pada jadwal, permainan, atau perjalanan sehari-hari?",
      summary: "Pengenalan pola membantu menemukan aturan dan memakai pengalaman sebelumnya untuk menyelesaikan masalah serupa."
    }
  },
  {
    slug: "abstraksi", title: "Abstraksi", topic: "Abstraksi", durationMin: 10,
    summary: "Memusatkan perhatian pada informasi yang penting untuk tujuan tertentu.",
    content: {
      objectives: ["Membedakan informasi relevan dan tidak relevan.", "Membuat model sederhana sesuai tujuan."],
      sections: [
        { heading: "Memilih yang penting", body: "Abstraksi menyederhanakan masalah dengan mempertahankan informasi yang dibutuhkan dan mengabaikan detail yang tidak berpengaruh pada tujuan. Informasi penting bergantung pada pertanyaan yang ingin dijawab." },
        { heading: "Contoh peta", body: "Peta untuk mencari rute sekolah menampilkan jalan, persimpangan, dan penanda lokasi. Warna baju orang yang lewat tidak diperlukan untuk memilih rute." },
        { heading: "Model bukan salinan lengkap", body: "Model abstrak sengaja tidak memuat semua detail dunia nyata. Periksa apakah detail yang dihilangkan memang tidak mengubah solusi." }
      ],
      example: "Untuk memilih kendaraan ke sekolah, pertimbangkan jarak, waktu, biaya, dan keselamatan; warna kendaraan teman tidak membantu keputusan itu.",
      reflection: "Saat membuat jadwal belajar, informasi mana yang perlu dicatat dan mana yang boleh diabaikan?",
      summary: "Abstraksi memilih informasi relevan untuk tujuan tertentu dan menyederhanakan masalah tanpa menghilangkan hal yang menentukan solusi."
    }
  },
  {
    slug: "algoritma", title: "Algoritma", topic: "Algoritma", durationMin: 12,
    summary: "Menyusun instruksi yang jelas, berurutan, dan dapat diuji.",
    content: {
      objectives: ["Menulis urutan instruksi yang tidak ambigu.", "Menguji dan memperbaiki langkah algoritma."],
      sections: [
        { heading: "Instruksi yang dapat dijalankan", body: "Algoritma adalah urutan langkah untuk mencapai tujuan. Langkah yang baik jelas, memiliki awal dan akhir, serta tidak mengandalkan tebakan pembaca." },
        { heading: "Urutan berpengaruh", body: "Untuk mengirim surat, tulis alamat pada amplop sebelum menyerahkan surat ke petugas. Urutan yang terbalik dapat membuat tujuan gagal." },
        { heading: "Uji dengan contoh", body: "Jalankan langkah menggunakan contoh sederhana. Catat langkah yang membingungkan atau hasil yang salah, lalu perbaiki dan uji lagi." }
      ],
      example: "Algoritma mengirim tugas: buka kelas daring, pilih mata pelajaran, pilih tugas yang tepat, lampirkan berkas, periksa nama berkas, tekan kirim, lalu pastikan status terkirim.",
      reflection: "Instruksi apa yang pernah kamu baca tetapi masih memiliki lebih dari satu arti?",
      summary: "Algoritma menyatakan solusi sebagai langkah yang jelas dan berurutan. Pengujian membantu memastikan hasilnya sesuai tujuan."
    }
  },
  {
    slug: "flowchart", title: "Flowchart dan Representasi Algoritma", topic: "Flowchart", durationMin: 12,
    summary: "Menggambar alur langkah dan keputusan menggunakan simbol yang disepakati.",
    content: {
      objectives: ["Mengenali simbol flowchart dasar.", "Membaca alur proses dan percabangan sederhana."],
      sections: [
        { heading: "Simbol dasar", body: "Oval menandai mulai atau selesai; persegi panjang menunjukkan proses; jajar genjang menyatakan masukan atau keluaran; belah ketupat menyatakan keputusan. Panah menunjukkan arah alur." },
        { heading: "Membaca alur", body: "Ikuti panah dari mulai. Pada simbol keputusan, pilih cabang sesuai kondisi, misalnya Ya atau Tidak. Setiap jalur sebaiknya berakhir dengan jelas." },
        { heading: "Gambar yang mudah dibaca", body: "Gunakan satu arah alur yang konsisten, beri label pada cabang keputusan, dan hindari garis yang saling menyilang jika memungkinkan." }
      ],
      example: "Mulai → masukkan nilai → apakah nilai ≥ 75? → Ya: tampilkan 'Tuntas'; Tidak: tampilkan 'Perlu latihan' → Selesai.",
      reflection: "Kegiatan apa yang memiliki satu keputusan sederhana dan dapat digambarkan dengan flowchart?",
      summary: "Flowchart memperlihatkan urutan dan pilihan algoritma secara visual dengan simbol dan panah yang konsisten."
    }
  },
  {
    slug: "logika-keputusan", title: "Logika dan Pengambilan Keputusan", topic: "Logika", durationMin: 10,
    summary: "Menggunakan kondisi benar atau salah untuk menentukan tindakan berikutnya.",
    content: {
      objectives: ["Menyatakan kondisi secara jelas.", "Menentukan hasil percabangan jika-maka."],
      sections: [
        { heading: "Kondisi", body: "Kondisi adalah pernyataan yang dapat dinilai benar atau salah. Contoh: 'jumlah anggota kelompok lebih dari empat' dapat diperiksa dari jumlah anggota." },
        { heading: "Jika-maka", body: "Aturan 'jika hujan, maka gunakan jas hujan' memilih tindakan berdasarkan kondisi. Pastikan tindakan untuk keadaan lain juga dipikirkan." },
        { heading: "Gabungan kondisi sederhana", body: "Kata DAN mensyaratkan kedua kondisi benar; ATAU cukup salah satu kondisi benar. Gunakan aturan yang jelas agar tidak terjadi tafsir berbeda." }
      ],
      example: "Jika tugas sudah dikumpulkan DAN nama berkas benar, tampilkan 'Siap diperiksa'; jika tidak, minta pengguna memeriksa kembali.",
      reflection: "Buat satu aturan jika-maka untuk menentukan apakah kamu membawa perlengkapan olahraga.",
      summary: "Logika mengubah kondisi yang dapat diperiksa menjadi keputusan dan tindakan yang konsisten."
    }
  },
  {
    slug: "debugging-evaluasi", title: "Debugging dan Evaluasi Solusi", topic: "Debugging", durationMin: 11,
    summary: "Menemukan sumber kesalahan, menguji solusi, dan meningkatkan kualitasnya.",
    content: {
      objectives: ["Melacak kesalahan berdasarkan gejala.", "Membandingkan solusi dengan kriteria yang jelas."],
      sections: [
        { heading: "Debugging bukan menebak", body: "Debugging adalah proses mencari dan memperbaiki kesalahan. Ulangi langkah, gunakan data uji kecil, dan catat titik saat hasil mulai berbeda dari yang diharapkan." },
        { heading: "Jenis kesalahan", body: "Langkah dapat hilang, urutannya keliru, kondisi keputusan terbalik, atau masukan tidak ditangani. Periksa satu kemungkinan pada satu waktu." },
        { heading: "Evaluasi solusi", body: "Bandingkan solusi terhadap kriteria seperti benar, aman, mudah dilakukan, dan efisien. Solusi tercepat belum tentu paling baik jika tidak aman atau tidak akurat." }
      ],
      example: "Jika daftar piket menugaskan orang yang sama dua kali, telusuri aturan pembagian, uji pada daftar kecil, lalu perbaiki bagian yang menggandakan nama.",
      reflection: "Bagaimana kamu membuktikan bahwa perbaikanmu benar-benar mengatasi penyebab kesalahan?",
      summary: "Uji, telusuri penyebab, perbaiki secara terarah, lalu evaluasi solusi dengan kriteria yang relevan."
    }
  },
  {
    slug: "studi-kasus-terpadu", title: "Studi Kasus Terpadu", topic: "Studi Kasus", durationMin: 15,
    summary: "Menggabungkan dekomposisi, pola, abstraksi, algoritma, dan evaluasi dalam masalah nyata.",
    content: {
      objectives: ["Memilih strategi untuk masalah sehari-hari.", "Menggabungkan beberapa konsep dalam satu solusi."],
      sections: [
        { heading: "Kasus: perjalanan ke sekolah", body: "Bagi keputusan menjadi mencari pilihan rute, memperkirakan waktu, mengecek biaya, dan menyiapkan alternatif. Gunakan data perjalanan sebelumnya untuk melihat pola kemacetan." },
        { heading: "Pilih informasi yang dibutuhkan", body: "Jarak, kondisi jalan, keselamatan, jadwal masuk, dan waktu tempuh penting. Detail yang tidak memengaruhi pilihan dapat diabaikan." },
        { heading: "Susun dan uji rencana", body: "Tuliskan langkah berangkat dan kondisi alternatif. Uji pada hari dengan kondisi berbeda; evaluasi apakah rute aman, tepat waktu, dan realistis." }
      ],
      example: "Untuk mengatur antrean perpustakaan, uraikan titik layanan, cari jam ramai, fokus pada waktu tunggu dan kapasitas, susun aturan antre, lalu uji saat jam istirahat.",
      reflection: "Konsep berpikir komputasional mana yang paling membantu pada kasus perjalanan di daerahmu?",
      summary: "Masalah nyata sering memerlukan beberapa konsep sekaligus. Tentukan tujuan, informasi, urutan, dan cara mengevaluasi hasil."
    }
  },
  {
    slug: "evaluasi-akhir", title: "Evaluasi Akhir dan Peta Konsep", topic: "Evaluasi Akhir", durationMin: 15,
    summary: "Menghubungkan seluruh konsep dan merencanakan latihan berikutnya.",
    content: {
      objectives: ["Merangkum hubungan antarkonsep.", "Mengevaluasi solusi berdasarkan bukti dan kriteria."],
      sections: [
        { heading: "Peta konsep", body: "Mulai dari masalah. Dekomposisi membantu mengurai; pola membantu memakai keteraturan; abstraksi memilih informasi; algoritma menyusun langkah; flowchart menggambarkan alur; logika mengatur pilihan; debugging menguji dan memperbaiki." },
        { heading: "Tidak selalu satu urutan", body: "Pemecahan masalah dapat bolak-balik. Pengujian mungkin menunjukkan informasi kurang, sehingga abstraksi atau pembagian masalah perlu diperbaiki." },
        { heading: "Rencana belajar", body: "Gunakan hasil latihan sebagai petunjuk, bukan label kemampuan. Jika satu topik belum kuat, pelajari kembali contoh lalu coba soal yang berbeda." }
      ],
      example: "Rancang aturan peminjaman buku: uraikan alur anggota dan petugas, tentukan pola keterlambatan, pilih data yang perlu dicatat, susun algoritma, lalu uji kasus buku tersedia dan habis.",
      reflection: "Topik apa yang ingin kamu latih lagi, dan bukti apa yang akan menunjukkan kamu semakin memahaminya?",
      summary: "Konsep berpikir komputasional bekerja bersama dalam proses iteratif. Evaluasi dan latihan membantu memperbaiki solusi."
    }
  }
];

const questionSets: Array<{ topic: string; items: Array<[string, string[], number, string]> }> = [
  { topic: "Berpikir Komputasional", items: [
    ["Tim kelas ingin mengadakan bazar. Manakah contoh dekomposisi?", ["Membagi persiapan menjadi stan, promosi, dan jadwal.", "Memilih warna poster saja.", "Mengabaikan kebutuhan pengunjung.", "Mengulang acara tanpa mengecek hasil."], 0, "Dekomposisi membagi masalah besar menjadi submasalah yang dapat ditangani."],
    ["Mengapa berpikir komputasional berguna tanpa komputer?", ["Karena hanya komputer yang dapat menjalankannya.", "Karena cara ini membantu menyusun solusi masalah sehari-hari.", "Karena semua masalah harus memakai angka.", "Karena menggantikan diskusi kelompok."], 1, "Cara berpikir terstruktur dapat digunakan untuk kegiatan sehari-hari."],
    ["Saat menyiapkan perjalanan, mencari kesamaan waktu macet dari beberapa hari adalah ...", ["Abstraksi", "Pengenalan pola", "Penghapusan data", "Pengacakan"], 1, "Keteraturan dari beberapa pengamatan merupakan pola."],
    ["Urutan kegiatan belajar yang ditulis jelas dan dapat diikuti disebut ...", ["Algoritma", "Pola warna", "Jaringan", "Perkiraan"], 0, "Algoritma adalah langkah terurut untuk mencapai tujuan."],
    ["Kelompok membagi tugas, memakai jadwal lama yang berhasil, lalu menguji rencana. Pernyataan yang tepat?", ["Hanya memakai abstraksi.", "Menggabungkan beberapa konsep komputasional.", "Tidak ada pemecahan masalah.", "Hasil pasti benar tanpa pengujian."], 1, "Empat konsep dapat dipakai bersama; hasil tetap perlu diuji."],
    ["Benar atau salah: berpikir komputasional hanya diperlukan oleh programmer.", ["Benar", "Salah"], 1, "Semua orang dapat memakai pendekatan ini untuk menyelesaikan masalah."],
    ["Sebelum membuat solusi, langkah yang membantu memperjelas masalah adalah ...", ["Menghapus semua informasi.", "Menentukan tujuan dan kondisi masalah.", "Memilih jawaban secara acak.", "Langsung menyalin solusi orang lain."], 1, "Tujuan dan kondisi membantu memilih strategi yang sesuai."],
    ["Rencana kegiatan gagal karena tidak ada yang memeriksa perlengkapan. Apa tindakan terbaik?", ["Salahkan satu anggota.", "Evaluasi rencana dan tambahkan pemeriksaan perlengkapan.", "Hapus seluruh rencana.", "Abaikan kegagalan."], 1, "Evaluasi menemukan bagian yang kurang agar solusi dapat diperbaiki."],
    ["Masalah mana paling cocok dipecahkan dengan instruksi terurut?", ["Menentukan langkah mengirim tugas digital.", "Menentukan warna favorit semua siswa.", "Menebak cuaca bulan depan.", "Memilih lagu paling populer."], 0, "Prosedur mengirim tugas dapat dijabarkan menjadi langkah-langkah."],
    ["Pernyataan paling tepat tentang solusi komputasional adalah ...", ["Harus selalu paling singkat.", "Dapat diuji dan diperbaiki.", "Tidak boleh memakai contoh.", "Hanya berlaku di kelas Informatika."], 1, "Pengujian dan perbaikan merupakan bagian penting penyelesaian masalah."]
  ] },
  { topic: "Dekomposisi", items: [
    ["Panitia pentas seni kewalahan. Pembagian submasalah paling masuk akal adalah ...", ["Mengurus tempat, penampil, perlengkapan, dan publikasi.", "Semua orang mengerjakan poster yang sama.", "Membatalkan kegiatan sebelum merencanakan.", "Membagi berdasarkan warna sepatu."], 0, "Bagian tersebut merupakan pekerjaan berbeda yang mendukung tujuan acara."],
    ["Sebuah submasalah masih terlalu besar untuk dikerjakan. Apa yang sebaiknya dilakukan?", ["Uraikan lagi menjadi bagian lebih kecil.", "Hapus tujuan utama.", "Berhenti menguji.", "Gabungkan semua tugas tanpa batas."], 0, "Dekomposisi dapat dilakukan berulang sampai bagian mudah ditangani."],
    ["Untuk mengadakan piknik kelas, mana yang termasuk submasalah logistik?", ["Menentukan transportasi dan perlengkapan.", "Memilih soal ujian semester.", "Menyunting laporan praktikum lama.", "Mencari pola bilangan."], 0, "Transportasi dan perlengkapan adalah komponen nyata persiapan piknik."],
    ["Manakah tanda pembagian kerja yang baik?", ["Setiap bagian punya hasil yang dapat diperiksa.", "Semua tugas saling tumpang tindih.", "Tidak ada penanggung jawab.", "Bagian penting sengaja dibiarkan."], 0, "Hasil yang jelas memudahkan koordinasi dan pemeriksaan."],
    ["Proyek video terdiri dari naskah, rekaman, penyuntingan, dan pemeriksaan suara. Ini contoh ...", ["Dekomposisi", "Abstraksi", "Percabangan", "Pengacakan"], 0, "Proyek dibagi ke komponen kerja yang lebih kecil."],
    ["Benar atau salah: submasalah sebaiknya mencakup kebutuhan utama dari masalah.", ["Benar", "Salah"], 0, "Pembagian yang baik tidak meninggalkan kebutuhan utama."],
    ["Saat menyusun jadwal ujian, bagian mana dapat dikerjakan paralel?", ["Mendata mata pelajaran dan mengumpulkan bahan belajar.", "Mengerjakan ujian sebelum jadwal ada.", "Menentukan hasil tanpa belajar.", "Mengulang langkah yang sama tanpa tujuan."], 0, "Dua pekerjaan tersebut dapat berlangsung bersama sebelum menyusun jadwal."],
    ["Dekomposisi pembagian acara tidak memiliki tugas untuk keselamatan peserta. Apa kekurangannya?", ["Ada kebutuhan penting yang belum menjadi submasalah.", "Masalah sudah terlalu sederhana.", "Algoritma terlalu cepat.", "Pola angkanya keliru."], 0, "Pembagian harus mencakup seluruh komponen penting masalah."],
    ["Untuk menata perpustakaan, pecahan pekerjaan mana paling sesuai?", ["Kelompokkan buku, catat lokasi, dan beri label rak.", "Tentukan menu kantin.", "Ubah jam pelajaran.", "Hitung nilai olahraga."], 0, "Tugas tersebut langsung mendukung penataan perpustakaan."],
    ["Tujuan membagi masalah kompleks adalah ...", ["Membuat tiap bagian lebih mudah dipahami dan dikelola.", "Menghilangkan kebutuhan untuk berkomunikasi.", "Menambah pekerjaan yang tidak relevan.", "Memastikan tidak ada evaluasi."], 0, "Bagian yang lebih kecil memudahkan pemahaman serta pengelolaan."]
  ] },
  { topic: "Pengenalan Pola", items: [
    ["Urutan 4, 7, 10, 13 bertambah berapa setiap langkah?", ["2", "3", "4", "7"], 1, "Setiap bilangan bertambah tiga."],
    ["Bus sekolah terlambat pada hari hujan selama beberapa minggu. Data apa yang membantu mengenali pola?", ["Catatan waktu dan kondisi cuaca setiap perjalanan.", "Warna tas penumpang.", "Nama semua film yang ditonton.", "Jumlah poster di kelas."], 0, "Waktu dan cuaca relevan untuk melihat hubungan keterlambatan."],
    ["Bentuk lingkaran, persegi, lingkaran, persegi, ... Bentuk selanjutnya adalah ...", ["Lingkaran", "Segitiga", "Persegi panjang", "Tidak bisa diperkirakan"], 0, "Bentuk bergantian antara lingkaran dan persegi."],
    ["Mengapa perlu memeriksa beberapa data sebelum menyimpulkan pola?", ["Satu contoh dapat kebetulan dan belum cukup menunjukkan aturan.", "Agar data lebih sulit dibaca.", "Karena pola tidak pernah berulang.", "Supaya hasil dapat diacak."], 0, "Beberapa pengamatan membantu memastikan aturan bukan kebetulan."],
    ["Dua soal memiliki susunan langkah yang mirip. Strategi lama boleh digunakan jika ...", ["Kondisi penting kedua soal juga sesuai.", "Kata-katanya sama persis.", "Tidak ada hasil yang diuji.", "Salah satu soal dihapus."], 0, "Kesamaan struktur membantu, tetapi kondisi tetap perlu diperiksa."],
    ["Benar atau salah: pengenalan pola hanya berlaku pada deret angka.", ["Benar", "Salah"], 1, "Pola juga dapat berupa bentuk, kejadian, jadwal, atau data."],
    ["Jadwal piket berulang setiap lima hari sekolah. Informasi ini membantu kita ...", ["Memperkirakan giliran berikutnya.", "Menentukan warna papan tulis.", "Menghapus jadwal.", "Mengubah jumlah siswa."], 0, "Mengenali siklus membantu memperkirakan kejadian berulang."],
    ["Data tinggi tanaman dicatat setiap minggu. Cara yang tepat mencari pola pertumbuhan adalah ...", ["Membandingkan perubahan tinggi dari minggu ke minggu.", "Membandingkan warna pot dengan nama siswa.", "Menghapus tanggal pengamatan.", "Memilih satu data yang disukai."], 0, "Perbandingan berurutan dapat menunjukkan perubahan dan keteraturan."],
    ["Pada 2, 4, 8, 16, bilangan berikutnya menurut aturan penggandaan adalah ...", ["18", "24", "32", "30"], 2, "Setiap nilai dikalikan dua; 16 × 2 = 32."],
    ["Pola yang ditemukan pada antrean kantin menunjukkan antrean terpadat saat istirahat pertama. Kesimpulan terbaik adalah ...", ["Rencanakan cara mengurangi waktu tunggu pada jam tersebut.", "Semua waktu selalu ramai.", "Hapus data hari lain.", "Kantin harus ditutup."], 0, "Gunakan pola yang didukung data untuk memperbaiki rencana."]
  ] },
  { topic: "Abstraksi", items: [
    ["Peta untuk mencari rute menampilkan jalan dan persimpangan. Detail apa yang umumnya tidak diperlukan?", ["Warna baju orang yang lewat.", "Nama jalan.", "Persimpangan.", "Letak tujuan."], 0, "Warna pakaian tidak memengaruhi pencarian rute."],
    ["Memilih kendaraan ke sekolah berdasarkan jarak, biaya, dan keselamatan adalah contoh ...", ["Abstraksi", "Pengenalan pola angka", "Pengacakan", "Pengulangan"], 0, "Informasi yang relevan dengan keputusan dipilih."],
    ["Informasi mana penting untuk jadwal belajar mingguan?", ["Waktu luang dan jadwal tugas.", "Merek sepatu teman.", "Warna sampul buku.", "Jumlah awan di gambar."], 0, "Waktu dan tugas menentukan jadwal yang realistis."],
    ["Mengapa model peta tidak menampilkan setiap batu kecil di jalan?", ["Detail itu biasanya tidak diperlukan untuk memahami rute.", "Peta harus menyembunyikan tujuan.", "Batu menentukan arah utara.", "Semua detail selalu salah."], 0, "Model mempertahankan informasi sesuai tujuan, bukan semua detail."],
    ["Abstraksi yang buruk dapat terjadi jika kita ...", ["Mengabaikan kondisi keselamatan saat memilih rute.", "Mengabaikan warna baju pejalan kaki.", "Menghapus hiasan yang tidak berkaitan.", "Menyederhanakan gambar tanpa mengubah arti."], 0, "Keselamatan memengaruhi keputusan sehingga tidak boleh dihilangkan."],
    ["Benar atau salah: informasi yang penting selalu sama untuk semua tujuan.", ["Benar", "Salah"], 1, "Relevansi informasi bergantung pada pertanyaan atau tujuan."],
    ["Untuk menghitung waktu perjalanan, data mana paling relevan?", ["Jarak dan lama perjalanan.", "Warna kendaraan.", "Nama penyanyi favorit.", "Jumlah jendela rumah."], 0, "Jarak dan durasi berhubungan dengan waktu perjalanan."],
    ["Saat membuat peta tempat duduk kelas, detail yang utama adalah ...", ["Posisi meja dan jalur keluar.", "Motif kaus siswa.", "Menu makan siang.", "Warna langit."], 0, "Susunan tempat dan akses keluar adalah tujuan denah kelas."],
    ["Sederhanakan formulir peminjaman buku. Data minimum yang membantu mengembalikan buku adalah ...", ["Identitas peminjam, buku, tanggal pinjam, dan jatuh tempo.", "Warna kesukaan peminjam.", "Judul film yang ditonton.", "Nama semua teman sekelas."], 0, "Data tersebut mendukung pelacakan pinjaman dan pengembalian."],
    ["Sebelum menghilangkan detail dari model, kita perlu memastikan bahwa detail itu ...", ["Tidak mengubah solusi untuk tujuan yang dipilih.", "Paling mudah dihapus.", "Tidak disukai pembuat model.", "Berupa angka."], 0, "Detail hanya boleh diabaikan jika tidak memengaruhi keputusan."]
  ] },
  { topic: "Algoritma", items: [
    ["Langkah pertama yang wajar untuk mengirim tugas daring adalah ...", ["Masuk ke kelas atau platform yang benar.", "Menekan tombol kirim tanpa berkas.", "Menutup halaman tugas.", "Menghapus nama berkas."], 0, "Pengguna perlu membuka layanan yang tepat sebelum memilih tugas."],
    ["Instruksi 'lakukan seperti biasa' kurang baik karena ...", ["Tidak menjelaskan tindakan secara spesifik.", "Terlalu banyak angka.", "Selalu berakhir dengan benar.", "Tidak memiliki kata kerja."], 0, "Pembaca dapat menafsirkan ungkapan itu dengan cara berbeda."],
    ["Urutan yang benar untuk membuat teh adalah ...", ["Siapkan cangkir, masukkan teh, tuang air, lalu tunggu.", "Tunggu, minum, baru siapkan cangkir.", "Tuang air ke meja, masukkan teh.", "Aduk cangkir kosong lalu buang."], 0, "Urutan dimulai dari menyiapkan wadah dan bahan."],
    ["Sebuah algoritma tidak memeriksa apakah berkas sudah terlampir. Perbaikan yang tepat adalah ...", ["Tambahkan langkah memeriksa lampiran sebelum menekan kirim.", "Hapus langkah memilih tugas.", "Kirim berulang kali.", "Abaikan status."], 0, "Pemeriksaan mengurangi risiko mengirim tugas tanpa berkas."],
    ["Bagaimana cara sederhana menguji algoritma menyusun tas?", ["Jalankan langkah dengan daftar perlengkapan dan cek hasilnya.", "Baca judulnya saja.", "Ubah semua langkah sekaligus.", "Minta orang menebak hasil."], 0, "Pengujian menggunakan contoh dan membandingkan hasil dengan kebutuhan."],
    ["Benar atau salah: urutan langkah algoritma dapat memengaruhi keberhasilan.", ["Benar", "Salah"], 0, "Langkah yang benar dalam urutan salah dapat menghasilkan kegagalan."],
    ["Algoritma yang baik untuk mengirim surat perlu diakhiri dengan ...", ["Memastikan surat diserahkan atau terkirim.", "Menulis alamat setelah surat dikirim.", "Membuka amplop kosong.", "Mengulang semua langkah tanpa batas."], 0, "Langkah akhir memeriksa tercapainya tujuan."],
    ["Kalimat instruksi paling jelas adalah ...", ["Tekan tombol 'Simpan' setelah judul diisi.", "Lakukan yang diperlukan.", "Perbaiki nanti.", "Pilih sesuatu."], 0, "Instruksi menyebut tindakan dan kondisi secara spesifik."],
    ["Jika algoritma selalu berhenti sebelum mencapai tujuan, apa yang harus diperiksa?", ["Apakah ada langkah yang hilang atau kondisi berhenti terlalu cepat.", "Warna halaman.", "Nama pembuat saja.", "Ukuran huruf."], 0, "Langkah hilang atau aturan berhenti yang keliru dapat menghambat tujuan."],
    ["Manakah contoh algoritma yang paling mudah dijalankan orang lain?", ["Langkah bernomor dengan tindakan dan hasil yang jelas.", "Paragraf yang berisi petunjuk samar.", "Daftar tanpa urutan.", "Petunjuk dengan singkatan yang tidak dijelaskan."], 0, "Urutan dan tindakan yang jelas membuat prosedur dapat diikuti."]
  ] },
  { topic: "Flowchart", items: [
    ["Simbol oval pada flowchart umumnya menunjukkan ...", ["Mulai atau selesai.", "Keputusan.", "Proses.", "Data pilihan."], 0, "Oval digunakan sebagai terminator mulai/selesai."],
    ["Simbol belah ketupat paling sesuai untuk ...", ["Memeriksa apakah nilai mencapai batas.", "Menghitung total sebagai proses.", "Menampilkan hasil.", "Menandai awal."], 0, "Belah ketupat menyatakan keputusan atau kondisi."],
    ["Dalam flowchart, panah digunakan untuk ...", ["Menunjukkan arah alur.", "Menyimpan jawaban.", "Mengganti semua simbol.", "Memberi nilai otomatis."], 0, "Panah menghubungkan simbol dan menunjukkan urutan."],
    ["Simbol jajar genjang biasanya menyatakan ...", ["Masukan atau keluaran.", "Mulai dan selesai.", "Keputusan.", "Penghubung halaman web."], 0, "Jajar genjang digunakan untuk input/output."],
    ["Pada keputusan 'Apakah hujan?', cabang sebaiknya diberi label ...", ["Ya dan Tidak.", "Atas dan bawah tanpa arti.", "Merah dan biru saja.", "Satu dan dua."], 0, "Label menjelaskan hasil kondisi yang mengarahkan alur."],
    ["Benar atau salah: flowchart membantu melihat pilihan dan urutan secara visual.", ["Benar", "Salah"], 0, "Representasi visual menunjukkan hubungan antarlangkah."],
    ["Simbol persegi panjang pada flowchart menunjukkan ...", ["Proses atau tindakan.", "Keputusan.", "Arah panah.", "Mulai saja."], 0, "Persegi panjang mewakili proses."],
    ["Alur 'masukkan nilai, hitung rata-rata, tampilkan rata-rata' menggunakan simbol proses untuk ...", ["Hitung rata-rata.", "Mulai.", "Jawaban Ya/Tidak.", "Arah panah."], 0, "Perhitungan adalah tindakan pemrosesan."],
    ["Flowchart memiliki cabang keputusan tanpa label. Apa dampaknya?", ["Pembaca tidak tahu cabang mana yang dipilih.", "Alur pasti lebih cepat.", "Simbol berubah menjadi input.", "Kesalahan tidak mungkin terjadi."], 0, "Label kondisi diperlukan agar jalur dapat diikuti."],
    ["Agar mudah dibaca, flowchart sebaiknya ...", ["Memakai arah konsisten dan jalur yang jelas.", "Memiliki panah tanpa tujuan.", "Menyilangkan semua garis.", "Tidak memiliki titik selesai."], 0, "Konsistensi visual memudahkan pembaca mengikuti alur."]
  ] },
  { topic: "Logika", items: [
    ["Kondisi 'jumlah peserta lebih dari 20' bernilai benar jika jumlah peserta 24. Nilainya ...", ["Benar", "Salah"], 0, "24 lebih besar daripada 20."],
    ["Aturan: jika hujan maka membawa payung. Kondisi yang menentukan tindakan adalah ...", ["Hujan atau tidak hujan.", "Warna payung.", "Nama jalan.", "Jumlah buku."], 0, "Aturan memeriksa kondisi hujan."],
    ["Syarat masuk kegiatan adalah membawa kartu DAN sudah mendaftar. Seseorang memenuhi syarat jika ...", ["Membawa kartu dan sudah mendaftar.", "Hanya membawa kartu.", "Hanya sudah mendaftar.", "Tidak melakukan keduanya."], 0, "Kata DAN mensyaratkan kedua kondisi benar."],
    ["Aturan: boleh memilih jus apel ATAU jus jeruk. Jika memilih jeruk, kondisi pilihan terpenuhi karena ...", ["Pada ATAU cukup salah satu pilihan benar.", "Semua pilihan harus benar.", "Tidak ada pilihan benar.", "Jeruk bukan minuman."], 0, "ATAU menerima setidaknya satu kondisi benar."],
    ["Kondisi 'nilai ≥ 75' untuk nilai 70 menghasilkan ...", ["Salah", "Benar", "Tidak dapat diperiksa", "Keduanya"], 0, "70 tidak lebih besar atau sama dengan 75."],
    ["Benar atau salah: pernyataan kondisi sebaiknya dapat diperiksa sebagai benar atau salah.", ["Benar", "Salah"], 0, "Kondisi yang dapat diperiksa menghasilkan keputusan konsisten."],
    ["Jika tugas selesai, tampilkan 'Selesai'; jika belum, lanjutkan. Ini contoh ...", ["Percabangan berdasarkan kondisi.", "Pengacakan hasil.", "Dekomposisi tanpa syarat.", "Pola bentuk."], 0, "Tindakan dipilih sesuai kondisi tugas."],
    ["Lampu menyala jika sensor gelap ATAU tombol ditekan. Sensor terang dan tombol tidak ditekan. Lampu ...", ["Tidak menyala.", "Menyala karena ATAU selalu benar.", "Menyala dua kali.", "Tidak dapat dinilai."], 0, "Kedua kondisi salah, maka gabungan ATAU salah."],
    ["Aturan peminjaman perlu menyebut tindakan saat buku tidak tersedia. Mengapa?", ["Agar kondisi lain juga memiliki alur yang jelas.", "Supaya buku langsung tersedia.", "Agar keputusan dihapus.", "Karena semua kondisi selalu benar."], 0, "Cabang untuk kondisi alternatif mencegah alur tidak memiliki tindakan."],
    ["Jika umur minimal 12 DAN memiliki izin, Rani berumur 13 tetapi belum memiliki izin. Ia ...", ["Belum memenuhi kedua syarat.", "Pasti memenuhi karena umurnya cukup.", "Pasti memenuhi karena DAN berarti salah satu.", "Tidak dapat diketahui."], 0, "Dengan DAN, semua syarat harus terpenuhi."]
  ] },
  { topic: "Debugging", items: [
    ["Hasil perhitungan selalu satu angka terlalu besar. Langkah awal debugging yang baik adalah ...", ["Uji contoh kecil dan telusuri langkah perhitungan.", "Ubah semua kode sekaligus.", "Hapus data uji.", "Abaikan hasil."], 0, "Contoh kecil membantu menemukan langkah ketika hasil menyimpang."],
    ["Daftar piket memuat nama yang sama dua kali. Bagian yang perlu diperiksa adalah ...", ["Aturan pembagian atau pencatatan nama.", "Warna kertas.", "Ukuran ruangan.", "Judul daftar saja."], 0, "Gejala duplikasi mengarah pada aturan atau proses pencatatan."],
    ["Setelah memperbaiki algoritma, tindakan penting berikutnya adalah ...", ["Uji kembali dengan data yang sesuai.", "Anggap pasti berhasil.", "Hapus hasil lama tanpa catatan.", "Hindari semua masukan."], 0, "Pengujian memastikan perbaikan mengatasi masalah."],
    ["Sistem menyatakan lulus saat nilai 70 padahal batas 75. Kemungkinan kesalahan ada pada ...", ["Kondisi keputusan atau batas perbandingan.", "Warna flowchart.", "Nama pengguna.", "Jumlah halaman."], 0, "Kondisi ambang perlu diperiksa karena menentukan hasil lulus."],
    ["Solusi A lebih cepat tetapi tidak aman; solusi B sedikit lebih lama dan aman. Kriteria mana yang harus dipertimbangkan?", ["Keamanan dan efisiensi bersama-sama.", "Kecepatan saja.", "Jumlah warna.", "Panjang nama solusi."], 0, "Evaluasi mempertimbangkan beberapa kriteria, termasuk keamanan."],
    ["Benar atau salah: debugging sebaiknya mencari penyebab, bukan hanya menutupi gejala.", ["Benar", "Salah"], 0, "Perbaikan akar masalah mencegah kesalahan berulang."],
    ["Kesalahan hanya muncul pada data kosong. Kasus uji berikutnya sebaiknya ...", ["Masukan kosong untuk menelusuri penanganannya.", "Hanya masukan angka besar.", "Mengganti tema.", "Tidak melakukan pengujian."], 0, "Kasus yang memicu gejala membantu menemukan penyebab."],
    ["Ketika membandingkan dua rute, kriteria relevan adalah ...", ["Waktu, jarak, dan keselamatan.", "Warna kendaraan teman.", "Merek tas.", "Judul buku."], 0, "Kriteria tersebut berkaitan langsung dengan kualitas rute."],
    ["Perbaikan satu langkah membuat hasil benar untuk satu contoh. Sebelum yakin, kita sebaiknya ...", ["Uji juga contoh lain, termasuk kondisi batas.", "Hentikan semua pengujian.", "Hapus aturan yang diperbaiki.", "Sembunyikan hasil."], 0, "Beberapa contoh menguji apakah perbaikan berlaku secara konsisten."],
    ["Cara mengubah algoritma yang paling mudah dievaluasi adalah ...", ["Perbaiki satu penyebab, catat perubahan, lalu uji.", "Ubah semua bagian tanpa catatan.", "Ganti tujuan masalah.", "Hindari membandingkan hasil."], 0, "Perubahan terarah memudahkan menemukan dampaknya."]
  ] },
  { topic: "Studi Kasus", items: [
    ["Untuk merencanakan rute sekolah, data terpenting antara lain ...", ["Jarak, waktu tempuh, kondisi jalan, dan keselamatan.", "Warna tas teman.", "Judul lagu di rumah.", "Bentuk awan bulan lalu."], 0, "Data tersebut membantu membandingkan pilihan perjalanan."],
    ["Mengatur antrean perpustakaan saat istirahat paling tepat dimulai dengan ...", ["Mengamati alur dan waktu tunggu, lalu mencari titik masalah.", "Mengubah warna buku.", "Menutup perpustakaan permanen.", "Menduga tanpa mengamati."], 0, "Pengamatan memberi dasar untuk menguraikan dan memperbaiki masalah."],
    ["Jadwal ujian beberapa mata pelajaran berdekatan. Strategi komputasional yang tepat adalah ...", ["Petakan mata pelajaran, waktu, materi, lalu susun jadwal realistis.", "Belajar satu mata pelajaran saja.", "Hapus semua tanggal.", "Pilih jadwal acak."], 0, "Solusi mempertimbangkan komponen dan batasan yang relevan."],
    ["Aturan peminjaman buku harus menangani kondisi buku habis dipinjam. Tindakan yang sesuai adalah ...", ["Tampilkan bahwa buku tidak tersedia dan sediakan pilihan lain.", "Catat peminjaman seolah buku tersedia.", "Hapus data buku.", "Hentikan sistem tanpa pesan."], 0, "Kasus alternatif membutuhkan respons yang jelas."],
    ["Untuk membagi tugas kelompok secara adil, informasi yang perlu dipertimbangkan adalah ...", ["Jenis tugas, waktu, kemampuan, dan beban tiap anggota.", "Warna sepatu.", "Urutan nama di daftar saja.", "Merek telepon."], 0, "Informasi itu berhubungan dengan pembagian yang realistis dan seimbang."],
    ["Benar atau salah: satu masalah nyata dapat membutuhkan beberapa konsep berpikir komputasional sekaligus.", ["Benar", "Salah"], 0, "Masalah kompleks sering menggabungkan penguraian, pola, abstraksi, algoritma, dan evaluasi."],
    ["Kantin ramai hanya pada dua waktu istirahat. Temuan ini dapat dipakai untuk ...", ["Menyesuaikan petugas atau alur layanan pada waktu ramai.", "Menghapus seluruh jam istirahat.", "Mengabaikan antrean.", "Menutup kantin setiap hari."], 0, "Pola jam ramai membantu menyusun intervensi yang tepat."],
    ["Saat merancang prosedur evakuasi, abstraksi yang berbahaya adalah mengabaikan ...", ["Jalur aman dan kebutuhan orang yang perlu bantuan.", "Warna hiasan dinding.", "Merek papan tulis.", "Ukuran poster."], 0, "Keselamatan dan kebutuhan bantuan memengaruhi keberhasilan evakuasi."],
    ["Bagaimana menguji sistem antrean baru?", ["Uji saat jumlah pengunjung berbeda dan ukur waktu tunggu.", "Tanyakan warna favorit saja.", "Uji tanpa pengunjung.", "Nilai dari tampilannya saja."], 0, "Pengujian dengan kondisi berbeda menilai hasil dan kapasitas."],
    ["Sebuah solusi perjalanan cepat tetapi melewati jalan berbahaya. Pilihan terbaik adalah ...", ["Bandingkan alternatif dengan keselamatan sebagai kriteria utama.", "Pilih yang tercepat tanpa pertimbangan.", "Abaikan kondisi jalan.", "Hapus waktu tempuh."], 0, "Solusi efektif juga perlu memenuhi kriteria keselamatan."]
  ] },
  { topic: "Evaluasi Akhir", items: [
    ["Urutan konsep paling masuk akal saat mulai menangani masalah baru adalah ...", ["Pahami dan uraikan masalah, pilih informasi, susun solusi, lalu uji.", "Tebak jawaban, hapus masalah, selesai.", "Gambar panah tanpa tujuan.", "Nilai hasil sebelum ada solusi."], 0, "Proses dimulai dengan memahami masalah dan dilanjutkan ke solusi serta evaluasi."],
    ["Jika pengujian menunjukkan informasi penting belum dipertimbangkan, kita sebaiknya ...", ["Perbaiki model atau abstraksi, lalu uji kembali.", "Tetap memakai hasil yang salah.", "Hapus seluruh data.", "Menyatakan masalah mustahil."], 0, "Pemecahan masalah bersifat iteratif dan dapat kembali memperbaiki model."],
    ["Peta konsep berpikir komputasional menghubungkan debugging dengan ...", ["Menguji dan memperbaiki langkah solusi.", "Mengganti semua tujuan.", "Memilih warna poster.", "Menambah langkah tanpa evaluasi."], 0, "Debugging menguji hasil, menemukan kesalahan, dan memperbaiki solusi."],
    ["Nilai kuis rendah pada satu topik sebaiknya dipakai sebagai ...", ["Petunjuk materi yang perlu dilatih lagi.", "Label kemampuan permanen.", "Alasan berhenti belajar.", "Bukti bahwa semua topik sulit."], 0, "Hasil aktivitas membantu memilih latihan selanjutnya, bukan memberi label tetap."],
    ["Solusi akhir yang dapat dipercaya adalah solusi yang ...", ["Sesuai tujuan, diuji, dan memenuhi kriteria penting.", "Hanya terlihat menarik.", "Tidak pernah diperiksa.", "Selalu paling pendek."], 0, "Kecocokan tujuan dan bukti pengujian lebih penting dari tampilan atau panjang saja."],
    ["Benar atau salah: setelah menemukan satu solusi, proses berpikir komputasional tidak boleh diulang.", ["Benar", "Salah"], 1, "Hasil uji dapat memerlukan perbaikan berulang."],
    ["Kapan kita perlu menguraikan masalah lebih lanjut?", ["Saat salah satu bagiannya masih terlalu rumit untuk dikerjakan.", "Saat semua hasil sudah benar.", "Saat tujuan tidak penting.", "Tidak pernah."], 0, "Bagian yang masih kompleks dapat dipecah lagi."],
    ["Dalam peta konsep, flowchart terutama membantu ...", ["Mewakili urutan proses dan percabangan secara visual.", "Menyimpan password.", "Memprediksi semua hasil acak.", "Mengganti pengujian."], 0, "Flowchart menggambarkan alur dan keputusan."],
    ["Dua solusi sama-sama benar. Cara memilih yang lebih baik adalah ...", ["Bandingkan dengan kriteria seperti aman, mudah, dan efisien.", "Pilih yang memiliki nama lebih bagus.", "Pilih secara acak saja.", "Hindari membahas kebutuhan."], 0, "Kriteria membantu membandingkan alternatif secara masuk akal."],
    ["Apa bukti paling baik bahwa pemahaman suatu topik meningkat?", ["Hasil beberapa latihan relevan yang konsisten dari waktu ke waktu.", "Satu tebakan benar.", "Jumlah halaman yang dibuka saja.", "Badge tanpa aktivitas."], 0, "Bukti berulang dari aktivitas relevan lebih bermakna daripada satu jawaban."]
  ] }
];

const interactiveQuestions: Array<{
  prompt: string; options: string[]; answer: string[] | string; type: QuestionType;
  topic: string; explanation: string; difficulty: Difficulty;
}> = [
  { prompt: "Pilih semua kegiatan yang termasuk dekomposisi saat menyiapkan pameran kelas.", options: ["Membagi tugas stan, promosi, dan perlengkapan.", "Memastikan setiap tugas memiliki penanggung jawab.", "Mengabaikan kebutuhan pengunjung.", "Menggabungkan semua tugas menjadi satu pekerjaan tanpa rincian."], answer: ["Membagi tugas stan, promosi, dan perlengkapan.", "Memastikan setiap tugas memiliki penanggung jawab."], type: QuestionType.MULTIPLE_CHOICE, topic: "Dekomposisi", explanation: "Dekomposisi membagi pekerjaan dan membuat bagian tugas dapat ditangani dengan jelas.", difficulty: Difficulty.INTERMEDIATE },
  { prompt: "Pilih informasi yang relevan untuk menentukan rute paling aman ke sekolah.", options: ["Kondisi jalan.", "Jarak dan waktu tempuh.", "Warna tas teman.", "Ketersediaan trotoar."], answer: ["Kondisi jalan.", "Jarak dan waktu tempuh.", "Ketersediaan trotoar."], type: QuestionType.MULTIPLE_CHOICE, topic: "Abstraksi", explanation: "Jarak, waktu, kondisi, dan trotoar berpengaruh pada pilihan rute; warna tas tidak.", difficulty: Difficulty.INTERMEDIATE },
  { prompt: "Pilih semua praktik yang membantu menguji algoritma pengumpulan tugas.", options: ["Mencoba alur dengan berkas contoh.", "Memastikan status pengiriman berhasil.", "Mengubah semua langkah sekaligus tanpa catatan.", "Menguji kondisi jika berkas belum dipilih."], answer: ["Mencoba alur dengan berkas contoh.", "Memastikan status pengiriman berhasil.", "Menguji kondisi jika berkas belum dipilih."], type: QuestionType.MULTIPLE_CHOICE, topic: "Algoritma", explanation: "Kasus normal dan kondisi berkas kosong perlu diuji, serta hasil perlu dikonfirmasi.", difficulty: Difficulty.ADVANCED },
  { prompt: "Pilih hal yang perlu diperiksa ketika flowchart keputusan tidak menunjukkan hasil untuk cabang Tidak.", options: ["Jalur keluar dari keputusan.", "Label kondisi.", "Simbol akhir pada alur tersebut.", "Warna latar halaman."], answer: ["Jalur keluar dari keputusan.", "Label kondisi.", "Simbol akhir pada alur tersebut."], type: QuestionType.MULTIPLE_CHOICE, topic: "Flowchart", explanation: "Setiap hasil keputusan perlu memiliki cabang berlabel dan alur yang jelas.", difficulty: Difficulty.ADVANCED },
  { prompt: "Pilih semua pernyataan kondisi yang dapat diuji benar atau salah.", options: ["Jumlah buku yang dipinjam lebih dari tiga.", "Nama yang terasa bagus.", "Tanggal pengembalian sudah lewat.", "Meja itu tampak cukup nyaman."], answer: ["Jumlah buku yang dipinjam lebih dari tiga.", "Tanggal pengembalian sudah lewat."], type: QuestionType.MULTIPLE_CHOICE, topic: "Logika", explanation: "Kondisi perlu memiliki makna yang dapat diperiksa secara konsisten.", difficulty: Difficulty.INTERMEDIATE },
  { prompt: "Pilih semua langkah debugging yang baik saat hasil tidak sesuai.", options: ["Buat kasus uji kecil.", "Bandingkan hasil yang diharapkan dan aktual.", "Ubah satu penyebab yang dicurigai.", "Hapus pesan kesalahan tanpa mencari sebab."], answer: ["Buat kasus uji kecil.", "Bandingkan hasil yang diharapkan dan aktual.", "Ubah satu penyebab yang dicurigai."], type: QuestionType.MULTIPLE_CHOICE, topic: "Debugging", explanation: "Kasus kecil dan perubahan terarah memudahkan penelusuran penyebab.", difficulty: Difficulty.INTERMEDIATE },
  { prompt: "Lengkapi aturan pola: 5, 10, 15, 20, __. Tuliskan bilangan berikutnya.", options: [], answer: ["25", "dua puluh lima"], type: QuestionType.SHORT_ANSWER, topic: "Pengenalan Pola", explanation: "Bilangan bertambah lima setiap langkah, sehingga 20 + 5 = 25.", difficulty: Difficulty.BEGINNER },
  { prompt: "Dalam simbol flowchart, bentuk yang menyatakan keputusan disebut apa?", options: [], answer: ["belah ketupat", "diamond"], type: QuestionType.SHORT_ANSWER, topic: "Flowchart", explanation: "Belah ketupat digunakan untuk menunjukkan keputusan atau kondisi.", difficulty: Difficulty.BEGINNER },
  { prompt: "Algoritma menaruh sepatu, memakai kaus kaki, lalu mengikat tali sepatu. Langkah apa yang perlu dipindah ke sebelum memakai sepatu?", options: [], answer: ["memakai kaus kaki", "pakai kaus kaki"], type: QuestionType.SHORT_ANSWER, topic: "Algoritma", explanation: "Kaus kaki dipakai sebelum sepatu agar urutan langkah masuk akal.", difficulty: Difficulty.INTERMEDIATE },
  { prompt: "Sebutkan satu konsep yang membagi masalah besar menjadi bagian-bagian kecil.", options: [], answer: ["dekomposisi"], type: QuestionType.SHORT_ANSWER, topic: "Dekomposisi", explanation: "Dekomposisi adalah proses menguraikan masalah menjadi bagian lebih kecil.", difficulty: Difficulty.BEGINNER },
  { prompt: "Kondisi nilai >= 75 menghasilkan keputusan apa untuk nilai 82: Benar atau Salah?", options: ["Benar", "Salah"], answer: "Benar", type: QuestionType.TRUE_FALSE, topic: "Logika", explanation: "82 lebih besar dari atau sama dengan batas 75.", difficulty: Difficulty.BEGINNER },
  { prompt: "Sebuah tim menguji rute hanya pada hari cerah, lalu menyimpulkan rute selalu aman saat hujan. Apakah kesimpulan itu cukup didukung?", options: ["Ya", "Tidak"], answer: "Tidak", type: QuestionType.TRUE_FALSE, topic: "Evaluasi Akhir", explanation: "Kondisi hujan belum diuji, sehingga bukti tersebut belum mendukung kesimpulan untuk semua kondisi.", difficulty: Difficulty.ADVANCED },
  { prompt: "Pilih semua alasan mengapa langkah algoritma perlu ditulis jelas.", options: ["Orang lain dapat mengikuti langkah yang sama.", "Langkah dapat diuji dan diperbaiki.", "Instruksi samar selalu lebih efisien.", "Urutan tindakan menjadi mudah diperiksa."], answer: ["Orang lain dapat mengikuti langkah yang sama.", "Langkah dapat diuji dan diperbaiki.", "Urutan tindakan menjadi mudah diperiksa."], type: QuestionType.MULTIPLE_CHOICE, topic: "Algoritma", explanation: "Instruksi jelas mendukung pelaksanaan konsisten, pengujian, dan perbaikan.", difficulty: Difficulty.INTERMEDIATE },
  { prompt: "Untuk mengatur antrean, mana tindakan yang didukung oleh data waktu tunggu?", options: ["Membandingkan lama layanan di beberapa jam.", "Memilih petugas berdasarkan warna baju.", "Mengabaikan jumlah pengunjung.", "Menghapus catatan waktu."], answer: ["Membandingkan lama layanan di beberapa jam."], type: QuestionType.SINGLE_CHOICE, topic: "Studi Kasus", explanation: "Perbandingan waktu tunggu pada periode berbeda membantu menemukan jam ramai.", difficulty: Difficulty.INTERMEDIATE },
  { prompt: "Pilih semua contoh pengenalan pola.", options: ["Menemukan bahwa piket berulang tiap lima hari.", "Melihat kemacetan berulang pada jam tertentu.", "Menghapus jadwal kelas.", "Mengenali aturan bentuk yang bergantian."], answer: ["Menemukan bahwa piket berulang tiap lima hari.", "Melihat kemacetan berulang pada jam tertentu.", "Mengenali aturan bentuk yang bergantian."], type: QuestionType.MULTIPLE_CHOICE, topic: "Pengenalan Pola", explanation: "Pola merupakan keteraturan berulang pada jadwal, kejadian, atau urutan bentuk.", difficulty: Difficulty.INTERMEDIATE },
  { prompt: "Sebutkan nama simbol flowchart yang menandai mulai atau selesai.", options: [], answer: ["oval", "terminator"], type: QuestionType.SHORT_ANSWER, topic: "Flowchart", explanation: "Simbol oval atau terminator menandai awal maupun akhir flowchart.", difficulty: Difficulty.BEGINNER },
  { prompt: "Untuk menghitung biaya perjalanan, apakah warna tas penumpang merupakan informasi yang relevan?", options: ["Ya", "Tidak"], answer: "Tidak", type: QuestionType.TRUE_FALSE, topic: "Abstraksi", explanation: "Warna tas tidak berpengaruh pada perhitungan biaya perjalanan.", difficulty: Difficulty.BEGINNER },
  { prompt: "Pilih semua kriteria yang layak digunakan untuk mengevaluasi rute.", options: ["Keselamatan.", "Waktu tempuh.", "Jarak.", "Warna favorit pembuat peta."], answer: ["Keselamatan.", "Waktu tempuh.", "Jarak."], type: QuestionType.MULTIPLE_CHOICE, topic: "Studi Kasus", explanation: "Keselamatan, waktu, dan jarak relevan untuk mengevaluasi rute.", difficulty: Difficulty.ADVANCED },
  { prompt: "Benar atau salah: memperbaiki satu kemungkinan penyebab lalu menguji kembali membuat hasil debugging lebih mudah ditelusuri.", options: ["Benar", "Salah"], answer: "Benar", type: QuestionType.TRUE_FALSE, topic: "Debugging", explanation: "Perubahan terarah menunjukkan apakah perubahan tersebut mengatasi sumber masalah.", difficulty: Difficulty.INTERMEDIATE },
  { prompt: "Sebuah syarat menyatakan harus membawa kartu DAN sudah mendaftar. Jika salah satu syarat belum terpenuhi, apakah peserta lolos?", options: ["Ya", "Tidak"], answer: "Tidak", type: QuestionType.TRUE_FALSE, topic: "Logika", explanation: "Operator DAN mengharuskan kedua kondisi bernilai benar.", difficulty: Difficulty.INTERMEDIATE }
];

const initialQuestionCount = questionSets.reduce((count, bank) => count + bank.items.length, 0) + interactiveQuestions.length;

async function main() {
  if (initialQuestionCount !== 120) throw new Error(`Expected 120 authored seed questions, found ${initialQuestionCount}.`);
  const previousSeed = await db.siteSetting.findUnique({
    where: { key: "_internal_seed_v1" },
    select: { key: true }
  });
  if (previousSeed) {
    console.info("Initial seed already completed; preserving database-managed content.");
    return;
  }
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (adminUsername && adminPassword) {
    const normalizedAdminUsername = adminUsername.toLowerCase();
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(normalizedAdminUsername) || adminPassword.length < 10 || adminPassword.length > 72
      || !/[a-z]/.test(adminPassword) || !/[A-Z]/.test(adminPassword) || !/[0-9]/.test(adminPassword)) {
      throw new Error("ADMIN_USERNAME or ADMIN_INITIAL_PASSWORD does not meet the required format and password policy.");
    }
    const existing = await db.user.findUnique({ where: { username: normalizedAdminUsername } });
    if (!existing) {
      await db.user.create({
        data: {
          username: normalizedAdminUsername,
          displayName: "Administrator KOMPITA",
          role: "ADMIN",
          profile: "TEEN",
          mustChangePassword: true,
          passwordHash: await bcrypt.hash(adminPassword, 12)
        }
      });
      console.info(`Initial admin ${adminUsername} created. Change the initial password after signing in.`);
    } else if (existing.role !== "ADMIN") {
      throw new Error("ADMIN_USERNAME is already used by a non-admin account. Choose another username.");
    }
  } else {
    console.warn("Admin seed skipped: set ADMIN_USERNAME and ADMIN_INITIAL_PASSWORD to provision an administrator.");
  }

  for (let index = 0; index < lessons.length; index++) {
    const lesson = lessons[index];
    await db.lesson.upsert({
      where: { slug: lesson.slug },
      update: { title: lesson.title, summary: lesson.summary, topic: lesson.topic, durationMin: lesson.durationMin, order: index + 1, content: lesson.content },
      create: { ...lesson, order: index + 1, content: lesson.content, difficulty: index > 6 ? "INTERMEDIATE" : "BEGINNER", nextLessonSlug: lessons[index + 1]?.slug }
    });
  }

  const quiz = await db.quizSet.upsert({
    where: { slug: "latihan-berpikir-komputasional" },
    update: { title: "Latihan Berpikir Komputasional", description: "Latihan campuran dari sepuluh topik utama." },
    create: { slug: "latihan-berpikir-komputasional", title: "Latihan Berpikir Komputasional", description: "Latihan campuran dari sepuluh topik utama." }
  });

  for (const bank of questionSets) {
    for (let index = 0; index < bank.items.length; index++) {
      const [prompt, options, answerIndex, explanation] = bank.items[index];
      const slug = lessons.find((lesson) => lesson.topic === bank.topic)?.slug;
      const lesson = slug ? await db.lesson.findUnique({ where: { slug }, select: { id: true } }) : null;
      const isTrueFalse = options.length === 2;
      const type = isTrueFalse ? QuestionType.TRUE_FALSE : QuestionType.SINGLE_CHOICE;
      await db.quizQuestion.upsert({
        where: { id: `seed-${bank.topic.toLowerCase().replace(/\W+/g, "-")}-${index + 1}` },
        update: { prompt, options, answer: options[answerIndex], explanation, topic: bank.topic },
        create: {
          id: `seed-${bank.topic.toLowerCase().replace(/\W+/g, "-")}-${index + 1}`,
          prompt, type, options, answer: options[answerIndex], explanation, topic: bank.topic,
          profile: [LearningProfile.CHILD, LearningProfile.TEEN, LearningProfile.ADULT][index % 3],
          difficulty: index < 4 ? Difficulty.BEGINNER : index < 8 ? Difficulty.INTERMEDIATE : Difficulty.ADVANCED,
          lessonId: lesson?.id
        }
      });
    }
  }
  for (let index = 0; index < interactiveQuestions.length; index++) {
    const item = interactiveQuestions[index];
    const lesson = await db.lesson.findFirst({ where: { topic: item.topic }, select: { id: true } });
    await db.quizQuestion.upsert({
      where: { id: `seed-interactive-${index + 1}` },
      update: {
        prompt: item.prompt, options: item.options, answer: item.answer, explanation: item.explanation,
        type: item.type, topic: item.topic, difficulty: item.difficulty
      },
      create: {
        id: `seed-interactive-${index + 1}`, prompt: item.prompt, options: item.options, answer: item.answer,
        explanation: item.explanation, type: item.type, topic: item.topic, difficulty: item.difficulty,
        profile: [LearningProfile.CHILD, LearningProfile.TEEN, LearningProfile.ADULT][index % 3],
        lessonId: lesson?.id
      }
    });
  }

  const events = [
    { slug: "tantangan-logika-mingguan", title: "Tantangan Logika Mingguan", description: "Pecahkan tantangan pola dan algoritma baru. Ajak temanmu berdiskusi dan bandingkan strategi penyelesaiannya.", category: "Tantangan", location: "Belajar mandiri di KOMPITA", startAt: new Date("2026-01-01T00:00:00.000Z"), endAt: new Date("2027-01-01T00:00:00.000Z"), status: "ACTIVE" as const }
  ];
  for (const event of events) {
    await db.event.upsert({ where: { slug: event.slug }, update: event, create: event });
  }
  await db.siteSetting.upsert({
    where: { key: "theme" },
    update: {},
    create: { key: "theme", value: { appName: "KOMPITA", tagline: "Belajar Logika, Pecahkan Masalah, Bangun Masa Depan.", primaryColor: "#2563EB", secondaryColor: "#163A70", backgroundColor: "#F5F8FF" } }
  });
  await db.achievement.createMany({
    data: [
      { slug: "langkah-pertama", title: "Langkah Pertama", description: "Selesaikan materi pertamamu.", points: 20 },
      { slug: "pemecah-masalah", title: "Pemecah Masalah", description: "Selesaikan evaluasi terpadu.", points: 40 },
      { slug: "konsisten-belajar", title: "Konsisten Belajar", description: "Selesaikan lima materi.", points: 50 }
    ],
    skipDuplicates: true
  });
  const count = await db.quizQuestion.count({ where: { isActive: true } });
  if (count < 120) throw new Error(`Seed created only ${count} active questions; expected at least 120.`);
  await db.siteSetting.create({ data: { key: "_internal_seed_v1", value: true } });
  console.info(`Seed complete: ${lessons.length} lessons and ${count} active questions.`);
  void quiz;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await db.$disconnect();
});
