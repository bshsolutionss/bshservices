"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CalendarCheck, Check, Loader2, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Mascot from "@/components/chatbot/Mascot";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { BUSINESS_FACTS } from "@/lib/chatbot/config";
import {
  QUOTE_NEEDS,
  QUOTE_STAGES,
  QUOTE_TIMELINES,
  estimateQuote,
  formatTierPrice,
  prettyTierName,
  type QuoteNeed,
  type QuoteOption,
  type QuoteStage,
  type QuoteTimeline,
  type Region,
} from "@/lib/chatbot/guide";

/**
 * "Instant estimate": three taps to a recommended package with its real
 * starting price (from lib/pricing-data.ts, in the visitor's currency), then
 * an optional name/email step that drops the brief into the leads pipeline
 * as a chatbot lead. Needs with no published package (AI, design) get an
 * honest "scoped on a free call" instead of an invented figure.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "need" | "stage" | "timeline" | "result" | "sent";

interface QuoteBuilderProps {
  region: Region;
  pagePath: string;
  /** Hand the conversation over to the chat with a ready-made question. */
  onAsk: (question: string) => void;
  /** Lets the widget stop asking for details the visitor already gave. */
  onLeadCaptured: () => void;
  leadCaptured: boolean;
}

function OptionList<T extends string>({
  options,
  onPick,
}: {
  options: QuoteOption<T>[];
  onPick: (value: T) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onPick(option.value)}
          className="group flex items-center justify-between gap-3 rounded-2xl border border-[#1A14A5]/12 bg-white px-4 py-3 text-left transition-all hover:border-[#1A14A5] hover:shadow-sm"
        >
          <span>
            <span className="block text-sm font-semibold text-[#231F20]">{option.label}</span>
            {option.hint && <span className="block text-xs text-[#231F20]/55">{option.hint}</span>}
          </span>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#1A14A5]/20 text-[#1A14A5] transition-colors group-hover:bg-[#1A14A5] group-hover:text-white">
            <Check className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
        </button>
      ))}
    </div>
  );
}

