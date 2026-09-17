import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "RESTAURANT_ADMIN" || !user.restaurantId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    await connectDB();
    
    const restaurant = await Restaurant.findOne({
      _id: user.restaurantId,
      isActive: true,
    });

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // Update fields
    if (data.name !== undefined) restaurant.name = data.name;
    if (data.description !== undefined) restaurant.description = data.description;
    if (data.phone !== undefined) restaurant.phone = data.phone;
    if (data.email !== undefined) restaurant.email = data.email;
    
    if (data.address) {
      restaurant.address = {
        ...restaurant.address,
        street: data.address.street !== undefined ? data.address.street : restaurant.address?.street,
      };
    }

    await restaurant.save();

    return NextResponse.json({ message: "Restaurant updated successfully", restaurant });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ message: "Failed to update restaurant" }, { status: 500 });
  }
}
