"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, CheckCircle, AlertTriangle, Sparkles, 
  ChevronLeft, ChevronRight, Download, Check, Edit2,
  Sun, Moon, ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { Resume, AISuggestion } from "@/lib/db";
import ResumePreview from "@/components/ResumePreview";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumeChecker({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // App States
  const [resume, setResume] = useState<Resume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<"tech" | "minimal" | "executive" | "creative">("tech");
  const [selectedResumeColor, setSelectedResumeColor] = useState<"purple" | "blue" | "emerald" | "amber" | "rose">("purple");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stepState, setStepState] = useState<"loading" | "completed">("loading");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "light";
  });

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");

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

  // Wizard Steps: contact -> summary -> experience -> skills -> formatting -> final
  const steps = ["contact", "summary", "experience", "skills", "formatting", "final"] as const;
  const [currentStepIdx, setCurrentStepIdx] = useState(2); // start on experience (highly active)
  
  // Editing focus states
  const [editingText, setEditingText] = useState("");
  const [focusedSuggestionId, setFocusedSuggestionId] = useState<string | null>(null);

  // Active step key name
  const currentStep = steps[currentStepIdx];

  const getUpgradedScore = () => {
    if (!resume) return 0;
    const currentSub = (resume.subscores as any) || {};
    const nextSub = { ...currentSub, formatting: 98 };
    return Math.round(
      ((nextSub.compatibility || 90) * 0.15) +
      ((nextSub.keywordMatch || 80) * 0.15) +
      ((nextSub.formatting || 85) * 0.1) +
      ((nextSub.readability || 80) * 0.1) +
      ((nextSub.impact || 75) * 0.15) +
      ((nextSub.skills || 75) * 0.15) +
      ((nextSub.projects || 80) * 0.1) +
      ((nextSub.education || 80) * 0.1)
    );
  };

  // Fetch Resume
  useEffect(() => {
    async function loadResume() {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        const data = await res.json();
        if (data.success && data.resume) {
          setResume(data.resume);
          if (data.resume.sourceType === "uploaded") {
            setCurrentStepIdx(5);
          }
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error(err);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadResume();
  }, [id, router]);

  // Read scan=true query parameter on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("scan") === "true") {
        setScanProgress(0);
        setActiveStep(0);
        setStepState("loading");
        setIsScanning(true);
        // Clear scan query parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Scanner progress animation loop and calculation trigger
  useEffect(() => {
    if (!isScanning) return;
    if (loading) return; // Wait until resume data is loaded

    setScanProgress(0);
    setActiveStep(0);
    setStepState("loading");

    // Animate progress smoothly over 12 seconds using elapsed time
    const startTime = Date.now();
    const duration = 12000; // 12 seconds
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let progress = 0;
      if (elapsed < duration) {
        progress = (elapsed / duration) * 95;
      } else {
        // Slowly creep from 95 to 99 over an extra 20 seconds to keep the bar moving
        const extraTime = elapsed - duration;
        progress = 95 + Math.min((extraTime / 20000) * 4, 4);
      }
      setScanProgress(Math.floor(progress));
    }, 100);

    let currentStep = 0;
    let apiCompleted = false;
    let apiData: Resume | null = null;

    const runStepSequence = () => {
      setStepState("loading");
      setTimeout(() => {
        setStepState("completed");
        setTimeout(() => {
          currentStep += 1;
          if (currentStep < 6) {
            setActiveStep(currentStep);
            runStepSequence();
          } else {
            // Reached last step sequence, now wait for API response
            const checkApiFinished = setInterval(() => {
              if (apiCompleted) {
                clearInterval(checkApiFinished);
                setScanProgress(100);
                setTimeout(() => {
                  if (apiData) {
                    setResume(apiData);
                  }
                  setIsScanning(false);
                  confetti({ particleCount: 100, spread: 70 });
                }, 500);
              }
            }, 100);
          }
        }, 500);
      }, 1500);
    };

    runStepSequence();

    // Trigger calculation in the background
    async function triggerAnalysis() {
      try {
        const res = await fetch(`/api/resumes/${id}?analyze=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: resume?.name,
            content: resume?.content
          })
        });
        const data = await res.json();
        if (data.success && data.resume) {
          apiData = data.resume;
        }
      } catch (err) {
        console.error("Analysis failed", err);
      } finally {
        apiCompleted = true;
      }
    }

    triggerAnalysis();

    return () => {
      clearInterval(progressInterval);
    };
  }, [isScanning, loading]);

  // Load editing text when selecting a suggestion
  const selectSuggestion = (s: AISuggestion) => {
    setFocusedSuggestionId(s.id);
    setEditingText(s.originalText || "");
  };

  // Perform "Auto-Fix" in editor
  const applyAutoFixText = (s: AISuggestion) => {
    if (s.suggestedText) {
      setEditingText(s.suggestedText);
    }
  };

  // Save changes to the backend
  const saveTextEdit = async (s: AISuggestion) => {
    if (!resume) return;
    setSaveLoading(true);

    try {
      // Create new experience array
      const updatedExp = resume.content.experience.map(exp => {
        const updatedDesc = exp.description.map(bullet => {
          if (bullet.trim() === s.originalText?.trim()) {
            return editingText;
          }
          return bullet;
        });
        return { ...exp, description: updatedDesc };
      });

      const updatedContent = {
        ...resume.content,
        experience: updatedExp
      };

      const updatedSuggestions = resume.suggestions.filter(sug => sug.id !== s.id);
      const currentSub = (resume.subscores as any) || {};
      const nextSub = { ...currentSub };
      
      if (s.category === "Quantifiable Results") {
        nextSub.impact = Math.min(100, (nextSub.impact || 60) + 12);
      } else if (s.category === "Readability") {
        nextSub.readability = Math.min(100, (nextSub.readability || 60) + 15);
      } else {
        nextSub.compatibility = Math.min(100, (nextSub.compatibility || 70) + 5);
      }

      const nextAtsScore = Math.round(
        ((nextSub.compatibility || 90) * 0.15) +
        ((nextSub.keywordMatch || 80) * 0.15) +
        ((nextSub.formatting || 85) * 0.1) +
        ((nextSub.readability || 80) * 0.1) +
        ((nextSub.impact || 75) * 0.15) +
        ((nextSub.skills || 75) * 0.15) +
        ((nextSub.projects || 80) * 0.1) +
        ((nextSub.education || 80) * 0.1)
      );

      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: updatedContent,
          suggestions: updatedSuggestions,
          atsScore: nextAtsScore,
          subscores: nextSub
        })
      });
      const data = await res.json();

      if (data.success && data.resume) {
        setResume(data.resume);
        setFocusedSuggestionId(null);
        setEditingText("");
        
        if (data.resume.atsScore > resume.atsScore) {
          confetti({ particleCount: 50, spread: 60 });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRecalculateScore = async () => {
    if (!resume) return;
    setIsScanning(true);
  };

  // Accept All Experience fixes at once
  const fixAllExperience = async () => {
    if (!resume) return;
    setSaveLoading(true);

    try {
      let updatedExp = [...resume.content.experience];
      
      resume.suggestions.forEach(suggestion => {
        if (suggestion.section === "experience" && suggestion.originalText && suggestion.suggestedText) {
          updatedExp = updatedExp.map(exp => {
            const updatedDesc = exp.description.map(bullet => {
              if (bullet.trim() === suggestion.originalText?.trim()) {
                return suggestion.suggestedText || bullet;
              }
              return bullet;
            });
            return { ...exp, description: updatedDesc };
          });
        }
      });

      const updatedContent = {
        ...resume.content,
        experience: updatedExp
      };

      const updatedSuggestions = resume.suggestions.filter(sug => sug.section !== "experience");
      const currentSub = (resume.subscores as any) || {};
      const nextSub = { ...currentSub };

      resume.suggestions.forEach(s => {
        if (s.section === "experience") {
          if (s.category === "Quantifiable Results") {
            nextSub.impact = Math.min(100, (nextSub.impact || 60) + 12);
          } else if (s.category === "Readability") {
            nextSub.readability = Math.min(100, (nextSub.readability || 60) + 15);
          } else {
            nextSub.compatibility = Math.min(100, (nextSub.compatibility || 70) + 5);
          }
        }
      });

      const nextAtsScore = Math.round(
        ((nextSub.compatibility || 90) * 0.15) +
        ((nextSub.keywordMatch || 80) * 0.15) +
        ((nextSub.formatting || 85) * 0.1) +
        ((nextSub.readability || 80) * 0.1) +
        ((nextSub.impact || 75) * 0.15) +
        ((nextSub.skills || 75) * 0.15) +
        ((nextSub.projects || 80) * 0.1) +
        ((nextSub.education || 80) * 0.1)
      );

      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: updatedContent,
          suggestions: updatedSuggestions,
          atsScore: nextAtsScore,
          subscores: nextSub
        })
      });
      const data = await res.json();

      if (data.success && data.resume) {
        setResume(data.resume);
        confetti({ particleCount: 100, spread: 80 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  // Compile A4 PDF via puppeteer from the paper-sheet template.
  const handleDownload = async () => {
    if (!resume) return;

    if (resume.id === "mock-id") {
      window.print();
      return;
    }

    setDownloadLoading(true);
    setDownloadStatus("Connecting to compiler...");
    
    try {
      setTimeout(() => setDownloadStatus("Compiling template designs..."), 700);
      setTimeout(() => setDownloadStatus("Polishing layout margins..."), 1500);

      const res = await fetch(`/api/resumes/${resume.id}/pdf`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = `${resume.name.replace(/[^a-zA-Z0-9\s-]/g, "").trim() || "resume"}.pdf`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setDownloadStatus("Success!");
        confetti({ particleCount: 50, spread: 45 });
        return;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadLoading(false);
      setDownloadStatus("");
    }

    // Direct fallback to print route (prevents browser popup blocker issues)
    window.location.href = `/print/${resume.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Analyzing document parameters...</p>
      </div>
    );
  }

  if (!resume) return null;

  if (isScanning) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-200">
        {/* Cybernetic decorative backgrounds */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 dark:bg-accent/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl text-center space-y-8 relative z-10">
          {/* Beautiful scanning circle with glow */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent opacity-20 blur-md animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-transparent border-t-primary border-r-accent animate-spin [animation-duration:3s]" />
            <div className="absolute inset-3 rounded-full border border-primary/10 animate-ping [animation-duration:2s]" />
            <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-primary shadow-inner">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>

          {/* Progress Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-end text-[10px] tracking-wider font-mono text-slate-550 dark:text-slate-400">
              <span className="font-bold">ATS COMPLIANCE AUDIT</span>
              <span className="font-black text-sm text-primary">{scanProgress}%</span>
            </div>
            <div className="w-full h-1 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-purple-500 to-accent transition-all duration-100 ease-out rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          {/* Single Active Action Display */}
          <div className="h-16 flex items-center justify-center overflow-hidden relative border-t border-slate-200 dark:border-slate-800/60 pt-4">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeStep + "-" + stepState}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex items-center gap-3 text-xs font-semibold text-slate-800 dark:text-slate-200 justify-center"
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  {stepState === "completed" ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    </motion.div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  )}
                </div>
                <span className="tracking-wide">
                  {[
                    "Parsing Contact Information",
                    "Scanning Professional Summary",
                    "Auditing Work Experience Details",
                    "Evaluating Technical Skills & Keywords",
                    "Verifying Layout & Formatting Rules",
                    "Compiling Compatibility ATS Score"
                  ][activeStep]}
                  {stepState === "loading" ? "..." : " Complete!"}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Filter suggestions for the current wizard step
  const stepSuggestions = resume.suggestions.filter(s => {
    const section = s.section?.toLowerCase() || "";
    const category = s.category?.toLowerCase() || "";
    
    if (currentStep === "contact") {
      return (
        section === "personalinfo" || 
        section === "general" || 
        section === "contact" || 
        category.includes("contact") || 
        category.includes("personal")
      );
    }
    if (currentStep === "summary") {
      return (
        section === "summary" || 
        section === "objective" || 
        category.includes("summary") || 
        category.includes("overview")
      );
    }
    if (currentStep === "experience") {
      return (
        section === "experience" || 
        section === "projects" || 
        section === "education" || 
        section === "certifications" || 
        section === "achievements" ||
        category.includes("experience") ||
        category.includes("project") ||
        category.includes("education") ||
        category.includes("achievement") ||
        category.includes("date") ||
        category.includes("result") ||
        category.includes("verb")
      );
    }
    if (currentStep === "skills") {
      return (
        section === "skills" || 
        section === "keywords" || 
        category.includes("skill") || 
        category.includes("keyword") ||
        category.includes("technical")
      );
    }
    if (currentStep === "formatting") {
      return (
        section === "formatting" || 
        section === "layout" || 
        section === "margins" || 
        category.includes("formatting") || 
        category.includes("margin") || 
        category.includes("layout") || 
        category.includes("font") || 
        category.includes("structure")
      );
    }
    return false;
  });

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      
      {/* Top Wizard Navigation */}
      <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/dashboard")}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="border-l border-border pl-3">
              <span className="font-bold text-sm text-foreground block truncate max-w-[200px]">{resume.name}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">ATS Resume Checker</span>
            </div>
          </div>

          {/* Steps Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="text-primary">1. Upload</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-extrabold border-b-2 border-primary pb-0.5">2. Check Optimization</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>3. Export</span>
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

            {resume.sourceType === "uploaded" ? (
              <button 
                onClick={() => router.push(`/builder/new?template=${selectedTemplate}&color=${selectedResumeColor}`)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Use Professional Template</span>
              </button>
            ) : (
              <button 
                onClick={handleDownload}
                disabled={downloadLoading}
                className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow disabled:opacity-85"
              >
                {downloadLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span>{downloadStatus || "Compiling PDF..."}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden w-full relative print:block print:bg-white print:overflow-visible">
        
        {/* LEFT PANE: Resume Paper Canvas or Interactive Template Promotion */}
        <section className="flex-1 overflow-y-auto flex flex-col items-center bg-muted/30 p-6 relative print:bg-white print:p-0 print:overflow-visible scroll-panel">
          {resume.sourceType === "uploaded" ? (
            <div className="w-full max-w-[800px] flex flex-col gap-6 relative pb-24">
              
              {/* Floating Top Control Panel */}
              <div className="sticky top-0 z-35 w-full p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-border shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-300">
                {/* Template choices */}
                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block text-center sm:text-left">Template Style</span>
                  <div className="flex bg-muted/60 p-1 rounded-xl gap-1 justify-center">
                    {[
                      { id: "tech", label: "Modern Tech" },
                      { id: "minimal", label: "Clean Minimal" },
                      { id: "executive", label: "Sleek Executive" },
                      { id: "creative", label: "Bold Creative" },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id as any)}
                        className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all ${
                          selectedTemplate === tpl.id
                            ? "bg-card text-foreground shadow-sm scale-[1.03]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color choices */}
                <div className="flex flex-col gap-1.5 w-full sm:w-auto items-center sm:items-start shrink-0">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Accent Color</span>
                  <div className="flex items-center gap-2 py-1.5">
                    {[
                      { id: "purple", color: "bg-purple-600" },
                      { id: "blue", color: "bg-blue-600" },
                      { id: "emerald", color: "bg-emerald-600" },
                      { id: "amber", color: "bg-amber-600" },
                      { id: "rose", color: "bg-rose-600" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedResumeColor(c.id as any)}
                        className={`w-5.5 h-5.5 rounded-full ${c.color} flex items-center justify-center transition-all ${
                          selectedResumeColor === c.id
                            ? "ring-2 ring-offset-2 ring-primary ring-offset-background scale-110"
                            : "hover:scale-105"
                        }`}
                        title={c.id}
                      >
                        {selectedResumeColor === c.id && (
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* The Live Interactive Paper Sheet */}
              <div className="w-full flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTemplate + selectedResumeColor}
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -15 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="paper-sheet w-full p-12 text-zinc-900 bg-white shadow-2xl rounded-xl border border-border/60 overflow-hidden relative select-none"
                  >
                    <ResumePreview
                      data={resume.content}
                      template={selectedTemplate}
                      color={selectedResumeColor}
                      margins="normal"
                      suggestions={resume.suggestions}
                      currentStep={currentStep}
                      onSelectSuggestion={selectSuggestion}
                      isInteractive={false}
                    />

                    {/* Locked Gradient Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none z-10" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Floating Glassmorphic Callout */}
              <div className="absolute bottom-4 left-4 right-4 p-5 rounded-2xl border border-white/20 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl z-30 flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-300 hover:-translate-y-1">
                <div className="space-y-1 text-left">
                  <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span>Recruiter-Approved Layout</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm">
                    This is a live template preview of your parsed resume. Use this professional design to customize, fix remaining formatting issues, and export your PDF.
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/builder/new?template=${selectedTemplate}&color=${selectedResumeColor}`)}
                  className="bg-primary hover:bg-primary/95 text-white text-xs font-black px-5 py-3 rounded-xl shadow-lg transition-all shrink-0 hover:shadow-primary/20 flex items-center gap-1.5"
                >
                  <span>Build Resume with this Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 print:p-0 print:block w-full flex justify-center">
              {(() => {
                const margins = (resume.content.margins || "normal") as "narrow" | "normal" | "wide";
                const paddingClass = {
                  narrow: "p-8",
                  normal: "p-12",
                  wide: "p-16",
                }[margins];
                return (
                  <div className={`paper-sheet w-full max-w-[800px] min-h-[1050px] ${paddingClass} text-zinc-900 bg-white shadow-xl rounded-xl border border-border/60 print:shadow-none print:border-none print:p-12 overflow-hidden`}>
                    <ResumePreview
                      data={resume.content}
                      template={resume.content.template || "tech"}
                      color={resume.content.color || "purple"}
                      margins={margins}
                      suggestions={resume.suggestions}
                      currentStep={currentStep}
                      onSelectSuggestion={selectSuggestion}
                      isInteractive={true}
                    />
                  </div>
                );
              })()}
            </div>
          )}
        </section>

        {/* RIGHT PANE: Zety Checker Panel (45% width, hidden in print) */}
        <section className="w-[480px] bg-card border-l border-border flex flex-col justify-between shrink-0 h-full scroll-panel print:hidden">
          
          {/* Action Header panel */}
          <div className="p-6 border-b border-border bg-muted/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">CHECK PROGRESS</span>
              <h3 className="font-extrabold text-base capitalize">{currentStep} optimization</h3>
            </div>
            
            {/* ATS circular progress */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">ATS Score:</span>
                {resume.sourceType === "uploaded" ? (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-muted-foreground/60 line-through">
                      {resume.atsScore}
                    </span>
                    <span className="font-black text-sm px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 animate-pulse">
                      {getUpgradedScore()} / 100
                    </span>
                  </div>
                ) : (
                  <span className="font-black text-sm px-2 py-0.5 rounded bg-amber-500/15 text-amber-600">
                    {resume.atsScore} / 100
                  </span>
                )}
              </div>
              <button
                onClick={handleRecalculateScore}
                disabled={scanLoading}
                className="bg-primary hover:bg-primary/95 disabled:opacity-50 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors shrink-0"
              >
                <Sparkles className="w-3 h-3" />
                {scanLoading ? `Scanning... (${scanProgress}%)` : "Scan ATS Score"}
              </button>
            </div>
          </div>

          {/* Action content scroll zone */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {currentStep === "final" ? (
              // Final Step Summary
              <div className="space-y-6">
                {/* Score Alert Callout */}
                {resume.sourceType === "uploaded" ? (
                  <div className="text-center py-6 border border-indigo-500/20 bg-indigo-500/5 rounded-xl space-y-2 px-4">
                    <Sparkles className="w-12 h-12 text-indigo-500 mx-auto animate-bounce" />
                    <h4 className="font-bold text-base text-indigo-600 dark:text-indigo-400">Boosted to {getUpgradedScore()}/100 with Template!</h4>
                    <p className="text-xs text-muted-foreground">
                      Your original uploaded PDF had formatting issues (scoring {resume.atsScore}/100). By using our professional built-in templates, your score automatically boosts to <span className="text-emerald-500 font-bold">{getUpgradedScore()}/100</span>!
                    </p>
                  </div>
                ) : resume.atsScore >= 85 ? (
                  <div className="text-center py-6 border border-emerald-500/20 bg-emerald-500/5 rounded-xl space-y-2">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                    <h4 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">ATS Optimized!</h4>
                    <p className="text-xs text-muted-foreground px-4">Your resume scores an excellent {resume.atsScore}/100. It is highly optimized to pass automated ATS filters.</p>
                  </div>
                ) : resume.atsScore >= 70 ? (
                  <div className="text-center py-6 border border-amber-500/20 bg-amber-500/5 rounded-xl space-y-2">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                    <h4 className="font-bold text-lg text-amber-600 dark:text-amber-400">Decent, but Needs Work</h4>
                    <p className="text-xs text-muted-foreground px-4">Your resume scores a moderate {resume.atsScore}/100. Fix the remaining issues to boost your score above 85%.</p>
                  </div>
                ) : (
                  <div className="text-center py-6 border border-red-500/20 bg-red-500/5 rounded-xl space-y-2">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
                    <h4 className="font-bold text-lg text-red-600 dark:text-red-400">Critical Issues Found</h4>
                    <p className="text-xs text-muted-foreground px-4">Your resume scores a low {resume.atsScore}/100. It is at high risk of being filtered out by automated screening tools.</p>
                  </div>
                )}

                {/* Subscores Breakdown */}
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <h4 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">ATS Parameter Breakdown</h4>
                  <div className="space-y-3.5">
                    {[
                      { label: "Keyword Density Match", val: (resume.subscores as any)?.keywordMatch || 70, color: "bg-blue-500" },
                      { label: "Action Verbs & Impact", val: (resume.subscores as any)?.impact || 65, color: "bg-purple-500" },
                      { label: "Readability & Length", val: (resume.subscores as any)?.readability || 80, color: "bg-pink-500" },
                      { label: "Skills Section Depth", val: (resume.subscores as any)?.skills || 75, color: "bg-teal-500" },
                      { label: "Formatting & Margins", val: (resume.subscores as any)?.formatting || 85, color: "bg-indigo-500", isFormatting: true },
                    ].map((item, idx) => {
                      const isUploadedFormatting = item.isFormatting && resume.sourceType === "uploaded" && item.val < 98;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium items-center">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              {item.label}
                              {isUploadedFormatting && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  Original PDF Issue
                                </span>
                              )}
                            </span>
                            <span className="font-bold text-foreground">
                              {isUploadedFormatting ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="line-through text-muted-foreground/60">{item.val}%</span>
                                  <span className="text-emerald-500">→ 98%</span>
                                </span>
                              ) : (
                                `${item.val}%`
                              )}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden relative">
                            {isUploadedFormatting ? (
                              <div className="h-full w-full relative">
                                <div 
                                  className="h-full bg-amber-500 rounded-l-full absolute left-0 top-0 transition-all duration-1000 ease-out"
                                  style={{ width: `${item.val}%` }}
                                />
                                <div 
                                  className="h-full bg-emerald-500 rounded-r-full absolute top-0 transition-all duration-1000 ease-out"
                                  style={{ 
                                    left: `${item.val}%`, 
                                    width: `${98 - item.val}%` 
                                  }}
                                />
                              </div>
                            ) : (
                              <div 
                                className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${item.val}%` }}
                              />
                            )}
                          </div>
                          {isUploadedFormatting && (
                            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                              ⚠️ Your uploaded file has formatting/margin issues, but utilizing our built-in template resolves them, upgrading your score to <span className="text-emerald-500 font-bold">98%</span>.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Brutal Roast */}
                {resume.roastText && (
                  <div className="p-4 rounded-xl border border-accent/25 bg-accent/5 space-y-3">
                    <h4 className="font-bold text-sm text-accent-foreground flex items-center gap-1.5">
                      🔥 Brutal Career Roast
                    </h4>
                    <p className="text-xs font-mono text-accent-foreground leading-relaxed italic bg-muted p-3 rounded border border-border">
                      {`"${resume.roastText}"`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Recommendation step lists
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-muted-foreground">Section Issues ({stepSuggestions.length})</span>
                  {currentStep === "experience" && stepSuggestions.length > 0 && resume.sourceType !== "uploaded" && (
                    <button 
                      onClick={fixAllExperience}
                      className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-Fix All Experience
                    </button>
                  )}
                </div>

                {stepSuggestions.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl space-y-2">
                    <Check className="w-8 h-8 text-success mx-auto" />
                    <p className="text-xs font-bold text-muted-foreground">Perfect Section Score!</p>
                    <p className="text-[10px] text-muted-foreground/85">No warnings parsed in this resume category.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stepSuggestions.map((s) => {
                      const isFocused = focusedSuggestionId === s.id;

                      return (
                        <div 
                          key={s.id} 
                          className={`p-4 border rounded-xl transition-all ${
                            isFocused ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-border/80"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 leading-tight">
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                              {s.problem}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.explanation}</p>

                          {isFocused && resume.sourceType !== "uploaded" ? (
                            // Focused Editor
                            <div className="mt-4 space-y-3 border-t border-border/60 pt-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground block uppercase">Modify text block:</label>
                                <textarea 
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  rows={4}
                                  className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-xs resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                                />
                              </div>

                              <div className="flex justify-between items-center gap-2">
                                <button 
                                  onClick={() => applyAutoFixText(s)}
                                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> Auto-Fix Phrasing
                                </button>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => setFocusedSuggestionId(null)}
                                      className="px-2.5 py-1 text-[10px] font-semibold hover:bg-muted rounded border border-border"
                                    >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={() => saveTextEdit(s)}
                                    disabled={saveLoading}
                                    className="bg-primary hover:bg-primary/95 text-white px-3 py-1 text-[10px] font-bold rounded shadow flex items-center gap-1"
                                  >
                                    {saveLoading ? "Saving..." : "Accept Fix"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Click to expand editor
                            s.originalText && resume.sourceType !== "uploaded" && (
                              <button 
                                onClick={() => selectSuggestion(s)}
                                className="mt-3 text-xs text-primary font-bold hover:underline flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> Edit & Fix Phrasing
                              </button>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating Actions at Bottom */}
          <div className="p-6 border-t border-border bg-muted/80 flex items-center justify-between gap-4">
            <button 
              onClick={() => {
                if (currentStepIdx > 0) setCurrentStepIdx(currentStepIdx - 1);
              }}
              disabled={currentStepIdx === 0}
              className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-card transition disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <button 
              onClick={() => {
                if (currentStepIdx < steps.length - 1) setCurrentStepIdx(currentStepIdx + 1);
              }}
              disabled={currentStepIdx === steps.length - 1}
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 transition shadow disabled:opacity-40 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </section>

      </div>
    </div>
  );
}
