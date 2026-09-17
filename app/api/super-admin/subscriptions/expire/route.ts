import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

import Subscription from "@/models/Subscription";


export async function POST() {
  try {
    await requireRole([
      "SUPER_ADMIN",
    ]);

    await connectDB();

    const now = new Date();

    const result =
      await Subscription.updateMany(
        {
          status: "ACTIVE",
          endDate: {
            $lte: now,
          },
        },
        {
          $set: {
            status: "EXPIRED",
            autoRenew: false,
          },
        }
      );

    return NextResponse.json({
      success: true,

      message:
        "Expired subscriptions processed successfully",

      data: {
        expiredCount:
          result.modifiedCount,
        checkedAt: now,
      },
    });
  } catch (error) {
    console.error(
      "Expire Subscriptions Error:",
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
          "Failed to process expired subscriptions",
      },
      { status: 500 }
    );
  }
}