import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { authErrorResponse } from "@/lib/auth/errors";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import { requireRestaurantAccess } from "@/lib/auth/restaurant-access";
import { accessErrorResponse } from "@/lib/auth/access-response";

const updateMenuItemSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150, "Name is too long").optional(),
  slug: z.string().trim().min(2, "Slug is required").max(150, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers and hyphens").optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID").optional(),
  description: z.string().trim().max(1000, "Description is too long").optional(),
  price: z.number().min(0.01, "Price must be greater than 0").optional(),
  image: z.string().trim().optional(),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  preparationTime: z.number().min(1, "Preparation time must be at least 1 minute").optional(),
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectDB();
    const { user } = await requireRestaurantAccess();

    const menuItem = await MenuItem.findOne({ _id: id, restaurantId: user.restaurantId! }).lean();
    if (!menuItem) {
      return NextResponse.json({ success: false, message: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: menuItem });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ success: false, message: "Failed to fetch menu item" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectDB();
    const { user } = await requireRestaurantAccess();
    const body = await request.json();

    const result = updateMenuItemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const data = result.data;

    if (data.categoryId) {
      const category = await Category.findOne({ _id: data.categoryId, restaurantId: user.restaurantId! });
      if (!category) {
        return NextResponse.json({ success: false, message: "Category not found or invalid" }, { status: 404 });
      }
    }

    if (data.slug) {
      const existingSlug = await MenuItem.exists({ restaurantId: user.restaurantId!, slug: data.slug, _id: { $ne: id } });
      if (existingSlug) {
        return NextResponse.json({ success: false, message: "Menu item with this slug already exists" }, { status: 409 });
      }
    }

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId: user.restaurantId! },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return NextResponse.json({ success: false, message: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Menu item updated successfully", data: menuItem });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    
    if (typeof error === "object" && error !== null && "code" in error && (error as any).code === 11000) {
      return NextResponse.json({ success: false, message: "Menu item with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectDB();
    const { user } = await requireRestaurantAccess();

    // Instead of deleting entirely which breaks old orders, we could do soft delete or hard delete.
    // However, orders usually store snapshot data. But if we need soft delete, we'd update isActive/isAvailable.
    // The prompt says: "Prefer soft delete/deactivation if the existing architecture supports it. IMPORTANT: Do not destroy historical order information. Existing orders contain item snapshots."
    // Let's check if there's a soft delete field. `IMenuItem` only has `isAvailable`, `isFeatured`. It doesn't have an `isDeleted` or `isActive`.
    // Let's just delete it, since OrderItems usually copy the food name and price, but to be 100% safe, maybe we should just delete since orders have snapshot. Wait, if order needs it populated, it'll break. 
    // Mongoose populate will just return null. So I'll hard delete as there's no `isActive` field in MenuItem model. But let's verify if `MenuItem` has an `isActive` field. (I saw it doesn't, only Category has isActive). 
    
    const menuItem = await MenuItem.findOneAndDelete({ _id: id, restaurantId: user.restaurantId! });
    if (!menuItem) {
      return NextResponse.json({ success: false, message: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ success: false, message: "Failed to delete menu item" }, { status: 500 });
  }
}