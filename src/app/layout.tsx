import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCurrentUser } from "@/lib/auth";
import { getSiteTheme } from "@/lib/settings";

export const metadata: Metadata = {
  title: { default: "KOMPITA — Berpikir Komputasional Interaktif", template: "%s | KOMPITA" },
  description: "Media pembelajaran Informatika kelas VII untuk memahami berpikir komputasional dengan materi, latihan, dan progres belajar.",
  applicationName: "KOMPITA"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const theme = await getSiteTheme();
  return <html lang="id"><body style={{ "--brand-primary": theme.primaryColor, "--brand-secondary": theme.secondaryColor, "--page-background": theme.backgroundColor } as React.CSSProperties}><SiteHeader user={user} appName={theme.appName} /><main>{children}</main><SiteFooter appName={theme.appName} tagline={theme.tagline} /></body></html>;
}
