import { NextResponse } from "next/server";

export function authErrorResponse(error: unknown) {
  if (error instanceof Error) {
    switch (error.message) {
      case "UNAUTHORIZED":
        return NextResponse.json(
          {
            success: false,
            message: "Authentication required",
          },
          { status: 401 }
        );

      case "FORBIDDEN":
        return NextResponse.json(
          {
            success: false,
            message: "You do not have permission",
          },
          { status: 403 }
        );

      case "RESTAURANT_REQUIRED":
        return NextResponse.json(
          {
            success: false,
            message: "Restaurant access required",
          },
          { status: 403 }
        );
    }
  }

  return null;
}