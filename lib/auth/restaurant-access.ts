import mongoose from "mongoose";

import Restaurant from "@/models/Restaurant";
import {
  requireRestaurantUser,
  requireRestaurantRole,
} from "@/lib/auth/guards";
import { getValidSubscription } from "@/lib/subscription/access";

/**
 * Common restaurant access check.
 *
 * Checks:
 * 1. User has restaurantId
 * 2. Restaurant exists
 * 3. Restaurant is active
 * 4. Restaurant has valid active subscription
 */
async function validateRestaurantAccess(user: {
  restaurantId: string | null;
}) {
  if (
    !user.restaurantId ||
    !mongoose.Types.ObjectId.isValid(user.restaurantId)
  ) {
    throw new Error("RESTAURANT_REQUIRED");
  }

  const restaurant = await Restaurant.findOne({
    _id: user.restaurantId,
    isActive: true,
  })
    .select("_id name slug isActive isOpen")
    .lean();

  if (!restaurant) {
    throw new Error("RESTAURANT_INACTIVE");
  }

  const subscription = await getValidSubscription(
    user.restaurantId
  );

  if (!subscription) {
    throw new Error("SUBSCRIPTION_REQUIRED");
  }

  return {
    user,
    restaurant,
    subscription,
  };
}

/**
 * General restaurant user access.
 */
export async function requireRestaurantAccess() {
  const user = await requireRestaurantUser();

  return validateRestaurantAccess(user);
}

/**
 * Restaurant Admin + Staff access.
 */
export async function requireRestaurantStaffAccess() {
  const user = await requireRestaurantRole([
    "RESTAURANT_ADMIN",
    "STAFF",
  ]);

  return validateRestaurantAccess(user);
}

/**
 * Restaurant Admin only access.
 */
export async function requireRestaurantAdminAccess() {
  const user = await requireRestaurantRole([
    "RESTAURANT_ADMIN",
  ]);

  return validateRestaurantAccess(user);
}