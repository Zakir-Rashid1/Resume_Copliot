"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileSignature, Copy, Download, FileText, Sun, Moon, Bold, Italic } from "lucide-react";
import { Resume } from "@/lib/db";

export default function CoverLettersSuite() {
  const router = useRouter();
  
  // Session & Resumes
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState("");
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

  // Input states
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [tone, setTone] = useState<"Professional" | "Formal" | "Creative">("Professional");
  const [jdInput, setJdInput] = useState("");

  // Output states
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [generationLoading, setGenerationLoading] = useState(false);

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

  const handleGenerate = async () => {
    if (!selectedResumeId || !jdInput) return;
    setGenerationLoading(true);

    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescription: jdInput,
          tone,
          company,
          position
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedLetter(data.content);
      } else if (data.upgradeRequired) {
        alert(data.error);
        router.push("/settings");
      } else {
        alert(data.error || "Failed to generate cover letter.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerationLoading(false);
    }
  };

  const [pdfLoading, setPdfLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleFormatText = (style: "bold" | "italic") => {
    const textarea = document.getElementById("cover-letter-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = "";
    if (style === "bold") {
      replacement = `**${selected || "bold text"}**`;
    } else {
      replacement = `*${selected || "italic text"}*`;
    }

    const updatedText = text.substring(0, start) + replacement + text.substring(end);
    setGeneratedLetter(updatedText);

    // Refocus and select
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + (style === "bold" ? 2 : 1),
        start + (style === "bold" ? 2 : 1) + (selected || (style === "bold" ? "bold text" : "italic text")).length
      );
    }, 50);
  };

  const renderPreviewHtml = (text: string) => {
    // Escape HTML first
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Bold
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/__(.*?)__/g, "<strong>$1</strong>");
    
    // Italic
    escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
    escaped = escaped.replace(/_(.*?)_/g, "<em>$1</em>");

    // Split by paragraphs
    const paragraphs = escaped.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    
    return paragraphs.map((p, idx) => (
      <p 
        key={idx} 
        className="text-slate-800 font-serif text-[11px] leading-relaxed text-justify mb-4"
        style={{ whiteSpace: "pre-wrap" }}
        dangerouslySetInnerHTML={{ __html: p }}
      />
    ));
  };

  const handleDownloadPdf = async () => {
    if (!generatedLetter) return;
    setPdfLoading(true);

    try {
      const res = await fetch("/api/cover-letter/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          content: generatedLetter,
          company,
          position,
          tone,
        }),
      });

      if (!res.ok) throw new Error("Failed to export PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${company ? company.replace(/[^a-zA-Z0-9]/g, "") + "_" : ""}Cover_Letter.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedLetter) return;
    const blob = new Blob([generatedLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${company || "company"}_cover_letter.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Initializing cover letter suite...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/dashboard")}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="border-l border-border pl-3">
              <span className="font-bold text-sm text-foreground block">Cover Letter Generator</span>
              <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">Application materials</span>
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
          </div>
        </div>
      </header>

      {/* Workspace */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block print:bg-white print:p-0">
        
        {/* Left Side: Parameters Form (5 cols, hidden in print) */}
        <div className="lg:col-span-5 bg-card p-6 rounded-xl border border-border shadow-sm space-y-4 print:hidden">
          <h3 className="font-bold text-lg flex items-center gap-1.5 text-foreground">
            <FileSignature className="w-5 h-5 text-primary" /> Application Specifications
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Target Resume Profile</label>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Company Name</label>
                <input 
                  type="text" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="w-full p-2 rounded border border-border bg-background text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Target Role Title</label>
                <input 
                  type="text" 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Solutions Architect"
                  className="w-full p-2 rounded border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Letter Tone</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value as "Professional" | "Formal" | "Creative")}
                className="w-full p-2 rounded border border-border bg-background text-foreground focus:outline-none"
              >
                <option value="Professional">Professional (Recommended)</option>
                <option value="Formal">Formal</option>
                <option value="Creative">Creative</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Paste Job Description</label>
              <textarea 
                value={jdInput}
                onChange={(e) => setJdInput(e.target.value)}
                rows={6}
                placeholder="Paste the listings specs here to tailor details..."
                className="w-full p-2.5 rounded border border-border bg-background text-foreground resize-none leading-relaxed"
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generationLoading || !jdInput || !selectedResumeId}
            className="w-full bg-primary hover:bg-primary/95 text-white disabled:opacity-50 text-xs font-bold py-2.5 rounded-lg transition shadow-md shadow-primary/10"
          >
            {generationLoading ? "Drafting content..." : "Generate AI Cover Letter"}
          </button>
        </div>

        {/* Right Side: Paper Preview Layout (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col min-h-[500px] print:border-none print:shadow-none print:min-h-0">
            
            {/* Action Bar */}
            <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between print:hidden gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <FileText className="w-4 h-4 text-primary" /> Document View
                </span>
                {generatedLetter && (
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-border">
                    <button
                      onClick={() => setIsPreview(false)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-md transition-all ${
                        !isPreview
                          ? "bg-white dark:bg-slate-700 text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setIsPreview(true)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-md transition-all ${
                        isPreview
                          ? "bg-white dark:bg-slate-700 text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                )}
              </div>
              {generatedLetter && (
                <div className="flex items-center gap-2">
                  {/* Formatting Buttons (only visible in Edit Mode) */}
                  {!isPreview && (
                    <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-border">
                      <button
                        onClick={() => handleFormatText("bold")}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                        title="Make Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFormatText("italic")}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                        title="Make Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLetter);
                      alert("Copied to clipboard!");
                    }}
                    className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                    title="Copy Text"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                    className="bg-primary hover:bg-primary/95 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition disabled:opacity-70 shrink-0"
                    title="Download PDF"
                  >
                    {pdfLoading ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    ) : (
                      <Download className="w-3 h-3 shrink-0" />
                    )}
                    <span>{pdfLoading ? "Compiling PDF..." : "Download PDF"}</span>
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-border transition shrink-0"
                    title="Download TXT"
                  >
                    <FileText className="w-3 h-3 shrink-0" />
                    <span>TXT</span>
                  </button>
                </div>
              )}
            </div>

            {/* Document sheet body */}
            <div className="p-10 flex-1 flex flex-col justify-start bg-white rounded-b-xl print:p-0 overflow-y-auto">
              {generationLoading ? (
                <div className="flex flex-col items-center gap-3 py-20 my-auto">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-bold text-muted-foreground">Synthesizing personal details...</p>
                </div>
              ) : generatedLetter ? (
                isPreview ? (
                  <div className="w-full h-full flex flex-col justify-start text-slate-800 font-serif select-text text-left">
                    {renderPreviewHtml(generatedLetter)}
                  </div>
                ) : (
                  <textarea 
                    id="cover-letter-textarea"
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    rows={20}
                    className="w-full h-full border-0 bg-transparent text-slate-800 font-serif text-xs leading-relaxed resize-none p-0 focus:ring-0 outline-none print:h-auto"
                  />
                )
              ) : (
                <div className="my-auto text-center py-20 text-muted-foreground text-xs">
                  <p>Submit your parameters on the left to write document.</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
