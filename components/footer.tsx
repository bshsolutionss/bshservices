"use client"
import React from "react"
import Image from "next/image"
import { Facebook, Instagram,  Linkedin, Mail, Phone, MapPin, Youtube } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const Footer = () => {
  return (
    <footer className="relative bg-[#F4F7FE] py-12 px-6 lg:px-20 overflow-hidden">
      {/* Glass Background Overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl border-t border-[#1A14A5]/20 shadow-[0_8px_32px_rgba(26,20,165,0.3)]"></div>

      <div className="relative max-w-7xl mx-auto flex flex-col items-center space-y-10 z-10">
        {/* Logo + Branding */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <Image
            src="/images/noghlogo.png"
            alt="BSH Solutions Logo"
            width={100}
            height={100}
            className="drop-shadow-2xl"
          />
          <h2 className="text-2xl font-extrabold text-[#1A14A5] drop-shadow-md">
            BSH SOLUTIONS
          </h2>
          <p className="text-[#231F20]/80 max-w-md">
            Business Smart Hub – your one-stop technology partner for digital,
            software, and hardware solutions.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 text-[#231F20] font-medium"
        >
         
          <motion.li><Link href="/" className="hover:text-[#1A14A5] transition">Home</Link></motion.li>
        
          <motion.li><Link href="/about" className="hover:text-[#1A14A5] transition">About</Link></motion.li>
          <motion.li><Link href="/Services" className="hover:text-[#1A14A5] transition">Services</Link></motion.li>
          <motion.li><Link href="/#faq" className="hover:text-[#1A14A5] transition">FAQ</Link></motion.li>
          <motion.li><Link href="/contact" className="hover:text-[#1A14A5] transition">Contact</Link></motion.li>
        </motion.ul>

        {/* Contact Info + Socials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col items-center text-center space-y-2 text-[#231F20]"
        >
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
            <Link href="https://www.facebook.com/bshsolutions" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <Facebook className="text-[#1A14A5]" />
            </Link>
            <Link href="https://www.instagram.com/bshsolutionss" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <Instagram className="text-[#1A14A5]" />
            </Link>
            
            <Link href="https://www.linkedin.com/company/bshsolutions" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <Linkedin className="text-[#1A14A5]" />
            </Link>
            <Link href="https://www.youtube.com/@bshsolutions" className="p-2 rounded-full bg-[#1A14A5]/10 shadow-lg hover:scale-110 transition">
              <Youtube className="text-[#1A14A5]" />
            </Link>
          </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="w-full text-center text-sm text-[#231F20]/70 pt-6 border-t border-[#1A14A5]/20"
        >
          © {new Date().getFullYear()} BSH Solutions. All rights reserved.
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
