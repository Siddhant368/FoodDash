import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import Subscription from "@/models/Subscription";
import Plan from "@/models/Plan";
import Restaurant from "@/models/Restaurant";

const createSubSchema = z.object({
  restaurantId: z.string().min(1),
  planId: z.string().min(1),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start date" }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end date" }),
  autoRenew: z.boolean(),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]),
});

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const planId = searchParams.get("planId");
    const restaurantId = searchParams.get("restaurantId");
    const autoRenew = searchParams.get("autoRenew");
    const search = searchParams.get("search")?.trim();
    
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (status && status !== "All") filter.status = status;
    if (planId && planId !== "All") filter.planId = planId;
    if (restaurantId && restaurantId !== "All") filter.restaurantId = restaurantId;
    if (autoRenew && autoRenew !== "All") filter.autoRenew = autoRenew === "Enabled";

    // Subscriptions lookup logic
    const pipeline: any[] = [];
    
    pipeline.push({
      $lookup: {
        from: "restaurants",
        localField: "restaurantId",
        foreignField: "_id",
        as: "restaurant"
      }
    });
    
    pipeline.push({
      $lookup: {
        from: "plans",
        localField: "planId",
        foreignField: "_id",
        as: "plan"
      }
    });

    pipeline.push({ $unwind: { path: "$restaurant", preserveNullAndEmptyArrays: true } });
    pipeline.push({ $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } });

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "restaurant.name": { $regex: search, $options: "i" } },
            { "plan.name": { $regex: search, $options: "i" } }
          ]
        }
      });
    }

    pipeline.push({ $match: filter });
    
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Subscription.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const subscriptions = await Subscription.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Super Admin access required" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const body = await request.json();
    const parsed = createSubSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid data", errors: parsed.error.flatten() }, { status: 400 });

    const data = parsed.data;

    // Check Restaurant
    const restaurant = await Restaurant.findById(data.restaurantId);
    if (!restaurant || !restaurant.isActive) {
      return NextResponse.json({ success: false, message: "Invalid or inactive restaurant" }, { status: 400 });
    }

    // Check Plan
    const plan = await Plan.findById(data.planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ success: false, message: "Invalid or inactive plan" }, { status: 400 });
    }

    // Validate Dates
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      return NextResponse.json({ success: false, message: "End Date must be after Start Date" }, { status: 400 });
    }

    // Prevent duplicate active subscription
    if (data.status === "ACTIVE") {
      const existingActive = await Subscription.findOne({
        restaurantId: data.restaurantId,
        status: "ACTIVE",
        endDate: { $gt: new Date() }
      });
      if (existingActive) {
        return NextResponse.json({ success: false, message: "This restaurant already has an active subscription" }, { status: 409 });
      }
    }

    const sub = await Subscription.create({
      restaurantId: data.restaurantId,
      planId: data.planId,
      status: data.status,
      startDate: start,
      endDate: end,
      autoRenew: data.autoRenew,
      priceAtPurchase: plan.price,
      billingCycle: plan.billingCycle,
    });

    return NextResponse.json({ success: true, message: "Subscription created successfully", data: { subscription: sub } }, { status: 201 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Super Admin access required" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to create subscription" }, { status: 500 });
  }
}
