import nodemailer from "nodemailer";

// ─── In-memory OTP store with expiry ────────────────────────────────────────
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

// Clean up expired OTPs every 2 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of otpStore) {
      if (value.expiresAt < now) {
        otpStore.delete(key);
      }
    }
  }, 120_000);
}

/**
 * Generate a cryptographically-ish random 6-digit OTP.
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store an OTP for a given email. Overwrites any existing code for that email.
 */
export function storeOTP(email: string, code: string): void {
  otpStore.set(email.toLowerCase().trim(), {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10-minute window
    attempts: 0,
  });
}

/**
 * Verify an OTP for a given email. Returns true if valid, false otherwise.
 * Handles expiry checking and brute-force protection (max 5 attempts).
 */
export function verifyOTP(email: string, code: string): { valid: boolean; error?: string } {
  const key = email.toLowerCase().trim();
  const stored = otpStore.get(key);

  if (!stored) {
    return { valid: false, error: "No verification code found. Please request a new one." };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return { valid: false, error: "Verification code has expired. Please request a new one." };
  }

  if (stored.attempts >= 5) {
    otpStore.delete(key);
    return { valid: false, error: "Too many failed attempts. Please request a new code." };
  }

  if (stored.code !== code) {
    stored.attempts++;
    return { valid: false, error: `Incorrect code. ${5 - stored.attempts} attempts remaining.` };
  }

  // Success — remove the OTP (one-time use)
  otpStore.delete(key);
  return { valid: true };
}

/**
 * Check if we recently sent an OTP (rate limiting — 60 second cooldown).
 */
export function canSendOTP(email: string): boolean {
  const stored = otpStore.get(email.toLowerCase().trim());
  if (!stored) return true;
  // Allow resend if more than 60 seconds have passed since it was created
  const createdAt = stored.expiresAt - 10 * 60 * 1000;
  return Date.now() - createdAt > 60_000;
}

/**
 * Send the verification email using nodemailer.
 */
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    // Log the code to console in development so the developer can still test
    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║  EMAIL VERIFICATION CODE for ${email}`);
    console.log(`║  Code: ${code}`);
    console.log(`║  (Configure SMTP_HOST, SMTP_USER, SMTP_PASS`);
    console.log(`║   in .env.local to send real emails)`);
    console.log(`╚══════════════════════════════════════════════════╝\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0284c7,#38bdf8);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                ✨ ResumeCopilot
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                Email Verification
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#1e293b;font-size:15px;line-height:1.6;">
                Hello! You're almost there. Use the code below to verify your email address and complete your registration:
              </p>
              <!-- OTP Code Box -->
              <div style="background-color:#f1f5f9;border:2px dashed #0284c7;border-radius:10px;padding:20px;text-align:center;margin:24px 0;">
                <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#0284c7;font-family:'Courier New',monospace;">
                  ${code}
                </span>
              </div>
              <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.6;">
                This code will expire in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">
                &copy; ${new Date().getFullYear()} ResumeCopilot. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `ResumeCopilot <${smtpUser}>`,
    to: email,
    subject: "ResumeCopilot — Your Verification Code",
    html,
  });
}

/**
 * Send the password reset email using nodemailer.
 */
export async function sendResetPasswordEmail(email: string, code: string): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    // Log the code to console in development so the developer can still test
    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║  PASSWORD RESET CODE for ${email}`);
    console.log(`║  Code: ${code}`);
    console.log(`║  (Configure SMTP_HOST, SMTP_USER, SMTP_PASS`);
    console.log(`║   in .env.local to send real emails)`);
    console.log(`╚══════════════════════════════════════════════════╝\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                ✨ ResumeCopilot
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                Password Reset Recovery
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#1e293b;font-size:15px;line-height:1.6;">
                Hello! We received a request to reset your account password. Use the verification code below to verify your identity and set a new password:
              </p>
              <!-- OTP Code Box -->
              <div style="background-color:#f1f5f9;border:2px dashed #7c3aed;border-radius:10px;padding:20px;text-align:center;margin:24px 0;">
                <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#7c3aed;font-family:'Courier New',monospace;">
                  ${code}
                </span>
              </div>
              <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.6;">
                This code will expire in <strong>10 minutes</strong>. If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">
                &copy; ${new Date().getFullYear()} ResumeCopilot. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `ResumeCopilot <${smtpUser}>`,
    to: email,
    subject: "ResumeCopilot — Reset Your Password",
    html,
  });
}
