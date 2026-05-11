import { Suspense } from "react";

import { LoginPage } from "@/components/auth/auth-pages";

export default function LoginRoute() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
