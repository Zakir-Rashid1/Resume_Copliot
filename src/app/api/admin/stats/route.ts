import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "platform-development-jwt-secret-key-10293";

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Database Ping Check
    let dbStatus = "Healthy";
    let dbPingMs = 0;
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbPingMs = Date.now() - start;
    } catch (err) {
      console.error("Database status check failed:", err);
      dbStatus = "Unreachable";
    }

    // 2. Query dashboard metrics
    const totalUsers = await prisma.user.count();
    const totalResumes = await prisma.resume.count();
    const totalCoverLetters = await prisma.coverLetter.count();
    const totalApplications = await prisma.jobApplication.count();
    const totalInterviews = await prisma.interviewSession.count();
    const totalLinkedIn = await prisma.linkedInOptimization.count();

    // Source types breakdown
    const builtResumesCount = await prisma.resume.count({
      where: { sourceType: "built" }
    });
    const uploadedResumesCount = await prisma.resume.count({
      where: { sourceType: "uploaded" }
    });

    // 3. Query detailed registries
    // Fetch users with resume & application counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        jobTitle: true,
        website: true,
        github: true,
        createdAt: true,
        _count: {
          select: {
            resumes: true,
            applications: true,
            coverLetters: true,
            interviews: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Fetch resumes with owners
    const resumes = await prisma.resume.findMany({
      select: {
        id: true,
        name: true,
        sourceType: true,
        atsScore: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Fetch applications with owners
    const applications = await prisma.jobApplication.findMany({
      select: {
        id: true,
        company: true,
        position: true,
        status: true,
        dateApplied: true,
        notes: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return NextResponse.json({
      success: true,
      health: {
        status: dbStatus,
        pingMs: dbPingMs,
        provider: "PostgreSQL (Supabase)",
        clientVersion: "Prisma v7.8.0",
        timestamp: new Date().toISOString()
      },
      stats: {
        totalUsers,
        totalResumes,
        totalCoverLetters,
        totalApplications,
        totalInterviews,
        totalLinkedIn,
        builtResumesCount,
        uploadedResumesCount
      },
      registries: {
        users,
        resumes,
        applications
      }
    });
  } catch (err) {
    console.error("Admin stats compilation error:", err);
    const message = err instanceof Error ? err.message : "Failed to compile admin stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
