import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRestaurantRole } from "@/lib/auth/guards";
import Order from "@/models/Order";

export async function GET(request: Request) {
  try {
    const user = await requireRestaurantRole(["RESTAURANT_ADMIN", "STAFF"]);
    if (!user.restaurantId) {
      return NextResponse.json({ success: false, message: "Restaurant access required" }, { status: 403 });
    }

    await connectDB();
    const restaurantId = new mongoose.Types.ObjectId(user.restaurantId);

    // Get last 7 days revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueByDay = await Order.aggregate([
      {
        $match: {
          restaurantId,
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "CANCELLED" },
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const statusCounts = await Order.aggregate([
      { $match: { restaurantId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      success: true,
      revenueByDay,
      statusCounts
    });
  } catch (error: any) {
    console.error("ADMIN ANALYTICS ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch analytics" }, { status: 500 });
  }
}
