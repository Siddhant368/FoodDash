import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRestaurantUser } from "@/lib/auth/guards";
import { accessErrorResponse } from "@/lib/auth/access-response";

import DeliveryAssignment from "@/models/DeliveryAssignment";
import Order from "@/models/Order";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // ==================================================
    // 1. AUTHENTICATION
    // ==================================================

    const user =
      await requireRestaurantUser();

    // ==================================================
    // 2. ROLE CHECK
    // ==================================================

    if (
      user.role !== "DELIVERY_PARTNER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only delivery partners can access this resource",
        },
        {
          status: 403,
        }
      );
    }

    // ==================================================
    // 3. RESTAURANT CHECK
    // ==================================================

    if (!user.restaurantId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Restaurant access required",
        },
        {
          status: 403,
        }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        user.restaurantId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid restaurant ID",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 4. PARAMETER
    // ==================================================

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid delivery assignment ID",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 5. DATABASE
    // ==================================================

    await connectDB();

    const restaurantId =
      new mongoose.Types.ObjectId(
        user.restaurantId
      );

    const deliveryPartnerId =
      new mongoose.Types.ObjectId(
        user.id
      );

    const orderId =
      new mongoose.Types.ObjectId(id);

    // ==================================================
    // 6. FIND ASSIGNMENT
    //
    // IMPORTANT SECURITY:
    //
    // orderId
    // + restaurantId
    // + deliveryPartnerId
    //
    // All three must match.
    // ==================================================

    const assignment =
      await DeliveryAssignment.findOne({
        orderId,

        restaurantId,

        deliveryPartnerId,
      })
        .select(
          "_id orderId restaurantId deliveryPartnerId status assignedAt acceptedAt pickedUpAt outForDeliveryAt deliveredAt deliveryNote createdAt updatedAt"
        )
        .lean();

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery assignment not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // 7. FIND ORDER
    // ==================================================

    const order =
      await Order.findOne({
        _id: assignment.orderId,

        restaurantId,
      })
        .select(
          "_id customerId items subtotal deliveryFee tax discount totalAmount status paymentMethod paymentStatus deliveryAddress customerNote createdAt updatedAt"
        )
        .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Associated order not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // 8. RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      data: {
        assignment: {
          id: assignment._id,

          orderId:
            assignment.orderId,

          restaurantId:
            assignment.restaurantId,

          deliveryPartnerId:
            assignment.deliveryPartnerId,

          status:
            assignment.status,

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

        order: {
          id: order._id,

          customerId:
            order.customerId,

          items: order.items,

          subtotal:
            order.subtotal,

          deliveryFee:
            order.deliveryFee,

          tax: order.tax,

          discount:
            order.discount,

          totalAmount:
            order.totalAmount,

          status:
            order.status,

          paymentMethod:
            order.paymentMethod,

          paymentStatus:
            order.paymentStatus,

          deliveryAddress:
            order.deliveryAddress,

          customerNote:
            order.customerNote,

          createdAt:
            order.createdAt,

          updatedAt:
            order.updatedAt,
        },
      },
    });
  } catch (error: unknown) {
    console.error(
      "DELIVERY ORDER DETAILS ERROR:",
      error
    );

    // ==================================================
    // ACCESS ERRORS
    // ==================================================

    const accessResponse =
      accessErrorResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    // ==================================================
    // AUTH FALLBACK
    // ==================================================

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch delivery order",
      },
      {
        status: 500,
      }
    );
  }
}