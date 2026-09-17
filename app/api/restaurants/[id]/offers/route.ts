import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Offer from "@/models/Offer";
import moment from "moment-timezone";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const now = moment().tz("Asia/Kolkata");

    // Only find active offers that are valid right now
    const filter: Record<string, any> = {
      restaurantId: id,
      isActive: true,
      startDate: { $lte: now.toDate() },
      endDate: { $gte: now.toDate() },
    };

    const offers = await Offer.find(filter)
      .select("title code description discountType discountValue maxDiscount minOrderAmount applicableTo startDate endDate startTime endTime usageLimit usedCount perCustomerLimit")
      .sort({ createdAt: -1 })
      .lean();

    // Filter out offers that have reached max usage or aren't in active time window
    const currentTime = now.format("HH:mm");
    const validOffers = offers.filter((offer) => {
      if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
        return false;
      }
      if (offer.startTime && offer.endTime) {
        if (currentTime < offer.startTime || currentTime > offer.endTime) {
          return false;
        }
      }
      return true;
    });

    return NextResponse.json({ success: true, data: validOffers });
  } catch (error) {
    console.error("GET CUSTOMER OFFERS ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch offers" }, { status: 500 });
  }
}
