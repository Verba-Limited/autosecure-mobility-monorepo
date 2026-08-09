"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  AuthButton,
  AuthNotice,
  PasswordField,
  PasswordRequirements,
} from "@/components/auth/AuthFormFields";
import { authApi, getAuthErrorMessage } from "@/lib/auth-api";
import {
  getString,
  validateEmail,
  validateOtp,
  validatePassword,
  type AuthValidationErrors,
} from "@/lib/auth-validation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("email") ?? "";
    }
    return "";
  });
  const [otp] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("otp") ?? "";
    }
    return "";
  });
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthValidationErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const emailValue = getString(formData, "email");
    const otpValue = getString(formData, "otp");
    const newPassword = getString(formData, "newPassword");
    const confirmPassword = getString(formData, "confirmPassword");
    const errors: AuthValidationErrors = {};

    validateEmail(errors, emailValue);
    validateOtp(errors, otpValue);
    validatePassword(errors, newPassword, "newPassword");
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords must match.";
    } else if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword(emailValue, otpValue, newPassword);
      router.push(`/login?reset=1&email=${encodeURIComponent(emailValue)}`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="New Password"
      description="Your new password must be different from the last 5 passwords you've used and meet all the requirements below."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <AuthNotice message={error} tone="error" />
        <input
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="hidden"
        />
        <input name="otp" value={otp} type="hidden" readOnly />
        <PasswordField
          label="New Password"
          name="newPassword"
          placeholder="e.g. melissa_clark"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          error={fieldErrors.newPassword}
        />
        <PasswordRequirements password={newPassword} />
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="e.g. melissa_clark"
          error={fieldErrors.confirmPassword}
        />
        <AuthButton disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Continue"}
        </AuthButton>
        <p className="text-center text-sm font-semibold text-[#64748B]">
          Password reset?{" "}
          <Link href="/login" className="text-portal-blue-600">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
