import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRestaurantRole } from "@/lib/auth/guards";

import DeliveryAssignment from "@/models/DeliveryAssignment";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await requireRestaurantRole([
      "RESTAURANT_ADMIN",
      "STAFF",
    ]);

    await connectDB();

    if (!user.restaurantId) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant access required",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assignment ID",
        },
        { status: 400 }
      );
    }

    // Find assignment belonging to this restaurant
    const assignment =
      await DeliveryAssignment.findOne({
        _id: id,
        restaurantId: user.restaurantId,
      }).lean();

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery assignment not found",
        },
        { status: 404 }
      );
    }

    // Fetch order and delivery partner together
    const [order, deliveryPartner] =
      await Promise.all([
        Order.findOne({
          _id: assignment.orderId,
          restaurantId: user.restaurantId,
        })
          .select(
            "_id customerId items subtotal deliveryFee tax discount totalAmount status paymentMethod paymentStatus deliveryAddress customerNote createdAt updatedAt"
          )
          .lean(),

        User.findOne({
          _id: assignment.deliveryPartnerId,
          restaurantId: user.restaurantId,
          role: "DELIVERY_PARTNER",
        })
          .select(
            "_id name email phone isActive"
          )
          .lean(),
      ]);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    if (!deliveryPartner) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery partner not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,

      assignment: {
        id: assignment._id,
        orderId: assignment.orderId,
        deliveryPartnerId:
          assignment.deliveryPartnerId,

        status: assignment.status,

        assignedAt:
          assignment.assignedAt,

        acceptedAt:
          assignment.acceptedAt,

        pickedUpAt:
          assignment.pickedUpAt,

        outForDeliveryAt:
          assignment.outForDeliveryAt,

        deliveredAt:
          assignment.deliveredAt,

        deliveryNote:
          assignment.deliveryNote,

        createdAt:
          assignment.createdAt,

        updatedAt:
          assignment.updatedAt,
      },

      order,

      deliveryPartner: {
        id: deliveryPartner._id,
        name: deliveryPartner.name,
        email: deliveryPartner.email,
        phone: deliveryPartner.phone,
        isActive: deliveryPartner.isActive,
      },
    });
  } catch (error: unknown) {
    console.error(
      "ADMIN DELIVERY DETAILS ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only restaurant admins and staff can access this resource",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch delivery assignment details",
      },
      { status: 500 }
    );
  }
}