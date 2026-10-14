import { DatabaseZap } from "lucide-react";

export function DatabaseNotice() {
  return <div className="database-notice" role="status"><DatabaseZap size={20} /><div><strong>Database belum terhubung.</strong><p>Atur `DATABASE_URL`, jalankan migration dan seed. Langkah lengkap ada di README.md.</p></div></div>;
}
