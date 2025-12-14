"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Menu, Phone, Code, Palette, Camera, Megaphone } from "lucide-react"
import Lenis from "@studio-freight/lenis"

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Enable Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [])

  return (
    <header className="fixed top-0 w-full z-50 bg-[#F4F7FE]/80 backdrop-blur-xl shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-1 py-1 md:py-1">
        {/* Left - Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/3dlogobgrewtx.png"
            alt="logo"
            width={60}
            height={60}
            className="drop-shadow-md"
          />
        </Link>

        {/* Center - Desktop Navigation */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center space-x-6 text-[#231F20] font-medium">
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="hover:text-[#1A14A5] transition">
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              

              {/* Mega Dropdown for Services */}
            <NavigationMenuItem>
  <NavigationMenuTrigger className="hover:text-[#1A14A5] transition">
    Services
  </NavigationMenuTrigger>
  <NavigationMenuContent>
    <div className="grid grid-cols-2 gap-6 p-6 w-[500px] bg-white/95 backdrop-blur-lg shadow-xl rounded-2xl">
      <Link
        href="/Services/development"
        className="flex items-start space-x-3 p-3 rounded-xl hover:bg-[#F4F7FE] transition"
      >
        <Code className="text-[#1A14A5]" size={20} />
        <div>
          <h4 className="font-semibold text-[#231F20]">Development</h4>
          <p className="text-sm text-gray-600">
            Web & mobile solutions tailored for your needs.
          </p>
        </div>
      </Link>

      <Link
        href="/Services/designing"
        className="flex items-start space-x-3 p-3 rounded-xl hover:bg-[#F4F7FE] transition"
      >
        <Palette className="text-[#1A14A5]" size={20} />
        <div>
          <h4 className="font-semibold text-[#231F20]">Designing</h4>
          <p className="text-sm text-gray-600">
            UI/UX that blends creativity and usability.
          </p>
        </div>
      </Link>

      <Link
        href="/Services/marketing"
        className="flex items-start space-x-3 p-3 rounded-xl hover:bg-[#F4F7FE] transition"
      >
        <Megaphone className="text-[#1A14A5]" size={20} />
        <div>
          <h4 className="font-semibold text-[#231F20]">Marketing</h4>
          <p className="text-sm text-gray-600">
            Strategies that help your brand grow faster.
          </p>
        </div>
      </Link>

      <Link
        href="/Services/photography"
        className="flex items-start space-x-3 p-3 rounded-xl hover:bg-[#F4F7FE] transition"
      >
        <Camera className="text-[#1A14A5]" size={20} />
        <div>
          <h4 className="font-semibold text-[#231F20]">Photography</h4>
          <p className="text-sm text-gray-600">
            Stunning visuals to capture your brand story.
          </p>
        </div>
      </Link>
      <Link
        href="/Services/ai"
        className="flex items-start space-x-3 p-3 rounded-xl hover:bg-[#F4F7FE] transition"
      >
        <Camera className="text-[#1A14A5]" size={20} />
        <div>
          <h4 className="font-semibold text-[#231F20]">Ai</h4>
          <p className="text-sm text-gray-600">
            Stunning visuals to capture your brand story.
          </p>
        </div>
      </Link>
    </div>
  </NavigationMenuContent>
</NavigationMenuItem>
<NavigationMenuItem>
                <NavigationMenuLink asChild className="hover:text-[#1A14A5] transition">
                  <Link href="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* <NavigationMenuItem>
                <NavigationMenuLink asChild className="hover:text-[#1A14A5] transition">
                  <Link href="/Blog">Blog</Link>
                </NavigationMenuLink>
              </NavigationMenuItem> */}

              {/* <NavigationMenuItem>
                <NavigationMenuLink asChild className="hover:text-[#1A14A5] transition">
                  <Link href="/Casestudies">Case Studies</Link>
                </NavigationMenuLink>
              </NavigationMenuItem> */}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right - Buttons */}
        <div className="hidden md:flex space-x-3">
          <Button className="bg-[#1A14A5] text-white shadow-md hover:bg-[#231F20] rounded-2xl px-5" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
          <Button
            variant="outline"
            className="border-[#1A14A5] text-[#1A14A5] hover:bg-[#1A14A5] hover:text-white shadow-md rounded-2xl px-5"
          >
            <Phone className="w-4 h-4 mr-2" /> +92 312 8994968
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-[#231F20] hover:bg-[#F4F7FE]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg shadow-xl p-6 space-y-4">
          <Link href="/" className="block hover:text-[#1A14A5]">
            Home
          </Link>
        
          <div>
            <p className="font-semibold text-[#231F20] mb-2">Services</p>
            <div className="space-y-2 pl-3">
              <Link
                href="/Services/development"
                className="block hover:text-[#1A14A5]"
              >
                Development
              </Link>
              <Link
                href="/Services/designing"
                className="block hover:text-[#1A14A5]"
              >
                Designing
              </Link>
              <Link
                href="/Services/marketing"
                className="block hover:text-[#1A14A5]"
              >
                Marketing
              </Link>
              <Link
                href="/Services/photography"
                className="block hover:text-[#1A14A5]"
              >
                Photography
              </Link>
            </div>
          </div>
            <Link href="/about" className="block hover:text-[#1A14A5]">
            About
          </Link>
          {/* <Link href="/Blog" className="block hover:text-[#1A14A5]">
            Blog
          </Link>
          <Link href="/Casestudies" className="block hover:text-[#1A14A5]">
            Case Studies
          </Link> */}
          <div className="flex flex-col gap-3 pt-4">
            <Button className="bg-[#1A14A5] text-white shadow-md hover:bg-[#231F20] rounded-2xl" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
            <Button
              variant="outline"
              className="border-[#1A14A5] text-[#1A14A5] hover:bg-[#1A14A5] hover:text-white shadow-md rounded-2xl"
            >
              <Phone className="w-4 h-4 mr-2" /> +92 312 8994968
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
