import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import { requireAuth } from "@/lib/auth/guards";
import { authErrorResponse } from "@/lib/auth/errors";

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await requireAuth();
    const { restaurantId } = await request.json();

    if (!restaurantId) {
      return NextResponse.json({ success: false, message: "Restaurant ID is required" }, { status: 400 });
    }

    const cart = await Cart.findOne({ customerId: user.id, restaurantId });
    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    cart.appliedOfferId = undefined;
    cart.appliedCouponCode = undefined;
    await cart.save();

    return NextResponse.json({ success: true, message: "Coupon removed successfully" });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("REMOVE COUPON ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to remove coupon" }, { status: 500 });
  }
}
