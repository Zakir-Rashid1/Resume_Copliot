"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Sparkles, FileSearch, FileEdit, FileSignature, 
  Kanban, LogOut, Upload, FileText, Trash2, 
  Moon, Sun, ArrowRight, Award, BarChart2, Settings, ChevronDown
} from "lucide-react";
import { User, Resume, JobApplication } from "@/lib/db";

// Generate consistent avatar gradient from name
function getAvatarGradient(name: string): [string, string] {
  const palettes: [string, string][] = [
    ["#3b82f6", "#6366f1"],
    ["#10b981", "#0d9488"],
    ["#8b5cf6", "#ec4899"],
    ["#f59e0b", "#f97316"],
    ["#ef4444", "#e11d48"],
    ["#06b6d4", "#3b82f6"],
    ["#a855f7", "#7c3aed"],
    ["#22c55e", "#16a34a"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palettes[Math.abs(hash) % palettes.length];
}

export default function DashboardHub() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "light";
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Success checkmark animation states
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [animateSuccess, setAnimateSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check URL query parameters for successful login
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("login") === "success") {
        setTimeout(() => {
          setShowSuccessOverlay(true);
        }, 0);
      }
    }
  }, []);

  // Manage transition from loading spinner to checkmark success screen
  useEffect(() => {
    if (!loading && showSuccessOverlay) {
      setTimeout(() => {
        setAnimateSuccess(true);
      }, 0);
      const timer = setTimeout(() => {
        setShowSuccessOverlay(false);
        if (typeof window !== "undefined") {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [loading, showSuccessOverlay]);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // Load Session & Data
  useEffect(() => {
    async function loadData() {
      try {
        const authRes = await fetch("/api/auth");
        const authData = await authRes.json();
        
        if (authData.authenticated) {
          setUser(authData.user);
          
          // Load Resumes
          const resumesRes = await fetch("/api/resumes");
          const resumesData = await resumesRes.json();
          if (resumesData.success) {
            setResumes(resumesData.resumes);
          }

          // Load Applications
          const appRes = await fetch("/api/applications");
          const appData = await appRes.json();
          if (appData.success) {
            setApplications(appData.applications);
          }
        } else {
          // Guest Fallback
          setUser({ id: "guest-user", name: "Guest User", email: "guest@example.com" } as unknown as User);
          
          // Re-retrieve local storage resumes if any, or seed default
          const mockResume = {
            id: "mock-id",
            name: "Software Engineer Baseline.pdf",
            atsScore: 68,
            version: 1,
            updatedAt: new Date().toISOString()
          };
          setResumes([mockResume as unknown as Resume]);
          setApplications([
            { id: "app-1", company: "Google", status: "Applied" } as unknown as JobApplication,
            { id: "app-2", company: "Stripe", status: "Interview Scheduled" } as unknown as JobApplication
          ]);
        }
      } catch {
        setUser({ id: "guest-user", name: "Guest User", email: "guest@example.com" } as unknown as User);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Sign Out Handler
  const handleSignOut = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" })
    });
    router.push("/?logout=success");
  };

  // Upload Document Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/parse", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          setResumes(prev => [data.resume, ...prev]);
          // Go directly to checker
          router.push(`/check/${data.resume.id}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  // Delete Resume
  const handleDeleteResume = async (id: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        if (user?.id !== "guest-user") {
          await fetch(`/api/resumes/${id}`, { method: "DELETE" });
        }
        setResumes(prev => prev.filter(r => r.id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Create new resume from scratch
  const createNewResume = () => {
    // Generate dummy random id or lead to builder with "new" keyword
    router.push("/builder/new");
  };

  if (showSuccessOverlay) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-background text-foreground relative z-[9999] overflow-hidden">
        {/* Animated background subtle blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col items-center justify-center relative z-10 p-6 text-center">
          {!animateSuccess ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-semibold text-muted-foreground animate-pulse">Establishing secure session...</p>
            </div>
          ) : (
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
                  transition={{ pathLength: { type: "spring", duration: 0.75, bounce: 0 }, opacity: { duration: 0.01 } }}
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
                  transition={{ pathLength: { delay: 0.35, type: "spring", duration: 0.55, bounce: 0 }, opacity: { delay: 0.35, duration: 0.01 } }}
                />
              </svg>
              
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.35 }}
                className="text-2xl font-black text-foreground mt-5 tracking-tight"
              >
                Welcome Back, {user?.name || "User"}!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85, duration: 0.35 }}
                className="text-sm text-muted-foreground mt-1.5 font-medium"
              >
                Sync complete. Loading your dashboard...
              </motion.p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Syncing workspace...</p>
      </div>
    );
  }

  const highestScore = resumes.length > 0 ? Math.max(...resumes.map(r => r.atsScore)) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-extrabold text-lg tracking-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-1">
              ResumeCopilot
            </span>
          </div>

          <div className="flex items-center gap-4">

            {user?.id === "guest-user" && (
              <span className="hidden sm:inline-block bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs px-2.5 py-1 rounded font-semibold">
                Guest Mode
              </span>
            )}

            {/* Profile Avatar Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar || undefined}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shadow-md bg-white"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold select-none shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${getAvatarGradient(user?.name || "U")[0]}, ${getAvatarGradient(user?.name || "U")[1]})`,
                    }}
                  >
                    {(user?.name || "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl border border-border shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Info */}
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    {user?.avatar ? (
                      <img
                        src={user.avatar || undefined}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 bg-white"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 select-none"
                        style={{
                          background: `linear-gradient(135deg, ${getAvatarGradient(user?.name || "U")[0]}, ${getAvatarGradient(user?.name || "U")[1]})`,
                        }}
                      >
                        {(user?.name || "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{user?.name || "User"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email || ""}</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5">
                    <button
                      onClick={() => { setProfileOpen(false); router.push("/settings"); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); setTheme(theme === "dark" ? "light" : "dark"); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
                        <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                      </span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-border p-1.5">
                    <button
                      onClick={() => { setProfileOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-destructive/10 transition-colors text-left text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Resumes List & Scans */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* File scan action box */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-border shadow-sm flex flex-col gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base">Check Your Resume</h3>
              <p className="text-xs text-muted-foreground">Upload your PDF or Word document to get scored immediately.</p>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 disabled:opacity-50"
            >
              {uploadLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Upload & Parse File
                </>
              )}
            </button>

            <button 
              onClick={createNewResume}
              className="w-full border border-border hover:bg-muted/40 text-sm font-semibold py-2.5 rounded-lg text-center"
            >
              Build Resume From Scratch
            </button>
          </div>

          {/* Resumes checklist inventory */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-border shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-1.5 border-b border-border pb-2">
              <FileText className="w-4 h-4 text-primary" /> Your Resume Library ({resumes.length})
            </h3>

            {resumes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No resumes uploaded yet. Upload a file above to begin.</p>
            ) : (
              <div className="divide-y divide-border max-h-[300px] overflow-y-auto pr-1">
                {resumes.map(r => (
                  <div key={r.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-bold truncate text-foreground/90">{r.name}</p>
                        <p className="text-muted-foreground text-[10px] mt-0.5">
                          Score: {r.atsScore} | V{r.version} | {new Date(r.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => router.push(`/check/${r.id}`)}
                        className="text-primary hover:underline font-semibold"
                      >
                        Check
                      </button>
                      {r.sourceType !== "uploaded" && (
                        <button 
                          onClick={() => router.push(`/builder/${r.id}`)}
                          className="text-muted-foreground hover:text-foreground font-semibold"
                        >
                          Edit
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteResume(r.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: KPI Cards & Complete Career Copilot Tools Grid */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Max Score Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-border shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Best ATS Score</span>
                <p className="text-2xl font-black">{highestScore > 0 ? `${highestScore}/100` : "N/A"}</p>
              </div>
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Applications Track count */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-border shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Applications Tracked</span>
                <p className="text-2xl font-black">{applications.length}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Kanban className="w-6 h-6" />
              </div>
            </div>

            {/* Match Rate Success */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-border shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Conversion Rate</span>
                <p className="text-2xl font-black">
                  {applications.length > 0 
                    ? `${Math.round((applications.filter(a => a.status !== "Applied").length / applications.length) * 100)}%` 
                    : "0%"}
                </p>
              </div>
              <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-500">
                <BarChart2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Tools Grid layout */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-xl tracking-tight text-foreground/90">Career Assistant Tools</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tool 1: Checker */}
              <div 
                onClick={() => {
                  if (resumes.length > 0) {
                    router.push(`/check/${resumes[0].id}`);
                  } else {
                    alert("Please upload a resume first using the file parse loader!");
                  }
                }}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary/50 hover:shadow transition-all group flex items-start gap-4"
              >
                <div className="p-3 rounded-lg bg-sky-500/10 text-sky-500 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-base text-foreground/90 flex items-center gap-1">
                    Resume Checker <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Check your resume for formatting errors, missing keywords, and weak action bullet points.
                  </p>
                </div>
              </div>

              {/* Tool 2: Builder */}
              <div 
                onClick={() => {
                  const builtResumes = resumes.filter(r => r.sourceType !== "uploaded");
                  if (builtResumes.length > 0) {
                    router.push(`/builder/${builtResumes[0].id}`);
                  } else {
                    router.push("/builder/new");
                  }
                }}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary/50 hover:shadow transition-all group flex items-start gap-4"
              >
                <div className="p-3 rounded-lg bg-pink-500/10 text-pink-500 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-base text-foreground/90 flex items-center gap-1">
                    Resume Builder <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Build professional, structured resumes from scratch using clean templates.
                  </p>
                </div>
              </div>

              {/* Tool 3: Matcher */}
              <div 
                onClick={() => {
                  if (resumes.length > 0) {
                    router.push(`/matcher/${resumes[0].id}`);
                  } else {
                    alert("Please upload a resume first!");
                  }
                }}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary/50 hover:shadow transition-all group flex items-start gap-4"
              >
                <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-base text-foreground/90 flex items-center gap-1">
                    Job Match Analyzer <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Compare your resume against any target job listing to find gaps and overlaps.
                  </p>
                </div>
              </div>

              {/* Tool 4: Cover Letter */}
              <div 
                onClick={() => router.push("/cover-letters")}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary/50 hover:shadow transition-all group flex items-start gap-4"
              >
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-base text-foreground/90 flex items-center gap-1">
                    Cover Letter Writer <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Generate tailored, professional cover letters instantly for each application.
                  </p>
                </div>
              </div>

              {/* Tool 5: LinkedIn */}
              <div 
                onClick={() => router.push("/linkedin")}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary/50 hover:shadow transition-all group flex items-start gap-4"
              >
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-base text-foreground/90 flex items-center gap-1">
                    LinkedIn Optimizer <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Optimize your LinkedIn headlines and profile summary to attract recruiters.
                  </p>
                </div>
              </div>

              {/* Tool 6: Tracker */}
              <div 
                onClick={() => router.push("/tracker")}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary/50 hover:shadow transition-all group flex items-start gap-4"
              >
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Kanban className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-base text-foreground/90 flex items-center gap-1">
                    Application Tracker <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Manage your pipeline on a Kanban board and view hiring conversion charts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden File Input */}
      <input 
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        accept=".pdf,.docx,.txt"
        className="hidden"
      />
    </div>
  );
}
