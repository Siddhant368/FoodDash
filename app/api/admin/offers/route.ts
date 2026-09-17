import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { authErrorResponse } from "@/lib/auth/errors";
import Offer from "@/models/Offer";
import { requireRestaurantAccess } from "@/lib/auth/restaurant-access";
import { accessErrorResponse } from "@/lib/auth/access-response";

const createOfferSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(100),
  code: z.string().trim().toUpperCase().min(3).max(20),
  description: z.string().trim().min(5),
  discountType: z.enum(["PERCENTAGE", "FLAT", "FREE_DELIVERY"]),
  discountValue: z.number().min(0),
  maxDiscount: z.number().min(0).optional(),
  minOrderAmount: z.number().min(0).default(0),
  applicableTo: z.enum(["ALL", "CATEGORY", "MENU_ITEM"]),
  categoryIds: z.array(z.string()).optional(),
  menuItemIds: z.array(z.string()).optional(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  usageLimit: z.number().min(1).optional(),
  perCustomerLimit: z.number().min(1).optional().default(1),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    await connectDB();
    const { user } = await requireRestaurantAccess();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const active = searchParams.get("active");

    const filter: Record<string, any> = {
      restaurantId: user.restaurantId,
    };

    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { code: { $regex: search.trim(), $options: "i" } }
      ];
    }

    const offers = await Offer.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("GET ADMIN OFFERS ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { user } = await requireRestaurantAccess();
    const body = await request.json();

    const result = createOfferSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, message: "Validation failed", errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const existingCode = await Offer.exists({
      restaurantId: user.restaurantId,
      code: result.data.code
    });

    if (existingCode) {
      return NextResponse.json({ success: false, message: "Coupon code already exists for this restaurant" }, { status: 409 });
    }

    const offerData = await Offer.create({
      ...result.data,
      restaurantId: user.restaurantId as any
    });

    return NextResponse.json({ success: true, message: "Offer created successfully", data: offerData }, { status: 201 });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("POST ADMIN OFFERS ERROR:", error);
    if (typeof error === "object" && error !== null && "code" in error && (error as any).code === 11000) {
      return NextResponse.json({ success: false, message: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Failed to create offer" }, { status: 500 });
  }
}
