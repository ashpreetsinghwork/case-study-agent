import { NextResponse } from "next/server";
import { improveSection } from "@/pipeline/architect";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const { id: projectId, sectionId } = await params;

  try {
    const section = await improveSection(projectId, sectionId);
    return NextResponse.json({ section });
  } catch (err) {
    console.error(`Improve section failed for ${projectId}/${sectionId}:`, err);
    return NextResponse.json({ error: "Could not improve this section" }, { status: 500 });
  }
}
