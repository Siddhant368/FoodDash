import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    const { id } = await params;
    
    const order = await Order.findById(id)
      .populate({ path: "restaurantId", model: Restaurant, select: "name email phone" })
      .populate({ path: "customerId", model: User, select: "name email phone" })
      .lean();

    if (!order) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
