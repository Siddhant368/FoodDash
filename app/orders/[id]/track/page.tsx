import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import User from "@/models/User";
import OrderTrackerClient from "./OrderTrackerClient";

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return notFound();
  }

  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    return <div className="p-8">Unauthorized</div>;
  }

  await connectDB();
  
  const order = await Order.findOne({ _id: id, customerId: user.id }).lean();
  if (!order) {
    return notFound();
  }
  
  const restaurant = await Restaurant.findById(order.restaurantId).select("name").lean();
  
  const assignment = await DeliveryAssignment.findOne({ orderId: order._id }).lean();
  
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

  const initialData = {
    orderId: order._id.toString(),
    orderStatus: order.status,
    restaurantName: restaurant?.name || "Restaurant",
    createdAt: order.createdAt.toISOString(),
    itemCount: order.items.reduce((acc: number, item: any) => acc + item.quantity, 0),
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    deliveryAddress: order.deliveryAddress,
    deliveryStatus: assignment?.status || null,
    deliveryPartner,
  };

  return <OrderTrackerClient initialData={initialData} orderId={id} />;
}
