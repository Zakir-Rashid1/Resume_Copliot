import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateOTP, storeOTP, verifyOTP, canSendOTP, sendResetPasswordEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, code, newPassword } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Send OTP for password reset
    if (action === "send-otp") {
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        return NextResponse.json(
          { error: "No account found with this email address." },
          { status: 404 }
        );
      }

      if (!canSendOTP(normalizedEmail)) {
        return NextResponse.json(
          { error: "Verification code already sent. Please wait 60 seconds before requesting a new one." },
          { status: 429 }
        );
      }

      const otp = generateOTP();
      storeOTP(normalizedEmail, otp);

      try {
        await sendResetPasswordEmail(normalizedEmail, otp);
      } catch (err) {
        console.error("Failed to send reset password email:", err);
      }

      return NextResponse.json({
        success: true,
        message: "Password reset code sent to your email.",
      });
    }

    // 2. Verify OTP and Reset Password
    if (action === "reset-password") {
      if (!code) {
        return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
      }

      if (!newPassword) {
        return NextResponse.json({ error: "New password is required" }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const verification = verifyOTP(normalizedEmail, code);
      if (!verification.valid) {
        return NextResponse.json({ error: verification.error }, { status: 400 });
      }

      // Hash the new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: { passwordHash },
      });

      return NextResponse.json({
        success: true,
        message: "Your password has been successfully reset. You can now log in.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("Reset Password API Error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
