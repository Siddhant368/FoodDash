import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/guards";
import { authErrorResponse } from "@/lib/auth/errors";

export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json({
      success: true,
      message: "Protected API working",
      user,
    });
  } catch (error) {
    const response = authErrorResponse(error);

    if (response) {
      return response;
    }

    console.error("Protected API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
