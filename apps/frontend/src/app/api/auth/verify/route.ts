import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.AUTH_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; password: string };

    const existing = await prisma.user.findUnique({ where: { email: decoded.email } });
    if (existing) {
      return NextResponse.redirect(`${APP_URL}/login?alreadyVerified=true`);
    }

    await prisma.user.create({
      data: {
        email: decoded.email,
        password: decoded.password,
        onboardingStep: 1,
        onboardingCompleted: false,
      },
    });
    return NextResponse.redirect(`${APP_URL}/login`);
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
  }
}

