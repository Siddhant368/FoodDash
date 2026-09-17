import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRestaurantUser } from "@/lib/auth/guards";
import { accessErrorResponse } from "@/lib/auth/access-response";

import DeliveryAssignment from "@/models/DeliveryAssignment";
import Order from "@/models/Order";

const DELIVERY_STATUSES = [
  "ASSIGNED",
  "ACCEPTED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

type DeliveryStatus =
  (typeof DELIVERY_STATUSES)[number];

export async function GET(
  request: Request
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
            "Only delivery partners can access delivery orders",
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
    // 4. DATABASE
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

    // ==================================================
    // 5. QUERY PARAMETERS
    // ==================================================

    const { searchParams } =
      new URL(request.url);

    const pageParam =
      Number(
        searchParams.get("page") || "1"
      );

    const limitParam =
      Number(
        searchParams.get("limit") || "10"
      );

    const page =
      Number.isFinite(pageParam) &&
      pageParam > 0
        ? Math.floor(pageParam)
        : 1;

    const limit =
      Number.isFinite(limitParam) &&
      limitParam > 0
        ? Math.min(
            Math.floor(limitParam),
            50
          )
        : 10;

    const skip =
      (page - 1) * limit;

    // ==================================================
    // 6. STATUS FILTER
    // ==================================================

    const requestedStatus =
      searchParams.get("status");

    let statusFilter:
      | DeliveryStatus
      | undefined;

    if (requestedStatus) {
      if (
        !DELIVERY_STATUSES.includes(
          requestedStatus as DeliveryStatus
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid delivery status",
            allowedStatuses:
              DELIVERY_STATUSES,
          },
          {
            status: 400,
          }
        );
      }

      statusFilter =
        requestedStatus as DeliveryStatus;
    }

    // ==================================================
    // 7. BUILD FILTER
    //
    // VERY IMPORTANT:
    // deliveryPartnerId + restaurantId
    // ensures ownership isolation.
    // ==================================================

    const assignmentFilter: {
      restaurantId: mongoose.Types.ObjectId;
      deliveryPartnerId: mongoose.Types.ObjectId;
      status?: DeliveryStatus;
    } = {
      restaurantId,

      deliveryPartnerId,
    };

    if (statusFilter) {
      assignmentFilter.status =
        statusFilter;
    }

    // ==================================================
    // 8. RUN QUERIES IN PARALLEL
    // ==================================================

    const [
      assignments,
      total,
    ] = await Promise.all([
      DeliveryAssignment.find(
        assignmentFilter
      )
        .select(
          "_id orderId restaurantId deliveryPartnerId status assignedAt acceptedAt pickedUpAt outForDeliveryAt deliveredAt deliveryNote"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      DeliveryAssignment.countDocuments(
        assignmentFilter
      ),
    ]);

    // ==================================================
    // 9. NO ORDERS
    // ==================================================

    if (assignments.length === 0) {
      return NextResponse.json({
        success: true,

        data: [],

        pagination: {
          page,
          limit,
          total,
          totalPages:
            Math.ceil(
              total / limit
            ),
        },
      });
    }

    // ==================================================
    // 10. GET ORDER IDS
    // ==================================================

    const orderIds =
      assignments.map(
        (assignment) =>
          assignment.orderId
      );

    // ==================================================
    // 11. GET ORDERS
    //
    // Restaurant isolation again.
    // ==================================================

    const orders =
      await Order.find({
        _id: {
          $in: orderIds,
        },

        restaurantId,
      })
        .select(
          "_id customerId items subtotal deliveryFee tax discount totalAmount status paymentMethod paymentStatus deliveryAddress customerNote createdAt"
        )
        .lean();

    // ==================================================
    // 12. CREATE ORDER MAP
    // ==================================================

    const orderMap =
      new Map(
        orders.map(
          (order) => [
            order._id.toString(),
            order,
          ]
        )
      );

    // ==================================================
    // 13. COMBINE ASSIGNMENT + ORDER
    // ==================================================

    const data =
      assignments
        .map((assignment) => {
          const order =
            orderMap.get(
              assignment.orderId.toString()
            );

          if (!order) {
            return null;
          }

          return {
            assignment: {
              id: assignment._id,

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
            },
          };
        })
        .filter(Boolean);

    // ==================================================
    // 14. RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      data,

      pagination: {
        page,

        limit,

        total,

        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error: unknown) {
    console.error(
      "DELIVERY ORDERS ERROR:",
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
          "Failed to fetch delivery orders",
      },
      {
        status: 500,
      }
    );
  }
}