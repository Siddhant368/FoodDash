import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import PlatformSettings from "@/models/PlatformSettings";

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    let settings = await PlatformSettings.findOne().lean();

    if (!settings) {
      const defaultSettings = await PlatformSettings.create({});
      settings = defaultSettings.toObject();
    }

    // Mask SMTP password
    if (settings.email && settings.email.smtpPassword) {
      settings.email.smtpPassword = "••••••••••";
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ error: "Section and data are required" }, { status: 400 });
    }

    // Do not update the smtpPassword if it's the masked value
    if (section === "email" && data.smtpPassword === "••••••••••") {
      delete data.smtpPassword;
    }

    let settings = await PlatformSettings.findOne();

    if (!settings) {
      settings = new PlatformSettings();
    }

    // Validate the section exists on the model
    if (!(section in settings)) {
       return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    Object.assign((settings as any)[section], data);

    await settings.save();

    // Log the action
    const AuditLog = (await import("@/models/AuditLog")).default;
    await AuditLog.create({
      adminId: admin.id,
      action: "UPDATE_SETTINGS",
      module: "Settings",
      description: `Updated ${section} settings`,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
