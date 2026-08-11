"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  adminApi,
  getAdminErrorMessage,
  saveAdminTokens,
} from "@/lib/admin-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const tokens = await adminApi.login({ email, password });
      saveAdminTokens(tokens);
      router.replace("/");
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[var(--admin-navy)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute bottom-24 right-24 h-48 w-48 rounded-full border border-[var(--admin-gold)]/30" />
        <div className="relative">
          <p className="font-display text-xl font-bold tracking-tight">
            autoSecure Mobility
            <span className="text-[var(--admin-gold)]">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
            The operational layer for a cleaner, safer mobility marketplace.
          </p>
        </div>
        <div className="relative max-w-lg">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[var(--admin-gold)]">
            Operations console
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.05]">
            Keep the marketplace moving.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
            Review inventory, support suppliers, and keep every catalog decision
            visible.
          </p>
        </div>
        <p className="relative text-xs text-slate-500">
          Authorized staff only · autoSecure Mobility
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--admin-navy)] text-[var(--admin-gold)]">
            <ShieldCheck />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--admin-gold)]">
            Welcome back
          </p>
          <h2 className="font-display text-3xl font-bold text-[var(--admin-ink)]">
            Sign in to operations
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--admin-muted)]">
            Use your admin credentials to access the console.
          </p>
          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <label className="block text-sm font-semibold">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-[var(--admin-line)] bg-white px-4 outline-none transition focus:border-[var(--admin-gold)] focus:ring-4 focus:ring-[var(--admin-gold)]/15"
                placeholder="admin@autosecure.com"
              />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <div className="relative mt-2">
                <LockKeyhole className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[var(--admin-line)] bg-white pl-11 pr-4 outline-none transition focus:border-[var(--admin-gold)] focus:ring-4 focus:ring-[var(--admin-gold)]/15"
                  placeholder="Enter your password"
                />
              </div>
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--admin-navy)] font-bold text-white transition hover:bg-[var(--admin-navy-soft)] disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2
                  className="h-5 w-5 animate-spin"
                  aria-label="Signing in"
                />
              ) : (
                <>
                  <span>Enter console</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
