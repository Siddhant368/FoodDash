import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }
    
    let restaurant = null;
    
    if (user.restaurantId) {
      await connectDB();
      restaurant = await Restaurant.findById(user.restaurantId).select("name isOpen logo coverImage").lean();
    }

    return NextResponse.json({
      success: true,
      user,
      restaurant
    });
  } catch (error) {
    console.error("Me API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}