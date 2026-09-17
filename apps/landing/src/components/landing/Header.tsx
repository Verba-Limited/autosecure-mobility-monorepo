"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { clearCustomerSession, getCustomerEmail } from "@/lib/auth-api";

const NAV_LINKS = [
  { label: "New Cars", href: "/new-cars" },
  { label: "Used Cars", href: "/used-cars" },
  { label: "Parts", href: "/parts" },
  { label: "Compare", href: "/compare" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsSignedIn(Boolean(getCustomerEmail()));
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function signOut() {
    clearCustomerSession();
    setIsSignedIn(false);
    setIsOpen(false);
  }

  return (
    <header
      className={`landing-header sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#242424]/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.08)]"
          : "border-b border-white/8 bg-[#242424]/90 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1210px] items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#C9943A]/10 border border-[#C9943A]/20 group-hover:bg-[#C9943A]/20 transition-colors">
            <Image
              src="/logo.svg"
              alt="autoSecure logo"
              width={22}
              height={22}
              className="h-[22px] w-[22px] object-contain"
              priority
            />
          </div>

          <span className="leading-tight">
            <span className="brand-wordmark block text-[20px] tracking-tight text-white">
              auto<span className="text-[#C9943A]">Secure</span>
            </span>
            <span className="block text-[10px] font-black tracking-[0.24em] text-white/30">
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
                className="text-[14px] font-semibold text-white/60 transition-colors hover:text-white relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#C9943A] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {isSignedIn ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/account"
                className="inline-flex h-10 items-center rounded-[8px] border border-[#C9943A]/30 bg-[#C9943A]/10 px-4 text-[13px] font-bold text-[#C9943A] transition-all hover:bg-[#C9943A]/20"
              >
                My Account
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex h-10 items-center rounded-[8px] border border-white/15 bg-white/5 px-4 text-[13px] font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-[8px] bg-[#C9943A] px-5 text-[13px] font-bold text-black transition-all hover:bg-[#E0AE5A] shadow-[0_4px_16px_rgba(201,148,58,0.3)]"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 text-white/60 transition hover:bg-white/8 hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-white/10 bg-[#242424] md:hidden">
          <nav className="flex flex-col px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="border-b border-white/6 py-4 text-[15px] font-semibold text-white/60 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isSignedIn ? (
              <div className="mt-5 flex flex-col gap-2.5">
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-[#C9943A] text-[14px] font-bold text-black hover:bg-[#E0AE5A]"
                >
                  My Account &amp; Orders
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex h-11 w-full items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[14px] font-semibold text-white hover:bg-white/10"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="mt-5 flex h-11 items-center justify-center rounded-lg bg-[#C9943A] text-[14px] font-bold text-black hover:bg-[#E0AE5A]"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
