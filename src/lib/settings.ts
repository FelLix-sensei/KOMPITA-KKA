import "server-only";
import { db } from "@/lib/db";
import { defaultSettings } from "@/lib/content";

export async function getSiteTheme() {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "theme" } });
    const value = setting?.value;
    if (!value || typeof value !== "object" || Array.isArray(value)) return defaultSettings;
    const settings = value as Record<string, unknown>;
    const validColor = (key: string, fallback: string) =>
      typeof settings[key] === "string" && /^#[0-9a-fA-F]{6}$/.test(settings[key] as string) ? settings[key] as string : fallback;
    return {
      appName: typeof settings.appName === "string" ? settings.appName.slice(0, 40) : defaultSettings.appName,
      tagline: typeof settings.tagline === "string" ? settings.tagline.slice(0, 120) : defaultSettings.tagline,
      primaryColor: validColor("primaryColor", defaultSettings.primaryColor),
      secondaryColor: validColor("secondaryColor", defaultSettings.secondaryColor),
      backgroundColor: validColor("backgroundColor", defaultSettings.backgroundColor)
    };
  } catch (error) {
    console.error("Website settings query failed; default theme is active.", error);
    return defaultSettings;
  }
}
