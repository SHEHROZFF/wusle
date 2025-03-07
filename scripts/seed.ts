// scripts/seed.ts
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clear existing stages
  await prisma.presaleStage.deleteMany();

  // Base start date for stage 1
  const baseStartDate = new Date("2025-03-15T00:00:00Z");
  // Each stage lasts for 16 days (adjust as needed)
  const stageDurationDays = 16;

  for (let i = 1; i <= 11; i++) {
    // Calculate startTime and endTime for each stage
    const startTime = new Date(baseStartDate);
    startTime.setUTCDate(startTime.getUTCDate() + (i - 1) * stageDurationDays);
    
    const endTime = new Date(startTime);
    // Subtract 1 day to get an end date that's within the 16-day period
    endTime.setUTCDate(endTime.getUTCDate() + stageDurationDays - 1);

    // Sample data values; tweak as needed
    const rate = 0.0037 + (i - 1) * 0.0003;
    const listingPrice = 0.005;
    const target = 4110000 + (i - 1) * 100000; // increasing target per stage
    // For demonstration, only stage 1 has raised funds, others start at 0
    const raised = i === 1 ? 2069177 : 0;

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

  console.log("Seeded 11 stages!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
