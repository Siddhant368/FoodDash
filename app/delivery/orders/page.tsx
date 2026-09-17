"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { DeliveryOrder } from "../types";
import { RefreshCw, Truck, Store, MapPin, Phone, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams?.get("tab") || "active");

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
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const assignedOrders = useMemo(() => orders.filter(o => o.assignment.status === "ASSIGNED"), [orders]);
  const activeDeliveries = useMemo(() => orders.filter(o => ["ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.assignment.status)), [orders]);
  
  const displayOrders = activeTab === "assigned" ? assignedOrders : activeDeliveries;

  return (
    <div>
      <h2 className="font-black text-2xl text-[#111111] mb-6">Active Orders</h2>

      <div className="flex p-1 bg-gray-100 rounded-xl mb-6 md:max-w-md">
        <button 
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-2 ${activeTab === "assigned" ? "bg-white text-[#111111] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
          onClick={() => setActiveTab("assigned")}
        >
          Assigned
          {assignedOrders.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{assignedOrders.length}</span>}
        </button>
        <button 
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-2 ${activeTab === "active" ? "bg-white text-[#111111] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
          onClick={() => setActiveTab("active")}
        >
          In Progress
          {activeDeliveries.length > 0 && <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeDeliveries.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-[#FFE13C] mb-4" />
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100">
          <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Truck size={32} className="text-gray-300" />
          </div>
          <h3 className="font-bold text-[#111111] text-lg mb-1">No orders here</h3>
          <p className="text-gray-500 text-sm">You don't have any {activeTab} orders right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map(item => (
            <div key={item.order.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
               <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  item.assignment.status === "ASSIGNED" ? "bg-[#FFE13C]" : "bg-orange-500"
                }`}></div>
                
                <div className="pl-3">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-bold text-gray-500">#ORD-{item.order.id.slice(-6).toUpperCase()}</p>
                      <h3 className="font-bold text-[#111111] text-lg mt-1">{item.order.deliveryAddress.name}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${item.assignment.status === "ASSIGNED" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-orange-100 text-orange-800 border-orange-200"}`}>
                      {item.assignment.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 font-medium mb-3">
                    {item.order.items.reduce((acc, i) => acc + i.quantity, 0)} Items • ₹{item.order.totalAmount.toFixed(2)}
                  </p>

                  <div className="flex gap-2 items-start mb-5">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{item.order.deliveryAddress.addressLine1}, {item.order.deliveryAddress.city}</p>
                  </div>

                  <Link href={`/delivery/orders/${item.order.id}`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-[#111111] font-bold text-sm hover:bg-gray-200 transition-colors">
                    View Details <ArrowRight size={16} />
                  </Link>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12">
        <RefreshCw size={32} className="animate-spin text-[#FFE13C] mb-4" />
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}