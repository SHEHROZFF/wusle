// app/api/slip/buy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import crypto from "crypto";
import { syncPresaleStages } from "@/lib/syncPresaleStages";
// ✅ Then use await syncPresaleStages(); after purchase




const prisma = new PrismaClient();

/**
 * Allocates a single purchase amount across multiple stages if necessary.
 * E.g. if user tries to buy 200k USDT, but current stage leftover is only 10k,
 *   we fill that 10k, move to next stage with 190k, etc.
 */
async function allocatePurchaseAcrossStages(amountPaid: number) {
  // 1) fetch all stages sorted by stageNumber
  let allStages = await prisma.presaleStage.findMany({
    orderBy: { stageNumber: "asc" },
  });

  let remainingToAllocate = amountPaid; // how much USDT left to allocate
  let totalTokensPurchased = 0;        // sum of WUSLE purchased across multiple stages

  for (const stage of allStages) {
    // if stage is already complete, skip
    if (stage.raised >= stage.target) continue;

    // how much capacity is left in this stage?
    const leftoverCapacity = stage.target - stage.raised; // in USDT
    if (leftoverCapacity <= 0) continue;

    // if we can fully fill the user purchase in this stage, do it
    if (remainingToAllocate <= leftoverCapacity) {
      // we consume 'remainingToAllocate' worth of tokens from this stage
      await prisma.presaleStage.update({
        where: { id: stage.id },
        data: { raised: { increment: remainingToAllocate } },
      });

      // how many WUSLE does that correspond to?
      const tokensThisStage = remainingToAllocate / stage.rate; // e.g. 50 USDT / 0.2 => 250 tokens
      totalTokensPurchased += tokensThisStage;

      remainingToAllocate = 0;
      break; // done
    } else {
      // we fill up the entire leftover capacity in this stage
      await prisma.presaleStage.update({
        where: { id: stage.id },
        data: { raised: { increment: leftoverCapacity } }, // ✅ correct
      });      

      // how many tokens from leftoverCapacity?
      const tokensThisStage = leftoverCapacity / stage.rate;
      totalTokensPurchased += tokensThisStage;

      // reduce the user purchase by the leftoverCapacity
      remainingToAllocate -= leftoverCapacity;
      // move on to next stage
    }
    if (remainingToAllocate <= 0) break; // in case it fits exactly
  }

  // now 'remainingToAllocate' might be >0 if user tried to buy more than total capacity
  // we do NOT fill beyond final stage. totalTokensPurchased is all they get

  return totalTokensPurchased;
}

