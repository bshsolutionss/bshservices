"use client"

import React, { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Check, ArrowLeft, ArrowRight, Users, Award } from "lucide-react"
import { Facebook, Instagram, Linkedin, X as XIcon } from "lucide-react"
import Link from "next/link"
import GoogleReviewsBadge from "@/components/GoogleReviewsBadge"
import { trackEvent } from "@/lib/analytics"

/** Chip value doubles as the `service_category` sent to /api/leads — kept in
 *  sync with the labels lib/services-page-factory.tsx's pages use elsewhere. */
const CATEGORIES = [
  { label: "Web & Software Development", value: "Development" },
  { label: "Design & Branding", value: "Designing" },
  { label: "Digital Marketing", value: "Marketing" },
  { label: "Photography & Video", value: "Photography" },
  { label: "AI & Automation", value: "AI Services" },
  { label: "Not sure yet", value: "" },
];

const STEPS = ["What you need", "Your info", "Details"];

// useSearchParams() (for the ?category=&service= prefill) requires a
// Suspense boundary — without it, Next.js bails the whole /contact route
// out of static rendering at build time. Wrapping here means every caller
// of <Contactform /> gets this for free instead of having to remember it.
const ContactformInner = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    service_category: "",
    selected_service: "",
    name: "",
    email: "",
    phone: "",
    business: "",
    time: "",
    message: "",
    company_website: "", // honeypot — left blank by real users
  })

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  )
  const [startedTracking, setStartedTracking] = useState(false)
  // Distinct from formData.service_category === "" (the initial/unset
  // state) so "Not sure yet" only highlights once actually clicked.
  const [categoryTouched, setCategoryTouched] = useState(false)

  // Service-context prefill: a "Get a Quote" link from a service page (e.g.
  // /contact?category=Marketing&service=SEO+Optimization) arrives already
  // knowing what the visitor wants, so step 1 (which only exists to ask
  // that) is skipped straight to step 2.
  useEffect(() => {
    const category = searchParams.get("category")
    const service = searchParams.get("service")
    // Set by components/services/QuoteQuiz.tsx's handoff — a summary of the
    // quiz answers, pre-filling step 3's message instead of a blank box.
    const details = searchParams.get("details")
    if (!category && !service && !details) return

    setFormData((prev) => ({
      ...prev,
      service_category: category ?? prev.service_category,
      selected_service: service ?? prev.selected_service,
      message: details ?? prev.message,
    }))
    if (category) {
      setCategoryTouched(true)
      setStep(2)
    }
  }, [searchParams])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!startedTracking) {
      setStartedTracking(true)
      trackEvent("contact_form_start")
    }
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const selectCategory = (value: string) => {
    setCategoryTouched(true)
    setFormData((prev) => ({ ...prev, service_category: value }))
  }

  const goToStep = (next: number) => {
    setStep(next)
    trackEvent(`contact_form_step_${next}`)
  }

  const canAdvanceFromStep2 =
    formData.name.trim().length > 0 && formData.email.trim().length > 0 && formData.phone.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "contact_form",
          page_path: pathname,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          business: formData.business,
          best_time: formData.time,
          message: formData.message,
          service_category: formData.service_category || undefined,
          selected_service: formData.selected_service || undefined,
          company_website: formData.company_website,
        }),
      })

      if (!res.ok) throw new Error("Request failed")

      setStatus("success")
      trackEvent("contact_form_submit", { service_category: formData.service_category || "unspecified" })
      setFormData({
        service_category: "",
        selected_service: "",
        name: "",
        email: "",
        phone: "",
        business: "",
        time: "",
        message: "",
        company_website: "",
      })
      setStep(1)
    } catch {
      setStatus("error")
    }
  }

  return (
    <section
      id="contact"
      className="relative py-20 px-6 lg:px-16 bg-[#F4F7FE] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Info */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1A14A5] drop-shadow-sm">
            Let’s Connect
          </h2>
          <p className="text-lg text-[#231F20]/80">
            Have a project in mind or want to collaborate? Fill out the form and
            we’ll get back to you by email 📩
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#231F20]/90">
              <Mail className="text-[#1A14A5] w-6 h-6" />
              <span>bshsolutionss@gmail.com</span>
            </div>
            <div className="flex items-center gap-3 text-[#231F20]/90">
              <Phone className="text-[#1A14A5] w-6 h-6" />
              <span>+92 312 8994968</span>
            </div>
            <div className="flex items-center gap-3 text-[#231F20]/90">
              <MapPin className="text-[#1A14A5] w-6 h-6" />
              <span>Karachi, Pakistan</span>
            </div>
                <div className="flex gap-5 mt-4">
            <Link href="https://www.facebook.com/bshsolutions" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <Facebook className="text-[#1A14A5]" />
            </Link>
            <Link href="https://www.instagram.com/bshsolutionss" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <Instagram className="text-[#1A14A5]" />
            </Link>

            <Link href="https://www.linkedin.com/company/bshsolutions" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <Linkedin className="text-[#1A14A5]" />
            </Link>
            <Link href="https://x.com/BSHSolutionss" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <XIcon className="text-[#1A14A5]" />
            </Link>
          </div>
          </div>

          {/* Trust boosters — right next to the form, not just elsewhere on the page */}
          <div className="flex items-center gap-4 pt-2 text-sm text-[#231F20]/70">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#1A14A5]" />
              <span>9+ happy clients</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#1A14A5]" />
              <span>99% success rate</span>
            </div>
          </div>

          <GoogleReviewsBadge className="max-w-md" />
        </motion.div>

        {/* Right Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-xl"
        >
          {status !== "success" && (
            <>
              {/* Progress bar */}
              <div className="flex items-center gap-2 mb-8">
                {STEPS.map((label, i) => {
                  const n = i + 1
                  const isActive = n === step
                  const isDone = n < step
                  return (
                    <div key={label} className="flex-1">
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          isDone || isActive ? "bg-[#1A14A5]" : "bg-[#1A14A5]/15"
                        }`}
                      />
                      <p
                        className={`mt-1.5 text-[11px] font-semibold uppercase tracking-wide ${
                          isActive ? "text-[#1A14A5]" : "text-[#231F20]/40"
                        }`}
                      >
                        {isDone ? <Check className="inline w-3 h-3 mr-1" /> : null}
                        {label}
                      </p>
                    </div>
                  )
                })}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-[#231F20]">What do you need?</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.label}
                            type="button"
                            onClick={() => selectCategory(cat.value)}
                            className={`p-3 rounded-xl text-sm font-semibold text-left border transition ${
                              categoryTouched && formData.service_category === cat.value
                                ? "bg-[#1A14A5] text-white border-[#1A14A5]"
                                : "border-[#1A14A5]/15 text-[#231F20] hover:border-[#1A14A5]"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="w-full bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-2xl py-6 text-lg shadow-lg flex items-center justify-center gap-2"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-[#231F20]">Your contact info</h3>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        type="text"
                        name="phone"
                        placeholder="Your Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        type="text"
                        name="business"
                        placeholder="Your Business Name (optional)"
                        value={formData.business}
                        onChange={handleChange}
                      />
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => goToStep(1)}
                          className="flex-1 rounded-2xl py-6 flex items-center justify-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back
                        </Button>
                        <Button
                          type="button"
                          disabled={!canAdvanceFromStep2}
                          onClick={() => goToStep(3)}
                          className="flex-1 bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-2xl py-6 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          Continue <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-[#231F20]">Tell us about it</h3>
                      <Input
                        type="text"
                        name="time"
                        placeholder="Best Time To Connect (optional)"
                        value={formData.time}
                        onChange={handleChange}
                      />
                      <Textarea
                        name="message"
                        placeholder="Your Message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        required
                      />

                      {/* Honeypot — hidden from real users, bots tend to fill every field */}
                      <input
                        type="text"
                        name="company_website"
                        value={formData.company_website}
                        onChange={handleChange}
                        tabIndex={-1}
                        autoComplete="off"
                        className="hidden"
                        aria-hidden="true"
                      />

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => goToStep(2)}
                          className="flex-1 rounded-2xl py-6 flex items-center justify-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-2xl py-6 text-lg shadow-lg"
                          disabled={status === "loading"}
                        >
                          {status === "loading" ? "Sending..." : "Send Message"}
                        </Button>
                      </div>

                      {status === "error" && (
                        <p className="text-red-600 text-center">
                          ❌ Something went wrong. Please try again.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </>
          )}

          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="w-14 h-14 rounded-full bg-[#1A14A5]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#1A14A5]" />
              </div>
              <h3 className="text-2xl font-bold text-[#231F20] mb-2">Message sent! 🎉</h3>
              <p className="text-[#231F20]/70 mb-6">Check your email for confirmation — we&apos;ll be in touch soon.</p>
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A14A5] hover:bg-[#0e0a7a] text-white font-semibold px-6 py-3 transition-colors"
              >
                Prefer to talk now? Book a free call <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

const Contactform = () => (
  <Suspense fallback={null}>
    <ContactformInner />
  </Suspense>
)

export default Contactform