export default function QuoteBuilder({ region, pagePath, onAsk, onLeadCaptured, leadCaptured }: QuoteBuilderProps) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = React.useState<Step>("need");
  const [need, setNeed] = React.useState<QuoteNeed | null>(null);
  const [stage, setStage] = React.useState<QuoteStage | null>(null);
  const [timeline, setTimeline] = React.useState<QuoteTimeline | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    trackEvent("chatbot_quote_start", { page: pagePath });
  }, [pagePath]);

  const estimate = need && stage ? estimateQuote(need, stage, region) : null;
  const timelineLabel = QUOTE_TIMELINES.find((option) => option.value === timeline)?.label ?? "";
  const stageLabel = QUOTE_STAGES.find((option) => option.value === stage)?.label ?? "";

  const brief = estimate
    ? [
        `Need: ${estimate.needLabel}`,
        `Stage: ${stageLabel}`,
        `Timeline: ${timelineLabel}`,
        estimate.tier
          ? `Recommended: ${prettyTierName(estimate.tier.name)} (${formatTierPrice(estimate.tier)})`
          : "Recommended: custom scope, quote after a call",
      ].join("\n")
    : "";

  const whatsAppHref = buildWhatsAppUrl(
    `Hi BSH Solutions! I used the estimate on your website.\n${brief}\nCan we talk about it?`
  );

  const stepNumber = step === "need" ? 1 : step === "stage" ? 2 : step === "timeline" ? 3 : 0;

  const goBack = () => {
    if (step === "stage") setStep("need");
    else if (step === "timeline") setStep("stage");
    else if (step === "result") setStep("timeline");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!estimate || isSaving) return;
    if (name.trim().length < 2) return setError("Please add your name.");
    if (!EMAIL_RE.test(email.trim())) return setError("That email doesn't look right.");

    setError("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "chatbot",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          selected_service: estimate.tier ? prettyTierName(estimate.tier.name) : estimate.needLabel,
          page_path: pagePath,
          message: `Sent from the chat widget's instant estimate.\n\n${brief}`,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "That didn't go through. Please try WhatsApp instead.");
        return;
      }
      trackEvent("chatbot_quote_lead", { page: pagePath, need: need ?? "" });
      onLeadCaptured();
      setStep("sent");
    } catch {
      setError("Couldn't connect. Please check your connection or use WhatsApp.");
    } finally {
      setIsSaving(false);
    }
  };

  const transition = { duration: reduceMotion ? 0 : 0.18 };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {stepNumber > 0 && (
        <div className="flex items-center gap-3 px-5 pt-4">
          {step !== "need" ? (
            <button
              onClick={goBack}
              aria-label="Previous question"
              className="rounded-full p-1 text-[#231F20]/50 transition-colors hover:bg-[#F4F7FE] hover:text-[#1A14A5]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <span className="w-6" />
          )}
          <div className="flex flex-1 gap-1.5" aria-hidden="true">
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`h-1.5 flex-1 rounded-full transition-colors ${dot <= stepNumber ? "bg-[#1A14A5]" : "bg-[#1A14A5]/15"}`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-[#231F20]/50">{stepNumber}/3</span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={transition}
          >
            {step === "need" && (
              <>
                <h3 className="mb-3 text-base font-bold text-[#231F20]">What can we help you with?</h3>
                <OptionList
                  options={QUOTE_NEEDS}
                  onPick={(value) => {
                    setNeed(value);
                    setStep("stage");
                  }}
                />
              </>
            )}

            {step === "stage" && (
              <>
                <h3 className="mb-3 text-base font-bold text-[#231F20]">Where is your business right now?</h3>
                <OptionList
                  options={QUOTE_STAGES}
                  onPick={(value) => {
                    setStage(value);
                    setStep("timeline");
                  }}
                />
              </>
            )}

            {step === "timeline" && (
              <>
                <h3 className="mb-3 text-base font-bold text-[#231F20]">When would you like to start?</h3>
                <OptionList
                  options={QUOTE_TIMELINES}
                  onPick={(value) => {
                    setTimeline(value);
                    setStep("result");
                    trackEvent("chatbot_quote_result", { page: pagePath, need: need ?? "" });
                  }}
                />
              </>
            )}

            {step === "result" && estimate && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mascot size={44} mood="happy" />
                  <p className="pt-1 text-sm leading-relaxed text-[#231F20]">
                    {estimate.tier
                      ? "Based on your answers, here's the package I'd start with:"
                      : "Good news, this is one we tailor to each business, so the team scopes it with you on a free call."}
                  </p>
                </div>

                {estimate.tier ? (
                  <div className="rounded-2xl bg-gradient-to-br from-[#1A14A5] to-[#0E0A6B] p-4 text-white shadow-lg">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                      {estimate.needLabel}
                    </p>
                    <p className="mt-1 text-lg font-bold">{prettyTierName(estimate.tier.name)}</p>
                    <p className="mt-0.5 text-2xl font-extrabold">{formatTierPrice(estimate.tier)}</p>
                    <p className="mt-1 text-xs text-white/70">{estimate.tier.description}</p>
                    <ul className="mt-3 space-y-1.5">
                      {estimate.tier.features.slice(0, 4).map((feature) => (
                        <li key={feature} className="flex gap-2 text-xs leading-snug text-white/90">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8FE9FF]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#1A14A5]/15 bg-[#F4F7FE] p-4">
                    <p className="text-sm font-bold text-[#231F20]">{estimate.needLabel}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#231F20]/65">
                      Price depends on what it needs to do. The first consultation is free and you&apos;ll leave with a
                      clear quote.
                    </p>
                    <Link href={estimate.servicePath} className="mt-2 inline-block text-xs font-semibold text-[#1A14A5] underline">
                      See what&apos;s included
                    </Link>
                  </div>
                )}

                {estimate.alternative && (
                  <p className="text-xs leading-relaxed text-[#231F20]/60">
                    Watching the budget? {prettyTierName(estimate.alternative.name)} starts at{" "}
                    {estimate.alternative.price}.
                  </p>
                )}
                {estimate.tier && (
                  <p className="text-xs leading-relaxed text-[#231F20]/50">
                    Starting price for a standard scope, confirmed after a short call.
                  </p>
                )}

                {leadCaptured ? (
                  <div className="grid gap-2">
                    <Link
                      href={BUSINESS_FACTS.paths.booking}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-[#1A14A5] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      <CalendarCheck className="h-4 w-4" /> Book a free call about this
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-2 rounded-2xl border border-[#1A14A5]/10 bg-white p-4">
                    <p className="text-sm font-semibold text-[#231F20]">Want an exact quote for this?</p>
                    <p className="text-xs text-[#231F20]/55">Send it to the team and they&apos;ll follow up with a quote for your project. No spam.</p>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                      aria-label="Your name"
                      autoComplete="name"
                      maxLength={100}
                      className="w-full rounded-xl border border-[#1A14A5]/15 bg-[#F4F7FE] px-3 py-2.5 text-base outline-none focus:border-[#1A14A5] sm:text-sm"
                    />
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email"
                      type="email"
                      aria-label="Email"
                      autoComplete="email"
                      maxLength={200}
                      className="w-full rounded-xl border border-[#1A14A5]/15 bg-[#F4F7FE] px-3 py-2.5 text-base outline-none focus:border-[#1A14A5] sm:text-sm"
                    />
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="WhatsApp number (optional)"
                      type="tel"
                      aria-label="WhatsApp number, optional"
                      autoComplete="tel"
                      maxLength={30}
                      className="w-full rounded-xl border border-[#1A14A5]/15 bg-[#F4F7FE] px-3 py-2.5 text-base outline-none focus:border-[#1A14A5] sm:text-sm"
                    />
                    {error && <p className="text-xs font-medium text-red-600">{error}</p>}
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A14A5] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Get my exact quote
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={whatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("whatsapp_click", { source: "chatbot_quote" })}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366]/10 px-3 py-2.5 text-xs font-semibold text-[#128C4B] transition-colors hover:bg-[#25D366]/20"
                  >
                    <FaWhatsapp className="h-4 w-4" /> Discuss on WhatsApp
                  </a>
                  <button
                    onClick={() =>
                      onAsk(
                        estimate.tier
                          ? `Tell me more about the ${prettyTierName(estimate.tier.name)} for ${estimate.needLabel.toLowerCase()}.`
                          : `How does ${estimate.needLabel.toLowerCase()} work with BSH?`
                      )
                    }
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#F4F7FE] px-3 py-2.5 text-xs font-semibold text-[#1A14A5] transition-colors hover:bg-[#1A14A5]/10"
                  >
                    <MessageCircle className="h-4 w-4" /> Ask a question
                  </button>
                </div>
              </div>
            )}

            {step === "sent" && (
              <div className="flex flex-col items-center py-4 text-center">
                <Mascot size={80} mood="happy" />
                <h3 className="mt-3 text-lg font-bold text-[#231F20]">Got it, {name.trim().split(" ")[0]}!</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#231F20]/65">
                  Your plan is with the team and they&apos;ll follow up at {email.trim()}. Want to skip the wait?
                </p>
                <div className="mt-4 grid w-full gap-2">
                  <Link
                    href={BUSINESS_FACTS.paths.booking}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#1A14A5] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <CalendarCheck className="h-4 w-4" /> Pick a time for a free call
                  </Link>
                  <a
                    href={whatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("whatsapp_click", { source: "chatbot_quote_sent" })}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <FaWhatsapp className="h-4 w-4" /> Message us on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
