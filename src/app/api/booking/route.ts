import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("[DEV API] Received booking inquiry:", data);

    return NextResponse.json({
      success: true,
      message: "Booking request received (development mode).",
    });
  } catch (error) {
    console.error("[DEV API] Error processing booking:", error);
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
