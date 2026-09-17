import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";

const updateDeliveryPartnerSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  email: z
    .string()
    .email()
    .toLowerCase()
    .optional(),

  password: z
    .string()
    .min(8)
    .optional(),

  phone: z
    .string()
    .min(7)
    .max(20)
    .optional(),

  restaurantId: z
    .string()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

/**
 * PATCH
 * /api/super-admin/users/:userId/delivery-partner
 *
 * Update Delivery Partner
 */
export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      userId: string;
    }>;
  }
) {
  try {
    // 1. SUPER_ADMIN only
    await requireRole(["SUPER_ADMIN"]);

    // 2. User ID
    const { userId } = await params;

    // 3. Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
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

    // 5. Body
    const body = await request.json();

    // 6. Validate
    const parsed =
      updateDeliveryPartnerSchema.safeParse(
        body
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors:
            parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 7. Find delivery partner
    const deliveryPartner =
      await User.findById(userId).select(
        "+password"
      );

    if (!deliveryPartner) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery partner not found",
        },
        { status: 404 }
      );
    }

    // 8. Role check
    if (
      deliveryPartner.role !==
      "DELIVERY_PARTNER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This user is not a delivery partner",
        },
        { status: 400 }
      );
    }

    // 9. Email update
    if (
      data.email &&
      data.email !==
        deliveryPartner.email
    ) {
      const existingUser =
        await User.findOne({
          email: data.email,
          _id: {
            $ne: userId,
          },
        })
          .select("_id")
          .lean();

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Email already exists",
          },
          { status: 409 }
        );
      }

      deliveryPartner.email =
        data.email;
    }

    // 10. Name
    if (data.name !== undefined) {
      deliveryPartner.name =
        data.name;
    }

    // 11. Phone
    if (data.phone !== undefined) {
      deliveryPartner.phone =
        data.phone;
    }

    // 12. Active status
    if (data.isActive !== undefined) {
      deliveryPartner.isActive =
        data.isActive;
    }

    // 13. Restaurant change
    if (
      data.restaurantId !==
        undefined &&
      data.restaurantId !==
        deliveryPartner.restaurantId?.toString()
    ) {
      if (
        !mongoose.Types.ObjectId.isValid(
          data.restaurantId
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid restaurant ID",
          },
          { status: 400 }
        );
      }

      const restaurant =
        await Restaurant.findOne({
          _id: data.restaurantId,
          isActive: true,
        })
          .select("_id")
          .lean();

      if (!restaurant) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Restaurant not found or inactive",
          },
          { status: 404 }
        );
      }

      deliveryPartner.restaurantId =
        restaurant._id;
    }

    // 14. Password update
    if (data.password) {
      deliveryPartner.password =
        await bcrypt.hash(
          data.password,
          12
        );
    }

    // 15. Save
    await deliveryPartner.save();

    // 16. Sanitized response
    const responseData = {
      _id: deliveryPartner._id,
      name: deliveryPartner.name,
      email: deliveryPartner.email,
      phone: deliveryPartner.phone,
      role: deliveryPartner.role,
      restaurantId:
        deliveryPartner.restaurantId,
      isActive:
        deliveryPartner.isActive,
      createdAt:
        deliveryPartner.createdAt,
      updatedAt:
        deliveryPartner.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message:
        "Delivery partner updated successfully",

      data: {
        deliveryPartner:
          responseData,
      },
    });
  } catch (error) {
    console.error(
      "Update delivery partner error:",
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
            message:
              "Super Admin access required",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update delivery partner",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 * /api/super-admin/users/:userId/delivery-partner
 *
 * Soft delete / deactivate
 */
export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      userId: string;
    }>;
  }
) {
  try {
    // 1. SUPER_ADMIN only
    await requireRole(["SUPER_ADMIN"]);

    // 2. User ID
    const { userId } = await params;

    // 3. Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
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

    // 5. Find user
    const deliveryPartner =
      await User.findById(userId);

    if (!deliveryPartner) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery partner not found",
        },
        { status: 404 }
      );
    }

    // 6. Role check
    if (
      deliveryPartner.role !==
      "DELIVERY_PARTNER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This user is not a delivery partner",
        },
        { status: 400 }
      );
    }

    // 7. Already inactive
    if (
      !deliveryPartner.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery partner is already inactive",
        },
        { status: 409 }
      );
    }

    // 8. Soft delete
    deliveryPartner.isActive = false;

    await deliveryPartner.save();

    // 9. Response
    const responseData = {
      _id: deliveryPartner._id,
      name: deliveryPartner.name,
      email: deliveryPartner.email,
      phone: deliveryPartner.phone,
      role: deliveryPartner.role,
      restaurantId:
        deliveryPartner.restaurantId,
      isActive:
        deliveryPartner.isActive,
      createdAt:
        deliveryPartner.createdAt,
      updatedAt:
        deliveryPartner.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message:
        "Delivery partner deactivated successfully",

      data: {
        deliveryPartner:
          responseData,
      },
    });
  } catch (error) {
    console.error(
      "Delete delivery partner error:",
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
            message:
              "Super Admin access required",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to deactivate delivery partner",
      },
      { status: 500 }
    );
  }
}