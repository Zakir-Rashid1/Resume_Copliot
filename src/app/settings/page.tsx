"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, ArrowLeft, Mail, Calendar, Shield,
  Trash2, Moon, Sun, Check, AlertTriangle, Eye, EyeOff,
  LogOut, MapPin, Briefcase, Link, Code2, Edit2, Camera,
  ZoomIn, ZoomOut, RotateCw, Zap, Crown, CreditCard, CheckCircle,
  Heart, Coffee, ExternalLink
} from "lucide-react";

// Generate consistent avatar gradient from name
function getAvatarGradient(name: string): [string, string] {
  const palettes: [string, string][] = [
    ["#3b82f6", "#6366f1"], // blue → indigo
    ["#10b981", "#0d9488"], // emerald → teal
    ["#8b5cf6", "#ec4899"], // purple → pink
    ["#f59e0b", "#f97316"], // amber → orange
    ["#ef4444", "#e11d48"], // red → rose
    ["#06b6d4", "#3b82f6"], // cyan → blue
    ["#a855f7", "#7c3aed"], // purple → violet
    ["#22c55e", "#16a34a"], // green → green-dark
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palettes[Math.abs(hash) % palettes.length];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  jobTitle?: string | null;
  location?: string | null;
  bio?: string | null;
  website?: string | null;
  github?: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  // Edit Profile
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    jobTitle: "",
    location: "",
    bio: "",
    website: "",
    github: "",
    avatar: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change Password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete Account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Error/Success
  const [error, setError] = useState<string | null>(null);


  // Crop Modal States
  const [tempImageSrc, setTempImageSrc] = useState<string>("");
  const [showCropModal, setShowCropModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialOffset({ x: offset.x, y: offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setOffset({
      x: initialOffset.x + dx,
      y: initialOffset.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setInitialOffset({ x: offset.x, y: offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setOffset({
      x: initialOffset.x + dx,
      y: initialOffset.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch profile
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/profile");
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setProfileData({
            name: data.user.name || "",
            jobTitle: data.user.jobTitle || "",
            location: data.user.location || "",
            bio: data.user.bio || "",
            website: data.user.website || "",
            github: data.user.github || "",
            avatar: data.user.avatar || "",
          });
        } else {
          router.push("/");
        }
      } catch (e) {
        console.error(e);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setTempImageSrc(base64);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input so same file can be re-uploaded
  };

  const handleApplyCrop = async () => {
    if (!tempImageSrc) return;
    
    try {
      const img = new Image();
      img.src = tempImageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 280;
      canvas.height = 280;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create 2D context");

      // Fill background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 280, 280);

      // Transformations
      ctx.translate(140, 140);
      ctx.translate(offset.x, offset.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Compute contain size inside the 280x280 box
      const imgAspect = img.width / img.height;
      let drawW = 280;
      let drawH = 280;
      if (imgAspect > 1) {
        drawH = 280 / imgAspect;
      } else {
        drawW = 280 * imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
      setProfileData(prev => ({ ...prev, avatar: croppedBase64 }));
      setShowCropModal(false);
    } catch (err) {
      setError("Failed to crop image. Please try another image.");
      console.error("Cropping error:", err);
    }
  };

  // Update Profile
  const handleUpdateProfile = async () => {
    if (!profileData.name.trim() || profileData.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    setError(null);
    setProfileLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-profile", ...profileData, name: profileData.name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      setEditingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    setError(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/auth/profile", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/?logout=success");
    } catch (err) {
      setError((err as Error).message);
      setDeleteLoading(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/?logout=success");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const [gradFrom, gradTo] = getAvatarGradient(user.name);
  const parsedDate = user.createdAt ? new Date(user.createdAt) : null;
  const memberSince = parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-lg hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-extrabold text-lg tracking-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-1">
                ResumeCopilot
              </span>
            </div>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full border border-border hover:bg-muted/40 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full space-y-8">

        {/* Profile Card */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Banner gradient */}
          <div
            className="h-28 relative"
            style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
          />

          <div className="px-8 pb-8 -mt-12 relative">
            {/* Avatar */}
            <div className="flex justify-between items-end mb-4">
              <div className="relative group">
                {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt={user.name} 
                    className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white dark:border-slate-900 select-none bg-white"
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-xl border-4 border-white dark:border-slate-900 select-none"
                    style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                  >
                    {initials}
                  </div>
                )}
                {editingProfile && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {!editingProfile ? (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { 
                      setEditingProfile(false); 
                      setProfileData({
                        name: user.name || "",
                        jobTitle: user.jobTitle || "",
                        location: user.location || "",
                        bio: user.bio || "",
                        website: user.website || "",
                        github: user.github || "",
                        avatar: user.avatar || "",
                      }); 
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={profileLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-colors text-sm disabled:opacity-50"
                  >
                    {profileLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {profileSuccess && (
              <div className="mb-4 text-xs font-semibold text-emerald-500 flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Profile updated successfully
              </div>
            )}

            {editingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Job Title</label>
                  <input
                    type="text"
                    value={profileData.jobTitle}
                    onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                    placeholder="e.g. Frontend Developer"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    placeholder="https://yourdomain.com"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">GitHub</label>
                  <input
                    type="url"
                    value={profileData.github}
                    onChange={(e) => setProfileData({...profileData, github: e.target.value})}
                    placeholder="https://github.com/username"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="A short bio about yourself..."
                    rows={3}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{user.name}</h1>
                {user.jobTitle && <p className="text-muted-foreground font-medium flex items-center gap-1.5 mt-1"><Briefcase className="w-4 h-4" /> {user.jobTitle}</p>}
                
                {user.bio && <p className="text-sm mt-3 text-foreground/80 leading-relaxed max-w-2xl">{user.bio}</p>}

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5" title="Email">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                  {user.location && (
                    <span className="flex items-center gap-1.5" title="Location">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.location}
                    </span>
                  )}
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors" title="Website">
                      <Link className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors" title="GitHub">
                      <Code2 className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  <span className="flex items-center gap-1.5" title="Joined">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {memberSince}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-destructive/60 hover:text-destructive">&times;</button>
          </div>
        )}




        {/* Support the Project Section */}
        {user && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm p-8 space-y-6 relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500 relative">
                <Heart className="w-5 h-5 fill-rose-500/20" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">Support Resume Copilot</h2>
                <p className="text-xs text-muted-foreground">Keep this platform free and help us cover server costs</p>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-6 relative z-10">
              <div className="p-6 rounded-xl border border-rose-500/20 dark:border-rose-500/30 bg-gradient-to-br from-rose-500/[0.04] to-primary/[0.04] space-y-4">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Resume Copilot is run as an open, <strong>100% free tool</strong> to help job seekers design, match, and prepare their career profiles without any paywalls. If this software helped you optimize your resume, prepare for interviews, or land your dream job, please consider buying us a coffee or sending a small donation to help pay for AI APIs and hosting.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => router.push("/donate")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-rose-500/10"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    Donate &amp; Support (UPI QR Code)
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}


        {/* Security Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Security</h2>
              <p className="text-xs text-muted-foreground">Manage your password and account security</p>
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Password</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {passwordSuccess ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Password updated successfully
                    </span>
                  ) : (
                    "Last changed: Never"
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPasswordSection(!showPasswordSection);
                  setError(null);
                }}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {showPasswordSection ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordSection && (
              <div className="mt-5 space-y-4 max-w-sm">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    minLength={8}
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-input/50 focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-border pt-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Sign Out</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sign out from your current session</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-destructive/30 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-destructive">Danger Zone</h2>
              <p className="text-xs text-muted-foreground">Irreversible actions</p>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">Delete Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete your account and all associated data including resumes, applications, and cover letters.
                </p>
              </div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="shrink-0 text-xs font-semibold text-destructive border border-destructive/30 px-4 py-2 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-destructive font-semibold">Are you sure?</span>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="text-xs font-bold bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs text-muted-foreground hover:text-foreground px-3 py-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
            
            <div className="text-center w-full">
              <h3 className="font-bold text-lg text-foreground">Crop Profile Picture</h3>
              <p className="text-xs text-muted-foreground mt-1">Drag the photo to position, zoom & rotate as needed</p>
            </div>

            {/* Circular Drag and Drop Cropping Frame */}
            <div 
              className="relative w-[280px] h-[280px] rounded-full overflow-hidden bg-slate-100 dark:bg-slate-950 border-2 border-primary/40 select-none cursor-grab active:cursor-grabbing shadow-inner flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {tempImageSrc && (
                <img
                  src={tempImageSrc}
                  alt="Crop Preview"
                  className="pointer-events-none select-none max-w-none max-h-none"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                  }}
                />
              )}
              {/* Overlay ring */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 pointer-events-none" />
            </div>

            {/* Controls */}
            <div className="w-full space-y-4">
              {/* Zoom Control */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground px-1">
                  <span>Zoom</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  />
                  <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </div>

              {/* Rotation & Reset Control */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                </button>

                <button
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setOffset({ x: 0, y: 0 });
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset Layout
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 w-full border-t border-border pt-4">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCrop}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-sm transition-colors shadow-md shadow-primary/10"
              >
                Apply Crop
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
