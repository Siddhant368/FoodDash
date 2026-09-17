import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { authErrorResponse } from "@/lib/auth/errors";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import { requireRestaurantAccess } from "@/lib/auth/restaurant-access";
import { accessErrorResponse } from "@/lib/auth/access-response";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { user } = await requireRestaurantAccess();

    const [totalItems, availableItems, featuredItems, totalCategories] = await Promise.all([
      MenuItem.countDocuments({ restaurantId: user.restaurantId! }),
      MenuItem.countDocuments({ restaurantId: user.restaurantId!, isAvailable: true }),
      MenuItem.countDocuments({ restaurantId: user.restaurantId!, isFeatured: true }),
      Category.countDocuments({ restaurantId: user.restaurantId! })
    ]);

    const unavailableItems = totalItems - availableItems;

    return NextResponse.json({
      success: true,
      data: {
        totalItems,
        availableItems,
        unavailableItems,
        featuredItems,
        totalCategories
      }
    });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("GET ADMIN MENU STATS ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch menu stats" }, { status: 500 });
  }
}
