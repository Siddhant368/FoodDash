import mongoose from "mongoose";
import Offer, { IOffer } from "@/models/Offer";
import Order from "@/models/Order";
import MenuItem from "@/models/MenuItem";
import { ICartItem } from "@/models/Cart";
import moment from "moment-timezone";

export class OfferService {
  /**
   * Validate if a coupon is valid for a cart
   */
  static async validateCoupon(
    code: string,
    restaurantId: string,
    customerId: string,
    cartItems: ICartItem[]
  ) {
    const offer = await Offer.findOne({
      code: code.toUpperCase(),
      restaurantId,
      isActive: true,
    });

    if (!offer) {
      throw new Error("Invalid or inactive coupon code.");
    }

    // Check dates and times using India timezone as requested
    const now = moment().tz("Asia/Kolkata");
    const startDate = moment(offer.startDate).tz("Asia/Kolkata").startOf("day");
    const endDate = moment(offer.endDate).tz("Asia/Kolkata").endOf("day");

    if (now.isBefore(startDate)) {
      throw new Error("This offer has not started yet.");
    }
    if (now.isAfter(endDate)) {
      throw new Error("This offer has expired.");
    }

    if (offer.startTime && offer.endTime) {
      const currentTime = now.format("HH:mm");
      if (currentTime < offer.startTime || currentTime > offer.endTime) {
        throw new Error(`This offer is only valid between ${offer.startTime} and ${offer.endTime}.`);
      }
    }

    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
      throw new Error("This coupon has reached its usage limit.");
    }

    if (offer.perCustomerLimit) {
      const customerOrdersCount = await Order.countDocuments({
        customerId,
        offerId: offer._id,
        status: { $nin: ["CANCELLED"] },
      });

      if (customerOrdersCount >= offer.perCustomerLimit) {
        throw new Error("You have reached the usage limit for this coupon.");
      }
    }

    // Fetch menu items to calculate subtotal and check applicability
    const itemIds = cartItems.map((item) => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds } });

    let totalSubtotal = 0;
    let eligibleSubtotal = 0;

    cartItems.forEach((cartItem) => {
      const menuItem = menuItems.find(
        (m) => m._id.toString() === cartItem.menuItemId.toString()
      );
      if (menuItem) {
        const itemTotal = menuItem.price * cartItem.quantity;
        totalSubtotal += itemTotal;

        // Check if item is eligible for the discount
        let isEligible = false;
        if (offer.applicableTo === "ALL") {
          isEligible = true;
        } else if (offer.applicableTo === "CATEGORY") {
          if (
            offer.categoryIds &&
            offer.categoryIds.some(
              (catId) => catId.toString() === menuItem.categoryId.toString()
            )
          ) {
            isEligible = true;
          }
        } else if (offer.applicableTo === "MENU_ITEM") {
          if (
            offer.menuItemIds &&
            offer.menuItemIds.some(
              (id) => id.toString() === menuItem._id.toString()
            )
          ) {
            isEligible = true;
          }
        }

        if (isEligible) {
          eligibleSubtotal += itemTotal;
        }
      }
    });

    if (totalSubtotal < offer.minOrderAmount) {
      throw new Error(`Minimum order amount for this offer is ₹${offer.minOrderAmount}.`);
    }

    if (eligibleSubtotal === 0 && offer.applicableTo !== "ALL") {
      throw new Error("This coupon is not applicable to the items in your cart.");
    }

    // Calculate discount
    let discountAmount = 0;
    if (offer.discountType === "PERCENTAGE") {
      discountAmount = (eligibleSubtotal * offer.discountValue) / 100;
      if (offer.maxDiscount && discountAmount > offer.maxDiscount) {
        discountAmount = offer.maxDiscount;
      }
    } else if (offer.discountType === "FLAT") {
      discountAmount = offer.discountValue;
      if (discountAmount > eligibleSubtotal) {
          discountAmount = eligibleSubtotal; // Don't allow negative subtotal
      }
    } else if (offer.discountType === "FREE_DELIVERY") {
      // Free delivery discount logic handled at checkout
      discountAmount = 0; 
    }

    return {
      offer,
      discountAmount,
      totalSubtotal,
      eligibleSubtotal
    };
  }
}