export async function POST(req: NextRequest) {
  // 1) check user session
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) parse request body
  const { walletAddress, currency, amountPaid, wuslePurchased, txSignature } = await req.json();
  if (!walletAddress || !currency || !amountPaid || !wuslePurchased || !txSignature) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    // 3) We do partial-fill allocation across stages
    //    This ensures we don't blow out a single stage's 'raised'
    //    even if user tries to buy a large chunk
    const totalTokens = await allocatePurchaseAcrossStages(amountPaid);

    // If totalTokens < wuslePurchased from front-end, that means user tried to buy more tokens
    // than what's left in the entire presale, or floating mismatch. We simply give them totalTokens
    // they actually get from the partial fill. 
    // E.g. if user claims they'd buy 999999 tokens, but there's only 123 left, we only fill 123.
    // We'll store that in DB as well
    const actualWuslePurchased = totalTokens;

    // 4) update user stats
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        spent: { increment: amountPaid },
        wuslePurchased: { increment: actualWuslePurchased },
      },
    });

    // 5) generate unique redemption code
    const redeemCode = crypto.randomBytes(8).toString("hex");

    // 6) create slip record
    const slip = await prisma.slip.create({
      data: {
        userId: session.user.email,
        walletAddress,
        currency,
        amountPaid,
        wuslePurchased: actualWuslePurchased, // final tokens allocated
        // txSignature,
        redeemCode,
      },
    });
    // Then inside your POST handler
    await syncPresaleStages();
    

    return NextResponse.json({ message: "Slip created successfully", slip });
  } catch (err) {
    if (err && typeof err === 'object') {
      console.error("❌ Slip creation error:", err);
    } else {
      console.error("❌ Slip creation error: Unknown or null error");
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}










// // app/api/slip/buy/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { getServerSession } from "next-auth/next"; 
// import crypto from "crypto";

// const prisma = new PrismaClient();

// export async function POST(req: NextRequest) {
//   // 1) Check user session
//   const session = await getServerSession();
//   if (!session?.user?.email) {
//     return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//   }

//   // 2) Parse request body
//   const { walletAddress, currency, amountPaid, wuslePurchased } = await req.json();
//   if (!walletAddress || !currency || !amountPaid || !wuslePurchased) {
//     return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//   }

//   try {
//     // 3) Update user stats
//     await prisma.user.update({
//       where: { email: session.user.email },
//       data: {
//         spent: { increment: amountPaid },
//         wuslePurchased: { increment: wuslePurchased },
//       },
//     });

//     // 4) Fetch all stages and find the current one (first incomplete)
//     const allStages = await prisma.presaleStage.findMany({
//       orderBy: { stageNumber: "asc" },
//     });

//     const currentStage = allStages.find(stage => stage.raised < stage.target);

//     // 5) Increment raised amount in the current stage
//     if (currentStage) {
//       await prisma.presaleStage.update({
//         where: { id: currentStage.id },
//         data: {
//           raised: { increment: amountPaid },
//         },
//       });
//     } else {
//       console.warn("⚠️ No active presale stage found — all targets possibly met.");
//     }

//     // 6) Generate unique redemption code
//     const redeemCode = crypto.randomBytes(8).toString("hex");

//     // 7) Create slip record
//     const slip = await prisma.slip.create({
//       data: {
//         userId: session.user.email,
//         walletAddress,
//         currency,
//         amountPaid,
//         wuslePurchased,
//         redeemCode,
//       },
//     });

//     return NextResponse.json({
//       message: "Slip created successfully",
//       slip,
//     });

//   } catch (err) {
//     console.error("❌ Slip creation error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }











// // app/api/slip/buy/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { getServerSession } from "next-auth/next"; // or your custom auth check
// import crypto from "crypto";

// const prisma = new PrismaClient();

// export async function POST(req: NextRequest) {
//   // 1) Check user session
//   // If using next-auth:
//   const session = await getServerSession(); 
//   if (!session?.user?.email) {
//     return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//   }

//   // 2) parse body
//   const { walletAddress, currency, amountPaid, wuslePurchased } = await req.json();

//   if (!walletAddress || !currency || !amountPaid || !wuslePurchased) {
//     return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//   }

//   try {
//     // 3) "Simulate" the user paying from walletAddress to your "receiver" address
//     // In real life, you'd do a Solana or USDT on-chain transaction.
//     // For now, we just pretend it's successful.
//     console.log("Simulating wallet transfer from", walletAddress, "to your receiver...");
//     await prisma.user.update({
//       where: { email: session.user.email },
//       data: {
//         spent: { increment: amountPaid },
//         wuslePurchased: { increment: wuslePurchased },
//       },
//     });
    
//     // 4) Generate a random code for redemption
//     const code = crypto.randomBytes(8).toString("hex"); // e.g. "a1b2c3d4..."
    
//     // 5) Insert slip record in DB
//     const slip = await prisma.slip.create({
//       data: {
//         userId: session.user.email,  // or user ID if you store that
//         walletAddress,
//         currency,
//         amountPaid,
//         wuslePurchased,
//         redeemCode: code,
//       },
//     });

//     return NextResponse.json({
//       message: "Slip created successfully",
//       slip,
//     });
//   } catch (err) {
//     console.error("buy slip error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
