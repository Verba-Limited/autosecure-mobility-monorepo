"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  AuthButton,
  AuthField,
  AuthNotice,
} from "@/components/auth/AuthFormFields";
import { authApi, getAuthErrorMessage } from "@/lib/auth-api";
import {
  getString,
  validateEmail,
  type AuthValidationErrors,
} from "@/lib/auth-validation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthValidationErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const email = getString(formData, "email");
    const errors: AuthValidationErrors = {};

    validateEmail(errors, email);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.forgotPassword(email);
      router.push(`/verify-email?mode=reset&email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Forgot Password"
      description="Welcome! Please enter your details."
    >
      <form className="space-y-32" onSubmit={handleSubmit}>
        <AuthNotice message={error} tone="error" />
        <AuthField
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          error={fieldErrors.email}
        />
        <AuthButton disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Continue"}
        </AuthButton>
      </form>
    </AuthShell>
  );
}
