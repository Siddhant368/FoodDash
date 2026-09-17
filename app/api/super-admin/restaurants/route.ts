import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const createRestaurantSchema = z.object({
  restaurant: z.object({
    name: z.string().min(2, "Restaurant name is required").max(100, "Restaurant name is too long").trim(),
    slug: z.string().min(2, "Slug is required").max(100, "Slug is too long").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers and hyphens").trim(),
    logo: z.string().optional().or(z.literal("")),
    description: z.string().max(500, "Description is too long").optional(),
    phone: z.string().max(20, "Phone number is too long").optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    address: z.object({
      street: z.string().min(2, "Street is required").max(200, "Street is too long"),
      city: z.string().min(2, "City is required").max(100),
      state: z.string().min(2, "State is required").max(100),
      pincode: z.string().min(4, "Invalid pincode").max(10),
      country: z.string().min(2).max(100).optional(),
    }),
    isOpen: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
  admin: z.object({
    name: z.string().min(2, "Admin name is required").trim(),
    email: z.string().email("Invalid admin email").trim().toLowerCase(),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  planId: z.string().optional().nullable(),
});

// ============================================================
// POST - CREATE RESTAURANT
// ============================================================

export async function POST(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    const result = createRestaurantSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, message: "Validation failed", errors: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;
    const { restaurant: restData, admin: adminData, planId } = data;

    // PRE-CHECKS
    const existingRestaurant = await Restaurant.findOne({ slug: restData.slug }).select("_id").lean();
    if (existingRestaurant) {
      return NextResponse.json({ success: false, message: "Restaurant with this slug already exists" }, { status: 409 });
    }

    const existingUser = await User.findOne({ email: adminData.email }).select("_id").lean();
    if (existingUser) {
      return NextResponse.json({ success: false, message: "An account with this email already exists." }, { status: 409 });
    }

    let plan = null;
    if (planId) {
      plan = await Plan.findOne({ _id: planId, isActive: true }).lean();
      if (!plan) {
        return NextResponse.json({ success: false, message: "Selected plan is not available." }, { status: 400 });
      }
    }

    // TRANSACTION
    const session = await mongoose.startSession();
    let createdRestaurant = null;
    
    try {
      await session.withTransaction(async () => {
        // 1. Create Restaurant
        const newRestaurant = await Restaurant.create([{
          name: restData.name,
          slug: restData.slug,
          logo: restData.logo,
          description: restData.description,
          phone: restData.phone,
          email: restData.email,
          address: {
            street: restData.address.street,
            city: restData.address.city,
            state: restData.address.state,
            pincode: restData.address.pincode,
            country: restData.address.country || "India",
          },
          isOpen: restData.isOpen ?? true,
          isActive: restData.isActive ?? true,
        }], { session });

        createdRestaurant = newRestaurant[0];

        // 2. Create Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        await User.create([{
          name: adminData.name,
          email: adminData.email,
          phone: adminData.phone,
          password: hashedPassword,
          role: "RESTAURANT_ADMIN",
          restaurantId: createdRestaurant._id,
          isActive: true,
        }], { session });

        // 3. Create Subscription if plan selected
        if (plan) {
          const startDate = new Date();
          const endDate = new Date();
          if (plan.billingCycle === "MONTHLY") {
            endDate.setMonth(endDate.getMonth() + 1);
          } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          await Subscription.create([{
            restaurantId: createdRestaurant._id,
            planId: plan._id,
            status: "ACTIVE",
            startDate,
            endDate,
            autoRenew: true,
            priceAtPurchase: plan.price,
            billingCycle: plan.billingCycle,
          }], { session });
        }
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Restaurant created successfully",
        restaurant: {
          id: (createdRestaurant as any)?._id,
          name: (createdRestaurant as any)?.name,
          slug: (createdRestaurant as any)?.slug,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("SUPER ADMIN CREATE RESTAURANT ERROR:", error);
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Only SUPER_ADMIN can create restaurants" }, { status: 403 });
    if (error.code === 11000) return NextResponse.json({ success: false, message: "Duplicate value exists (slug or email)." }, { status: 409 });
    
    return NextResponse.json({ success: false, message: "Failed to create restaurant. Please try again." }, { status: 500 });
  }
}

// ============================================================
// GET - LIST ALL RESTAURANTS
// ============================================================

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const isActive = searchParams.get("isActive");
    const pageValue = Number(searchParams.get("page") || "1");
    const limitValue = Number(searchParams.get("limit") || "10");

    const page = Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1;
    const limit = Number.isFinite(limitValue) && limitValue > 0 ? Math.min(Math.floor(limitValue), 100) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    // Perform aggregation to get admin user and subscription details with the restaurant
    const restaurants = await Restaurant.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "restaurantId",
          pipeline: [{ $match: { role: "RESTAURANT_ADMIN" } }, { $limit: 1 }],
          as: "admin"
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "restaurantId",
          pipeline: [{ $match: { status: "ACTIVE" } }, { $limit: 1 }],
          as: "subscription"
        }
      },
      {
        $addFields: {
          admin: { $arrayElemAt: ["$admin", 0] },
          subscription: { $arrayElemAt: ["$subscription", 0] }
        }
      },
      {
        $lookup: {
          from: "plans",
          localField: "subscription.planId",
          foreignField: "_id",
          as: "plan"
        }
      },
      {
        $addFields: {
          plan: { $arrayElemAt: ["$plan", 0] }
        }
      }
    ]);

    const total = await Restaurant.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("SUPER ADMIN GET RESTAURANTS ERROR:", error);
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Only SUPER_ADMIN can view restaurants" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to fetch restaurants" }, { status: 500 });
  }
}