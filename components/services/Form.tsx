"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface FormProps {
  serviceName:
    | "Development"
    | "Designing"
    | "Marketing"
    | "Photography"
    | "AI Services";
}

export default function Form({ serviceName }: FormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    selectedService: "",
    businessType: "",
  });

  // All Services
  const servicesByCategory: Record<string, string[]> = {
    Development: [
      "Website Development",
      "E-commerce",
      "Mobile Apps",
      "Custom Software",
      "Web Applications",
      "Maintenance & Support",
    ],

    Designing: [
      "Branding",
      "UI / UX",
      "Graphic Design",
      "Logo Design",
      "Motion Graphics",
      "Packaging Design",
    ],

    Marketing: [
      "PPC Advertising",
      "Social Media Marketing",
      "SEO Optimization",
      "Email Marketing",
      "Content Marketing",
      "Influencer Marketing",
    ],

    Photography: [
      "Product Photography",
      "Brand Shoots",
      "Event Coverage",
      "Video Production",
      "Editing & Retouching",
      "Drone Photography",
    ],

    // ✅ Added AI Services here
    "AI Services": [
      "AI Automation",
      "AI Chatbots",
      "AI Website Integration",
      "AI Content Creation (SEO)",
      "AI Social Media Automation",
      "AI Video Automation",
    ],
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const message =
      `📩 *${serviceName} Form*\n\n` +
      `👤 Name: ${form.name}\n` +
      `📧 Email: ${form.email}\n` +
      `📞 Number: ${form.number}\n` +
      `🧩 Selected Service: ${form.selectedService}\n` +
      `🏢 Business Type: ${form.businessType}\n\n` +
      `Please contact me regarding ${serviceName}.`;

    const whatsappURL = `https://wa.me/923128994968?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappURL, "_blank");
  };

  return (
    <section
      id="contact"
      className="relative flex justify-center items-center py-20 px-6 bg-[#F4F7FE] overflow-hidden"
    >
      <div className="absolute top-0 left-10 w-[300px] h-[300px] bg-[#1A14A5]/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 right-10 w-[250px] h-[250px] bg-[#231F20]/10 rounded-full blur-[100px] animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="max-w-lg w-full backdrop-blur-xl bg-white/60 p-8 rounded-3xl shadow-2xl border border-white/50 relative z-10"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-[#1A14A5]">
          {serviceName} Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-white/70 border border-gray-300"
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-white/70 border border-gray-300"
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="tel"
            name="number"
            placeholder="Your Phone Number"
            value={form.number}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-white/70 border border-gray-300"
          />

          <motion.select
            whileFocus={{ scale: 1.02 }}
            name="selectedService"
            value={form.selectedService}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-white/70 border border-gray-300"
          >
            <option value="">Select a {serviceName} Service</option>

            {servicesByCategory[serviceName].map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </motion.select>

          <div className="text-left">
            <p className="font-semibold mb-3 text-[#231F20]">Business Type:</p>
            <div className="grid grid-cols-2 gap-3">
              {["E-commerce", "Agency / Company", "Personal Brand", "Others"].map(
                (type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-gray-300 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="businessType"
                      value={type}
                      checked={form.businessType === type}
                      onChange={handleChange}
                      required
                      className="accent-[#1A14A5]"
                    />
                    <span>{type}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full mt-6 py-3 bg-[#1A14A5] text-white rounded-2xl font-semibold shadow-lg"
          >
            📩 Send via WhatsApp
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
}
