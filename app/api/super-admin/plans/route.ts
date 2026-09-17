import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";

const createPlanSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug can contain only lowercase letters, numbers and hyphens"),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  features: z.array(z.string().min(1)).default([]),
  maxStaff: z.number().int().min(0).default(5),
  maxDeliveryPartners: z.number().int().min(0).default(2),
  maxMenuItems: z.number().int().min(0).default(50),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const activeParam = searchParams.get("isActive");
    const popularParam = searchParams.get("isPopular");
    const search = searchParams.get("search")?.trim();
    const billingCycle = searchParams.get("billingCycle");
    
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (activeParam === "true" || activeParam === "false") {
      filter.isActive = activeParam === "true";
    }
    if (popularParam === "true" || popularParam === "false") {
      filter.isPopular = popularParam === "true";
    }
    if (billingCycle === "MONTHLY" || billingCycle === "YEARLY") {
      filter.billingCycle = billingCycle;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    // Aggregation to include subscriber counts
    const plansPipeline = [
      { $match: filter },
      { $sort: { sortOrder: 1, price: 1, createdAt: -1 } as Record<string, 1 | -1> },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "subscriptions",
          let: { planId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$planId", "$$planId"] }, status: "ACTIVE" } }
          ],
          as: "activeSubscriptions"
        }
      },
      {
        $addFields: {
          subscriberCount: { $size: "$activeSubscriptions" }
        }
      },
      {
        $project: {
          activeSubscriptions: 0 // omit detailed sub records
        }
      }
    ];

    const [plans, total] = await Promise.all([
      Plan.aggregate(plansPipeline),
      Plan.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        plans,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get Plans Error:", error);
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Super Admin access required" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const body = await request.json();
    const parsed = createPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid plan data", errors: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const existingPlan = await Plan.findOne({ slug: data.slug }).select("_id").lean();
    if (existingPlan) {
      return NextResponse.json({ success: false, message: "Plan with this slug already exists" }, { status: 409 });
    }

    // If this plan is popular, unmark others
    if (data.isPopular) {
      await Plan.updateMany({}, { $set: { isPopular: false } });
    }

    const plan = await Plan.create(data);

    return NextResponse.json({ success: true, message: "Plan created successfully", data: { plan } }, { status: 201 });
  } catch (error: any) {
    console.error("Create Plan Error:", error);
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Super Admin access required" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to create plan" }, { status: 500 });
  }
}