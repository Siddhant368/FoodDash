import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import {
  checkSubscriptionLimit,
} from "@/lib/subscription/limits";

const createDeliveryPartnerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100),

  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long"),
});

const querySchema = z.object({
  search: z.string().optional(),

  isActive: z
    .enum(["true", "false"])
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),
});

/**
 * POST
 * /api/super-admin/restaurants/:id/delivery-partners
 *
 * Create Delivery Partner
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Only SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"]);

    // 2. Get restaurant ID
    const { id } = await params;

    // 3. Validate restaurant ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    // 4. Connect database
    await connectDB();

    // 5. Check restaurant
    const restaurant = await Restaurant.findOne({
      _id: id,
      isActive: true,
    })
      .select("_id name slug isActive")
      .lean();

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found or inactive",
        },
        { status: 404 }
      );
    }

    // 6. Get request body
    const body = await request.json();

    // 7. Validate body
    const parsed = createDeliveryPartnerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      phone,
    } = parsed.data;

    // 8. Check duplicate email
    const existingUser = await User.findOne({
      email,
    })
      .select("_id")
      .lean();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 409 }
      );
    }

    // 9. Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );
    
    const limitCheck =
  await checkSubscriptionLimit(
    id,
    "DELIVERY_PARTNER"
  );

if (!limitCheck.allowed) {
  return NextResponse.json(
    {
      success: false,
      message:
        limitCheck.message ||
        "Delivery partner limit reached",

      data: {
        current:
          limitCheck.current,

        limit:
          limitCheck.limit,

        remaining:
          limitCheck.remaining,
      },
    },
    { status: 403 }
  );
}

    // 10. Create delivery partner
    const deliveryPartner = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "DELIVERY_PARTNER",
      restaurantId: restaurant._id,
      isActive: true,
    });

    // 11. Never return password
    const responseData = {
      _id: deliveryPartner._id,
      name: deliveryPartner.name,
      email: deliveryPartner.email,
      phone: deliveryPartner.phone,
      role: deliveryPartner.role,
      restaurantId: deliveryPartner.restaurantId,
      isActive: deliveryPartner.isActive,
      createdAt: deliveryPartner.createdAt,
      updatedAt: deliveryPartner.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Delivery partner created successfully",
        data: {
          deliveryPartner: responseData,

          restaurant: {
            _id: restaurant._id,
            name: restaurant.name,
            slug: restaurant.slug,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create delivery partner error:",
      error
    );

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            success: false,
            message: "Super Admin access required",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create delivery partner",
      },
      { status: 500 }
    );
  }
}

/**
 * GET
 * /api/super-admin/restaurants/:id/delivery-partners
 *
 * Get Delivery Partners
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Only SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"]);

    // 2. Get restaurant ID
    const { id } = await params;

    // 3. Validate restaurant ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    // 4. Connect database
    await connectDB();

    // 5. Check restaurant
    const restaurant = await Restaurant.findById(id)
      .select("_id name slug isActive")
      .lean();

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 }
      );
    }

    // 6. Query params
    const { searchParams } = new URL(
      request.url
    );

    const query = {
      search:
        searchParams.get("search") ||
        undefined,

      isActive:
        searchParams.get("isActive") ||
        undefined,

      page:
        searchParams.get("page") ||
        "1",

      limit:
        searchParams.get("limit") ||
        "10",
    };

    // 7. Validate query
    const parsedQuery =
      querySchema.safeParse(query);

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid query parameters",
          errors:
            parsedQuery.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      search,
      isActive,
      page,
      limit,
    } = parsedQuery.data;

    // 8. Build filter
    const filter: Record<string, unknown> = {
      restaurantId: id,
      role: "DELIVERY_PARTNER",
    };

    // Active / inactive filter
    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    // Search
    if (search) {
      const escapedSearch =
        search.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    // 9. Pagination
    const skip = (page - 1) * limit;

    // 10. Fetch data + count together
    const [
      deliveryPartners,
      total,
    ] = await Promise.all([
      User.find(filter)
        .select(
          "_id name email phone role restaurantId isActive createdAt updatedAt"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    // 11. Response
    return NextResponse.json({
      success: true,

      data: {
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          isActive: restaurant.isActive,
        },

        deliveryPartners,

        pagination: {
          page,
          limit,
          total,

          totalPages:
            Math.ceil(total / limit),

          hasNextPage:
            page * limit < total,

          hasPreviousPage:
            page > 1,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get delivery partners error:",
      error
    );

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            success: false,
            message: "Super Admin access required",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch delivery partners",
      },
      { status: 500 }
    );
  }
}