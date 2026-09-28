import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRestaurantRole } from "@/lib/auth/guards";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const user = await requireRestaurantRole(["RESTAURANT_ADMIN", "STAFF"]);
    if (!user.restaurantId) {
      return NextResponse.json({ success: false, message: "Restaurant access required" }, { status: 403 });
    }

    await connectDB();
    const restaurantId = new mongoose.Types.ObjectId(user.restaurantId);

    const customers = await Order.aggregate([
      { $match: { restaurantId, status: { $ne: "CANCELLED" } } },
      {
        $group: {
          _id: "$customerId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          phone: "$userDetails.phone",
          totalOrders: 1,
          totalSpent: 1,
          lastOrderDate: 1,
        },
      },
      { $sort: { lastOrderDate: -1 } },
    ]);

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error("ADMIN CUSTOMERS ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch customers" }, { status: 500 });
  }
}
