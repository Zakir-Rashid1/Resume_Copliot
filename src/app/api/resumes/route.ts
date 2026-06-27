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

// GET all user resumes
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resumes = await db.resumes.findMany(userId);
  return NextResponse.json({ success: true, resumes });
}

// POST create resume from scratch
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, content } = body;

    if (!name || !content) {
      return NextResponse.json({ error: "Missing name or resume content" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const analyze = searchParams.get("analyze") === "true";

    // Flatten content to raw text for AI score analysis
    const skillsText = content.skills.join(", ");
    const expText = content.experience.map((e: typeof content.experience[number]) => `${e.position} at ${e.company}. ${e.description.join(". ")}`).join(". ");
    const projText = content.projects.map((p: typeof content.projects[number]) => `${p.name}. ${p.description}`).join(". ");
    const eduText = content.education.map((e: typeof content.education[number]) => `${e.degree} in ${e.fieldOfStudy} at ${e.institution}`).join(". ");
    const rawText = `${content.personalInfo.name}\n${content.summary}\nSkills: ${skillsText}\nExperience: ${expText}\nProjects: ${projText}\nEducation: ${eduText}`;

    let atsScore = 0;
    let subscores = {
      compatibility: 0,
      keywordMatch: 0,
      formatting: 0,
      readability: 0,
      impact: 0,
      skills: 0,
      projects: 0,
      education: 0,
    };
    let suggestions: any[] = [];
    let roastText = "";

    if (analyze) {
      // Perform initial AI analysis
      const analysis = await ai.analyzeResume(rawText, content);
      atsScore = analysis.atsScore;
      subscores = analysis.subscores;
      suggestions = analysis.suggestions;
      roastText = analysis.roastText;
    }

    const newResume = await db.resumes.create({
      userId,
      name,
      rawText,
      content,
      atsScore,
      subscores,
      suggestions,
      roastText,
      sourceType: "built",
      originalPdfBase64: null,
    });

    return NextResponse.json({ success: true, resume: newResume });
  } catch (err) {
    console.error("Create Resume Error:", err);
    const message = err instanceof Error ? err.message : "Failed to create resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
