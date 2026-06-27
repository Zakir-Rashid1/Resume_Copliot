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

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { resumeId } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
    }

    const resume = await db.resumes.findUnique(resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }


    const result = await ai.optimizeLinkedIn(resume.content);

    let saved = null;
    if (userId) {
      saved = await db.linkedinOptimizations.create({
        userId,
        originalHeadline: resume.content.experience[0]?.position || "Software Engineer",
        originalAbout: resume.content.summary || "",
        suggestedHeadline: result.suggestedHeadline,
        suggestedAbout: result.suggestedAbout,
        suggestions: result.suggestions,
      });
    }

    return NextResponse.json({
      success: true,
      ...result,
      optimization: saved,
    });
  } catch (err) {
    console.error("LinkedIn API Error:", err);
    const message = err instanceof Error ? err.message : "Failed to optimize LinkedIn content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await db.linkedinOptimizations.findMany(userId);
  return NextResponse.json({ success: true, optimizations: list });
}
