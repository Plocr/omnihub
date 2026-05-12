import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return Response.json({ error: "No admin password configured" }, { status: 500 });
  }

  if (password === adminPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", password, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return response;
  }

  return Response.json({ error: "Invalid password" }, { status: 401 });
}
