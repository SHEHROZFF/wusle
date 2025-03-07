// app/api/auth/forgot/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendEmail } from "@/lib/sendEmail"; // your custom mail helper

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1) find user
    const user = await prisma.user.findUnique({ where: { email } });
    // safe response
    if (!user) {
      return NextResponse.json({
        message: "If that email is in our system, we sent an OTP."
      });
    }

    // 2) generate 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // "123456"
    const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    // 3) store in DB
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: otp,
        passwordResetExpires: expires,
      },
    });

    // 4) send email
    const html = `
      <h3>Your WUSLE Reset Code</h3>
      <p>OTP: <b>${otp}</b></p>
      <p>This code expires in 10 minutes.</p>
    `;
    await sendEmail(email, "WUSLE Password Reset OTP", html);

    return NextResponse.json({
      message: "If that email is in our system, we sent a 6-digit OTP."
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}







// //app/api/auth/forgot/route.ts

// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import crypto from "crypto";
// import { sendEmail } from "@/lib/sendEmail";

// const prisma = new PrismaClient();

// export async function POST(req: Request) {
//   try {
//     const { email } = await req.json();
//     if (!email) {
//       return NextResponse.json({ error: "Email is required" }, { status: 400 });
//     }

//     // 1) Find user
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       // "Safe" response so we don't leak user existence info
//       return NextResponse.json({
//         message: "If that email is in our system, we sent a reset link."
//       });
//     }

//     // 2) Generate a reset token
//     const token = crypto.randomBytes(32).toString("hex");
//     const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes from now

//     // 3) Save token to user record
//     await prisma.user.update({
//       where: { email },
//       data: {
//         passwordResetToken: token,
//         passwordResetExpires: expires,
//       },
//     });

//     // 4) Send email
//     const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset?token=${token}`;
//     const html = `
//       <p>You requested a password reset.</p>
//       <p>Click here to reset: <a href="${resetUrl}">${resetUrl}</a></p>
//       <p>This link will expire in 30 minutes.</p>
//     `;

//     await sendEmail(email, "Password Reset", html);

//     return NextResponse.json({
//       message: "If that email is in our system, we sent a reset link."
//     });
//   } catch (err) {
//     console.error("Forgot password error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }









// // pages/api/auth/forgot.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { PrismaClient } from "@prisma/client";
// import crypto from "crypto"; // for generating reset token
// import { sendEmail } from "@/lib/sendEmail"; // your helper

// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).json({ error: "Email is required" });
//   }

//   try {
//     // 1) Find user
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return res.status(200).json({ message: "If that email is in our system, we sent a reset link." });
//       // ^ "safe" response to not reveal user existence
//     }

//     // 2) Generate a reset token
//     const token = crypto.randomBytes(32).toString("hex");
//     const expires = new Date(Date.now() + 1000 * 60 * 30); // e.g. 30 min from now

//     // 3) Save token to user record
//     await prisma.user.update({
//       where: { email },
//       data: {
//         passwordResetToken: token,
//         passwordResetExpires: expires,
//       },
//     });

//     // 4) Send email
//     const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset?token=${token}`;
//     const html = `
//       <p>You requested a password reset.</p>
//       <p>Click here to reset: <a href="${resetUrl}">${resetUrl}</a></p>
//       <p>This link will expire in 30 minutes.</p>
//     `;

//     await sendEmail(email, "Password Reset", html);

//     return res.status(200).json({ message: "If that email is in our system, we sent a reset link." });
//   } catch (err) {
//     console.error("Forgot password error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }
