import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRestaurantRole } from "@/lib/auth/guards";

import Order from "@/models/Order";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import User from "@/models/User";
import { getSubscriptionUsage } from "@/lib/subscription/limits";

type Period = "today" | "7days" | "30days";

function getStartDate(period: Period): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  
  const now = new Date();
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parseInt(parts.find(p => p.type === type)!.value);
  
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  
  // 00:00:00 IST is previous day 18:30:00 UTC
  const targetDate = new Date(Date.UTC(year, month - 1, day, -5, -30, 0, 0));

  if (period === "7days") {
    targetDate.setUTCDate(targetDate.getUTCDate() - 7);
  } else if (period === "30days") {
    targetDate.setUTCDate(targetDate.getUTCDate() - 30);
  }

  return targetDate;
}

export async function GET(request: Request) {
  try {
    const user = await requireRestaurantRole([
      "RESTAURANT_ADMIN",
      "STAFF",
    ]);

    if (!user.restaurantId) {
      return NextResponse.json(
        { success: false, message: "Restaurant access required" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(user.restaurantId)) {
      return NextResponse.json(
        { success: false, message: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedPeriod = searchParams.get("period") || "today";
    const period: Period =
      requestedPeriod === "7days" || requestedPeriod === "30days"
        ? requestedPeriod
        : "today";

    const startDate = getStartDate(period);

    await connectDB();

    const restaurantId = new mongoose.Types.ObjectId(user.restaurantId);
    
    // Fetch customer specific dates
    const todayStart = getStartDate("today");
    const weekStart = getStartDate("7days");

    const [
      restaurant,
      orderCounts,
      revenue,
      recentOrders,
      topSellingItems,
      menuStatistics,
      categoryStatistics,
      deliveryCounts,
      activePartners,
      periodCustomers,
      totalCustomersAllTime,
      todayCustomers,
      weekCustomers,
      subscription
    ] = await Promise.all([
      Restaurant.findById(restaurantId).lean(),
      
      Order.aggregate([
        { $match: { restaurantId, createdAt: { $gte: startDate } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Order.aggregate([
        {
          $match: {
            restaurantId,
            createdAt: { $gte: startDate },
            paymentStatus: "PAID",
            status: { $ne: "CANCELLED" },
          },
        },
        { $group: { _id: null, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      ]),

      Order.find({ restaurantId })
        .select("_id customerId items totalAmount status paymentMethod paymentStatus deliveryAddress createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customerId', 'name')
        .lean(),

      Order.aggregate([
        {
          $match: {
            restaurantId,
            createdAt: { $gte: startDate },
            status: { $nin: ["CANCELLED"] },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.menuItemId",
            name: { $first: "$items.name" },
            quantity: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.subtotal" },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 10 },
      ]),

      MenuItem.aggregate([
        { $match: { restaurantId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: { $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] } },
            unavailable: { $sum: { $cond: [{ $eq: ["$isAvailable", false] }, 1, 0] } },
            featured: { $sum: { $cond: [{ $eq: ["$isFeatured", true] }, 1, 0] } },
          },
        },
      ]),

      Category.aggregate([
        { $match: { restaurantId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
            inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } },
          },
        },
      ]),
      
      DeliveryAssignment.aggregate([
        { $match: { restaurantId, createdAt: { $gte: startDate } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      
      User.find({
        restaurantId,
        role: "DELIVERY_PARTNER",
        isActive: true,
      }).select("name isActive").lean(),
      
      Order.distinct("customerId", { restaurantId, createdAt: { $gte: startDate }, status: { $ne: "CANCELLED" } }),
      Order.distinct("customerId", { restaurantId, status: { $ne: "CANCELLED" } }),
      Order.distinct("customerId", { restaurantId, createdAt: { $gte: todayStart }, status: { $ne: "CANCELLED" } }),
      Order.distinct("customerId", { restaurantId, createdAt: { $gte: weekStart }, status: { $ne: "CANCELLED" } }),
      
      getSubscriptionUsage(user.restaurantId.toString())
    ]);

    const statusCounts: Record<string, number> = {};
    for (const item of orderCounts) {
      statusCounts[item._id] = item.count;
    }
    const totalOrders = Object.values(statusCounts).reduce((total, count) => total + count, 0);

    const deliveryStatusCounts: Record<string, number> = {};
    for (const item of deliveryCounts) {
      deliveryStatusCounts[item._id] = item.count;
    }

    const revenueData = revenue[0] || { revenue: 0, orders: 0 };
    const menuData = menuStatistics[0] || { total: 0, available: 0, unavailable: 0, featured: 0 };
    const categoryData = categoryStatistics[0] || { total: 0, active: 0, inactive: 0 };

    return NextResponse.json({
      success: true,
      period,
      restaurant,
      statistics: {
        orders: {
          total: totalOrders,
          pending: statusCounts.PENDING || 0,
          confirmed: statusCounts.CONFIRMED || 0,
          preparing: statusCounts.PREPARING || 0,
          ready: statusCounts.READY || 0,
          outForDelivery: statusCounts.OUT_FOR_DELIVERY || 0,
          delivered: statusCounts.DELIVERED || 0,
          cancelled: statusCounts.CANCELLED || 0,
        },
        revenue: {
          amount: revenueData.revenue || 0,
          orderCount: revenueData.orders || 0,
          currency: "INR",
        },
        menu: {
          total: menuData.total,
          available: menuData.available,
          unavailable: menuData.unavailable,
          featured: menuData.featured,
        },
        categories: {
          total: categoryData.total,
          active: categoryData.active,
          inactive: categoryData.inactive,
        },
        delivery: {
          assigned: deliveryStatusCounts.ASSIGNED || 0,
          accepted: deliveryStatusCounts.ACCEPTED || 0,
          pickedUp: deliveryStatusCounts.PICKED_UP || 0,
          outForDelivery: deliveryStatusCounts.OUT_FOR_DELIVERY || 0,
          delivered: deliveryStatusCounts.DELIVERED || 0,
        },
        customers: {
          periodNew: periodCustomers.length,
          total: totalCustomersAllTime.length,
          newToday: todayCustomers.length,
          newThisWeek: weekCustomers.length
        }
      },
      activePartners,
      topSellingItems,
      recentOrders,
      subscription
    });
  } catch (error: unknown) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Only restaurant admins and staff can access this resource" },
        { status: 403 }
      );
    }
    if (error instanceof Error && error.message === "RESTAURANT_REQUIRED") {
      return NextResponse.json({ success: false, message: "Restaurant access required" }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}