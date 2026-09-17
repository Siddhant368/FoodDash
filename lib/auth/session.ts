import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";
import User from "@/models/User";

const AUTH_COOKIE = "auth_token";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);

    if (!payload?.userId) {
      return null;
    }

    await connectDB();

    const user = await User.findOne({
      _id: payload.userId,
      isActive: true,
    })
      .select("_id name email role restaurantId isActive")
      .lean();

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId
        ? user.restaurantId.toString()
        : null,
      isActive: user.isActive,
    };
  } catch {
    return null;
  }
}