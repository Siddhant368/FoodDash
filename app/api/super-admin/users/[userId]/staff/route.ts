import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";

const updateStaffSchema = z.object({
  name: z.string().min(2).max(100).optional(),

  email: z.string().email().toLowerCase().optional(),

  password: z.string().min(8).optional(),

  phone: z.string().min(7).max(20).optional(),

  restaurantId: z.string().optional(),

  isActive: z.boolean().optional(),
});

/**
 * PATCH /api/super-admin/users/:userId/staff
 *
 * Update staff member
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // 1. SUPER_ADMIN authentication
    await requireRole(["SUPER_ADMIN"]);

    // 2. Get user ID
    const { userId } = await params;

    // 3. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // 4. Connect DB
    await connectDB();

    // 5. Parse body
    const body = await request.json();

    const parsed = updateStaffSchema.safeParse(body);

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

    const data = parsed.data;

    // 6. Find staff
    const staff = await User.findById(userId).select("+password");

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff not found",
        },
        { status: 404 }
      );
    }

    // 7. Make sure this is STAFF
    if (staff.role !== "STAFF") {
      return NextResponse.json(
        {
          success: false,
          message: "This user is not a staff member",
        },
        { status: 400 }
      );
    }

    // 8. Email update
    if (data.email && data.email !== staff.email) {
      const existingUser = await User.findOne({
        email: data.email,
        _id: { $ne: userId },
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

      staff.email = data.email;
    }

    // 9. Name
    if (data.name !== undefined) {
      staff.name = data.name;
    }

    // 10. Phone
    if (data.phone !== undefined) {
      staff.phone = data.phone;
    }

    // 11. Active status
    if (data.isActive !== undefined) {
      staff.isActive = data.isActive;
    }

    // 12. Restaurant change
    if (
      data.restaurantId !== undefined &&
      data.restaurantId !== staff.restaurantId?.toString()
    ) {
      if (!mongoose.Types.ObjectId.isValid(data.restaurantId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid restaurant ID",
          },
          { status: 400 }
        );
      }

      const restaurant = await Restaurant.findOne({
        _id: data.restaurantId,
        isActive: true,
      })
        .select("_id")
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

      staff.restaurantId = restaurant._id;
    }

    // 13. Password update
    if (data.password) {
      staff.password = await bcrypt.hash(data.password, 12);
    }

    // 14. Save
    await staff.save();

    // 15. Sanitized response
    const staffResponse = {
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      restaurantId: staff.restaurantId,
      isActive: staff.isActive,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: "Staff updated successfully",
      data: {
        staff: staffResponse,
      },
    });
  } catch (error) {
    console.error("Update staff error:", error);

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
        message: "Failed to update staff",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/super-admin/users/:userId/staff
 *
 * Soft delete staff
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // 1. SUPER_ADMIN authentication
    await requireRole(["SUPER_ADMIN"]);

    // 2. Get user ID
    const { userId } = await params;

    // 3. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // 4. Connect DB
    await connectDB();

    // 5. Find staff
    const staff = await User.findById(userId);

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff not found",
        },
        { status: 404 }
      );
    }

    // 6. Role check
    if (staff.role !== "STAFF") {
      return NextResponse.json(
        {
          success: false,
          message: "This user is not a staff member",
        },
        { status: 400 }
      );
    }

    // 7. Already inactive
    if (!staff.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff is already inactive",
        },
        { status: 409 }
      );
    }

    // 8. Soft delete
    staff.isActive = false;

    await staff.save();

    // 9. Sanitized response
    const staffResponse = {
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      restaurantId: staff.restaurantId,
      isActive: staff.isActive,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: "Staff deactivated successfully",
      data: {
        staff: staffResponse,
      },
    });
  } catch (error) {
    console.error("Delete staff error:", error);

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
        message: "Failed to deactivate staff",
      },
      { status: 500 }
    );
  }
}