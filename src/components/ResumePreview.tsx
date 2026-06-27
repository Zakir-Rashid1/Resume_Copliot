"use client";

import React from "react";
import { Sparkles, LucideIcon } from "lucide-react";

// The mock data format used on the landing page
export const resumeMockData = {
  name: "Jhon Wick",
  title: "AI/ML & Data Science Engineer",
  email: "Zakir.Rashid@gmail.com",
  phone: "+91 7889876459",
  location: "J&K",
  github: "github.com/zakir-rashid",
  linkedin: "linkedin.com/in/zakir-rashid",
  website: "zakir-rashid.dev",
  summary:
    "Systems Engineer with a strong foundation in statistical learning, linear algebra, and neural network optimization parameters (1.5M+ weights trained). Proven track record in translating theoretical ML frameworks into production-ready systems, achieving 99.4% precision in deep classifiers. Expert in architecting intelligent automation ecosystems (n8n, LLM-orchestration, webhooks) alongside streamlined MERN/FastAPI microservices. Combines high-caliber problem-solving (GATE AIR 2604 in Data Science & AI) with clean, containerized deployment (Docker) to bridge advanced data math with efficient full-stack delivery.",
  skills: {
    languages: ["Python", "TypeScript", "JavaScript", "C/C++", "SQL", "HTML5/CSS3", "Java"],
    frameworks: [
      "Deep Learning & MLPs",
      "Computer Vision (OpenCV)",
      "PyTorch",
      "Scikit-Learn",
      "Pandas",
      "NumPy",
      "n8n Workflows",
      "AI Agents & Webhooks",
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "MongoDB",
      "Tailwind CSS",
      "RESTful APIs",
    ],
    infrastructure: [
      "PostgreSQL",
      "MySQL",
      "Git/GitHub",
      "Linux/Bash",
      "Lovable",
      "Jupyter",
      "Docker",
    ],
  },
  experience: [
    {
      role: "AI Automation Intern",
      company: "Brandsparc",
      period: "Apr 2026 - June 2026",
      bullets: [
        "Engineered automated workflows using n8n, integrating multi-step processes across platforms like OpenAI, Google Sheets, and Telegram.",
        "Built and deployed custom AI Agents utilizing webhooks, conditional logic, and HTTP requests to automate repetitive business tasks, resulting in a 25% increase in operational efficiency.",
        "Developed real-world applications (e.g., Lead Capture systems) through No-Code and Vibe Coding platforms including Lovable, Bolt, and Glide, resulting in a 25% increase in operational efficiency.",
      ],
    },
  ],
  projects: [
    {
      name: "Enterprise Customer Attrition Risk Predictor",
      desc: "Model Calibration over Raw Metrics: XGBoost model achieved 80.41% accuracy, but a Tuned Random Forest Classifier (300 trees) was chosen due to its 74.00% Recall rate to minimize false negatives. Couples with a React/TypeScript analytics interface for live customer testing.",
      tech: "Numpy, Panda, Scikit Learn, Pytorch",
    },
  ],
  certifications: [
    "Python with Data Science and ML Certificate (NIELIT)",
    "Cyber Security with AI (INTERNSHALA)",
    "GATE DA 2026 (AIR 2604)",
  ],
  education: [
    {
      degree: "B.tech in Computer Science - 7.8/10",
      school: "Gcet Kashmir",
      year: "2018 - 2023",
    },
    {
      degree: "M.tech in Geoinformatics - 8.9/10",
      school: "IIT Kanpur",
      year: "2026 - 2028",
    },
  ],
};

export interface ResumePreviewProps {
  data?: any; // The real user resume content JSON
  template: "tech" | "minimal" | "executive" | "creative";
  color: "purple" | "blue" | "emerald" | "amber" | "rose";
  hoveredItem?: string | null;
  setHoveredItem?: (item: string | null) => void;
  isInteractive?: boolean;
  suggestions?: any[];
  currentStep?: string;
  onSelectSuggestion?: (suggestion: any) => void;
  margins?: "narrow" | "normal" | "wide";
  fontFamily?: "sans" | "serif" | "mono";
  sectionOrder?: string[];
}

