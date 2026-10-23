"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { portalBtn, portalCard } from "@/components/portal/ui";
import type { PortalWelcomeSettings } from "@/lib/portal/welcome";

interface Props {
  firstName: string;
  clientName: string;
  settings: PortalWelcomeSettings;
  initialChecked: string[];
}

const TOTAL = 6;

export default function WelcomeWizard({ firstName, clientName, settings, initialChecked }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<string[]>(initialChecked);

  function save(next: string[], done = false) {
    fetch("/api/portal/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: next, done }),
    }).catch(() => {});
  }

  function toggle(id: string) {
    const next = checked.includes(id) ? checked.filter((c) => c !== id) : [...checked, id];
    setChecked(next);
    save(next);
  }

  function finish() {
    save(checked, true);
    router.push("/portal");
    router.refresh();
  }

  const done = settings.checklist.filter((c) => checked.includes(c.id)).length;
  const lines = (text: string) => text.split("\n").filter(Boolean);

  return (
    <div className={`${portalCard} mx-auto max-w-2xl overflow-hidden`}>
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-600 text-xs font-bold text-white">{clientName.slice(0, 2).toUpperCase()}</span>
          <span className="text-sm font-semibold">{clientName}</span>
        </div>
        <div className="mt-4 flex gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span key={i} className={cn("h-1 flex-1 rounded-full", i < step ? "bg-orange-300" : i === step ? "bg-orange-600" : "bg-stone-200")} />
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-400">
          Step {step + 1} of {TOTAL}
        </p>
      </div>

      <div className="min-h-[300px] px-6 py-8">
        {step === 0 && (
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Welcome aboard, {firstName}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
              We&apos;re genuinely excited to be working with you. This short walkthrough explains how we&apos;ll work together and what happens next. It takes about a minute.
            </p>
            <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-stone-400">
              <Clock className="h-3.5 w-3.5" /> Takes about a minute
            </p>
          </div>
        )}
        {step === 1 && <Block title="How we work together" text={settings.how_we_work} />}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">What happens next</h2>
            <ol className="mt-5 space-y-3">
              {lines(settings.what_happens_next).map((l, i) => (
                <li key={i} className="flex gap-3 text-sm text-stone-600">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">{i + 1}</span>
                  <span>{l.replace(/^\d+[.)]\s*/, "")}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">What we need from you</h2>
            <p className="mt-2 text-sm text-stone-500">Tick these off as you send them over. It helps us start faster.</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full bg-orange-500 transition-all" style={{ width: `${(done / settings.checklist.length) * 100}%` }} />
              </div>
              <span className="text-xs text-stone-400">
                {done} of {settings.checklist.length}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {settings.checklist.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 hover:bg-stone-50">
                  <input type="checkbox" checked={checked.includes(c.id)} onChange={() => toggle(c.id)} className="h-4 w-4 accent-orange-600" />
                  <span>
                    <span className={cn("block text-sm", checked.includes(c.id) && "text-stone-400 line-through")}>{c.label}</span>
                    {c.hint && <span className="block text-xs text-stone-400">{c.hint}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 4 && <Block title="How we communicate" text={settings.communication} />}
        {step === 5 && (
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">You&apos;re all set</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-stone-500">
              Your portal is ready. You can come back to this walkthrough anytime from the Welcome tab.
            </p>
            <Link href="/portal/messages" className="mt-3 inline-block text-sm font-medium text-orange-600 hover:underline">
              Say hello in Messages
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-stone-100 px-6 py-4">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : (
          <span />
        )}
        {step < TOTAL - 1 ? (
          <button onClick={() => setStep(step + 1)} className={portalBtn}>
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={finish} className={portalBtn}>
            Go to my portal
          </button>
        )}
      </div>
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-stone-600">{text}</p>
    </div>
  );
}
