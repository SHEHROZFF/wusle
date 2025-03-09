// scripts/seed.ts
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clear existing stages
  await prisma.presaleStage.deleteMany();

  // Stage duration: 16 days (adjust as needed)
  const stageDurationDays = 16;
  
  // Current date
  const now = new Date();

  // Base date for completed stages (set sufficiently in the past)
  // For example, 50 days ago ensures that the first 3 stages have already ended.
  const completedBaseDate = new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000);
  // Base date for upcoming stages (starts tomorrow)
  const upcomingBaseDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  // Total stages = 11
  const totalStages = 11;
  // Number of completed stages
  const completedStages = 3;

  // Create completed stages (stages 1 - 3)
  for (let i = 1; i <= completedStages; i++) {
    const startTime = new Date(completedBaseDate);
    startTime.setUTCDate(startTime.getUTCDate() + (i - 1) * stageDurationDays);
    
    const endTime = new Date(startTime);
    endTime.setUTCDate(endTime.getUTCDate() + stageDurationDays - 1);

    // Sample calculations for stage data
    const rate = 0.0037 + (i - 1) * 0.0003;
    const listingPrice = 0.005;
    const target = 4110000 + (i - 1) * 100000;
    // Completed stages: raised equals target
    const raised = target;

    await prisma.presaleStage.create({
      data: {
        stageNumber: i,
        startTime,
        endTime,
        rate,
        listingPrice,
        target,
        raised,
      },
    });
  }

  // Create upcoming stages (stages 4 - 11)
  for (let i = completedStages + 1; i <= totalStages; i++) {
    // For upcoming stages, we use a different base date (starting tomorrow)
    const stageIndex = i - completedStages - 1; // 0-indexed for upcoming stages
    const startTime = new Date(upcomingBaseDate);
    startTime.setUTCDate(startTime.getUTCDate() + stageIndex * stageDurationDays);

    const endTime = new Date(startTime);
    endTime.setUTCDate(endTime.getUTCDate() + stageDurationDays - 1);

    const rate = 0.0037 + (i - 1) * 0.0003;
    const listingPrice = 0.005;
    const target = 4110000 + (i - 1) * 100000;
    // Upcoming stages: no funds raised yet
    const raised = 0;

    await prisma.presaleStage.create({
      data: {
        stageNumber: i,
        startTime,
        endTime,
        rate,
        listingPrice,
        target,
        raised,
      },
    });
  }

  console.log("Seeded 11 stages: first 3 complete, 8 upcoming!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
