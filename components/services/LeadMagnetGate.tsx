"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FileDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLeadMagnet } from "@/lib/lead-magnets";
import { trackEvent } from "@/lib/analytics";

interface LeadMagnetGateProps {
  slug: string;
}

/**
 * Email-gated PDF download — mid-funnel step between "browsing a service
 * page" and "filling out the full contact form". Downloads client-side via
 * a blob so it feels instant, no email round-trip required to get the file
 * (app/api/lead-magnet still records the lead + generates the PDF).
 */
export default function LeadMagnetGate({ slug }: LeadMagnetGateProps) {
  const pathname = usePathname();
  const magnet = getLeadMagnet(slug);

  const [form, setForm] = useState({ name: "", email: "", company_website: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!magnet) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: form.name,
          email: form.email,
          page_path: pathname,
          company_website: form.company_website,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus("success");
      trackEvent("lead_magnet_download", { slug });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-16 px-6 bg-[#1A14A5]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto rounded-3xl bg-white p-6 md:p-10"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-[#1A14A5]/10 flex items-center justify-center">
            <FileDown className="w-8 h-8 text-[#1A14A5]" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-[#231F20] mb-1">{magnet.title}</h3>
            <p className="text-[#231F20]/70">{magnet.description}</p>
          </div>
        </div>

        {status === "success" ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 p-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800">
              Downloaded! Check your downloads folder — the PDF opened as{" "}
              <strong>{slug}.pdf</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              className="sm:flex-1"
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              className="sm:flex-1"
            />
            {/* Honeypot — hidden from real users, bots tend to fill every field */}
            <input
              type="text"
              value={form.company_website}
              onChange={(e) => setForm((p) => ({ ...p, company_website: e.target.value }))}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <Button
              type="submit"
              disabled={status === "loading"}
              className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl px-6 shrink-0"
            >
              {status === "loading" ? "Preparing..." : "Get Free Checklist"}
            </Button>
          </form>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm mt-3">❌ Something went wrong. Please try again.</p>
        )}
      </motion.div>
    </section>
  );
}
