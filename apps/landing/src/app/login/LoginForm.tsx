"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  authApi,
  getAuthErrorMessage,
  saveCustomerSession,
} from "@/lib/auth-api";
import { CustomerAuthShell } from "@/components/auth/CustomerAuthShell";
import {
  AuthButton,
  AuthField,
  PasswordField,
} from "@/components/auth/CustomerAuthFields";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const registered = searchParams.get("registered") === "1";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    setIsSubmitting(true);
    try {
      const tokens = await authApi.login({ email, password });
      saveCustomerSession(email, tokens);
      const next = searchParams.get("next");
      router.push(next?.startsWith("/") ? next : "/");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CustomerAuthShell
      title="Nice to see you again!"
      description="Welcome! Please enter your details."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {registered && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            Account created. Sign in to continue.
          </p>
        )}
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
          autoComplete="email"
          placeholder="Enter your email"
        />
        <PasswordField
          label="Password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="**********"
        />
        <div className="text-right text-base font-semibold">
          <Link href="/forgot-password" className="text-black">
            Forgot password?
          </Link>
        </div>
        <AuthButton disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </AuthButton>
        <p className="text-center text-sm font-semibold text-[#64748B]">
          New customer?{" "}
          <Link href="/register" className="text-portal-blue-600">
            Create account
          </Link>
        </p>
      </form>
    </CustomerAuthShell>
  );
}
