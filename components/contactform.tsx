"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"
import { Facebook, Instagram, Linkedin, X as XIcon } from "lucide-react"
import Link from "next/link"

const Contactform = () => {
  const pathname = usePathname()
  const [formData, setFormData] = useState({
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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
          company_website: formData.company_website,
        }),
      })

      if (!res.ok) throw new Error("Request failed")

      setStatus("success")
      setFormData({
        name: "",
        email: "",
        phone: "",
        business: "",
        time: "",
        message: "",
        company_website: "",
      })
    } catch {
      setStatus("error")
    }
  }

  return (
    <section
      id="contact"
      className="relative py-20 px-6 lg:px-16 bg-[#F4F7FE] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
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
        </motion.div>

        {/* Right Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-xl space-y-6"
        >
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
            placeholder="Your Business Name"
            value={formData.business}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="time"
            placeholder="Best Time To Connect"
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

          <Button
            type="submit"
            className="w-full bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-2xl py-6 text-lg shadow-lg hover:shadow-xl transition"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </Button>

          {status === "success" && (
            <p className="text-green-600 text-center">
              ✅ Message sent! Check your email for confirmation.
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-center">
              ❌ Something went wrong. Please try again.
            </p>
          )}
        </motion.form>
      </div>
    </section>
  )
}

export default Contactform
