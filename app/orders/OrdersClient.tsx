"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Search, MapPin, CheckCircle2, Clock, Truck, ShoppingCart } from "lucide-react";

type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  subtotal: number;
};

type Order = {
  _id: string;
  restaurantId: {
    _id: string;
    name: string;
    logo?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
};

const TABS = ["All", "Active", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchOrders();
  }, [activeTab, page, debouncedSearch]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(false);
    try {
      let url = `/api/orders?page=${page}&limit=10`;
      
      let statusFilter = "";
      if (activeTab === "Active") {
        // We'll fetch all and filter in memory, or if API supports multiple statuses, we would use it.
        // Wait, the API only supports exact status match. 
        // Active = PENDING, CONFIRMED, PREPARING, READY, OUT_FOR_DELIVERY
        // We'll just fetch All and filter client-side if searching by Active, or we can just omit status and filter.
        // Let's omit status if "Active" or "All" or "Search", but then pagination gets tricky.
      } else if (activeTab === "Preparing") {
        url += `&status=PREPARING`;
      } else if (activeTab === "Out for Delivery") {
        url += `&status=OUT_FOR_DELIVERY`;
      } else if (activeTab === "Delivered") {
        url += `&status=DELIVERED`;
      } else if (activeTab === "Cancelled") {
        url += `&status=CANCELLED`;
      }

      const res = await fetch(url);
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.message || "Failed");

      let filteredOrders = json.data as Order[];

      if (activeTab === "Active") {
        const activeStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"];
        filteredOrders = filteredOrders.filter(o => activeStatuses.includes(o.status));
      }

      if (debouncedSearch) {
        const s = debouncedSearch.toLowerCase();
        filteredOrders = filteredOrders.filter(o => 
          o._id.toLowerCase().includes(s) || 
          o.restaurantId?.name?.toLowerCase().includes(s)
        );
      }

      setOrders(filteredOrders);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING": return { text: "Pending", color: "bg-[#FFE13C]/20 text-yellow-800" };
      case "CONFIRMED": return { text: "Confirmed", color: "bg-[#FFE13C]/20 text-yellow-800" };
      case "PREPARING": return { text: "Preparing", color: "bg-[#FFE13C]/20 text-yellow-800" };
      case "READY": return { text: "Ready", color: "bg-green-100 text-green-800" };
      case "OUT_FOR_DELIVERY": return { text: "Out for Delivery", color: "bg-[#FFE13C] text-[#111111]" };
      case "DELIVERED": return { text: "Delivered", color: "bg-[#22C55E]/20 text-[#111111]" };
      case "CANCELLED": return { text: "Cancelled", color: "bg-red-100 text-red-700" };
      default: return { text: status, color: "bg-gray-100 text-gray-700" };
    }
  };

  const getProgressTracker = (status: string) => {
    const steps = ["Placed", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered"];
    let currentIdx = steps.findIndex(s => s.toUpperCase().replace(/ /g, "_") === status);
    
    // Fallbacks mapping
    if (status === "PENDING") currentIdx = 0;
    if (status === "OUT_FOR_DELIVERY") currentIdx = 4;

    if (status === "CANCELLED") return null;

    return (
      <div className="flex items-center gap-2 mt-4 overflow-x-auto text-sm whitespace-nowrap scrollbar-hide pb-2">
        {steps.map((step, idx) => {
          let icon = <span className="w-2 h-2 rounded-full bg-gray-300 mx-1" />;
          if (idx < currentIdx) icon = <span className="text-green-500 text-lg">✓</span>;
          if (idx === currentIdx) icon = <span className="w-2 h-2 rounded-full bg-[#FFE13C] mx-1 shadow-[0_0_0_4px_rgba(255,225,60,0.2)]" />;
          
          return (
            <div key={step} className={`flex items-center gap-1 ${idx <= currentIdx ? "text-black font-bold" : "text-gray-400 font-medium"}`}>
              {icon}
              <span>{step}</span>
              {idx < steps.length - 1 && <span className="text-gray-300 mx-1">→</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm animate-pulse mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          <div>
            <div className="w-32 h-5 bg-gray-200 rounded mb-2"></div>
            <div className="w-24 h-4 bg-gray-100 rounded"></div>
          </div>
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-3 my-6">
        <div className="flex gap-4"><div className="w-16 h-16 bg-gray-200 rounded-xl"></div><div className="w-32 h-4 bg-gray-200 rounded mt-2"></div></div>
      </div>
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
        <div className="w-24 h-6 bg-gray-200 rounded"></div>
        <div className="w-32 h-10 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans pb-24">
      {/* Hero Header */}
      <div className="bg-[#151515] text-[#FAFAF8] pt-12 pb-24 rounded-b-[48px] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 uppercase">
            My Orders
          </h1>
          <p className="text-gray-400 font-medium text-lg max-w-lg mx-auto">
            Track your orders, view details and order your favorites again.
          </p>
          <div className="w-16 h-1.5 bg-[#FFE13C] mx-auto mt-8 rounded-full"></div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 lg:px-8 -mt-12 relative z-20">
        {/* Filters & Search */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <h2 className="text-xl font-black">Your Orders</h2>
            <div className="relative w-full sm:w-64">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-full pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-[#FFE13C] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-colors ${
                  activeTab === tab
                    ? "bg-[#FFE13C] text-[#111111]"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {error ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-red-500 mb-2">Unable to load your orders</h3>
            <p className="text-gray-500 font-medium mb-6">Something went wrong while loading your orders.</p>
            <button onClick={fetchOrders} className="bg-[#FFE13C] text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
              Try Again
            </button>
          </div>
        ) : loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={40} className="text-gray-300" />
            </div>
            <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">No Orders Yet</h3>
            <p className="text-gray-500 font-medium mb-8">Your next delicious meal is waiting for you.</p>
            <Link href="/restaurants" className="inline-flex bg-[#FFE13C] text-[#111111] px-8 py-4 rounded-full font-black hover:scale-105 transition-transform shadow-lg shadow-[#FFE13C]/20">
              Explore Restaurants →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const rName = order.restaurantId?.name || "Restaurant";
              const rLogo = order.restaurantId?.logo || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80";
              const statusDisplay = getStatusDisplay(order.status);
              const isActive = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(order.status);
              const isDelivered = order.status === "DELIVERED";

              return (
                <div key={order._id} className={`bg-white border ${isActive ? 'border-[#FFE13C]' : 'border-gray-100'} rounded-[32px] p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all relative overflow-hidden group`}>
                  
                  {isActive && <div className="absolute top-0 left-0 w-2 h-full bg-[#FFE13C]"></div>}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                        <img src={rLogo} alt={rName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-[#111111]">{rName}</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                          Order #{order._id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`${statusDisplay.color} px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider self-start shrink-0`}>
                      {statusDisplay.text}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    {order.items.slice(0, 2).map((item, i) => (
                      <div key={i} className="flex items-center justify-between mb-3 last:mb-0">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-500">{item.quantity}×</span>
                          <span className="font-bold text-[#111111]">{item.name}</span>
                        </div>
                        <span className="font-black text-gray-600">₹{item.price}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-sm font-bold text-gray-400 mt-2">
                        + {order.items.length - 2} more items
                      </div>
                    )}
                  </div>

                  {isActive && getProgressTracker(order.status)}

                  <div className="bg-gray-50 rounded-2xl p-4 mt-6 space-y-2 text-sm font-medium text-gray-500">
                    <div className="flex justify-between"><span>Item Total</span><span>₹{order.subtotal}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span>₹{order.deliveryFee}</span></div>
                    <div className="flex justify-between"><span>Tax</span><span>₹{order.tax}</span></div>
                    {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount}</span></div>}
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-black text-lg text-[#111111]">
                      <span>Total</span><span>₹{order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 text-xs uppercase tracking-wider font-bold">
                      <span>Payment: {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}</span>
                      <span className={order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}>
                        Status: {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end mt-6 pt-6 border-t border-gray-100 gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                      {isDelivered && (
                        <Link href={`/cart?restaurant=${order.restaurantId?._id}`} className="px-6 py-3 rounded-full border-2 border-gray-100 font-bold hover:bg-gray-50 transition-colors text-black">
                          Order Again
                        </Link>
                      )}
                      
                      {isActive ? (
                        <Link href={`/orders/${order._id}`} className="px-6 py-3 rounded-full bg-[#FFE13C] text-[#111111] font-black hover:scale-105 transition-transform flex items-center gap-2">
                          Track Order <ChevronRight size={18} />
                        </Link>
                      ) : (
                        <Link href={`/orders/${order._id}`} className="px-6 py-3 rounded-full bg-[#111111] text-white font-black hover:bg-[#222222] transition-colors flex items-center gap-2">
                          View Order <ChevronRight size={18} />
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}

            {/* Pagination Placeholder */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <span className="font-bold text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
