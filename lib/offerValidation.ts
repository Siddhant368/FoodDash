import mongoose from "mongoose";
import Offer from "@/models/Offer";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import MenuItem from "@/models/MenuItem";

export async function validateOffer(
  restaurantId: string,
  customerId: string,
  code: string,
  cartItems: any[],
  subtotal: number,
  deliveryFee: number
) {
  const offer = await Offer.findOne({
    restaurantId,
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!offer) {
    return { valid: false, message: "Invalid or inactive coupon code." };
  }

  const now = new Date();
  if (now < offer.startDate) {
    return { valid: false, message: "This offer is not active yet." };
  }
  if (now > offer.endDate) {
    return { valid: false, message: "This offer has expired." };
  }

  if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
    return { valid: false, message: "This coupon has reached its usage limit." };
  }

  if (subtotal < offer.minOrderAmount) {
    return { valid: false, message: `Minimum order amount is ₹${offer.minOrderAmount}.` };
  }

  const userUsageCount = await Order.countDocuments({
    customerId,
    offerId: offer._id,
    status: { $ne: "CANCELLED" },
  });

  if (userUsageCount >= offer.perCustomerLimit) {
    return { valid: false, message: "You have already used this coupon." };
  }

  let eligibleSubtotal = 0;
  
  if (offer.applicableTo === "ALL") {
    eligibleSubtotal = subtotal;
  } else if (offer.applicableTo === "CATEGORY") {
    // Requires fetching menu items to check categories
    // For simplicity in this demo, let's assume we do this in the caller or here
    // In a full implementation, we'd map cartItems to categories
    eligibleSubtotal = subtotal; // Placeholder
  } else if (offer.applicableTo === "MENU_ITEM") {
    // Filter cart items by menuItemIds
    eligibleSubtotal = subtotal; // Placeholder
  }

  let discountAmount = 0;
  let deliveryDiscount = 0;

  if (offer.discountType === "PERCENTAGE") {
    discountAmount = (eligibleSubtotal * offer.discountValue) / 100;
    if (offer.maxDiscount && discountAmount > offer.maxDiscount) {
      discountAmount = offer.maxDiscount;
    }
  } else if (offer.discountType === "FLAT") {
    discountAmount = offer.discountValue;
  } else if (offer.discountType === "FREE_DELIVERY") {
    deliveryDiscount = deliveryFee;
  }

  if (discountAmount > eligibleSubtotal) {
    discountAmount = eligibleSubtotal;
  }

  const finalTotal = subtotal - discountAmount + deliveryFee - deliveryDiscount;

  return {
    valid: true,
    offerId: offer._id,
    code: offer.code,
    discountAmount,
    deliveryDiscount,
    finalTotal,
  };
}
