"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  ArrowLeft, Copy, Check, Heart, Sun, Moon, Info, Sparkles, CreditCard, Award, ArrowRight, RefreshCw
} from "lucide-react";

// Pixel-perfect premium brand SVG icons
const GPayIcon = () => (
  <svg className="w-8 h-5 shrink-0" viewBox="0 0 38 18" fill="none">
    {/* Blue G logo */}
    <path d="M5.5 9c0-.6-.1-1.1-.2-1.6H1V10.3h2.6c-.1.7-.5 1.4-1.1 1.8v2.1h1.8c1.1-1 1.7-2.6 1.7-4.5z" fill="#4285F4"/>
    <path d="M1 12.8c1.3 0 2.4-.4 3.2-1.2l-1.8-2.1c-.4.3-.9.5-1.4.5-1.1 0-2-.7-2.3-1.7H-3v2.2c.8 1.6 2.5 2.8 4.5 2.8z" fill="#34A853"/>
    <path d="M-1.3 8.3c-.1-.3-.1-.7-.1-1s0-.7.1-1V4.1H-3c-.4.8-.6 1.7-.6 2.7s.2 1.9.6 2.7l2.2-1.7z" fill="#FBBC05"/>
    <path d="M1 5.2c.7 0 1.3.2 1.8.7l1.4-1.4C3.4 3.7 2.3 3.3 1 3.3c-2 0-3.7 1.2-4.5 2.8l2.2 1.7c.3-1 1.2-1.7 2.3-1.7z" fill="#EA4335"/>
    {/* Clean custom typography for "Pay" */}
    <text x="8" y="13.5" fill="currentColor" className="font-sans font-black text-[12px] tracking-tight">Pay</text>
  </svg>
);

const PhonePeIcon = () => (
  <svg className="w-8 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#5f259f" />
    <path d="M12 4c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5S15 4 12 4zm1.5 5.5h-3v2h3v-2zm-1.5-3.5c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2z" fill="white" />
    <circle cx="12" cy="17" r="1.5" fill="white" />
  </svg>
);

const PaytmIcon = () => (
  <svg className="w-10 h-5 shrink-0" viewBox="0 0 42 16" fill="none">
    <rect width="42" height="16" rx="4" fill="#00b9f5" />
    <text x="4" y="12" fill="white" className="font-sans font-black text-[10px] tracking-tighter">Paytm</text>
  </svg>
);

