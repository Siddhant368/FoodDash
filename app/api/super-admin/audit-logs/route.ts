import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const query: any = {};
    const moduleFilter = searchParams.get("module");
    if (moduleFilter) {
      query.module = moduleFilter;
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "adminId", model: User, select: "name email" })
      .lean();

    const total = await AuditLog.countDocuments(query);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
