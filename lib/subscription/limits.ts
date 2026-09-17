import mongoose from "mongoose";

import User from "@/models/User";
import MenuItem from "@/models/MenuItem";

import {
  getValidSubscription,
} from "@/lib/subscription/access";


export type SubscriptionLimitType =
  | "STAFF"
  | "DELIVERY_PARTNER"
  | "MENU_ITEM";


interface LimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  message?: string;
}


async function getCurrentUsage(
  restaurantId: string,
  type: SubscriptionLimitType
): Promise<number> {
  switch (type) {
    case "STAFF":
      return User.countDocuments({
        restaurantId,
        role: "STAFF",
        isActive: true,
      });

    case "DELIVERY_PARTNER":
      return User.countDocuments({
        restaurantId,
        role: "DELIVERY_PARTNER",
        isActive: true,
      });

    case "MENU_ITEM":
      return MenuItem.countDocuments({
        restaurantId,
      });

    default:
      return 0;
  }
}


function getPlanLimit(
  plan: any,
  type: SubscriptionLimitType
): number {
  switch (type) {
    case "STAFF":
      return plan.maxStaff;

    case "DELIVERY_PARTNER":
      return plan.maxDeliveryPartners;

    case "MENU_ITEM":
      return plan.maxMenuItems;

    default:
      return 0;
  }
}


export async function checkSubscriptionLimit(
  restaurantId: string,
  type: SubscriptionLimitType
): Promise<LimitResult> {
  const subscription =
    await getValidSubscription(
      restaurantId
    );

  if (!subscription) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      remaining: 0,
      message:
        "Active subscription required",
    };
  }

  const current =
    await getCurrentUsage(
      restaurantId,
      type
    );

  const limit =
    getPlanLimit(
      subscription.plan,
      type
    );

  const remaining = Math.max(
    limit - current,
    0
  );

  if (current >= limit) {
    const resourceName =
      type === "DELIVERY_PARTNER"
        ? "delivery partners"
        : type === "MENU_ITEM"
        ? "menu items"
        : "staff";

    const planData = subscription.plan as any;

    return {
      allowed: false,
      current,
      limit,
      remaining: 0,
      message:
        `Your ${planData.name} plan allows maximum ${limit} ${resourceName}.`,
    };
  }

  return {
    allowed: true,
    current,
    limit,
    remaining,
  };
}


export async function getSubscriptionUsage(
  restaurantId: string
) {
  const subscription =
    await getValidSubscription(
      restaurantId
    );

  if (!subscription) {
    return null;
  }

  const [
    staff,
    deliveryPartners,
    menuItems,
  ] = await Promise.all([
    getCurrentUsage(
      restaurantId,
      "STAFF"
    ),

    getCurrentUsage(
      restaurantId,
      "DELIVERY_PARTNER"
    ),

    getCurrentUsage(
      restaurantId,
      "MENU_ITEM"
    ),
  ]);

  const planData = subscription.plan as any;

  return {
    plan: {
      id: planData._id,
      name: planData.name,
      slug: planData.slug,
    },

    staff: {
      current: staff,
      limit:
        planData.maxStaff,
      remaining: Math.max(
        planData.maxStaff -
          staff,
        0
      ),
    },

    deliveryPartners: {
      current: deliveryPartners,
      limit:
        planData
          .maxDeliveryPartners,
      remaining: Math.max(
        planData
          .maxDeliveryPartners -
          deliveryPartners,
        0
      ),
    },

    menuItems: {
      current: menuItems,
      limit:
        planData.maxMenuItems,
      remaining: Math.max(
        planData.maxMenuItems -
          menuItems,
        0
      ),
    },

    subscription: {
      status:
        subscription.subscription.status,

      startDate:
        subscription.subscription.startDate,

      endDate:
        subscription.subscription.endDate,

      autoRenew:
        subscription.subscription.autoRenew,
    },
  };
}