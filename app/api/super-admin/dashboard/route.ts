import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Order from "@/models/Order";
import Subscription from "@/models/Subscription";
import Plan from "@/models/Plan";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30Days";

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    if (range === "Today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === "Yesterday") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      prevStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (range === "7Days") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      prevStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (range === "30Days") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      prevStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    } else if (range === "90Days") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
      prevStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 180);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    } else if (range === "Year") {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      prevStartDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
      prevEndDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    }

    const [
      restaurantStats,
      userStats,
      orderStats,
      prevOrderStats,
      revenueStats,
      prevRevenueStats,
      subscriptionStats,
      planStats,
      deliveryStats,
      menuStats,
      recentOrders,
      topRestaurants
    ] = await Promise.all([
      Restaurant.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
            inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } },
            open: { $sum: { $cond: [{ $and: [{ $eq: ["$isActive", true] }, { $eq: ["$isOpen", true] }] }, 1, 0] } },
            closed: { $sum: { $cond: [{ $and: [{ $eq: ["$isActive", true] }, { $eq: ["$isOpen", false] }] }, 1, 0] } },
            newPeriod: { $sum: { $cond: [{ $gte: ["$createdAt", startDate] }, 1, 0] } },
            newPrevPeriod: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", prevStartDate] }, { $lt: ["$createdAt", prevEndDate] }] }, 1, 0] } },
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            restaurantAdmins: { $sum: { $cond: [{ $eq: ["$role", "RESTAURANT_ADMIN"] }, 1, 0] } },
            staff: { $sum: { $cond: [{ $eq: ["$role", "STAFF"] }, 1, 0] } },
            deliveryPartners: { $sum: { $cond: [{ $eq: ["$role", "DELIVERY_PARTNER"] }, 1, 0] } },
            customers: { $sum: { $cond: [{ $eq: ["$role", "CUSTOMER"] }, 1, 0] } },
            superAdmins: { $sum: { $cond: [{ $eq: ["$role", "SUPER_ADMIN"] }, 1, 0] } },
            newPeriod: { $sum: { $cond: [{ $gte: ["$createdAt", startDate] }, 1, 0] } },
            newPrevPeriod: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", prevStartDate] }, { $lt: ["$createdAt", prevEndDate] }] }, 1, 0] } },
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lt: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
            confirmed: { $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] } },
            preparing: { $sum: { $cond: [{ $eq: ["$status", "PREPARING"] }, 1, 0] } },
            ready: { $sum: { $cond: [{ $eq: ["$status", "READY"] }, 1, 0] } },
            outForDelivery: { $sum: { $cond: [{ $eq: ["$status", "OUT_FOR_DELIVERY"] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: prevStartDate, $lt: prevEndDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $ne: "CANCELLED" },
            createdAt: { $gte: startDate, $lt: endDate }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            completedOrders: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $ne: "CANCELLED" },
            createdAt: { $gte: prevStartDate, $lt: prevEndDate }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
          }
        }
      ]),
      Subscription.aggregate([
        {
          $group: {
            _id: null,
            active: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } },
            expired: { $sum: { $cond: [{ $eq: ["$status", "EXPIRED"] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
            expiringSoon: { 
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ["$status", "ACTIVE"] }, 
                      { $lte: ["$endDate", new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)] }
                    ] 
                  }, 
                  1, 0
                ] 
              } 
            },
          }
        }
      ]),
      Plan.aggregate([
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "planId",
            pipeline: [{ $match: { status: "ACTIVE" } }],
            as: "activeSubscriptions"
          }
        },
        {
          $project: {
            name: 1,
            price: 1,
            billingCycle: 1,
            isActive: 1,
            subscribers: { $size: "$activeSubscriptions" }
          }
        },
        { $sort: { price: 1 } }
      ]),
      DeliveryAssignment.aggregate([
        {
          $group: {
            _id: null,
            assigned: { $sum: { $cond: [{ $eq: ["$status", "ASSIGNED"] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] } },
            pickedUp: { $sum: { $cond: [{ $eq: ["$status", "PICKED_UP"] }, 1, 0] } },
            outForDelivery: { $sum: { $cond: [{ $eq: ["$status", "OUT_FOR_DELIVERY"] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] } },
          }
        }
      ]),
      Promise.all([
        MenuItem.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              available: { $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] } },
              unavailable: { $sum: { $cond: [{ $eq: ["$isAvailable", false] }, 1, 0] } },
              featured: { $sum: { $cond: [{ $eq: ["$isFeatured", true] }, 1, 0] } },
            }
          }
        ]),
        Category.countDocuments()
      ]),
      Order.find({})
        .select("_id restaurantId customerId totalAmount status paymentMethod createdAt")
        .populate("restaurantId", "name")
        .populate("customerId", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Order.aggregate([
        { $match: { status: { $ne: "CANCELLED" } } },
        {
          $group: {
            _id: "$restaurantId",
            orders: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
            customers: { $addToSet: "$customerId" }
          }
        },
        {
          $lookup: {
            from: "restaurants",
            localField: "_id",
            foreignField: "_id",
            as: "restaurant"
          }
        },
        { $unwind: "$restaurant" },
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "restaurantId",
            pipeline: [{ $match: { status: "ACTIVE" } }],
            as: "subscription"
          }
        },
        {
          $project: {
            name: "$restaurant.name",
            orders: 1,
            revenue: 1,
            customers: { $size: "$customers" },
            subscriptionStatus: { $cond: [{ $gt: [{ $size: "$subscription" }, 0] }, "Active", "None"] },
            isActive: "$restaurant.isActive"
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ])
    ]);

    const rStats = restaurantStats[0] || { total: 0, active: 0, inactive: 0, open: 0, closed: 0, newPeriod: 0, newPrevPeriod: 0 };
    const uStats = userStats[0] || { total: 0, restaurantAdmins: 0, staff: 0, deliveryPartners: 0, customers: 0, superAdmins: 0, newPeriod: 0, newPrevPeriod: 0 };
    const oStats = orderStats[0] || { total: 0, pending: 0, confirmed: 0, preparing: 0, ready: 0, outForDelivery: 0, delivered: 0, cancelled: 0 };
    const pOStats = prevOrderStats[0] || { total: 0 };
    const revStats = revenueStats[0] || { revenue: 0, completedOrders: 0 };
    const pRevStats = prevRevenueStats[0] || { revenue: 0 };
    const subStats = subscriptionStats[0] || { active: 0, expired: 0, cancelled: 0, expiringSoon: 0 };
    const delStats = deliveryStats[0] || { assigned: 0, accepted: 0, pickedUp: 0, outForDelivery: 0, delivered: 0 };
    
    const miStats = menuStats[0][0] || { total: 0, available: 0, unavailable: 0, featured: 0 };
    const cCount = menuStats[1] || 0;

    const calcGrowth = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return ((current - prev) / prev) * 100;
    };

    const isSystemHealthy = mongoose.connection.readyState === 1;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          restaurants: {
            ...rStats,
            growth: calcGrowth(rStats.newPeriod, rStats.newPrevPeriod)
          },
          users: {
            ...uStats,
            growth: calcGrowth(uStats.newPeriod, uStats.newPrevPeriod)
          },
          orders: {
            ...oStats,
            growth: calcGrowth(oStats.total, pOStats.total)
          },
          revenue: {
            total: revStats.revenue,
            growth: calcGrowth(revStats.revenue, pRevStats.revenue),
            aov: revStats.completedOrders > 0 ? (revStats.revenue / revStats.completedOrders) : 0
          }
        },
        subscriptions: subStats,
        plans: planStats,
        delivery: delStats,
        menu: {
          ...miStats,
          categories: cCount
        },
        recentOrders,
        topRestaurants,
        systemHealth: {
          database: isSystemHealthy ? "Connected" : "Disconnected",
          authentication: "Operational",
          api: "Operational"
        }
      }
    });
  } catch (error: any) {
    console.error("Super Admin Dashboard Error:", error);
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Super Admin access required" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Failed to load Super Admin dashboard" }, { status: 500 });
  }
}