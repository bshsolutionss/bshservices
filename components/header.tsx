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
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react";
import {
  SERVICE_CATEGORIES,
  type ServiceCategorySlug,
} from "@/lib/services-data";

type NavCategorySlug = Exclude<ServiceCategorySlug, "photography">;

const CATEGORY_KEYS: NavCategorySlug[] = [
  "development",
  "designing",
  "marketing",
  "ai",
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

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
            style={{ width: "auto" }}
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

              {/* Services dropdown: category overview pages */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:text-[#1A14A5] transition font-medium">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-0">
                  <ul className="w-[220px] p-1.5">
                    {CATEGORY_KEYS.map((catKey) => {
                      const category = SERVICE_CATEGORIES[catKey];

                      return (
                        <li key={catKey}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={category.overviewPath}
                              className="group/item flex-row items-center justify-between rounded-md px-3 py-2.5 font-medium text-[13.5px] text-[#231F20] hover:bg-[#F4F7FE] hover:text-[#1A14A5] focus:bg-[#F4F7FE] focus:text-[#1A14A5] transition-colors"
                            >
                              {category.shortName}
                              <ChevronRight className="size-3.5 text-[#1A14A5] opacity-0 -translate-x-1 transition-all group-hover/item:opacity-100 group-hover/item:translate-x-0" />
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
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
                Services
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${mobileServicesOpen ? "rotate-180 text-[#1A14A5]" : "text-gray-400"
                  }`}
              />
            </button>

            {mobileServicesOpen && (
              <div className="space-y-2 pt-2 pb-1 pl-1">
                {CATEGORY_KEYS.map((catKey) => {
                  const category = SERVICE_CATEGORIES[catKey];

                  return (
                    <Link
                      key={catKey}
                      href={category.overviewPath}
                      className="block p-3 border border-gray-100 rounded-xl bg-[#F9FAFD] font-semibold text-[13.5px] text-[#231F20] hover:text-[#1A14A5] transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.shortName}
                    </Link>
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
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

