import { NextResponse } from "next/server";
import { improveSection } from "@/pipeline/architect";
import { createClient } from "@/lib/supabase/server";
import { isProjectOwner } from "@/lib/ownership";

export async function POST(
  _request: Request,
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

  try {
    const section = await improveSection(projectId, sectionId);
    return NextResponse.json({ section });
  } catch (err) {
    console.error(`Improve section failed for ${projectId}/${sectionId}:`, err);
    return NextResponse.json({ error: "Could not improve this section" }, { status: 500 });
  }
}
