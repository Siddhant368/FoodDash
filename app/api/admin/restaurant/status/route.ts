import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "RESTAURANT_ADMIN" || !user.restaurantId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    if (typeof data.isOpen !== 'boolean') {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    await connectDB();
    
    const restaurant = await Restaurant.findOne({
      _id: user.restaurantId,
      isActive: true,
    });

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // Update isOpen status
    restaurant.isOpen = data.isOpen;
    await restaurant.save();

    return NextResponse.json({ success: true, message: "Restaurant status updated successfully", restaurant });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json({ success: false, message: "Failed to update status" }, { status: 500 });
  }
}
