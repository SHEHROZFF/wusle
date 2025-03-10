// app/api/user/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
// Adjust the import path for your NextAuth config as needed:

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Get the current session
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Query the user from the database for only the fields we need
    const userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        wuslePurchased: true,
        spent: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
