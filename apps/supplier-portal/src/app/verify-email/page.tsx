"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  AuthButton,
  AuthNotice,
  OtpField,
} from "@/components/auth/AuthFormFields";
import { authApi, getAuthErrorMessage } from "@/lib/auth-api";
import {
  getString,
  validateEmail,
  validateOtp,
  type AuthValidationErrors,
} from "@/lib/auth-validation";

const OTP_RESEND_SECONDS = 180;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "";
  const mode = searchParams?.get("mode") === "reset" ? "reset" : "signup";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(OTP_RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthValidationErrors>({});

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resendSeconds]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const emailValue = getString(formData, "email");
    const otp = getString(formData, "otp");
    const errors: AuthValidationErrors = {};

    validateEmail(errors, emailValue);
    validateOtp(errors, otp);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "reset") {
        router.push(
          `/reset-password?email=${encodeURIComponent(emailValue)}&otp=${encodeURIComponent(otp)}`,
        );
        return;
      }

      await authApi.verifyEmail({
        email: emailValue,
        otp,
      });
      router.push(`/login?verified=1&email=${encodeURIComponent(emailValue)}`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (resendSeconds > 0 || isResending) {
      return;
    }

    const errors: AuthValidationErrors = {};
    validateEmail(errors, email);

    if (errors.email) {
      setError(errors.email);
      return;
    }

    setError(null);
    setNotice(null);
    setIsResending(true);

    try {
      await authApi.resendOtp({
        email,
        purpose: mode === "reset" ? "PASSWORD_RESET" : "EMAIL_VERIFICATION",
      });
      setNotice("A new OTP has been sent to your email.");
      setResendSeconds(OTP_RESEND_SECONDS);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell
      title="OTP Verification"
      description={`A verification code has been sent to your registered email address ${maskEmail(email)}.`}
    >
      <form className="space-y-28" onSubmit={handleSubmit}>
        <AuthNotice message={notice} tone="success" />
        <AuthNotice message={error} tone="error" />
        <input type="hidden" name="email" value={email} />
        <OtpField name="otp" error={fieldErrors.otp} />
        <div className="flex items-center gap-2 text-sm font-medium text-[#4A5872]">
          <span className="h-4 w-4 rounded-full border-2 border-[#F97316]" />
          {resendSeconds > 0 && <span>Resend available in </span>}
          {resendSeconds > 0 && (
            <span className="font-bold text-portal-ink">
              {formatResendTime(resendSeconds)}
            </span>
          )}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendSeconds > 0 || isResending}
            className="text-[#F59E4C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
        <AuthButton disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Continue"}
        </AuthButton>
        <p className="text-center text-sm font-semibold text-[#64748B]">
          Verified already?{" "}
          <Link href="/login" className="text-portal-blue-600">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

function formatResendTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function maskEmail(email: string) {
  if (!email) {
    return "your email.";
  }

  const [name, domain] = email.split("@");
  if (!name || !domain) {
    return email;
  }

  return `${name.slice(0, 4)}******@${domain}`;
}
