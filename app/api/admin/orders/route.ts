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

export async function GET(request: Request) {
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
    // QUERY PARAMETERS
    // --------------------------------------------------

    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status");

    const paymentStatus =
      searchParams.get("paymentStatus");

    const pageParam =
      Number(searchParams.get("page"));

    const limitParam =
      Number(searchParams.get("limit"));

    const page =
      Number.isFinite(pageParam) &&
      pageParam > 0
        ? Math.floor(pageParam)
        : 1;

    const limit =
      Number.isFinite(limitParam) &&
      limitParam > 0
        ? Math.min(Math.floor(limitParam), 100)
        : 20;

    const skip =
      (page - 1) * limit;

    // --------------------------------------------------
    // FILTER
    // --------------------------------------------------

    const filter: Record<string, unknown> = {
      restaurantId: new mongoose.Types.ObjectId(user.restaurantId as string),
    };

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // --------------------------------------------------
    // FETCH ORDERS + COUNT IN PARALLEL
    // --------------------------------------------------

    const [orders, total] =
      await Promise.all([
        Order.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Order.countDocuments(filter),
      ]);

    // --------------------------------------------------
    // PAGINATION
    // --------------------------------------------------

    const totalPages =
      Math.ceil(total / limit);

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      data: orders,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET ADMIN ORDERS ERROR:",
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
          "Failed to fetch orders",
      },
      {
        status: 500,
      }
    );
  }
}