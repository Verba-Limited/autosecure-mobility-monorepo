import {
  Briefcase,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LINK_COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { href: "/new-cars", label: "New Cars" },
      { href: "/used-cars", label: "Used Cars & Deals" },
      { href: "/parts", label: "Aftermarket Parts" },
      { href: "/used-cars", label: "Flash Sales" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#suppliers", label: "For Suppliers" },
      { href: "mailto:hello@autosecure.ng", label: "Request Access" },
      { href: "/#process", label: "How It Works" },
      { href: "/#why-autosecure", label: "Why autoSecure" },
    ],
  },
];

const CONTACT = [
  { icon: Mail, text: "hello@autosecure.ng" },
  { icon: MessageCircle, text: "WhatsApp Support" },
  { icon: MapPin, text: "Lagos, Nigeria" },
  { icon: Clock, text: "Mon-Sat, 8am-8pm" },
];

const SOCIALS = [Globe, Briefcase, MessageCircle, Users];

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/6 px-6 pb-14 pt-16 lg:px-8">
      {/* Gold line */}
      <div className="mx-auto mb-14 h-px max-w-[1210px] bg-gradient-to-r from-transparent via-[#C9943A]/20 to-transparent" />

      <div className="mx-auto max-w-[1210px]">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.55fr_0.65fr_0.7fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#C9943A]/20 bg-[#C9943A]/10">
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
                <span className="block text-[18px] font-black tracking-tight text-white">
                  auto<span className="text-[#C9943A]">Secure</span>
                </span>
                <span className="block text-[10px] font-black tracking-[0.24em] text-white/25">
                  MOBILITY
                </span>
              </span>
            </Link>
            <p className="mt-7 max-w-[17rem] text-[14px] font-semibold leading-7 text-white/35">
              Nigeria&apos;s most trusted automotive marketplace. New cars,
              certified pre-owned vehicles, and premium parts — all verified,
              all secured.
            </p>
            <div className="mt-8 flex gap-3">
              {SOCIALS.map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/8 bg-white/4 text-white/35 transition-all hover:border-[#C9943A]/30 hover:bg-[#C9943A]/10 hover:text-[#C9943A]"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {LINK_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[14px] font-black text-white/20">
                {column.title}
              </p>
              <ul className="mt-3 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] font-semibold text-white/35 transition-colors hover:text-white/70"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[14px] font-black text-white/20">Contact</p>
            <ul className="mt-3 space-y-3">
              {CONTACT.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-2 text-[14px] font-semibold text-white/35"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-[#C9943A]/60" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-8 sm:flex-row">
          <p className="text-[13px] text-white/20">
            © {new Date().getFullYear()} autoSecure Mobility. All rights reserved.
          </p>
          <div className="flex gap-6 text-[13px] text-white/20">
            <a href="#" className="hover:text-white/40 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/40 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
