import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ─── Prisma Singleton (prevents exhausting connection pool in dev hot-reload) ──
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Re-export TypeScript interfaces (unchanged — kept for API route compatibility) ───

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string | null;
  avatar?: string | null;
  jobTitle?: string | null;
  location?: string | null;
  bio?: string | null;
  website?: string | null;
  github?: string | null;
  createdAt: string | Date;
}

export interface ResumeContent {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github?: string;
  };
  summary: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications: string[];
  achievements: string[];
  customSection?: {
    title: string;
    content: string;
  };
  template?: "tech" | "minimal" | "executive" | "creative";
  color?: "purple" | "blue" | "emerald" | "amber" | "rose";
  margins?: "narrow" | "normal" | "wide";
}

export interface ATSSubscores {
  compatibility: number;
  keywordMatch: number;
  formatting: number;
  readability: number;
  impact: number;
  skills: number;
  projects: number;
  education: number;
}

export interface AISuggestion {
  id: string;
  category: "Grammar" | "Keywords" | "Action Verbs" | "Formatting" | "Readability" | "Quantifiable Results" | "Missing Skills";
  section: "summary" | "experience" | "projects" | "skills" | "education" | "general";
  problem: string;
  explanation: string;
  fix: string;
  originalText?: string;
  suggestedText?: string;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  rawText: string;
  content: ResumeContent;
  atsScore: number;
  subscores: ATSSubscores;
  suggestions: AISuggestion[];
  roastText: string;
  version: number;
  /** 'uploaded' = user supplied their own PDF; 'built' = created in the builder */
  sourceType: "uploaded" | "built";
  /** Base64-encoded original PDF. Only present when sourceType === 'uploaded'. */
  originalPdfBase64?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  version: number;
  content: ResumeContent;
  changeDescription: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  position: string;
  dateApplied: string;
  status: "Applied" | "Interview Scheduled" | "Rejected" | "Offer Received";
  notes: string;
  updatedAt: string;
}

export interface CoverLetter {
  id: string;
  userId: string;
  resumeId: string;
  company: string;
  position: string;
  tone: "Formal" | "Professional" | "Creative";
  content: string;
  createdAt: string;
}

export interface LinkedInOptimization {
  id: string;
  userId: string;
  originalHeadline: string;
  originalAbout: string;
  suggestedHeadline: string;
  suggestedAbout: string;
  suggestions: string[];
  createdAt: string;
}

export interface MockQuestion {
  id: string;
  question: string;
  category: "HR" | "Technical" | "Project-Based" | "Behavioral";
  userAnswer?: string;
  feedback?: string;
  suggestedAnswer: string;
  score?: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  questions: MockQuestion[];
  createdAt: string;
}

// ─── Helper: normalise Prisma DateTime to ISO string ──────────────────────────
function ts(d: Date): string {
  return d.toISOString();
}

