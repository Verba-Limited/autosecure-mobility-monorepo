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
    title: "Suppliers",
    links: [
      { href: "/#suppliers", label: "Supplier Portal" },
      { href: "/#suppliers", label: "List a Vehicle" },
      { href: "/#suppliers", label: "List a Part" },
      { href: "/#suppliers", label: "Dashboard" },
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
    <footer className="bg-[#0F1B2F] px-6 pb-14 pt-16 lg:px-8">
      <div className="mx-auto max-w-[1210px]">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.55fr_0.65fr_0.7fr]">
          <div>
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
                <span className="block text-[18px] font-black tracking-tight text-white">
                  auto<span className="text-gold-500">Secure</span>
                </span>
                <span className="block text-[10px] font-black tracking-[0.24em] text-[#8CA0C0]">
                  MOBILITY
                </span>
              </span>
            </Link>
            <p className="mt-7 max-w-[17rem] text-[14px] font-semibold leading-7 text-white/45">
              Nigeria&apos;s most trusted automotive marketplace. New cars,
              certified pre-owned vehicles, and premium parts - all verified,
              all secured.
            </p>
            <div className="mt-8 flex gap-3">
              {SOCIALS.map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {LINK_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[14px] font-black text-white/25">
                {column.title}
              </p>
              <ul className="mt-3 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] font-semibold text-white/45 transition-colors hover:text-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[14px] font-black text-white/25">Contact</p>
            <ul className="mt-3 space-y-3">
              {CONTACT.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-2 text-[14px] font-semibold text-white/45"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
