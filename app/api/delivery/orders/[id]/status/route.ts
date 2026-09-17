import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import {
  requireRestaurantUser,
} from "@/lib/auth/guards";
import {
  accessErrorResponse,
} from "@/lib/auth/access-response";

import DeliveryAssignment from "@/models/DeliveryAssignment";
import Order from "@/models/Order";

const statusSchema = z.object({
  status: z.enum([
    "ACCEPTED",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ]),
  deliveryNote: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

type DeliveryStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

const allowedTransitions: Record<
  DeliveryStatus,
  DeliveryStatus[]
> = {
  ASSIGNED: ["ACCEPTED"],
  ACCEPTED: ["PICKED_UP"],
  PICKED_UP: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function getTimestampField(
  status: DeliveryStatus
) {
  switch (status) {
    case "ACCEPTED":
      return "acceptedAt";

    case "PICKED_UP":
      return "pickedUpAt";

    case "OUT_FOR_DELIVERY":
      return "outForDeliveryAt";

    case "DELIVERED":
      return "deliveredAt";

    default:
      return null;
  }
}

export async function PATCH(
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
    // 2. ONLY DELIVERY PARTNER
    // ==================================================

    if (
      user.role !== "DELIVERY_PARTNER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only delivery partners can update delivery status",
        },
        {
          status: 403,
        }
      );
    }

    // ==================================================
    // 3. RESTAURANT VALIDATION
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
    // 4. PARAM ID
    // ==================================================

    const { id } = await context.params;

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

    const orderId =
      new mongoose.Types.ObjectId(id);

    // ==================================================
    // 6. REQUEST BODY
    // ==================================================

    const body: unknown =
      await request.json();

    const parsed =
      statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status data",
          errors:
            parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const {
      status: newStatus,
      deliveryNote,
    } = parsed.data;

    // ==================================================
    // 7. FIND ASSIGNMENT
    //
    // IMPORTANT:
    // deliveryPartnerId + restaurantId
    // prevents accessing another partner's
    // assignment.
    // ==================================================

    const assignment =
      await DeliveryAssignment.findOne({
        orderId,

        restaurantId,

        deliveryPartnerId: user.id,
      });

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
    // 8. CURRENT STATUS
    // ==================================================

    const currentStatus =
      assignment.status as DeliveryStatus;

    // ==================================================
    // 9. CHECK STATUS TRANSITION
    // ==================================================

    const allowed =
      allowedTransitions[
        currentStatus
      ];

    if (
      !allowed ||
      !allowed.includes(
        newStatus as DeliveryStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Invalid status transition: ${currentStatus} → ${newStatus}`,

          currentStatus,

          allowedStatuses:
            allowed || [],
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 10. GET ORDER
    // ==================================================

    const order =
      await Order.findOne({
        _id: assignment.orderId,

        restaurantId,
      });

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
    // 11. UPDATE ASSIGNMENT
    // ==================================================

    const now = new Date();

    assignment.status =
      newStatus as DeliveryStatus;

    if (deliveryNote !== undefined) {
      assignment.deliveryNote =
        deliveryNote;
    }

    const timestampField =
      getTimestampField(
        newStatus as DeliveryStatus
      );

    if (timestampField) {
      (assignment as any)[
        timestampField
      ] = now;
    }

    await assignment.save();

    // ==================================================
    // 12. SYNCHRONIZE ORDER STATUS
    // ==================================================

    if (newStatus === "DELIVERED") {
      order.status = "DELIVERED";

      await order.save();
    }

    // ==================================================
    // 13. RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      message:
        "Delivery status updated successfully",

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
      },

      order: {
        id: order._id,

        status: order.status,
      },
    });
  } catch (error: unknown) {
    console.error(
      "DELIVERY STATUS UPDATE ERROR:",
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
    // FALLBACK AUTH
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
          "Failed to update delivery status",
      },
      {
        status: 500,
      }
    );
  }
}