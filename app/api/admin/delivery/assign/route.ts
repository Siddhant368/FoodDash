import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import {
  requireRestaurantStaffAccess,
} from "@/lib/auth/restaurant-access";
import { accessErrorResponse } from "@/lib/auth/access-response";

import Order from "@/models/Order";
import User from "@/models/User";
import DeliveryAssignment from "@/models/DeliveryAssignment";

const assignSchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(1, "orderId is required"),

  deliveryPartnerId: z
    .string()
    .trim()
    .min(1, "deliveryPartnerId is required"),
});

export async function POST(request: Request) {
  try {
    // ==================================================
    // 1. AUTH + RESTAURANT + SUBSCRIPTION
    // ==================================================

    const { user, restaurant } =
      await requireRestaurantStaffAccess();

    // ==================================================
    // 2. CONNECT DATABASE
    // ==================================================

    await connectDB();

    // ==================================================
    // 3. PARSE REQUEST
    // ==================================================

    const body: unknown =
      await request.json();

    const parsed =
      assignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data",
          errors:
            parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const {
      orderId,
      deliveryPartnerId,
    } = parsed.data;

    // ==================================================
    // 4. VALIDATE OBJECT IDS
    // ==================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      ) ||
      !mongoose.Types.ObjectId.isValid(
        deliveryPartnerId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid orderId or deliveryPartnerId",
        },
        {
          status: 400,
        }
      );
    }

    const restaurantId =
      new mongoose.Types.ObjectId(
        user.restaurantId!
      );

    const orderObjectId =
      new mongoose.Types.ObjectId(orderId);

    const partnerObjectId =
      new mongoose.Types.ObjectId(
        deliveryPartnerId
      );

    // ==================================================
    // 5. FIND ORDER
    //
    // IMPORTANT:
    // restaurantId is always included.
    // This prevents cross-restaurant access.
    // ==================================================

    const order = await Order.findOne({
      _id: orderObjectId,
      restaurantId,
    })
      .select(
        "_id restaurantId status totalAmount deliveryAddress"
      )
      .lean();

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

    // ==================================================
    // 6. ORDER STATUS VALIDATION
    // ==================================================

    if (order.status !== "READY") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only READY orders can be assigned to a delivery partner",
          currentStatus:
            order.status,
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 7. CHECK DELIVERY PARTNER
    //
    // Partner MUST:
    // - exist
    // - belong to same restaurant
    // - have DELIVERY_PARTNER role
    // - be active
    // ==================================================

    const deliveryPartner =
      await User.findOne({
        _id: partnerObjectId,

        restaurantId,

        role: "DELIVERY_PARTNER",

        isActive: true,
      })
        .select(
          "_id name email phone restaurantId isActive"
        )
        .lean();

    if (!deliveryPartner) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery partner not found, inactive, or does not belong to this restaurant",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // 8. CHECK EXISTING ASSIGNMENT
    // ==================================================

    const existingAssignment =
      await DeliveryAssignment.findOne({
        orderId: orderObjectId,
      })
        .select(
          "_id deliveryPartnerId status assignedAt"
        )
        .lean();

    if (existingAssignment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order is already assigned to a delivery partner",

          assignment: {
            id: existingAssignment._id,
            deliveryPartnerId:
              existingAssignment.deliveryPartnerId,
            status:
              existingAssignment.status,
            assignedAt:
              existingAssignment.assignedAt,
          },
        },
        {
          status: 409,
        }
      );
    }

    // ==================================================
    // 9. CREATE ASSIGNMENT
    // ==================================================

    const assignment =
      await DeliveryAssignment.create({
        orderId: order._id,

        restaurantId: restaurant._id,

        deliveryPartnerId:
          deliveryPartner._id,

        status: "ASSIGNED",

        assignedAt: new Date(),
      });

    // ==================================================
    // 10. RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Order assigned successfully",

        assignment: {
          id: assignment._id,

          orderId:
            assignment.orderId,

          restaurantId:
            assignment.restaurantId,

          deliveryPartner: {
            id: deliveryPartner._id,

            name:
              deliveryPartner.name,

            email:
              deliveryPartner.email,

            phone:
              deliveryPartner.phone,
          },

          status:
            assignment.status,

          assignedAt:
            assignment.assignedAt,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    console.error(
      "ASSIGN DELIVERY ERROR:",
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
    // FALLBACK AUTH ERRORS
    // ==================================================

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        {
          status: 403,
        }
      );
    }

    // ==================================================
    // GENERIC ERROR
    // ==================================================

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to assign delivery partner",
      },
      {
        status: 500,
      }
    );
  }
}