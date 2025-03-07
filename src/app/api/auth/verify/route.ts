// app/api/auth/verify/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // find user
    const user = await prisma.user.findFirst({
      where: {
        email,
        passwordResetToken: otp,
        passwordResetExpires: { gte: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // success - user can proceed to set new password
    // optionally we can clear the token here if we want them to only call /reset once
    // but let's keep it until they actually set the password
    return NextResponse.json({ message: "OTP verified. Proceed to reset password." });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
