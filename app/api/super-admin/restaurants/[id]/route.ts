import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";

// ============================================================
// UPDATE VALIDATION SCHEMA
// ============================================================

const updateRestaurantSchema = z
  .object({
    name: z
      .string()
      .min(2, "Restaurant name is required")
      .max(100, "Restaurant name is too long")
      .trim()
      .optional(),

    slug: z
      .string()
      .min(2, "Slug is required")
      .max(100, "Slug is too long")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers and hyphens"
      )
      .trim()
      .optional(),

    logo: z
      .string()
      .optional()
      .or(z.literal("")),

    description: z
      .string()
      .max(500, "Description is too long")
      .optional(),

    phone: z
      .string()
      .max(20, "Phone number is too long")
      .optional(),

    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),

    address: z
      .object({
        street: z
          .string()
          .min(2, "Street is required")
          .max(200, "Street is too long"),

        city: z
          .string()
          .min(2, "City is required")
          .max(100),

        state: z
          .string()
          .min(2, "State is required")
          .max(100),

        pincode: z
          .string()
          .min(4, "Invalid pincode")
          .max(10),

        country: z
          .string()
          .min(2)
          .max(100)
          .optional(),
      })
      .optional(),

    isOpen: z
      .boolean()
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required",
    }
  );

// ============================================================
// GET SINGLE RESTAURANT
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
    // 1. Check SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"]);

    // 2. Connect database
    await connectDB();

    // 3. Get restaurant ID
    const { id } = await params;

    // 4. Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    // 5. Find restaurant
    const restaurant = await Restaurant.findById(id)
      .select(
        "_id name slug logo coverImage description phone email address isOpen isActive createdAt updatedAt"
      )
      .lean();

    // 6. Not found
    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 }
      );
    }

    // 7. Success
    return NextResponse.json({
      success: true,
      restaurant,
    });
  } catch (error: unknown) {
    console.error(
      "SUPER ADMIN GET RESTAURANT ERROR:",
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
            "Only SUPER_ADMIN can view restaurant details",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch restaurant",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - UPDATE RESTAURANT
// ============================================================

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // 1. Check SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"]);

    // 2. Connect database
    await connectDB();

    // 3. Get restaurant ID
    const { id } = await params;

    // 4. Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    // 5. Parse JSON
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

    // 6. Validate request
    const result =
      updateRestaurantSchema.safeParse(body);

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

    // 7. Find restaurant
    const restaurant =
      await Restaurant.findById(id);

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 }
      );
    }

    // 8. Check duplicate slug
    if (data.slug !== undefined) {
      const slug = data.slug
        .trim()
        .toLowerCase();

      const existingRestaurant =
        await Restaurant.findOne({
          slug,
          _id: {
            $ne: id,
          },
        })
          .select("_id")
          .lean();

      if (existingRestaurant) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Restaurant with this slug already exists",
          },
          { status: 409 }
        );
      }

      restaurant.slug = slug;
    }

    // 9. Update name
    if (data.name !== undefined) {
      restaurant.name =
        data.name.trim();
    }

    // 10. Update logo
    if (data.logo !== undefined) {
      restaurant.logo =
        data.logo.trim() || undefined;
    }

    // 11. Update description
    if (data.description !== undefined) {
      restaurant.description =
        data.description.trim() || undefined;
    }

    // 12. Update phone
    if (data.phone !== undefined) {
      restaurant.phone =
        data.phone.trim() || undefined;
    }

    // 13. Update email
    if (data.email !== undefined) {
      restaurant.email =
        data.email.trim().toLowerCase() || undefined;
    }

    // 14. Update address
    if (data.address !== undefined) {
      restaurant.address = {
        street:
          data.address.street.trim(),

        city:
          data.address.city.trim(),

        state:
          data.address.state.trim(),

        pincode:
          data.address.pincode.trim(),

        country:
          data.address.country?.trim() ||
          "India",
      };
    }

    // 15. Update open status
    if (data.isOpen !== undefined) {
      restaurant.isOpen =
        data.isOpen;
    }

    // 16. Update active status
    if (data.isActive !== undefined) {
      restaurant.isActive =
        data.isActive;
    }

    // 17. Save
    await restaurant.save();

    // 18. Response
    return NextResponse.json({
      success: true,
      message:
        "Restaurant updated successfully",

      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        logo: restaurant.logo,
        description: restaurant.description,
        phone: restaurant.phone,
        email: restaurant.email,
        address: restaurant.address,
        isOpen: restaurant.isOpen,
        isActive: restaurant.isActive,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
      },
    });
  } catch (error: unknown) {
    console.error(
      "SUPER ADMIN UPDATE RESTAURANT ERROR:",
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
            "Only SUPER_ADMIN can update restaurants",
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
            "Restaurant with this slug already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update restaurant",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - SOFT DELETE / DEACTIVATE RESTAURANT
// ============================================================

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // 1. Check SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"]);

    // 2. Connect database
    await connectDB();

    // 3. Get restaurant ID
    const { id } = await params;

    // 4. Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    // 5. Find restaurant
    const restaurant =
      await Restaurant.findById(id);

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 }
      );
    }

    // 6. Already inactive
    if (!restaurant.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Restaurant is already deactivated",
        },
        { status: 409 }
      );
    }

    // 7. Soft delete
    restaurant.isActive = false;

    // Restaurant should also stop accepting orders
    restaurant.isOpen = false;

    // 8. Save
    await restaurant.save();

    // 9. Success response
    return NextResponse.json({
      success: true,
      message:
        "Restaurant deactivated successfully",

      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        isOpen: restaurant.isOpen,
        isActive: restaurant.isActive,
        updatedAt: restaurant.updatedAt,
      },
    });
  } catch (error: unknown) {
    console.error(
      "SUPER ADMIN DELETE RESTAURANT ERROR:",
      error
    );

    // Unauthorized
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

    // Forbidden
    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only SUPER_ADMIN can delete restaurants",
        },
        { status: 403 }
      );
    }

    // Internal error
    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to deactivate restaurant",
      },
      { status: 500 }
    );
  }
}