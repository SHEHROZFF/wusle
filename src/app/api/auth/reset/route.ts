// app/api/auth/reset/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "email, otp, and newPassword required" },
        { status: 400 }
      );
    }

    // re-check token
    const user = await prisma.user.findFirst({
      where: {
        email,
        passwordResetToken: otp,
        passwordResetExpires: { gte: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // update user
    await prisma.user.update({
      where: { email },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}










// // app/api/auth/reset/route.ts

// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";

// const prisma = new PrismaClient();

// export async function POST(req: Request) {
//   try {
//     const { token, newPassword } = await req.json();
//     if (!token || !newPassword) {
//       return NextResponse.json(
//         { error: "Token and newPassword required" },
//         { status: 400 }
//       );
//     }

//     // 1) Find user by token (and ensure token is not expired)
//     const user = await prisma.user.findFirst({
//       where: {
//         passwordResetToken: token,
//         passwordResetExpires: { gte: new Date() },
//       },
//     });
//     if (!user) {
//       return NextResponse.json(
//         { error: "Invalid or expired token" },
//         { status: 400 }
//       );
//     }

//     // 2) Hash the new password
//     const hashed = await bcrypt.hash(newPassword, 10);

//     // 3) Update user with the new password and clear reset fields
//     await prisma.user.update({
//       where: { email: user.email },
//       data: {
//         password: hashed,
//         passwordResetToken: null,
//         passwordResetExpires: null,
//       },
//     });

//     return NextResponse.json({ message: "Password updated successfully" });
//   } catch (err) {
//     console.error("Reset password error:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }






