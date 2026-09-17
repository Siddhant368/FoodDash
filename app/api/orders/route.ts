import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guards";

import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";

/* =========================================================
   CREATE ORDER VALIDATION
========================================================= */

const createOrderSchema = z.object({
  restaurantId: z
    .string()
    .trim()
    .min(1, "Restaurant ID is required"),

  items: z
    .array(
      z.object({
        menuItemId: z
          .string()
          .trim()
          .min(1, "Menu item ID is required"),

        quantity: z
          .number()
          .int("Quantity must be an integer")
          .min(1, "Quantity must be at least 1")
          .max(20, "Maximum quantity is 20"),
      })
    )
    .min(1, "At least one item is required"),

  paymentMethod: z.enum(["COD", "ONLINE"]),

  deliveryAddress: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name is required"),

    phone: z
      .string()
      .trim()
      .min(10, "Phone number is required")
      .max(15, "Phone number is too long"),

    addressLine1: z
      .string()
      .trim()
      .min(3, "Address is required"),

    addressLine2: z
      .string()
      .trim()
      .optional(),

    city: z
      .string()
      .trim()
      .min(2, "City is required"),

    state: z
      .string()
      .trim()
      .min(2, "State is required"),

    pincode: z
      .string()
      .trim()
      .min(4, "Pincode is required")
      .max(10, "Pincode is too long"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),

  customerNote: z
    .string()
    .trim()
    .max(500, "Customer note is too long")
    .optional(),
});

/* =========================================================
   POST /api/orders
   CREATE ORDER
========================================================= */

