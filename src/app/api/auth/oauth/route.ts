import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");

    if (!provider || !["google", "linkedin", "facebook"].includes(provider)) {
      return NextResponse.json({ error: "Invalid or missing provider" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/auth/callback`;

    // Detect if accessing via IP address (local network IP or standard IP).
    // Social OAuth providers do not permit IP addresses as authorized redirect URIs.
    const requestedUrl = new URL(req.url);
    const requestedHost = requestedUrl.hostname;
    const configuredHost = new URL(appUrl).hostname;
    
    const isIp = (hostname: string) => 
      /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname) || 
      /^[0-9a-fA-F:]+$/.test(hostname) || 
      hostname.endsWith(".local"); // Sandbox fallback for direct local network testing

    if (isIp(requestedHost) || isIp(configuredHost)) {
      const sandboxUrl = `${requestedUrl.protocol}//${requestedUrl.host}/auth/sandbox?provider=${provider}`;
      return NextResponse.redirect(sandboxUrl);
    }

    // 1. Google
    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (clientId && clientId !== "your-google-client-id" && clientId.trim() !== "") {
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=openid%20email%20profile&state=${provider}`;
        return NextResponse.redirect(oauthUrl);
      }
    }

    // 2. LinkedIn
    if (provider === "linkedin") {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      if (clientId && clientId !== "your-linkedin-client-id" && clientId.trim() !== "") {
        const oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=openid%20email%20profile&state=${provider}`;
        return NextResponse.redirect(oauthUrl);
      }
    }

    // 3. Facebook
    if (provider === "facebook") {
      const clientId = process.env.FACEBOOK_CLIENT_ID;
      if (clientId && clientId !== "your-facebook-client-id" && clientId.trim() !== "") {
        const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=email,public_profile&state=${provider}`;
        return NextResponse.redirect(oauthUrl);
      }
    }

    // Fallback: Redirect to Developer Sandbox
    return NextResponse.redirect(`${appUrl}/auth/sandbox?provider=${provider}`);
  } catch (err) {
    console.error("OAuth Redirect Error:", err);
    return NextResponse.json({ error: "Failed to initiate OAuth redirect" }, { status: 500 });
  }
}
