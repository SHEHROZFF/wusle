// app/api/signup/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Basic validation – expand as needed
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashed = await hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
