import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";

// ============================================================
// CREATE ADMIN VALIDATION
// ============================================================

const createAdminSchema = z.object({
  name: z
    .string()
    .min(2, "Admin name must be at least 2 characters")
    .max(100, "Admin name is too long")
    .trim(),

  email: z
    .string()
    .email("Invalid email address")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),

  phone: z
    .string()
    .max(20, "Phone number is too long")
    .trim()
    .optional(),
});

// ============================================================
// GET ADMIN QUERY
// ============================================================

const getAdminQuerySchema = z.object({
  search: z.string().trim().optional(),

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

// ============================================================
// POST
// CREATE RESTAURANT ADMIN
// ============================================================

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // 1. SUPER ADMIN CHECK
    await requireRole(["SUPER_ADMIN"]);

    // 2. DATABASE
    await connectDB();

    // 3. RESTAURANT ID
    const { id } = await params;

    // 4. VALIDATE ID
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    // 5. CHECK RESTAURANT
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

    // 6. ACTIVE CHECK
    if (!restaurant.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot create admin for an inactive restaurant",
        },
        { status: 400 }
      );
    }

    // 7. READ BODY
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

    // 8. VALIDATE BODY
    const result =
      createAdminSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // 9. CHECK EMAIL
    const existingUser = await User.findOne({
      email: data.email,
    })
      .select("_id email role")
      .lean();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    // 10. HASH PASSWORD
    const hashedPassword = await bcrypt.hash(
      data.password,
      12
    );

    // 11. CREATE ADMIN
    const admin = await User.create({
      name: data.name.trim(),

      email: data.email
        .trim()
        .toLowerCase(),

      password: hashedPassword,

      phone:
        data.phone?.trim() || undefined,

      role: "RESTAURANT_ADMIN",

      restaurantId: restaurant._id,

      isActive: true,
    });

    // 12. RESPONSE
    return NextResponse.json(
      {
        success: true,

        message:
          "Restaurant admin created successfully",

        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          restaurantId: admin.restaurantId,
          isActive: admin.isActive,
          createdAt: admin.createdAt,
        },

        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "SUPER ADMIN CREATE RESTAURANT ADMIN ERROR:",
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
            "Only SUPER_ADMIN can create restaurant admins",
        },
        { status: 403 }
      );
    }

    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create restaurant admin",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET
// LIST RESTAURANT ADMINS
// ============================================================

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // 1. SUPER ADMIN CHECK
    await requireRole(["SUPER_ADMIN"]);

    // 2. DATABASE
    await connectDB();

    // 3. RESTAURANT ID
    const { id } = await params;

    // 4. VALIDATE ID
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    // 5. CHECK RESTAURANT
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

    // 6. QUERY PARAMETERS
    const { searchParams } =
      new URL(request.url);

    const queryResult =
      getAdminQuerySchema.safeParse({
        search:
          searchParams.get("search") ||
          undefined,

        isActive:
          searchParams.get("isActive") ||
          undefined,

        page:
          searchParams.get("page") ||
          undefined,

        limit:
          searchParams.get("limit") ||
          undefined,
      });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid query parameters",
          errors:
            queryResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      search,
      isActive,
      page,
      limit,
    } = queryResult.data;

    // 7. BUILD FILTER
    const filter: Record<string, unknown> = {
      restaurantId: restaurant._id,
      role: "RESTAURANT_ADMIN",
    };

    // 8. ACTIVE FILTER
    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    // 9. SEARCH
    if (search) {
      const escapedSearch =
        search.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      const searchRegex =
        new RegExp(
          escapedSearch,
          "i"
        );

      filter.$or = [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
      ];
    }

    // 10. PAGINATION
    const skip =
      (page - 1) * limit;

    // 11. FETCH ADMINS
    const [admins, total] =
      await Promise.all([
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

    // 12. RESPONSE
    return NextResponse.json({
      success: true,

      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        isActive: restaurant.isActive,
      },

      admins,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error(
      "SUPER ADMIN GET RESTAURANT ADMINS ERROR:",
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
            "Only SUPER_ADMIN can view restaurant admins",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch restaurant admins",
      },
      { status: 500 }
    );
  }
}