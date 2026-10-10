import type { Metadata } from "next";
import { StatusView } from "@/components/projects/status-view";
import { AuthBar } from "@/components/auth/auth-bar";

export const metadata: Metadata = {
  title: "Project status",
};

export default async function ProjectStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <AuthBar />
      <StatusView projectId={id} />
    </main>
  );
}
