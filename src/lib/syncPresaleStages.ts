import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Synchronizes presale stages:
 * - Ends any completed stages early.
 * - Extends current stage if expired.
 * - Shifts future stages only from the last updated stage.
 */
export async function syncPresaleStages() {
  let allStages = await prisma.presaleStage.findMany({
    orderBy: { stageNumber: "asc" },
  });

  if (!allStages.length) throw new Error("No presale stages found.");

  const now = new Date();
  let shiftFromIndex = -1; // Track where we should begin shifting

  // Step 1: End all fully funded stages early
  for (let i = 0; i < allStages.length; i++) {
    const stage = allStages[i];
    if (stage.raised >= stage.target && stage.endTime > now) {
      const endNow = new Date(now.getTime() + 1000); // add 1s to ensure time change
      const updatedStage = await prisma.presaleStage.update({
        where: { id: stage.id },
        data: { endTime: endNow },
      });
      console.log(`⏱️ Stage ${stage.stageNumber} ended early at ${endNow}`);
      allStages[i] = updatedStage;
      shiftFromIndex = i; // shift from this stage
    }
  }

  // Refresh allStages in case multiple early ends
  allStages = await prisma.presaleStage.findMany({
    orderBy: { stageNumber: "asc" },
  });

  // Step 2: Find current stage (first incomplete)
  let currentStageIndex = allStages.findIndex((s) => s.raised < s.target);
  if (currentStageIndex === -1) currentStageIndex = allStages.length - 1;
  let currentStage = allStages[currentStageIndex];

  // Step 3: Extend current stage if expired and incomplete
  if (currentStage.raised < currentStage.target && currentStage.endTime < now) {
    const extendedEnd = new Date(currentStage.endTime);
    extendedEnd.setDate(extendedEnd.getDate() + 7); // Extend by 7 days
    currentStage = await prisma.presaleStage.update({
      where: { id: currentStage.id },
      data: { endTime: extendedEnd },
    });
    console.log(`🕒 Stage ${currentStage.stageNumber} extended to ${extendedEnd}`);
    allStages[currentStageIndex] = currentStage;
    shiftFromIndex = Math.min(shiftFromIndex === -1 ? currentStageIndex : shiftFromIndex, currentStageIndex);
  }

  // Step 4: Shift future stages from shiftFromIndex
  if (shiftFromIndex !== -1) {
    let prevStage = allStages[shiftFromIndex];
    for (let i = shiftFromIndex + 1; i < allStages.length; i++) {
      const nextStage = allStages[i];
      const duration = nextStage.endTime.getTime() - nextStage.startTime.getTime();

      const newStart = new Date(prevStage.endTime);
      const newEnd = new Date(newStart.getTime() + duration);

      const updated = await prisma.presaleStage.update({
        where: { id: nextStage.id },
        data: {
          startTime: newStart,
          endTime: newEnd,
        },
      });

      console.log(`🔄 Shifted Stage ${updated.stageNumber}: Start=${newStart} End=${newEnd}`);
      allStages[i] = updated;
      prevStage = updated;
    }
  } else {
    console.log("⚠️ No stages ended early or extended. No shift needed.");
  }

  // Final fetch for accurate response
  allStages = await prisma.presaleStage.findMany({
    orderBy: { stageNumber: "asc" },
  });

  let newCurrent = allStages.find((s) => s.raised < s.target);
  if (!newCurrent) newCurrent = allStages[allStages.length - 1];

  return { allStages, currentStage: newCurrent };
}









// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// /**
//  * Synchronizes presale stages:
//  * - Ends current stage early if fully funded.
//  * - Extends current stage if incomplete and time expired.
//  * - Shifts future stages based on updated timing.
//  */
// export async function syncPresaleStages() {
//   let allStages = await prisma.presaleStage.findMany({
//     orderBy: { stageNumber: "asc" },
//   });

//   if (!allStages.length) {
//     throw new Error("No presale stages found.");
//   }

//   const now = new Date();

//   // Find first incomplete stage
//   let currentStageIndex = allStages.findIndex((s) => s.raised < s.target);
//   if (currentStageIndex === -1) {
//     currentStageIndex = allStages.length - 1;
//   }

//   let currentStage = allStages[currentStageIndex];

//   // A) Early completion
//   if (currentStage.raised >= currentStage.target && now < currentStage.endTime) {
//     currentStage = await prisma.presaleStage.update({
//       where: { id: currentStage.id },
//       data: { endTime: now },
//     });
//     allStages[currentStageIndex] = currentStage;
//   }
//   // B) Extend stage if expired
//   else if (currentStage.raised < currentStage.target && currentStage.endTime < now) {
//     const extensionDays = 7;
//     const extendedEnd = new Date(currentStage.endTime);
//     extendedEnd.setDate(extendedEnd.getDate() + extensionDays);

//     currentStage = await prisma.presaleStage.update({
//       where: { id: currentStage.id },
//       data: { endTime: extendedEnd },
//     });
//     allStages[currentStageIndex] = currentStage;
//   }

//   // Shift future stages
//   for (let i = currentStageIndex + 1; i < allStages.length; i++) {
//     const prev = allStages[i - 1];
//     const next = allStages[i];
//     const duration = next.endTime.getTime() - next.startTime.getTime();

//     const newStart = new Date(prev.endTime);
//     const newEnd = new Date(newStart.getTime() + duration);

//     const updated = await prisma.presaleStage.update({
//       where: { id: next.id },
//       data: {
//         startTime: newStart,
//         endTime: newEnd,
//       },
//     });

//     allStages[i] = updated;
//   }

//   // Refresh accurate data
//   allStages = await prisma.presaleStage.findMany({
//     orderBy: { stageNumber: "asc" },
//   });

//   let newCurrent = allStages.find((s) => s.raised < s.target);
//   if (!newCurrent) {
//     newCurrent = allStages[allStages.length - 1];
//   }

//   return { allStages, currentStage: newCurrent };
// }
