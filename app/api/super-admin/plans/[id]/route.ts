import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";

const updatePlanSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  price: z.number().min(0).optional(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
  features: z.array(z.string().min(1)).optional(),
  maxStaff: z.number().int().min(0).optional(),
  maxDeliveryPartners: z.number().int().min(0).optional(),
  maxMenuItems: z.number().int().min(0).optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, { message: "At least one field is required" });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, message: "Invalid plan ID" }, { status: 400 });

    const body = await request.json();
    const result = updatePlanSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ success: false, message: "Validation failed", errors: result.error.flatten() }, { status: 400 });

    const data = result.data;
    
    // Check if slug exists
    if (data.slug) {
      const existingPlan = await Plan.findOne({ slug: data.slug, _id: { $ne: id } }).select("_id").lean();
      if (existingPlan) return NextResponse.json({ success: false, message: "Slug already in use" }, { status: 409 });
    }

    const plan = await Plan.findById(id);
    if (!plan) return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });

    // Handle isPopular toggle uniquely
    if (data.isPopular === true) {
      await Plan.updateMany({ _id: { $ne: id } }, { $set: { isPopular: false } });
    }

    // Apply updates
    Object.assign(plan, data);
    await plan.save();

    return NextResponse.json({ success: true, message: "Plan updated successfully", data: { plan } });
  } catch (error: any) {
    console.error("Update Plan Error:", error);
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Super Admin access required" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, message: "Invalid plan ID" }, { status: 400 });

    const plan = await Plan.findById(id);
    if (!plan) return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });

    // Check active subscriptions
    const activeSubCount = await Subscription.countDocuments({ planId: id, status: "ACTIVE" });
    if (activeSubCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "This plan is currently used by active subscriptions and cannot be permanently deleted." 
      }, { status: 409 });
    }

    // Since it's safe (no active subs), we could hard delete, but soft delete is preferred.
    plan.isActive = false;
    await plan.save();

    return NextResponse.json({ success: true, message: "Plan deactivated successfully." });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Super Admin access required" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to deactivate plan" }, { status: 500 });
  }
}