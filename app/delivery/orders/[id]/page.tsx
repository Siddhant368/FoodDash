"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DeliveryOrder, DeliveryStatus } from "../../types";
import { ArrowLeft, MapPin, Phone, Package, RefreshCw, Store, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/delivery/orders/${id}`);
      const data = await res.json();
      setOrder(data.data || data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function updateStatus(status: DeliveryStatus) {
    try {
      setUpdating(true);
      const res = await fetch(`/api/delivery/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (status === "DELIVERED" || status === "CANCELLED") {
        router.push("/delivery/history");
      } else {
        await fetchOrder();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  if (loading || !order) return (
    <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-[#FFE13C]" /></div>
  );

  const getActionBtn = () => {
    switch (order.assignment.status) {
      case "ASSIGNED":
        return <button onClick={() => updateStatus("ACCEPTED")} disabled={updating} className="w-full py-4 rounded-xl bg-[#FFE13C] text-[#111111] font-black text-lg">Accept Order</button>;
      case "ACCEPTED":
        return <button onClick={() => updateStatus("PICKED_UP")} disabled={updating} className="w-full py-4 rounded-xl bg-[#FFE13C] text-[#111111] font-black text-lg">Mark as Picked Up</button>;
      case "PICKED_UP":
        return <button onClick={() => updateStatus("OUT_FOR_DELIVERY")} disabled={updating} className="w-full py-4 rounded-xl bg-[#FFE13C] text-[#111111] font-black text-lg">Start Delivery</button>;
      case "OUT_FOR_DELIVERY":
        return <button onClick={() => updateStatus("DELIVERED")} disabled={updating} className="w-full py-4 rounded-xl bg-green-500 text-white font-black text-lg">Mark as Delivered</button>;
      default:
        return null;
    }
  };

  return (
    <div className="pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/delivery/orders" className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20} /></Link>
        <div>
          <h2 className="font-black text-xl text-[#111111]">Order Details</h2>
          <p className="text-gray-500 font-bold text-sm">#ORD-{order.order.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Timeline */}
        <div className="bg-white p-5 rounded-3xl shadow-sm">
          <h3 className="font-bold mb-4">Status Timeline</h3>
          <div className="flex flex-col gap-4 text-sm font-medium">
             <div className="flex gap-3 items-center text-green-600"><CheckCircle size={16}/> Order Assigned</div>
             <div className={`flex gap-3 items-center ${["ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(order.assignment.status) ? "text-green-600" : "text-gray-400"}`}><CheckCircle size={16}/> Order Accepted</div>
             <div className={`flex gap-3 items-center ${["PICKED_UP", "OUT_FOR_DELIVERY"].includes(order.assignment.status) ? "text-green-600" : "text-gray-400"}`}><CheckCircle size={16}/> Food Picked Up</div>
             <div className={`flex gap-3 items-center ${["OUT_FOR_DELIVERY"].includes(order.assignment.status) ? "text-yellow-600" : "text-gray-400"}`}><CheckCircle size={16}/> Out for Delivery</div>
          </div>
        </div>

        {/* Restaurant */}
        <div className="bg-white p-5 rounded-3xl shadow-sm">
          <h3 className="font-bold text-gray-500 text-xs uppercase mb-2">Restaurant</h3>
          <div className="flex gap-3 items-center">
             <Store className="text-gray-400" />
             <div>
               <p className="font-bold text-[#111111]">FoodHub Restaurant</p>
               <a href="#" className="text-blue-600 text-xs font-bold">Open Maps</a>
             </div>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-white p-5 rounded-3xl shadow-sm">
          <h3 className="font-bold text-gray-500 text-xs uppercase mb-2">Customer</h3>
          <div className="flex justify-between items-center">
             <div>
               <p className="font-bold text-[#111111]">{order.order.deliveryAddress.name}</p>
               <p className="text-sm text-gray-500">{order.order.deliveryAddress.phone}</p>
             </div>
             <a href={`tel:${order.order.deliveryAddress.phone}`} className="bg-blue-50 text-blue-600 p-3 rounded-full"><Phone size={20}/></a>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
             <p className="font-bold text-sm mb-1">Delivery Address</p>
             <p className="text-sm text-gray-600">{order.order.deliveryAddress.addressLine1}, {order.order.deliveryAddress.city}</p>
             <a href="#" className="text-blue-600 text-xs font-bold mt-2 inline-block">Open Maps</a>
          </div>
        </div>

        {/* Bill */}
        <div className="bg-white p-5 rounded-3xl shadow-sm">
          <h3 className="font-bold mb-4">Order Summary</h3>
          {order.order.items.map(item => (
            <div key={item.name} className="flex justify-between text-sm mb-2">
              <span>{item.quantity}x {item.name}</span>
              <span>₹{item.subtotal}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-4 pt-4 text-sm font-bold flex justify-between">
            <span>Total</span>
            <span>₹{order.order.totalAmount}</span>
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-40 md:static md:mt-6 md:border-0 md:bg-transparent md:p-0">
        {getActionBtn()}
      </div>
    </div>
  );
}