export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;

  try {
    /* =====================================================
       1. AUTHENTICATION
    ===================================================== */

    const user = await requireAuth();

    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    /* =====================================================
       2. DATABASE CONNECTION
    ===================================================== */

    await connectDB();

    /* =====================================================
       3. READ REQUEST BODY
    ===================================================== */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       4. VALIDATE REQUEST BODY
    ===================================================== */

    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      restaurantId,
      items,
      paymentMethod,
      deliveryAddress,
      customerNote,
    } = parsed.data;

    /* =====================================================
       5. VALIDATE RESTAURANT ID
    ===================================================== */

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    const restaurantObjectId =
      new mongoose.Types.ObjectId(restaurantId);

    /* =====================================================
       6. VALIDATE MENU ITEM IDS
    ===================================================== */

    for (const item of items) {
      if (
        !mongoose.Types.ObjectId.isValid(item.menuItemId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid menu item ID: ${item.menuItemId}`,
          },
          { status: 400 }
        );
      }
    }

    /* =====================================================
       7. PREVENT DUPLICATE MENU ITEMS
    ===================================================== */

    const menuItemIds = items.map(
      (item) => item.menuItemId
    );

    const uniqueMenuItemIds = new Set(menuItemIds);

    if (
      uniqueMenuItemIds.size !== menuItemIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate menu items are not allowed",
        },
        { status: 400 }
      );
    }

    const menuObjectIds = menuItemIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    /* =====================================================
       8. START DATABASE SESSION
    ===================================================== */

    session = await mongoose.startSession();

    /* =====================================================
       9. START TRANSACTION
    ===================================================== */

    session.startTransaction();

    /* =====================================================
       10. FIND RESTAURANT
    ===================================================== */

    const restaurant = await Restaurant.findOne({
      _id: restaurantObjectId,
      isActive: true,
    })
      .select("_id name isOpen")
      .session(session)
      .lean();

    if (!restaurant) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found or inactive",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       11. CHECK RESTAURANT OPEN
    ===================================================== */

    if (!restaurant.isOpen) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "Restaurant is currently closed",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       12. FIND MENU ITEMS
    ===================================================== */

    const menuItems = await MenuItem.find({
      _id: {
        $in: menuObjectIds,
      },

      restaurantId: restaurantObjectId,

      isAvailable: true,
    })
      .select(
        "_id name price image restaurantId isAvailable"
      )
      .session(session)
      .lean();

    /* =====================================================
       13. CHECK MENU ITEMS
    ===================================================== */

    if (menuItems.length !== items.length) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message:
            "One or more menu items are unavailable, invalid, or belong to another restaurant",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       14. CREATE ORDER ITEMS
    ===================================================== */

    const orderItems = [];

    let subtotal = 0;

    for (const item of items) {
      const menuItem = menuItems.find(
        (menu) =>
          menu._id.toString() === item.menuItemId
      );

      if (!menuItem) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              `Menu item not found: ${item.menuItemId}`,
          },
          { status: 400 }
        );
      }

      /* ===================================================
         IMPORTANT:
         PRICE COMES FROM DATABASE
      =================================================== */

      const itemSubtotal =
        menuItem.price * item.quantity;

      subtotal += itemSubtotal;

      orderItems.push({
        menuItemId: menuItem._id,

        name: menuItem.name,

        price: menuItem.price,

        quantity: item.quantity,

        image: menuItem.image || "",

        subtotal: itemSubtotal,
      });
    }

    /* =====================================================
       17. DISCOUNT
    ===================================================== */

    // Load Cart to get the coupon code
    const { default: Cart } = await import("@/models/Cart");
    const cart = await Cart.findOne({
      customerId: user.id,
      restaurantId: restaurantObjectId,
    }).session(session).lean();

    let discount = 0;
    let appliedCouponCode = undefined;
    let appliedOfferId = undefined;
    let isFreeDelivery = false;

    if (cart?.appliedCouponCode) {
      try {
        const { OfferService } = await import("@/lib/services/offer.service");
        // validateCoupon will check usage limits, min order, applicability, etc.
        const { discountAmount, offer } = await OfferService.validateCoupon(
          cart.appliedCouponCode,
          restaurantId,
          user.id,
          cart.items
        );
        discount = discountAmount;
        appliedCouponCode = offer.code;
        appliedOfferId = offer._id;
        
        if (offer.discountType === "FREE_DELIVERY") {
          isFreeDelivery = true;
        }

        // Atomically increment the usedCount of the offer
        await mongoose.model('Offer').findByIdAndUpdate(
          offer._id,
          { $inc: { usedCount: 1 } },
          { session }
        );
      } catch (error) {
        console.warn("Coupon invalid during checkout", error);
        // Fail the checkout if coupon is invalid rather than silently dropping it
        await session.abortTransaction();
        return NextResponse.json(
          {
            success: false,
            message: error instanceof Error ? error.message : "Invalid coupon",
          },
          { status: 400 }
        );
      }
    }

    /* =====================================================
       15. DELIVERY FEE
    ===================================================== */

    const deliveryFee = isFreeDelivery ? 0 : 40;

    /* =====================================================
       16. TAX
       5%
    ===================================================== */

    const tax = Math.round(
      subtotal * 0.05
    );

    /* =====================================================
       18. TOTAL
    ===================================================== */

    const totalAmount =
      subtotal +
      deliveryFee +
      tax -
      discount;

    /* =====================================================
       19. PAYMENT STATUS
    ===================================================== */

    const paymentStatus = "PENDING";

    /* =====================================================
       20. CREATE ORDER
    ===================================================== */

    const createdOrders =
      await Order.create(
        [
          {
            restaurantId: restaurantObjectId,

            customerId: user.id,

            items: orderItems,

            subtotal,

            deliveryFee,

            tax,

            discount,

            totalAmount,

            status: "PENDING",

            paymentMethod,

            paymentStatus,

            deliveryAddress: {
              name: deliveryAddress.name,
              phone: deliveryAddress.phone,
              addressLine1: deliveryAddress.addressLine1,
              addressLine2: deliveryAddress.addressLine2 || "",
              city: deliveryAddress.city,
              state: deliveryAddress.state,
              pincode: deliveryAddress.pincode,
              latitude: deliveryAddress.latitude,
              longitude: deliveryAddress.longitude,
            },

            customerNote: customerNote || "",
            
            offerId: appliedOfferId,
            couponCode: appliedCouponCode,
          },
        ],
        {
          session,
        }
      );

    const order = createdOrders[0];

    /* =====================================================
       21. CLEAR CART
    ===================================================== */

    // We imported Cart at the top.
    await Cart.findOneAndDelete(
      { customerId: user.id, restaurantId: restaurantObjectId },
      { session }
    );

    /* =====================================================
       22. COMMIT TRANSACTION
    ===================================================== */

    await session.commitTransaction();

    /* =====================================================
       23. SUCCESS RESPONSE
    ===================================================== */


    return NextResponse.json(
      {
        success: true,

        message: "Order created successfully",

        data: {
          orderId: order._id,

          status: order.status,

          pricing: {
            subtotal: order.subtotal,

            deliveryFee: order.deliveryFee,

            tax: order.tax,

            discount: order.discount,

            totalAmount: order.totalAmount,
          },

          payment: {
            method: order.paymentMethod,

            status: order.paymentStatus,
          },

          restaurant: {
            id: restaurant._id,

            name: restaurant.name,
          },

          items: order.items,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    /* =====================================================
       ERROR HANDLING
    ===================================================== */

    if (session) {
      try {
        await session.abortTransaction();
      } catch {
        // Transaction may already be committed or aborted
      }
    }

    console.error("====================================");
    console.error("CREATE ORDER ERROR:");
    console.error(error);
    console.error("====================================");

    /* =====================================================
       ZOD ERROR
    ===================================================== */

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    /* =====================================================
       MONGOOSE VALIDATION ERROR
    ===================================================== */

    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      const errors: Record<string, string> = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] =
          error.errors[key].message;
      });

      return NextResponse.json(
        {
          success: false,
          message: "Order validation failed",
          errors,
        },
        { status: 400 }
      );
    }

    /* =====================================================
       MONGOOSE CAST ERROR
    ===================================================== */

    if (
      error instanceof mongoose.Error.CastError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid database ID",
          field: error.path,
          value: error.value,
        },
        { status: 400 }
      );
    }

    /* =====================================================
       GENERIC ERROR
    ===================================================== */

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",

        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
      }
    );
  } finally {
    /* =====================================================
       END SESSION
    ===================================================== */

    if (session) {
      await session.endSession();
    }
  }
}

/* =========================================================
   GET /api/orders
   CUSTOMER ORDERS
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    /* =====================================================
       1. AUTHENTICATION
    ===================================================== */

    const user = await requireAuth();

    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    /* =====================================================
       2. DATABASE
    ===================================================== */

    await connectDB();

    /* =====================================================
       3. QUERY PARAMETERS
    ===================================================== */

    const { searchParams } =
      new URL(request.url);

    const pageParam = Number(
      searchParams.get("page") || "1"
    );

    const limitParam = Number(
      searchParams.get("limit") || "10"
    );

    const status =
      searchParams.get("status");

    /* =====================================================
       4. PAGINATION
    ===================================================== */

    const page = Math.max(
      1,
      Number.isFinite(pageParam)
        ? Math.floor(pageParam)
        : 1
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        Number.isFinite(limitParam)
          ? Math.floor(limitParam)
          : 10
      )
    );

    const skip =
      (page - 1) * limit;

    /* =====================================================
       5. FILTER
    ===================================================== */

    const filter: Record<string, unknown> = {
      customerId: new mongoose.Types.ObjectId(user.id as string),
    };

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (
      status &&
      allowedStatuses.includes(status)
    ) {
      filter.status = status;
    }

    /* =====================================================
       6. GET ORDERS
    ===================================================== */

    const [orders, total] =
      await Promise.all([
        Order.find(filter)
          .select(
            [
              "_id",
              "restaurantId",
              "items",
              "subtotal",
              "deliveryFee",
              "tax",
              "discount",
              "totalAmount",
              "status",
              "paymentMethod",
              "paymentStatus",
              "deliveryAddress",
              "customerNote",
              "createdAt",
              "updatedAt",
            ].join(" ")
          )
          .populate("restaurantId", "name logo")
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Order.countDocuments(filter),
      ]);

    /* =====================================================
       7. PAGINATION
    ===================================================== */

    const totalPages =
      Math.ceil(total / limit);

    /* =====================================================
       8. RESPONSE
    ===================================================== */

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
      "GET ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",

        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}