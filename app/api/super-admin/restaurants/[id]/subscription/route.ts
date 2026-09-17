import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

import Restaurant from "@/models/Restaurant";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";


// =====================================================
// CREATE SUBSCRIPTION VALIDATION
// =====================================================

const createSubscriptionSchema = z.object({
  planId: z.string(),

  startDate: z
    .string()
    .datetime()
    .optional(),

  autoRenew: z
    .boolean()
    .default(true),
});


// =====================================================
// UPDATE SUBSCRIPTION VALIDATION
// =====================================================

const updateSubscriptionSchema = z.object({
  planId: z
    .string()
    .optional(),

  status: z
    .enum([
      "ACTIVE",
      "EXPIRED",
      "CANCELLED",
    ])
    .optional(),

  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),

  autoRenew: z
    .boolean()
    .optional(),
});


// =====================================================
// GET RESTAURANT SUBSCRIPTION
// =====================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // -----------------------------------------------
    // AUTH
    // -----------------------------------------------

    await requireRole([
      "SUPER_ADMIN",
    ]);

    await connectDB();

    // -----------------------------------------------
    // PARAMS
    // -----------------------------------------------

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------
    // RESTAURANT
    // -----------------------------------------------

    const restaurant =
      await Restaurant.findById(id)
        .select(
          "_id name slug isActive"
        )
        .lean();

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Restaurant not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------------
    // CURRENT ACTIVE SUBSCRIPTION
    // -----------------------------------------------

    const subscription =
      await Subscription.findOne({
        restaurantId: id,

        status: "ACTIVE",

        endDate: {
          $gt: new Date(),
        },
      })
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "planId",
          select:
            "_id name slug price billingCycle features maxStaff maxDeliveryPartners maxMenuItems isActive",
        })
        .lean();

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return NextResponse.json({
      success: true,

      data: {
        restaurant,

        subscription:
          subscription || null,
      },
    });
  } catch (error) {
    console.error(
      "Get Subscription Error:",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "UNAUTHORIZED"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        );
      }

      if (
        error.message ===
        "FORBIDDEN"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Super Admin access required",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch subscription",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// CREATE / ASSIGN SUBSCRIPTION
// =====================================================

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // -----------------------------------------------
    // AUTH
    // -----------------------------------------------

    await requireRole([
      "SUPER_ADMIN",
    ]);

    await connectDB();

    // -----------------------------------------------
    // PARAMS
    // -----------------------------------------------

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------
    // RESTAURANT
    // -----------------------------------------------

    const restaurant =
      await Restaurant.findById(id)
        .select(
          "_id name slug isActive"
        )
        .lean();

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Restaurant not found",
        },
        { status: 404 }
      );
    }

    if (!restaurant.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot assign subscription to inactive restaurant",
        },
        { status: 409 }
      );
    }

    // -----------------------------------------------
    // BODY
    // -----------------------------------------------

    const body =
      await request.json();

    const parsed =
      createSubscriptionSchema.safeParse(
        body
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid subscription data",
          errors:
            parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      planId,
      startDate,
      autoRenew,
    } = parsed.data;

    // -----------------------------------------------
    // PLAN ID
    // -----------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        planId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid plan ID",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------
    // PLAN
    // -----------------------------------------------

    const plan =
      await Plan.findOne({
        _id: planId,
        isActive: true,
      }).lean();

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Active plan not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------------
    // EXISTING ACTIVE SUBSCRIPTION
    // -----------------------------------------------

    const existingSubscription =
      await Subscription.findOne({
        restaurantId: id,
        status: "ACTIVE",
        endDate: {
          $gt: new Date(),
        },
      })
        .select(
          "_id startDate endDate"
        )
        .lean();

    if (existingSubscription) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Restaurant already has an active subscription",

          data: {
            subscriptionId:
              existingSubscription._id,

            startDate:
              existingSubscription.startDate,

            endDate:
              existingSubscription.endDate,
          },
        },
        { status: 409 }
      );
    }

    // -----------------------------------------------
    // START DATE
    // -----------------------------------------------

    const subscriptionStart =
      startDate
        ? new Date(startDate)
        : new Date();

    // -----------------------------------------------
    // START DATE VALIDATION
    // -----------------------------------------------

    if (
      Number.isNaN(
        subscriptionStart.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid start date",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------
    // END DATE
    // -----------------------------------------------

    const subscriptionEnd =
      new Date(
        subscriptionStart
      );

    if (
      plan.billingCycle ===
      "MONTHLY"
    ) {
      subscriptionEnd.setMonth(
        subscriptionEnd.getMonth() + 1
      );
    } else {
      subscriptionEnd.setFullYear(
        subscriptionEnd.getFullYear() + 1
      );
    }

    // -----------------------------------------------
    // END DATE VALIDATION
    // -----------------------------------------------

    if (
      subscriptionEnd <=
      subscriptionStart
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription end date must be after start date",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------
    // CREATE SUBSCRIPTION
    // -----------------------------------------------

    const subscription =
      await Subscription.create({
        restaurantId:
          restaurant._id,

        planId:
          plan._id,

        status:
          "ACTIVE",

        startDate:
          subscriptionStart,

        endDate:
          subscriptionEnd,

        autoRenew,

        priceAtPurchase:
          plan.price,

        billingCycle:
          plan.billingCycle,
      });

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Subscription assigned successfully",

        data: {
          subscription,

          restaurant: {
            _id:
              restaurant._id,

            name:
              restaurant.name,

            slug:
              restaurant.slug,
          },

          plan: {
            _id:
              plan._id,

            name:
              plan.name,

            price:
              plan.price,

            billingCycle:
              plan.billingCycle,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create Subscription Error:",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "UNAUTHORIZED"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        );
      }

      if (
        error.message ===
        "FORBIDDEN"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Super Admin access required",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create subscription",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// UPDATE SUBSCRIPTION
// =====================================================

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // -----------------------------------------------
    // AUTH
    // -----------------------------------------------

    await requireRole([
      "SUPER_ADMIN",
    ]);

    await connectDB();

    // -----------------------------------------------
    // PARAMS
    // -----------------------------------------------

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------
    // BODY
    // -----------------------------------------------

    const body =
      await request.json();

    const parsed =
      updateSubscriptionSchema.safeParse(
        body
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid subscription data",
          errors:
            parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data =
      parsed.data;

    // -----------------------------------------------
    // FIND SUBSCRIPTION
    // -----------------------------------------------

    const subscription =
      await Subscription.findOne({
        restaurantId: id,
        status: "ACTIVE",
      });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Active subscription not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------------
    // PLAN
    // -----------------------------------------------

    let selectedPlan = null;

    if (data.planId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          data.planId
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid plan ID",
          },
          { status: 400 }
        );
      }

      selectedPlan =
        await Plan.findOne({
          _id: data.planId,
          isActive: true,
        }).lean();

      if (!selectedPlan) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Active plan not found",
          },
          { status: 404 }
        );
      }

      subscription.planId =
        selectedPlan._id;

      subscription.priceAtPurchase =
        selectedPlan.price;

      subscription.billingCycle =
        selectedPlan.billingCycle;
    }

    // -----------------------------------------------
    // CALCULATE FINAL DATES
    // -----------------------------------------------

    const finalStartDate =
      data.startDate
        ? new Date(data.startDate)
        : subscription.startDate;

    const finalEndDate =
      data.endDate
        ? new Date(data.endDate)
        : subscription.endDate;

    // -----------------------------------------------
    // DATE VALIDATION
    // -----------------------------------------------

    if (
      Number.isNaN(
        finalStartDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid start date",
        },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(
        finalEndDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid end date",
        },
        { status: 400 }
      );
    }

    if (
      finalEndDate <=
      finalStartDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "End date must be after start date",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------
    // STATUS VALIDATION
    // -----------------------------------------------

    const finalStatus =
      data.status ||
      subscription.status;

    if (
      finalStatus === "ACTIVE" &&
      finalEndDate <= new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Active subscription must have a future end date",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------
    // APPLY FIELDS
    // -----------------------------------------------

    subscription.startDate =
      finalStartDate;

    subscription.endDate =
      finalEndDate;

    if (data.status) {
      subscription.status =
        data.status;
    }

    if (
      data.autoRenew !== undefined
    ) {
      subscription.autoRenew =
        data.autoRenew;
    }

    // -----------------------------------------------
    // CANCELLED / EXPIRED
    // -----------------------------------------------

    if (
      data.status === "EXPIRED" ||
      data.status === "CANCELLED"
    ) {
      subscription.autoRenew =
        false;
    }

    // -----------------------------------------------
    // SAVE
    // -----------------------------------------------

    await subscription.save();

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Subscription updated successfully",

      data: {
        subscription,
      },
    });
  } catch (error) {
    console.error(
      "Update Subscription Error:",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "UNAUTHORIZED"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        );
      }

      if (
        error.message ===
        "FORBIDDEN"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Super Admin access required",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update subscription",
      },
      { status: 500 }
    );
  }
}