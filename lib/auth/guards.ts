import { getCurrentUser } from "@/lib/auth/session";

export type AppRole =
  | "SUPER_ADMIN"
  | "RESTAURANT_ADMIN"
  | "STAFF"
  | "DELIVERY_PARTNER"
  | "CUSTOMER";

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireRole(
  allowedRoles: AppRole[]
) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role as AppRole)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function requireRestaurantUser() {
  const user = await requireAuth();

  if (!user.restaurantId) {
    throw new Error("RESTAURANT_REQUIRED");
  }

  return user;
}

export async function requireRestaurantRole(
  allowedRoles: AppRole[]
) {
  const user = await requireRestaurantUser();

  if (!allowedRoles.includes(user.role as AppRole)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}