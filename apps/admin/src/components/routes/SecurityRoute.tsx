"use client";

import { FormEvent, useState } from "react";
import { FiKey, FiLoader, FiLock, FiShield } from "react-icons/fi";
import { AdminPageHeader } from "@/components/ui/AdminPrimitives";
import { adminApi, getAdminErrorMessage } from "@/lib/admin-api";
import { notifyError, notifySuccess } from "@/lib/admin-notifications";
import { useAdminAuthStore } from "@/stores/auth-store";

type PasswordFields = "oldPassword" | "newPassword" | "confirmPassword";
type PasswordErrors = Partial<Record<PasswordFields, string>>;

export function SecurityRoute() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: PasswordFields) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: PasswordErrors = {};
    if (!oldPassword) nextErrors.oldPassword = "Enter your current password.";
    if (newPassword.length < 8)
      nextErrors.newPassword = "Use at least 8 characters.";
    else if (newPassword === oldPassword)
      nextErrors.newPassword = "Choose a password different from your current one.";
    if (!confirmPassword)
      nextErrors.confirmPassword = "Confirm your new password.";
    else if (confirmPassword !== newPassword)
      nextErrors.confirmPassword = "The passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !accessToken) return;

    setIsSubmitting(true);
    try {
      await adminApi.changePassword(accessToken, { oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notifySuccess("Password changed successfully.");
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Security"
        description="Update the password used to access the admin console."
      />
      <section className="max-w-2xl rounded-2xl border border-[var(--admin-line)] bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--admin-line)] pb-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-navy)] text-[var(--admin-gold)]">
            <FiShield aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">Change password</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
              Use at least 8 characters and choose a password you do not use elsewhere.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
          <PasswordInput
            id="old-password"
            label="Current password"
            value={oldPassword}
            error={errors.oldPassword}
            autoComplete="current-password"
            icon="lock"
            onChange={(value) => {
              setOldPassword(value);
              clearError("oldPassword");
            }}
          />
          <PasswordInput
            id="new-password"
            label="New password"
            value={newPassword}
            error={errors.newPassword}
            autoComplete="new-password"
            icon="key"
            onChange={(value) => {
              setNewPassword(value);
              clearError("newPassword");
            }}
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm new password"
            value={confirmPassword}
            error={errors.confirmPassword}
            autoComplete="new-password"
            icon="key"
            onChange={(value) => {
              setConfirmPassword(value);
              clearError("confirmPassword");
            }}
          />
          <div className="flex justify-end border-t border-[var(--admin-line)] pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--admin-navy)] px-5 text-sm font-bold text-white transition hover:bg-[var(--admin-navy-soft)] disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? (
                <FiLoader className="animate-spin" aria-hidden="true" />
              ) : (
                <FiKey aria-hidden="true" />
              )}
              {isSubmitting ? "Updating password" : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

function PasswordInput({
  id,
  label,
  value,
  error,
  autoComplete,
  icon,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  autoComplete: string;
  icon: "lock" | "key";
  onChange: (value: string) => void;
}) {
  const Icon = icon === "lock" ? FiLock : FiKey;
  const errorId = `${id}-error`;
  return (
    <label htmlFor={id} className="block text-sm font-semibold">
      {label}
      <div className="relative mt-2">
        <Icon className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          id={id}
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-12 w-full rounded-xl border border-[var(--admin-line)] bg-white pl-11 pr-4 outline-none transition focus:border-[var(--admin-gold)] focus:ring-4 focus:ring-[var(--admin-gold)]/15"
        />
      </div>
      {error ? (
        <span id={errorId} className="mt-2 block text-xs font-medium text-red-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}
