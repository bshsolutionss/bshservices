"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { FormQuestion } from "@/lib/lead-forms";

interface Props {
  slug: string;
  heading: string;
  intro: string | null;
  thankYou: string | null;
  questions: FormQuestion[];
}

const INPUT =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/15";

const INPUT_TYPE: Record<FormQuestion["type"], string> = {
  name: "text",
  phone: "tel",
  email: "email",
  company: "text",
  location: "text",
  budget: "text",
  text: "text",
};

export default function PublicLeadForm({ slug, heading, intro, thankYou, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/forms/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, website_url: trap }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) setError(json?.error ?? "Something went wrong. Please try again.");
      else setDone(true);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <h1 className="mt-4 text-xl font-semibold text-stone-900">Thank you</h1>
        <p className="mt-2 text-sm text-stone-500">{thankYou || "Thanks - we've got your details and will be in touch shortly."}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{heading}</h1>
        {intro && <p className="mt-2 text-sm text-stone-500">{intro}</p>}
      </div>
      {questions.map((q) => (
        <div key={q.id}>
          <label htmlFor={`q-${q.id}`} className="mb-1.5 block text-sm font-medium text-stone-800">
            {q.label}
            {!q.required && <span className="ml-1 text-xs font-normal text-stone-400">(optional)</span>}
          </label>
          {q.type === "text" ? (
            <textarea id={`q-${q.id}`} rows={3} required={q.required} maxLength={2000} value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} className={INPUT} />
          ) : (
            <input
              id={`q-${q.id}`}
              type={INPUT_TYPE[q.type]}
              required={q.required}
              maxLength={300}
              autoComplete={q.type === "name" ? "name" : q.type === "email" ? "email" : q.type === "phone" ? "tel" : undefined}
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              className={INPUT}
            />
          )}
        </div>
      ))}
      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50">
        {busy ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
