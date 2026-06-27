"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Sun, Moon } from "lucide-react";
import confetti from "canvas-confetti";
import ResumePreview from "@/components/ResumePreview";

interface BuilderExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

interface BuilderProject {
  name: string;
  description: string;
  technologies: string | string[];
}

interface BuilderEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface BuilderCertification {
  name: string;
  platform: string;
}

const formatSelectedText = (
  elementId: string, 
  value: string, 
  setValue: (val: string) => void, 
  type: "bold" | "italic" | "underline"
) => {
  const el = document.getElementById(elementId) as HTMLTextAreaElement | HTMLInputElement;
  if (!el) return;

  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  const selectedText = value.substring(start, end);

  // Helper to parse outer wrappers
  const parseWrappers = (text: string): { core: string; wrappers: string[] } => {
    let core = text;
    const wrappers: string[] = [];
    while (true) {
      if (core.startsWith("**") && core.endsWith("**") && core.length >= 4) {
        wrappers.push("bold");
        core = core.slice(2, -2);
      } else if (core.startsWith("__") && core.endsWith("__") && core.length >= 4) {
        wrappers.push("underline");
        core = core.slice(2, -2);
      } else if (core.startsWith("*") && core.endsWith("*") && !core.startsWith("**") && core.length >= 2) {
        wrappers.push("italic");
        core = core.slice(1, -1);
      } else if (core.startsWith("_") && core.endsWith("_") && !core.startsWith("__") && core.length >= 2) {
        wrappers.push("italic");
        core = core.slice(1, -1);
      } else {
        break;
      }
    }
    return { core, wrappers };
  };

  // Helper to build wrapped text
  const buildWrappedText = (core: string, wrappers: string[]): string => {
    let text = core;
    // Apply wrappers in reverse order (inner to outer)
    for (let i = wrappers.length - 1; i >= 0; i--) {
      const w = wrappers[i];
      if (w === "bold") {
        text = `**${text}**`;
      } else if (w === "underline") {
        text = `__${text}__`;
      } else if (w === "italic") {
        text = `*${text}*`;
      }
    }
    return text;
  };

  const { core, wrappers } = parseWrappers(selectedText);

  // 1. Check if selection is already wrapped in this type
  if (wrappers.includes(type)) {
    const newWrappers = wrappers.filter((w) => w !== type);
    const unwrappedText = buildWrappedText(core, newWrappers);
    const newValue = value.substring(0, start) + unwrappedText + value.substring(end);
    setValue(newValue);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, start + unwrappedText.length);
    }, 0);
    return;
  }

  // 2. Check if the selection is directly surrounded by this type
  let isSurrounded = false;
  if (type === "bold") {
    isSurrounded = value.substring(start - 2, start) === "**" && value.substring(end, end + 2) === "**";
  } else if (type === "underline") {
    isSurrounded = value.substring(start - 2, start) === "__" && value.substring(end, end + 2) === "__";
  } else if (type === "italic") {
    const surrAsterisk = value.substring(start - 1, start) === "*" && value.substring(end, end + 1) === "*" && value.substring(start - 2, start) !== "**" && value.substring(end, end + 2) !== "**";
    const surrUnderscore = value.substring(start - 1, start) === "_" && value.substring(end, end + 1) === "_" && value.substring(start - 2, start) !== "__" && value.substring(end, end + 2) !== "__";
    isSurrounded = surrAsterisk || surrUnderscore;
  }

  if (isSurrounded) {
    let newValue = "";
    let newStart = start;
    let newEnd = end;
    if (type === "bold" || type === "underline") {
      newValue = value.substring(0, start - 2) + selectedText + value.substring(end + 2);
      newStart = start - 2;
      newEnd = end - 2;
    } else if (type === "italic") {
      newValue = value.substring(0, start - 1) + selectedText + value.substring(end + 1);
      newStart = start - 1;
      newEnd = end - 1;
    }
    setValue(newValue);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newStart, newEnd);
    }, 0);
    return;
  }

  // 3. Fallback: If cursor is empty (start === end) and not surrounded, insert empty tag pair
  if (start === end) {
    let tag = "";
    if (type === "bold") tag = "****";
    if (type === "italic") tag = "**";
    if (type === "underline") tag = "____";

    const newValue = value.substring(0, start) + tag + value.substring(end);
    setValue(newValue);
    
    setTimeout(() => {
      el.focus();
      const offset = type === "bold" ? 2 : type === "italic" ? 1 : 2;
      el.setSelectionRange(start + offset, start + offset);
    }, 0);
    return;
  }

  // 4. Otherwise, wrap the selection by adding the wrapper to the active wrappers stack
  const newWrappers = [...wrappers, type];
  const wrappedText = buildWrappedText(core, newWrappers);
  const newValue = value.substring(0, start) + wrappedText + value.substring(end);
  setValue(newValue);

  setTimeout(() => {
    el.focus();
    el.setSelectionRange(start, start + wrappedText.length);
  }, 0);
};

