import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import { checkSubscriptionLimit } from "@/lib/subscription/limits";

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const createUserSchema = z.object({
  name: z.string().min(2, "Name is required").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase(),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["RESTAURANT_ADMIN", "STAFF", "DELIVERY_PARTNER"]),
  restaurantId: z.string().min(1, "Restaurant is required"),
});

// =====================================================
// GET - LIST USERS
// =====================================================

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role");
    const restaurantId = searchParams.get("restaurantId");
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
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "All") filter.role = role;
    if (restaurantId && restaurantId !== "All") filter.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    // Fetch users with their associated restaurants
    const users = await User.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "restaurants",
          localField: "restaurantId",
          foreignField: "_id",
          as: "restaurant"
        }
      },
      {
        $addFields: {
          restaurant: { $arrayElemAt: ["$restaurant", 0] }
        }
      },
      {
        $project: {
          password: 0 // Never expose password
        }
      }
    ]);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    });
  } catch (error: any) {
    console.error("GET USERS ERROR:", error);
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Only SUPER_ADMIN can view users" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 });
  }
}

// =====================================================
// POST - CREATE USER
// =====================================================

export async function POST(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, message: "Validation failed", errors: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;

    // Check duplicate email
    const existingUser = await User.findOne({ email: data.email }).select("_id").lean();
    if (existingUser) {
      return NextResponse.json({ success: false, message: "An account with this email already exists." }, { status: 409 });
    }

    // Verify Restaurant
    const restaurant = await Restaurant.findById(data.restaurantId).lean();
    if (!restaurant) {
      return NextResponse.json({ success: false, message: "Selected restaurant not found." }, { status: 404 });
    }

    // Check Subscription Limits for STAFF and DELIVERY_PARTNER
    if (data.role === "STAFF" || data.role === "DELIVERY_PARTNER") {
      const limitResult = await checkSubscriptionLimit(data.restaurantId, data.role);
      if (!limitResult.allowed) {
        return NextResponse.json({ success: false, message: limitResult.message || "Subscription limit reached." }, { status: 403 });
      }
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create User
    const user = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: data.role,
      restaurantId: data.restaurantId,
      isActive: true,
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return NextResponse.json({ success: true, message: "User created successfully", user: userObj }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE USER ERROR:", error);
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Only SUPER_ADMIN can create users" }, { status: 403 });
    if (error.code === 11000) return NextResponse.json({ success: false, message: "An account with this email already exists." }, { status: 409 });
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 });
  }
}
