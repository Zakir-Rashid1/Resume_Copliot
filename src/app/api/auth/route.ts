import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "platform-development-jwt-secret-key-10293";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name } = body;

    const cookieStore = await cookies();

    // 1. REGISTER ACTION
    if (action === "register") {
      if (!email || !password || !name) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }

      const existingUser = await db.users.findUniqueAsync(email);
      if (existingUser) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await db.users.create({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash,
      });

      const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, {
        expiresIn: "7d",
      });

      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        user: { id: newUser.id, email: newUser.email, name: newUser.name, avatar: newUser.avatar },
      });
    }

    // 2. LOGIN ACTION
    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
      }

      const user = await db.users.findUniqueAsync(email);
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
      }

      if (!user.passwordHash) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
        expiresIn: "7d",
      });

      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
      });
    }

    // 3. LOGOUT ACTION
    if (action === "logout") {
      cookieStore.delete("token");
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Auth API Error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
      const user = await db.users.findByIdAsync(decoded.id);

      if (!user) {
        return NextResponse.json({ authenticated: false, user: null });
      }

      return NextResponse.json({
        authenticated: true,
        user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
      });
    } catch {
      return NextResponse.json({ authenticated: false, user: null });
    }
  } catch (err) {
    console.error("Auth Session Check Error:", err);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
