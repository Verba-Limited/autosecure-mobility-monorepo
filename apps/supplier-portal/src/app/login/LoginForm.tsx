"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  AuthButton,
  AuthField,
  GoogleAuthButton,
  AuthNotice,
  PasswordField,
} from "@/components/auth/AuthFormFields";
import {
  authApi,
  getAuthErrorMessage,
  saveSupplierTokens,
} from "@/lib/auth-api";
import {
  getString,
  validateEmail,
  validatePassword,
  type AuthValidationErrors,
} from "@/lib/auth-validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email") ?? "";
  const noticeParam =
    searchParams?.get("verified") === "1"
      ? "Email verified. You can now sign in."
      : searchParams?.get("reset") === "1"
        ? "Password reset. You can now sign in."
        : null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState(emailParam);
  const notice = noticeParam;
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthValidationErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const emailValue = getString(formData, "email");
    const password = getString(formData, "password");
    const errors: AuthValidationErrors = {};

    validateEmail(errors, emailValue);
    validatePassword(errors, password);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[AUTH DEBUG] Attempting authApi.login for:", emailValue);
      const tokens = await authApi.login({
        email: emailValue,
        password,
      });
      console.log(
        "[AUTH DEBUG] RAW tokens returned from authApi.login:",
        JSON.stringify(tokens),
      );
      saveSupplierTokens(tokens);
      const next = new URLSearchParams(window.location.search).get("next");
      const targetUrl = next && next.startsWith("/") ? next : "/";
      console.log(`[AUTH DEBUG] Navigating to targetUrl: ${targetUrl}`);
      router.replace(targetUrl);
      router.refresh();
    } catch (err) {
      console.error("[AUTH DEBUG] authApi.login failed with error:", err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Nice to see you again!"
      description="Welcome! Please enter your details."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <AuthNotice message={notice} tone="success" />
        <LoginErrorNotice message={error} email={email} />
        <AuthField
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
        />
        <PasswordField
          label="Password"
          name="password"
          placeholder="**********"
          error={fieldErrors.password}
        />
        <div className="flex justify-end text-base font-semibold">
          <Link href="/forgot-password" className="text-black">
            Forgot password?
          </Link>
        </div>
        <AuthButton disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </AuthButton>
        <GoogleAuthButton />
        <p className="text-center text-sm font-semibold text-[#64748B]">
          New supplier?{" "}
          <Link href="/register" className="text-portal-blue-600">
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

function LoginErrorNotice({
  message,
  email,
}: {
  message: string | null;
  email: string;
}) {
  if (!message) {
    return null;
  }

  if (!isVerifyEmailError(message)) {
    return <AuthNotice message={message} tone="error" />;
  }

  const verifyHref = `/verify-email?email=${encodeURIComponent(email)}`;

  return (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
      {message}{" "}
      <Link
        href={verifyHref}
        className="font-bold text-portal-blue-600 underline"
      >
        Verify email
      </Link>
    </p>
  );
}

function isVerifyEmailError(message: string) {
  return message.toLowerCase().includes("verify your email");
}
