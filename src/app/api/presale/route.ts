// app/api/presale/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getCurrentStage() {
  const now = new Date();
  // find an active stage
  const active = await prisma.presaleStage.findFirst({
    where: { startTime: { lte: now }, endTime: { gte: now } },
    orderBy: { stageNumber: "asc" },
  });
  if (active) return active;

  // else find upcoming stage
  const upcoming = await prisma.presaleStage.findFirst({
    where: { startTime: { gt: now } },
    orderBy: { startTime: "asc" },
  });
  return upcoming || null;
}

export async function GET(request: Request) {
  try {
    const allStages = await prisma.presaleStage.findMany({
      orderBy: { stageNumber: "asc" },
    });
    const stage = await getCurrentStage();

    let currentStage = 0;
    let endsAt = new Date().toISOString();
    let wusleRate = 0.0037;
    let listingPrice = 0.005;
    let totalWusleSupply = '15,745,652,174' ;
    let liquidityAtLaunch = '1,000,000,000';

    if (stage) {
      currentStage = stage.stageNumber;
      endsAt = stage.endTime.toISOString();
      wusleRate = stage.rate;
      listingPrice = stage.listingPrice;
    }

    return NextResponse.json({
      stages: allStages,
      currentStage,
      endsAt,
      wusleRate,
      listingPrice,
      totalWusleSupply,
      liquidityAtLaunch
    });
  } catch (err) {
    console.error("presale error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
