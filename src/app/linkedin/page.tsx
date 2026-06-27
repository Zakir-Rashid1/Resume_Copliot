"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Sparkles, Copy, Sun, Moon } from "lucide-react";
import { Resume } from "@/lib/db";

interface OptimizationResult {
  suggestedHeadline: string;
  suggestedAbout: string;
  suggestions: string[];
}

export default function LinkedInOptimizerSuite() {
  const router = useRouter();
  
  // App States
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [optLoading, setOptLoading] = useState(false);
  const [optResult, setOptResult] = useState<OptimizationResult | null>(null);
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
    async function loadData() {
      try {
        const authRes = await fetch("/api/auth");
        const authData = await authRes.json();
        
        if (authData.authenticated) {
          const resRes = await fetch("/api/resumes");
          const resData = await resRes.json();
          if (resData.success) {
            setResumes(resData.resumes);
            setSelectedResumeId(resData.resumes[0]?.id || "");
          }
        } else {
          setResumes([{ id: "mock-id", name: "Software Engineer Baseline.pdf" } as unknown as Resume]);
          setSelectedResumeId("mock-id");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOptimize = async () => {
    if (!selectedResumeId) return;
    setOptLoading(true);
    setOptResult(null);

    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResumeId })
      });
      const data = await res.json();
      if (data.success) {
        setOptResult(data);
      } else if (data.upgradeRequired) {
        alert(data.error);
        router.push("/settings");
      } else {
        alert(data.error || "Failed to optimize LinkedIn content.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Initializing LinkedIn suite...</p>
      </div>
    );
  }

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
              <span className="font-bold text-sm text-foreground block">LinkedIn Profile Optimizer</span>
              <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">Social profiles</span>
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
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Parameters Box (5 cols) */}
        <div className="lg:col-span-5 bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg> Profile Optimizer
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select the resume profile to optimize your professional headline and about summary.
          </p>

          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-muted-foreground">Source Profile</label>
            <select 
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full p-2 rounded border border-border bg-background text-foreground focus:outline-none"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleOptimize}
            disabled={optLoading || !selectedResumeId}
            className="w-full bg-primary hover:bg-primary/95 text-white disabled:opacity-50 text-xs font-bold py-2.5 rounded-lg transition shadow"
          >
            {optLoading ? "Generating keywords..." : "Optimize Social copy"}
          </button>
        </div>

        {/* Results Pane (7 cols) */}
        <div className="lg:col-span-7">
          {optLoading ? (
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm text-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground font-semibold">Writing professional headline options...</p>
            </div>
          ) : optResult ? (
            <div className="space-y-6">
              
              {/* Headline */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3 relative group">
                <h4 className="font-bold text-xs text-primary uppercase">Optimized Headline</h4>
                <div className="p-3 rounded bg-background border border-border font-medium text-xs leading-relaxed text-foreground">
                  {optResult.suggestedHeadline}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(optResult.suggestedHeadline);
                    alert("Headline copied!");
                  }}
                  className="absolute top-4 right-4 p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* About Summary */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3 relative">
                <h4 className="font-bold text-xs text-primary uppercase">Optimized About Section</h4>
                <textarea 
                  value={optResult.suggestedAbout}
                  rows={8}
                  readOnly
                  className="w-full p-3 rounded bg-background border border-border text-xs leading-relaxed resize-none focus:outline-none text-foreground"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(optResult.suggestedAbout);
                    alert("About summary copied!");
                  }}
                  className="absolute top-4 right-4 p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* General tips */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Key LinkedIn Strategies
                </h4>
                <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  {optResult.suggestions.map((s: string, i: number) => (
                    <li key={i} className="flex gap-2 items-start text-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm text-center py-20 text-muted-foreground text-xs">
              <p>Submit your parameters on the left to show suggestions.</p>
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
