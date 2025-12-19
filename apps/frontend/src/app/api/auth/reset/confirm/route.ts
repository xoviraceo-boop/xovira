import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.AUTH_SECRET!;

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword)
      return NextResponse.json({ message: "Missing token or password" }, { status: 400 });

    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    const { email } = decoded;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const hash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hash },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
  }
}


