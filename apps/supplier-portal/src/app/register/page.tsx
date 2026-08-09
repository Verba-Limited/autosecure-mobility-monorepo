"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  AuthButton,
  AuthField,
  AuthNotice,
  PasswordField,
} from "@/components/auth/AuthFormFields";
import { authApi, getAuthErrorMessage } from "@/lib/auth-api";
import {
  getString,
  validateEmail,
  validatePassword,
  validateRequired,
  type AuthValidationErrors,
} from "@/lib/auth-validation";

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthValidationErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const firstName = getString(formData, "firstName");
    const lastName = getString(formData, "lastName");
    const companyName = getString(formData, "companyName");
    const email = getString(formData, "email");
    const password = getString(formData, "password");
    const errors: AuthValidationErrors = {};

    validateRequired(errors, "firstName", firstName, "First name");
    validateRequired(errors, "lastName", lastName, "Last name");
    validateRequired(errors, "companyName", companyName, "Company name");
    validateEmail(errors, email);
    validatePassword(errors, password);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.register({
        role: "SUPPLIER",
        firstName,
        lastName,
        companyName,
        email,
        password,
      });
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create Supplier Account"
      description="Register your business so you can list vehicles and parts for admin approval."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthNotice message={error} tone="error" />
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField label="First Name" name="firstName" error={fieldErrors.firstName} />
          <AuthField label="Last Name" name="lastName" error={fieldErrors.lastName} />
        </div>
        <AuthField label="Company Name" name="companyName" error={fieldErrors.companyName} />
        <AuthField label="Email Address" name="email" type="email" error={fieldErrors.email} />
        <PasswordField label="Password" name="password" error={fieldErrors.password} />
        <AuthButton disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </AuthButton>
        <p className="text-center text-sm font-semibold text-[#64748B]">
          Already registered?{" "}
          <Link href="/login" className="text-portal-blue-600">
            Sign in
          </Link>
          {" or "}
          <Link href="/verify-email" className="text-portal-blue-600">
            verify email
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
