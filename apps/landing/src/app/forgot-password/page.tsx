"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomerAuthShell } from "@/components/auth/CustomerAuthShell";
import { AuthButton, AuthField } from "@/components/auth/CustomerAuthFields";
import { authApi, getAuthErrorMessage } from "@/lib/auth-api";

export default function CustomerForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) return setError("Email address is required.");
    setError(null); setIsSubmitting(true);
    try { await authApi.forgotPassword(email); router.push(`/reset-password?email=${encodeURIComponent(email)}`); }
    catch (err) { setError(getAuthErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  }
  return <CustomerAuthShell title="Forgot Password" description="Enter your email and we will send you a reset code."><form onSubmit={handleSubmit} className="space-y-8">{error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}<AuthField label="Email" name="email" type="email" required autoComplete="email" placeholder="Enter your email"/><AuthButton disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Continue"}</AuthButton></form></CustomerAuthShell>;
}
