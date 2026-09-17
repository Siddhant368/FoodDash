import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRestaurantRole } from "@/lib/auth/guards";

import DeliveryAssignment from "@/models/DeliveryAssignment";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET() {
  try {
    const user = await requireRestaurantRole([
      "RESTAURANT_ADMIN",
      "STAFF",
    ]);

    await connectDB();

    const assignments = await DeliveryAssignment.find({
      restaurantId: user.restaurantId,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (assignments.length === 0) {
      return NextResponse.json({
        success: true,
        assignments: [],
        total: 0,
      });
    }

    const orderIds = assignments.map(
      (assignment) => assignment.orderId
    );

    const partnerIds = assignments.map(
      (assignment) => assignment.deliveryPartnerId
    );

    const [orders, partners] = await Promise.all([
      Order.find({
        _id: { $in: orderIds },
        restaurantId: user.restaurantId,
      })
        .select(
          "_id customerId items subtotal deliveryFee tax discount totalAmount status paymentMethod paymentStatus deliveryAddress customerNote createdAt updatedAt"
        )
        .lean(),

      User.find({
        _id: { $in: partnerIds },
        restaurantId: user.restaurantId,
        role: "DELIVERY_PARTNER",
      })
        .select("_id name email phone isActive")
        .lean(),
    ]);

    const orderMap = new Map(
      orders.map((order) => [
        order._id.toString(),
        order,
      ])
    );

    const partnerMap = new Map(
      partners.map((partner) => [
        partner._id.toString(),
        partner,
      ])
    );

    const result = assignments.map((assignment) => ({
      assignment: {
        id: assignment._id,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
        acceptedAt: assignment.acceptedAt,
        pickedUpAt: assignment.pickedUpAt,
        outForDeliveryAt:
          assignment.outForDeliveryAt,
        deliveredAt: assignment.deliveredAt,
        deliveryNote: assignment.deliveryNote,
      },

      order:
        orderMap.get(
          assignment.orderId.toString()
        ) || null,

      deliveryPartner:
        partnerMap.get(
          assignment.deliveryPartnerId.toString()
        ) || null,
    }));

    return NextResponse.json({
      success: true,
      assignments: result,
      total: result.length,
    });
  } catch (error: unknown) {
    console.error(
      "ADMIN DELIVERY LIST ERROR:",
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
        message: "Failed to fetch delivery assignments",
      },
      { status: 500 }
    );
  }
}