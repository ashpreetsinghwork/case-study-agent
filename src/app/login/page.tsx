import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-foreground">Case Study Agent</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Invite-only. Enter the email address you were invited with.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-xs text-muted-foreground">
          Early beta: free, limited access to use, explore, and review.
          Expect things to change.
        </p>
      </div>
    </main>
  );
}
