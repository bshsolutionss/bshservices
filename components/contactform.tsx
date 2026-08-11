"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"
import { Facebook, Instagram, Linkedin, } from "lucide-react"
import Link from "next/link"
const Contactform = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    business: "",
    time: "",
    message: "",
  })

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    // WhatsApp number (remove leading 0 → add 92 for Pakistan)
    const phoneNumber = "923128994968"

    // Format message for WhatsApp
    const message = `*New Contact Form Submission* 👋
    
*Name:* ${formData.name}
*Email:* ${formData.email}
*Phone Number:* ${formData.phone}
*Business Name:* ${formData.business}
*Best Time To Connect:* ${formData.time}
*Message:* ${formData.message}`

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`

    // Open WhatsApp
    window.open(whatsappURL, "_blank")

    // Simulate success
    setTimeout(() => {
      setStatus("success")
      setFormData({
        name: "",
        email: "",
        phone: "",
        business: "",
        time: "",
        message: "",
      })
    }, 1000)
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
            we’ll contact you on WhatsApp 🚀
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
            <Link href="https://www.facebook.com/people/BSH-Solutions/61582682037084/" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <Facebook className="text-[#1A14A5]" />
            </Link>
            <Link href="https://www.instagram.com/bshsolutions_/" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <Instagram className="text-[#1A14A5]" />
            </Link>
            
            <Link href="https://www.linkedin.com/company/bsh-solutionss/" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <Linkedin className="text-[#1A14A5]" />
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

          <Button
            type="submit"
            className="w-full bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-2xl py-6 text-lg shadow-lg hover:shadow-xl transition"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending..." : "Send on WhatsApp"}
          </Button>

          {status === "success" && (
            <p className="text-green-600 text-center">
              ✅ WhatsApp message opened successfully!
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-center">
              ❌ Something went wrong. Try again.
            </p>
          )}
        </motion.form>
      </div>
    </section>
  )
}

export default Contactform
