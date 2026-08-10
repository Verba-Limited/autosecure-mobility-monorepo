import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
