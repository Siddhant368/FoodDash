import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guards";
import Order from "@/models/Order";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication
    const user = await requireAuth();

    // 2. Database connection
    await connectDB();

    // 3. Get order ID
    const { id } = await params;

    // 4. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        { status: 400 }
      );
    }

    // 5. Find only customer's own order
    const order = await Order.findOne({
      _id: id,
      customerId: user.id,
    })
      .populate("restaurantId", "name")
      .select(
        "_id restaurantId customerId items subtotal deliveryFee tax discount totalAmount status paymentMethod paymentStatus deliveryAddress customerNote createdAt updatedAt"
      )
      .lean();

    // 6. Order not found
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // 7. Response
    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET CUSTOMER ORDER DETAILS ERROR:", error);

    const message =
      error instanceof Error ? error.message : "";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? message || "Failed to fetch order details"
            : "Failed to fetch order details",
      },
      { status: 500 }
    );
  }
}