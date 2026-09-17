"use client";

import { useEffect, useState } from "react";
import { DeliveryOrder } from "../types";
import { RefreshCw, CheckCircle } from "lucide-react";

export default function HistoryPage() {
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

  const completedOrders = orders.filter(o => ["DELIVERED", "CANCELLED"].includes(o.assignment.status));

  return (
    <div>
      <h2 className="font-black text-2xl text-[#111111] mb-6">Delivery History</h2>
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-[#FFE13C]" /></div>
      ) : completedOrders.length === 0 ? (
         <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100">
          <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-gray-300" />
          </div>
          <h3 className="font-bold text-[#111111] text-lg mb-1">No history yet</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {completedOrders.map(item => (
            <div key={item.order.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-gray-500">#ORD-{item.order.id.slice(-6).toUpperCase()}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${item.assignment.status === "DELIVERED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {item.assignment.status}
                  </span>
               </div>
               <p className="font-bold text-[#111111]">{item.order.deliveryAddress.name}</p>
               <p className="text-sm text-gray-600 mt-1">{item.order.items.reduce((acc, i) => acc + i.quantity, 0)} Items • ₹{item.order.totalAmount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}