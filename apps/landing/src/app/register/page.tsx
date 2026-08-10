"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  authApi,
  getAuthErrorMessage,
  type CustomerRegistrationPayload,
} from "@/lib/auth-api";
import { CustomerAuthShell } from "@/components/auth/CustomerAuthShell";
import {
  AuthButton,
  AuthField,
  PasswordField,
} from "@/components/auth/CustomerAuthFields";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!firstName || !lastName || !email || password.length < 8) {
      setError(
        "Enter your name, a valid email address, and a password of at least 8 characters.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CustomerRegistrationPayload = {
        email,
        password,
        role: "CUSTOMER",
        firstName,
        lastName,
        companyName: "",
      };
      await authApi.register(payload);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CustomerAuthShell
      title="Create Customer Account"
      description="Register with your email to contact verified suppliers on WhatsApp."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label="First Name"
            name="firstName"
            required
            autoComplete="given-name"
          />
          <AuthField
            label="Last Name"
            name="lastName"
            required
            autoComplete="family-name"
          />
        </div>
        <AuthField
          label="Email Address"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <PasswordField
          label="Password"
          name="password"
          minLength={8}
          required
          autoComplete="new-password"
        />
        <AuthButton disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </AuthButton>
        <p className="text-center text-sm font-semibold text-[#64748B]">
          Already registered?{" "}
          <Link href="/login" className="text-portal-blue-600">
            Sign in
          </Link>
        </p>
      </form>
    </CustomerAuthShell>
  );
}
