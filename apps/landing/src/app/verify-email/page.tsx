"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authApi, getAuthErrorMessage } from "@/lib/auth-api";

export default function VerifyCustomerEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = searchParams.get("email") ?? "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const otp = String(form.get("otp") ?? "").trim();
    if (!email || !/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await authApi.verifyEmail({ email, otp });
      router.push(`/login?email=${encodeURIComponent(email)}&registered=1`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally { setIsSubmitting(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#F8FAFD] px-6"><section className="w-full max-w-md rounded-lg border border-[#DDE6F2] bg-white p-8 shadow-[0_10px_30px_rgba(15,27,61,0.08)]"><Link href="/" className="text-lg font-black text-[#0A0F1E]">auto<span className="text-[#F5A623]">Secure</span> Mobility</Link><h1 className="mt-8 text-3xl font-extrabold text-[#0A0F1E]">Verify your email</h1><p className="mt-3 leading-6 text-[#63738F]">Enter the 6-digit code sent to {email || "your email address"}.</p>{error && <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}<form onSubmit={handleSubmit} className="mt-6 space-y-5"><label className="flex flex-col gap-2 text-sm font-bold text-[#1F2937]">Verification code<input name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoFocus className="h-12 rounded-lg border border-[#DDE6F2] px-4 text-center text-lg tracking-[0.4em] outline-none focus:border-[#2454D6]" /></label><button disabled={isSubmitting} className="h-12 w-full rounded-lg bg-[#2454D6] text-sm font-bold text-white disabled:opacity-60">{isSubmitting ? "Verifying..." : "Verify email"}</button></form></section></main>;
}
