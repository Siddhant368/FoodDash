import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { authErrorResponse } from "@/lib/auth/errors";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import { requireRestaurantAccess } from "@/lib/auth/restaurant-access";
import { accessErrorResponse } from "@/lib/auth/access-response";
import { checkSubscriptionLimit } from "@/lib/subscription/limits";

const createMenuItemSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150, "Name is too long"),
  slug: z.string().trim().min(2, "Slug is required").max(150, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers and hyphens"),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID"),
  description: z.string().trim().max(1000, "Description is too long").optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  image: z.string().trim().optional(),
  isVeg: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  preparationTime: z.number().min(1, "Preparation time must be at least 1 minute").default(20),
});

export async function GET(request: Request) {
  try {
    await connectDB();
    const { user } = await requireRestaurantAccess();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const isAvailable = searchParams.get("isAvailable");
    const isFeatured = searchParams.get("isFeatured");
    const isVeg = searchParams.get("isVeg");

    const filter: any = { restaurantId: user.restaurantId! };

    if (categoryId && categoryId !== "all") {
      filter.categoryId = categoryId;
    }
    if (isAvailable === "true") filter.isAvailable = true;
    if (isAvailable === "false") filter.isAvailable = false;
    if (isFeatured === "true") filter.isFeatured = true;
    if (isVeg === "true") filter.isVeg = true;
    if (isVeg === "false") filter.isVeg = false;

    if (search?.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .populate("categoryId", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MenuItem.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("GET ADMIN MENU ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { user } = await requireRestaurantAccess();

    const limitResult = await checkSubscriptionLimit(user.restaurantId!.toString(), "MENU_ITEM");
    if (!limitResult.allowed) {
      return NextResponse.json({ success: false, message: limitResult.message }, { status: 403 });
    }

    const body = await request.json();
    const result = createMenuItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const data = result.data;

    // Verify category belongs to this restaurant
    const category = await Category.findOne({ _id: data.categoryId, restaurantId: user.restaurantId! });
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found or invalid" }, { status: 404 });
    }

    const existingSlug = await MenuItem.exists({ restaurantId: user.restaurantId!, slug: data.slug });
    if (existingSlug) {
      return NextResponse.json({ success: false, message: "Menu item with this slug already exists" }, { status: 409 });
    }

    const menuItem = await MenuItem.create({
      ...data,
      restaurantId: user.restaurantId!,
    });

    return NextResponse.json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem
    }, { status: 201 });

  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("POST ADMIN MENU ERROR:", error);
    if (typeof error === "object" && error !== null && "code" in error && (error as any).code === 11000) {
      return NextResponse.json({ success: false, message: "Menu item with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Failed to create menu item" }, { status: 500 });
  }
}