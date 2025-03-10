// app/api/slip/buy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next"; // or your custom auth check
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  // 1) Check user session
  // If using next-auth:
  const session = await getServerSession(); 
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) parse body
  const { walletAddress, currency, amountPaid, wuslePurchased } = await req.json();

  if (!walletAddress || !currency || !amountPaid || !wuslePurchased) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    // 3) "Simulate" the user paying from walletAddress to your "receiver" address
    // In real life, you'd do a Solana or USDT on-chain transaction.
    // For now, we just pretend it's successful.
    console.log("Simulating wallet transfer from", walletAddress, "to your receiver...");
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        spent: { increment: amountPaid },
        wuslePurchased: { increment: wuslePurchased },
      },
    });
    
    // 4) Generate a random code for redemption
    const code = crypto.randomBytes(8).toString("hex"); // e.g. "a1b2c3d4..."
    
    // 5) Insert slip record in DB
    const slip = await prisma.slip.create({
      data: {
        userId: session.user.email,  // or user ID if you store that
        walletAddress,
        currency,
        amountPaid,
        wuslePurchased,
        redeemCode: code,
      },
    });

    return NextResponse.json({
      message: "Slip created successfully",
      slip,
    });
  } catch (err) {
    console.error("buy slip error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
