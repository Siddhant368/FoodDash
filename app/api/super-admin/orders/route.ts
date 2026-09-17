import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (searchParams.get("status")) filter.status = searchParams.get("status");
    if (searchParams.get("paymentStatus")) filter.paymentStatus = searchParams.get("paymentStatus");
    if (searchParams.get("restaurantId")) filter.restaurantId = searchParams.get("restaurantId");
    
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "restaurantId", model: Restaurant, select: "name" })
        .populate({ path: "customerId", model: User, select: "name email phone" })
        .lean(),
      Order.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.message === "FORBIDDEN" ? 403 : 500 });
  }
}
