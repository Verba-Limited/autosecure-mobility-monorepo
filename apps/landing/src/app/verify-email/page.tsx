import { Suspense } from "react";
import { VerifyEmailForm } from "./VerifyEmailForm";

export default function VerifyCustomerEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
