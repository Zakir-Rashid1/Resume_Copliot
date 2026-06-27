import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getUserId();

  const resume = await db.resumes.findUnique(id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (resume.userId !== "guest-user" && resume.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!resume.originalPdfBase64) {
    return NextResponse.json({ error: "No original PDF stored for this resume" }, { status: 404 });
  }

  const pdfBuffer = Buffer.from(resume.originalPdfBase64, "base64");
  const filename = `${resume.name.replace(/[^a-zA-Z0-9\s-]/g, "").trim() || "resume"}.pdf`;
  // ?download=true → force file download; default → inline (shown in iframe)
  const forceDownload = req.nextUrl.searchParams.get("download") === "true";

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${forceDownload ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
