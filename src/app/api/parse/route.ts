import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { parseDocument, segmentResumeText } from "@/lib/parser";
import { ai } from "@/lib/ai";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "platform-development-jwt-secret-key-10293";

// Helper to authenticate session and get userId
async function getUserIdFromRequest(): Promise<string | null> {
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
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const nameOverride = formData.get("name") as string;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const userId = await getUserIdFromRequest() || "guest-user";

    // 1. Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type;

    // 2. Parse text
    const rawText = await parseDocument(buffer, mimeType);

    if (!rawText.trim()) {
      return NextResponse.json({ error: "Failed to extract text. The file may be empty or an image PDF." }, { status: 422 });
    }

    // 3. Segment into sections
    const segmentedContent = segmentResumeText(rawText);
    
    // 4. Run AI ATS scorer + Roast generator
    const analysis = await ai.analyzeResume(rawText, segmentedContent);

    // 5. Save in database — store original PDF so checker can display it unchanged
    const originalPdfBase64 = mimeType === "application/pdf"
      ? buffer.toString("base64")
      : null;

    const savedResume = await db.resumes.create({
      userId,
      name: nameOverride || file.name || "My Parsed Resume",
      rawText,
      content: segmentedContent,
      atsScore: analysis.atsScore,
      subscores: analysis.subscores,
      suggestions: analysis.suggestions,
      roastText: analysis.roastText,
      sourceType: "uploaded",
      originalPdfBase64,
    });

    return NextResponse.json({
      success: true,
      resume: savedResume,
    });
  } catch (err) {
    console.error("Resume Parse API Error:", err);
    const message = err instanceof Error ? err.message : "Failed to process resume file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
