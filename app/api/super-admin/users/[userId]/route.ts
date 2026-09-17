import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim().optional(),
  email: z.string().email("Invalid email").trim().toLowerCase().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().max(20).trim().optional().or(z.literal("")),
  restaurantId: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, { message: "At least one field is required" });

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { userId } = await params;
    if (!mongoose.isValidObjectId(userId)) return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });

    const body = await request.json();
    const result = updateUserSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ success: false, message: "Validation failed", errors: result.error.flatten() }, { status: 400 });

    const data = result.data;
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    // Protect Super Admin
    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Cannot modify SUPER_ADMIN through this API" }, { status: 403 });
    }

    if (data.email !== undefined) {
      const existingUser = await User.findOne({ email: data.email, _id: { $ne: userId } }).select("_id").lean();
      if (existingUser) return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });
      user.email = data.email.trim().toLowerCase();
    }

    if (data.name !== undefined) user.name = data.name.trim();
    if (data.phone !== undefined) user.phone = data.phone.trim() || undefined;
    if (data.password !== undefined) user.password = await bcrypt.hash(data.password, 12);
    
    if (data.restaurantId !== undefined) {
      if (!mongoose.isValidObjectId(data.restaurantId)) return NextResponse.json({ success: false, message: "Invalid restaurant ID" }, { status: 400 });
      const restaurant = await Restaurant.findById(data.restaurantId).select("_id isActive").lean();
      if (!restaurant) return NextResponse.json({ success: false, message: "Restaurant not found" }, { status: 404 });
      if (!restaurant.isActive) return NextResponse.json({ success: false, message: "Cannot assign to inactive restaurant" }, { status: 400 });
      user.restaurantId = restaurant._id;
    }

    if (data.isActive !== undefined) user.isActive = data.isActive;

    await user.save();

    return NextResponse.json({ success: true, message: "User updated successfully" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Only SUPER_ADMIN can update users" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    const { userId } = await params;
    if (!mongoose.isValidObjectId(userId)) return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    // Protect Super Admin
    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Cannot deactivate SUPER_ADMIN" }, { status: 403 });
    }

    user.isActive = !user.isActive; // Toggle active status
    await user.save();

    return NextResponse.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, isActive: user.isActive });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Only SUPER_ADMIN can deactivate users" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to deactivate user" }, { status: 500 });
  }
}