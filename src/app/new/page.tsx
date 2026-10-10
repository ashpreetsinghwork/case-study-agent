import type { Metadata } from "next";
import { IntakeForm } from "@/components/new/intake-form";
import { AuthBar } from "@/components/auth/auth-bar";

export const metadata: Metadata = {
  title: "Start your case study",
  description: "Tell the agent about your project so it can start organizing your material.",
};

export default function NewProjectPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <AuthBar />
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Start your case study
        </h1>
        <p className="mx-auto mt-3 max-w-[52ch] text-muted-foreground">
          A few details about the project, then drop in whatever material
          you have. The Organiser takes it from here.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <IntakeForm />
      </div>
    </main>
  );
}
