"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Crown,
  FileCheck,
  Globe,
  ListTodo,
  Mail,
  Moon,
  Sparkles,
  Sun,
  Target,
  Upload,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const resumeMockData = {
  name: "Jhon Wick",
  title: "AI/ML & Data Science Engineer",
  email: "Jhon.Wick@gmail.com",
  phone: "+91 7889876459",
  location: "USA",
  github: "github.com/jhon-wick",
  linkedin: "linkedin.com/in/jhon-wick",
  website: "portfolio.com",
  summary:
    "Systems Engineer with a strong foundation in statistical learning, linear algebra, and neural network optimization parameters (1.5M+ weights trained). Proven track record in translating theoretical ML frameworks into production-ready systems, achieving 99.4% precision in deep classifiers. Expert in architecting intelligent automation ecosystems (n8n, LLM-orchestration, webhooks) alongside streamlined MERN/FastAPI microservices. Combines high-caliber problem-solving (GATE AIR 2604 in Data Science & AI) with clean, containerized deployment (Docker) to bridge advanced data math with efficient full-stack delivery.",
  skills: {
    languages: [
      "Python",
      "TypeScript",
      "JavaScript",
      "C/C++",
      "SQL",
      "HTML5/CSS3",
      "Java",
    ],
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
      company: "Google",
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
      school: "MIT",
      year: "2018 - 2023",
    },
    {
      degree: "M.tech in AIML - 8.9/10",
      school: "Technical University of Munich",
      year: "2026 - 2028",
    },
  ],
};

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  // Sync theme from localStorage after hydration to avoid mismatch
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    const resolvedTheme =
      savedTheme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTimeout(() => {
      setTheme(resolvedTheme);
    }, 0);
  }, []);


  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(
    "login",
  );
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Interactive Simulator State
  const [selectedDemoTab, setSelectedDemoTab] = useState<
    "formatting" | "keywords" | "impact"
  >("keywords");
  const [atsScore, setAtsScore] = useState(72);
  const [atsKeywordsFixed, setAtsKeywordsFixed] = useState(false);
  const [atsFormattingFixed, setAtsFormattingFixed] = useState(false);
  const [atsPhrasingFixed, setAtsPhrasingFixed] = useState(false);
  const [atsScanning, setAtsScanning] = useState(false);

  // Resume Preview State
  const [selectedTemplate, setSelectedTemplate] = useState<
    "tech" | "minimal" | "executive" | "creative"
  >("tech");
  const [selectedResumeColor, setSelectedResumeColor] = useState<
    "purple" | "blue" | "emerald" | "amber" | "rose"
  >("purple");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Helper for rendering templates in real-time
  const renderResumeTemplate = (template: string, color: string) => {
    template = "tech";
    const c = {
      purple: {
        text: "text-indigo-600",
        bg: "bg-indigo-600",
        border: "border-indigo-600",
        lightBorder: "border-indigo-200",
        pill: "bg-indigo-50 text-indigo-700 border-indigo-200",
      },
      blue: {
        text: "text-sky-600",
        bg: "bg-sky-600",
        border: "border-sky-600",
        lightBorder: "border-sky-200",
        pill: "bg-sky-50 text-sky-700 border-sky-200",
      },
      emerald: {
        text: "text-emerald-600",
        bg: "bg-emerald-600",
        border: "border-emerald-600",
        lightBorder: "border-emerald-200",
        pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
      amber: {
        text: "text-amber-600",
        bg: "bg-amber-600",
        border: "border-amber-600",
        lightBorder: "border-amber-200",
        pill: "bg-amber-50 text-amber-700 border-amber-200",
      },
      rose: {
        text: "text-rose-600",
        bg: "bg-rose-600",
        border: "border-rose-600",
        lightBorder: "border-rose-200",
        pill: "bg-rose-50 text-rose-700 border-rose-200",
      },
    }[color] || {
      text: "text-indigo-600",
      bg: "bg-indigo-600",
      border: "border-indigo-600",
      lightBorder: "border-indigo-200",
      pill: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };

    if (template === "tech") {
      return (
        <div className="space-y-4 text-slate-800 text-[8.5px] font-sans">
          {/* Header */}
          <div className="text-center space-y-1 border-b pb-2.5 border-slate-200">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
              {resumeMockData.name}
            </h1>
            <p className={`text-[9.5px] font-bold mt-1 ${c.text}`}>
              {resumeMockData.title}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-slate-500 mt-2 text-[7.5px] font-semibold">
              <a
                href={`mailto:${resumeMockData.email}`}
                className="flex items-center gap-1 hover:underline text-slate-700"
              >
                <svg
                  className={`w-2.5 h-2.5 ${c.text}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                <span>{resumeMockData.email}</span>
              </a>
              <span className="flex items-center gap-1 text-slate-700">
                <svg
                  className={`w-2.5 h-2.5 ${c.text}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{resumeMockData.phone}</span>
              </span>
              <span className="flex items-center gap-1 text-slate-700">
                <svg
                  className={`w-2.5 h-2.5 ${c.text}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"
                  />
                </svg>
                <span>{resumeMockData.location}</span>
              </span>
              <a
                href={`https://${resumeMockData.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline text-slate-700"
              >
                <svg
                  className={`w-2.5 h-2.5 ${c.text}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>linkedin</span>
              </a>
              <a
                href={`https://${resumeMockData.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline text-slate-700"
              >
                <svg
                  className={`w-2.5 h-2.5 ${c.text}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>github</span>
              </a>
              <a
                href={`https://${resumeMockData.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline text-slate-700"
              >
                <svg
                  className={`w-2.5 h-2.5 ${c.text}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.905 0-5.64-.811-7.966-2.228m15.932 0C18.81 11.025 15.617 12 12 12s-6.81-1.025-7.966-2.228"
                  />
                </svg>
                <span>Portfolio</span>
              </a>
            </div>
          </div>

          {/* Summary */}
          <div
            id="preview-summary"
            className={`space-y-0.5 p-1 rounded transition-all ${hoveredItem === "summary" ? "bg-slate-50/80 ring-1 ring-primary/20" : ""}`}
            onMouseEnter={() => setHoveredItem("summary")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2
              className={`text-[8.5px] font-bold uppercase tracking-wider ${c.text}`}
            >
              SUMMARY
            </h2>
            <hr className="border-t border-slate-350 mt-0.5 mb-1.5" />
            <p className="text-slate-600 leading-relaxed text-[8px]">
              {resumeMockData.summary}
            </p>
          </div>

          {/* Work Experience */}
          <div className="space-y-2.5">
            <h2
              className={`text-[8.5px] font-bold uppercase tracking-wider ${c.text}`}
            >
              WORK EXPERIENCE
            </h2>
            <hr className="border-t border-slate-350 mt-0.5 mb-1.5" />

            <div className="space-y-3">
              {/* Job 1 */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{resumeMockData.experience[0].company}</span>
                  <span className="text-slate-500 font-medium text-[7.5px]">
                    {resumeMockData.experience[0].period}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="italic text-[7.5px]">
                    {resumeMockData.experience[0].role}
                  </span>
                  <span className="text-slate-500 font-medium text-[7.5px]">
                    {resumeMockData.location}
                  </span>
                </div>

                <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed text-[8px] mt-1">
                  <li
                    id="preview-bullet1"
                    className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet1" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                    onMouseEnter={() => setHoveredItem("bullet1")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{resumeMockData.experience[0].bullets[0]}</span>
                  </li>
                  <li
                    id="preview-bullet2"
                    className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet2" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                    onMouseEnter={() => setHoveredItem("bullet2")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{resumeMockData.experience[0].bullets[1]}</span>
                  </li>
                  <li
                    id="preview-bullet3"
                    className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet3" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                    onMouseEnter={() => setHoveredItem("bullet3")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{resumeMockData.experience[0].bullets[2]}</span>
                  </li>
                </ul>
              </div>

              {/* Job 2 */}
              {resumeMockData.experience[1] && (
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>{resumeMockData.experience[1].company}</span>
                    <span className="text-slate-500 font-medium text-[7.5px]">
                      {resumeMockData.experience[1].period}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="italic text-[7.5px]">
                      {resumeMockData.experience[1].role}
                    </span>
                    <span className="text-slate-500 font-medium text-[7.5px]">
                      {resumeMockData.location}
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed text-[8px] mt-1">
                    <li
                      id="preview-bullet4"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet4" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet4")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[1].bullets[0]}</span>
                    </li>
                    <li
                      id="preview-bullet5"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet5" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet5")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[1].bullets[1]}</span>
                    </li>
                    <li
                      id="preview-bullet6"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet6" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet6")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[1].bullets[2]}</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Job 3 */}
              {resumeMockData.experience[2] && (
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>{resumeMockData.experience[2].company}</span>
                    <span className="text-slate-500 font-medium text-[7.5px]">
                      {resumeMockData.experience[2].period}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="italic text-[7.5px]">
                      {resumeMockData.experience[2].role}
                    </span>
                    <span className="text-slate-500 font-medium text-[7.5px]">
                      {resumeMockData.location}
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed text-[8px] mt-1">
                    <li
                      id="preview-bullet7"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet7" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet7")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[2].bullets[0]}</span>
                    </li>
                    <li
                      id="preview-bullet8"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet8" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet8")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[2].bullets[1]}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div
            id="preview-education"
            className={`space-y-1 p-1 rounded transition-all ${hoveredItem === "education" ? "bg-slate-50" : ""}`}
            onMouseEnter={() => setHoveredItem("education")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2
              className={`text-[8.5px] font-bold uppercase tracking-wider ${c.text}`}
            >
              EDUCATION
            </h2>
            <hr className="border-t border-slate-350 mt-0.5 mb-1.5" />
            <div className="space-y-1">
              <div className="flex justify-between text-[8px]">
                <div>
                  <span className="font-bold text-slate-900">
                    {resumeMockData.education[0].school}
                  </span>
                  <span className="text-slate-600">
                    {" "}
                    — {resumeMockData.education[0].degree}
                  </span>
                </div>
                <span className="text-slate-500 font-medium shrink-0">
                  {resumeMockData.education[0].year}
                </span>
              </div>
              {resumeMockData.education[1] && (
                <div className="flex justify-between text-[8px]">
                  <div>
                    <span className="font-bold text-slate-900">
                      {resumeMockData.education[1].school}
                    </span>
                    <span className="text-slate-600">
                      {" "}
                      — {resumeMockData.education[1].degree}
                    </span>
                  </div>
                  <span className="text-slate-500 font-medium shrink-0">
                    {resumeMockData.education[1].year}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Project */}
          <div id="preview-projects" className="space-y-2">
            <h2
              className={`text-[8.5px] font-bold uppercase tracking-wider ${c.text}`}
            >
              PROJECT
            </h2>
            <hr className="border-t border-slate-350 mt-0.5 mb-1.5" />
            <div className="space-y-2">
              <div
                className={`p-1 rounded transition-all ${hoveredItem === "projects" ? "bg-slate-50 border-l-2 border-indigo-500 pl-2" : ""}`}
                onMouseEnter={() => setHoveredItem("projects")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex justify-between items-center font-bold text-slate-900 text-[8px]">
                  <span>{resumeMockData.projects[0].name}</span>

                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed text-[8px] mt-1">
                  <li>
                    Model Calibration over Raw Metrics: While an XGBoost model
                    achieved higher overall accuracy (80.41%), a Tuned Random
                    Forest Classifier (B = 300 trees) was chosen for deployment
                    due to its superior Recall rate of 74.00% (vs. XGBoost's
                    53.00%) and balanced F1-score (0.63). This explicitly
                    minimizes costly False Negatives.
                  </li>
                  <li>
                    Data-Driven Risk Factor EDA: Identified critical churn
                    triggers within account metadata, isolating month-to-month
                    contracts (74.9% risk), manual electronic checks (45.3%
                    risk), and fiber optic billing tiers (40.8% risk) as
                    high-probability indicators of customer attrition.
                  </li>
                  <li>
                    Lean Stack Implementation: The analytical system is coupled
                    with a modern, high-performance web interface built using
                    React, TypeScript, Vite, and Tailwind CSS, allowing
                    stakeholders to dynamically select risk profiles or generate
                    random customer data for live testing.
                  </li>
                  <li>
                    Built using{" "}
                    <strong>Numpy, Panda, Scikit Learn, Pytorch</strong>.
                  </li>
                </ul>
              </div>
              {resumeMockData.projects[1] && (
                <div
                  className={`p-1 rounded transition-all ${hoveredItem === "projects" ? "bg-slate-50 border-l-2 border-indigo-500 pl-2" : ""}`}
                  onMouseEnter={() => setHoveredItem("projects")}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex justify-between items-center font-bold text-slate-900 text-[8px]">
                    <span>{resumeMockData.projects[1].name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div
            id="preview-skills"
            className={`space-y-1 p-1 rounded transition-all ${hoveredItem === "skills" ? "bg-slate-50 border-indigo-600/35 shadow-xs scale-[1.01]" : ""}`}
            onMouseEnter={() => setHoveredItem("skills")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2
              className={`text-[8.5px] font-bold uppercase tracking-wider ${c.text}`}
            >
              SKILLS
            </h2>
            <hr className="border-t border-slate-350 mt-0.5 mb-1.5" />
            <div className="text-[8px] text-slate-600 leading-relaxed space-y-0.5">
              <div>
                <strong className="font-bold text-slate-905">Laguages:</strong>{" "}
                {resumeMockData.skills.languages.join(", ")}
              </div>
              <div>
                <strong className="font-bold text-slate-905">AI & ML:</strong>{" "}
                Deep Learning & MLPs, Computer Vision (OpenCV), PyTorch,
                Scikit-Learn, Pandas, NumPy, Core Math (LinAlg, Calc, Stats)
              </div>
              <div>
                <strong className="font-bold text-slate-905">
                  Automation:
                </strong>{" "}
                n8n Workflows, AI Agents & Webhooks, React, Next.js, Node.js,
                Express, MongoDB (MERN), Tailwind CSS, RESTful APIs
              </div>
              <div>
                <strong className="font-bold text-slate-905">Tools:</strong>{" "}
                {resumeMockData.skills.infrastructure.join(", ")}
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div
            id="preview-certifications"
            className={`space-y-1 p-1.5 rounded transition-all ${hoveredItem === "certifications" ? "bg-slate-50 border-l-2 border-indigo-500 pl-2" : ""}`}
            onMouseEnter={() => setHoveredItem("certifications")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2
              className={`text-[8.5px] font-bold uppercase tracking-wider ${c.text}`}
            >
              CERTIFICATIONS
            </h2>
            <hr className="border-t border-slate-355 mt-0.5 mb-1.5" />
            <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[8px]">
              <li>
                Python with Data Science and ML Certificate({" "}
                <strong>Coursera</strong> )
              </li>
              <li>
                Cyber Security with AI (<strong>Google</strong>)
              </li>
            </ul>
          </div>

          {/* Achievements */}
          <div
            id="preview-achievements"
            className={`space-y-1 p-1.5 rounded transition-all ${hoveredItem === "achievements" ? "bg-slate-50 border-l-2 border-indigo-500 pl-2" : ""}`}
            onMouseEnter={() => setHoveredItem("achievements")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2
              className={`text-[8.5px] font-bold uppercase tracking-wider ${c.text}`}
            >
              ACHIEVEMENTS
            </h2>
            <hr className="border-t border-slate-355 mt-0.5 mb-1.5" />
            <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[8px]">
              <li>
                JEE Advance AIR <strong>19</strong>
              </li>
              <li>
                GATE DA AIR <strong>04</strong>
              </li>
            </ul>
          </div>
        </div>
      );
    }

    if (template === "minimal") {
      return (
        <div className="space-y-4 text-slate-800 text-[8.5px] font-serif">
          {/* Centered Name Header */}
          <div className="text-center space-y-0.5 font-sans">
            <h1 className="text-base font-normal tracking-wide text-slate-900 leading-none">
              {resumeMockData.name}
            </h1>
            <p className="text-[8px] uppercase tracking-wider text-slate-500 font-bold mt-1">
              {resumeMockData.title}
            </p>
            <div className="text-[7.5px] text-slate-400 space-x-1.5 font-medium mt-1">
              <span>{resumeMockData.location}</span>
              <span>|</span>
              <span>{resumeMockData.email}</span>
              <span>|</span>
              <span>{resumeMockData.phone}</span>
            </div>
            <div className="text-[7.5px] text-slate-400 space-x-1.5 font-medium">
              <span className={c.text}>{resumeMockData.github}</span>
              <span>|</span>
              <span className={c.text}>{resumeMockData.linkedin}</span>
            </div>
          </div>

          <div
            className={`h-[1.5px] w-full ${c.bg}`}
            style={{
              backgroundColor:
                c.bg === "bg-indigo-600"
                  ? "#4f46e5"
                  : c.bg === "bg-blue-600"
                    ? "#2563eb"
                    : c.bg === "bg-emerald-600"
                      ? "#059669"
                      : c.bg === "bg-amber-600"
                        ? "#d97706"
                        : "#e11d48",
            }}
          />

          {/* Professional Summary (Added to Minimal for fullness) */}
          <div
            id="preview-summary"
            className={`space-y-0.5 p-1 rounded transition-all ${hoveredItem === "summary" ? "bg-slate-50/80 ring-1 ring-primary/20 font-sans text-[8px]" : ""}`}
            onMouseEnter={() => setHoveredItem("summary")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2 className="text-[8.5px] font-bold uppercase tracking-wider text-slate-900 font-sans">
              Professional Summary
            </h2>
            <p className="text-slate-600 leading-relaxed text-[8px]">
              {resumeMockData.summary}
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[8.5px] font-bold uppercase tracking-wider text-slate-900 font-sans">
                Professional Experience
              </h2>
              {hoveredItem === "experience-title" && (
                <span className="text-[6.5px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-sans font-bold">
                  ✓ Standard Section Header Match
                </span>
              )}
            </div>

            <div
              id="preview-experience"
              className="space-y-3 font-sans"
              onMouseEnter={() => setHoveredItem("experience-title")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Job 1 */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-baseline font-bold text-slate-900 text-[8px]">
                  <span>
                    {resumeMockData.experience[0].role} |{" "}
                    {resumeMockData.experience[0].company}
                  </span>
                  <span className="text-slate-500 font-medium text-[7.5px]">
                    {resumeMockData.experience[0].period}
                  </span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed text-[8px] font-serif">
                  <li
                    id="preview-bullet1"
                    className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet1" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5 font-sans" : ""}`}
                    onMouseEnter={() => setHoveredItem("bullet1")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{resumeMockData.experience[0].bullets[0]}</span>
                  </li>
                  <li
                    id="preview-bullet2"
                    className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet2" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5 font-sans" : ""}`}
                    onMouseEnter={() => setHoveredItem("bullet2")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{resumeMockData.experience[0].bullets[1]}</span>
                  </li>
                  <li
                    id="preview-bullet3"
                    className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet3" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5 font-sans" : ""}`}
                    onMouseEnter={() => setHoveredItem("bullet3")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{resumeMockData.experience[0].bullets[2]}</span>
                  </li>
                </ul>
              </div>

              {/* Job 2 */}
              {resumeMockData.experience[1] && (
                <div className="space-y-0.5">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-[8px]">
                    <span>
                      {resumeMockData.experience[1].role} |{" "}
                      {resumeMockData.experience[1].company}
                    </span>
                    <span className="text-slate-500 font-medium text-[7.5px]">
                      {resumeMockData.experience[1].period}
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed text-[8px] font-serif">
                    <li
                      id="preview-bullet4"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet4" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5 font-sans" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet4")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[1].bullets[0]}</span>
                    </li>
                    <li
                      id="preview-bullet5"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet5" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5 font-sans" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet5")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[1].bullets[1]}</span>
                    </li>
                    <li
                      id="preview-bullet6"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet6" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5 font-sans" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet6")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[1].bullets[2]}</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Job 3 */}
              {resumeMockData.experience[2] && (
                <div className="space-y-0.5">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-[8px]">
                    <span>
                      {resumeMockData.experience[2].role} |{" "}
                      {resumeMockData.experience[2].company}
                    </span>
                    <span className="text-slate-500 font-medium text-[7.5px]">
                      {resumeMockData.experience[2].period}
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed text-[8px] font-serif">
                    <li
                      id="preview-bullet7"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet7" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5 font-sans" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet7")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[2].bullets[0]}</span>
                    </li>
                    <li
                      id="preview-bullet8"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet8" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5 font-sans" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet8")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[2].bullets[1]}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Projects */}
          <div id="preview-projects" className="space-y-2">
            <h2 className="text-[8.5px] font-bold uppercase tracking-wider text-slate-900 font-sans">
              Selected Projects
            </h2>
            <div className="space-y-2 font-sans">
              <div
                className={`p-1 rounded transition-all ${hoveredItem === "projects" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                onMouseEnter={() => setHoveredItem("projects")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex justify-between items-center font-bold text-slate-900 text-[8px]">
                  <span>{resumeMockData.projects[0].name}</span>
                  <span className="text-slate-400 font-semibold text-[7px]">
                    {resumeMockData.projects[0].tech}
                  </span>
                </div>
                <p className="text-slate-600 leading-normal text-[8px] font-serif mt-0.5">
                  {resumeMockData.projects[0].desc}
                </p>
              </div>
              {resumeMockData.projects[1] && (
                <div
                  className={`p-1 rounded transition-all ${hoveredItem === "projects" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                  onMouseEnter={() => setHoveredItem("projects")}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex justify-between items-center font-bold text-slate-900 text-[8px]">
                    <span>{resumeMockData.projects[1].name}</span>
                    <span className="text-slate-400 font-semibold text-[7px]">
                      {resumeMockData.projects[1].tech}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-normal text-[8px] font-serif mt-0.5">
                    {resumeMockData.projects[1].desc}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div
            id="preview-skills"
            className={`space-y-1.5 font-sans p-1.5 rounded transition-all ${hoveredItem === "skills" ? "bg-slate-50 border-l border-indigo-500 pl-2" : ""}`}
            onMouseEnter={() => setHoveredItem("skills")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2 className="text-[8.5px] font-bold uppercase tracking-wider text-slate-900">
              Technical Skills
            </h2>
            <div className="text-[8px] text-slate-600 leading-relaxed space-y-0.5">
              <div>
                <span className="font-bold text-slate-800">Languages: </span>
                {resumeMockData.skills.languages.join(" • ")}
              </div>
              <div>
                <span className="font-bold text-slate-800">Frameworks: </span>
                {resumeMockData.skills.frameworks.join(" • ")}
              </div>
              <div>
                <span className="font-bold text-slate-800">
                  Infrastructure:{" "}
                </span>
                {resumeMockData.skills.infrastructure.join(" • ")}
              </div>
            </div>
          </div>

          {/* Education */}
          <div
            id="preview-education"
            className={`space-y-1.5 font-sans p-1.5 rounded transition-all ${hoveredItem === "education" ? "bg-slate-50 border-l border-indigo-500 pl-2" : ""}`}
            onMouseEnter={() => setHoveredItem("education")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2 className="text-[8.5px] font-bold uppercase tracking-wider text-slate-900">
              Education
            </h2>
            <div className="space-y-1">
              <div className="flex justify-between items-baseline text-[8px]">
                <div>
                  <span className="font-bold text-slate-900">
                    {resumeMockData.education[0].school}
                  </span>
                  <span className="text-slate-500">
                    {" "}
                    — {resumeMockData.education[0].degree}
                  </span>
                </div>
                <span className="text-slate-500 font-medium">
                  {resumeMockData.education[0].year}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-[8px]">
                <div>
                  <span className="font-bold text-slate-900">
                    {resumeMockData.education[1].school}
                  </span>
                  <span className="text-slate-500">
                    {" "}
                    — {resumeMockData.education[1].degree}
                  </span>
                </div>
                <span className="text-slate-500 font-medium">
                  {resumeMockData.education[1].year}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (template === "executive") {
      return (
        <div className="space-y-4 text-slate-800 text-[8.5px] font-sans">
          {/* Top thick accent bar */}
          <div
            className={`h-2 w-full -mt-8 -mx-8 bg-slate-900`}
            style={{
              backgroundColor:
                c.bg === "bg-indigo-600"
                  ? "#4f46e5"
                  : c.bg === "bg-blue-600"
                    ? "#2563eb"
                    : c.bg === "bg-emerald-600"
                      ? "#059669"
                      : c.bg === "bg-amber-600"
                        ? "#d97706"
                        : "#e11d48",
            }}
          />

          {/* Header */}
          <div className="flex justify-between items-start pt-3">
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-950 leading-none">
                {resumeMockData.name}
              </h1>
              <p
                className={`text-[9.5px] uppercase tracking-widest font-extrabold mt-1.5 ${c.text}`}
              >
                {resumeMockData.title}
              </p>
            </div>
            <div className="text-right text-[7.5px] text-slate-500 font-bold space-y-0.5">
              <div>{resumeMockData.location}</div>
              <div>{resumeMockData.email}</div>
              <div>{resumeMockData.phone}</div>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <span className={c.text}>{resumeMockData.github}</span>
                <span>|</span>
                <span className={c.text}>{resumeMockData.linkedin}</span>
              </div>
            </div>
          </div>

          {/* Highlight metrics panel */}
          <div
            id="preview-metrics"
            className={`grid grid-cols-3 gap-2 p-2.5 rounded-xl border transition-all ${hoveredItem === "metrics" ? "bg-slate-50 border-indigo-600/30 shadow-xs" : "border-slate-100"}`}
            onMouseEnter={() => setHoveredItem("metrics")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="text-center border-r border-slate-100">
              <div className={`text-sm font-black ${c.text}`}>-35% Latency</div>
              <div className="text-[7px] text-slate-400 font-extrabold uppercase tracking-wider">
                PyTorch Inference
              </div>
            </div>
            <div className="text-center border-r border-slate-100">
              <div className={`text-sm font-black ${c.text}`}>
                $168k/yr Saved
              </div>
              <div className="text-[7px] text-slate-400 font-extrabold uppercase tracking-wider">
                Kubernetes Scale
              </div>
            </div>
            <div className="text-center">
              <div className={`text-sm font-black ${c.text}`}>120k+ DAU</div>
              <div className="text-[7px] text-slate-400 font-extrabold uppercase tracking-wider">
                Database Scaling
              </div>
            </div>
            {hoveredItem === "metrics" && (
              <div className="col-span-3 text-center text-[7px] bg-emerald-100 text-emerald-800 border border-emerald-200 py-0.5 rounded font-bold animate-pulse mt-0.5">
                ✓ ATS Assessment: High-Impact Quantifiable Metrics Detected
              </div>
            )}
          </div>

          {/* Summary */}
          <div
            id="preview-summary"
            className={`space-y-0.5 p-1 rounded transition-all ${hoveredItem === "summary" ? "bg-slate-50/80 ring-1 ring-primary/20" : ""}`}
            onMouseEnter={() => setHoveredItem("summary")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2 className="text-[8.5px] font-black uppercase tracking-wider text-slate-950">
              Executive Statement
            </h2>
            <p className="text-slate-600 leading-relaxed text-[8px]">
              {resumeMockData.summary}
            </p>
          </div>

          {/* Skills */}
          <div
            id="preview-skills"
            className={`space-y-1.5 p-1.5 rounded transition-all ${hoveredItem === "skills" ? "bg-slate-50 border-l border-indigo-500 pl-2" : ""}`}
            onMouseEnter={() => setHoveredItem("skills")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2 className="text-[8.5px] font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5">
              Core Competencies
            </h2>
            <div className="flex flex-wrap gap-1">
              {resumeMockData.skills.languages
                .concat(resumeMockData.skills.frameworks)
                .concat(resumeMockData.skills.infrastructure)
                .map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[7.5px] font-semibold"
                  >
                    {s}
                  </span>
                ))}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2.5">
            <h2 className="text-[8.5px] font-black uppercase tracking-wider text-slate-955 border-b border-slate-200 pb-0.5">
              Professional Experience
            </h2>

            <div className="space-y-3">
              {/* Job 1 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-900 text-[8px]">
                  <span>{resumeMockData.experience[0].role}</span>
                  <span className="text-slate-500 text-[7.5px]">
                    {resumeMockData.experience[0].company} |{" "}
                    {resumeMockData.experience[0].period}
                  </span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[8px] leading-relaxed">
                  <li
                    id="preview-bullet1"
                    className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet1" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                    onMouseEnter={() => setHoveredItem("bullet1")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{resumeMockData.experience[0].bullets[0]}</span>
                  </li>
                  <li
                    id="preview-bullet2"
                    className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet2" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                    onMouseEnter={() => setHoveredItem("bullet2")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{resumeMockData.experience[0].bullets[1]}</span>
                  </li>
                  <li
                    id="preview-bullet3"
                    className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet3" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                    onMouseEnter={() => setHoveredItem("bullet3")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{resumeMockData.experience[0].bullets[2]}</span>
                  </li>
                </ul>
              </div>

              {/* Job 2 */}
              {resumeMockData.experience[1] && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center font-bold text-slate-900 text-[8px]">
                    <span>{resumeMockData.experience[1].role}</span>
                    <span className="text-slate-500 text-[7.5px]">
                      {resumeMockData.experience[1].company} |{" "}
                      {resumeMockData.experience[1].period}
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[8px] leading-relaxed">
                    <li
                      id="preview-bullet4"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet4" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet4")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[1].bullets[0]}</span>
                    </li>
                    <li
                      id="preview-bullet5"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet5" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet5")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[1].bullets[1]}</span>
                    </li>
                    <li
                      id="preview-bullet6"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet6" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet6")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[1].bullets[2]}</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Job 3 */}
              {resumeMockData.experience[2] && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center font-bold text-slate-900 text-[8px]">
                    <span>{resumeMockData.experience[2].role}</span>
                    <span className="text-slate-500 text-[7.5px]">
                      {resumeMockData.experience[2].company} |{" "}
                      {resumeMockData.experience[2].period}
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[8px] leading-relaxed">
                    <li
                      id="preview-bullet7"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet7" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet7")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[2].bullets[0]}</span>
                    </li>
                    <li
                      id="preview-bullet8"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet8" ? "bg-slate-50 border-l-2 border-indigo-500 pl-1.5" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet8")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[2].bullets[1]}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Projects */}
          <div
            id="preview-projects"
            className={`space-y-1.5 p-1.5 rounded transition-all ${hoveredItem === "projects" ? "bg-slate-50 border-l border-indigo-500 pl-2" : ""}`}
            onMouseEnter={() => setHoveredItem("projects")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <h2 className="text-[8.5px] font-black uppercase tracking-wider text-slate-955 border-b border-slate-200 pb-0.5">
              Key Projects
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-bold text-slate-900">
                  {resumeMockData.projects[0].name} (
                  {resumeMockData.projects[0].tech}):{" "}
                </span>
                <span className="text-slate-600">
                  {resumeMockData.projects[0].desc}
                </span>
              </div>
              {resumeMockData.projects[1] && (
                <div>
                  <span className="font-bold text-slate-900">
                    {resumeMockData.projects[1].name} (
                    {resumeMockData.projects[1].tech}):{" "}
                  </span>
                  <span className="text-slate-600">
                    {resumeMockData.projects[1].desc}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Education & Certs Group */}
          <div className="grid grid-cols-2 gap-4">
            <div
              id="preview-education"
              className={`space-y-1 p-1 rounded transition-all ${hoveredItem === "education" ? "bg-slate-50" : ""}`}
              onMouseEnter={() => setHoveredItem("education")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <h2 className="text-[8.5px] font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5">
                Education
              </h2>
              <div className="space-y-1 text-[7.5px] leading-tight">
                <div>
                  <div className="font-bold text-slate-900">
                    {resumeMockData.education[0].school}
                  </div>
                  <div className="text-slate-500">
                    {resumeMockData.education[0].degree} (
                    {resumeMockData.education[0].year})
                  </div>
                </div>
                {resumeMockData.education[1] && (
                  <div className="mt-1">
                    <div className="font-bold text-slate-900">
                      {resumeMockData.education[1].school}
                    </div>
                    <div className="text-slate-500">
                      {resumeMockData.education[1].degree} (
                      {resumeMockData.education[1].year})
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              id="preview-certifications"
              className={`space-y-1 p-1 rounded transition-all ${hoveredItem === "certifications" ? "bg-slate-50" : ""}`}
              onMouseEnter={() => setHoveredItem("certifications")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <h2 className="text-[8.5px] font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5">
                Certifications
              </h2>
              <ul className="list-disc pl-3 text-[7.5px] text-slate-600 space-y-0.5">
                {resumeMockData.certifications.map((cert) => (
                  <li key={cert}>{cert}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (template === "creative") {
      return (
        <div className="flex -m-8 min-h-[500px] text-[8.5px] font-sans">
          {/* Left Sidebar (1/3 width) */}
          <div className="w-[34%] bg-slate-50 border-r border-slate-100 p-4.5 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-1.5">
                <h3 className="text-[8.5px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                  Contact
                </h3>
                <div className="space-y-1 text-[7.5px] text-slate-500 font-bold leading-relaxed">
                  <div>{resumeMockData.location}</div>
                  <div>{resumeMockData.email}</div>
                  <div>{resumeMockData.phone}</div>
                  <div className={c.text}>{resumeMockData.github}</div>
                  <div className={c.text}>{resumeMockData.linkedin}</div>
                </div>
              </div>

              {/* Skills */}
              <div
                id="preview-skills"
                className={`space-y-1.5 p-1 rounded transition-all ${hoveredItem === "skills" ? "bg-slate-100 ring-1 ring-primary/10" : ""}`}
                onMouseEnter={() => setHoveredItem("skills")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <h3 className="text-[8.5px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                  Key Skills
                </h3>
                <div className="flex flex-wrap gap-1">
                  {resumeMockData.skills.languages
                    .concat(resumeMockData.skills.frameworks)
                    .concat(resumeMockData.skills.infrastructure)
                    .map((s) => (
                      <span
                        key={s}
                        className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${c.pill}`}
                      >
                        {s}
                      </span>
                    ))}
                </div>
              </div>

              {/* Certifications (Added to Sidebar for Fullness) */}
              <div
                id="preview-certifications"
                className={`space-y-1 p-1 rounded transition-all ${hoveredItem === "certifications" ? "bg-slate-100" : ""}`}
                onMouseEnter={() => setHoveredItem("certifications")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <h3 className="text-[8.5px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                  Certifications
                </h3>
                <ul className="list-disc pl-3 text-[7.5px] text-slate-500 space-y-1 leading-tight">
                  {resumeMockData.certifications.map((cert) => (
                    <li key={cert}>{cert}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Education */}
            <div
              id="preview-education"
              className={`space-y-1 text-[7.5px] mt-4 p-1 rounded transition-all ${hoveredItem === "education" ? "bg-slate-100" : ""}`}
              onMouseEnter={() => setHoveredItem("education")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <h3 className="text-[8.5px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                Education
              </h3>
              <div className="space-y-2">
                <div>
                  <div className="font-bold text-slate-900 leading-tight">
                    {resumeMockData.education[0].degree}
                  </div>
                  <div className="text-slate-500 font-semibold">
                    {resumeMockData.education[0].school}
                  </div>
                  <div className="text-slate-400 font-semibold mt-0.5">
                    {resumeMockData.education[0].year}
                  </div>
                </div>
                {resumeMockData.education[1] && (
                  <div>
                    <div className="font-bold text-slate-900 leading-tight">
                      {resumeMockData.education[1].degree}
                    </div>
                    <div className="text-slate-500 font-semibold">
                      {resumeMockData.education[1].school}
                    </div>
                    <div className="text-slate-400 font-semibold mt-0.5">
                      {resumeMockData.education[1].year}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Main Panel (2/3 width) */}
          <div className="w-[66%] p-4 space-y-3.5">
            {/* Header */}
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                {resumeMockData.name}
              </h1>
              <p className={`text-[8.5px] font-bold mt-1 ${c.text}`}>
                {resumeMockData.title}
              </p>
            </div>

            {/* Summary */}
            <div
              id="preview-summary"
              className={`space-y-0.5 p-1 rounded transition-all ${hoveredItem === "summary" ? "bg-slate-50" : ""}`}
              onMouseEnter={() => setHoveredItem("summary")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <h2
                className={`text-[8px] font-bold uppercase tracking-widest ${c.text}`}
              >
                About Me
              </h2>
              <p className="text-slate-600 leading-relaxed text-[8px]">
                {resumeMockData.summary}
              </p>
            </div>

            {/* Experience */}
            <div className="space-y-2.5">
              <h2
                className={`text-[8px] font-bold uppercase tracking-widest ${c.text} border-b border-slate-100 pb-0.5`}
              >
                Experience
              </h2>

              <div className="space-y-2.5">
                {/* Job 1 */}
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-900">
                    <span>{resumeMockData.experience[0].role}</span>
                    <span className="text-slate-400 font-bold text-[7px]">
                      {resumeMockData.experience[0].period}
                    </span>
                  </div>
                  <div className="text-slate-500 font-bold text-[7.5px]">
                    {resumeMockData.experience[0].company}
                  </div>

                  <ul className="list-disc pl-3 space-y-1 text-slate-600 text-[8px] leading-relaxed">
                    <li
                      id="preview-bullet1"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet1" ? "bg-slate-50 border-l border-indigo-500 pl-1" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet1")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[0].bullets[0]}</span>
                    </li>
                    <li
                      id="preview-bullet2"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet2" ? "bg-slate-50 border-l border-indigo-500 pl-1" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet2")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[0].bullets[1]}</span>
                    </li>
                    <li
                      id="preview-bullet3"
                      className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet3" ? "bg-slate-50 border-l border-indigo-500 pl-1" : ""}`}
                      onMouseEnter={() => setHoveredItem("bullet3")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span>{resumeMockData.experience[0].bullets[2]}</span>
                    </li>
                  </ul>
                </div>

                {/* Job 2 */}
                {resumeMockData.experience[1] && (
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-900">
                      <span>{resumeMockData.experience[1].role}</span>
                      <span className="text-slate-400 font-bold text-[7px]">
                        {resumeMockData.experience[1].period}
                      </span>
                    </div>
                    <div className="text-slate-500 font-bold text-[7.5px]">
                      {resumeMockData.experience[1].company}
                    </div>
                    <ul className="list-disc pl-3 space-y-1 text-slate-600 text-[8px] leading-relaxed">
                      <li
                        id="preview-bullet4"
                        className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet4" ? "bg-slate-50 border-l border-indigo-500 pl-1" : ""}`}
                        onMouseEnter={() => setHoveredItem("bullet4")}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <span>{resumeMockData.experience[1].bullets[0]}</span>
                      </li>
                      <li
                        id="preview-bullet5"
                        className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet5" ? "bg-slate-50 border-l border-indigo-500 pl-1" : ""}`}
                        onMouseEnter={() => setHoveredItem("bullet5")}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <span>{resumeMockData.experience[1].bullets[1]}</span>
                      </li>
                      <li
                        id="preview-bullet6"
                        className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet6" ? "bg-slate-50 border-l border-indigo-500 pl-1" : ""}`}
                        onMouseEnter={() => setHoveredItem("bullet6")}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <span>{resumeMockData.experience[1].bullets[2]}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Job 3 */}
                {resumeMockData.experience[2] && (
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-900">
                      <span>{resumeMockData.experience[2].role}</span>
                      <span className="text-slate-400 font-bold text-[7px]">
                        {resumeMockData.experience[2].period}
                      </span>
                    </div>
                    <div className="text-slate-500 font-bold text-[7.5px]">
                      {resumeMockData.experience[2].company}
                    </div>
                    <ul className="list-disc pl-3 space-y-1 text-slate-600 text-[8px] leading-relaxed">
                      <li
                        id="preview-bullet7"
                        className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet7" ? "bg-slate-50 border-l border-indigo-500 pl-1" : ""}`}
                        onMouseEnter={() => setHoveredItem("bullet7")}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <span>{resumeMockData.experience[2].bullets[0]}</span>
                      </li>
                      <li
                        id="preview-bullet8"
                        className={`p-0.5 rounded cursor-pointer transition-all ${hoveredItem === "bullet8" ? "bg-slate-50 border-l border-indigo-500 pl-1" : ""}`}
                        onMouseEnter={() => setHoveredItem("bullet8")}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <span>{resumeMockData.experience[2].bullets[1]}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Projects (Added to Right panel for Fullness) */}
            <div
              id="preview-projects"
              className={`space-y-1.5 p-1 rounded transition-all ${hoveredItem === "projects" ? "bg-slate-50" : ""}`}
              onMouseEnter={() => setHoveredItem("projects")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <h2
                className={`text-[8px] font-bold uppercase tracking-widest ${c.text} border-b border-slate-100 pb-0.5`}
              >
                Projects
              </h2>
              <div className="space-y-2">
                <div>
                  <div className="font-bold text-slate-900 leading-tight">
                    {resumeMockData.projects[0].name}{" "}
                    <span className="text-slate-400 font-normal">
                      ({resumeMockData.projects[0].tech})
                    </span>
                  </div>
                  <div className="text-slate-600 text-[7.5px] mt-0.5">
                    {resumeMockData.projects[0].desc}
                  </div>
                </div>
                {resumeMockData.projects[1] && (
                  <div>
                    <div className="font-bold text-slate-900 leading-tight">
                      {resumeMockData.projects[1].name}{" "}
                      <span className="text-slate-400 font-normal">
                        ({resumeMockData.projects[1].tech})
                      </span>
                    </div>
                    <div className="text-slate-600 text-[7.5px] mt-0.5">
                      {resumeMockData.projects[1].desc}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Auth Forms State
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Email Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotCooldown, setForgotCooldown] = useState(0);

  // Sign-out success checkmark overlay
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const authDialogRef = useRef<HTMLDialogElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Trigger logout success checkmark screen if logout=success parameter is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("logout") === "success") {
        setTimeout(() => {
          setShowLogoutOverlay(true);
        }, 0);
        const timer = setTimeout(() => {
          setShowLogoutOverlay(false);
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }, 1800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

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

  // Check existing session
  useEffect(() => {
    async function checkSession() {
      const res = await fetch("/api/auth");
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
    checkSession();
  }, []);

  // Sync selected template and color to localStorage for persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedTemplate", selectedTemplate);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedResumeColor", selectedResumeColor);
    }
  }, [selectedResumeColor]);

  // Cooldown effect for forgot password OTP resend
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setTimeout(() => {
      setForgotCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [forgotCooldown]);

  const startForgotCooldown = () => {
    setForgotCooldown(60);
  };

  // Dialog Controls
  const resetOtpState = () => {
    setOtpSent(false);
    setOtpCode("");
    setOtpLoading(false);
    setEmailVerified(false);
    setResendCooldown(0);
    setForgotStep("email");
    setForgotOtp("");
    setForgotPassword("");
    setForgotConfirmPassword("");
    setForgotCooldown(0);
  };

  const openAuth = (mode: "login" | "register" | "forgot") => {
    setAuthMode(mode);
    setAuthError(null);
    setAuthSuccess(false);
    resetOtpState();
    authDialogRef.current?.showModal();
  };

  const closeAuth = () => {
    authDialogRef.current?.close();
    resetOtpState();
  };

  // Start resend cooldown timer
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendResetOTP = async () => {
    if (!authEmail.trim()) {
      setAuthError("Email address is required.");
      return;
    }
    setAuthError(null);
    setOtpLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", email: authEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset code");
      }

      setForgotStep("reset");
      startForgotCooldown();
    } catch (err) {
      const error = err as Error;
      setAuthError(error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!forgotOtp.trim() || forgotOtp.length !== 6) {
      setAuthError("Please enter the 6-digit verification code.");
      return;
    }

    if (!forgotPassword.trim() || !forgotConfirmPassword.trim()) {
      setAuthError("Please fill in all fields.");
      return;
    }

    if (forgotPassword.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }

    if (forgotPassword !== forgotConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    setOtpLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          email: authEmail,
          code: forgotOtp,
          newPassword: forgotPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Reset failed");
      }

      setAuthSuccess(true);
      setTimeout(() => {
        setAuthMode("login");
        setForgotStep("email");
        setForgotOtp("");
        setForgotPassword("");
        setForgotConfirmPassword("");
        setAuthSuccess(false);
        setAuthError(null);
      }, 2500);
    } catch (err) {
      const error = err as Error;
      setAuthError(error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  // Send OTP to email
  const handleSendOTP = async () => {
    setAuthError(null);
    setOtpLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email: authEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setOtpSent(true);
      startResendCooldown();
    } catch (err) {
      const error = err as Error;
      setAuthError(error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and then register
  const handleVerifyAndRegister = async () => {
    setAuthError(null);
    setOtpLoading(true);

    try {
      // Step 1: Verify the OTP
      const verifyRes = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          email: authEmail,
          code: otpCode,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Verification failed");
      }

      setEmailVerified(true);

      // Step 2: Create the account
      const registerRes = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          email: authEmail,
          password: authPassword,
          name: authName,
        }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        throw new Error(registerData.error || "Registration failed");
      }

      closeAuth();
      const isPendingTemplate =
        localStorage.getItem("pendingTemplateRedirect") === "true";
      const savedTemplate = localStorage.getItem("selectedTemplate") || "tech";
      const savedColor =
        localStorage.getItem("selectedResumeColor") || "purple";
      if (isPendingTemplate) {
        localStorage.removeItem("pendingTemplateRedirect");
        router.push(
          `/builder/new?template=${savedTemplate}&color=${savedColor}`,
        );
      } else {
        router.push("/dashboard?login=success");
      }
    } catch (err) {
      const error = err as Error;
      setAuthError(error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  // Auth Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Forgot Password flow
    if (authMode === "forgot") {
      if (forgotStep === "email") {
        await handleSendResetOTP();
      } else {
        await handleResetPasswordSubmit(e);
      }
      return;
    }

    // Register flow: multi-step
    if (authMode === "register") {
      if (!authName.trim() || !authEmail.trim() || !authPassword.trim()) {
        setAuthError("Please fill in all fields.");
        return;
      }
      if (authPassword.length < 8) {
        setAuthError("Password must be at least 8 characters.");
        return;
      }

      if (!otpSent) {
        // Step 1: Send OTP
        await handleSendOTP();
      } else {
        // Step 2: Verify OTP and register
        if (!otpCode.trim() || otpCode.length !== 6) {
          setAuthError("Please enter the 6-digit verification code.");
          return;
        }
        await handleVerifyAndRegister();
      }
      return;
    }

    // Login flow: unchanged
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: authEmail,
          password: authPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      closeAuth();
      const isPendingTemplate =
        localStorage.getItem("pendingTemplateRedirect") === "true";
      const savedTemplate = localStorage.getItem("selectedTemplate") || "tech";
      const savedColor =
        localStorage.getItem("selectedResumeColor") || "purple";
      if (isPendingTemplate) {
        localStorage.removeItem("pendingTemplateRedirect");
        router.push(
          `/builder/new?template=${savedTemplate}&color=${savedColor}`,
        );
      } else {
        router.push("/dashboard?login=success");
      }
    } catch (err) {
      const error = err as Error;
      setAuthError(error.message);
    }
  };

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Process File Upload
  const processFile = async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (
      !validTypes.includes(file.type) &&
      !["pdf", "docx", "txt"].includes(extension || "")
    ) {
      setUploadError(
        "Invalid file format. Please upload PDF, DOCX or TXT files only.",
      );
      return;
    }

    setUploadError(null);
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process resume");
      }

      // Successful parse
      // Store in session storage if guest, and redirect
      if (data.resume) {
        sessionStorage.setItem("guestResumeId", data.resume.id);
        // Prompt signup or redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      const error = err as Error;
      setUploadError(error.message || "Failed to upload file");
    } finally {
      setUploadLoading(false);
    }
  };

  const faqs = [
    {
      q: "How does the ATS Analysis Engine determine my score?",
      a: "Our ATS Engine parses your resume sections (Skills, Experience, Projects) and runs checking algorithms to calculate key indicators: keyword coverage based on standard job titles, active verb rates, formatting structures, and presence of quantifiable results (numerical metrics). We compute a blended score similar to modern enterprise ATS screens.",
    },
    {
      q: "Will my downloaded PDF look exactly like the preview?",
      a: "Yes. Our high-fidelity export engine runs layout rendering checks to ensure your PDF is exactly the same layout, margins, fonts, and colors as the preview shown in the app. There are no page splits or layout shifts.",
    },
    {
      q: "How secure is my personal and professional data?",
      a: "We prioritize your privacy. All resume data, custom credentials, and parsed information are encrypted in transit and at rest. We never sell your data to third-party recruitment agencies, and you have complete control to delete your account and documents at any time.",
    },
    {
      q: "How do the interactive AI Mock Interviews work?",
      a: "Once you build or upload your resume, our AI analyzes your experience to generate role-specific behavioral and technical questions. You can practice answering them in a simulated environment to get tailored critique, structural enhancements, and custom model answers.",
    },
    {
      q: "Can I generate a personal portfolio website from my resume?",
      a: "Yes! You can instantly turn your parsed resume data into clean, modern portfolio code (HTML/Tailwind CSS/React). This allows you to host your professional showcase page online with zero manual coding required.",
    },
    {
      q: "Can I manage multiple resumes and track my applications?",
      a: "Absolutely. Your dashboard allows you to copy, edit, and keep track of tailored versions of your resume for different job titles, and includes a built-in Kanban application tracker (Applied, Interviewing, Offered, Rejected) with reminders.",
    },
  ];

  if (showLogoutOverlay) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-[#09090b] text-zinc-100 relative z-[9999] overflow-hidden">
        {/* Animated background subtle blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center justify-center relative z-10 p-6 text-center">
          <div className="flex flex-col items-center">
            <svg
              width="84"
              height="84"
              viewBox="0 0 80 80"
              className="text-emerald-500"
            >
              {/* Circle path */}
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { type: "spring", duration: 0.75, bounce: 0 },
                  opacity: { duration: 0.01 },
                }}
              />
              {/* Checkmark path */}
              <motion.path
                d="M24 40 L35 50 L56 28"
                stroke="currentColor"
                strokeWidth="5"
                fill="transparent"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: {
                    delay: 0.35,
                    type: "spring",
                    duration: 0.55,
                    bounce: 0,
                  },
                  opacity: { delay: 0.35, duration: 0.01 },
                }}
              />
            </svg>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.35 }}
              className="text-2xl font-black text-foreground mt-5 tracking-tight bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-300 bg-clip-text text-transparent"
            >
              Signed Out Successfully
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.35 }}
              className="text-sm text-muted-foreground mt-1.5 font-medium animate-pulse"
            >
              Hope to see you again soon!
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-x-clip w-full max-w-full">
      {/* Background radial glow */}
      <div className="absolute inset-0 gradient-bg-glow pointer-events-none z-0 opacity-50" />

      {/* HEADER NAVBAR */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
          scrolled
            ? "bg-card/90 backdrop-blur-md border-border shadow-md"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
            <span className="font-extrabold text-lg sm:text-xl tracking-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-1">
              ResumeCopilot
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Features
            </a>
            <a href="#demo" className="hover:text-primary transition-colors">
              Interactive Demo
            </a>

            <a href="#faq" className="hover:text-primary transition-colors">
              FAQs
            </a>
            <a href="/donate" className="hover:text-rose-400 text-rose-500 font-semibold transition-colors flex items-center gap-1.5">
              Donate ❤️
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-border hover:bg-muted/40 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-sm font-bold hover:text-primary transition-colors hidden sm:block"
                >
                  Dashboard
                </button>
                <button
                  onClick={async () => {
                    await fetch("/api/auth", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "logout" }),
                    });
                    setIsAuthenticated(false);
                    router.refresh();
                  }}
                  className="bg-card hover:bg-muted text-foreground border border-border text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors shadow-xs"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("pendingTemplateRedirect");
                    }
                    openAuth("login");
                  }}
                  className="text-sm font-medium hover:text-primary transition-colors hidden sm:block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("pendingTemplateRedirect");
                    }
                    openAuth("register");
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors shadow-lg shadow-primary/20"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Empowered by Gemini & Claude AI models
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Get More Interviews With{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            Resume Optimization
          </h1>

          <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
            Analyze, fix, optimize, and tailor your resume in minutes. Unlock
            hidden keywords, fix phrasing issues, and bypass ATS screeners.
          </p>
        </motion.div>

        {/* DROPZONE AREA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl mt-12"
        >
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`glass-card p-6 sm:p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-4 select-none ${
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />

            {uploadLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-semibold text-primary">
                  Extracting text & calculating ATS score...
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">
                    Drag & drop your resume file here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOCX, and TXT (Max 5MB)
                  </p>
                </div>
                <button className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border">
                  Choose File
                </button>
              </>
            )}
          </div>

          {/* Live Scans Ticker */}
          <div className="mt-8 w-full max-w-2xl overflow-hidden relative border-y border-border/30 py-2.5 bg-card/25 backdrop-blur-xs rounded-lg select-none">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-container w-full max-w-full overflow-hidden">
              <div className="animate-marquee flex gap-8 whitespace-nowrap text-[10px] font-semibold text-muted-foreground/75 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Frontend Engineer matched <strong>Google</strong> (ATS: 91%)
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Data Scientist matched <strong>Meta</strong> (ATS: 87%)
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Full-Stack Developer matched <strong>Stripe</strong> (ATS:
                  94%)
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ML Systems Engineer matched <strong>Netflix</strong> (ATS:
                  93%)
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Product Manager matched <strong>Amazon</strong> (ATS: 89%)
                </span>

                {/* Duplicate the items for seamless loop */}
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Frontend Engineer matched <strong>Google</strong> (ATS: 91%)
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Data Scientist matched <strong>Meta</strong> (ATS: 87%)
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Full-Stack Developer matched <strong>Stripe</strong> (ATS:
                  94%)
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ML Systems Engineer matched <strong>Netflix</strong> (ATS:
                  93%)
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Product Manager matched <strong>Amazon</strong> (ATS: 89%)
                </span>
              </div>
            </div>
          </div>

          {uploadError && (
            <p className="text-destructive text-sm font-medium mt-3">
              {uploadError}
            </p>
          )}
        </motion.div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section
        id="how-it-works"
        className="py-20 w-full max-w-7xl mx-auto px-6 relative overflow-hidden"
      >
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Direct Route To Interviews
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            How ResumeCopilot Optimizes Your Journey
          </h2>
          <p className="text-muted-foreground text-sm">
            Three simple, automated phases to transform your professional
            profile and bypass ATS barriers.
          </p>
        </div>

        {/* 3 Step Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Step 1 */}
          <div className="glass-card p-8 rounded-xl border border-border flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                  01
                </span>
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Upload Profile
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Drag and drop your PDF or Word document. Our heuristic parser
                extracts raw text, segments layout zones, and maps credentials
                instantly.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/40 text-[10px] font-bold text-primary flex items-center gap-1">
              <span>Supports PDF, DOCX, TXT</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-8 rounded-xl border border-border flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                  02
                </span>
                <div className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Deep AI Audit
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive instant subscores on formatting, keyword density, and
                phrasing. Fix weak verbs and auto-rephrase bullets to highlight
                quantifiable impact.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/40 text-[10px] font-bold text-pink-400 flex items-center gap-1">
              <span>Powered by Gemini & Claude</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-8 rounded-xl border border-border flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                  03
                </span>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Land Interviews
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track status targets on your Kanban board, generate custom
                tailored cover letters, and prepare with live mock interview
                session reviews.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/40 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <span>94% Recruiter Response Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section
        id="features"
        className="py-20 bg-muted/20 border-y border-border"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Complete AI Career Copilot
            </h2>
            <p className="text-muted-foreground">
              Our platform does more than score resumes. We assist your entire
              job search pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-xl flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">ATS Analyzer Engine</h3>
              <p className="text-muted-foreground text-sm">
                Get scored instantly across formatting, keyword density, and
                grammar. View detailed bullet suggestions in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-xl flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-pink-500/10 text-pink-400 w-fit">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Job Description Matcher</h3>
              <p className="text-muted-foreground text-sm">
                Paste the target job description to verify match score, find
                missing skills, and instantly optimize keywords.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-xl flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400 w-fit">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">One-Click AI Rewrite</h3>
              <p className="text-muted-foreground text-sm">
                Use the {'"Fix Everything"'} utility to convert passive phrasing
                into high-impact, metric-driven statements.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-8 rounded-xl flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Cover Letter Generator</h3>
              <p className="text-muted-foreground text-sm">
                Create customized letters tailored to specific JD demands.
                Choose between formal, professional, or creative options.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card p-8 rounded-xl flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 w-fit">
                <ListTodo className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Application Tracker</h3>
              <p className="text-muted-foreground text-sm">
                Organize your pipeline with our integrated Kanban board. Track
                interviews, metrics, and application conversions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card p-8 rounded-xl flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 w-fit">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Mock Interview Copilot</h3>
              <p className="text-muted-foreground text-sm">
                Prepare with tailored HR and technical questions based on your
                background, with interactive answer grading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BANNER SECTION */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-background to-secondary/15 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative z-10">
          <div className="space-y-2 group">
            <div className="text-4xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              +42%
            </div>
            <h4 className="font-bold text-sm text-foreground">
              Interview Callback Increase
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Optimized profiles match ATS parameters directly, leading to more
              recruiter callbacks.
            </p>
          </div>

          <div className="space-y-2 group">
            <div className="text-4xl font-extrabold bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              15,000+
            </div>
            <h4 className="font-bold text-sm text-foreground">
              Resumes Scanned &amp; Audited
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Trusted by candidates across major engineering and tech hubs
              globally.
            </p>
          </div>

          <div className="space-y-2 group">
            <div className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              10+ Hours
            </div>
            <h4 className="font-bold text-sm text-foreground">
              Saved Per Application Week
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              No manual re-writing, formatting checks, or cover letter drafting
              blockages.
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO SIMULATOR */}
      <section
        id="demo"
        className="py-20 w-full max-w-7xl mx-auto px-6 relative"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Scanner Simulator
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            ATS Auditor &amp; Fix Demo
          </h2>
          <p className="text-muted-foreground text-sm">
            Experience how our real-time audit engine scans resumes, flags
            issues, and suggests optimized updates. Click the checks below to
            interactively optimize the candidate's score.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Controls - Checklist of Problems */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 pl-1 mb-1">
              Audit Checklist
            </h3>

            {/* Keyword Match Button */}
            <button
              onClick={() => setSelectedDemoTab("keywords")}
              className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden group ${
                selectedDemoTab === "keywords"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border hover:border-border/80 bg-card/45 hover:bg-card/75"
              }`}
            >
              <div className="font-bold text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4" /> Keyword Coverage Check
                </span>
                {atsKeywordsFixed ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
                    Fixed (+15)
                  </span>
                ) : (
                  <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    3 Missing
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Matches resume text to specific keywords in target job
                descriptions.
              </p>
            </button>

            {/* Formatting Auditor Button */}
            <button
              onClick={() => setSelectedDemoTab("formatting")}
              className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden group ${
                selectedDemoTab === "formatting"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border hover:border-border/80 bg-card/45 hover:bg-card/75"
              }`}
            >
              <div className="font-bold text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" /> Structure &amp; Layout Check
                </span>
                {atsFormattingFixed ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
                    Fixed (+8)
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded-full font-bold">
                    1 Warning
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Checks parsing compatibility, sections, links, and grid tables.
              </p>
            </button>

            {/* Phrasing Auditor Button */}
            <button
              onClick={() => setSelectedDemoTab("impact")}
              className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden group ${
                selectedDemoTab === "impact"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border hover:border-border/80 bg-card/45 hover:bg-card/75"
              }`}
            >
              <div className="font-bold text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Experience Statement Audit
                </span>
                {atsPhrasingFixed ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
                    Optimized (+10)
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded-full font-bold">
                    1 Weak Statement
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Flags weak passive phrasing and suggests bullet rewrites with
                impact metrics.
              </p>
            </button>
          </div>

          {/* Right Display Board */}
          <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-border flex flex-col justify-between min-h-[420px] bg-card/30 backdrop-blur-md relative overflow-hidden">
            <div>
              {/* ATS Dashboard Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/80 pb-5 mb-5 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                    Simulated Scanner Console
                  </div>
                  <h4 className="text-base font-bold text-foreground">
                    ATS Audit Diagnostic Report
                  </h4>
                </div>

                {/* Score Widget */}
                <div className="flex items-center gap-3.5 bg-card/45 border border-border px-4 py-2 rounded-xl">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    {/* SVG Radial Progress Ring */}
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="var(--border)"
                        strokeWidth="3.5"
                        fill="transparent"
                        className="opacity-40"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="var(--primary)"
                        strokeWidth="3.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={
                          2 *
                          Math.PI *
                          20 *
                          (1 -
                            (72 +
                              (atsKeywordsFixed ? 15 : 0) +
                              (atsFormattingFixed ? 8 : 0) +
                              (atsPhrasingFixed ? 10 : 0)) /
                              100)
                        }
                        className="transition-all duration-700 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="font-extrabold text-[13px] text-foreground relative">
                      {72 +
                        (atsKeywordsFixed ? 15 : 0) +
                        (atsFormattingFixed ? 8 : 0) +
                        (atsPhrasingFixed ? 10 : 0)}
                      %
                    </span>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">
                      Current Score
                    </div>
                    <div className="text-xs font-black text-foreground">
                      {72 +
                        (atsKeywordsFixed ? 15 : 0) +
                        (atsFormattingFixed ? 8 : 0) +
                        (atsPhrasingFixed ? 10 : 0) >=
                      85 ? (
                        <span className="text-emerald-400 font-bold">
                          PASSED (HIGH MATCH)
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold">
                          NEEDS WORK (MEDIUM)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Display Area */}
              <div className="min-h-[200px]">
                <AnimatePresence mode="wait">
                  {/* KEYWORDS TAB */}
                  {selectedDemoTab === "keywords" && (
                    <motion.div
                      key="keywords"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <h5 className="text-xs font-bold text-foreground">
                            Target Job Posting Keywords
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            We scanned the target job profile and identified the
                            following keyword compliance checkmarks:
                          </p>

                          <div className="flex flex-wrap gap-2 pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Check className="w-3 h-3" /> TypeScript
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Check className="w-3 h-3" /> FastAPI / Python
                            </span>

                            {/* Interactive matching tags */}
                            {atsKeywordsFixed ? (
                              <>
                                <motion.span
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                >
                                  <Check className="w-3 h-3" /> Docker (Matched)
                                </motion.span>
                                <motion.span
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                >
                                  <Check className="w-3 h-3" /> CI/CD Pipelines
                                </motion.span>
                                <motion.span
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                >
                                  <Check className="w-3 h-3" /> AWS Cloud
                                </motion.span>
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                                  ⚠ Docker (Missing)
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                                  ⚠ CI/CD Pipelines (Missing)
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                                  ⚠ AWS (Missing)
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Interactive Fix Button */}
                        <div className="shrink-0 pt-2">
                          <button
                            onClick={() => {
                              if (atsKeywordsFixed) return;
                              setAtsScanning(true);
                              setTimeout(() => {
                                setAtsKeywordsFixed(true);
                                setAtsScanning(false);
                              }, 650);
                            }}
                            disabled={atsKeywordsFixed || atsScanning}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                              atsKeywordsFixed
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default"
                                : "bg-primary hover:bg-primary/95 text-white shadow-md shadow-primary/10 active:scale-95 disabled:opacity-55"
                            }`}
                          >
                            {atsScanning && selectedDemoTab === "keywords" ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyzing...
                              </>
                            ) : atsKeywordsFixed ? (
                              "✓ Keywords Optimized"
                            ) : (
                              "Fix Keywords (+15 pts)"
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">
                          AI Suggestion:
                        </strong>{" "}
                        Your resume lacks standard keywords related to
                        containerization and deployment. Adding details about
                        container deployments in pipelines boosts match
                        relevance instantly.
                      </div>
                    </motion.div>
                  )}

                  {/* FORMATTING TAB */}
                  {selectedDemoTab === "formatting" && (
                    <motion.div
                      key="formatting"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <h5 className="text-xs font-bold text-foreground">
                            ATS Parser Compliance Report
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            Multi-column layouts and custom graphics confuse
                            standard text parser algorithms.
                          </p>

                          <div className="space-y-2 pt-1 font-mono text-[11px] p-3 rounded-lg bg-[#09090b]/40 border border-border/60">
                            {atsFormattingFixed ? (
                              <div className="text-emerald-400 space-y-1">
                                <div>
                                  [PARSER OK] Document parsed as linear stream.
                                </div>
                                <div>&gt; Name parsed: "Alexander Wright"</div>
                                <div>
                                  &gt; Experience parsed: "Lead Systems Engineer
                                  at Innovate AI"
                                </div>
                              </div>
                            ) : (
                              <div className="text-red-400 space-y-1">
                                <div>
                                  [WARNING] Layout table columns interleaved.
                                </div>
                                <div>
                                  &gt; Parsed Text: "Lead AI Systems Intern
                                  TechStack"
                                </div>
                                <div className="text-amber-500 font-bold animate-pulse">
                                  &gt;&gt; Parsing error: columns merged raw
                                  data incorrectly.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Fix Button */}
                        <div className="shrink-0 pt-2">
                          <button
                            onClick={() => {
                              if (atsFormattingFixed) return;
                              setAtsScanning(true);
                              setTimeout(() => {
                                setAtsFormattingFixed(true);
                                setAtsScanning(false);
                              }, 650);
                            }}
                            disabled={atsFormattingFixed || atsScanning}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                              atsFormattingFixed
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default"
                                : "bg-primary hover:bg-primary/95 text-white shadow-md shadow-primary/10 active:scale-95 disabled:opacity-55"
                            }`}
                          >
                            {atsScanning && selectedDemoTab === "formatting" ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Refactoring...
                              </>
                            ) : atsFormattingFixed ? (
                              "✓ Layout Compliant"
                            ) : (
                              "Fix Formatting (+8 pts)"
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">
                          AI Suggestion:
                        </strong>{" "}
                        Standard ATS engines parse text from left-to-right.
                        Multi-column tables often interlace unrelated content.
                        Converting to a beautifully aligned, clean single-column
                        structure ensures parser correctness.
                      </div>
                    </motion.div>
                  )}

                  {/* IMPACT TAB */}
                  {selectedDemoTab === "impact" && (
                    <motion.div
                      key="impact"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <h5 className="text-xs font-bold text-foreground">
                            Experience Statement Redesign
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            We analyzed the impact of statements. Passive
                            wording was optimized to include metrics.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                              <span className="text-[9px] font-bold text-red-400 uppercase">
                                Original Statement
                              </span>
                              <p className="text-xs text-muted-foreground mt-1">
                                Worked on client portal dashboard code using
                                React.
                              </p>
                            </div>
                            <div
                              className={`p-3 rounded-lg border transition-all ${
                                atsPhrasingFixed
                                  ? "bg-emerald-500/10 border-emerald-500/25"
                                  : "bg-card/25 border-border/40 opacity-75"
                              }`}
                            >
                              <span
                                className={`text-[9px] font-bold uppercase ${atsPhrasingFixed ? "text-emerald-400" : "text-muted-foreground"}`}
                              >
                                Optimized AI Revision
                              </span>
                              <p
                                className={`text-xs mt-1 transition-all ${atsPhrasingFixed ? "text-foreground font-medium" : "text-muted-foreground/60 italic"}`}
                              >
                                {atsPhrasingFixed
                                  ? "Engineered responsive client portal routes in React, reducing API response times by 32%."
                                  : "Spearhead client portal overhaul in React, reducing load times by 32% (Preview)..."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Fix Button */}
                        <div className="shrink-0 pt-2">
                          <button
                            onClick={() => {
                              if (atsPhrasingFixed) return;
                              setAtsScanning(true);
                              setTimeout(() => {
                                setAtsPhrasingFixed(true);
                                setAtsScanning(false);
                              }, 650);
                            }}
                            disabled={atsPhrasingFixed || atsScanning}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                              atsPhrasingFixed
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default"
                                : "bg-primary hover:bg-primary/95 text-white shadow-md shadow-primary/10 active:scale-95 disabled:opacity-55"
                            }`}
                          >
                            {atsScanning && selectedDemoTab === "impact" ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Rewriting...
                              </>
                            ) : atsPhrasingFixed ? (
                              "✓ Statement Rewritten"
                            ) : (
                              "Optimize Phrasing (+10 pts)"
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">
                          AI Suggestion:
                        </strong>{" "}
                        Recruiters and ATS bots scan for metrics-oriented
                        accomplishments. Quantifying achievements and using
                        active verbs increase interview callback rates by up to
                        40%.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-8 pt-5 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-muted-foreground font-medium text-center sm:text-left">
                Ready to optimize your actual resume score for free?
              </p>

              <button
                onClick={() => {
                  if (isAuthenticated) {
                    router.push("/dashboard");
                  } else {
                    openAuth("register");
                  }
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-primary-foreground text-xs font-extrabold px-5 py-3 rounded-xl transition-all shadow-md shadow-primary/10 active:scale-95"
              >
                Scan Your Resume Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL RESUME PREVIEWS SECTION */}
      <section
        id="previews"
        className="py-20 w-full max-w-7xl mx-auto px-6 relative border-t border-border bg-card/10"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 rounded-3xl blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          {/* Controls Column (3 cols) */}
          <div className="lg:col-span-3 space-y-6 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="space-y-3 flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold">
                <Sparkles className="w-3.5 h-3.5" /> High-Fidelity Output
                Previews
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
                Designed for ATS, <br />
                <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent px-1">
                  Perfected for Humans
                </span>
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
                ResumeCopilot generates industry-standard, high-scoring
                structures that bypass automated gatekeepers while looking
                stunning to recruiters. Customize the accent color theme below
                to preview the output.
              </p>
            </div>

            {/* Color Swatch Selectors */}
            <div className="space-y-2 w-full">
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground block text-center lg:text-left">
                Accent Color Theme
              </span>
              <div className="flex gap-2 items-center justify-center lg:justify-start">
                {[
                  { id: "purple", color: "bg-indigo-600", label: "Indigo" },
                  { id: "blue", color: "bg-blue-600", label: "Blue" },
                  { id: "emerald", color: "bg-emerald-600", label: "Emerald" },
                  { id: "amber", color: "bg-amber-500", label: "Amber" },
                  { id: "rose", color: "bg-rose-600", label: "Rose" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() =>
                      setSelectedResumeColor(
                        c.id as
                          | "purple"
                          | "blue"
                          | "emerald"
                          | "amber"
                          | "rose",
                      )
                    }
                    className={`w-6 h-6 rounded-full ${c.color} flex items-center justify-center transition-all duration-300 relative ${
                      selectedResumeColor === c.id
                        ? "ring-2 ring-offset-2 ring-primary ring-offset-background scale-110"
                        : "hover:scale-105"
                    }`}
                    title={c.label}
                    aria-label={`Select ${c.label} theme`}
                  >
                    {selectedResumeColor === c.id && (
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2 w-full">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    router.push(
                      `/builder/new?template=${selectedTemplate}&color=${selectedResumeColor}`,
                    );
                  } else {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("pendingTemplateRedirect", "true");
                    }
                    openAuth("register");
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground text-xs font-extrabold px-4 py-3 rounded-xl transition-all shadow-lg hover:shadow-primary/20"
              >
                Use This Template Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Preview Document Column (6 cols) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl border border-border bg-slate-950 p-1.5 shadow-2xl">
              {/* Window Header Decorator */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/80 text-muted-foreground text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500/80" />
                  <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                  <span className="w-2 h-2 rounded-full bg-green-500/80" />
                </div>
                <span>resume_preview_{selectedTemplate}.pdf</span>
                <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded font-sans">
                  100% ATS Optimized
                </span>
              </div>

              {/* The Simulated Document Paper */}
              <div className="bg-white text-slate-900 rounded-xl overflow-hidden shadow-inner relative max-h-[550px] overflow-y-auto p-8 font-sans antialiased text-left select-none scrollbar-thin">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTemplate + selectedResumeColor}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    {renderResumeTemplate(
                      selectedTemplate,
                      selectedResumeColor,
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Guide Overlay indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-border/60 backdrop-blur-xs text-[9px] text-muted-foreground font-semibold flex items-center gap-1.5 shadow-lg animate-bounce z-20 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span>Hover resume parts to see Live AI Diagnostics</span>
              </div>
            </div>
          </div>

          {/* Live AI Diagnostic Panel Column (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card rounded-2xl p-5 border border-border flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border/55 pb-3">
                <Brain className="w-5 h-5 text-primary animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">
                    Live AI Auditor
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Real-time ATS parsing diagnostics
                  </p>
                </div>
              </div>

              {/* Dial/Score representation */}
              <div className="flex flex-col items-center py-2 bg-muted/20 rounded-xl border border-border/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                <div className="relative w-20 h-20 flex items-center justify-center">
                  {/* Gauge SVG */}
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-muted/20"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary transition-all duration-500 ease-out"
                      strokeDasharray="94, 100"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-lg font-black text-foreground">
                      94
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      /100
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-emerald-400 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400 animate-bounce" />{" "}
                  Elite Rank Status
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2 text-[10px]">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground block mb-1">
                  Standard Checkpoints
                </span>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Layout Parsing: Compatible</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Contact Information: Validated</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Section Hierarchy: Standardized</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Keyword Descriptors: Match</span>
                </div>
              </div>

              {/* Dynamic Insights Console */}
              <div className="border border-border bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl font-mono text-[9.5px] leading-relaxed min-h-[145px] flex flex-col justify-between transition-all">
                <AnimatePresence mode="wait">
                  {!hoveredItem ? (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-muted-foreground/85 text-left space-y-1.5 flex-1 flex flex-col justify-center"
                    >
                      <div className="text-primary font-bold">
                        &gt;_ Parser Idle
                      </div>
                      <p className="text-[9px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                        Hover over any section of the resume (summary, skills,
                        specific bullets, projects, education) to run live
                        parser diagnostics.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={hoveredItem}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-left space-y-1 flex-1"
                    >
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        &gt;_{" "}
                        {hoveredItem === "summary"
                          ? "Summary Checked"
                          : hoveredItem === "skills"
                            ? "Keywords Checked"
                            : hoveredItem === "projects"
                              ? "Projects Checked"
                              : hoveredItem === "education"
                                ? "Education Checked"
                                : hoveredItem === "certifications"
                                  ? "Credentials Checked"
                                  : hoveredItem === "metrics"
                                    ? "Metrics Audit"
                                    : `Bullet ${hoveredItem.replace("bullet", "")} Audited`}
                      </div>
                      <p className="text-[9px] font-sans text-slate-600 dark:text-slate-300 leading-normal mt-1">
                        {hoveredItem === "summary"
                          ? "90-word professional summary successfully matched. The parsed sentence structures contain a rich keyword density for 'AI/ML & Data Science Engineer' positions."
                          : hoveredItem === "skills"
                            ? "Found 28 core matching competency keys. Complete alignment with Python, TypeScript, PyTorch, n8n, MySQL, Git, and Docker deployment parameters. Core index match: 100%."
                            : hoveredItem === "projects"
                              ? "Engineering projects successfully categorized. Extracted tech tokens ('Numpy, Panda, Scikit Learn, Pytorch') mapped to core competence index. ATS rank: High."
                              : hoveredItem === "education"
                                ? "IIT Kanpur & Gcet Kashmir academic credentials verified. Verified timeline and standard hierarchy layout parsed with 100% compliance."
                                : hoveredItem === "certifications"
                                  ? "Verified professional NIELIT and INTERNSHALA certifications detected. Machine learning and cybersecurity validation checks passed."
                                  : hoveredItem === "metrics"
                                    ? "Highly impactful quantitative metrics parsed. Scale indices (99.4% precision, +25% efficiency, GATE AIR 2604) show strong engineering value. Score tier: Elite."
                                    : hoveredItem === "bullet1"
                                      ? "AI Automation statement: 'n8n, OpenAI, Google Sheets, Telegram' tools parsed. Focuses on multi-step workflow automation. Impact rating: High."
                                      : hoveredItem === "bullet2"
                                        ? "AI Automation statement: 'AI Agents, webhooks, conditional logic' keywords parsed. Quantified efficiency metric: '+25% operational efficiency increase'. Compliance check: PASS."
                                        : hoveredItem === "bullet3"
                                          ? "AI Automation statement: No-Code and Vibe Coding keywords ('Lovable, Bolt, Glide') parsed. Front-end capability matched. Impact rating: High."
                                          : hoveredItem === "bullet4"
                                            ? "Senior statement: Strong action verb 'Led' parsed. Team metrics: '5 backend developers'. Capacity metrics: '30k to 120k+ DAU' parsed successfully."
                                            : hoveredItem === "bullet5"
                                              ? "Senior statement: Database engineering 'PostgreSQL read-replicas' parsed. Performance metric: '45% throughput increase'. Compliance check: PASS."
                                              : hoveredItem === "bullet6"
                                                ? "Senior statement: CI/CD metrics parsed. Velocity improvement metric: 'lowering build times from 40 to 6 minutes'. Verb 'Integrated' matches database keys."
                                                : hoveredItem === "bullet7"
                                                  ? "Intern statement: Front-end 'React, telemetry, internal dashboard' keywords indexed. Metrics: '15% internal reporting speed increase'. Compliance check: PASS."
                                                  : hoveredItem === "bullet8"
                                                    ? "Intern statement: Node.js/Express REST APIs and system resolution 'resolving query bottlenecks' verified. Strong keyword score."
                                                    : "Selected block successfully audited. Formatting compliance checks out. 0 warnings detected."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {hoveredItem && (
                  <div className="text-[8px] text-muted-foreground/60 border-t border-border/30 pt-1 mt-2 font-mono flex items-center justify-between">
                    <span>STATUS: 0 WARNINGS</span>
                    <span>100% ATS PARSED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX SECTION */}
      <section
        id="comparison"
        className="py-20 w-full max-w-7xl mx-auto px-6 relative overflow-hidden"
      >
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Side-by-Side Comparison
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Standard Builders vs. ResumeCopilot
          </h2>
          <p className="text-muted-foreground text-sm">
            Discover why candidates using our intelligent ecosystem bypass ATS
            barriers and land interviews faster.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="w-full max-w-full relative z-10 overflow-x-auto rounded-2xl border border-border/80 bg-card/30 backdrop-blur-md shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="p-6 text-sm font-bold text-foreground">
                  Core Capability
                </th>
                <th className="p-6 text-sm font-bold text-muted-foreground">
                  Standard Resume Builders
                </th>
                <th className="p-6 text-sm font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />{" "}
                  ResumeCopilot
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                {
                  feature: "ATS Compliance Auditing",
                  standard:
                    "Basic spelling check; lacks parser compliance diagnostics",
                  copilot:
                    "Real-time compliance checks for headers, columns, and contact indices",
                  highlight: false,
                },
                {
                  feature: "Semantic Keyword Match",
                  standard: "Manual comparison; no job description parsing",
                  copilot:
                    "Deep semantic analysis comparing resume keywords against target job description",
                  highlight: true,
                },
                {
                  feature: "AI Experience Phrasing",
                  standard: "Static templates with standard filler phrasing",
                  copilot:
                    "One-click contextual bullet rewriter focusing on metric impact and action verbs",
                  highlight: true,
                },
                {
                  feature: "Layout Stability Guarantee",
                  standard:
                    "Columns and tables frequently break in parsing systems",
                  copilot:
                    "100% compliant structures engineered specifically for parser alignment",
                  highlight: false,
                },
                {
                  feature: "End-to-End Prep Tools",
                  standard: "Only generates static documents",
                  copilot:
                    "Tailored mock interview prep engines and customized cover letter utilities",
                  highlight: true,
                },
                {
                  feature: "Pipeline Tracker",
                  standard: "None; requires separate tracking sheets",
                  copilot:
                    "Integrated Kanban tracking board mapping job targets directly",
                  highlight: false,
                },
              ].map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors duration-200 ${
                    row.highlight
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/20"
                  }`}
                >
                  <td className="p-6 font-bold text-sm text-foreground">
                    {row.feature}
                  </td>
                  <td className="p-6 text-xs text-muted-foreground/80 leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <span className="p-0.5 rounded-full bg-destructive/10 text-destructive mt-0.5 shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </span>
                      <span>{row.standard}</span>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-foreground leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <span className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className={row.highlight ? "font-semibold" : ""}>
                        {row.copilot}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


      {/* FAQ SECTION */}
      <section id="faq" className="py-20 w-full max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Find answers to the most common questions about the platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-border rounded-xl bg-card overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 flex items-center justify-between text-left font-semibold text-base focus:outline-none hover:bg-muted/10 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                    activeFaq === idx ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 pt-0 text-sm text-muted-foreground border-t border-border/50">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-border bg-card/60 backdrop-blur-md py-16 relative overflow-hidden mt-auto">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[200px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-y-10 gap-x-8 lg:gap-12 relative z-10">
          {/* Column 1: Brand Info & Tagline (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="flex items-center gap-2.5 group cursor-default">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="font-extrabold text-xl tracking-normal bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
                ResumeCopilot
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              An intelligent, ATS-optimized Career Assistant designed to scan
              resumes, analyze match scoring, write target cover letters, and
              simulate live mock interviews.
            </p>
            <div className="text-xs text-muted-foreground font-medium pl-1">
              Part of the{" "}
              <a
                href="https://zakirrashid.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline hover:text-primary-hover transition-colors font-semibold"
              >
                zakirrashid.in
              </a>{" "}
              AI Ecosystem
            </div>
          </div>

          {/* Column 2: Platform Links (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium pl-1">
              <li>
                <a
                  href="#templates"
                  className="hover:text-primary transition-colors"
                >
                  AI Templates
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  ATS Score Checker
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  JD Matcher
                </a>
              </li>

              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  FAQs &amp; Help
                </a>
              </li>
              <li>
                <a
                  href="/donate"
                  className="hover:text-rose-400 text-rose-500 font-semibold transition-colors"
                >
                  Donate &amp; Support ❤️
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: The Developer Showcase Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Meet The Architect
            </h4>
            <div className="p-4 rounded-xl border border-border bg-card/40 backdrop-blur-xs hover:border-primary/30 hover:bg-card/60 transition-all duration-300 group shadow-sm max-w-md">
              <div className="flex gap-3.5 items-center">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-secondary opacity-50 blur-sm scale-105 group-hover:opacity-100 transition-opacity duration-300" />
                  <img
                    src="https://avatars.githubusercontent.com/u/122608506?v=4"
                    alt="Zakir Rashid"
                    className="relative w-12 h-12 rounded-full border-2 border-border object-cover scale-100 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="font-extrabold text-foreground group-hover:text-primary transition-colors text-sm block">
                    Zakir Rashid
                  </span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    AI/ML Systems &amp; Data Science Engineer. Specializes in
                    building deep neural networks.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-1">
                {[
                  {
                    name: "PyTorch",
                    color:
                      "hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/20",
                  },
                  {
                    name: "OpenCV",
                    color:
                      "hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20",
                  },
                  {
                    name: "FastAPI",
                    color:
                      "hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20",
                  },
                  {
                    name: "AI Agents",
                    color:
                      "hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/20",
                  },
                ].map((skill) => (
                  <span
                    key={skill.name}
                    className={`px-1.5 py-0.5 rounded text-[8px] bg-muted/40 border border-border/60 text-muted-foreground font-bold cursor-default transition-all duration-300 ${skill.color}`}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <a
                  href="https://zakirrashid.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-primary font-bold hover:underline group/cta"
                >
                  <Globe className="w-3 h-3" />
                  <span>Portfolio Website</span>
                  <ChevronRight className="w-3 h-3 transform translate-x-0 group-hover/cta:translate-x-0.5 transition-transform" />
                </a>
                <span className="text-[9px] text-muted-foreground/60 italic font-semibold">
                  J&amp;K, IN
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Connect & Support (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Connect &amp; Legal
            </h4>
            <div className="grid grid-cols-1 gap-2 max-w-md">
              <a
                href="https://github.com/Zakir-Rashid1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/80 bg-card/25 text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group font-bold text-xs"
              >
                <svg
                  className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span className="flex-1 text-[11px]">
                  GitHub @Zakir-Rashid1
                </span>
              </a>
              <a
                href="https://www.linkedin.com/in/zakir-rashid-3a2862216/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/80 bg-card/25 text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group font-bold text-xs"
              >
                <svg
                  className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span className="flex-1 text-[11px]">LinkedIn Profile</span>
              </a>
              <a
                href="mailto:Work.ZakirRashid@gmail.com"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/80 bg-card/25 text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group font-bold text-xs"
              >
                <Mail className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="flex-1 text-[11px] truncate">
                  Work.ZakirRashid@gmail.com
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-xs text-muted-foreground font-medium">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} ResumeCopilot. Developed by{" "}
            <a
              href="https://zakirrashid.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors font-bold font-semibold"
            >
              Zakir Rashid
            </a>
            . All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-x-5 gap-y-2">
            <a
              href="#"
              className="hover:text-foreground hover:underline transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-foreground hover:underline transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="https://zakirrashid.in/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline transition-colors"
            >
              Contact Developer
            </a>
          </div>
        </div>
      </footer>

      {/* AUTH DIALOG MODAL (Light Dismiss Compatible) */}
      <dialog
        ref={authDialogRef}
        id="auth-dialog"
        className="fixed inset-0 m-auto max-w-md w-full h-fit rounded-xl border border-border p-6 shadow-2xl bg-card text-foreground backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-4">
          <div className="relative pb-3 border-b border-border text-center">
            <h3 className="font-extrabold text-xl tracking-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-6 py-1">
              {authSuccess && authMode === "forgot"
                ? "Success"
                : authMode === "login"
                  ? "Sign In to ResumeCopilot"
                  : authMode === "register"
                    ? "Create Your Account"
                    : "Recover Your Password"}
            </h3>
            <button
              onClick={closeAuth}
              className="absolute right-0 top-1.5 p-1 rounded hover:bg-muted text-muted-foreground text-sm font-semibold"
            >
              &times;
            </button>
          </div>

          {authSuccess && authMode === "forgot" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg
                width="84"
                height="84"
                viewBox="0 0 80 80"
                className="text-emerald-500"
              >
                {/* Circle path */}
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { type: "spring", duration: 0.75, bounce: 0 },
                    opacity: { duration: 0.01 },
                  }}
                />
                {/* Checkmark path */}
                <motion.path
                  d="M24 40 L35 50 L56 28"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: {
                      delay: 0.35,
                      type: "spring",
                      duration: 0.55,
                      bounce: 0,
                    },
                    opacity: { delay: 0.35, duration: 0.01 },
                  }}
                />
              </svg>

              <motion.h4
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.35 }}
                className="text-lg font-bold text-foreground mt-5 tracking-tight"
              >
                Password Reset Successfully!
              </motion.h4>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85, duration: 0.35 }}
                className="text-xs text-muted-foreground mt-2 font-medium"
              >
                Redirecting to login...
              </motion.p>
            </div>
          ) : (
            <>
              <form onSubmit={handleAuthSubmit}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={
                      authMode +
                      (authMode === "forgot"
                        ? forgotStep
                        : authMode === "register" && otpSent
                          ? "otp"
                          : "main")
                    }
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4 mt-2"
                  >
                    {/* ── Forgot Password: Step 1 — Enter Email ── */}
                    {authMode === "forgot" && forgotStep === "email" && (
                      <>
                        <div className="space-y-1 mt-1 text-center sm:text-left">
                          <p className="text-xs text-muted-foreground">
                            Enter your email and we&apos;ll email you a 6-digit
                            verification code to reset your password.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm"
                          />
                        </div>
                      </>
                    )}

                    {/* ── Forgot Password: Step 2 — Enter OTP & New Password ── */}
                    {authMode === "forgot" && forgotStep === "reset" && (
                      <>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center space-y-1">
                          <p className="text-xs font-semibold text-primary">
                            Reset code sent to
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {authEmail}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            6-Digit Verification Code
                          </label>
                          <input
                            type="text"
                            value={forgotOtp}
                            onChange={(e) => {
                              const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6);
                              setForgotOtp(val);
                            }}
                            placeholder="000000"
                            required
                            maxLength={6}
                            autoFocus
                            className="w-full px-3.5 py-3 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-center text-xl font-mono font-bold tracking-[0.5em]"
                          />
                          <p className="text-[10px] text-muted-foreground text-center">
                            Check your inbox for the code
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={forgotPassword}
                            onChange={(e) => setForgotPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Minimum 8 characters
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={forgotConfirmPassword}
                            onChange={(e) =>
                              setForgotConfirmPassword(e.target.value)
                            }
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setForgotStep("email");
                              setForgotOtp("");
                              setAuthError(null);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            ← Change email
                          </button>
                          <button
                            type="button"
                            onClick={handleSendResetOTP}
                            disabled={forgotCooldown > 0 || otpLoading}
                            className="text-xs text-primary hover:text-primary/80 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {forgotCooldown > 0
                              ? `Resend in ${forgotCooldown}s`
                              : "Resend Code"}
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── Register: Step 1 — Name, Email, Password ── */}
                    {authMode === "register" && !otpSent && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Password
                          </label>
                          <input
                            type="password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Minimum 8 characters
                          </p>
                        </div>
                      </>
                    )}

                    {/* ── Register: Step 2 — OTP Verification ── */}
                    {authMode === "register" && otpSent && (
                      <>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center space-y-1">
                          <p className="text-xs font-semibold text-primary">
                            Verification code sent to
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {authEmail}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            6-Digit Verification Code
                          </label>
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => {
                              const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6);
                              setOtpCode(val);
                            }}
                            placeholder="000000"
                            required
                            maxLength={6}
                            autoFocus
                            className="w-full px-3.5 py-3 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-center text-xl font-mono font-bold tracking-[0.5em]"
                          />
                          <p className="text-[10px] text-muted-foreground text-center">
                            Check your inbox (and spam folder) for the code
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCode("");
                              setAuthError(null);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            ← Change email
                          </button>
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={resendCooldown > 0 || otpLoading}
                            className="text-xs text-primary hover:text-primary/80 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {resendCooldown > 0
                              ? `Resend in ${resendCooldown}s`
                              : "Resend Code"}
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── Login: Email + Password ── */}
                    {authMode === "login" && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-muted-foreground">
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode("forgot");
                                setForgotStep("email");
                                setAuthError(null);
                              }}
                              className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <input
                            type="password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm"
                          />
                        </div>
                      </>
                    )}

                    {/* Alert Messages */}
                    {authError && (
                      <p className="text-xs text-destructive font-medium">
                        {authError}
                      </p>
                    )}

                    {authSuccess && (
                      <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {authMode === "forgot"
                          ? "Password reset successfully! Redirecting to login..."
                          : emailVerified
                            ? "Email verified! Account created. Redirecting..."
                            : "Authentication successful! Redirecting..."}
                      </p>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {otpLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : authMode === "login" ? (
                        "Sign In"
                      ) : authMode === "register" ? (
                        otpSent ? (
                          "Verify & Create Account"
                        ) : (
                          "Send Verification Code"
                        )
                      ) : forgotStep === "email" ? (
                        "Send Reset Code"
                      ) : (
                        "Reset Password"
                      )}
                    </button>

                    {/* Footer Switcher */}
                    <div className="text-center text-xs mt-2 text-muted-foreground">
                      {authMode === "login" ? (
                        <span>
                          New to the platform?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode("register");
                              resetOtpState();
                              setAuthError(null);
                            }}
                            className="text-primary hover:underline font-semibold focus:outline-none"
                          >
                            Sign Up
                          </button>
                        </span>
                      ) : authMode === "register" ? (
                        <span>
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode("login");
                              resetOtpState();
                              setAuthError(null);
                            }}
                            className="text-primary hover:underline font-semibold focus:outline-none"
                          >
                            Sign In
                          </button>
                        </span>
                      ) : (
                        <span>
                          Remembered your password?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode("login");
                              resetOtpState();
                              setAuthError(null);
                            }}
                            className="text-primary hover:underline font-semibold focus:outline-none"
                          >
                            Sign In
                          </button>
                        </span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </form>

              {/* Divider */}
              <div className="flex items-center my-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-2 font-bold">or continue with</span>
                <div className="flex-1 border-t border-border"></div>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/api/auth/oauth?provider=google";
                  }}
                  className="flex items-center justify-center py-2.5 rounded-lg border border-border bg-background hover:bg-accent/10 text-foreground text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
              </div>

            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
