"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Resume } from "@/lib/db";
import ResumePreview from "@/components/ResumePreview";

export default function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        const data = await res.json();
        if (data.success && data.resume) {
          setResume(data.resume);
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  // Auto-trigger print once content is loaded
  useEffect(() => {
    if (resume && !loading) {
      // Small delay so browser paints the DOM first
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [resume, loading]);

  if (loading || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-zinc-400 font-semibold">Preparing your resume…</p>
      </div>
    );
  }

  const c = resume.content;
  const margins = (c.margins || "normal") as "narrow" | "normal" | "wide";
  const paddingCss = {
    narrow: "10mm 12mm",
    normal: "16mm 20mm",
    wide: "24mm 28mm",
  }[margins];

  const paddingClass = {
    narrow: "p-8",
    normal: "p-12",
    wide: "p-16",
  }[margins];

  return (
    <>
      {/* ── Print-only styles ───────────────────────────────────── */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { background: #fff !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          /* Fill full A4 page — dynamic margins layout setting */
          .paper-sheet {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 210mm !important;
            max-width: 210mm !important;
            min-height: 297mm !important;
            padding: ${paddingCss} !important;
          }
          /* Ensure no extra space after the sheet */
          body > * { page-break-after: avoid; }
        }
        @media screen {
          body { background: #f8fafc; }
        }
      `}</style>

      {/* ── Screen-only toolbar ─────────────────────────────────── */}
      <div className="no-print flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-200 shadow-sm">
        <span className="font-bold text-zinc-700">{resume.name}</span>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-lg shadow transition"
        >
          ⬇ Download as PDF
        </button>
      </div>

      {/* ── The paper sheet — EXACT same JSX as the checker preview ─ */}
      <div className="flex justify-center py-8 px-4 print:py-0 print:px-0 print:block">
        <div className={`paper-sheet w-full max-w-[800px] min-h-[1050px] ${paddingClass} text-zinc-900 bg-white shadow-xl print:shadow-none print:border-none print:p-12 overflow-hidden`}>
          <ResumePreview
            data={resume.content}
            template={resume.content.template || "tech"}
            color={resume.content.color || "purple"}
            margins={margins}
          />
        </div>
      </div>
    </>
  );
}
