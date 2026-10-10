import type { SupabaseClient } from "@supabase/supabase-js";
import { getDb } from "@/lib/db";

export type ProjectStatus = "generating" | "ready" | "failed";

export interface ProjectSummary {
  id: string;
  title: string;
  status: ProjectStatus;
  createdAt: string;
}

// Called once, right when a project is created (POST /api/projects) —
// service-role write, bypasses RLS, same as the user_quota writes.
export async function recordNewProject(projectId: string, userId: string, title: string): Promise<void> {
  const { error } = await getDb().from("projects").insert({ id: projectId, user_id: userId, title });
  if (error) throw new Error(`Could not record project ${projectId}: ${error.message}`);
}

// Called from background pipeline code (no request/session context), so
// this also has to go through the service-role client.
export async function markProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
  const { error } = await getDb().from("projects").update({ status }).eq("id", projectId);
  if (error) console.error(`Could not mark project ${projectId} as ${status}:`, error.message);
}

// Called from the "My case studies" page with the viewer's own session
// client — RLS's select policy (supabase/migrations/0003_projects.sql)
// is what actually restricts this to the caller's own rows.
export async function listUserProjects(
  supabase: SupabaseClient,
  userId: string
): Promise<ProjectSummary[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((p) => ({ id: p.id, title: p.title, status: p.status, createdAt: p.created_at }));
}
