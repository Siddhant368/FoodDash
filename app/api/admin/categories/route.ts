import { NextResponse } from "next/server";
import { z } from "zod";

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
// VALIDATION
// =====================================================

const createCategorySchema =
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
      ),

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
      ),

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
// GET /api/admin/categories
// =====================================================

export async function GET(
  request: Request
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
    // QUERY PARAMETERS
    // -----------------------------------------------

    const {
      searchParams,
    } = new URL(request.url);

    const search =
      searchParams.get("search");

    const active =
      searchParams.get("active");

    // -----------------------------------------------
    // FILTER
    // -----------------------------------------------

    const filter: Record<
      string,
      unknown
    > = {
      restaurantId:
        user.restaurantId,
    };

    // -----------------------------------------------
    // ACTIVE FILTER
    // -----------------------------------------------

    if (active === "true") {
      filter.isActive = true;
    }

    if (active === "false") {
      filter.isActive = false;
    }

    // -----------------------------------------------
    // SEARCH
    // -----------------------------------------------

    if (search?.trim()) {
      filter.name = {
        $regex:
          search.trim(),
        $options: "i",
      };
    }

    // -----------------------------------------------
    // FETCH
    // -----------------------------------------------

    const categories =
      await Category.find(
        filter
      )
        .select(
          "_id name slug image sortOrder isActive createdAt updatedAt"
        )
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .lean();

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    // -----------------------------------------------
    // ACCESS ERROR
    // -----------------------------------------------

    const accessResponse =
      accessErrorResponse(
        error
      );

    if (accessResponse) {
      return accessResponse;
    }

    // -----------------------------------------------
    // AUTH ERROR
    // -----------------------------------------------

    const authResponse =
      authErrorResponse(
        error
      );

    if (authResponse) {
      return authResponse;
    }

    // -----------------------------------------------
    // SERVER ERROR
    // -----------------------------------------------

    console.error(
      "GET ADMIN CATEGORIES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}


// =====================================================
// POST /api/admin/categories
// =====================================================

export async function POST(
  request: Request
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
    // REQUEST BODY
    // -----------------------------------------------

    const body =
      await request.json();

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    const result =
      createCategorySchema.safeParse(
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

    const {
      name,
      slug,
      image,
      sortOrder,
      isActive,
    } = result.data;

    // -----------------------------------------------
    // DUPLICATE SLUG
    // -----------------------------------------------

    const existingCategory =
      await Category.exists({
        restaurantId:
          user.restaurantId,

        slug,
      });

    if (existingCategory) {
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

    // -----------------------------------------------
    // CREATE CATEGORY
    // -----------------------------------------------

    const categoryData =
      await Category.create({
        restaurantId:
          user.restaurantId as any,

        name,

        slug,

        image:
          image || "",

        sortOrder:
          sortOrder ?? 0,

        isActive:
          isActive ?? true,
      });

    const category = categoryData as any;

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Category created successfully",

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
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    // -----------------------------------------------
    // ACCESS ERROR
    // -----------------------------------------------

    const accessResponse =
      accessErrorResponse(
        error
      );

    if (accessResponse) {
      return accessResponse;
    }

    // -----------------------------------------------
    // AUTH ERROR
    // -----------------------------------------------

    const authResponse =
      authErrorResponse(
        error
      );

    if (authResponse) {
      return authResponse;
    }

    // -----------------------------------------------
    // SERVER ERROR
    // -----------------------------------------------

    console.error(
      "POST ADMIN CATEGORIES ERROR:",
      error
    );

    // -----------------------------------------------
    // DUPLICATE INDEX
    // -----------------------------------------------

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
          "Failed to create category",
      },
      {
        status: 500,
      }
    );
  }
}