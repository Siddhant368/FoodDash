"use server";

import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import User from "@/models/User";

export async function getOrderUpdate(orderId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return null;

  await connectDB();
  
  const order = await Order.findOne({ _id: orderId, customerId: user.id }).select("status").lean();
  if (!order) return null;

  const assignment = await DeliveryAssignment.findOne({ orderId }).select("status deliveryPartnerId").lean();
  
  let deliveryPartner = null;
  if (assignment?.deliveryPartnerId) {
    const driver = await User.findById(assignment.deliveryPartnerId).select("name phone").lean();
    if (driver) {
      deliveryPartner = {
        name: driver.name,
        phone: driver.phone
      };
    }
  }

  return {
    orderStatus: order.status,
    deliveryStatus: assignment?.status || null,
    deliveryPartner
  };
}
