import { redirect } from "next/navigation";
import { AdminManager } from "@/components/AdminManager";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return <div className="admin-page"><AdminManager /></div>;
}
