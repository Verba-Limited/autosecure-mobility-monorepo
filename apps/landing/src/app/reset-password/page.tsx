import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function CustomerResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
