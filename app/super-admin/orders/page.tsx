"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/orders")
      .then(res => res.json())
      .then(data => { setOrders(data.data || []); setLoading(false); });
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Platform Orders</h1>
          <p className="text-gray-500 mt-1">View and manage all orders across restaurants</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#FFE13C]" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-medium text-gray-500 text-sm">Order ID</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Restaurant</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Customer</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Amount</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Status</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-gray-700">
                    <td className="p-4"><Link href={`/super-admin/orders/${o._id}`} className="font-semibold text-[#111111] hover:text-[#FFE13C] transition-colors">{o._id.substring(18)}</Link></td>
                    <td className="p-4">{o.restaurantId?.name || "Unknown"}</td>
                    <td className="p-4">{o.customerId?.name || "Unknown"}</td>
                    <td className="p-4 font-medium">₹{o.totalAmount}</td>
                    <td className="p-4"><span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{o.status}</span></td>
                    <td className="p-4 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}