import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";
import { checkSubscriptionLimit } from "@/lib/subscription/limits";
import { hashPassword } from "@/lib/auth/password";

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const filter: any = { role: "DELIVERY_PARTNER" };
    
    if (searchParams.get("restaurantId")) filter.restaurantId = searchParams.get("restaurantId");
    
    const [partners, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate({path: "restaurantId", model: Restaurant, select: "name"}).lean(),
      User.countDocuments(filter)
    ]);
    
    // Fetch stats for each partner
    const dataWithStats = await Promise.all(partners.map(async (p: any) => {
      const stats = await DeliveryAssignment.aggregate([
        { $match: { deliveryPartnerId: p._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);
      const statsMap = stats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
      return { ...p, stats: statsMap };
    }));
    
    return NextResponse.json({ success: true, data: dataWithStats, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }});
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    const body = await request.json();
    
    if (!body.restaurantId) return NextResponse.json({ success: false, message: "restaurantId required" }, { status: 400 });
    
    const canAddPartner = await checkSubscriptionLimit(body.restaurantId, "DELIVERY_PARTNER");
    if (!canAddPartner) return NextResponse.json({ success: false, message: "Subscription limit reached for delivery partners" }, { status: 403 });
    
    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 });
    
    const hashedPassword = await hashPassword(body.password);
    
    const partner = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      password: hashedPassword,
      role: "DELIVERY_PARTNER",
      restaurantId: body.restaurantId,
      isActive: body.isActive ?? true
    });
    
    return NextResponse.json({ success: true, data: partner });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