export default function DonatePage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Payment variables
  const [amount, setAmount] = useState<string>("");
  const [selectedApp, setSelectedApp] = useState<"gpay" | "phonepe" | "paytm">("gpay");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "thankyou">("idle");
  
  const upiId = "zakirrashid@ptyes";
  const upiName = "Zakir Rashid";

  const quotes = [
    { text: "No one has ever become poor by giving.", author: "Anne Frank" },
    { text: "The value of a man should be seen in what he gives and not in what he is able to receive.", author: "Albert Einstein" },
    { text: "We make a living by what we get, but we make a life by what we give.", author: "Winston Churchill" },
    { text: "Generosity is the flower of justice.", author: "Nathaniel Hawthorne" },
    { text: "Your support keeps Resume Copilot 100% free and open-source for job seekers worldwide. Thank you!", author: "Zakir Rashid" }
  ];
  
  const [selectedQuote, setSelectedQuote] = useState(quotes[0]);

  // Preset amounts configuration
  const presets = [
    { value: "20", label: "₹20", icon: "🍫", desc: "Buy a Chocolate" },
    { value: "50", label: "₹50", icon: "☕", desc: "Buy a Coffee" },
    { value: "100", label: "₹100", icon: "🥤", desc: "Buy a Cold Drink" },
    { value: "300", label: "₹300", icon: "🍕", desc: "Buy a Pizza" }
  ];

  // Apply & Save Theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      }
    }
    // Pick random quote on mount
    const idx = Math.floor(Math.random() * quotes.length);
    setSelectedQuote(quotes[idx]);
  }, []);

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

  // Confetti celebration when thankyou state triggers
  useEffect(() => {
    if (paymentStatus === "thankyou") {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#8b5cf6"]
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#34d399", "#60a5fa", "#a78bfa"]
        });
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  // Construct dynamic UPI payment URI
  const valAmount = amount && parseInt(amount) >= 20 && parseInt(amount) <= 300 ? amount : "";
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR${valAmount ? `&am=${valAmount}` : ""}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    
    confetti({
      particleCount: 70,
      spread: 50,
      origin: { y: 0.8 },
      colors: ["#ec4899", "#8b5cf6", "#3b82f6"]
    });

    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePresetSelect = (val: string) => {
    setAmount(val);
  };

  // Direct Mobile pay execution
  const handlePayClick = () => {
    if (!valAmount) return;
    let url = "";
    if (selectedApp === "gpay") {
      url = `gpay://upi/pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR&am=${valAmount}`;
    } else if (selectedApp === "phonepe") {
      url = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR&am=${valAmount}`;
    } else if (selectedApp === "paytm") {
      url = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR&am=${valAmount}`;
    }
    
    if (url) {
      window.location.href = url;
      // Transition browser tab view to confirmation state
      setTimeout(() => {
        setPaymentStatus("processing");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Navbar Header */}
      <header className="sticky top-0 z-50 w-full bg-white/75 dark:bg-slate-950/75 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="font-extrabold text-sm text-foreground block tracking-tight">Support Our Vision</span>
              <span className="text-[10px] text-rose-500 font-extrabold block uppercase tracking-wider">Help Keep Us Free</span>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {paymentStatus === "thankyou" ? (
            
            /* --- THANK YOU / CELEBRATION VIEW --- */
            <motion.div
              key="thankyou-panel"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="max-w-md w-full bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-8 flex flex-col items-center text-center space-y-6"
            >
              
              {/* Glowing Pulse Blue-Green Checkmark Icon */}
              <div className="relative flex items-center justify-center w-20 h-20">
                <div className="absolute w-20 h-20 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 animate-ping duration-1000" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Check className="w-9 h-9 stroke-[3]" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight bg-gradient-to-tr from-emerald-600 to-sky-500 dark:from-emerald-400 dark:to-sky-400 bg-clip-text text-transparent">
                  Generosity Received!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your support has been successfully registered. You are keeping high-end resume builders free for developers worldwide!
                </p>
              </div>

              {/* Inspiring Quote block */}
              <div className="w-full p-5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
                <p className="text-xs italic text-slate-600 dark:text-slate-350 leading-relaxed">
                  "{selectedQuote.text}"
                </p>
                <span className="text-[10px] font-black text-primary dark:text-primary uppercase tracking-widest block">
                  — {selectedQuote.author}
                </span>
              </div>

              {/* Action Button: return to dashboard */}
              <div className="w-full pt-2">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition active:scale-98 shadow-md flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>

          ) : paymentStatus === "processing" ? (

            /* --- PAYMENT CONFIRMATION GATED VIEW --- */
            <motion.div
              key="processing-panel"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="max-w-md w-full bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-8 flex flex-col items-center text-center space-y-6"
            >
              {/* Spinner */}
              <div className="relative flex items-center justify-center w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-150 dark:border-slate-800 shadow-inner">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight">
                  Verify Support Payment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We redirected you to your mobile app to complete the support transaction of <strong className="text-slate-800 dark:text-slate-200">₹{valAmount}</strong>.
                </p>
              </div>

              <div className="w-full space-y-3 pt-2">
                <button
                  onClick={() => setPaymentStatus("thankyou")}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition active:scale-98 shadow-md flex items-center justify-center gap-2"
                >
                  Yes, I Completed Payment
                </button>
                
                <button
                  onClick={() => setPaymentStatus("idle")}
                  className="w-full py-4 rounded-2xl border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition active:scale-98 shadow-sm flex items-center justify-center gap-2"
                >
                  No, Cancel / Try Again
                </button>
              </div>
            </motion.div>

          ) : (

            /* --- DONATION CARD IDLE VIEW --- */
            <motion.div 
              key="donate-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-md w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-6 sm:p-8 flex flex-col items-center space-y-6"
            >
              {/* Heart Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 relative group">
                <Heart className="w-8 h-8 fill-white/10 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>

              <div className="space-y-1.5 text-center">
                <h2 className="text-2xl font-black tracking-tight flex items-center justify-center gap-1.5">
                  Empower Resume Copilot <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                  We decided to make all premium career preparation tools 100% free. If our builder, analyzers, or checklists helped you, consider supporting server API costs.
                </p>
              </div>

              {/* Donation content area */}
              <div className="w-full flex flex-col items-center space-y-5">
                    
                    {/* Preset selectors */}
                    <div className="w-full space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block text-left">Select Amount</span>
                      <div className="grid grid-cols-4 gap-2">
                        {presets.map((p) => (
                          <button
                            key={p.value}
                            onClick={() => handlePresetSelect(p.value)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-black transition-all active:scale-95 ${
                              amount === p.value
                                ? "border-primary bg-primary/5 text-primary scale-[1.03] shadow-xs"
                                : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                            title={p.desc}
                          >
                            <span className="text-base mb-0.5">{p.icon}</span>
                            <span>{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* QR Display Canvas */}
                    <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-md relative group transition-transform duration-300 hover:scale-[1.01]">
                      <div className="w-[200px] h-[200px] flex items-center justify-center overflow-hidden rounded-xl bg-white relative">
                        <img 
                          src={qrCodeUrl} 
                          alt="UPI QR Code" 
                          className="w-full h-full object-contain pointer-events-none select-none"
                        />
                      </div>
                    </div>

                    {/* Mobile UPI Direct Pay Buttons */}
                    <div className="w-full space-y-2.5">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block text-center select-none">Select UPI App to Pay</span>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Google Pay */}
                        <button
                          onClick={() => setSelectedApp("gpay")}
                          className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-extrabold transition-all active:scale-95 text-center shadow-sm ${
                            selectedApp === "gpay"
                              ? "border-primary bg-primary/5 text-primary scale-[1.02]"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                        >
                          <GPayIcon />
                          GPay
                        </button>
                        
                        {/* PhonePe */}
                        <button
                          onClick={() => setSelectedApp("phonepe")}
                          className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-extrabold transition-all active:scale-95 text-center shadow-sm ${
                            selectedApp === "phonepe"
                              ? "border-purple-500 bg-purple-500/5 text-purple-600 dark:text-purple-400 scale-[1.02]"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                        >
                          <PhonePeIcon />
                          PhonePe
                        </button>

                        {/* Paytm */}
                        <button
                          onClick={() => setSelectedApp("paytm")}
                          className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-extrabold transition-all active:scale-95 text-center shadow-sm ${
                            selectedApp === "paytm"
                              ? "border-sky-500 bg-sky-500/5 text-sky-600 dark:text-sky-400 scale-[1.02]"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                        >
                          <PaytmIcon />
                          Paytm
                        </button>
                      </div>
                    </div>

                    {/* Copiable UPI Details */}
                    <div className="w-full space-y-3">
                      <div className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold font-mono">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block select-none">UPI Address</span>
                          <span className="text-slate-800 dark:text-slate-200 select-all">{upiId}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(upiId, "upiId")}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition active:scale-95 shadow-sm shrink-0"
                          title="Copy UPI ID"
                        >
                          {copiedField === "upiId" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-500/[0.04] dark:bg-rose-500/[0.02] text-left border border-rose-500/10 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                        <Info className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>
                          Select an amount, pick your preferred mobile payment app (GPay, PhonePe, or Paytm), and click <strong>Pay</strong>. Verify the payee is <strong>{upiName}</strong>.
                        </span>
                      </div>
                    </div>
              </div>

              {/* Primary Pay Action Button */}
              <div className="w-full pt-2 flex flex-col gap-3">
                <button
                  onClick={handlePayClick}
                  disabled={!valAmount}
                  className={`w-full py-4 rounded-2xl text-xs font-black shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 ${
                    valAmount
                      ? "bg-slate-800 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 cursor-pointer"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {valAmount 
                      ? `Pay ₹${valAmount} via ${selectedApp === "gpay" ? "Google Pay" : selectedApp === "phonepe" ? "PhonePe" : "Paytm"}`
                      : "Select Amount to Pay"
                    }
                  </span>
                </button>
                
                <button
                  onClick={() => router.back()}
                  className="text-center text-[10px] font-bold text-slate-400 hover:text-slate-650 dark:hover:text-slate-250 transition-colors uppercase tracking-widest pt-1"
                >
                  Return to Previous Page
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[10px] text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 transition-colors">
        <span>Part of the <a href="https://zakirrashid.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-extrabold">zakirrashid.in</a> Ecosystem</span>
      </footer>

    </div>
  );
}
