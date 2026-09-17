import { NextResponse } from "next/server";
import mongoose from "mongoose";

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

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    // --------------------------------------------------
    // DATABASE
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // AUTH + RESTAURANT + SUBSCRIPTION
    // --------------------------------------------------

    const { user } =
      await requireRestaurantStaffAccess();

    // --------------------------------------------------
    // PARAMS
    // --------------------------------------------------

    const { id } =
      await context.params;

    // --------------------------------------------------
    // VALIDATE ORDER ID
    // --------------------------------------------------

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

    // --------------------------------------------------
    // FIND ORDER
    //
    // IMPORTANT:
    // restaurantId is included for tenant isolation.
    // --------------------------------------------------

    const order =
      await Order.findOne({
        _id: id,
        restaurantId: new mongoose.Types.ObjectId(user.restaurantId as string),
      }).lean();

    // --------------------------------------------------
    // ORDER NOT FOUND
    // --------------------------------------------------

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

    const assignment = await mongoose.models.DeliveryAssignment?.findOne({ orderId: id }).lean();

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      order,
      assignment,
    });
  } catch (error) {
    console.error(
      "GET ADMIN ORDER DETAILS ERROR:",
      error
    );

    // --------------------------------------------------
    // ACCESS ERRORS
    // --------------------------------------------------

    const accessResponse =
      accessErrorResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    // --------------------------------------------------
    // AUTH ERRORS
    // --------------------------------------------------

    const authResponse =
      authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    // --------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch order",
      },
      {
        status: 500,
      }
    );
  }
}