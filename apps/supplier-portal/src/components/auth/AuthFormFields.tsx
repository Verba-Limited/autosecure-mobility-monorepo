"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function AuthField({
  label,
  error,
  ...props
}: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-base font-bold text-black">{label}</span>
      <input
        {...props}
        className={`h-14 rounded-2xl border bg-white px-5 text-base font-medium text-portal-ink shadow-[0_12px_24px_rgba(15,23,42,0.06)] outline-none transition placeholder:text-[#9AA7BD] focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
      />
      {error && (
        <span className="text-xs font-semibold text-red-600">{error}</span>
      )}
    </label>
  );
}

export function PasswordField({
  label,
  error,
  ...props
}: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-sm font-semibold text-[#64748B] ">{label}</span>
      <span
        className={`flex h-14 items-center rounded-2xl border bg-white px-5 shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition focus-within:border-portal-blue-600 focus-within:ring-2 focus-within:ring-portal-blue-600/15 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
      >
        <input
          {...props}
          type={isVisible ? "text" : "password"}
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-portal-ink outline-none placeholder:text-[#9AA7BD]"
        />
        <button
          type="button"
          onClick={() => setIsVisible((value) => !value)}
          className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-portal-ink"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </span>
      {error && (
        <span className="text-xs font-semibold text-red-600">{error}</span>
      )}
    </label>
  );
}

export function AuthButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#2944C5] text-lg font-bold tracking-wide text-white transition-colors hover:bg-portal-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function AuthNotice({
  message,
  tone,
}: {
  message: string | null;
  tone: "success" | "error";
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
        tone === "success"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-600"
      }`}
    >
      {message}
    </p>
  );
}

export function OtpField({ name, error }: { name: string; error?: string }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const value = digits.join("");

  function updateDigit(index: number, nextValue: string) {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);

    if (digit && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleBackspace(index: number) {
    if (digits[index]) {
      return;
    }

    inputsRef.current[index - 1]?.focus();
  }

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            value={digit}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Backspace") {
                handleBackspace(index);
              }
            }}
            inputMode="numeric"
            maxLength={1}
            aria-label={`OTP digit ${index + 1}`}
            className={`h-14 w-14 rounded-xl border bg-[#F8FAFC] text-center text-lg font-bold text-portal-ink outline-none transition focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15 ${
              error ? "border-red-300" : "border-slate-200"
            }`}
          />
        ))}
      </div>
      {error && (
        <span className="mt-2 block text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

export function GoogleAuthButton() {
  return (
    <button
      type="button"
      className="flex h-14 w-full items-center justify-center gap-5 rounded-2xl border border-slate-300 bg-white text-lg font-bold text-black shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition hover:bg-slate-50"
    >
      <span className="text-3xl font-black text-[#4285F4]" aria-hidden="true">
        G
      </span>
      Sign in with Google
    </button>
  );
}

export function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    ["At least 8 characters", password.length >= 8],
    ["Uppercase letter", /[A-Z]/.test(password)],
    ["Lowercase letter", /[a-z]/.test(password)],
    ["Number (0-9)", /\d/.test(password)],
    ["Special character", /[^A-Za-z0-9]/.test(password)],
    ["Not recently used", password.length >= 8],
  ] as const;

  return (
    <div className="rounded-lg border border-slate-200 bg-[#F5F7FB] px-5 py-6">
      <p className="mb-4 text-sm font-bold uppercase tracking-wide text-[#63738F]">
        Password Requirements
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {requirements.map(([label, isMet]) => (
          <span
            key={label}
            className="flex items-center gap-3 text-sm font-semibold text-[#8A9AB4]"
          >
            <span
              className={`h-5 w-5 rounded-full border ${
                isMet
                  ? "border-[#2944C5] bg-[#2944C5]"
                  : "border-slate-300 bg-white"
              }`}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
