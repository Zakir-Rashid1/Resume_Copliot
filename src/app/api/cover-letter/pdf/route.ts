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

const colorMap: Record<string, string> = {
  purple: "#4f46e5",
  blue: "#0284c7",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
};

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { resumeId, content, company, position, tone } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Missing cover letter content" }, { status: 400 });
    }

    // Default mock personal details in case resume is not found (e.g., guest user baseline)
    let personalInfo = {
      name: "Zakir Rashid",
      email: "Zakir.Rashid.Mir@gmail.com",
      phone: "+91 78898-72359",
      location: "Jammu & Kashmir, India",
      website: "https://zakirrashid.in",
      linkedin: "https://linkedin.com/in/zakir-rashid",
    };
    let accentColor = "#4f46e5"; // Default purple/indigo

    // Retrieve active user resume to match design stationery set
    if (resumeId && resumeId !== "mock-id") {
      const resume = await db.resumes.findUnique(resumeId);
      if (resume) {
        if (resume.userId !== "guest-user" && resume.userId !== userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const rc = resume.content;
        personalInfo = {
          name: rc.personalInfo.name || personalInfo.name,
          email: rc.personalInfo.email || personalInfo.email,
          phone: rc.personalInfo.phone || personalInfo.phone,
          location: rc.personalInfo.location || personalInfo.location,
          website: rc.personalInfo.website || personalInfo.website,
          linkedin: rc.personalInfo.linkedin || personalInfo.linkedin,
        };
        const colorName = rc.color || "purple";
        accentColor = colorMap[colorName] || colorMap.purple;
      }
    }

    // Format current date
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Post-process placeholders just in case
    let processed = content;
    processed = processed.replace(/\[Date\]/gi, dateStr);
    processed = processed.replace(/\[Your\s+Name\]/gi, personalInfo.name || "");
    processed = processed.replace(/\[Your\s+Email\]/gi, personalInfo.email || "");
    processed = processed.replace(/\[Your\s+Phone(?:\s+Number)?\]/gi, personalInfo.phone || "");
    processed = processed.replace(/\[Your\s+Address\]/gi, personalInfo.location || "");
    processed = processed.replace(/\[Your\s+Location\]/gi, personalInfo.location || "");
    processed = processed.replace(/\[Hiring\s+Manager(?:\s+Name\/Department,\s+if\s+known,\s+otherwise\s+use\s+title)?\]/gi, "Hiring Manager");
    processed = processed.replace(/\[Hiring\s+Manager\s+Name\]/gi, "Hiring Manager");
    processed = processed.replace(/\[Hospitals?\/Organization\s+Name\]/gi, company || "Hiring Company");
    processed = processed.replace(/\[Company\s+Name\]/gi, company || "Hiring Company");
    processed = processed.replace(/\[Hospital\/Organization\s+Address\]/gi, "");
    processed = processed.replace(/\[Company\s+Address\]/gi, "");

    // Format markdown bold (**text**) and italic (*text*) to HTML tags
    let formattedBody = processed;
    formattedBody = formattedBody
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    formattedBody = formattedBody.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formattedBody = formattedBody.replace(/__(.*?)__/g, "<strong>$1</strong>");
    formattedBody = formattedBody.replace(/\*(.*?)\*/g, "<em>$1</em>");
    formattedBody = formattedBody.replace(/_(.*?)_/g, "<em>$1</em>");

    // Split raw content by paragraph double newlines to prevent sentence splitting at page breaks
    const paragraphs = formattedBody.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean);

    // Standard business Block cover letter template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { 
      size: A4 portrait; 
      margin: 20mm 20mm 20mm 20mm; 
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #1f2937;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    .paper-sheet {
      width: 100%;
      box-sizing: border-box;
      position: relative;
    }
    .top-accent {
      position: fixed;
      top: -20mm;
      left: -20mm;
      right: -20mm;
      height: 6px;
      background-color: ${accentColor};
    }
    .paragraph {
      white-space: pre-wrap;
      margin-top: 0;
      margin-bottom: 1.2em;
      text-align: justify;
      text-justify: inter-word;
      break-inside: avoid;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="paper-sheet">
    <div class="top-accent"></div>
    <div class="letter-body">
      ${paragraphs.map((p: string) => `<p class="paragraph">${p}</p>`).join("")}
    </div>
  </div>
</body>
</html>
    `;

    // Launch Puppeteer to render cover letter PDF
    const puppeteer = (await import("puppeteer")).default;
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
    await page.emulateMediaType("print");
    await page.setContent(htmlContent, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    const filename = `${company ? company.replace(/[^a-zA-Z0-9]/g, "") + "_" : ""}Cover_Letter.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Cover Letter PDF Gen Error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
