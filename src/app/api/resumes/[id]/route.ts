import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { ai } from "@/lib/ai";

const JWT_SECRET = process.env.JWT_SECRET || "platform-development-jwt-secret-key-10293";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

// Helper to check ownership
async function checkOwnership(resumeId: string, userId: string | null) {
  const resume = await db.resumes.findUnique(resumeId);
  if (!resume) return false;
  if (resume.userId === "guest-user" && (!userId || userId === "guest-user")) return true;
  return resume.userId === userId;
}

// GET single resume (including version history)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();

  const owned = await checkOwnership(id, userId);
  if (!owned) {
    return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
  }

  const resume = await db.resumes.findUnique(id);
  const versions = await db.versions.findMany(id);

  return NextResponse.json({ success: true, resume, versions });
}

// PUT update resume (and trigger score recalculation)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();

  const owned = await checkOwnership(id, userId);
  if (!owned) {
    return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, content, suggestions, atsScore, subscores } = body;

    const resume = await db.resumes.findUnique(id);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const updatedContent = content || resume.content;
    const updatedName = name || resume.name;

    const { searchParams } = new URL(req.url);
    const analyze = searchParams.get("analyze") === "true";

    const skillsText = updatedContent.skills.join(", ");
    const expText = updatedContent.experience.map((e: typeof updatedContent.experience[number]) => `${e.position} at ${e.company}. ${Array.isArray(e.description) ? e.description.join(". ") : e.description || ""}`).join(". ");
    const projText = updatedContent.projects.map((p: typeof updatedContent.projects[number]) => `${p.name}. ${p.description}`).join(". ");
    const eduText = updatedContent.education.map((e: typeof updatedContent.education[number]) => `${e.degree} in ${e.fieldOfStudy} at ${e.institution}`).join(". ");
    const rawText = `${updatedContent.personalInfo.name}\n${updatedContent.summary}\nSkills: ${skillsText}\nExperience: ${expText}\nProjects: ${projText}\nEducation: ${eduText}`;

    const updatePayload: any = {
      name: updatedName,
      content: updatedContent,
      rawText,
    };

    if (suggestions !== undefined) {
      updatePayload.suggestions = suggestions;
    }
    if (atsScore !== undefined) {
      updatePayload.atsScore = atsScore;
    }
    if (subscores !== undefined) {
      updatePayload.subscores = subscores;
    }

    if (analyze) {
      const analysis = await ai.analyzeResume(rawText, updatedContent);
      updatePayload.atsScore = analysis.atsScore;
      updatePayload.subscores = analysis.subscores;
      updatePayload.suggestions = analysis.suggestions;
      updatePayload.roastText = analysis.roastText;
    }

    const updatedResume = await db.resumes.update(id, updatePayload);

    return NextResponse.json({
      success: true,
      resume: updatedResume,
      versions: await db.versions.findMany(id),
    });
  } catch (err) {
    console.error("Update Resume Error:", err);
    const message = err instanceof Error ? err.message : "Failed to update resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE resume
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();

  const owned = await checkOwnership(id, userId);
  if (!owned) {
    return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
  }

  await db.resumes.delete(id);
  return NextResponse.json({ success: true });
}
