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
    const { resumeId, jobDescription, tone, company, position } = await req.json();

    if (!resumeId || !jobDescription || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }


    let resumeContent = null;
    let personalInfo = {
      name: "Murtaza Bashir",
      email: "Murtaza.Bashir@gmail.com",
      phone: "+91 9419757230",
      location: "J&K, India",
    };

    if (resumeId === "mock-id") {
      resumeContent = {
        personalInfo: {
          name: "Murtaza Bashir",
          email: "Murtaza.Bashir@gmail.com",
          phone: "+91 9419757230",
          location: "J&K, India",
          website: "https://github.com/Murtaza",
          linkedin: "https://linkedin.com/in/murtaza-bashir"
        },
        summary: "Dedicated Software Engineer with experience in systems optimization.",
        skills: ["React", "Next.js", "TypeScript", "Node.js", "Python", "SQL"],
        education: [
          { institution: "GCET Kashmir", degree: "B.Tech", fieldOfStudy: "Computer Science", startDate: "2018", endDate: "2022", gpa: "7.8" }
        ],
        experience: [
          { company: "InnovateTech", position: "Software Engineer Intern", startDate: "Jan 2024", endDate: "Present", location: "Srinagar", description: ["Developed React apps", "Optimized database queries"] }
        ],
        projects: [],
        certifications: [],
        achievements: [],
        customSection: { title: "", content: "" }
      };
    } else {
      const resume = await db.resumes.findUnique(resumeId);
      if (!resume) {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
      }
      if (resume.userId !== "guest-user" && resume.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      resumeContent = resume.content;
      personalInfo = {
        name: resumeContent.personalInfo.name || personalInfo.name,
        email: resumeContent.personalInfo.email || personalInfo.email,
        phone: resumeContent.personalInfo.phone || personalInfo.phone,
        location: resumeContent.personalInfo.location || personalInfo.location,
      };
    }

    const content = await ai.generateCoverLetter(resumeContent, jobDescription, tone);

    // Post-process placeholders
    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    let processedContent = content;
    processedContent = processedContent.replace(/\[Date\]/gi, dateStr);
    processedContent = processedContent.replace(/\[Your\s+Name\]/gi, personalInfo.name || "");
    processedContent = processedContent.replace(/\[Your\s+Email\]/gi, personalInfo.email || "");
    processedContent = processedContent.replace(/\[Your\s+Phone(?:\s+Number)?\]/gi, personalInfo.phone || "");
    processedContent = processedContent.replace(/\[Your\s+Address\]/gi, personalInfo.location || "");
    processedContent = processedContent.replace(/\[Your\s+Location\]/gi, personalInfo.location || "");
    processedContent = processedContent.replace(/\[Hiring\s+Manager(?:\s+Name\/Department,\s+if\s+known,\s+otherwise\s+use\s+title)?\]/gi, "Hiring Manager");
    processedContent = processedContent.replace(/\[Hiring\s+Manager\s+Name\]/gi, "Hiring Manager");
    processedContent = processedContent.replace(/\[Hospitals?\/Organization\s+Name\]/gi, company || "Hiring Company");
    processedContent = processedContent.replace(/\[Company\s+Name\]/gi, company || "Hiring Company");
    processedContent = processedContent.replace(/\[Hospital\/Organization\s+Address\]/gi, "");
    processedContent = processedContent.replace(/\[Company\s+Address\]/gi, "");

    let savedLetter = null;
    if (userId && resumeId !== "mock-id") {
      savedLetter = await db.coverLetters.create({
        userId,
        resumeId,
        company: company || "Specified Company",
        position: position || "Specified Role",
        tone,
        content: processedContent,
      });
    }

    return NextResponse.json({
      success: true,
      content: processedContent,
      letter: savedLetter,
    });
  } catch (err) {
    console.error("Cover Letter API Error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate cover letter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const letters = await db.coverLetters.findMany(userId);
  return NextResponse.json({ success: true, letters });
}
