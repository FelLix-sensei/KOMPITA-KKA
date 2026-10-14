"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, CircleHelp, Clock3, RotateCcw } from "lucide-react";

type Question = { id: string; prompt: string; type: string; options: unknown; topic: string; difficulty: string; weight: number };
type Review = { questionId: string; prompt: string; topic: string; submitted: unknown; correct: boolean; answer: unknown; explanation: string };
type Result = { attemptId: string; score: number; correct: number; total: number; durationSec: number; review: Review[] };

export function QuizRunner({ topic, lessonSlug }: { topic?: string; lessonSlug?: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [index, setIndex] = useState(0);
  const [quizSessionId, setQuizSessionId] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true); setError(""); setResult(null); setAnswers({}); setIndex(0);
    try {
      const response = await fetch("/api/quizzes/start", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, lessonSlug, limit: 10 })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Kuis tidak tersedia.");
      setQuestions(data.questions);
      setQuizSessionId(data.quizSessionId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Kuis belum dapat dimuat.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void start(); }, [topic, lessonSlug]);

  function setAnswer(id: string, value: unknown, multi = false) {
    setAnswers((current) => {
      if (!multi) return { ...current, [id]: value };
      const values = Array.isArray(current[id]) ? current[id] as string[] : [];
      return { ...current, [id]: values.includes(String(value)) ? values.filter((item) => item !== value) : [...values, String(value)] };
    });
  }

  async function submit() {
    if (busy || !questions.length) return;
    if (!window.confirm("Akhiri kuis dan kirim jawaban sekarang?")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/quizzes/submit", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          quizSessionId,
          responses: questions.map((question) => ({ questionId: question.id, answer: answers[question.id] ?? "" }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Jawaban belum tersimpan. Silakan coba lagi.");
      setResult(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Terjadi kesalahan.");
    } finally { setBusy(false); }
  }

  if (loading) return <div className="quiz-panel"><div className="skeleton-line" /><div className="skeleton-line short" /><p>Menyiapkan soal dari bank soal…</p></div>;
  if (error && !questions.length) return <div className="empty-state"><CircleHelp size={32} /><h3>Kuis belum bisa dimulai</h3><p>{error}</p><button className="button button-outline" onClick={() => void start()}>Coba lagi</button></div>;
  if (result) return <div className="quiz-result">
    <span className="result-icon"><Check size={26} /></span><p className="eyebrow">HASIL LATIHAN</p><h2>{result.score}<small>/100</small></h2>
    <p className="result-lead">{result.correct} dari {result.total} jawaban benar · {Math.floor(result.durationSec / 60)} menit {result.durationSec % 60} detik</p>
    <div className="review-list"><h3>Pembahasan</h3>{result.review.map((item, i) => <article className="review-item" key={item.questionId}><div className="review-label"><b>Soal {i + 1} · {item.topic}</b><span className={item.correct ? "success-text" : "error-text"}>{item.correct ? "Benar" : "Perlu dipelajari"}</span></div><p>{item.prompt}</p><p><strong>Jawaban: </strong>{Array.isArray(item.answer) ? item.answer.join(", ") : String(item.answer)}</p><small>{item.explanation}</small></article>)}</div>
    <button className="button button-primary" onClick={() => void start()}><RotateCcw size={16} /> Ulangi kuis</button>
  </div>;
  if (!questions.length) return <div className="empty-state"><h3>Belum ada soal</h3><p>Admin dapat menambahkan soal melalui panel pengelolaan.</p></div>;

  const question = questions[index];
  const options = Array.isArray(question.options) ? question.options.map(String) : [];
  const selected = answers[question.id];
  const multi = question.type === "MULTIPLE_CHOICE";
  const progress = ((index + 1) / questions.length) * 100;
  return <section className="quiz-panel">
    <div className="quiz-meta"><span><CircleHelp size={16} /> Soal {index + 1} dari {questions.length}</span><span><Clock3 size={15} /> Latihan mandiri</span></div>
    <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
    <div className="quiz-tags"><span>{question.topic}</span><span>{question.difficulty === "BEGINNER" ? "Dasar" : question.difficulty === "ADVANCED" ? "Lanjut" : "Menengah"}</span></div>
    <h2 className="question-title">{question.prompt}</h2>
    {question.type === "SHORT_ANSWER" ? <label className="short-answer">Jawaban kamu<input value={typeof selected === "string" ? selected : ""} onChange={(event) => setAnswer(question.id, event.target.value)} placeholder="Ketik jawaban singkat…" /></label> :
      <div className="answer-options">{options.map((option) => {
        const active = multi ? Array.isArray(selected) && selected.includes(option) : selected === option;
        return <button key={option} type="button" onClick={() => setAnswer(question.id, option, multi)} className={`answer-option ${active ? "selected" : ""}`}><span className="option-marker">{active ? <Check size={15} /> : null}</span>{option}</button>;
      })}</div>}
    {multi && <p className="helper-text">Pilih semua jawaban yang sesuai.</p>}
    {error && <p role="alert" className="error-text">{error}</p>}
    <div className="quiz-controls"><button className="button button-quiet" disabled={index === 0} onClick={() => setIndex(index - 1)}><ChevronLeft size={17} /> Sebelumnya</button><div><button className="button button-outline" onClick={submit} disabled={busy}>{busy ? "Menyimpan…" : "Akhiri kuis"}</button>{index < questions.length - 1 && <button className="button button-primary" onClick={() => setIndex(index + 1)}>Berikutnya <ChevronRight size={17} /></button>}</div></div>
  </section>;
}
