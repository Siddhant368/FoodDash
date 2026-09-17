import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

import {
  requireRestaurantStaffAccess,
} from "@/lib/auth/restaurant-access";

import {
  accessErrorResponse,
} from "@/lib/auth/access-response";

import {
  authErrorResponse,
} from "@/lib/auth/errors";

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

const statusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

// --------------------------------------------------
// ROUTE CONTEXT
// --------------------------------------------------

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// --------------------------------------------------
// PATCH
// --------------------------------------------------

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    // ------------------------------------------------
    // DATABASE
    // ------------------------------------------------

    await connectDB();

    // ------------------------------------------------
    // AUTH + RESTAURANT + SUBSCRIPTION
    // ------------------------------------------------

    const { user } =
      await requireRestaurantStaffAccess();

    // ------------------------------------------------
    // PARAMS
    // ------------------------------------------------

    const { id } =
      await context.params;

    // ------------------------------------------------
    // VALIDATE ID
    // ------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // REQUEST BODY
    // ------------------------------------------------

    const body =
      await request.json();

    const parsed =
      statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid order status",
          errors:
            parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // FIND ORDER
    //
    // restaurantId prevents cross-restaurant access.
    // ------------------------------------------------

    const order =
      await Order.findOne({
        _id: id,
        restaurantId:
          new mongoose.Types.ObjectId(user.restaurantId as string),
      });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    // ------------------------------------------------
    // UPDATE STATUS
    // ------------------------------------------------

    order.status =
      parsed.data.status;

    await order.save();

    // ------------------------------------------------
    // RESPONSE
    // ------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Order status updated successfully",

      data: order,
    });
  } catch (error) {
    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    // ------------------------------------------------
    // ACCESS ERRORS
    // ------------------------------------------------

    const accessResponse =
      accessErrorResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    // ------------------------------------------------
    // AUTH ERRORS
    // ------------------------------------------------

    const authResponse =
      authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    // ------------------------------------------------
    // SERVER ERROR
    // ------------------------------------------------

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update order status",
      },
      {
        status: 500,
      }
    );
  }
}