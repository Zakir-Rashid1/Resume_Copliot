"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutTemplate, FileSearch, GitCompare, HelpCircle, Heart } from "lucide-react";

export default function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (pathname.startsWith("/builder")) {
      setActiveTab("templates");
    } else if (pathname.startsWith("/check")) {
      setActiveTab("checker");
    } else if (pathname.startsWith("/matcher")) {
      setActiveTab("matcher");
    } else if (pathname.startsWith("/donate")) {
      setActiveTab("donate");
    } else if (pathname === "/" && typeof window !== "undefined" && window.location.hash === "#faq") {
      setActiveTab("faq");
    } else {
      setActiveTab("");
    }
  }, [pathname]);

  // Dynamic router checks for ATS Score Checker and JD Matcher
  const handleAtsClick = async () => {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      if (data.success && data.resumes && data.resumes.length > 0) {
        // Route to the latest modified resume's score checker
        router.push(`/check/${data.resumes[0].id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (e) {
      router.push("/dashboard");
    }
  };

  const handleMatcherClick = async () => {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      if (data.success && data.resumes && data.resumes.length > 0) {
        // Route to the latest modified resume's JD matcher
        router.push(`/matcher/${data.resumes[0].id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (e) {
      router.push("/dashboard");
    }
  };

  const navItems = [
    {
      id: "templates",
      label: "Ai templates",
      icon: LayoutTemplate,
      href: "/builder/new",
    },
    {
      id: "checker",
      label: "ats checker",
      icon: FileSearch,
      onClick: handleAtsClick,
    },
    {
      id: "matcher",
      label: "jd matcher",
      icon: GitCompare,
      onClick: handleMatcherClick,
    },
    {
      id: "faq",
      label: "FAQ",
      icon: HelpCircle,
      href: "/#faq",
      onClick: () => {
        setActiveTab("faq");
        if (pathname === "/") {
          const faqEl = document.getElementById("faq");
          if (faqEl) {
            faqEl.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    },
    {
      id: "donate",
      label: "Donate",
      icon: Heart,
      href: "/donate",
    },
  ];

  return (
    <nav 
      style={{ 
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4px)" 
      }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/85 backdrop-blur-lg border-t border-border lg:hidden flex justify-around items-center px-2 shadow-lg print:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const buttonClass = `flex flex-col items-center justify-center flex-1 py-2.5 transition-all duration-200 active:scale-95 border-none bg-transparent cursor-pointer no-underline ${
          isActive
            ? "text-primary dark:text-sky-400"
            : "text-muted-foreground hover:text-foreground"
        }`;

        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={item.onClick}
              className={buttonClass}
            >
              <Icon className={`w-5 h-5 mb-1 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
              <span className={`text-[10px] tracking-wide truncate max-w-full capitalize ${isActive ? "font-extrabold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={buttonClass}
          >
            <Icon className={`w-5 h-5 mb-1 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
            <span className={`text-[10px] tracking-wide truncate max-w-full capitalize ${isActive ? "font-extrabold" : "font-medium"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
