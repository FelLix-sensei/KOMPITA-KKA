import { z } from "zod";

export const usernameSchema = z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_.-]+$/, "Username hanya boleh berisi huruf, angka, titik, garis bawah, dan tanda hubung.");
export const passwordSchema = z.string().min(10).max(72).regex(/[a-z]/, "Password harus memuat huruf kecil.").regex(/[A-Z]/, "Password harus memuat huruf besar.").regex(/[0-9]/, "Password harus memuat angka.");
export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: z.string().trim().min(2).max(80),
  profile: z.enum(["CHILD", "TEEN", "ADULT"]).default("TEEN")
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Konfirmasi password tidak cocok."
});

export function normalizeShortAnswer(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("id-ID").replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");
}

export function isCorrectAnswer(type: string, submitted: unknown, answer: unknown): boolean {
  if (type === "MULTIPLE_CHOICE") {
    if (!Array.isArray(submitted) || !Array.isArray(answer)) return false;
    return [...submitted].map(String).sort().join("|") === [...answer].map(String).sort().join("|");
  }
  if (type === "SHORT_ANSWER") {
    if (typeof submitted !== "string") return false;
    const accepted = Array.isArray(answer) ? answer : [answer];
    return accepted.some((item) => typeof item === "string" && normalizeShortAnswer(submitted) === normalizeShortAnswer(item));
  }
  return String(submitted) === String(answer);
}

export function hasExactQuestionSet(expected: string[], submitted: string[]) {
  const expectedSet = new Set(expected);
  const submittedSet = new Set(submitted);
  return expectedSet.size === expected.length
    && submittedSet.size === submitted.length
    && expectedSet.size === submittedSet.size
    && [...expectedSet].every((id) => submittedSet.has(id));
}
