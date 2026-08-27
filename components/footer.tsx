import Image from "next/image";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";

const serviceLinks = [
  { name: "Web & Software Development", href: "/Services/development" },
  { name: "Graphic & UI/UX Design", href: "/Services/designing" },
  { name: "Digital Marketing & SEO", href: "/Services/marketing" },
  { name: "Photography & Media", href: "/Services/photography" },
  { name: "AI & Automation Solutions", href: "/Services/ai" },
];

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Our Services", href: "/Services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Contact Us", href: "/contact" },
];

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/bshsolutions" },
  { name: "Instagram", href: "https://www.instagram.com/bshsolutionss" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/bshsolutions" },
  { name: "X", href: "https://x.com/BSHSolutionss" },
  { name: "YouTube", href: "https://www.youtube.com/@bshsolutions" },
];

const Footer = () => {
  return (
    <footer className="bg-[#F4F7FE] text-[#231F20] pt-12 pb-6 px-6 sm:px-10 lg:px-16 border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4 space-y-4 text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/images/noghlogo.png"
                alt="BSH Solutions Logo"
                width={44}
                height={44}
                className="w-20 h-20 object-contain"
              />
              <div className="flex flex-col text-left">
                <span className="text-lg font-extrabold tracking-tight text-[#1A14A5]">
                  BSH SOLUTIONS
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#231F20]/60">
                  Business Smart Hub
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#231F20]/75 leading-relaxed max-w-sm mx-auto md:mx-0">
              Your one-stop technology partner empowering enterprises and startups
              with smart, scalable digital, software, AI, and hardware solutions.
            </p>

            <div className="flex items-center justify-center md:justify-start gap-4 pt-1 text-sm">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#231F20]/70 hover:text-[#1A14A5] transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Services */}
          <div className="lg:col-span-3 space-y-3 text-center md:text-left">
            <h3 className="text-sm font-bold text-[#1A14A5] tracking-wide uppercase">
              Our Services
            </h3>
            <ul className="space-y-2 text-sm">
              {serviceLinks.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-[#231F20]/75 hover:text-[#1A14A5] transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}

            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div className="lg:col-span-2 space-y-3 text-center md:text-left">
            <h3 className="text-sm font-bold text-[#1A14A5] tracking-wide uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#231F20]/75 hover:text-[#1A14A5] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="lg:col-span-3 space-y-3 text-center md:text-left">
            <h3 className="text-sm font-bold text-[#1A14A5] tracking-wide uppercase">
              Get in Touch
            </h3>
            <div className="space-y-2.5 text-sm">
              <a
                href="mailto:bshsolutionss@gmail.com"
                className="block text-[#231F20]/75 hover:text-[#1A14A5] transition-colors"
              >
                <span className="text-[#231F20]/50">Email: </span>
                bshsolutionss@gmail.com
              </a>
              <a
                href="tel:+923128994968"
                className="block text-[#231F20]/75 hover:text-[#1A14A5] transition-colors"
              >
                <span className="text-[#231F20]/50">Call: </span>
                +92 312 8994968
              </a>
              <p className="text-[#231F20]/75">
                <span className="text-[#231F20]/50">Headquarters: </span>
                Karachi, Pakistan
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/book-consultation"
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#1A14A5] hover:bg-[#0e0a7a] text-white text-sm font-semibold px-4 py-2.5 transition-colors"
              >
                Book Free Consultation
              </Link>
              <WhatsAppButton
                source="footer"
                className="w-full !px-4 !py-2.5 !rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#231F20]/70">
          <p>© {new Date().getFullYear()} BSH Solutions. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-[#1A14A5] transition-colors">
              About
            </Link>
            <Link href="/Services" className="hover:text-[#1A14A5] transition-colors">
              Services
            </Link>
            <Link href="/contact" className="hover:text-[#1A14A5] transition-colors">
              Contact
            </Link>
            <Link href="/#faq" className="hover:text-[#1A14A5] transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
