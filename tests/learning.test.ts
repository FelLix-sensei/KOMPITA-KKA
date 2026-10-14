import test from "node:test";
import assert from "node:assert/strict";
import { hasExactQuestionSet, isCorrectAnswer, normalizeShortAnswer } from "../src/lib/validation";
import { learningStatus } from "../src/lib/content";
import { verifyRequestOrigin } from "../src/lib/http";

test("grades single choice and true/false answers exactly", () => {
  assert.equal(isCorrectAnswer("SINGLE_CHOICE", "Dekomposisi", "Dekomposisi"), true);
  assert.equal(isCorrectAnswer("TRUE_FALSE", "Salah", "Benar"), false);
});

test("multiple-choice scoring requires exactly the complete correct set", () => {
  const answer = ["A", "C"];
  assert.equal(isCorrectAnswer("MULTIPLE_CHOICE", ["C", "A"], answer), true);
  assert.equal(isCorrectAnswer("MULTIPLE_CHOICE", ["A"], answer), false);
  assert.equal(isCorrectAnswer("MULTIPLE_CHOICE", ["A", "B", "C"], answer), false);
});

test("short answers use explicit normalized accepted answers", () => {
  assert.equal(normalizeShortAnswer("  DUA   Puluh Lima. "), "dua puluh lima");
  assert.equal(isCorrectAnswer("SHORT_ANSWER", "Dua puluh lima!", ["25", "dua puluh lima"]), true);
  assert.equal(isCorrectAnswer("SHORT_ANSWER", "dua puluh", ["25", "dua puluh lima"]), false);
});

test("topic mastery waits for three relevant responses", () => {
  assert.equal(learningStatus(100, 1), "Data belum cukup");
  assert.equal(learningStatus(39, 3), "Perlu mempelajari kembali");
  assert.equal(learningStatus(55, 3), "Mulai memahami");
  assert.equal(learningStatus(75, 3), "Cukup memahami");
  assert.equal(learningStatus(90, 3), "Menguasai");
});

test("quiz submission must contain each session question exactly once", () => {
  assert.equal(hasExactQuestionSet(["q1", "q2"], ["q2", "q1"]), true);
  assert.equal(hasExactQuestionSet(["q1", "q2"], ["q1"]), false);
  assert.equal(hasExactQuestionSet(["q1", "q2"], ["q1", "q1"]), false);
  assert.equal(hasExactQuestionSet(["q1", "q2"], ["q1", "q3"]), false);
});

test("mutating requests only accept same-origin or configured application origins", () => {
  const originalUrl = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_APP_URL = "https://kompita.example";
  assert.equal(verifyRequestOrigin(new Request("https://preview.example/api/auth/profile", { method: "POST", headers: { origin: "https://preview.example" } })), true);
  assert.equal(verifyRequestOrigin(new Request("https://preview.example/api/auth/profile", { method: "POST", headers: { origin: "https://attacker.example" } })), false);
  assert.equal(verifyRequestOrigin(new Request("https://preview.example/api/auth/profile", { method: "POST", headers: { origin: "https://kompita.example" } })), true);
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = originalUrl;
});
