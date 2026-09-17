import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
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
    const filter: any = { role: "STAFF" };
    
    if (searchParams.get("restaurantId")) filter.restaurantId = searchParams.get("restaurantId");
    
    const [staff, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate({path: "restaurantId", model: Restaurant, select: "name"}).lean(),
      User.countDocuments(filter)
    ]);
    
    return NextResponse.json({ success: true, data: staff, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }});
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
    
    const canAddStaff = await checkSubscriptionLimit(body.restaurantId, "STAFF");
    if (!canAddStaff) return NextResponse.json({ success: false, message: "Subscription limit reached for staff" }, { status: 403 });
    
    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 });
    
    const hashedPassword = await hashPassword(body.password);
    
    const staff = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      password: hashedPassword,
      role: "STAFF",
      restaurantId: body.restaurantId,
      isActive: body.isActive ?? true
    });
    
    return NextResponse.json({ success: true, data: staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
