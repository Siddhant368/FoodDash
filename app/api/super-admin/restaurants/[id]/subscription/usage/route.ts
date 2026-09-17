import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

import Restaurant from "@/models/Restaurant";

import {
  getSubscriptionUsage,
} from "@/lib/subscription/limits";


export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireRole([
      "SUPER_ADMIN",
    ]);

    await connectDB();

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid restaurant ID",
        },
        { status: 400 }
      );
    }

    const restaurant =
      await Restaurant.findById(id)
        .select(
          "_id name slug isActive"
        )
        .lean();

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Restaurant not found",
        },
        { status: 404 }
      );
    }

    const usage =
      await getSubscriptionUsage(id);

    return NextResponse.json({
      success: true,

      data: {
        restaurant,
        usage,
      },
    });
  } catch (error) {
    console.error(
      "Get Subscription Usage Error:",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "UNAUTHORIZED"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        );
      }

      if (
        error.message ===
        "FORBIDDEN"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Super Admin access required",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch subscription usage",
      },
      { status: 500 }
    );
  }
}