export default function ResumePreview({
  data,
  template,
  color,
  hoveredItem = null,
  setHoveredItem,
  isInteractive = false,
  suggestions = [],
  currentStep = "",
  onSelectSuggestion,
  margins = "normal",
  fontFamily = "sans",
  sectionOrder,
}: ResumePreviewProps) {
  // Color configuration mapping
  const c = {
    purple: {
      text: "text-indigo-600",
      bg: "bg-indigo-600",
      border: "border-indigo-600",
      icon: "text-indigo-600",
    },
    blue: {
      text: "text-sky-600",
      bg: "bg-sky-600",
      border: "border-sky-600",
      icon: "text-sky-500",
    },
    emerald: {
      text: "text-emerald-600",
      bg: "bg-emerald-600",
      border: "border-emerald-600",
      icon: "text-emerald-600",
    },
    amber: {
      text: "text-amber-600",
      bg: "bg-amber-600",
      border: "border-amber-600",
      icon: "text-amber-600",
    },
    rose: {
      text: "text-rose-600",
      bg: "bg-rose-600",
      border: "border-rose-600",
      icon: "text-rose-600",
    },
  }[color] || {
    text: "text-sky-600",
    bg: "bg-sky-600",
    border: "border-sky-600",
    icon: "text-sky-500",
  };

  // Check if we are using mock data
  const isMock = !data;

  // Resolve actual data vs mock data values
  const name = isMock ? resumeMockData.name : data?.personalInfo?.name || "Your Name";
  const title = isMock ? resumeMockData.title : data?.personalInfo?.title || data?.jobTitle || "";
  const email = isMock ? resumeMockData.email : data?.personalInfo?.email || "";
  const phone = isMock ? resumeMockData.phone : data?.personalInfo?.phone || "";
  const location = isMock ? resumeMockData.location : data?.personalInfo?.location || "";
  const github = isMock ? resumeMockData.github : data?.personalInfo?.github || "";
  const linkedin = isMock ? resumeMockData.linkedin : data?.personalInfo?.linkedin || "";
  const website = isMock ? (resumeMockData as any).website || "" : data?.personalInfo?.website || "";
  const summary = isMock ? resumeMockData.summary : data?.summary || "";

  // Normalize experience
  const rawExperience = isMock ? resumeMockData.experience : data?.experience || [];
  const normalizedExperience = rawExperience.map((exp: any) => ({
    role: exp.role || exp.position || "",
    company: exp.company || "",
    period: exp.period || `${exp.startDate || ""} – ${exp.endDate || "Present"}`.trim(),
    location: exp.location || "",
    bullets: Array.isArray(exp.bullets)
      ? exp.bullets
      : Array.isArray(exp.description)
      ? exp.description
      : typeof exp.description === "string"
      ? exp.description.split("\n").filter((b: string) => b.trim().length > 0)
      : [],
  }));

  // Normalize projects
  const rawProjects = isMock ? resumeMockData.projects : data?.projects || [];
  const normalizedProjects = rawProjects.map((proj: any) => ({
    name: proj.name || "",
    desc: proj.desc || proj.description || "",
    tech: proj.tech || (Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies || ""),
    link: proj.link || "",
  }));

  // Normalize certifications
  const normalizedCertifications: string[] = isMock
    ? resumeMockData.certifications
    : Array.isArray(data?.certifications)
    ? data.certifications
    : typeof data?.certifications === "string"
    ? data.certifications.split("\n").filter((c: string) => c.trim().length > 0)
    : [];

  // Normalize achievements
  const normalizedAchievements: string[] = isMock
    ? []
    : Array.isArray(data?.achievements)
    ? data.achievements
    : typeof data?.achievements === "string"
    ? data.achievements.split("\n").filter((c: string) => c.trim().length > 0)
    : [];

  // Normalize education
  const rawEducation = isMock ? resumeMockData.education : data?.education || [];
  const normalizedEducation = rawEducation.map((edu: any) => {
    let degreeParts = [];
    if (edu.degree) degreeParts.push(edu.degree);
    if (edu.fieldOfStudy) degreeParts.push(edu.fieldOfStudy);
    
    let degreeStr = degreeParts.join(" | ");
    if (edu.gpa) {
      degreeStr = degreeStr ? `${degreeStr} - ${edu.gpa}` : edu.gpa;
    }
    
    return {
      degree: degreeStr,
      school: edu.school || edu.institution || "",
      year: edu.year || `${edu.startDate || ""} – ${edu.endDate || ""}`.trim(),
    };
  });

  // Normalize custom section
  const customSection = isMock
    ? { title: "", content: "" }
    : data?.customSection || { title: "", content: "" };

  const customBullets = customSection.content
    ? customSection.content.split("\n").filter((l: string) => l.trim().length > 0)
    : [];

  // Helper trigger hover
  const handleMouseEnter = (item: string) => {
    if (isInteractive && setHoveredItem) setHoveredItem(item);
  };
  const handleMouseLeave = () => {
    if (isInteractive && setHoveredItem) setHoveredItem(null);
  };

  // Inline formatting utility:
  // ***bold-italic*** -> <strong><em>
  // **bold** -> <strong>
  // __underline__ -> <span className="underline">
  // *italic* or _italic_ -> <em>
  const formatText = (text: string): React.ReactNode => {
    if (!text) return "";
    
    // Pattern to capture ***bold-italic***, **bold**, __underline__, and *italic* or _italic_
    const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|_[^_]+_|\*[^*]+\*)/g;
    const parts = text.split(regex);
    
    return parts.map((part, idx) => {
      if (part.startsWith("***") && part.endsWith("***")) {
        return (
          <strong key={idx} className="font-bold text-slate-900">
            <em className="italic">{part.slice(3, -3)}</em>
          </strong>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("__") && part.endsWith("__")) {
        return (
          <span key={idx} className="underline">
            {part.slice(2, -2)}
          </span>
        );
      }
      if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
        return (
          <em key={idx} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  // Helper to render experience bullet points with interactive grammar highlights in checker
  const renderBullet = (bullet: string, bIdx: number) => {
    const matchingSuggestion = suggestions?.find(
      (s) => s.originalText?.trim() === bullet.trim()
    );
    const isCurrentStepSuggest = matchingSuggestion && (
      (currentStep === "experience" && (
        matchingSuggestion.section === "experience" || 
        matchingSuggestion.section === "projects" || 
        matchingSuggestion.section === "education" || 
        matchingSuggestion.section === "certifications" || 
        matchingSuggestion.section === "achievements" ||
        matchingSuggestion.category?.toLowerCase().includes("experience") ||
        matchingSuggestion.category?.toLowerCase().includes("project") ||
        matchingSuggestion.category?.toLowerCase().includes("education") ||
        matchingSuggestion.category?.toLowerCase().includes("achievement") ||
        matchingSuggestion.category?.toLowerCase().includes("date") ||
        matchingSuggestion.category?.toLowerCase().includes("result") ||
        matchingSuggestion.category?.toLowerCase().includes("verb")
      )) ||
      (currentStep === "formatting" && (
        matchingSuggestion.section === "formatting" ||
        matchingSuggestion.section === "layout" ||
        matchingSuggestion.section === "margins" ||
        matchingSuggestion.category?.toLowerCase().includes("formatting") ||
        matchingSuggestion.category?.toLowerCase().includes("margin") ||
        matchingSuggestion.category?.toLowerCase().includes("layout") ||
        matchingSuggestion.category?.toLowerCase().includes("font") ||
        matchingSuggestion.category?.toLowerCase().includes("structure")
      ))
    );

    return (
      <li
        key={bIdx}
        onClick={() => {
          if (matchingSuggestion && onSelectSuggestion) {
            onSelectSuggestion(matchingSuggestion);
          }
        }}
        className={`leading-relaxed ${
          isCurrentStepSuggest
            ? "warning-highlight cursor-pointer"
            : ""
        }`}
      >
        <span>{formatText(bullet)}</span>
        {isCurrentStepSuggest && (
          <span className="warning-pin" title="Click to fix phrasing error">
            !
          </span>
        )}
      </li>
    );
  };

  // Skills rendering logic
  const renderSkillsSection = () => {
    const skillsArray = isMock
      ? [
          "Languages: Python, Go, TypeScript, SQL, C++",
          "Frameworks: PyTorch, FastAPI, React, Next.js, TensorFlow, Scikit-Learn",
          "Infrastructure: Docker, Kubernetes, AWS, PostgreSQL, Redis, Git"
        ]
      : Array.isArray(data?.skills)
      ? data.skills
      : typeof data?.skills === "string"
      ? data.skills.split("\n").map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : [];

    if (skillsArray.length === 0) return null;

    return (
      <section className="space-y-1">
        {skillsArray.map((skillLine: string, idx: number) => {
          const colonIndex = skillLine.indexOf(":");
          if (colonIndex !== -1) {
            const category = skillLine.slice(0, colonIndex).trim();
            const rest = skillLine.slice(colonIndex + 1).trim();
            return (
              <p key={idx} className="text-slate-700 text-[10.5px] leading-normal">
                <strong className="font-bold text-slate-900">{category}:</strong> {formatText(rest)}
              </p>
            );
          }
          return (
            <p key={idx} className="text-slate-700 text-[10.5px] leading-normal">
              {formatText(skillLine)}
            </p>
          );
        })}
      </section>
    );
  };

  const getProjectBullets = (proj: any) => {
    const desc = proj.desc || proj.description || "";
    if (Array.isArray(desc)) return [...desc];
    if (typeof desc === "string") {
      return desc.split("\n").map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const paddingClass = {
    narrow: "p-6",
    normal: "p-10",
    wide: "p-14",
  }[margins] || "p-10";

  const fontClass = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
  }[fontFamily] || "font-sans";

  return (
    <div className={`w-full ${paddingClass} bg-white text-slate-850 text-[10.5px] ${fontClass} text-left leading-normal space-y-4`}>
      
      {/* Header (Centered) */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-normal text-slate-900 leading-none">
          {name}
        </h1>
        {title && (
          <p className={`text-[13px] font-semibold tracking-wide ${c.text}`}>
            {title}
          </p>
        )}
        
        {/* Centered Contact Info Row */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-medium mt-2 text-slate-600">
          {email && (
            <a 
              href={`mailto:${email}`} 
              className="flex items-center gap-1 hover:underline text-slate-700"
            >
              <svg className={`w-2.5 h-2.5 ${c.icon}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <span>{email}</span>
            </a>
          )}
          {phone && (
            <span className="flex items-center gap-1 text-slate-700">
              <svg className={`w-2.5 h-2.5 ${c.icon}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{phone}</span>
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1 text-slate-700">
              <svg className={`w-2.5 h-2.5 ${c.icon}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
              </svg>
              <span>{location}</span>
            </span>
          )}
          {linkedin && (
            <a 
              href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:underline text-slate-700"
            >
              <svg className={`w-2.5 h-2.5 ${c.icon}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>linkedin</span>
            </a>
          )}
          {github && (
            <a 
              href={github.startsWith("http") ? github : `https://${github}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:underline text-slate-700"
            >
              <svg className={`w-2.5 h-2.5 ${c.icon}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>github</span>
            </a>
          )}
          {website && (
            <a 
              href={website.startsWith("http") ? website : `https://${website}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:underline text-slate-700"
            >
              <svg className={`w-2.5 h-2.5 ${c.icon}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.905 0-5.64-.811-7.966-2.228m15.932 0C18.81 11.025 15.617 12 12 12s-6.81-1.025-7.966-2.228" />
              </svg>
              <span>Portfolio</span>
            </a>
          )}
        </div>
      </div>

      {/* Dynamic sections ordered dynamically by sectionOrder */}
      {(() => {
        const defaultOrder = ["summary", "experience", "education", "projects", "skills", "certifications", "achievements"];
        const activeOrder = sectionOrder || defaultOrder;

        return activeOrder.map((sectionId) => {
          switch (sectionId) {
            case "summary":
              return summary && (
                <div
                  key="summary"
                  id="preview-summary"
                  className={`space-y-0.5 p-1 rounded transition-all ${
                    hoveredItem === "summary" ? "bg-slate-50/80 ring-1 ring-primary/20" : ""
                  }`}
                  onMouseEnter={() => handleMouseEnter("summary")}
                  onMouseLeave={handleMouseLeave}
                >
                  <h2 className={`text-[11.5px] font-bold uppercase tracking-wider ${c.text}`}>
                    Summary
                  </h2>
                  <hr className="border-t border-slate-300 mt-0.5 mb-1.5" />
                  <p className="text-slate-700 leading-relaxed">{formatText(summary)}</p>
                </div>
              );
            case "experience":
              return normalizedExperience.length > 0 && (
                <div key="experience" className="space-y-2.5">
                  <div>
                    <h2 className={`text-[11.5px] font-bold uppercase tracking-wider ${c.text}`}>
                      Work Experience
                    </h2>
                    <hr className="border-t border-slate-300 mt-0.5 mb-1.5" />
                  </div>
                  <div className="space-y-3">
                    {normalizedExperience.map((exp: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900 text-[11px]">
                            {exp.company}
                          </span>
                          <span className="text-slate-600 font-semibold text-[10px]">
                            {exp.period}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="italic text-slate-700 text-[10.5px]">
                            {exp.role}
                          </span>
                          {exp.location && (
                            <span className="text-slate-500 font-semibold text-[10px]">
                              {exp.location}
                            </span>
                          )}
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[10px] mt-1">
                          {exp.bullets.map((bullet: string, bIdx: number) => renderBullet(bullet, bIdx))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            case "education":
              return normalizedEducation.length > 0 && (
                <div key="education" className="space-y-2">
                  <div>
                    <h2 className={`text-[11.5px] font-bold uppercase tracking-wider ${c.text}`}>
                      Education
                    </h2>
                    <hr className="border-t border-slate-300 mt-0.5 mb-1.5" />
                  </div>
                  <div className="space-y-2">
                    {normalizedEducation.map((edu: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-900 text-[11px]">
                            <strong className="font-bold">{edu.school}</strong>
                            {edu.degree && <span className="text-slate-700 font-normal"> — {edu.degree}</span>}
                          </span>
                          <span className="text-slate-600 font-semibold text-[10px] shrink-0">
                            {edu.year}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            case "projects":
              return normalizedProjects.length > 0 && (
                <div key="projects" className="space-y-2.5">
                  <div>
                    <h2 className={`text-[11.5px] font-bold uppercase tracking-wider ${c.text}`}>
                      Project
                    </h2>
                    <hr className="border-t border-slate-300 mt-0.5 mb-1.5" />
                  </div>
                  <div className="space-y-3">
                    {normalizedProjects.map((proj: any, idx: number) => {
                      const bullets = getProjectBullets(proj);
                      if (proj.tech) {
                        bullets.push(`Built using **${proj.tech}**.`);
                      }
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                              {proj.name}
                              {proj.link && (
                                <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" className={c.text}>
                                  <svg className="w-2.5 h-2.5 inline" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </a>
                              )}
                            </span>
                            <span className="text-slate-600 font-semibold text-[10px]">
                              {proj.period || "2019 - 2020"}
                            </span>
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[10px] mt-1">
                            {bullets.map((bullet: string, bIdx: number) => (
                              <li key={bIdx} className="leading-relaxed">
                                {formatText(bullet)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            case "skills":
              const skillsContent = renderSkillsSection();
              return skillsContent && (
                <div
                  key="skills"
                  id="preview-skills"
                  className={`space-y-1 p-1 rounded transition-all ${
                    hoveredItem === "skills" ? "bg-slate-50/80 ring-1 ring-primary/20" : ""
                  }`}
                  onMouseEnter={() => handleMouseEnter("skills")}
                  onMouseLeave={handleMouseLeave}
                >
                  <h2 className={`text-[11.5px] font-bold uppercase tracking-wider ${c.text}`}>
                    Skills
                  </h2>
                  <hr className="border-t border-slate-300 mt-0.5 mb-1.5" />
                  {skillsContent}
                </div>
              );
            case "certifications":
              return normalizedCertifications.length > 0 && (
                <div key="certifications" className="space-y-2">
                  <div>
                    <h2 className={`text-[11.5px] font-bold uppercase tracking-wider ${c.text}`}>
                      Certifications
                    </h2>
                    <hr className="border-t border-slate-300 mt-0.5 mb-1.5" />
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                    {normalizedCertifications.map((cert: string, idx: number) => {
                      const parts = cert.split(" | ");
                      if (parts.length > 1) {
                        return (
                          <li key={idx} className="leading-relaxed">
                            <span className="font-semibold text-slate-900">{formatText(parts[0])}</span>
                            <span className="text-slate-500 font-normal"> ({formatText(parts[1])})</span>
                          </li>
                        );
                      }
                      return (
                        <li key={idx} className="leading-relaxed">{formatText(cert)}</li>
                      );
                    })}
                  </ul>
                </div>
              );
            case "achievements":
              return (normalizedAchievements.length > 0 || customBullets.length > 0) && (
                <div key="achievements" className="space-y-2">
                  <div>
                    <h2 className={`text-[11.5px] font-bold uppercase tracking-wider ${c.text}`}>
                      {customSection.title || "Achievements"}
                    </h2>
                    <hr className="border-t border-slate-300 mt-0.5 mb-1.5" />
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[10px]">
                    {normalizedAchievements.map((ach: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{formatText(ach)}</li>
                    ))}
                    {customBullets.map((bullet: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        {formatText(bullet)}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            default:
              return null;
          }
        });
      })()}

    </div>
  );
}

