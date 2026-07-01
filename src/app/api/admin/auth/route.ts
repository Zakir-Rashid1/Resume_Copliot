import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "platform-development-jwt-secret-key-10293";

// Helper to get configured admin credentials from environment
function getAdminCredentials() {
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "admin-secure-password-2026";
  return { adminUser, adminPass };
}

// GET: Check admin session status
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { role: string; username: string };
      if (decoded.role === "admin") {
        return NextResponse.json({ authenticated: true, username: decoded.username });
      }
    } catch {
      // Invalid token - clear cookie
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      response.cookies.delete("admin_token");
      return response;
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (err) {
    console.error("Admin session check failed:", err);
    return NextResponse.json({ authenticated: false, error: "Server error" }, { status: 500 });
  }
}

// POST: Authenticate Admin
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const { adminUser, adminPass } = getAdminCredentials();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    if (username !== adminUser || password !== adminPass) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign admin token
    const token = jwt.sign(
      { role: "admin", username: adminUser },
      JWT_SECRET,
      { expiresIn: "1d" } // 1 day session for admin safety
    );

    const response = NextResponse.json({ success: true, username: adminUser });
    
    // Set secure HTTP-only cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (err) {
    console.error("Admin authentication error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Admin Logout
export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("admin_token");
    return response;
  } catch (err) {
    console.error("Admin logout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
