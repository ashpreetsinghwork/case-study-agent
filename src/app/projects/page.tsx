import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { listUserProjects, type ProjectSummary } from "@/lib/projects";
import { getUserQuota } from "@/lib/quota";

export const metadata: Metadata = { title: "My case studies" };

const STATUS_STYLE: Record<ProjectSummary["status"], string> = {
  ready: "bg-primary/10 text-primary",
  generating: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive",
};

const STATUS_LABEL: Record<ProjectSummary["status"], string> = {
  ready: "Ready",
  generating: "Generating...",
  failed: "Failed",
};

export default async function MyCaseStudiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Proxy already guarantees a session here — this is just a type-narrowing
  // belt-and-suspenders, not the real gate.
  if (!user) redirect("/login");

  const [projects, quota] = await Promise.all([
    listUserProjects(supabase, user.id),
    getUserQuota(supabase, user.id),
  ]);

  const quotaExhausted = !!quota && quota.maxAttempts !== null && quota.usedAttempts >= quota.maxAttempts;

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-foreground">My case studies</h1>
          {quotaExhausted ? (
            <Button disabled title="You've used all your case study attempts">
              Create new
            </Button>
          ) : (
            <Button asChild>
              <Link href="/new">Create new</Link>
            </Button>
          )}
        </div>
        {quotaExhausted && (
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve used all your case study attempts. Ask for more if you need them.
          </p>
        )}

        {projects.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">You haven&apos;t started a case study yet.</p>
            {!quotaExhausted && (
              <Button asChild className="mt-4">
                <Link href="/new">Create your first case study</Link>
              </Button>
            )}
          </div>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm"
                >
                  <p className="truncate text-sm font-semibold text-foreground">{p.title}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
