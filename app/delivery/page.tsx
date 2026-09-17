"use client";

import { useEffect, useState, useMemo } from "react";
import { Wallet, ListOrdered, Truck, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { DeliveryOrder } from "./types";

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch("/api/delivery/orders");
      const data = await res.json();
      setOrders(data.data || data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const assignedOrders = useMemo(() => orders.filter(o => o.assignment.status === "ASSIGNED"), [orders]);
  const activeOrders = useMemo(() => orders.filter(o => ["ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.assignment.status)), [orders]);
  const completedOrders = useMemo(() => orders.filter(o => ["DELIVERED", "CANCELLED"].includes(o.assignment.status)), [orders]);
  
  const todayEarnings = useMemo(() => {
    return completedOrders
      .filter(o => o.assignment.status === "DELIVERED")
      .reduce((acc, order) => acc + (order.order.deliveryFee || 0), 0);
  }, [completedOrders]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <RefreshCw size={32} className="animate-spin text-[#FFE13C] mb-4" />
        <p className="text-gray-500 font-bold">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-[#111111]">Good Morning 👋</h2>
        <p className="text-gray-500">Here's your delivery overview for today.</p>
      </div>

      <div className="flex justify-between items-center bg-[#111111] text-white p-6 md:p-8 rounded-3xl shadow-sm">
        <div>
          <p className="text-gray-400 text-sm md:text-base font-medium mb-1">Today's Earnings</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#FFE13C]">₹{todayEarnings.toFixed(2)}</h2>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl">
          <Wallet className="text-[#FFE13C]" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-2xl font-black text-[#111111]">{assignedOrders.length}</h3>
          <p className="text-xs text-gray-500 font-bold mt-1">Assigned</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-2xl font-black text-[#111111]">{activeOrders.length}</h3>
          <p className="text-xs text-gray-500 font-bold mt-1">In Progress</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-2xl font-black text-[#111111]">{completedOrders.filter(o => o.assignment.status === "DELIVERED").length}</h3>
          <p className="text-xs text-gray-500 font-bold mt-1">Delivered</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-2xl font-black text-[#111111]">{completedOrders.filter(o => o.assignment.status === "CANCELLED").length}</h3>
          <p className="text-xs text-gray-500 font-bold mt-1">Cancelled</p>
        </div>
      </div>
      
      {assignedOrders.length > 0 && (
        <Link href="/delivery/orders?tab=assigned" className="block bg-[#FFE13C] p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-[#111111] text-white w-10 h-10 rounded-full flex items-center justify-center font-black">
                {assignedOrders.length}
              </div>
              <div>
                <h3 className="font-black text-[#111111]">🔔 New Delivery Assigned!</h3>
                <p className="text-sm font-medium text-yellow-900">Tap to view & accept</p>
              </div>
            </div>
            <ChevronRight className="text-[#111111]" />
          </div>
        </Link>
      )}
    </div>
  );
}