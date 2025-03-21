import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * - Finds the first stage that hasn't met its target (raised < target).
 *   Or if all are sold out, returns the last stage by default.
 * - Checks two scenarios:
 *     A) If `raised >= target` and time hasn't ended yet (early completion),
 *        sets stage.endTime = now and shifts subsequent stages earlier.
 *     B) If `raised < target` but endTime has passed, we extend endTime by X days
 *        and shift subsequent stages later.
 * - Returns the newly determined "current stage."
 */
async function syncPresaleStages() {
  // 1) Get all stages in ascending order
  let allStages = await prisma.presaleStage.findMany({
    orderBy: { stageNumber: "asc" },
  });
  if (!allStages.length) {
    throw new Error("No presale stages found in the database.");
  }

  const now = new Date();

  // 2) Find the "current" stage as the first incomplete, or the last if all complete
  let currentStageIndex = allStages.findIndex(s => s.raised < s.target);
  if (currentStageIndex === -1) {
    currentStageIndex = allStages.length - 1;
  }
  let currentStage = allStages[currentStageIndex];

  // 3) SCENARIO A: Early completion => stage.raised >= stage.target BUT now < endTime
  //    (This means the stage finished funding early.)
  if (currentStage.raised >= currentStage.target && now < currentStage.endTime) {
    // We shorten the stage's endTime to 'now'
    currentStage = await prisma.presaleStage.update({
      where: { id: currentStage.id },
      data: {
        endTime: now, // Or now.toISOString()
      },
    });
    allStages[currentStageIndex] = currentStage;
  }
  // 4) SCENARIO B: Not met => stage.raised < stage.target BUT endTime < now => extension
  else if (currentStage.raised < currentStage.target && currentStage.endTime < now) {
    const extensionDays = 7;
    const extendedEndTime = new Date(currentStage.endTime);
    extendedEndTime.setDate(extendedEndTime.getDate() + extensionDays);

    currentStage = await prisma.presaleStage.update({
      where: { id: currentStage.id },
      data: {
        endTime: extendedEndTime,
      },
    });
    allStages[currentStageIndex] = currentStage;
  }
  // else: no changes needed to the currentStage's endTime

  // 5) SHIFT FUTURE STAGES
  //    Ensure each subsequent stage starts exactly at the previous stage’s endTime,
  //    preserving the stage's original duration.
  for (let i = currentStageIndex + 1; i < allStages.length; i++) {
    const prev = allStages[i - 1];
    const next = allStages[i];

    // The original duration for 'next' stage
    const originalDuration = next.endTime.getTime() - next.startTime.getTime();

    const newStart = new Date(prev.endTime);
    const newEnd = new Date(newStart.getTime() + originalDuration);

    // Update DB
    const updated = await prisma.presaleStage.update({
      where: { id: next.id },
      data: {
        startTime: newStart,
        endTime: newEnd,
      },
    });

    allStages[i] = updated;
  }

  // Re-fetch to have the latest data
  allStages = await prisma.presaleStage.findMany({
    orderBy: { stageNumber: "asc" },
  });

  // The "current stage" might have changed if we ended a stage early and moved on
  let newCurrent = allStages.find(s => s.raised < s.target);
  if (!newCurrent) {
    newCurrent = allStages[allStages.length - 1];
  }

  return { allStages, currentStage: newCurrent };
}

export async function GET() {
  try {
    // 1) Sync your stages for both "early finish" & "extension" scenarios
    const { allStages, currentStage } = await syncPresaleStages();

    // 2) Prepare the typical data for your front-end
    const totalWusleSupply = process.env.TOTAL_WUSLE_SUPPLY || "30,000,000";
    const liquidityAtLaunch = process.env.LIQUIDITY_AT_LAUNCH || "5,000,000";

    // Basic fallback
    let endsAt = currentStage.endTime.toISOString();
    let wusleRate = currentStage.rate;
    let listingPrice = currentStage.listingPrice;

    return NextResponse.json({
      stages: allStages,
      currentStage: currentStage.stageNumber,
      endsAt,
      wusleRate,
      listingPrice,
      totalWusleSupply,
      liquidityAtLaunch,
    });
  } catch (err) {
    console.error("presale error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}










// // app/api/presale/route.ts
// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function getCurrentStage() {
//   // Fetch all stages ordered by stageNumber
//   const allStages = await prisma.presaleStage.findMany({
//     orderBy: { stageNumber: "asc" },
//   });
//   // Return the first stage that hasn't sold all tokens (raised < target)
//   const current = allStages.find(stage => stage.raised < stage.target);
//   // Fallback: if all stages are sold out, return the last stage
//   return current || allStages[allStages.length - 1];
// }

// export async function GET(request: Request) {
//   try {
//     const allStages = await prisma.presaleStage.findMany({
//       orderBy: { stageNumber: "asc" },
//     });
//     const stage = await getCurrentStage();

//     let currentStage = 0;
//     let endsAt = new Date().toISOString();
//     let wusleRate = 0.0037;
//     let listingPrice = 0.005;
//     // ...
//     let totalWusleSupply = process.env.TOTAL_WUSLE_SUPPLY || '30,000,000';
//     let liquidityAtLaunch = process.env.LIQUIDITY_AT_LAUNCH || '5,000,000';
//     // ...

//     if (stage) {
//       currentStage = stage.stageNumber;
//       endsAt = stage.endTime.toISOString();
//       wusleRate = stage.rate;
//       listingPrice = stage.listingPrice;
//     }

//     return NextResponse.json({
//       stages: allStages,
//       currentStage,
//       endsAt,
//       wusleRate,
//       listingPrice,
//       totalWusleSupply,
//       liquidityAtLaunch
//     });
//   } catch (err) {
//     console.error("presale error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }








// // app/api/presale/route.ts
// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function getCurrentStage() {
//   const now = new Date();
//   // find an active stage
//   const active = await prisma.presaleStage.findFirst({
//     where: { startTime: { lte: now }, endTime: { gte: now } },
//     orderBy: { stageNumber: "asc" },
//   });
//   if (active) return active;

//   // else find upcoming stage
//   const upcoming = await prisma.presaleStage.findFirst({
//     where: { startTime: { gt: now } },
//     orderBy: { startTime: "asc" },
//   });
//   return upcoming || null;
// }

// export async function GET(request: Request) {
//   try {
//     const allStages = await prisma.presaleStage.findMany({
//       orderBy: { stageNumber: "asc" },
//     });
//     const stage = await getCurrentStage();

//     let currentStage = 0;
//     let endsAt = new Date().toISOString();
//     let wusleRate = 0.0037;
//     let listingPrice = 0.005;
//     let totalWusleSupply = '30,000,000'; ;
//     let liquidityAtLaunch = '5,000,000';

//     if (stage) {
//       currentStage = stage.stageNumber;
//       endsAt = stage.endTime.toISOString();
//       wusleRate = stage.rate;
//       listingPrice = stage.listingPrice;
//     }

//     return NextResponse.json({
//       stages: allStages,
//       currentStage,
//       endsAt,
//       wusleRate,
//       listingPrice,
//       totalWusleSupply,
//       liquidityAtLaunch
//     });
//   } catch (err) {
//     console.error("presale error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
