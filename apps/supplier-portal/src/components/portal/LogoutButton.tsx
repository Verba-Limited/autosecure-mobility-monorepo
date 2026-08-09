"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupplierAuthStore } from "@/stores/auth-store";

export function LogoutButton({ variant = "icon" }: { variant?: "icon" | "nav" }) {
  const router = useRouter();
  const logout = useSupplierAuthStore((state) => state.logout);

  function handleLogout() {
    logout("User clicked sign out");
    router.push("/login");
    router.refresh();
  }

  if (variant === "nav") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <LogOut className="h-4.5 w-4.5 shrink-0 text-red-600" />
        Sign out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/65 transition hover:bg-white/10 hover:text-white"
      aria-label="Log out"
      title="Log out"
    >
      <LogOut className="h-4.5 w-4.5" />
    </button>
  );
}
