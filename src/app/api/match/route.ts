import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ai } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { resumeId, jobDescription } = await req.json();

    if (!resumeId || !jobDescription) {
      return NextResponse.json({ error: "Missing resumeId or jobDescription" }, { status: 400 });
    }

    const resume = await db.resumes.findUnique(resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const matchResults = await ai.matchJobDescription(resume.content, jobDescription);

    return NextResponse.json({
      success: true,
      ...matchResults,
    });
  } catch (err) {
    console.error("Match API Error:", err);
    const message = err instanceof Error ? err.message : "Failed to analyze match";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
