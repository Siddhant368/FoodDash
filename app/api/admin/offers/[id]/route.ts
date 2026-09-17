import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { authErrorResponse } from "@/lib/auth/errors";
import Offer from "@/models/Offer";
import { requireRestaurantAccess } from "@/lib/auth/restaurant-access";
import { accessErrorResponse } from "@/lib/auth/access-response";

const updateOfferSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(100).optional(),
  code: z.string().trim().toUpperCase().min(3).max(20).optional(),
  description: z.string().trim().min(5).optional(),
  discountType: z.enum(["PERCENTAGE", "FLAT", "FREE_DELIVERY"]).optional(),
  discountValue: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional().nullable(),
  minOrderAmount: z.number().min(0).optional(),
  applicableTo: z.enum(["ALL", "CATEGORY", "MENU_ITEM"]).optional(),
  categoryIds: z.array(z.string()).optional(),
  menuItemIds: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  usageLimit: z.number().min(1).optional().nullable(),
  perCustomerLimit: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const { user } = await requireRestaurantAccess();

    const offer = await Offer.findOne({
      _id: id,
      restaurantId: user.restaurantId
    }).lean();

    if (!offer) {
      return NextResponse.json({ success: false, message: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("GET ADMIN OFFER BY ID ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch offer" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const { user } = await requireRestaurantAccess();
    const body = await request.json();

    const result = updateOfferSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, message: "Validation failed", errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    if (result.data.code) {
      const existingCode = await Offer.exists({
        restaurantId: user.restaurantId,
        code: result.data.code,
        _id: { $ne: id }
      });
      if (existingCode) {
        return NextResponse.json({ success: false, message: "Coupon code already exists for this restaurant" }, { status: 409 });
      }
    }

    const updatedOffer = await Offer.findOneAndUpdate(
      { _id: id, restaurantId: user.restaurantId },
      { $set: result.data },
      { new: true, runValidators: true }
    );

    if (!updatedOffer) {
      return NextResponse.json({ success: false, message: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Offer updated successfully", data: updatedOffer });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("PATCH ADMIN OFFER ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const { user } = await requireRestaurantAccess();

    const deletedOffer = await Offer.findOneAndDelete({
      _id: id,
      restaurantId: user.restaurantId
    });

    if (!deletedOffer) {
      return NextResponse.json({ success: false, message: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Offer deleted successfully" });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("DELETE ADMIN OFFER ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to delete offer" }, { status: 500 });
  }
}