// ─── db — same external shape as the old JSON-file db ─────────────────────────
export const db = {
  // Kept for legacy callers that do db.getData() — returns empty shell
  getData: () => ({
    users: [] as User[],
    resumes: [] as Resume[],
    versions: [] as ResumeVersion[],
    applications: [] as JobApplication[],
    coverLetters: [] as CoverLetter[],
    linkedinOptimizations: [] as LinkedInOptimization[],
    interviews: [] as InterviewSession[],
  }),
  saveData: () => {},

  // ── Users ──────────────────────────────────────────────────────────────────
  users: {
    findMany: (): User[] => {
      throw new Error("findMany is async — use prisma.user.findMany() directly");
    },
    findUnique: (): User | null => {
      throw new Error("Use db.users.findUniqueAsync(email) instead");
    },
    findById: (): User | null => {
      throw new Error("Use db.users.findByIdAsync(id) instead");
    },

    findUniqueAsync: async (email: string): Promise<User | null> => {
      const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!u) return null;
      return { ...u, createdAt: ts(u.createdAt) };
    },

    findByIdAsync: async (id: string): Promise<User | null> => {
      const u = await prisma.user.findUnique({ where: { id } });
      if (!u) return null;
      return { ...u, createdAt: ts(u.createdAt) };
    },

    create: async (data: Omit<User, "id" | "createdAt">): Promise<User> => {
      const u = await prisma.user.create({
        data: { 
          email: data.email.toLowerCase().trim(), 
          name: data.name.trim(), 
          passwordHash: data.passwordHash || null 
        },
      });
      return { ...u, createdAt: ts(u.createdAt) };
    },

    updateAsync: async (id: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> => {
      const u = await prisma.user.update({
        where: { id },
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.avatar !== undefined && { avatar: updates.avatar }),
          ...(updates.jobTitle !== undefined && { jobTitle: updates.jobTitle }),
          ...(updates.location !== undefined && { location: updates.location }),
          ...(updates.bio !== undefined && { bio: updates.bio }),
          ...(updates.website !== undefined && { website: updates.website }),
          ...(updates.github !== undefined && { github: updates.github }),
        },
      });
      return { ...u, createdAt: ts(u.createdAt) };
    },
  },

  // ── Resumes ────────────────────────────────────────────────────────────────
  resumes: {
    findMany: async (userId: string): Promise<Resume[]> => {
      const rows = await prisma.resume.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
      return rows.map((r) => ({
        ...r,
        sourceType: (r.sourceType as "uploaded" | "built") ?? "built",
        content: r.content as unknown as ResumeContent,
        subscores: r.subscores as unknown as ATSSubscores,
        suggestions: r.suggestions as unknown as AISuggestion[],
        createdAt: ts(r.createdAt),
        updatedAt: ts(r.updatedAt),
      }));
    },

    findUnique: async (id: string): Promise<Resume | null> => {
      const r = await prisma.resume.findUnique({ where: { id } });
      if (!r) return null;
      return {
        ...r,
        sourceType: (r.sourceType as "uploaded" | "built") ?? "built",
        content: r.content as unknown as ResumeContent,
        subscores: r.subscores as unknown as ATSSubscores,
        suggestions: r.suggestions as unknown as AISuggestion[],
        createdAt: ts(r.createdAt),
        updatedAt: ts(r.updatedAt),
      };
    },

    create: async (data: Omit<Resume, "id" | "createdAt" | "updatedAt" | "version">): Promise<Resume> => {
      const r = await prisma.resume.create({
        data: {
          userId: data.userId,
          name: data.name,
          rawText: data.rawText,
          content: data.content as object,
          atsScore: data.atsScore,
          subscores: data.subscores as object,
          suggestions: data.suggestions as object,
          roastText: data.roastText,
          version: 1,
          sourceType: data.sourceType ?? "built",
          originalPdfBase64: data.originalPdfBase64 ?? null,
        },
      });
      return {
        ...r,
        sourceType: (r.sourceType as "uploaded" | "built") ?? "built",
        content: r.content as unknown as ResumeContent,
        subscores: r.subscores as unknown as ATSSubscores,
        suggestions: r.suggestions as unknown as AISuggestion[],
        createdAt: ts(r.createdAt),
        updatedAt: ts(r.updatedAt),
      };
    },

    update: async (id: string, updates: Partial<Omit<Resume, "id" | "userId" | "createdAt">>): Promise<Resume | null> => {
      const existing = await prisma.resume.findUnique({ where: { id } });
      if (!existing) return null;

      // Archive version if content changed
      if (updates.content && JSON.stringify(existing.content) !== JSON.stringify(updates.content)) {
        await prisma.resumeVersion.create({
          data: {
            resumeId: id,
            version: existing.version,
            content: existing.content as object,
            changeDescription: updates.name
              ? `Updated Resume Content & Renamed to "${updates.name}"`
              : "Modified Resume Details",
          },
        });
      }

      const r = await prisma.resume.update({
        where: { id },
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.rawText && { rawText: updates.rawText }),
          ...(updates.content && { content: updates.content as object, version: existing.version + 1 }),
          ...(updates.atsScore !== undefined && { atsScore: updates.atsScore }),
          ...(updates.subscores && { subscores: updates.subscores as object }),
          ...(updates.suggestions && { suggestions: updates.suggestions as object }),
          ...(updates.roastText !== undefined && { roastText: updates.roastText }),
        },
      });

      return {
        ...r,
        sourceType: (r.sourceType as "uploaded" | "built") ?? "built",
        content: r.content as unknown as ResumeContent,
        subscores: r.subscores as unknown as ATSSubscores,
        suggestions: r.suggestions as unknown as AISuggestion[],
        createdAt: ts(r.createdAt),
        updatedAt: ts(r.updatedAt),
      };
    },

    delete: async (id: string): Promise<void> => {
      await prisma.resume.delete({ where: { id } });
    },
  },

  // ── Resume Versions ────────────────────────────────────────────────────────
  versions: {
    findMany: async (resumeId: string): Promise<ResumeVersion[]> => {
      const rows = await prisma.resumeVersion.findMany({ where: { resumeId } });
      return rows.map((v) => ({
        ...v,
        content: v.content as unknown as ResumeContent,
        updatedAt: ts(v.updatedAt),
      }));
    },
  },

  // ── Applications ───────────────────────────────────────────────────────────
  applications: {
    findMany: async (userId: string): Promise<JobApplication[]> => {
      const rows = await prisma.jobApplication.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
      return rows.map((a) => ({
        ...a,
        status: a.status as JobApplication["status"],
        updatedAt: ts(a.updatedAt),
      }));
    },

    create: async (data: Omit<JobApplication, "id" | "updatedAt">): Promise<JobApplication> => {
      const a = await prisma.jobApplication.create({
        data: {
          userId: data.userId,
          company: data.company,
          position: data.position,
          status: data.status,
          dateApplied: data.dateApplied,
          notes: data.notes ?? "",
        },
      });
      return { ...a, status: a.status as JobApplication["status"], updatedAt: ts(a.updatedAt) };
    },

    update: async (id: string, updates: Partial<Omit<JobApplication, "id" | "userId">>): Promise<JobApplication | null> => {
      const existing = await prisma.jobApplication.findUnique({ where: { id } });
      if (!existing) return null;
      const a = await prisma.jobApplication.update({
        where: { id },
        data: {
          ...(updates.status && { status: updates.status }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
          ...(updates.company && { company: updates.company }),
          ...(updates.position && { position: updates.position }),
          ...(updates.dateApplied && { dateApplied: updates.dateApplied }),
        },
      });
      return { ...a, status: a.status as JobApplication["status"], updatedAt: ts(a.updatedAt) };
    },

    delete: async (id: string): Promise<void> => {
      await prisma.jobApplication.delete({ where: { id } });
    },
  },

  // ── Cover Letters ──────────────────────────────────────────────────────────
  coverLetters: {
    findMany: async (userId: string): Promise<CoverLetter[]> => {
      const rows = await prisma.coverLetter.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
      return rows.map((c) => ({
        ...c,
        tone: c.tone as CoverLetter["tone"],
        createdAt: ts(c.createdAt),
      }));
    },

    create: async (data: Omit<CoverLetter, "id" | "createdAt">): Promise<CoverLetter> => {
      const c = await prisma.coverLetter.create({
        data: {
          userId: data.userId,
          resumeId: data.resumeId,
          company: data.company,
          position: data.position,
          tone: data.tone,
          content: data.content,
        },
      });
      return { ...c, tone: c.tone as CoverLetter["tone"], createdAt: ts(c.createdAt) };
    },
  },

  // ── LinkedIn Optimizations ─────────────────────────────────────────────────
  linkedinOptimizations: {
    findMany: async (userId: string): Promise<LinkedInOptimization[]> => {
      const rows = await prisma.linkedInOptimization.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
      return rows.map((l) => ({
        ...l,
        suggestions: l.suggestions as string[],
        createdAt: ts(l.createdAt),
      }));
    },

    create: async (data: Omit<LinkedInOptimization, "id" | "createdAt">): Promise<LinkedInOptimization> => {
      const l = await prisma.linkedInOptimization.create({
        data: {
          userId: data.userId,
          originalHeadline: data.originalHeadline,
          originalAbout: data.originalAbout,
          suggestedHeadline: data.suggestedHeadline,
          suggestedAbout: data.suggestedAbout,
          suggestions: data.suggestions as unknown as object[],
        },
      });
      return { ...l, suggestions: l.suggestions as string[], createdAt: ts(l.createdAt) };
    },
  },

  // ── Interview Sessions ─────────────────────────────────────────────────────
  interviews: {
    findMany: async (userId: string): Promise<InterviewSession[]> => {
      const rows = await prisma.interviewSession.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
      return rows.map((s) => ({
        ...s,
        questions: s.questions as unknown as MockQuestion[],
        createdAt: ts(s.createdAt),
      }));
    },

    findUnique: async (id: string): Promise<InterviewSession | null> => {
      const s = await prisma.interviewSession.findUnique({ where: { id } });
      if (!s) return null;
      return { ...s, questions: s.questions as unknown as MockQuestion[], createdAt: ts(s.createdAt) };
    },

    create: async (data: Omit<InterviewSession, "id" | "createdAt">): Promise<InterviewSession> => {
      const s = await prisma.interviewSession.create({
        data: {
          userId: data.userId,
          jobTitle: data.jobTitle,
          company: data.company,
          questions: data.questions as object[],
        },
      });
      return { ...s, questions: s.questions as unknown as MockQuestion[], createdAt: ts(s.createdAt) };
    },

    update: async (id: string, questions: MockQuestion[]): Promise<InterviewSession | null> => {
      const existing = await prisma.interviewSession.findUnique({ where: { id } });
      if (!existing) return null;
      const s = await prisma.interviewSession.update({
        where: { id },
        data: { questions: questions as object[] },
      });
      return { ...s, questions: s.questions as unknown as MockQuestion[], createdAt: ts(s.createdAt) };
    },
  },
};
