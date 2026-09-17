import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireRole } from "@/lib/auth/guards";
import Subscription from "@/models/Subscription";
import { getSubscriptionUsage } from "@/lib/subscription/limits";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

    const sub = await Subscription.findById(id).lean();
    if (!sub) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    // Call existing logic
    const usage = await getSubscriptionUsage(sub.restaurantId.toString());

    return NextResponse.json({ success: true, data: { usage } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to fetch usage" }, { status: 500 });
  }
}
