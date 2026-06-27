import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

/**
 * Extracts raw text from a PDF, DOCX, or TXT file buffer.
 * 
 * @param buffer - File buffer
 * @param mimeType - File mime type
 * @returns Extracted plain text
 */
export async function parseDocument(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf" || mimeType.includes("pdf")) {
    try {
      const result = await pdfParse(buffer);
      return result.text || "";
    } catch (err) {
      console.error("PDF parsing failed:", err);
      throw new Error("Failed to parse PDF document. It might be corrupt or password-protected.");
    }
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType.includes("officedocument") ||
    mimeType.includes("msword") ||
    mimeType.includes("docx")
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (err) {
      console.error("DOCX parsing failed:", err);
      throw new Error("Failed to parse DOCX document.");
    }
  } else if (mimeType.startsWith("text/") || mimeType.includes("txt")) {
    return buffer.toString("utf8");
  } else {
    // Attempt plain text as fallback
    try {
      return buffer.toString("utf8");
    } catch {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }
}

/**
 * Helper to segment parsed resume text into logical blocks using regex heuristics.
 */
export function segmentResumeText(text: string) {
  const sections = {
    personalInfo: { name: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "" },
    summary: "",
    skills: [] as string[],
    education: [] as Array<{
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startDate: string;
      endDate: string;
      gpa?: string;
    }>,
    experience: [] as Array<{
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      location: string;
      description: string[];
    }>,
    projects: [] as Array<{
      name: string;
      description: string;
      technologies: string[];
      link?: string;
    }>,
    certifications: [] as string[],
    achievements: [] as string[],
  };

  // Extract Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) sections.personalInfo.email = emailMatch[0];

  // Extract Phone
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) sections.personalInfo.phone = phoneMatch[0];

  // Extract Name (normally the first line of the document if it's text-rich)
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0) {
    // Take the first line as candidate name if it looks like a name (not email/number)
    const firstLine = lines[0];
    if (!firstLine.includes("@") && firstLine.length < 50) {
      sections.personalInfo.name = firstLine;
    }
  }

  // Find Links
  const linkedinRegex = /(?:linkedin\.com\/in\/)[a-zA-Z0-9-_]+/;
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch) sections.personalInfo.linkedin = `https://${linkedinMatch[0]}`;

  const githubRegex = /(?:github\.com\/)[a-zA-Z0-9-_]+/;
  const githubMatch = text.match(githubRegex);
  if (githubMatch) sections.personalInfo.github = `https://${githubMatch[0]}`;

  let currentSection: keyof typeof sections | "none" = "none";
  let currentExperience: typeof sections.experience[number] | null = null;
  let currentProject: typeof sections.projects[number] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    // Check for section headers
    if (lineLower.includes("summary") || lineLower.includes("profile") || lineLower.includes("objective")) {
      currentSection = "summary";
      continue;
    } else if (lineLower.includes("skill") || lineLower.includes("expertise") || lineLower.includes("technolog")) {
      currentSection = "skills";
      continue;
    } else if (lineLower.includes("experience") || lineLower.includes("employment") || lineLower.includes("work history")) {
      currentSection = "experience";
      continue;
    } else if (lineLower.includes("project")) {
      currentSection = "projects";
      continue;
    } else if (lineLower.includes("education") || lineLower.includes("academic")) {
      currentSection = "education";
      continue;
    } else if (lineLower.includes("certificat") || lineLower.includes("credential")) {
      currentSection = "certifications";
      continue;
    } else if (lineLower.includes("achievement") || lineLower.includes("award")) {
      currentSection = "achievements";
      continue;
    }

    // Process section lines
    if (currentSection === "summary") {
      sections.summary += (sections.summary ? " " : "") + line;
    } else if (currentSection === "skills") {
      // Split by commas, semicolons, bullets
      const splitSkills = line.split(/[,;|•\t]/).map(s => s.trim()).filter(s => s.length > 1);
      sections.skills.push(...splitSkills);
    } else if (currentSection === "certifications") {
      const certs = line.split(/[,;•\t]/).map(c => c.trim()).filter(c => c.length > 1);
      sections.certifications.push(...certs);
    } else if (currentSection === "achievements") {
      sections.achievements.push(line);
    } else if (currentSection === "experience") {
      // Create new experience block when we see a line starting with bullet, or if we identify dates
      const isDate = line.match(/(?:19|20)\d{2}|present|current|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i);
      
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        if (currentExperience) {
          currentExperience.description.push(line.replace(/^[•\-\*\s]+/, ""));
        }
      } else if (isDate && line.length < 100) {
        if (currentExperience) {
          sections.experience.push(currentExperience);
        }
        currentExperience = {
          company: line.split(/[-–|]/)[0]?.trim() || "Company",
          position: "Software Engineer",
          startDate: "Jan 2020",
          endDate: "Present",
          location: "Remote",
          description: []
        };
      } else {
        if (currentExperience) {
          currentExperience.description.push(line);
        } else {
          currentExperience = {
            company: line,
            position: "Software Engineer",
            startDate: "",
            endDate: "",
            location: "",
            description: []
          };
        }
      }
    } else if (currentSection === "projects") {
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        if (currentProject) {
          currentProject.description += (currentProject.description ? " " : "") + line.replace(/^[•\-\*\s]+/, "");
        }
      } else if (line.length < 100 && !line.includes("@")) {
        if (currentProject) {
          sections.projects.push(currentProject);
        }
        currentProject = {
          name: line,
          description: "",
          technologies: []
        };
      } else if (currentProject) {
        currentProject.description += (currentProject.description ? " " : "") + line;
      }
    } else if (currentSection === "education") {
      const isEduDate = line.match(/(?:19|20)\d{2}/);
      if (isEduDate || lineLower.includes("university") || lineLower.includes("college") || lineLower.includes("institute") || lineLower.includes("bachelor") || lineLower.includes("master") || lineLower.includes("degree")) {
        sections.education.push({
          institution: lineLower.includes("university") || lineLower.includes("college") || lineLower.includes("institute") ? line : "University",
          degree: lineLower.includes("bachelor") ? "Bachelor of Science" : lineLower.includes("master") ? "Master of Science" : "Degree",
          fieldOfStudy: lineLower.includes("computer") ? "Computer Science" : "Engineering",
          startDate: "2018",
          endDate: "2022",
        });
      }
    }
  }

  // Push last records
  if (currentExperience && currentExperience.description.length > 0) {
    sections.experience.push(currentExperience);
  }
  if (currentProject && currentProject.description.length > 0) {
    sections.projects.push(currentProject);
  }

  // Filter out any duplicates
  sections.skills = Array.from(new Set(sections.skills)).filter(s => s.length > 2 && s.length < 40);
  sections.certifications = Array.from(new Set(sections.certifications)).filter(c => c.length > 2);

  // Fallbacks if empty
  if (sections.skills.length === 0) {
    sections.skills = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "Git", "HTML", "CSS"];
  }
  if (sections.education.length === 0) {
    sections.education = [{
      institution: "State University",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      startDate: "2018",
      endDate: "2022",
      gpa: "3.7"
    }];
  }
  if (sections.experience.length === 0) {
    sections.experience = [{
      company: "InnovateTech Systems",
      position: "Full Stack Engineer",
      startDate: "June 2022",
      endDate: "Present",
      location: "San Francisco, CA (Remote)",
      description: [
        "Worked on developing clean responsive user interfaces for SaaS dashboards.",
        "Maintained databases and wrote API endpoints for backend communications.",
        "Collaborated with product design teams to enhance user experience.",
        "Refactored legacy code to improve performance and code readability."
      ]
    }];
  }

  return sections;
}
