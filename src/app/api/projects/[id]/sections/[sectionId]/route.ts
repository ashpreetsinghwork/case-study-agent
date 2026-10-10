import { NextResponse } from "next/server";
import { updateSectionManually } from "@/pipeline/architect";
import { createClient } from "@/lib/supabase/server";
import { isProjectOwner } from "@/lib/ownership";

// Powers the reader's double-click-to-edit text boxes — a direct save,
// no LLM involved. Sibling to improve/route.ts, which does the AI rewrite.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const { id: projectId, sectionId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isProjectOwner(projectId, user.id))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const updates = (await request.json()) as { heading?: string; body?: string };

  try {
    const section = await updateSectionManually(projectId, sectionId, updates);
    return NextResponse.json({ section });
  } catch (err) {
    console.error(`Manual edit failed for ${projectId}/${sectionId}:`, err);
    return NextResponse.json({ error: "Could not save this section" }, { status: 500 });
  }
}
