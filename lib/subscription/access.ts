import mongoose from "mongoose";

import Subscription from "@/models/Subscription";
import Plan from "@/models/Plan";

export async function getValidSubscription(
  restaurantId: string | mongoose.Types.ObjectId
) {
  const subscription =
    await Subscription.findOne({
      restaurantId,
      status: "ACTIVE",
      endDate: {
        $gt: new Date(),
      },
    })
      .populate({
        path: "planId",
        model: Plan,
        select:
          "_id name slug price billingCycle features maxStaff maxDeliveryPartners maxMenuItems isActive",
      })
      .lean();

  if (!subscription) {
    return null;
  }

  const plan = subscription.planId as any;

  if (
    !plan ||
    typeof plan !== "object" ||
    !plan.isActive
  ) {
    return null;
  }

  return {
    subscription,
    plan,
  };
}


export async function hasActiveSubscription(
  restaurantId: string
) {
  const subscription =
    await getValidSubscription(
      restaurantId
    );

  return Boolean(subscription);
}


export async function requireActiveSubscription(
  restaurantId: string
) {
  const subscription =
    await getValidSubscription(
      restaurantId
    );

  if (!subscription) {
    throw new Error(
      "SUBSCRIPTION_REQUIRED"
    );
  }

  return subscription;
}