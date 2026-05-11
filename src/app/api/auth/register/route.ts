import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Comprehensive Username vs Password Validation
    if (!username || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Invalid username or password (min 6 characters)" },
        { status: 400 }
      );
    }
    
    if (password.length > 128) {
      return NextResponse.json({ error: "Password too long (max 128 characters)" }, { status: 400 });
    }

    // Username constraints: 3-20 chars, alphanumeric+underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters long and contain only letters, numbers, and underscores." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { success: true, user: { id: user.id, username: user.username } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
