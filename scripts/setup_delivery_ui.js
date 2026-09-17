const fs = require('fs');
const path = require('path');

const typesTs = `
export type DeliveryStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface DeliveryOrder {
  assignment: {
    id: string;
    status: DeliveryStatus;
    assignedAt?: string;
    acceptedAt?: string;
    pickedUpAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
    deliveryNote?: string;
  };
  order: {
    id: string;
    customerId: string;
    items: {
      name: string;
      price: number;
      quantity: number;
      subtotal: number;
      image?: string;
    }[];
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    deliveryAddress: {
      name: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      pincode: string;
    };
    customerNote?: string;
    createdAt: string;
  };
}
`;

const layoutTsx = `
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListOrdered, History, User, Bell } from "lucide-react";
import { useState, useEffect } from "react";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { label: "Dashboard", href: "/delivery", icon: Home },
    { label: "Orders", href: "/delivery/orders", icon: ListOrdered },
    { label: "History", href: "/delivery/history", icon: History },
    { label: "Profile", href: "/delivery/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen fixed">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 bg-[#FFE13C] rounded-xl flex items-center justify-center font-black text-xl">
            FH
          </div>
          <h1 className="font-black text-2xl tracking-tight">Delivery</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/delivery");
            return (
              <Link key={item.href} href={item.href} className={\`flex items-center gap-3 p-3 rounded-xl font-bold transition-all \${isActive ? "bg-[#FFE13C] text-[#111111]" : "text-gray-500 hover:bg-gray-50 hover:text-[#111111]"}\`}>
                <item.icon size={20} className={isActive ? "fill-[#111111]" : ""} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-20 px-4 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FFE13C] rounded-lg flex items-center justify-center font-black text-lg">
              FH
            </div>
            <h1 className="font-black text-xl tracking-tight">Delivery</h1>
          </div>
          <button className="relative p-2 text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center h-16">
            {navItems.map(item => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/delivery");
              return (
                <Link key={item.href} href={item.href} className={\`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors \${isActive ? "text-[#111111]" : "text-gray-400 hover:text-gray-600"}\`}>
                  <item.icon size={isActive ? 24 : 20} className={isActive ? "fill-[#FFE13C]" : ""} />
                  <span className={\`text-[10px] font-bold \${isActive ? "text-[#111111]" : ""}\`}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
`;

const dashboardTsx = `
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
`;

const ordersTsx = `
"use client";

import { useEffect, useState, useMemo } from "react";
import { DeliveryOrder } from "../types";
import { RefreshCw, Truck, Store, MapPin, Phone, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrdersPage() {
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
          className={\`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-2 \${activeTab === "assigned" ? "bg-white text-[#111111] shadow-sm" : "text-gray-500 hover:bg-gray-200"}\`}
          onClick={() => setActiveTab("assigned")}
        >
          Assigned
          {assignedOrders.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{assignedOrders.length}</span>}
        </button>
        <button 
          className={\`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-2 \${activeTab === "active" ? "bg-white text-[#111111] shadow-sm" : "text-gray-500 hover:bg-gray-200"}\`}
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
               <div className={\`absolute left-0 top-0 bottom-0 w-1.5 \${
                  item.assignment.status === "ASSIGNED" ? "bg-[#FFE13C]" : "bg-orange-500"
                }\`}></div>
                
                <div className="pl-3">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-bold text-gray-500">#ORD-{item.order.id.slice(-6).toUpperCase()}</p>
                      <h3 className="font-bold text-[#111111] text-lg mt-1">{item.order.deliveryAddress.name}</h3>
                    </div>
                    <span className={\`text-xs font-bold px-2 py-1 rounded border \${item.assignment.status === "ASSIGNED" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-orange-100 text-orange-800 border-orange-200"}\`}>
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

                  <Link href={\`/delivery/orders/\${item.order.id}\`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-[#111111] font-bold text-sm hover:bg-gray-200 transition-colors">
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
`;

const orderDetailsTsx = `
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
      const res = await fetch(\`/api/delivery/orders/\${id}\`);
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
      const res = await fetch(\`/api/delivery/orders/\${id}/status\`, {
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
             <div className={\`flex gap-3 items-center \${["ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(order.assignment.status) ? "text-green-600" : "text-gray-400"}\`}><CheckCircle size={16}/> Order Accepted</div>
             <div className={\`flex gap-3 items-center \${["PICKED_UP", "OUT_FOR_DELIVERY"].includes(order.assignment.status) ? "text-green-600" : "text-gray-400"}\`}><CheckCircle size={16}/> Food Picked Up</div>
             <div className={\`flex gap-3 items-center \${["OUT_FOR_DELIVERY"].includes(order.assignment.status) ? "text-yellow-600" : "text-gray-400"}\`}><CheckCircle size={16}/> Out for Delivery</div>
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
             <a href={\`tel:\${order.order.deliveryAddress.phone}\`} className="bg-blue-50 text-blue-600 p-3 rounded-full"><Phone size={20}/></a>
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
`;

const historyTsx = `
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
                  <span className={\`text-xs font-bold px-2 py-1 rounded \${item.assignment.status === "DELIVERED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}\`}>
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
`;

const profileTsx = `
"use client";

import { User, Wallet, Bell, XCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm text-center mb-6">
        <div className="w-28 h-28 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#FFE13C]">
          <User size={48} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-black text-[#111111]">Rajesh Singh</h2>
        <p className="text-gray-500 font-medium">Delivery Partner</p>
        <div className="mt-4">
           <span className="bg-green-100 text-green-800 text-sm font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
           </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center gap-4 cursor-pointer hover:bg-gray-50">
          <div className="bg-gray-100 p-3 rounded-xl"><User size={20} /></div>
          <div><p className="font-bold">Personal Information</p></div>
        </div>
        <div className="p-5 border-b border-gray-50 flex items-center gap-4 cursor-pointer hover:bg-gray-50 text-red-600">
          <div className="bg-red-50 p-3 rounded-xl"><XCircle size={20} /></div>
          <div><p className="font-bold">Logout</p></div>
        </div>
      </div>
    </div>
  );
}
`;

const basePath = path.join('C:', 'Users', 'siddh', 'OneDrive', 'Desktop', 'restaurant-saas', 'app', 'delivery');
fs.writeFileSync(path.join(basePath, 'types.ts'), typesTs.trim());
fs.writeFileSync(path.join(basePath, 'layout.tsx'), layoutTsx.trim());
fs.writeFileSync(path.join(basePath, 'page.tsx'), dashboardTsx.trim());
fs.writeFileSync(path.join(basePath, 'orders', 'page.tsx'), ordersTsx.trim());
fs.writeFileSync(path.join(basePath, 'orders', '[id]', 'page.tsx'), orderDetailsTsx.trim());
fs.writeFileSync(path.join(basePath, 'history', 'page.tsx'), historyTsx.trim());
fs.writeFileSync(path.join(basePath, 'profile', 'page.tsx'), profileTsx.trim());

console.log("Delivery UI files generated successfully.");
