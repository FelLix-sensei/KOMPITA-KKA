export const developer = {
  name: "Rizki Fathan Nugraha",
  className: "VII B",
  school: "SMPN 2 NGAGLIK"
};

export const defaultSettings = {
  appName: "KOMPITA",
  tagline: "Belajar Logika, Pecahkan Masalah, Bangun Masa Depan.",
  primaryColor: "#2563EB",
  secondaryColor: "#163A70",
  backgroundColor: "#F5F8FF"
};

export const topics = [
  "Berpikir Komputasional", "Dekomposisi", "Pengenalan Pola", "Abstraksi",
  "Algoritma", "Flowchart", "Logika", "Debugging", "Studi Kasus", "Evaluasi Akhir"
];

export const learningStatus = (accuracy: number, attempts: number) => {
  if (attempts < 3) return "Data belum cukup";
  if (accuracy < 40) return "Perlu mempelajari kembali";
  if (accuracy < 60) return "Mulai memahami";
  if (accuracy < 80) return "Cukup memahami";
  return "Menguasai";
};
