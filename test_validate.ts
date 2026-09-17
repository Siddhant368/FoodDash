import { connectDB } from "./lib/db.ts";
import { OfferService } from "./lib/services/offer.service.ts";
import Cart from "./models/Cart.ts";
import mongoose from "mongoose";

async function test() {
  await connectDB();
  const cart = await Cart.findOne({ appliedCouponCode: { $exists: true, $ne: null } });
  if (!cart) {
    console.log("No cart with applied coupon found. Applying WEEKEND20...");
    const cartToUpdate = await Cart.findOne({});
    if (cartToUpdate) {
        cartToUpdate.appliedCouponCode = "WEEKEND20";
        await cartToUpdate.save();
        console.log("Applied to cart", cartToUpdate._id);
        return test();
    }
  }

  console.log("Found cart", cart._id, "with coupon", cart.appliedCouponCode);

  try {
    const res = await OfferService.validateCoupon(
      cart.appliedCouponCode,
      cart.restaurantId.toString(),
      cart.customerId.toString(),
      cart.items
    );
    console.log("Success:", res.discountAmount);
  } catch (error) {
    console.log("ERROR validation threw:", error.message);
  }

  process.exit(0);
}

test();
