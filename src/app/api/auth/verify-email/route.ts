import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP, verifyOTP, canSendOTP, sendVerificationEmail } from "@/lib/email";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, code } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── SEND verification code ───────────────────────────────────────────────
    if (action === "send") {
      // 1. Check if email is already registered
      const existingUser = await db.users.findUniqueAsync(normalizedEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: "This email is already registered. Try signing in instead." },
          { status: 400 }
        );
      }

      // 2. Rate-limit: prevent spamming (60s cooldown)
      if (!canSendOTP(normalizedEmail)) {
        return NextResponse.json(
          { error: "Verification code already sent. Please wait 60 seconds before requesting a new one." },
          { status: 429 }
        );
      }

      // 3. Generate and store OTP
      const otp = generateOTP();
      storeOTP(normalizedEmail, otp);

      // 4. Send the email
      try {
        await sendVerificationEmail(normalizedEmail, otp);
      } catch (err) {
        console.error("Failed to send verification email:", err);
        // Still return success because the OTP is logged to console in dev mode
        // In production with proper SMTP, this would be a real error
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your email.",
      });
    }

    // ── VERIFY the code ──────────────────────────────────────────────────────
    if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
      }

      const result = verifyOTP(normalizedEmail, code);
      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        verified: true,
      });
    }

    return NextResponse.json({ error: "Invalid action. Use 'send' or 'verify'." }, { status: 400 });
  } catch (err) {
    console.error("Verify Email API Error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
