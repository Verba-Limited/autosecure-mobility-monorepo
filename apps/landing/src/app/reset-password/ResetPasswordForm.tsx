"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CustomerAuthShell } from "@/components/auth/CustomerAuthShell";
import {
  AuthButton,
  AuthField,
  PasswordField,
} from "@/components/auth/CustomerAuthFields";
import { authApi, getAuthErrorMessage } from "@/lib/auth-api";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const otp = String(form.get("otp") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (!/^\d{6}$/.test(otp) || password.length < 8 || password !== confirm) {
      setError(
        "Enter the 6-digit code and matching passwords of at least 8 characters.",
      );
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(email, otp, password);
      router.push(`/login?email=${encodeURIComponent(email)}&reset=1`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <CustomerAuthShell
      title="New Password"
      description="Set a new password for your customer account."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        <AuthField
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={searchParams.get("email") ?? ""}
        />
        <AuthField
          label="Reset code"
          name="otp"
          inputMode="numeric"
          maxLength={6}
          required
          placeholder="6-digit code"
        />
        <PasswordField
          label="New Password"
          name="password"
          minLength={8}
          required
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm Password"
          name="confirm"
          minLength={8}
          required
          autoComplete="new-password"
        />
        <AuthButton disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Reset password"}
        </AuthButton>
        <p className="text-center text-sm font-semibold text-[#64748B]">
          <Link href="/login" className="text-portal-blue-600">
            Back to sign in
          </Link>
        </p>
      </form>
    </CustomerAuthShell>
  );
}
