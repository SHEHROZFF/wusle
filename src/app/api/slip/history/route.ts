// app/api/slip/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next"; // or your custom auth check

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const slips = await prisma.slip.findMany({
      where: { userId: session.user.email },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ slips });
  } catch (err) {
    console.error("Error fetching slip history:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
