"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target, AlertCircle, CheckCircle, Sparkles, Sun, Moon } from "lucide-react";
import { Resume } from "@/lib/db";

interface MatchAnalysisResult {
  matchScore: number;
  missingKeywords: string[];
  recommendedChanges: string[];
}

export default function JobMatcher({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [jdInput, setJdInput] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchAnalysisResult | null>(null);
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

  useEffect(() => {
    async function loadResume() {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        const data = await res.json();
        if (data.success && data.resume) {
          setResume(data.resume);
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

  const runMatchCheck = async () => {
    if (!jdInput || !resume) return;
    setMatchLoading(true);
    setMatchResults(null);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, jobDescription: jdInput })
      });
      const data = await res.json();
      if (data.success) {
        setMatchResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMatchLoading(false);
    }
  };

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-extrabold text-foreground bg-accent/30 px-1 rounded">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Loading match session...</p>
      </div>
    );
  }

  if (!resume) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/dashboard")}
              className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="border-l border-border pl-3">
              <span className="font-bold text-sm text-foreground block">{resume.name}</span>
              <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">JD Match Analyzer</span>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-accent text-foreground hover:bg-accent/80 transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Workspace */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Paste JD Form (5 cols) */}
        <div className="md:col-span-5 bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-1.5 text-foreground">
            <Target className="w-5 h-5 text-primary" /> Paste Target Job
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We will scan the requirements in this listing and compare them against your resume skills and descriptors.
          </p>

          <textarea 
            value={jdInput}
            onChange={(e) => setJdInput(e.target.value)}
            rows={10}
            placeholder="Paste target job specification details..."
            className="w-full p-3.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary resize-none leading-relaxed"
          />

          <button 
            onClick={runMatchCheck}
            disabled={matchLoading || !jdInput}
            className="w-full bg-primary hover:bg-primary/95 text-white disabled:opacity-50 text-xs font-bold py-2.5 rounded-lg transition shadow"
          >
            {matchLoading ? "Scanning keyword density..." : "Analyze Overlap Match"}
          </button>
        </div>

        {/* Right Side: Results Presentation (7 cols) */}
        <div className="md:col-span-7">
          {matchLoading ? (
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm text-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground font-semibold">Comparing keywords & semantic matches...</p>
            </div>
          ) : matchResults ? (
            <div className="space-y-6">
              
              {/* Score card */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Hiring Match Index</h4>
                  <p className="text-4xl font-black text-foreground">{matchResults.matchScore}%</p>
                  <p className="text-xs text-muted-foreground">Target score recommendation: 85%+</p>
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-accent border-t-primary flex items-center justify-center font-bold text-lg text-primary">
                  {matchResults.matchScore}%
                </div>
              </div>

              {/* Missing keywords */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" /> Missing Keywords Detected ({matchResults.missingKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {matchResults.missingKeywords.map((kw: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold uppercase">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" /> Revisions Action Plan
                </h4>
                <ul className="space-y-3 text-xs leading-relaxed text-foreground">
                  {matchResults.recommendedChanges.map((rec: string, i: number) => (
                    <li key={i} className="flex gap-2 items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{renderBoldText(rec)}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm text-center py-20 text-muted-foreground">
              <p className="text-xs">Paste target requirements on the left and run analysis check.</p>
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
