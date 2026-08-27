"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { getServicesByCategory, type ServiceCategorySlug } from "@/lib/services-data";

interface FormProps {
  serviceName:
    | "Development"
    | "Designing"
    | "Marketing"
    | "Photography"
    | "AI Services";
  /**
   * The exact service this form is already embedded under (e.g. "SEO
   * Optimization" on that service's own detail page) — pre-selects the
   * dropdown so a visitor who's already on the SEO page isn't asked to
   * re-pick "SEO Optimization" from a list a second time.
   */
  preselectedService?: string;
}

const CATEGORY_SLUG_BY_LABEL: Record<FormProps["serviceName"], ServiceCategorySlug> = {
  Development: "development",
  Designing: "designing",
  Marketing: "marketing",
  Photography: "photography",
  "AI Services": "ai",
};

export default function Form({ serviceName, preselectedService }: FormProps) {
  const pathname = usePathname();
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    selectedService: preselectedService ?? "",
    businessType: "",
    company_website: "", // honeypot — left blank by real users
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  // Sourced from lib/services-data.ts (the single source of truth every
  // service page is generated from) rather than a hand-maintained list —
  // guarantees these options always match real service names/slugs, and
  // that `preselectedService` above always finds a matching <option>.
  const serviceOptions = getServicesByCategory(CATEGORY_SLUG_BY_LABEL[serviceName]).map((s) => s.name);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "service_form",
          page_path: pathname,
          name: form.name,
          email: form.email,
          phone: form.number,
          service_category: serviceName,
          selected_service: form.selectedService,
          business_type: form.businessType,
          company_website: form.company_website,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      trackEvent("service_form_submit", { service_category: serviceName });
      setForm({
        name: "",
        email: "",
        number: "",
        selectedService: "",
        businessType: "",
        company_website: "",
      });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="relative flex justify-center items-center py-20 px-6 bg-[#F4F7FE] overflow-hidden">
      <div className="absolute top-0 left-10 w-[300px] h-[300px] bg-[#1A14A5]/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 right-10 w-[250px] h-[250px] bg-[#231F20]/10 rounded-full blur-[100px] animate-pulse"></div>

      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
        className="max-w-lg w-full backdrop-blur-xl bg-white/60 p-8 rounded-3xl shadow-2xl border border-white/50 relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#1A14A5]">{serviceName} Form</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.input whileFocus={{ scale: 1.02 }} type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required className="w-full p-3 rounded-xl bg-white/70 border border-gray-300" />
          <motion.input whileFocus={{ scale: 1.02 }} type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required className="w-full p-3 rounded-xl bg-white/70 border border-gray-300" />
          <motion.input whileFocus={{ scale: 1.02 }} type="tel" name="number" placeholder="Your Phone Number" value={form.number} onChange={handleChange} required className="w-full p-3 rounded-xl bg-white/70 border border-gray-300" />

          <motion.select whileFocus={{ scale: 1.02 }} name="selectedService" value={form.selectedService} onChange={handleChange} required className="w-full p-3 rounded-xl bg-white/70 border border-gray-300">
            <option value="">Select a {serviceName} Service</option>
            {serviceOptions.map((srv) => (<option key={srv} value={srv}>{srv}</option>))}
          </motion.select>

          <div className="text-left">
            <p className="font-semibold mb-3 text-[#231F20]">Business Type:</p>
            <div className="grid grid-cols-2 gap-3">
              {["E-commerce", "Agency / Company", "Personal Brand", "Others"].map((type) => (
                <label key={type} className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-gray-300 cursor-pointer">
                  <input type="radio" name="businessType" value={type} checked={form.businessType === type} onChange={handleChange} required className="accent-[#1A14A5]" />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Honeypot — hidden from real users, bots tend to fill every field */}
          <input
            type="text"
            name="company_website"
            value={form.company_website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={status === "loading"} className="w-full mt-6 py-3 bg-[#1A14A5] text-white rounded-2xl font-semibold shadow-lg disabled:opacity-60">
            {status === "loading" ? "Sending..." : "📩 Send Message"}
          </motion.button>

          {status === "success" && (
            <p className="text-green-600 text-center">✅ Message sent! Check your email for confirmation.</p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-center">❌ Something went wrong. Please try again.</p>
          )}
        </form>
      </motion.div>
    </section>
  );
}
