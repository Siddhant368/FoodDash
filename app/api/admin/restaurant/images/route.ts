import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/restaurants");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "RESTAURANT_ADMIN" || !user.restaurantId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const type = formData.get("type") as string; // 'logo' or 'cover'
    const file = formData.get("file") as File | null;

    if (!type || !["logo", "cover"].includes(type)) {
      return NextResponse.json({ message: "Invalid image type" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "File exceeds 5MB limit" }, { status: 400 });
    }

    // Validate type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type. Only JPG, PNG, and WEBP are allowed." }, { status: 400 });
    }

    await connectDB();
    const restaurant = await Restaurant.findOne({
      _id: user.restaurantId,
      isActive: true,
    });

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    await ensureUploadDir();

    // Read array buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const filename = `${type}-${uniqueId}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Write file
    await fs.writeFile(filePath, buffer);
    const publicPath = `/uploads/restaurants/${filename}`;

    // Delete old file if exists
    const oldPath = type === "logo" ? restaurant.logo : restaurant.coverImage;
    if (oldPath && oldPath.startsWith("/uploads/restaurants/")) {
      try {
        const oldFileLocalPath = path.join(process.cwd(), "public", oldPath);
        await fs.unlink(oldFileLocalPath);
      } catch (err) {
        // Ignore if file doesn't exist
      }
    }

    // Update MongoDB
    if (type === "logo") {
      restaurant.logo = publicPath;
    } else {
      restaurant.coverImage = publicPath;
    }
    
    await restaurant.save();

    return NextResponse.json({ 
      message: `${type === "logo" ? "Logo" : "Cover image"} updated successfully`,
      path: publicPath 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "RESTAURANT_ADMIN" || !user.restaurantId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'logo' or 'cover'

    if (!type || !["logo", "cover"].includes(type)) {
      return NextResponse.json({ message: "Invalid image type" }, { status: 400 });
    }

    await connectDB();
    const restaurant = await Restaurant.findOne({
      _id: user.restaurantId,
      isActive: true,
    });

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // Get existing path
    const oldPath = type === "logo" ? restaurant.logo : restaurant.coverImage;
    
    // Delete file if local
    if (oldPath && oldPath.startsWith("/uploads/restaurants/")) {
      try {
        const oldFileLocalPath = path.join(process.cwd(), "public", oldPath);
        await fs.unlink(oldFileLocalPath);
      } catch (err) {
        // Ignore if file doesn't exist
      }
    }

    // Update DB
    if (type === "logo") {
      restaurant.logo = "";
    } else {
      restaurant.coverImage = "";
    }
    
    await restaurant.save();

    return NextResponse.json({ message: `${type === "logo" ? "Logo" : "Cover image"} removed successfully` });

  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json({ message: "Failed to remove image" }, { status: 500 });
  }
}
