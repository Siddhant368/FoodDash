import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { OfferService } from "@/lib/services/offer.service";
import Cart from "@/models/Cart";
import { requireAuth } from "@/lib/auth/guards";
import { authErrorResponse } from "@/lib/auth/errors";

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await requireAuth();
    const { code, restaurantId } = await request.json();

    if (!code || !restaurantId) {
      return NextResponse.json({ success: false, message: "Code and restaurant ID are required" }, { status: 400 });
    }

    const cart = await Cart.findOne({ customerId: user.id, restaurantId });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    try {
      const { offer } = await OfferService.validateCoupon(
        code,
        restaurantId,
        user.id,
        cart.items
      );

      // Update cart with coupon
      cart.appliedOfferId = offer._id as any;
      cart.appliedCouponCode = offer.code;
      await cart.save();

      return NextResponse.json({ success: true, message: "Coupon applied successfully", data: offer });
    } catch (validationError: any) {
      return NextResponse.json({ success: false, message: validationError.message }, { status: 400 });
    }
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("APPLY COUPON ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to apply coupon" }, { status: 500 });
  }
}
