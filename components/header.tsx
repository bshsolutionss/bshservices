"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Menu,
  X,
  Phone,
  Code,
  Palette,
  Camera,
  Megaphone,
  ChevronDown,
  ChevronRight,
  Cpu,
  Layers,
} from "lucide-react";
import {
  SERVICE_CATEGORIES,
  getServicesByCategory,
  getServicePath,
  type ServiceCategorySlug,
} from "@/lib/services-data";

const CATEGORY_KEYS: ServiceCategorySlug[] = [
  "development",
  "designing",
  "marketing",
  "photography",
  "ai",
];

const CATEGORY_META: Record<
  ServiceCategorySlug,
  {
    icon: React.ComponentType<{ className?: string }>;
    colorBg: string;
  }
> = {
  development: { icon: Code, colorBg: "bg-blue-500/10 text-blue-600" },
  designing: { icon: Palette, colorBg: "bg-purple-500/10 text-purple-600" },
  marketing: { icon: Megaphone, colorBg: "bg-amber-500/10 text-amber-600" },
  photography: { icon: Camera, colorBg: "bg-emerald-500/10 text-emerald-600" },
  ai: { icon: Cpu, colorBg: "bg-indigo-500/10 text-indigo-600" },
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] =
    useState<ServiceCategorySlug | null>(null);

  const toggleMobileCategory = (catSlug: ServiceCategorySlug) => {
    setExpandedMobileCategory((prev) => (prev === catSlug ? null : catSlug));
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#F4F7FE]/90 backdrop-blur-xl shadow-md border-b border-white/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-1.5 md:py-2">
        {/* Left - Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/noghlogo.png"
            alt="BSH Solutions logo"
            width={56}
            height={56}
            className="h-12 w-auto object-contain rounded-md drop-shadow-md transition-transform hover:scale-105"
          />
        </Link>

        {/* Center - Desktop Navigation */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center space-x-2 lg:space-x-4 text-[#231F20] font-medium">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="hover:text-[#1A14A5] transition px-3 py-2"
                >
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Mega Dropdown for All 30 Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:text-[#1A14A5] transition font-medium">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent className="left-1/2 -translate-x-1/2">
                  <div className="w-[940px] lg:w-[1040px] xl:w-[1140px] p-5 bg-white shadow-xl rounded-xl border border-gray-100">
                    <div className="flex items-center justify-end pb-3 mb-3 border-b border-gray-100">
                      <Link
                        href="/Services"
                        className="text-xs font-semibold text-[#1A14A5] hover:underline"
                      >
                        All Services Overview →
                      </Link>
                    </div>

                    {/* 5-Column Grid for Categories & Sub-Services */}
                    <div className="grid grid-cols-5 gap-4">
                      {CATEGORY_KEYS.map((catKey) => {
                        const category = SERVICE_CATEGORIES[catKey];
                        const services = getServicesByCategory(catKey);

                        return (
                          <div key={catKey} className="flex flex-col">
                            {/* Category Header Link */}
                            <Link
                              href={category.overviewPath}
                              className="pb-2 mb-2 border-b border-gray-200"
                            >
                              <span className="font-bold text-[13.5px] text-[#231F20] hover:text-[#1A14A5] transition-colors">
                                {category.shortName}
                              </span>
                            </Link>

                            {/* 6 Sub-services list */}
                            <ul className="space-y-0.5 flex-1">
                              {services.map((service) => (
                                <li key={service.slug}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      href={getServicePath(service)}
                                      className="block py-1 text-[12.5px] text-gray-600 hover:text-[#1A14A5] transition-colors"
                                    >
                                      <span className="line-clamp-1">{service.name}</span>
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>

                            {/* Category Bottom Quick link */}
                            <Link
                              href={category.overviewPath}
                              className="mt-2 text-[11.5px] font-semibold text-[#1A14A5] hover:underline"
                            >
                              View {category.shortName} →
                            </Link>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom CTA Banner */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                      <span>Need a custom package combining multiple services? Let&apos;s build your roadmap.</span>
                      <Link
                        href="/book-consultation"
                        className="font-semibold text-[#1A14A5] hover:underline"
                      >
                        Book Free Discovery Call →
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="hover:text-[#1A14A5] transition px-3 py-2"
                >
                  <Link href="/portfolio">Portfolio</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="hover:text-[#1A14A5] transition px-3 py-2"
                >
                  <Link href="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="hover:text-[#1A14A5] transition px-3 py-2"
                >
                  <Link href="/blog">Blog</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right - Action Buttons */}
        <div className="hidden md:flex items-center space-x-2.5 lg:space-x-3">
          <Button
            className="bg-[#1A14A5] text-white shadow-md hover:bg-[#231F20] rounded-xl px-4 py-2 text-sm font-medium transition-all"
            asChild
          >
            <Link href="/book-consultation">Book a Consultation</Link>
          </Button>
          <Button
            variant="outline"
            className="border-[#1A14A5] text-[#1A14A5] hover:bg-[#1A14A5] hover:text-white shadow-sm rounded-xl px-4 py-2 text-sm font-medium transition-all"
            asChild
          >
            <Link href="/contact">Contact</Link>
          </Button>
          <Button
            variant="outline"
            className="hidden xl:inline-flex border-gray-200 text-gray-700 hover:border-[#1A14A5] hover:text-[#1A14A5] rounded-xl px-3 py-2 text-xs font-medium"
            asChild
          >
            <a href="tel:+923128994968">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-[#1A14A5]" /> +92 312 8994968
            </a>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-[#231F20] hover:bg-[#F4F7FE] transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl shadow-2xl border-b border-gray-200 max-h-[calc(100vh-70px)] overflow-y-auto px-5 py-6 space-y-4">
          <Link
            href="/"
            className="block font-semibold text-[#231F20] hover:text-[#1A14A5] py-1 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>

          {/* Mobile Services Accordion */}
          <div className="border-y border-gray-100 py-2">
            <button
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="flex items-center justify-between w-full font-semibold text-[#231F20] py-2 hover:text-[#1A14A5] transition text-left"
            >
              <span className="flex items-center gap-2">
                <Layers size={18} className="text-[#1A14A5]" />
                Services (All 30 Services)
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${mobileServicesOpen ? "rotate-180 text-[#1A14A5]" : "text-gray-400"
                  }`}
              />
            </button>

            {mobileServicesOpen && (
              <div className="space-y-3 pt-2 pb-1 pl-1">
                {/* View All Services Overview button */}
                <Link
                  href="/Services"
                  className="block text-xs font-bold text-[#1A14A5] bg-[#F4F7FE] p-2.5 rounded-lg hover:bg-[#1A14A5] hover:text-white transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ⚡ View Complete Services Catalogue (30 Services) →
                </Link>

                {/* 5 Categories Accordion inside mobile */}
                {CATEGORY_KEYS.map((catKey) => {
                  const category = SERVICE_CATEGORIES[catKey];
                  const meta = CATEGORY_META[catKey];
                  const Icon = meta.icon;
                  const services = getServicesByCategory(catKey);
                  const isExpanded = expandedMobileCategory === catKey;

                  return (
                    <div
                      key={catKey}
                      className="border border-gray-100 rounded-xl bg-[#F9FAFD] overflow-hidden"
                    >
                      <button
                        onClick={() => toggleMobileCategory(catKey)}
                        className="w-full flex items-center justify-between p-3 font-semibold text-[13.5px] text-[#231F20] hover:text-[#1A14A5] transition text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`p-1 rounded-md ${meta.colorBg}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <span>{category.name}</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 text-gray-400 ${isExpanded ? "rotate-180 text-[#1A14A5]" : ""
                            }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="p-3 pt-1 space-y-1.5 bg-white border-t border-gray-100">
                          {services.map((service) => (
                            <Link
                              key={service.slug}
                              href={getServicePath(service)}
                              className="flex items-center justify-between py-1.5 px-2 text-xs text-gray-600 hover:text-[#1A14A5] hover:bg-[#F4F7FE] rounded-md transition font-medium"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span>{service.name}</span>
                              <ChevronRight size={12} className="text-gray-400" />
                            </Link>
                          ))}
                          <div className="pt-2 border-t border-gray-100 mt-2">
                            <Link
                              href={category.overviewPath}
                              className="text-xs font-bold text-[#1A14A5] hover:underline block"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Explore {category.shortName} Overview →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/portfolio"
            className="block font-semibold text-[#231F20] hover:text-[#1A14A5] py-1 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Portfolio
          </Link>
          <Link
            href="/about"
            className="block font-semibold text-[#231F20] hover:text-[#1A14A5] py-1 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/blog"
            className="block font-semibold text-[#231F20] hover:text-[#1A14A5] py-1 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>

          {/* Mobile Buttons */}
          <div className="flex flex-col gap-2.5 pt-3">
            <Button
              className="bg-[#1A14A5] text-white shadow-md hover:bg-[#231F20] rounded-xl text-sm py-2.5"
              asChild
            >
              <Link href="/book-consultation" onClick={() => setMobileMenuOpen(false)}>
                Book a Consultation
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-[#1A14A5] text-[#1A14A5] hover:bg-[#1A14A5] hover:text-white shadow-xs rounded-xl text-sm py-2.5"
              asChild
            >
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-700 hover:border-[#1A14A5] hover:text-[#1A14A5] rounded-xl text-xs py-2"
              asChild
            >
              <a href="tel:+923128994968">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-[#1A14A5]" /> +92 312 8994968
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

