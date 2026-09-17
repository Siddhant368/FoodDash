import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

import Restaurant from "@/models/Restaurant";
import Order from "@/models/Order";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import Plan from "@/models/Plan";
import DeliveryAssignment from "@/models/DeliveryAssignment";

const querySchema = z.object({
  restaurantId: z.string().optional(),
  period: z.enum(["today", "yesterday", "7d", "30d", "90d", "year", "custom"]).default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

function getDateRange(period: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  const start = new Date(now);
  const prevStart = new Date(now);
  const prevEnd = new Date(now);

  if (period === "today") {
    start.setHours(0, 0, 0, 0);
    prevStart.setDate(start.getDate() - 1);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setHours(0, 0, 0, 0);
  } else if (period === "yesterday") {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    prevStart.setDate(start.getDate() - 1);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setDate(start.getDate());
    prevEnd.setHours(0, 0, 0, 0);
  } else if (period === "7d") {
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    prevStart.setDate(start.getDate() - 7);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setDate(start.getDate());
    prevEnd.setHours(0, 0, 0, 0);
  } else if (period === "30d") {
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    prevStart.setDate(start.getDate() - 30);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setDate(start.getDate());
    prevEnd.setHours(0, 0, 0, 0);
  } else if (period === "90d") {
    start.setDate(start.getDate() - 90);
    start.setHours(0, 0, 0, 0);
    prevStart.setDate(start.getDate() - 90);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setDate(start.getDate());
    prevEnd.setHours(0, 0, 0, 0);
  } else if (period === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    prevStart.setFullYear(start.getFullYear() - 1, 0, 1);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setFullYear(now.getFullYear() - 1, now.getMonth(), now.getDate());
    prevEnd.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  } else if (period === "custom" && customStart && customEnd) {
    const cs = new Date(customStart);
    const ce = new Date(customEnd);
    return { start: cs, end: ce, prevStart: cs, prevEnd: ce }; // Prev period not easily comparable for custom
  }

  return { start, end: period === "yesterday" ? now : new Date(), prevStart, prevEnd };
}

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const parsedQuery = querySchema.safeParse({
      restaurantId: searchParams.get("restaurantId") || undefined,
      period: searchParams.get("period") || "30d",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
    }

    const { restaurantId, period, startDate, endDate } = parsedQuery.data;

    let restaurantObjectId: mongoose.Types.ObjectId | undefined;
    if (restaurantId) {
      restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);
    }

    const { start, end, prevStart, prevEnd } = getDateRange(period, startDate, endDate);

    const baseMatch: any = { createdAt: { $gte: start, $lte: end } };
    const prevMatch: any = { createdAt: { $gte: prevStart, $lte: prevEnd } };
    
    if (restaurantObjectId) {
      baseMatch.restaurantId = restaurantObjectId;
      prevMatch.restaurantId = restaurantObjectId;
    }

    const [
      ordersCurrent, ordersPrev,
      orderStatuses, paymentStats,
      restaurantStats, prevRestaurantStats,
      customerStats, prevCustomerStats,
      topItems, topRestaurants, dailyRevenue,
      subStats, planDist, deliveryStats
    ] = await Promise.all([
      // 1. Orders Current
      Order.aggregate([
        { $match: baseMatch },
        { $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
            revenue: { $sum: { $cond: [{ $ne: ["$status", "CANCELLED"] }, "$totalAmount", 0] } }
        }}
      ]),
      // 2. Orders Previous
      Order.aggregate([
        { $match: prevMatch },
        { $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $ne: ["$status", "CANCELLED"] }, "$totalAmount", 0] } }
        }}
      ]),
      // 3. Order Statuses
      Order.aggregate([
        { $match: baseMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      // 4. Payment Stats
      Order.aggregate([
        { $match: baseMatch },
        { $group: {
            _id: null,
            cod: { $sum: { $cond: [{ $eq: ["$paymentMethod", "COD"] }, 1, 0] } },
            online: { $sum: { $cond: [{ $eq: ["$paymentMethod", "ONLINE"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$paymentStatus", "PENDING"] }, 1, 0] } },
            paid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "PAID"] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ["$paymentStatus", "FAILED"] }, 1, 0] } },
            refunded: { $sum: { $cond: [{ $eq: ["$paymentStatus", "REFUNDED"] }, 1, 0] } },
        }}
      ]),
      // 5. Restaurant Stats Current
      Restaurant.aggregate([
        { $match: { createdAt: { $lte: end } } },
        { $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ["$isActive", 1, 0] } },
            inactive: { $sum: { $cond: [{ $not: "$isActive" }, 1, 0] } },
            open: { $sum: { $cond: ["$isOpen", 1, 0] } },
            closed: { $sum: { $cond: [{ $not: "$isOpen" }, 1, 0] } }
        }}
      ]),
      // 6. Restaurant Stats Prev
      Restaurant.aggregate([
        { $match: { createdAt: { $lte: prevEnd } } },
        { $group: { _id: null, total: { $sum: 1 } } }
      ]),
      // 7. Customer Stats Current
      User.aggregate([
        { $match: { role: "CUSTOMER", createdAt: { $lte: end } } },
        { $group: {
            _id: null,
            total: { $sum: 1 },
            new: { $sum: { $cond: [{ $gte: ["$createdAt", start] }, 1, 0] } }
        }}
      ]),
      // 8. Customer Stats Prev
      User.aggregate([
        { $match: { role: "CUSTOMER", createdAt: { $lte: prevEnd } } },
        { $group: { _id: null, total: { $sum: 1 } } }
      ]),
      // 9. Top Items
      Order.aggregate([
        { $match: { ...baseMatch, status: { $ne: "CANCELLED" } } },
        { $unwind: "$items" },
        { $group: {
            _id: "$items.menuItemId",
            name: { $first: "$items.name" },
            restaurantId: { $first: "$restaurantId" },
            quantitySold: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.subtotal" }
        }},
        { $sort: { quantitySold: -1 } },
        { $limit: 10 },
        { $lookup: { from: "restaurants", localField: "restaurantId", foreignField: "_id", as: "restaurant" } },
        { $unwind: { path: "$restaurant", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, name: 1, quantitySold: 1, revenue: 1, restaurantName: "$restaurant.name" } }
      ]),
      // 10. Top Restaurants
      Order.aggregate([
        { $match: { ...baseMatch, status: { $ne: "CANCELLED" } } },
        { $group: { _id: "$restaurantId", totalOrders: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        { $lookup: { from: "restaurants", localField: "_id", foreignField: "_id", as: "restaurant" } },
        { $unwind: { path: "$restaurant", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, name: "$restaurant.name", totalOrders: 1, revenue: 1 } }
      ]),
      // 11. Daily Revenue
      Order.aggregate([
        { $match: { ...baseMatch, status: { $ne: "CANCELLED" } } },
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 }
        }},
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } }
      ]),
      // 12. Subscription Stats
      Subscription.aggregate([
        { $match: { createdAt: { $lte: end } } },
        { $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } },
            expired: { $sum: { $cond: [{ $eq: ["$status", "EXPIRED"] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } }
        }}
      ]),
      // 13. Plan Distribution
      Subscription.aggregate([
        { $match: { status: "ACTIVE" } },
        { $group: { _id: "$planId", subscribers: { $sum: 1 } } },
        { $lookup: { from: "plans", localField: "_id", foreignField: "_id", as: "plan" } },
        { $unwind: "$plan" },
        { $project: { _id: 0, name: "$plan.name", subscribers: 1 } }
      ]),
      // 14. Delivery Stats
      DeliveryAssignment.aggregate([
        { $match: baseMatch },
        { $group: {
            _id: null,
            total: { $sum: 1 },
            assigned: { $sum: { $cond: [{ $eq: ["$status", "ASSIGNED"] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] } },
            pickedUp: { $sum: { $cond: [{ $eq: ["$status", "PICKED_UP"] }, 1, 0] } },
            outForDelivery: { $sum: { $cond: [{ $eq: ["$status", "OUT_FOR_DELIVERY"] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
            avgAcceptanceTime: { 
              $avg: { 
                $cond: [
                  { $and: ["$assignedAt", "$acceptedAt"] }, 
                  { $divide: [{ $subtract: ["$acceptedAt", "$assignedAt"] }, 60000] }, 
                  null
                ]
              }
            },
            avgPickupTime: { 
              $avg: { 
                $cond: [
                  { $and: ["$acceptedAt", "$pickedUpAt"] }, 
                  { $divide: [{ $subtract: ["$pickedUpAt", "$acceptedAt"] }, 60000] }, 
                  null
                ]
              }
            },
            avgDeliveryTime: { 
              $avg: { 
                $cond: [
                  { $and: ["$pickedUpAt", "$deliveredAt"] }, 
                  { $divide: [{ $subtract: ["$deliveredAt", "$pickedUpAt"] }, 60000] }, 
                  null
                ]
              }
            }
        }}
      ])
    ]);

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return null;
      return ((curr - prev) / prev) * 100;
    };

    const oc = ordersCurrent[0] || { totalOrders: 0, revenue: 0, cancelledOrders: 0 };
    const op = ordersPrev[0] || { totalOrders: 0, revenue: 0 };
    const rc = restaurantStats[0] || { total: 0, active: 0, inactive: 0, open: 0, closed: 0 };
    const rp = prevRestaurantStats[0] || { total: 0 };
    const cc = customerStats[0] || { total: 0, new: 0 };
    const cp = prevCustomerStats[0] || { total: 0 };

    const statusMap: any = {};
    orderStatuses.forEach(s => { statusMap[s._id] = s.count; });
    
    let totalSubs = 0;
    planDist.forEach(p => { totalSubs += p.subscribers; });
    const formattedPlanDist = planDist.map(p => ({
      ...p,
      percentage: totalSubs > 0 ? (p.subscribers / totalSubs) * 100 : 0
    }));

    const ds = deliveryStats[0] || {};

    return NextResponse.json({
      success: true,
      data: {
        period,
        dateRange: { start, end },
        summary: {
          totalOrders: { current: oc.totalOrders, previous: op.totalOrders, growth: calcGrowth(oc.totalOrders, op.totalOrders) },
          totalRevenue: { current: oc.revenue, previous: op.revenue, growth: calcGrowth(oc.revenue, op.revenue) },
          totalRestaurants: { current: rc.total, previous: rp.total, growth: calcGrowth(rc.total, rp.total) },
          totalCustomers: { current: cc.total, previous: cp.total, growth: calcGrowth(cc.total, cp.total) },
          averageOrderValue: oc.totalOrders > 0 ? oc.revenue / (oc.totalOrders - oc.cancelledOrders) : 0,
          cancelledOrders: oc.cancelledOrders,
          cancellationRate: oc.totalOrders > 0 ? (oc.cancelledOrders / oc.totalOrders) * 100 : 0,
        },
        orderStatus: statusMap,
        paymentMethod: { COD: paymentStats[0]?.cod || 0, ONLINE: paymentStats[0]?.online || 0 },
        paymentStatus: {
          PENDING: paymentStats[0]?.pending || 0,
          PAID: paymentStats[0]?.paid || 0,
          FAILED: paymentStats[0]?.failed || 0,
          REFUNDED: paymentStats[0]?.refunded || 0,
        },
        restaurantStats: rc,
        customerStats: cc,
        subscriptionStats: subStats[0] || { total: 0, active: 0, expired: 0, cancelled: 0 },
        planDistribution: formattedPlanDist,
        deliveryStats: {
          ...ds,
          avgAcceptanceTime: ds.avgAcceptanceTime ? Math.round(ds.avgAcceptanceTime) : null,
          avgPickupTime: ds.avgPickupTime ? Math.round(ds.avgPickupTime) : null,
          avgDeliveryTime: ds.avgDeliveryTime ? Math.round(ds.avgDeliveryTime) : null,
        },
        dailyRevenue,
        restaurantPerformance: topRestaurants,
        topSellingItems: topItems,
      }
    });

  } catch (error: any) {
    console.error("Analytics Error:", error);
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to load analytics" }, { status: 500 });
  }
}