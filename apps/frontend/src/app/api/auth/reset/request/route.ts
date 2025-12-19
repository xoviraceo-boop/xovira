import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import emailService from "@/utils/email/emailService";

const JWT_SECRET = process.env.AUTH_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: "Email is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: true, message: "If account exists, a reset link was sent." });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "30m" });
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: sans-serif;">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="
          background-color:#346df1;
          color:#fff;
          padding:10px 16px;
          border-radius:6px;
          text-decoration:none;
          display:inline-block;
          margin-top:10px;
        ">Reset Password</a>
        <p style="margin-top:20px;">This link expires in 30 minutes.</p>
      </div>
    `;

    await emailService.sendNodemailerEmail(email, "Reset your password", html);

    return NextResponse.json({ success: true, message: "If account exists, a reset link was sent." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


