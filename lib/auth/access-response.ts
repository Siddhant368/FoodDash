import { NextResponse } from "next/server";


// =====================================================
// ACCESS ERROR RESPONSE
// =====================================================

export function accessErrorResponse(
  error: unknown
) {
  if (!(error instanceof Error)) {
    return null;
  }

  switch (error.message) {
    case "UNAUTHORIZED":
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );

    case "FORBIDDEN":
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 403 }
      );

    case "RESTAURANT_REQUIRED":
      return NextResponse.json(
        {
          success: false,
          message:
            "Restaurant access required",
        },
        { status: 403 }
      );

    case "RESTAURANT_INACTIVE":
      return NextResponse.json(
        {
          success: false,
          message:
            "Restaurant is inactive",
        },
        { status: 403 }
      );

    case "SUBSCRIPTION_REQUIRED":
      return NextResponse.json(
        {
          success: false,
          message:
            "Active subscription required",
        },
        { status: 403 }
      );

    default:
      return null;
  }
}