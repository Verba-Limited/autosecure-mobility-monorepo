"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "New Cars", href: "/new-cars" },
  { label: "Used Cars", href: "/used-cars" },
  { label: "Parts", href: "/parts" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E6EDF6] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1210px] items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="autoSecure logo"
            width={34}
            height={34}
            className="h-[34px] w-[34px] object-contain"
            priority
          />

          <span className="leading-tight">
            <span className="block text-[18px] font-black tracking-tight text-navy-900">
              auto<span className="text-gold-500">Secure</span>
            </span>

            <span className="block text-[10px] font-black tracking-[0.24em] text-[#8CA0C0]">
              MOBILITY
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 md:flex">
          <nav className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[14px] font-black text-[#1F2937] transition-colors hover:text-[#2454D6]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/new-cars"
            className="inline-flex h-11 items-center rounded-[8px] bg-[#2454D6] px-6 text-[14px] font-black text-white shadow-[0_8px_16px_rgba(36,84,214,0.25)] transition-colors hover:bg-[#1E49C4]"
          >
            Browse Cars
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 text-[#1F2937] transition hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-[#E6EDF6] bg-white md:hidden">
          <nav className="flex flex-col px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="border-b border-gray-100 py-4 text-[15px] font-bold text-[#1F2937] hover:text-[#2454D6]"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/new-cars"
              onClick={() => setIsOpen(false)}
              className="mt-5 flex h-11 items-center justify-center rounded-lg bg-[#2454D6] text-[14px] font-bold text-white hover:bg-[#1E49C4]"
            >
              Browse Cars
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
