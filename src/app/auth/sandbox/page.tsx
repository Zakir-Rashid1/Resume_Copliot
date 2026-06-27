"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Mail, User } from "lucide-react";

function SandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") || "google";

  const [email, setEmail] = useState(() => {
    if (provider === "google") return "jane.doe@example.com";
    if (provider === "linkedin") return "alex.smith@linkedin.com";
    return "pat.martinez@facebook.com";
  });
  const [name, setName] = useState(() => {
    if (provider === "google") return "Jane Doe";
    if (provider === "linkedin") return "Alex Smith";
    return "Pat Martinez";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectMock = (mockName: string, mockEmail: string) => {
    setName(mockName);
    setEmail(mockEmail);
  };

  const handleMockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isMock: true,
          email,
          name,
          provider,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed mock auth callback");
      }

      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const providerTitle = provider.charAt(0).toUpperCase() + provider.slice(1);

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#09090b] text-zinc-100 overflow-hidden font-sans p-4">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Glass Card */}
      <div className="relative w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 via-zinc-100 to-purple-200 bg-clip-text text-transparent">
            Authentication Sandbox
          </h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Direct keys for <strong className="text-indigo-400">{providerTitle}</strong> are not configured in your <code className="px-1 py-0.5 bg-zinc-800 text-[10px] rounded border border-zinc-700">.env.local</code>. Simulate redirect verification using the options below.
          </p>
        </div>

        {/* Mock Presets */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Select Mock Profile
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectMock("Jane Doe", "jane.doe@example.com")}
              className="p-3 text-left rounded-lg bg-zinc-950/40 hover:bg-indigo-500/10 border border-zinc-800/60 hover:border-indigo-500/30 transition text-zinc-300 font-medium"
            >
              Jane Doe
              <span className="block text-[10px] text-zinc-500 font-normal">jane.doe@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectMock("Alex Smith", "alex.smith@example.com")}
              className="p-3 text-left rounded-lg bg-zinc-950/40 hover:bg-indigo-500/10 border border-zinc-800/60 hover:border-indigo-500/30 transition text-zinc-300 font-medium"
            >
              Alex Smith
              <span className="block text-[10px] text-zinc-500 font-normal">alex.smith@example.com</span>
            </button>
          </div>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleMockSubmit} className="space-y-4">
          <div className="flex items-center my-2 text-[9px] text-zinc-600 uppercase tracking-widest">
            <div className="flex-1 border-t border-zinc-800"></div>
            <span className="px-2 font-bold">or use custom details</span>
            <div className="flex-1 border-t border-zinc-800"></div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-zinc-400" /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Candidate Name"
                required
                className="w-full text-xs bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 focus:outline-none p-2.5 rounded-lg text-zinc-100 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-zinc-400" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@email.com"
                required
                className="w-full text-xs bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 focus:outline-none p-2.5 rounded-lg text-zinc-100 transition"
              />
            </div>
          </div>

          {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold py-3 rounded-lg shadow-lg hover:shadow-indigo-500/10 transition duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Continue simulation <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
            <Sparkles className="w-3 h-3 text-amber-500" /> Powered by ResumeCopilot Auth Gateway
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AuthSandbox() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-zinc-100">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <SandboxContent />
    </Suspense>
  );
}
