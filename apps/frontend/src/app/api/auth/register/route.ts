import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import emailService from "@/utils/email/emailService";

const JWT_SECRET = process.env.AUTH_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    const token = jwt.sign({ email, password: hash }, JWT_SECRET, { expiresIn: "30m" });

    const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;

    const html = `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Confirm your email</h2>
        <p>Click the button below to confirm your account and complete registration:</p>
        <a href="${verifyUrl}" style="
          background-color: #346df1;
          color: white;
          padding: 10px 16px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          margin-top: 10px;
        ">Confirm Email</a>
        <p style="margin-top: 20px;">This link will expire in 30 minutes.</p>
      </div>
    `;
    await emailService.sendNodemailerEmail(email, `Confirm your email`, html);
    return NextResponse.json({ success: true, message: "Verification email sent" });
  } catch (e) {
    console.error("Error sending verification email:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
