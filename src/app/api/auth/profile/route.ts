import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "platform-development-jwt-secret-key-10293";

/**
 * GET /api/auth/profile — Fetch current user's profile
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await db.users.findByIdAsync(decoded.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        jobTitle: user.jobTitle,
        location: user.location,
        bio: user.bio,
        website: user.website,
        github: user.github,
        createdAt: user.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

/**
 * PATCH /api/auth/profile — Update profile (name) or change password
 */
export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body;
    // ── Update Profile Details ───────────────────────────────────────────────
    if (action === "update-profile") {
      const { name, avatar, jobTitle, location, bio, website, github } = body;
      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { 
          name: name.trim(),
          avatar: avatar || null,
          jobTitle: jobTitle || null,
          location: location || null,
          bio: bio || null,
          website: website || null,
          github: github || null,
        },
      });

      // Reissue JWT with updated name (could also include avatar if needed, but it's okay just keeping name)
      const newToken = jwt.sign(
        { id: updated.id, email: updated.email, name: updated.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      cookieStore.set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        user: { 
          id: updated.id, 
          name: updated.name, 
          email: updated.email,
          avatar: updated.avatar,
          jobTitle: updated.jobTitle,
          location: updated.location,
          bio: updated.bio,
          website: updated.website,
          github: updated.github,
          createdAt: updated.createdAt.toISOString(),
        },
      });
    }



    // ── Change Password ──────────────────────────────────────────────────────
    if (action === "change-password") {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Both current and new passwords are required" }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      }

      if (!user.passwordHash) {
        return NextResponse.json({ error: "Cannot change password for OAuth accounts" }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({ success: true, message: "Password updated successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Profile API Error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/profile — Delete user account
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Cascade delete will remove all related data (resumes, applications, etc.)
    await prisma.user.delete({ where: { id: decoded.id } });
    
    cookieStore.delete("token");

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (err) {
    console.error("Delete Account Error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
