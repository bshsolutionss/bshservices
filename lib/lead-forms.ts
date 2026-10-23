import { randomUrlId } from "@/lib/random-id";

/** Shared by the form builder, the public form page and its submit route. */

export type QuestionType = "name" | "phone" | "email" | "company" | "location" | "budget" | "text";

export interface FormQuestion {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
}

export interface LeadForm {
  id: string;
  created_at: string;
  slug: string;
  name: string;
  heading: string;
  intro: string | null;
  thank_you: string | null;
  questions: FormQuestion[];
  stage_key: string | null;
  active: boolean;
}

export const DEFAULT_QUESTIONS: FormQuestion[] = [
  { id: "name", label: "Your name", type: "name", required: true },
  { id: "phone", label: "Phone / WhatsApp", type: "phone", required: true },
  { id: "email", label: "Email", type: "email", required: false },
  { id: "need", label: "What do you need help with?", type: "text", required: false },
];

/** Quick-add questions offered under the builder. */
export const PRESET_QUESTIONS: { label: string; type: QuestionType }[] = [
  { label: "Company", type: "company" },
  { label: "Location", type: "location" },
  { label: "Budget", type: "budget" },
];

export function newSlug(): string {
  return randomUrlId(9);
}

/** Cleans questions coming from the builder: bounded, unique ids, and a name question is always required. */
export function sanitizeQuestions(input: unknown): FormQuestion[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const types: QuestionType[] = ["name", "phone", "email", "company", "location", "budget", "text"];
  const out: FormQuestion[] = [];
  for (const q of input.slice(0, 20)) {
    const label = String(q?.label ?? "").trim().slice(0, 120);
    if (!label) continue;
    let id = String(q?.id ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || `q${out.length + 1}`;
    while (seen.has(id)) id = `${id}x`;
    seen.add(id);
    const type: QuestionType = types.includes(q?.type) ? q.type : "text";
    out.push({ id, label, type, required: type === "name" ? true : q?.required === true });
  }
  return out;
}
