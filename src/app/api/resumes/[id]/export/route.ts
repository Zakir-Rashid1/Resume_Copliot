import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { ResumeContent } from "@/lib/db";

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

function esc(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildResumeHtml(content: ResumeContent, resumeName: string): string {
  const pi = content.personalInfo;

  // Build contact line
  const contactParts: string[] = [];
  if (pi.email) contactParts.push(esc(pi.email));
  if (pi.phone) contactParts.push(esc(pi.phone));
  if (pi.location) contactParts.push(esc(pi.location));

  const contactLinks: string[] = [];
  if (pi.linkedin) contactLinks.push(`<a href="${esc(pi.linkedin)}">LinkedIn</a>`);
  if (pi.github) contactLinks.push(`<a href="${esc(pi.github)}">GitHub</a>`);
  if (pi.website) contactLinks.push(`<a href="${esc(pi.website)}">Website</a>`);

  const allContact = [...contactParts.map(p => `<span>${p}</span>`), ...contactLinks.map(l => `<span>${l}</span>`)].join('<span class="sep">|</span>');

  // Summary
  const summarySection = content.summary ? `
    <div class="section">
      <h3>Professional Summary</h3>
      <p>${esc(content.summary)}</p>
    </div>` : "";

  // Experience
  const expSection = content.experience?.length ? `
    <div class="section">
      <h3>Professional Experience</h3>
      ${content.experience.map(exp => `
        <div class="entry">
          <div class="entry-header">
            <strong>${esc(exp.position)} &mdash; ${esc(exp.company)}</strong>
            <span class="date">${esc(exp.startDate)} &ndash; ${esc(exp.endDate || "Present")}</span>
          </div>
          <ul>
            ${(Array.isArray(exp.description) ? exp.description : []).map(b => `<li>${esc(b)}</li>`).join("")}
          </ul>
        </div>`).join("")}
    </div>` : "";

  // Skills
  const skillsSection = content.skills?.length ? `
    <div class="section">
      <h3>Core Competencies</h3>
      <p>${esc(content.skills.join(", "))}</p>
    </div>` : "";

  // Projects
  const projectsSection = content.projects?.length ? `
    <div class="section">
      <h3>Featured Projects</h3>
      ${content.projects.map(proj => `
        <div class="entry">
          <strong>${esc(proj.name)}</strong>
          <p>${esc(proj.description)}</p>
        </div>`).join("")}
    </div>` : "";

  // Education
  const eduSection = content.education?.length ? `
    <div class="section">
      <h3>Education</h3>
      ${content.education.map(edu => `
        <div class="entry-header">
          <strong>${esc(edu.degree)} in ${esc(edu.fieldOfStudy)} &mdash; ${esc(edu.institution)}</strong>
          <span class="date">${esc(edu.startDate)} &ndash; ${esc(edu.endDate)}</span>
        </div>`).join("")}
    </div>` : "";

  // Certifications
  const certSection = content.certifications?.length ? `
    <div class="section">
      <h3>Certifications</h3>
      <ul>
        ${content.certifications.map(c => `<li>${esc(c)}</li>`).join("")}
      </ul>
    </div>` : "";

  // Achievements
  const achSection = content.achievements?.length ? `
    <div class="section">
      <h3>Achievements &amp; Awards</h3>
      <ul>
        ${content.achievements.map(a => `<li>${esc(a)}</li>`).join("")}
      </ul>
    </div>` : "";

  // Custom section
  const customSection = content.customSection?.title && content.customSection?.content ? `
    <div class="section">
      <h3>${esc(content.customSection.title)}</h3>
      <ul>
        ${content.customSection.content.split("\n").filter(l => l.trim()).map(l => `<li>${esc(l)}</li>`).join("")}
      </ul>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(resumeName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    /*
     * @page margin = 0 so the .page div controls all whitespace.
     * This prevents the browser from adding extra blank pages from
     * header/footer + margin combinations.
     */
    @page {
      size: A4 portrait;
      margin: 0;
    }

    html, body {
      background: #e8ecf0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 10.5px;
      color: #0f172a;
      line-height: 1.55;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /*
     * .page is exactly A4 (210mm × 297mm).
     * padding: 18mm top/bottom, 20mm left/right — generous margins.
     * No min-height — content must fit within 297mm.
     */
    .page {
      background: #ffffff;
      width: 210mm;
      height: 297mm;           /* hard A4 height — no overflow to page 2 */
      overflow: hidden;        /* clip silently rather than spill */
      margin: 24px auto;
      padding: 18mm 20mm;     /* top/bottom 18mm, left/right 20mm */
      box-shadow: 0 6px 32px rgba(0,0,0,0.15);
    }

    /* ── Header ─────────────────────────────────────────── */
    .resume-header {
      text-align: center;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }

    .resume-header h1 {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .contact-line {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 2px 0;
      font-size: 9.5px;
      color: #475569;
    }

    .contact-line span { padding: 0 4px; }
    .contact-line .sep { color: #94a3b8; }
    .contact-line a { color: #1d4ed8; text-decoration: none; }

    /* ── Sections ────────────────────────────────────────── */
    .section { margin-bottom: 11px; }

    .section h3 {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 2px;
      margin-bottom: 6px;
    }

    .section p {
      color: #334155;
      font-size: 10px;
      line-height: 1.55;
    }

    /* ── Entries ─────────────────────────────────────────── */
    .entry { margin-bottom: 8px; }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 3px;
    }

    .entry-header strong {
      color: #0f172a;
      font-size: 10px;
    }

    .date {
      color: #64748b;
      font-size: 9.5px;
      white-space: nowrap;
      margin-left: 8px;
      font-style: italic;
    }

    ul {
      padding-left: 16px;
      color: #334155;
    }

    ul li {
      margin-bottom: 1px;
      font-size: 10px;
      line-height: 1.5;
    }

    /* ── Print ───────────────────────────────────────────── */
    @media print {
      html, body {
        background: #ffffff !important;
      }
      .page {
        box-shadow: none !important;
        margin: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        /* keep padding so margins stay correct in print */
      }
      .print-btn { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="resume-header">
      <h1>${esc(pi.name)}</h1>
      <div class="contact-line">${allContact}</div>
    </div>

    ${summarySection}
    ${expSection}
    ${skillsSection}
    ${projectsSection}
    ${eduSection}
    ${certSection}
    ${achSection}
    ${customSection}
  </div>

  <div class="print-btn" style="text-align:center; margin: 20px 0 28px;">
    <button onclick="window.print()" style="
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 11px 32px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(37,99,235,0.35);
      letter-spacing: 0.02em;
    ">⬇&nbsp;&nbsp;Download as PDF</button>
    <p style="margin-top:8px; font-size:11px; color:#64748b;">
      In the print dialog → <strong>Destination: Save as PDF</strong> → disable headers &amp; footers
    </p>
  </div>
</body>
</html>`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getUserId();

  // Ownership check
  const resume = await db.resumes.findUnique(id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (resume.userId !== "guest-user" && resume.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const html = buildResumeHtml(resume.content as ResumeContent, resume.name);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
