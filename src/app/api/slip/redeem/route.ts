// app/api/slip/redeem/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { redeemCode } = await req.json();
  if (!redeemCode) {
    return NextResponse.json({ error: "redeemCode is required" }, { status: 400 });
  }

  try {
    // 1) find slip by code
    const slip = await prisma.slip.findUnique({
      where: { redeemCode },
    });
    if (!slip) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 });
    }
    if (slip.isRedeemed) {
      return NextResponse.json({ error: "Already redeemed" }, { status: 400 });
    }

    // 2) Mark redeemed
    const updated = await prisma.slip.update({
      where: { redeemCode },
      data: {
        isRedeemed: true,
        redeemedAt: new Date(),
      },
    });

    // 3) (Optional) do on-chain action to actually deliver WUSLE tokens...
    console.log("Simulating coin redemption for slip", updated.id);

    return NextResponse.json({
      message: "Slip redeemed successfully",
      slip: updated,
    });
  } catch (err) {
    console.error("redeem slip error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
