import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { CustomerAccountClient } from "@/components/account/CustomerAccountClient";

export const metadata: Metadata = {
  title: "Customer Account & Orders | autoSecure Mobility",
  description:
    "Manage your account, track vehicle orders, submit custom sourcing requests, and view order history on autoSecure Mobility.",
};

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black px-6 pb-28 pt-12 lg:px-16">
        <div className="mx-auto max-w-[1240px]">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[13px] font-semibold text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">
              Home
            </Link>
            <span className="text-white/15">/</span>
            <span className="text-[#C9943A]">Customer Account</span>
          </nav>

          <Suspense
            fallback={
              <div className="py-24 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#C9943A] border-t-transparent" />
              </div>
            }
          >
            <CustomerAccountClient />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
