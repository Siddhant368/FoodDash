import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import Subscription from "@/models/Subscription";
import Plan from "@/models/Plan";

const updateSubSchema = z.object({
  planId: z.string().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }).optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }).optional(),
  autoRenew: z.boolean().optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
}).refine(data => Object.keys(data).length > 0, { message: "At least one field required" });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const result = updateSubSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ success: false, message: "Validation failed", errors: result.error.flatten() }, { status: 400 });

    const data = result.data;
    
    const sub = await Subscription.findById(id);
    if (!sub) return NextResponse.json({ success: false, message: "Subscription not found" }, { status: 404 });

    if (data.planId && data.planId !== sub.planId.toString()) {
      const plan = await Plan.findById(data.planId);
      if (!plan || !plan.isActive) return NextResponse.json({ success: false, message: "Invalid or inactive plan" }, { status: 400 });
      sub.planId = plan._id;
      sub.priceAtPurchase = plan.price;
      sub.billingCycle = plan.billingCycle;
    }

    if (data.startDate) sub.startDate = new Date(data.startDate);
    if (data.endDate) sub.endDate = new Date(data.endDate);
    if (data.status) sub.status = data.status;
    if (data.autoRenew !== undefined) sub.autoRenew = data.autoRenew;

    if (sub.endDate <= sub.startDate) {
      return NextResponse.json({ success: false, message: "End Date must be after Start Date" }, { status: 400 });
    }

    // Check overlap if making active
    if (data.status === "ACTIVE") {
      const existingActive = await Subscription.findOne({
        _id: { $ne: sub._id },
        restaurantId: sub.restaurantId,
        status: "ACTIVE",
        endDate: { $gt: new Date() }
      });
      if (existingActive) return NextResponse.json({ success: false, message: "Restaurant already has an active subscription" }, { status: 409 });
    }

    await sub.save();
    return NextResponse.json({ success: true, message: "Subscription updated successfully", data: { subscription: sub } });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Super Admin access required" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to update subscription" }, { status: 500 });
  }
}
