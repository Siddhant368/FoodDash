import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { authErrorResponse } from "@/lib/auth/errors";

import Category from "@/models/Category";

import {
  requireRestaurantAccess,
} from "@/lib/auth/restaurant-access";

import {
  accessErrorResponse,
} from "@/lib/auth/access-response";


// =====================================================
// UPDATE VALIDATION
// =====================================================

const updateCategorySchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Category name must be at least 2 characters"
      )
      .max(
        100,
        "Category name is too long"
      )
      .optional(),

    slug: z
      .string()
      .trim()
      .min(
        2,
        "Slug is required"
      )
      .max(
        100,
        "Slug is too long"
      )
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers and hyphens"
      )
      .optional(),

    image: z
      .string()
      .trim()
      .optional(),

    sortOrder: z
      .number()
      .min(
        0,
        "Sort order cannot be negative"
      )
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  });


// =====================================================
// GET /api/admin/categories/:id
// =====================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // -----------------------------------------------
    // DATABASE
    // -----------------------------------------------

    await connectDB();

    // -----------------------------------------------
    // AUTH + RESTAURANT + SUBSCRIPTION
    // -----------------------------------------------

    const {
      user,
    } =
      await requireRestaurantAccess();

    // -----------------------------------------------
    // PARAMS
    // -----------------------------------------------

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------
    // FIND CATEGORY
    // -----------------------------------------------

    const category =
      await Category.findOne({
        _id: id,

        restaurantId:
          user.restaurantId,
      })
        .select(
          "_id name slug image sortOrder isActive createdAt updatedAt"
        )
        .lean();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    const accessResponse =
      accessErrorResponse(
        error
      );

    if (accessResponse) {
      return accessResponse;
    }

    const authResponse =
      authErrorResponse(
        error
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "GET ADMIN CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch category",
      },
      {
        status: 500,
      }
    );
  }
}


// =====================================================
// PATCH /api/admin/categories/:id
// =====================================================

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // -----------------------------------------------
    // DATABASE
    // -----------------------------------------------

    await connectDB();

    // -----------------------------------------------
    // AUTH + RESTAURANT + SUBSCRIPTION
    // -----------------------------------------------

    const {
      user,
    } =
      await requireRestaurantAccess();

    // -----------------------------------------------
    // PARAMS
    // -----------------------------------------------

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------
    // BODY
    // -----------------------------------------------

    const body =
      await request.json();

    const result =
      updateCategorySchema.safeParse(
        body
      );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Validation failed",
          errors:
            result.error
              .flatten()
              .fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    const data =
      result.data;

    // -----------------------------------------------
    // FIND CATEGORY
    // -----------------------------------------------

    const category =
      await Category.findOne({
        _id: id,

        restaurantId:
          user.restaurantId,
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    // -----------------------------------------------
    // SLUG DUPLICATE CHECK
    // -----------------------------------------------

    if (
      data.slug &&
      data.slug !== category.slug
    ) {
      const duplicate =
        await Category.exists({
          restaurantId:
            user.restaurantId,

          slug:
            data.slug,

          _id: {
            $ne: id,
          },
        });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Category with this slug already exists",
          },
          {
            status: 409,
          }
        );
      }
    }

    // -----------------------------------------------
    // UPDATE
    // -----------------------------------------------

    if (data.name !== undefined) {
      category.name =
        data.name;
    }

    if (data.slug !== undefined) {
      category.slug =
        data.slug;
    }

    if (data.image !== undefined) {
      category.image =
        data.image;
    }

    if (
      data.sortOrder !== undefined
    ) {
      category.sortOrder =
        data.sortOrder;
    }

    if (
      data.isActive !== undefined
    ) {
      category.isActive =
        data.isActive;
    }

    await category.save();

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Category updated successfully",

      data: {
        id:
          category._id.toString(),

        name:
          category.name,

        slug:
          category.slug,

        image:
          category.image,

        sortOrder:
          category.sortOrder,

        isActive:
          category.isActive,
      },
    });
  } catch (error) {
    const accessResponse =
      accessErrorResponse(
        error
      );

    if (accessResponse) {
      return accessResponse;
    }

    const authResponse =
      authErrorResponse(
        error
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "PATCH ADMIN CATEGORY ERROR:",
      error
    );

    if (
      typeof error ===
        "object" &&
      error !== null &&
      "code" in error &&
      (
        error as {
          code?: number;
        }
      ).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category with this slug already exists",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update category",
      },
      {
        status: 500,
      }
    );
  }
}


// =====================================================
// DELETE /api/admin/categories/:id
// =====================================================

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // -----------------------------------------------
    // DATABASE
    // -----------------------------------------------

    await connectDB();

    // -----------------------------------------------
    // AUTH + RESTAURANT + SUBSCRIPTION
    // -----------------------------------------------

    const {
      user,
    } =
      await requireRestaurantAccess();

    // -----------------------------------------------
    // PARAMS
    // -----------------------------------------------

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------
    // FIND CATEGORY
    // -----------------------------------------------

    const category =
      await Category.findOne({
        _id: id,

        restaurantId:
          user.restaurantId,
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    // -----------------------------------------------
    // SOFT DELETE
    // -----------------------------------------------

    category.isActive =
      false;

    await category.save();

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Category deleted successfully",

      data: {
        id:
          category._id.toString(),

        isActive:
          category.isActive,
      },
    });
  } catch (error) {
    const accessResponse =
      accessErrorResponse(
        error
      );

    if (accessResponse) {
      return accessResponse;
    }

    const authResponse =
      authErrorResponse(
        error
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "DELETE ADMIN CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete category",
      },
      {
        status: 500,
      }
    );
  }
}