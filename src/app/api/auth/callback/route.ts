import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "platform-development-jwt-secret-key-10293";

async function handleUserLogin(email: string, name: string) {
  const cleanEmail = email.toLowerCase().trim();
  let user = await db.users.findUniqueAsync(cleanEmail);

  if (!user) {
    user = await db.users.create({
      email: cleanEmail,
      name: name.trim() || "Social User",
      passwordHash: null,
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return user;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(new URL("/?error=missing_oauth_params", req.url));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/auth/callback`;

    let email = "";
    let name = "";

    // A. Real Google OAuth
    if (state === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId || "",
          client_secret: clientSecret || "",
          redirect_uri: callbackUrl,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error_description || "Google token exchange failed");

      const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();
      if (!profileRes.ok) throw new Error("Google profile retrieval failed");

      email = profile.email;
      name = profile.name || profile.given_name || "Google User";
    }

    // B. Real LinkedIn OAuth
    else if (state === "linkedin") {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

      const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId || "",
          client_secret: clientSecret || "",
          redirect_uri: callbackUrl,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error_description || "LinkedIn token exchange failed");

      const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();
      if (!profileRes.ok) throw new Error("LinkedIn profile retrieval failed");

      email = profile.email;
      name = profile.name || `${profile.given_name} ${profile.family_name}` || "LinkedIn User";
    }

    // C. Real Facebook OAuth
    else if (state === "facebook") {
      const clientId = process.env.FACEBOOK_CLIENT_ID;
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

      const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&client_secret=${clientSecret}&code=${code}`);
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error?.message || "Facebook token exchange failed");

      const profileRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`);
      const profile = await profileRes.json();
      if (!profileRes.ok) throw new Error("Facebook profile retrieval failed");

      email = profile.email || `${profile.id}@facebook.com`;
      name = profile.name || "Facebook User";
    }

    if (!email) {
      return NextResponse.redirect(new URL("/?error=email_not_provided", req.url));
    }

    await handleUserLogin(email, name);
    return NextResponse.redirect(new URL("/dashboard?login=success", req.url));
  } catch (err) {
    console.error("OAuth Callback GET Error:", err);
    return NextResponse.redirect(new URL(`/?error=oauth_failed&message=${encodeURIComponent(err instanceof Error ? err.message : "")}`, req.url));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isMock, email, name } = await req.json();

    if (!isMock || !email) {
      return NextResponse.json({ error: "Invalid mock request parameters" }, { status: 400 });
    }

    await handleUserLogin(email, name || "Mock User");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("OAuth Callback POST Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed mock authentication" }, { status: 500 });
  }
}
