import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import { requireRestaurantRole } from "@/lib/auth/guards";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth/password";

export async function GET() {
  try {
    const user = await requireRestaurantRole([
      "RESTAURANT_ADMIN",
      "STAFF",
    ]);

    await connectDB();

    const partners = await User.find({
      restaurantId: user.restaurantId,
      role: "DELIVERY_PARTNER",
    })
      .select("_id name email phone isActive")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      partners,
      total: partners.length,
    });
  } catch (error: unknown) {
    console.error("DELIVERY PARTNERS ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only restaurant admins and staff can access this resource",
        },
        { status: 403 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "RESTAURANT_REQUIRED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant access required",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch delivery partners",
      },
      { status: 500 }
    );
  }
}

const partnerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireRestaurantRole(["RESTAURANT_ADMIN", "STAFF"]);
    const body = await request.json();
    const result = partnerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = result.data;
    await connectDB();

    const existingUser = await User.exists({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const partnerData = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: "DELIVERY_PARTNER",
      restaurantId: admin.restaurantId as any,
      isActive: true,
    });

    const partner = partnerData as any;

    return NextResponse.json(
      {
        success: true,
        message: "Delivery partner created successfully",
        partner: {
          _id: partner._id,
          name: partner.name,
          email: partner.email,
          phone: partner.phone,
          isActive: partner.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("CREATE PARTNER ERROR:", error);
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN" || error.message === "RESTAURANT_REQUIRED")) {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, message: "Failed to create delivery partner" },
      { status: 500 }
    );
  }
}