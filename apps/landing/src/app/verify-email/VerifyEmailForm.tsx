"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi, getAuthErrorMessage } from "@/lib/auth-api";

const OTP_RESEND_SECONDS = 60;

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(OTP_RESEND_SECONDS);
  const email = searchParams.get("email") ?? "";

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
    const form = new FormData(event.currentTarget);
    const otp = String(form.get("otp") ?? "").trim();
    if (!email || !/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await authApi.verifyEmail({ email, otp });
      router.push(`/login?email=${encodeURIComponent(email)}&registered=1`);
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

    if (!email) {
      setError("No email address found. Please go back and register again.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsResending(true);

    try {
      await authApi.resendOtp({
        email,
        purpose: "EMAIL_VERIFICATION",
      });
      setNotice("A new OTP has been sent to your email.");
      setResendSeconds(OTP_RESEND_SECONDS);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  }

  function formatResendTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFD] px-6">
      <section className="w-full max-w-md rounded-lg border border-[#DDE6F2] bg-white p-8 shadow-[0_10px_30px_rgba(15,27,61,0.08)]">
        <Link href="/" className="text-lg font-black text-[#0A0F1E]">
          auto<span className="text-[#F5A623]">Secure</span> Mobility
        </Link>
        <h1 className="mt-8 text-3xl font-extrabold text-[#0A0F1E]">
          Verify your email
        </h1>
        <p className="mt-3 leading-6 text-[#63738F]">
          Enter the 6-digit code sent to {email || "your email address"}.
        </p>
        {notice && (
          <p className="mt-5 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-600">
            {notice}
          </p>
        )}
        {error && (
          <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="flex flex-col gap-2 text-sm font-bold text-[#1F2937]">
            Verification code
            <input
              name="otp"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              className="h-12 rounded-lg border border-[#DDE6F2] px-4 text-center text-lg tracking-[0.4em] outline-none focus:border-[#2454D6]"
            />
          </label>
          <div className="flex items-center gap-2 text-sm text-[#63738F]">
            {resendSeconds > 0 ? (
              <span>
                Resend available in{" "}
                <span className="font-bold text-[#0A0F1E]">
                  {formatResendTime(resendSeconds)}
                </span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="font-semibold text-[#2454D6] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </button>
            )}
          </div>
          <button
            disabled={isSubmitting}
            className="h-12 w-full rounded-lg bg-[#2454D6] text-sm font-bold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </form>
      </section>
    </main>
  );
}
