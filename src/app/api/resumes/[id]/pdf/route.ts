import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db, ResumeContent } from "@/lib/db";
import { buildResumeHtml } from "@/app/api/resumes/[id]/export/route";

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

  // Auth check
  const resume = await db.resumes.findUnique(id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (resume.userId !== "guest-user" && resume.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Dynamically import puppeteer — only available in Node.js environments (not Cloudflare Workers)
    let puppeteer;
    try {
      // @ts-ignore — puppeteer is an optional dependency, only available in Node.js environments
      puppeteer = (await import("puppeteer")).default;
    } catch {
      return NextResponse.json(
        { error: "PDF generation requires a Node.js server environment with Chromium. Not available on edge/worker runtimes." },
        { status: 501 }
      );
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
    await page.emulateMediaType("print");

    // Generate HTML directly to prevent localhost server deadlocks
    const htmlContent = buildResumeHtml(resume.content as unknown as ResumeContent, resume.name);
    await page.setContent(htmlContent, { waitUntil: "load" });

    // Generate A4 PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    const filename = `${resume.name.replace(/[^a-zA-Z0-9\s-]/g, "").trim() || "resume"}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[PDF generation error]", err);
    return NextResponse.json(
      { error: "PDF generation failed. Please try again." },
      { status: 500 }
    );
  }
}
