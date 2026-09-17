import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import OrderDetailsClient from "./OrderDetailsClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SetLocationButton } from "@/components/SetLocationButton";

function ErrorLayout({ title, message }: { title: string, message: string }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans pb-24">
      {/* Navbar exactly like Home */}
      <div className="bg-[#111111] text-[#FFFDF0]">
        <header className="px-4 py-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between relative z-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE13C] text-[#111111]">
              <span className="text-2xl font-black">F</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#FFE13C]">FOODDASH</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link href="/" className="hover:text-[#FFE13C] transition-colors">Home</Link>
            <Link href="/restaurants" className="hover:text-[#FFE13C] transition-colors">Restaurants</Link>
            <Link href="/orders" className="text-[#FFE13C]">Orders</Link>
          </nav>
          <div className="flex items-center gap-4">
             <SetLocationButton />
          </div>
        </header>
      </div>
      <main className="max-w-4xl mx-auto px-4 py-16 lg:px-8 text-center space-y-6">
        <h1 className="text-4xl font-black">{title}</h1>
        <p className="text-gray-500 font-medium">{message}</p>
        <Link href="/orders" className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
          <ChevronLeft size={18} /> Back to Orders
        </Link>
      </main>
    </div>
  );
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return <ErrorLayout title="Invalid Order ID" message="The order ID provided is invalid." />;
  }

  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    // Return safe denial for unauthorized access
    return <ErrorLayout title="Order not found" message="We couldn't find this order." />;
  }

  try {
    await connectDB();
    
    // Find order scoped to this customer
    const order = await Order.findOne({ _id: id, customerId: user.id }).lean();
    if (!order) {
      return <ErrorLayout title="Order not found" message="We couldn't find this order." />;
    }
    
    const restaurant = await Restaurant.findById(order.restaurantId).select("name").lean();
    
    // Need to parse stringified objectids if any
    const serializedOrder = JSON.parse(JSON.stringify(order));
    const serializedRestaurant = JSON.parse(JSON.stringify(restaurant));

    return <OrderDetailsClient order={serializedOrder} restaurant={serializedRestaurant} />;
  } catch (error) {
    console.error("Order Details Page Error:", error);
    return <ErrorLayout title="Something went wrong" message="Unable to load your order. Please try again." />;
  }
}