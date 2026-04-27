import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Secure comparison on the server
    const isMatched = 
      email.toLowerCase() === adminEmail?.toLowerCase() && 
      password === adminPassword;

    return NextResponse.json({ isAdmin: isMatched });
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
