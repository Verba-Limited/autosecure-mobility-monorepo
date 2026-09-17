"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function AuthField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-sm font-bold text-white/90">{label}</span>
      <input
        {...props}
        className="h-14 rounded-2xl border border-white/10 bg-[#141414] px-5 text-base font-medium text-white shadow-[0_12px_24px_rgba(0,0,0,0.4)] outline-none transition placeholder:text-white/30 focus:border-[#C9943A]/60 focus:ring-2 focus:ring-[#C9943A]/15"
      />
    </label>
  );
}

export function PasswordField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-sm font-semibold text-white/60">{label}</span>
      <span className="flex h-14 items-center rounded-2xl border border-white/10 bg-[#141414] px-5 shadow-[0_12px_24px_rgba(0,0,0,0.4)] focus-within:border-[#C9943A]/60 focus-within:ring-2 focus-within:ring-[#C9943A]/15">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-white/30"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="ml-3 p-1 text-white/40 hover:text-white transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
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
      className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#C9943A] text-lg font-bold tracking-wide text-black transition-colors hover:bg-[#E0AE5A] shadow-[0_4px_20px_rgba(201,148,58,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
