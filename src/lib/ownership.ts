import { getProjectFile } from "@/lib/storage";

// Every project-scoped API route (other than creation) needs this — the
// proxy only guarantees SOME signed-in user is calling, not that they're
// the one who made THIS project. Fails closed: a project with no
// owner.json (created before auth existed) is owned by no one.
export async function isProjectOwner(projectId: string, userId: string): Promise<boolean> {
  const { data, error } = await getProjectFile(projectId, "owner.json");
  if (error || !data) return false;

  const owner = JSON.parse(await data.text()) as { userId?: string };
  return owner.userId === userId;
}
