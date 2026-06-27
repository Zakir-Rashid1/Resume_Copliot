"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Sun, Moon } from "lucide-react";
import { JobApplication } from "@/lib/db";

type ApplicationStatus = "Applied" | "Interview Scheduled" | "Rejected" | "Offer Received";

export default function JobTrackerSuite() {
  const router = useRouter();

  // App States
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newCompany, setNewCompany] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("Applied");
  const [newNotes, setNewNotes] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
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
          const appRes = await fetch("/api/applications");
          const appData = await appRes.json();
          if (appData.success) {
            setApplications(appData.applications);
          }
        } else {
          // Guest Mock Data
          setApplications([
            { id: "app-1", userId: "guest-user", company: "Meta", position: "Software Engineer", dateApplied: "2026-06-01", status: "Interview Scheduled", notes: "Technical screen scheduled.", updatedAt: new Date().toISOString() },
            { id: "app-2", userId: "guest-user", company: "Google", position: "Frontend Developer", dateApplied: "2026-06-12", status: "Applied", notes: "Referred by friend.", updatedAt: new Date().toISOString() }
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newPosition) return;

    const bodyPayload = {
      company: newCompany,
      position: newPosition,
      status: newStatus,
      notes: newNotes,
      dateApplied: new Date().toISOString().split("T")[0]
    };

    try {
      const authRes = await fetch("/api/auth");
      const authData = await authRes.json();

      if (authData.authenticated) {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload)
        });
        const data = await res.json();
        if (data.success) {
          setApplications(prev => [data.application, ...prev]);
        }
      } else {
        const guestApp: JobApplication = {
          id: Math.random().toString(),
          userId: "guest-user",
          ...bodyPayload,
          updatedAt: new Date().toISOString()
        };
        setApplications(prev => [guestApp, ...prev]);
      }

      setNewCompany("");
      setNewPosition("");
      setNewNotes("");
      setModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    try {
      const authRes = await fetch("/api/auth");
      const authData = await authRes.json();

      if (authData.authenticated) {
        const res = await fetch("/api/applications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: appId, status })
        });
        const data = await res.json();
        if (data.success) {
          setApplications(prev => prev.map(a => a.id === appId ? data.application : a));
        }
      } else {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status, updatedAt: new Date().toISOString() } : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (appId: string) => {
    try {
      const authRes = await fetch("/api/auth");
      const authData = await authRes.json();

      if (authData.authenticated) {
        await fetch(`/api/applications?id=${appId}`, { method: "DELETE" });
      }
      setApplications(prev => prev.filter(a => a.id !== appId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Initializing tracker board...</p>
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
              <span className="font-bold text-sm text-foreground block">Job Application Tracker</span>
              <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">Hiring pipelines</span>
            </div>
          </div>
 
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-accent text-foreground hover:bg-accent/80 transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <button 
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Add Target Job
            </button>
          </div>
        </div>
      </header>
 
      {/* Main Board */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        
        {/* Kanban Board columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {(["Applied", "Interview Scheduled", "Rejected", "Offer Received"] as const).map(colStatus => {
            const colApps = applications.filter(a => a.status === colStatus);
 
            return (
              <div key={colStatus} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-3 min-h-[450px]">
                <div className="flex justify-between items-center border-b border-border pb-2 mb-1">
                  <span className="font-bold text-xs tracking-wide uppercase flex items-center gap-1.5 text-foreground">
                    <span className={`w-2 h-2 rounded-full ${
                      colStatus === "Offer Received" ? "bg-emerald-500" :
                      colStatus === "Interview Scheduled" ? "bg-primary" :
                      colStatus === "Rejected" ? "bg-destructive" :
                      "bg-slate-400"
                    }`} />
                    {colStatus}
                  </span>
                  <span className="text-[10px] bg-accent text-foreground font-bold px-2 py-0.5 rounded-full">
                    {colApps.length}
                  </span>
                </div>
 
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colApps.map(app => (
                    <div key={app.id} className="p-3 border border-border rounded-lg bg-background/50 space-y-2.5 shadow-sm relative group hover:border-primary/50 transition">
                      <div>
                        <p className="font-bold text-xs text-foreground">{app.company}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{app.position}</p>
                      </div>
                      
                      {app.notes && (
                        <p className="text-[10px] text-muted-foreground border-t border-border pt-1.5 line-clamp-2 leading-relaxed">{app.notes}</p>
                      )}
 
                      <div className="flex justify-between items-center text-[9px] text-muted-foreground border-t border-border pt-2 flex-wrap gap-1.5">
                        <span>Applied: {app.dateApplied}</span>
                        <div className="flex items-center gap-1">
                          <select 
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                            className="bg-card text-foreground border border-border rounded px-1 py-0.5 font-semibold focus:outline-none"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Interview Scheduled">Interview</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Offer Received">Offer</option>
                          </select>
                          <button 
                            onClick={() => handleDelete(app.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
 
      {/* Add application Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-xl p-6 shadow-2xl border border-border">
            <div className="flex justify-between items-center mb-4 text-foreground">
              <h3 className="font-bold text-base">Track Job Application</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground text-lg">&times;</button>
            </div>
 
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Company Name</label>
                <input 
                  type="text" 
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Google"
                  required
                  className="w-full p-2 rounded border border-border bg-background text-foreground focus:outline-none"
                />
              </div>
 
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Job Title</label>
                <input 
                  type="text" 
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="e.g. Solutions Engineer"
                  required
                  className="w-full p-2 rounded border border-border bg-background text-foreground focus:outline-none"
                />
              </div>
 
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Status Stage</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                  className="w-full p-2 rounded border border-border bg-background text-foreground focus:outline-none"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Offer Received">Offer Received</option>
                </select>
              </div>
 
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Notes (Optional)</label>
                <textarea 
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Referrals, timelines, link to listing..."
                  rows={3}
                  className="w-full p-2 rounded border border-border bg-background text-foreground resize-none leading-relaxed focus:outline-none"
                />
              </div>
 
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-lg transition"
              >
                Track Position
              </button>
            </form>
          </div>
        </div>
      )}
 
    </div>
  );
}
