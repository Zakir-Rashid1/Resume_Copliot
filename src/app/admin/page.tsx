"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Code,
  Database,
  FileCheck,
  FileText,
  Key,
  LogOut,
  Mail,
  Search,
  Shield,
  Users,
  X,
  Zap,
} from "lucide-react";

interface DBHealth {
  status: string;
  pingMs: number;
  provider: string;
  clientVersion: string;
  timestamp: string;
}

interface DBStats {
  totalUsers: number;
  totalResumes: number;
  totalCoverLetters: number;
  totalApplications: number;
  totalInterviews: number;
  totalLinkedIn: number;
  builtResumesCount: number;
  uploadedResumesCount: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  location: string | null;
  jobTitle: string | null;
  website: string | null;
  github: string | null;
  createdAt: string;
  _count: {
    resumes: number;
    applications: number;
    coverLetters: number;
    interviews: number;
  };
}

interface AdminResume {
  id: string;
  name: string;
  sourceType: string;
  atsScore: number;
  content: any;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface AdminApplication {
  id: string;
  company: string;
  position: string;
  status: string;
  dateApplied: string;
  notes: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminPage() {
  const router = useRouter();
  
  // Auth states
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard states
  const [health, setHealth] = useState<DBHealth | null>(null);
  const [stats, setStats] = useState<DBStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [resumes, setResumes] = useState<AdminResume[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "resumes" | "applications">("users");

  // Search & Modals
  const [userSearch, setUserSearch] = useState("");
  const [resumeSearch, setResumeSearch] = useState("");
  const [selectedJson, setSelectedJson] = useState<{ title: string; data: any } | null>(null);

  // Check auth session on load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/auth");
        if (res.ok) {
          setAuthenticated(true);
          fetchDashboardData();
        } else {
          setAuthenticated(false);
          setDashboardLoading(false);
        }
      } catch {
        setAuthenticated(false);
        setDashboardLoading(false);
      }
    }
    checkSession();
  }, []);

  // Fetch all stats and registries
  async function fetchDashboardData() {
    setDashboardLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok && data.success) {
        setHealth(data.health);
        setStats(data.stats);
        setUsers(data.registries.users);
        setResumes(data.registries.resumes);
        setApplications(data.registries.applications);
      } else {
        if (res.status === 401) {
          setAuthenticated(false);
        }
      }
    } catch (err) {
      console.error("Failed to load admin dashboard statistics:", err);
    } finally {
      setDashboardLoading(false);
    }
  }

  // Handle Login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAuthenticated(true);
        fetchDashboardData();
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch {
      setAuthError("Network connection failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      setAuthenticated(false);
      setUsers([]);
      setResumes([]);
      setApplications([]);
      setUsernameInput("");
      setPasswordInput("");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Filter handlers
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.location && u.location.toLowerCase().includes(term))
    );
  });

  const filteredResumes = resumes.filter((r) => {
    const term = resumeSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      r.name.toLowerCase().includes(term) ||
      r.user.email.toLowerCase().includes(term) ||
      r.user.name.toLowerCase().includes(term) ||
      r.sourceType.toLowerCase().includes(term)
    );
  });

  // Authenticating Loader state
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-zinc-100 flex-col gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wider text-zinc-400">Verifying Admin Session Gateway...</p>
      </div>
    );
  }

  // ─── LOGIN PANEL (Unauthenticated) ───
  if (!authenticated) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#09090b] text-zinc-100 overflow-hidden font-sans p-4">
        {/* Radial ambient lighting */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
        
        {/* Grid Background Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

        <div className="relative w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 mb-1">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 via-zinc-100 to-purple-200 bg-clip-text text-transparent">
              Admin & Developer Gateway
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Provide custom developer credentials configured in your environment keys to monitor databases.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Admin Username
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. admin"
                  required
                  className="w-full text-xs bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 focus:outline-none p-3 rounded-lg text-zinc-100 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 focus:outline-none p-3 rounded-lg text-zinc-100 transition"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold py-3 rounded-lg shadow-lg hover:shadow-indigo-500/10 transition duration-200 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Authenticate Gateway"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD PANEL (Authenticated) ───
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                Admin Console <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">Database Gateway</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${health?.status === "Healthy" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  DB Status: {health?.status || "Loading..."} {health?.pingMs ? `(${health.pingMs}ms)` : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1.5 text-xs border border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 hover:bg-zinc-800/40 rounded-lg font-medium transition cursor-pointer"
            >
              Refresh Stats
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 border border-rose-500/25 hover:bg-rose-500/10 rounded-lg font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {dashboardLoading && !stats ? (
          <div className="h-96 flex items-center justify-center flex-col gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-medium">Retrieving statistics from database...</p>
          </div>
        ) : (
          <>
            {/* Grid 1: Database Status Details */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Database Health</span>
                  <span className="text-xs font-bold text-zinc-200 block mt-0.5">{health?.status || "Unknown"}</span>
                  <span className="text-[9px] text-zinc-500">Latency: {health?.pingMs || 0}ms</span>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Database Provider</span>
                  <span className="text-xs font-bold text-zinc-200 block mt-0.5">{health?.provider || "Supabase"}</span>
                  <span className="text-[9px] text-zinc-500">PostgreSQL instance</span>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">ORM version</span>
                  <span className="text-xs font-bold text-zinc-200 block mt-0.5">{health?.clientVersion || "Prisma"}</span>
                  <span className="text-[9px] text-zinc-500">Node-Postgres Driver</span>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-zinc-500/10 text-zinc-400 rounded-lg font-mono text-center text-xs font-extrabold select-none">
                  UTC
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">System Timestamp</span>
                  <span className="text-[11px] font-bold text-zinc-200 block mt-0.5 truncate" title={health?.timestamp}>
                    {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "--:--:--"}
                  </span>
                  <span className="text-[9px] text-zinc-500 truncate block">
                    {health?.timestamp ? new Date(health.timestamp).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
            </section>

            {/* Grid 2: Counters / Metrics */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/30 border border-zinc-850 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute right-3 top-3 text-zinc-800">
                  <Users className="w-12 h-12 stroke-[1.5]" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Total Users</span>
                <span className="text-2xl font-black text-zinc-100 block mt-2">{stats?.totalUsers ?? 0}</span>
                <span className="text-[10px] text-zinc-500 block mt-1">Unique candidate registrations</span>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-850 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute right-3 top-3 text-zinc-800">
                  <FileText className="w-12 h-12 stroke-[1.5]" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Total Resumes (CVs)</span>
                <span className="text-2xl font-black text-zinc-100 block mt-2">{stats?.totalResumes ?? 0}</span>
                <span className="text-[10px] text-zinc-500 block mt-1">
                  Built: <strong className="text-indigo-400 font-bold">{stats?.builtResumesCount ?? 0}</strong> | Uploaded: <strong className="text-purple-400 font-bold">{stats?.uploadedResumesCount ?? 0}</strong>
                </span>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-850 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute right-3 top-3 text-zinc-800">
                  <FileCheck className="w-12 h-12 stroke-[1.5]" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Generated Content</span>
                <span className="text-2xl font-black text-zinc-100 block mt-2">
                  {(stats?.totalCoverLetters ?? 0) + (stats?.totalLinkedIn ?? 0)}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-1">
                  Letters: <strong className="text-zinc-300 font-bold">{stats?.totalCoverLetters ?? 0}</strong> | LinkedIn: <strong className="text-zinc-300 font-bold">{stats?.totalLinkedIn ?? 0}</strong>
                </span>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-850 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute right-3 top-3 text-zinc-800">
                  <Activity className="w-12 h-12 stroke-[1.5]" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Engagements</span>
                <span className="text-2xl font-black text-zinc-100 block mt-2">
                  {(stats?.totalApplications ?? 0) + (stats?.totalInterviews ?? 0)}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-1">
                  Jobs: <strong className="text-zinc-300 font-bold">{stats?.totalApplications ?? 0}</strong> | Mock Sessions: <strong className="text-zinc-300 font-bold">{stats?.totalInterviews ?? 0}</strong>
                </span>
              </div>
            </section>

            {/* Grid 3: Registries Tables */}
            <section className="bg-zinc-900/20 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl flex flex-col">
              {/* Tab control & search */}
              <div className="bg-zinc-950/40 px-6 py-4 border-b border-zinc-850 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "users" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10" : "bg-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> Users ({users.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("resumes")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "resumes" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10" : "bg-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Resumes ({resumes.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("applications")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "applications" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10" : "bg-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Job Tracker ({applications.length})
                  </button>
                </div>

                {/* Search boxes */}
                <div className="w-full md:w-80">
                  {activeTab === "users" && (
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search users by name, email..."
                        className="w-full text-xs bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:outline-none p-2.5 pl-9 rounded-lg text-zinc-100 transition"
                      />
                    </div>
                  )}

                  {activeTab === "resumes" && (
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={resumeSearch}
                        onChange={(e) => setResumeSearch(e.target.value)}
                        placeholder="Search resumes by name, owner..."
                        className="w-full text-xs bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:outline-none p-2.5 pl-9 rounded-lg text-zinc-100 transition"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Table rendering content */}
              <div className="overflow-x-auto min-h-80">
                {/* A. Users Table */}
                {activeTab === "users" && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-zinc-500 bg-zinc-950/10 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3.5">Name</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="px-6 py-3.5">Job Title / Location</th>
                        <th className="px-6 py-3.5">Joined Date</th>
                        <th className="px-6 py-3.5 text-center">Resumes</th>
                        <th className="px-6 py-3.5 text-center">Applications</th>
                        <th className="px-6 py-3.5 text-center">Interviews</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-zinc-500 font-medium">
                            No users matched your search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-zinc-900/20 text-zinc-300">
                            <td className="px-6 py-4 font-bold text-zinc-200">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 font-mono text-zinc-400 text-[11px]">
                              {user.email}
                            </td>
                            <td className="px-6 py-4">
                              <span className="block font-semibold text-zinc-300">{user.jobTitle || "—"}</span>
                              <span className="block text-[10px] text-zinc-500">{user.location || "—"}</span>
                            </td>
                            <td className="px-6 py-4 text-zinc-500 text-[11px]">
                              {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-indigo-400">
                              {user._count.resumes}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-zinc-400">
                              {user._count.applications}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-zinc-400">
                              {user._count.interviews}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedJson({ title: `User: ${user.name}`, data: user })}
                                className="text-[10px] font-extrabold uppercase bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded border border-zinc-700 text-zinc-200 transition cursor-pointer"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* B. Resumes Table */}
                {activeTab === "resumes" && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-zinc-500 bg-zinc-950/10 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3.5">Resume Name</th>
                        <th className="px-6 py-3.5">Owner Name</th>
                        <th className="px-6 py-3.5">Owner Email</th>
                        <th className="px-6 py-3.5">Source Type</th>
                        <th className="px-6 py-3.5 text-center">ATS Score</th>
                        <th className="px-6 py-3.5">Created Date</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60">
                      {filteredResumes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-zinc-500 font-medium">
                            No resumes matched your search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredResumes.map((resume) => (
                          <tr key={resume.id} className="hover:bg-zinc-900/20 text-zinc-300">
                            <td className="px-6 py-4 font-bold text-zinc-200">
                              {resume.name}
                            </td>
                            <td className="px-6 py-4 font-semibold text-zinc-300">
                              {resume.user.name}
                            </td>
                            <td className="px-6 py-4 font-mono text-zinc-400 text-[11px]">
                              {resume.user.email}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                                resume.sourceType === "built" 
                                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25" 
                                  : "bg-purple-500/10 text-purple-400 border-purple-500/25"
                              }`}>
                                {resume.sourceType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`font-black text-xs px-2 py-0.5 rounded ${
                                resume.atsScore >= 80 
                                  ? "bg-emerald-500/15 text-emerald-400" 
                                  : resume.atsScore >= 60 
                                  ? "bg-amber-500/15 text-amber-400" 
                                  : "bg-rose-500/15 text-rose-400"
                              }`}>
                                {resume.atsScore}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-zinc-500 text-[11px]">
                              {new Date(resume.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedJson({ title: `Resume JSON: ${resume.name}`, data: resume.content })}
                                className="text-[10px] font-extrabold uppercase bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded border border-zinc-700 text-zinc-200 transition cursor-pointer"
                              >
                                Inspect Content
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* C. Job Applications Table */}
                {activeTab === "applications" && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-zinc-500 bg-zinc-950/10 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3.5">Company</th>
                        <th className="px-6 py-3.5">Position</th>
                        <th className="px-6 py-3.5">Candidate Name</th>
                        <th className="px-6 py-3.5">Candidate Email</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Last Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60">
                      {applications.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-zinc-500 font-medium">
                            No applications tracked in database yet.
                          </td>
                        </tr>
                      ) : (
                        applications.map((app) => (
                          <tr key={app.id} className="hover:bg-zinc-900/20 text-zinc-300">
                            <td className="px-6 py-4 font-bold text-zinc-200">
                              {app.company}
                            </td>
                            <td className="px-6 py-4 font-semibold text-zinc-300">
                              {app.position}
                            </td>
                            <td className="px-6 py-4 text-zinc-400">
                              {app.user.name}
                            </td>
                            <td className="px-6 py-4 font-mono text-zinc-500 text-[11px]">
                              {app.user.email}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                                app.status === "Offer Received"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                  : app.status === "Interview Scheduled"
                                  ? "bg-sky-500/10 text-sky-400 border-sky-500/25"
                                  : app.status === "Rejected"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/25"
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-zinc-500 text-[11px]">
                              {new Date(app.updatedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {/* JSON Viewer Modal Overlay */}
      {selectedJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/20">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" /> {selectedJson.title}
              </h3>
              <button
                onClick={() => setSelectedJson(null)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal Body / Preformated JSON code */}
            <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] bg-zinc-950 text-indigo-300 scroll-panel leading-relaxed select-text">
              <pre>{JSON.stringify(selectedJson.data, null, 2)}</pre>
            </div>
            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 text-right bg-zinc-950/10">
              <button
                onClick={() => setSelectedJson(null)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