const AutoResizeTextarea = ({
  id,
  value,
  onChange,
  className,
  placeholder,
  rows = 3
}: {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
  rows?: number;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      id={id}
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      className={className}
      placeholder={placeholder}
      rows={rows}
      style={{ overflowY: "hidden" }}
    />
  );
};

const TextFormatToolbar = ({ 
  elementId, 
  value, 
  setValue 
}: { 
  elementId: string; 
  value: string; 
  setValue: (val: string) => void;
}) => {
  return (
    <div className="flex items-center gap-1.5 border border-border/80 rounded px-1.5 py-0.5 bg-muted/30 shrink-0 select-none">
      <button
        type="button"
        onClick={() => formatSelectedText(elementId, value, setValue, "bold")}
        className="hover:bg-primary/15 hover:text-primary px-1.5 py-0.5 rounded text-[10px] font-extrabold transition-colors text-foreground"
        title="Bold (**text**)"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => formatSelectedText(elementId, value, setValue, "italic")}
        className="hover:bg-primary/15 hover:text-primary px-1.5 py-0.5 rounded text-[10px] italic transition-colors font-serif text-foreground"
        title="Italic (*text*)"
      >
        I
      </button>
    </div>
  );
};

export default function ResumeBuilder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // App States
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "light";
  });

  // Apply & Save Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);
  
  // Active Builder Tab: personal -> experience -> projects -> education -> skills -> certifications -> achievements -> custom
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "projects" | "education" | "skills" | "certifications" | "achievements" | "custom">("personal");

  // Form Fields State
  const [buildName, setBuildName] = useState("My Tailored Resume");
  const [personalInfo, setPersonalInfo] = useState({
    name: "John Doe",
    title: "",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    location: "Chicago, IL",
    website: "https://johndoe.dev",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
  });
  const [summary, setSummary] = useState(
    "Experienced software engineer specializing in frontend frameworks and backend database architecture. Passionate about building highly clean and accessible layouts."
  );
  const [skillsList, setSkillsList] = useState<{ category: string; items: string }[]>([
    { category: "Languages", items: "JavaScript, TypeScript, HTML, CSS" },
    { category: "Frameworks", items: "React, Next.js, Node.js, Express" },
    { category: "Infrastructure", items: "SQL, Git" }
  ]);

  const addSkillsCategory = () => {
    setSkillsList([...skillsList, { category: "", items: "" }]);
  };

  const removeSkillsCategory = (idx: number) => {
    setSkillsList(skillsList.filter((_, i) => i !== idx));
  };

  const updateSkillsCategory = (idx: number, field: "category" | "items", value: string) => {
    setSkillsList(skillsList.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const [certifications, setCertifications] = useState<BuilderCertification[]>([]);

  const addCertification = () => {
    setCertifications([...certifications, { name: "", platform: "" }]);
  };
  const [achievements, setAchievements] = useState<string>("");
  const [customSection, setCustomSection] = useState({ title: "Custom Section", content: "" });
  
  const [template, setTemplate] = useState<"tech" | "minimal" | "executive" | "creative">("tech");
  const [color, setColor] = useState<"purple" | "blue" | "emerald" | "amber" | "rose">("purple");
  const [margins, setMargins] = useState<"narrow" | "normal" | "wide">("normal");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">("sans");
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "summary", "experience", "education", "projects", "skills", "certifications", "achievements"
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newOrder = [...sectionOrder];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);
    setSectionOrder(newOrder);
    setDraggedIndex(null);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sectionOrder.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newOrder = [...sectionOrder];
    const [removed] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, removed);
    setSectionOrder(newOrder);
  };
  
  // Height Budget states
  const previewRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentHeightPercent, setContentHeightPercent] = useState(0);
  
  const [experience, setExperience] = useState<BuilderExperience[]>([
    {
      company: "Apex Tech Corp",
      position: "Frontend Engineer",
      startDate: "Jan 2024",
      endDate: "Present",
      location: "Chicago, IL",
      description: "Implemented reactive web modules for target e-commerce layouts.\nCollaborated on query structures with database managers."
    }
  ]);
  
  const [projects, setProjects] = useState<BuilderProject[]>([
    {
      name: "Portfolio Site",
      description: "Deploys static templates compiled from candidate parameters.",
      technologies: "Next.js, TypeScript"
    }
  ]);
  
  const [education, setEducation] = useState<BuilderEducation[]>([
    {
      institution: "Midwest University",
      degree: "BS",
      fieldOfStudy: "Informatics",
      startDate: "2020",
      endDate: "2024",
      gpa: "3.7"
    }
  ]);

  // Load existing resume if editing
  useEffect(() => {
    async function fetchResume() {
      if (id === "new") {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const urlTemplate = params.get("template");
          const urlColor = params.get("color");
          const localTemplate = localStorage.getItem("selectedTemplate");
          const localColor = localStorage.getItem("selectedResumeColor");

          if (urlTemplate === "tech" || urlTemplate === "minimal" || urlTemplate === "executive" || urlTemplate === "creative") {
            setTemplate(urlTemplate);
          } else if (localTemplate === "tech" || localTemplate === "minimal" || localTemplate === "executive" || localTemplate === "creative") {
            setTemplate(localTemplate);
          }

          if (urlColor === "purple" || urlColor === "blue" || urlColor === "emerald" || urlColor === "amber" || urlColor === "rose") {
            setColor(urlColor);
          } else if (localColor === "purple" || localColor === "blue" || localColor === "emerald" || localColor === "amber" || localColor === "rose") {
            setColor(localColor);
          }

          const urlMargins = params.get("margins");
          const localMargins = localStorage.getItem("selectedMargins");
          if (urlMargins === "narrow" || urlMargins === "normal" || urlMargins === "wide") {
            setMargins(urlMargins);
          } else if (localMargins === "narrow" || localMargins === "normal" || localMargins === "wide") {
            setMargins(localMargins);
          }
        }
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/resumes/${id}`);
        const data = await res.json();
        if (data.success && data.resume) {
          const r = data.resume;
          if (r.sourceType === "uploaded") {
            router.push("/builder/new");
            return;
          }
          setBuildName(r.name);
          setPersonalInfo({
            name: r.content.personalInfo.name || "",
            title: r.content.personalInfo.title || "",
            email: r.content.personalInfo.email || "",
            phone: r.content.personalInfo.phone || "",
            location: r.content.personalInfo.location || "",
            website: r.content.personalInfo.website || "",
            linkedin: r.content.personalInfo.linkedin || "",
            github: r.content.personalInfo.github || "",
          });
            setSummary(r.content.summary);
           if (Array.isArray(r.content.skills)) {
             const parsedCategories = r.content.skills.map((s: string) => {
               if (s.includes(":")) {
                 const colonIdx = s.indexOf(":");
                 return {
                   category: s.substring(0, colonIdx).trim(),
                   items: s.substring(colonIdx + 1).trim()
                 };
               }
               return {
                 category: "",
                 items: s.trim()
               };
             });
             setSkillsList(parsedCategories);
           } else if (typeof r.content.skills === "string") {
             const lines = r.content.skills.split("\n").map((s: string) => s.trim()).filter((s: string) => s.length > 0);
             const parsedCategories = lines.map((s: string) => {
               if (s.includes(":")) {
                 const colonIdx = s.indexOf(":");
                 return {
                   category: s.substring(0, colonIdx).trim(),
                   items: s.substring(colonIdx + 1).trim()
                 };
               }
               return {
                 category: "",
                 items: s.trim()
               };
             });
             setSkillsList(parsedCategories);
           } else {
             setSkillsList([]);
           }
            const loadedCerts = r.content.certifications
              ? (r.content.certifications as string[]).map((c: string) => {
                  const parts = c.split(" | ");
                  return { name: parts[0]?.trim() || "", platform: parts[1]?.trim() || "" };
                })
              : [];
            setCertifications(loadedCerts);
          setAchievements(r.content.achievements ? r.content.achievements.join("\n") : "");
          setCustomSection(r.content.customSection || { title: "Custom Section", content: "" });
          if (r.content.template) setTemplate(r.content.template);
          if (r.content.color) setColor(r.content.color);
          if (r.content.margins) setMargins(r.content.margins);
          if (r.content.fontFamily) setFontFamily(r.content.fontFamily);
          if (r.content.sectionOrder) {
            setSectionOrder(r.content.sectionOrder);
          } else {
            setSectionOrder(["summary", "experience", "education", "projects", "skills", "certifications", "achievements"]);
          }
          
          // Re-flatten description lists to newline string for editor
          const formattedExp = r.content.experience.map((exp: typeof r.content.experience[number]) => ({
            ...exp,
            description: Array.isArray(exp.description) ? exp.description.join("\n") : exp.description
          }));
          setExperience(formattedExp);
          setProjects(r.content.projects);
          setEducation(r.content.education);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchResume();
  }, [id]);

  // Form modification arrays
  const addExperienceBlock = () => {
    setExperience([...experience, { company: "", position: "", startDate: "", endDate: "", location: "", description: "" }]);
  };

  const removeExperienceBlock = (idx: number) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const updateExperienceBlock = (idx: number, field: string, value: string) => {
    setExperience(experience.map((exp, i) => i === idx ? { ...exp, [field]: value } : exp));
  };

  const addProjectBlock = () => {
    setProjects([...projects, { name: "", description: "", technologies: "" }]);
  };

  const removeProjectBlock = (idx: number) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const updateProjectBlock = (idx: number, field: string, value: string) => {
    setProjects(projects.map((proj, i) => i === idx ? { ...proj, [field]: value } : proj));
  };

  const addEducationBlock = () => {
    setEducation([...education, { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "" }]);
  };

  const removeEducationBlock = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const updateEducationBlock = (idx: number, field: string, value: string) => {
    setEducation(education.map((edu, i) => i === idx ? { ...edu, [field]: value } : edu));
  };

  // Submit Handler
  const handleSave = async () => {
    setSaveLoading(true);
    
    const skillsArray = skillsList
      .map(s => s.category ? `${s.category}: ${s.items}` : s.items)
      .filter(s => s.trim().length > 0);
    const formattedExp = experience.map(exp => ({
      ...exp,
      description: typeof exp.description === "string" ? exp.description.split("\n").filter((b: string) => b.trim().length > 0) : exp.description
    }));

    const formattedProjects = projects.map(proj => ({
      ...proj,
      technologies: Array.isArray(proj.technologies)
        ? proj.technologies
        : typeof proj.technologies === "string"
          ? proj.technologies.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0)
          : []
    }));

    const certificationsArray = certifications
      .filter(c => c.name.trim().length > 0)
      .map(c => c.platform.trim() ? `${c.name.trim()} | ${c.platform.trim()}` : c.name.trim());
    const achievementsArray = achievements.split("\n").map(a => a.trim()).filter(a => a.length > 0);

    const contentPayload = {
      personalInfo,
      summary,
      skills: skillsArray,
      education,
      experience: formattedExp,
      projects: formattedProjects,
      certifications: certificationsArray,
      achievements: achievementsArray,
      customSection: {
        title: customSection.title,
        content: customSection.content
      },
      template,
      color,
      margins,
      fontFamily,
      sectionOrder
    };

    try {
      let endpoint = "/api/resumes";
      let method = "POST";

      if (id !== "new") {
        endpoint = `/api/resumes/${id}`;
        method = "PUT";
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: buildName,
          content: contentPayload
        })
      });

      const data = await res.json();
      if (data.success && data.resume) {
        confetti({ particleCount: 80, spread: 60 });
        // Navigation removed to stay on builder page after save.
      } else {
        alert(data.error || "Failed to save resume");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving document");
    } finally {
      setSaveLoading(false);
    }
  };

  // New handler to recalculate ATS score and redirect to the Checker
  const handleRecalculateScore = async () => {
    setScanLoading(true);

    try {
      // Reuse the content payload logic from handleSave
      const skillsArray = skillsList
        .map(s => s.category ? `${s.category}: ${s.items}` : s.items)
        .filter(s => s.trim().length > 0);
      const formattedExp = experience.map(exp => ({
        ...exp,
        description: typeof exp.description === "string" ? exp.description.split("\n").filter((b: string) => b.trim().length > 0) : exp.description
      }));
      const formattedProjects = projects.map(proj => ({
        ...proj,
        technologies: Array.isArray(proj.technologies)
          ? proj.technologies
          : typeof proj.technologies === "string"
            ? proj.technologies.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0)
            : []
      }));
      const certificationsArray = certifications
        .filter(c => c.name.trim().length > 0)
        .map(c => c.platform.trim() ? `${c.name.trim()} | ${c.platform.trim()}` : c.name.trim());
      const achievementsArray = achievements.split("\n").map(a => a.trim()).filter(a => a.length > 0);

      const contentPayload = {
        personalInfo,
        summary,
        skills: skillsArray,
        education,
        experience: formattedExp,
        projects: formattedProjects,
        certifications: certificationsArray,
        achievements: achievementsArray,
        customSection: {
          title: customSection.title,
          content: customSection.content
        },
        template,
        color,
        margins,
        fontFamily,
        sectionOrder
      };

      let endpoint = "/api/resumes";
      let method = "POST";

      if (id !== "new") {
        endpoint = `/api/resumes/${id}`;
        method = "PUT";
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: buildName, content: contentPayload })
      });
      const data = await res.json();
      if (data.success && data.resume) {
        router.push(`/check/${data.resume.id}?scan=true`);
      } else {
        alert(data.error || "Failed to recalculate ATS score");
      }
    } catch (err) {
      console.error(err);
      alert("Error recalculating ATS score");
    } finally {
      setScanLoading(false);
    }
  };


  // Monitor height budget of preview canvas
  useEffect(() => {
    const checkHeight = () => {
      if (previewRef.current) {
        const scrollHeight = previewRef.current.scrollHeight;
        // Standard A4 height is roughly 1050px. Let's compute a dynamic percentage.
        const percent = Math.min(100, Math.round((scrollHeight / 1050) * 100));
        setContentHeightPercent(percent);
        if (scrollHeight > 1060) {
          setIsOverflowing(true);
        } else {
          setIsOverflowing(false);
        }
      }
    };
    // Debounce check slightly to let DOM styles settle
    const t = setTimeout(checkHeight, 150);
    return () => clearTimeout(t);
  }, [
    personalInfo,
    summary,
    experience,
    projects,
    education,
    skillsList,
    certifications,
    achievements,
    customSection,
    template,
    color,
    margins,
    sectionOrder,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Initializing builder canvas...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      
      {/* Top navbar */}
      <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/dashboard")}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
              title="Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="border-l border-border pl-3">
              <input 
                type="text" 
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                className="font-bold text-sm text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5"
              />
              <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">Document Builder</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-border hover:bg-muted/40 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
            </button>

            <button 
              onClick={handleSave}
              disabled={saveLoading}
              className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Save className="w-3.5 h-3.5" /> {saveLoading ? "Saving..." : "Save Resume"}
            </button>
            <button 
              onClick={handleRecalculateScore}
              disabled={scanLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              {scanLoading ? "Saving..." : "Calculate ATS Score"}
            </button>
          </div>
        </div>
      </header>

      {/* Split-pane workspace */}
      <div className="flex-1 flex overflow-hidden w-full relative print:block print:bg-white print:overflow-visible">
        
        {/* LEFT PANE: Form Inputs (45% width) */}
        <section className="w-[450px] bg-card border-r border-border flex flex-col shrink-0 h-full overflow-hidden print:hidden">
          
          {/* Tabs header bar */}
          <div className="flex border-b border-border text-xs font-bold text-muted-foreground bg-muted/40 overflow-x-auto shrink-0">
            {(["personal", "experience", "projects", "education", "skills", "certifications", "achievements", "custom"] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 border-b-2 capitalize shrink-0 transition-colors ${
                  activeTab === tab ? "border-primary text-primary bg-card" : "border-transparent hover:text-foreground"
                }`}
              >
                {tab === "custom" ? customSection.title || "Custom" : tab}
              </button>
            ))}
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 left-panel-scroll p-6 space-y-6">
            
            {/* Layout & Accent Color Panel */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                
                {/* Accent Color */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">Accent Color</label>
                  <div className="flex items-center gap-3">
                    {(["purple", "blue", "emerald", "amber", "rose"] as const).map((c) => {
                      const colorClasses = {
                        purple: "bg-indigo-600 ring-indigo-300",
                        blue: "bg-blue-600 ring-blue-300",
                        emerald: "bg-emerald-600 ring-emerald-300",
                        amber: "bg-amber-500 ring-amber-300",
                        rose: "bg-rose-600 ring-rose-300",
                      }[c];
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-6 h-6 rounded-full ${colorClasses} transition-all duration-200 shrink-0 ${
                            color === c
                              ? "ring-2 ring-offset-2 scale-110"
                              : "opacity-80 hover:opacity-100"
                          }`}
                          title={c}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Page Margins */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">Page Margins</label>
                  <div className="flex items-center gap-1.5">
                    {(["narrow", "normal", "wide"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMargins(m)}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold capitalize transition-all active:scale-95 ${
                          margins === m
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "border-border hover:bg-muted bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">Typography</label>
                  <div className="flex items-center gap-1.5">
                    {(["sans", "serif", "mono"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFontFamily(f)}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold capitalize transition-all active:scale-95 ${
                          fontFamily === f
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "border-border hover:bg-muted bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Section Ordering Panel */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Section Ordering</label>
                <span className="text-[9px] text-muted-foreground/85">Drag chips or use ◀ ▶ to reorder resume sections</span>
              </div>
              <div className="section-order-scroll flex gap-2 pb-1.5">
                {sectionOrder.map((sectionId, idx) => {
                  const sectionLabels: Record<string, string> = {
                    summary: "Summary",
                    experience: "Experience",
                    education: "Education",
                    projects: "Projects",
                    skills: "Skills",
                    certifications: "Certs",
                    achievements: "Achievements",
                  };
                  return (
                    <div
                      key={sectionId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`shrink-0 flex items-center gap-1 pl-1.5 pr-1 py-1 rounded-full border text-[10px] font-semibold cursor-grab active:cursor-grabbing select-none transition-all ${
                        draggedIndex === idx
                          ? "opacity-40 border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:border-primary/50 hover:bg-muted/60 text-foreground"
                      }`}
                    >
                      {/* Position badge */}
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        draggedIndex === idx ? "bg-primary text-white" : "bg-primary/15 text-primary"
                      }`}>
                        {idx + 1}
                      </span>
                      {/* Label */}
                      <span className="px-0.5 whitespace-nowrap">{sectionLabels[sectionId] || sectionId}</span>
                      {/* Move left */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, "up")}
                        className="p-0.5 hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-25 disabled:pointer-events-none rounded-full transition"
                        title="Move Left"
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      {/* Move right */}
                      <button
                        type="button"
                        disabled={idx === sectionOrder.length - 1}
                        onClick={() => moveSection(idx, "down")}
                        className="p-0.5 hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-25 disabled:pointer-events-none rounded-full transition"
                        title="Move Right"
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            
            {/* A. PERSONAL INFO */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="font-bold text-base border-b border-border pb-2">Contact Details</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Full Name</label>
                    <input 
                      type="text" 
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                      className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Email Address</label>
                    <input 
                      type="email" 
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-muted-foreground">Professional Headline (Subtitle)</label>
                  <input 
                    type="text" 
                    value={personalInfo.title}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                    className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Phone</label>
                    <input 
                      type="text" 
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Location</label>
                    <input 
                      type="text" 
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                      className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">LinkedIn URL</label>
                    <input 
                      type="text" 
                      value={personalInfo.linkedin || ""}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                      className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">GitHub URL</label>
                    <input 
                      type="text" 
                      value={personalInfo.github || ""}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                      className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-muted-foreground">Personal Website</label>
                  <input 
                    type="text" 
                    value={personalInfo.website || ""}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                    className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                 <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-muted-foreground">Professional Summary Objective</label>
                    <TextFormatToolbar elementId="summary-input" value={summary} setValue={setSummary} />
                  </div>
                  <AutoResizeTextarea 
                    id="summary-input"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={6}
                    className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* B. EXPERIENCE */}
            {activeTab === "experience" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-base">Work Experience</h3>
                  <button 
                    onClick={addExperienceBlock}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Job
                  </button>
                </div>

                {experience.map((exp, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg space-y-3 relative text-xs bg-muted/30">
                    <button 
                      onClick={() => removeExperienceBlock(idx)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-muted-foreground">Company Name</label>
                        <input 
                          type="text" 
                          value={exp.company}
                          onChange={(e) => updateExperienceBlock(idx, "company", e.target.value)}
                          className="w-full p-2 rounded border border-border bg-background text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-muted-foreground">Job Title</label>
                        <input 
                          type="text" 
                          value={exp.position}
                          onChange={(e) => updateExperienceBlock(idx, "position", e.target.value)}
                          className="w-full p-2 rounded border border-border bg-background text-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-muted-foreground">Start Date</label>
                        <input 
                          type="text" 
                          value={exp.startDate}
                          onChange={(e) => updateExperienceBlock(idx, "startDate", e.target.value)}
                          className="w-full p-2 rounded border border-border bg-background text-foreground"
                          placeholder="e.g. Jan 2024"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-muted-foreground">End Date</label>
                        <input 
                          type="text" 
                          value={exp.endDate}
                          onChange={(e) => updateExperienceBlock(idx, "endDate", e.target.value)}
                          className="w-full p-2 rounded border border-border bg-background text-foreground"
                          placeholder="e.g. Present"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-muted-foreground">Location</label>
                        <input 
                          type="text" 
                          value={exp.location}
                          onChange={(e) => updateExperienceBlock(idx, "location", e.target.value)}
                          className="w-full p-2 rounded border border-border bg-background text-foreground"
                          placeholder="e.g. San Francisco, CA"
                        />
                      </div>
                    </div>

                     <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-muted-foreground">Description Bullets (One per line)</label>
                        <TextFormatToolbar 
                          elementId={`exp-desc-${idx}`} 
                          value={exp.description} 
                          setValue={(val) => updateExperienceBlock(idx, "description", val)} 
                        />
                      </div>
                      <AutoResizeTextarea 
                        id={`exp-desc-${idx}`}
                        value={exp.description}
                        onChange={(e) => updateExperienceBlock(idx, "description", e.target.value)}
                        rows={4}
                        className="w-full p-2 rounded border border-border bg-background text-foreground resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* C. PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-base">Projects</h3>
                  <button 
                    onClick={addProjectBlock}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg space-y-3 relative text-xs bg-muted/30">
                    <button 
                      onClick={() => removeProjectBlock(idx)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">Project Name</label>
                      <input 
                        type="text" 
                        value={proj.name}
                        onChange={(e) => updateProjectBlock(idx, "name", e.target.value)}
                        className="w-full p-2 rounded border border-border bg-background text-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">Technologies (Comma-separated)</label>
                      <input 
                        type="text" 
                        value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies || ""}
                        onChange={(e) => updateProjectBlock(idx, "technologies", e.target.value)}
                        className="w-full p-2 rounded border border-border bg-background text-foreground"
                        placeholder="e.g. Next.js, TypeScript"
                      />
                    </div>

                     <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-muted-foreground">Description</label>
                        <TextFormatToolbar 
                          elementId={`proj-desc-${idx}`} 
                          value={proj.description} 
                          setValue={(val) => updateProjectBlock(idx, "description", val)} 
                        />
                      </div>
                      <AutoResizeTextarea 
                        id={`proj-desc-${idx}`}
                        value={proj.description}
                        onChange={(e) => updateProjectBlock(idx, "description", e.target.value)}
                        rows={3}
                        className="w-full p-2 rounded border border-border bg-background text-foreground resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* D. EDUCATION */}
            {activeTab === "education" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-base">Education</h3>
                  <button 
                    onClick={addEducationBlock}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add School
                  </button>
                </div>

                {education.map((edu, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg space-y-3 relative text-xs bg-muted/30">
                    <button 
                      onClick={() => removeEducationBlock(idx)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">Institution</label>
                      <input 
                        type="text" 
                        value={edu.institution}
                        onChange={(e) => updateEducationBlock(idx, "institution", e.target.value)}
                        className="w-full p-2 rounded border border-border bg-background text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-muted-foreground">Degree</label>
                        <input 
                          type="text" 
                          value={edu.degree}
                          onChange={(e) => updateEducationBlock(idx, "degree", e.target.value)}
                          className="w-full p-2 rounded border border-border bg-background text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-muted-foreground">Field of Study</label>
                        <input 
                          type="text" 
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducationBlock(idx, "fieldOfStudy", e.target.value)}
                          className="w-full p-2 rounded border border-border bg-background text-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-muted-foreground">Start Year</label>
                        <input 
                          type="text" 
                          value={edu.startDate}
                          onChange={(e) => updateEducationBlock(idx, "startDate", e.target.value)}
                          className="w-full p-2 rounded border border-border bg-background text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-muted-foreground">End Year</label>
                        <input 
                          type="text" 
                          value={edu.endDate}
                          onChange={(e) => updateEducationBlock(idx, "endDate", e.target.value)}
                          className="w-full p-2 rounded border border-border bg-background text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-muted-foreground">GPA (Optional)</label>
                        <input 
                          type="text" 
                          value={edu.gpa}
                          onChange={(e) => updateEducationBlock(idx, "gpa", e.target.value)}
                          className="w-full p-2 rounded border border-border bg-background text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

             {/* E. SKILLS */}
            {activeTab === "skills" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-base">Skills Inventory</h3>
                  <button 
                    onClick={addSkillsCategory}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </div>

                {skillsList.map((skillItem, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg space-y-3 relative text-xs bg-muted/30">
                    <button 
                      onClick={() => removeSkillsCategory(idx)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">Category Heading (e.g. Languages)</label>
                      <input 
                        id={"skill-category-" + idx}
                        type="text" 
                        value={skillItem.category}
                        onChange={(e) => updateSkillsCategory(idx, "category", e.target.value)}
                        className="w-full p-2 rounded border border-border bg-background text-foreground"
                        placeholder="e.g. Languages"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">Skills (Comma-separated)</label>
                      <TextFormatToolbar
                        elementId={"skill-items-" + idx}
                        value={skillItem.items}
                        setValue={(val) => updateSkillsCategory(idx, "items", val)}
                      />
                      <input 
                        id={"skill-items-" + idx}
                        type="text" 
                        value={skillItem.items}
                        onChange={(e) => updateSkillsCategory(idx, "items", e.target.value)}
                        className="w-full p-2 rounded border border-border bg-background text-foreground"
                        placeholder="e.g. Python, Go, SQL"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* F. CERTIFICATIONS */}
            {activeTab === "certifications" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-base">Certifications &amp; Licenses</h3>
                  <button 
                    onClick={addCertification}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certificate
                  </button>
                </div>

                {certifications.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                    No certifications added yet. Click "Add Certificate" to get started.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {certifications.map((cert, idx) => (
                      <div key={idx} className="p-4 border border-border rounded-lg space-y-3 relative text-xs bg-muted/30">
                        <button 
                          onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                          className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3 pr-6">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Certificate Name</label>
                            <input 
                              type="text" 
                              value={cert.name}
                              onChange={(e) => {
                                const newCerts = [...certifications];
                                newCerts[idx] = { ...newCerts[idx], name: e.target.value };
                                setCertifications(newCerts);
                              }}
                              placeholder="e.g., AWS Certified Solutions Architect"
                              className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground">Issuing Platform / Provider</label>
                            <input 
                              type="text" 
                              value={cert.platform}
                              onChange={(e) => {
                                const newCerts = [...certifications];
                                newCerts[idx] = { ...newCerts[idx], platform: e.target.value };
                                setCertifications(newCerts);
                              }}
                              placeholder="e.g., Coursera, Udacity, IBM"
                              className="w-full p-2 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* G. ACHIEVEMENTS */}
            {activeTab === "achievements" && (
              <div className="space-y-4">
                <h3 className="font-bold text-base border-b border-border pb-2">Achievements &amp; Awards</h3>
                 <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-muted-foreground">Achievements (One per line)</label>
                    <TextFormatToolbar elementId="ach-input" value={achievements} setValue={setAchievements} />
                  </div>
                  <AutoResizeTextarea 
                    id="ach-input"
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    rows={8}
                    className="w-full p-3.5 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* H. CUSTOM SECTION */}
            {activeTab === "custom" && (
              <div className="space-y-4">
                <h3 className="font-bold text-base border-b border-border pb-2">Custom Section</h3>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Section Title</label>
                    <input 
                      type="text" 
                      value={customSection.title}
                      onChange={(e) => setCustomSection({ ...customSection, title: e.target.value })}
                      className="w-full p-2 rounded border border-border bg-background text-foreground focus:outline-none focus:border-primary"
                      placeholder="e.g., Languages, Publications, Volunteering"
                    />
                  </div>
                   <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-muted-foreground">Section Content (One bullet per line)</label>
                      <TextFormatToolbar 
                        elementId="custom-input" 
                        value={customSection.content} 
                        setValue={(val) => setCustomSection({ ...customSection, content: val })} 
                      />
                    </div>
                    <AutoResizeTextarea 
                      id="custom-input"
                      value={customSection.content}
                      onChange={(e) => setCustomSection({ ...customSection, content: e.target.value })}
                      rows={8}
                      className="w-full p-3.5 rounded border border-border focus:outline-none focus:border-primary bg-background text-foreground resize-none leading-relaxed"
                      placeholder="Fluent in English and Spanish&#10;Intermediate German conversational proficiency&#10;Basic Japanese reading comprehension"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Save Area */}
          <div className="p-6 border-t border-border bg-muted/80 shrink-0">
            <button 
              onClick={handleSave}
              disabled={saveLoading}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-lg text-xs transition shadow"
            >
              {saveLoading ? "Saving..." : "Save Resume"}
            </button>
          </div>
        </section>

        {/* RIGHT PANE: Live Paper Preview (55% width) */}
        <section className="flex-1 overflow-y-auto p-8 flex flex-col items-center bg-background/50 print:bg-white print:p-0 print:overflow-visible">
          
          {/* Page Height Budget Indicator */}
          <div className="w-full max-w-[800px] mb-4 bg-card border border-border p-3.5 rounded-xl shadow-xs shrink-0 flex items-center justify-between gap-4 print:hidden">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">1-Page Budget Indicator</span>
                <span className={isOverflowing ? "text-rose-500 font-extrabold" : "text-emerald-500 font-extrabold"}>
                  {contentHeightPercent}% {isOverflowing ? "(Exceeded)" : "(Optimal)"}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverflowing ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${contentHeightPercent}%` }}
                />
              </div>
            </div>
            {isOverflowing && (
              <div className="text-[10px] text-rose-500 border border-rose-500/20 bg-rose-500/5 px-2.5 py-1.5 rounded-lg font-bold max-w-[240px] leading-tight shrink-0 animate-pulse">
                ⚠️ Resume is spilling to page 2. Shorten bullet points or sections to keep it 1 page.
              </div>
            )}
          </div>

          <div
            ref={previewRef}
            className={`paper-sheet w-full max-w-[800px] min-h-[1050px] text-zinc-900 bg-white shadow-xl rounded-xl border border-border/60 print:shadow-none print:border-none print:p-12 overflow-hidden ${
              margins === "narrow" ? "p-8" : margins === "wide" ? "p-16" : "p-12"
            }`}
          >
            {(() => {
              const liveResumeData = {
                personalInfo,
                summary,
                skills: skillsList.map(s => s.category ? `${s.category}: ${s.items}` : s.items).filter(s => s.trim().length > 0),
                experience: experience.map(exp => ({
                  ...exp,
                  description: typeof exp.description === "string" ? exp.description.split("\n").filter((b: string) => b.trim().length > 0) : exp.description
                })),
                projects: projects.map(proj => ({
                  ...proj,
                  technologies: Array.isArray(proj.technologies)
                    ? proj.technologies
                    : typeof proj.technologies === "string"
                      ? proj.technologies.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0)
                      : []
                })),
                education,
                certifications: certifications
                  .filter(c => c.name.trim().length > 0)
                  .map(c => c.platform.trim() ? `${c.name.trim()} | ${c.platform.trim()}` : c.name.trim()),
                achievements: achievements.split("\n").map(a => a.trim()).filter(a => a.length > 0),
                customSection: {
                  title: customSection.title,
                  content: customSection.content
                },
                fontFamily
              };
              return <ResumePreview data={liveResumeData} template={template} color={color} margins={margins} fontFamily={fontFamily} sectionOrder={sectionOrder} />;
            })()}
          </div>
        </section>

      </div>
    </div>
  );
}
