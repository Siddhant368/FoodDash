"use client";

import { useState } from "react";
import { ChevronLeft, CheckCircle2, Navigation, Copy, MapPin, Map, Repeat, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SetLocationButton } from "@/components/SetLocationButton";

export default function OrderDetailsClient({ order, restaurant }: { order: any; restaurant: any }) {
  const [copying, setCopying] = useState(false);
  const [reordering, setReordering] = useState(false);
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(order._id);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleReorder = async () => {
    setReordering(true);
    try {
      let isFirst = true;
      for (const item of order.items) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: order.restaurantId,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            clearCart: isFirst,
          }),
        });
        if (!res.ok) {
          // If first item fails or we get a different restaurant error and didn't clear, etc.
          // Wait, clearCart: true clears other restaurants.
          const data = await res.json();
          if (!data.success) {
            alert(data.message || "Could not add item to cart. It may be unavailable.");
          }
        }
        isFirst = false;
      }
      router.push("/cart");
    } catch (error) {
      console.error(error);
      alert("An error occurred while reordering.");
    } finally {
      setReordering(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const statuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED"
    ];
    return statuses.indexOf(status);
  };

  const statusesList = [
    { key: "PENDING", label: "Order Placed" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "PREPARING", label: "Preparing" },
    { key: "READY", label: "Ready" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered" }
  ];

  const currentIndex = getStatusIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(new Date(dateString));
  };

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
            <Link href="/favorites" className="hover:text-[#FFE13C] transition-colors">Favorites</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <SetLocationButton />
            <Link href="/profile" className="bg-[#FFE13C] text-[#111111] p-3 rounded-full transition-colors flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>
            <Link href="/cart" className="bg-[#222222] hover:bg-[#333333] text-white px-5 py-3 rounded-full transition-colors flex items-center justify-center gap-2 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </Link>
          </div>
        </header>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 lg:px-8 space-y-6">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
          <ChevronLeft size={16} /> Back to Orders
        </Link>

        {/* Header */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2 tracking-tight">Order Details</h1>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-lg font-bold text-gray-600">
                Order #{order._id.toString().slice(-8).toUpperCase()}
              </p>
              <button onClick={handleCopy} className="text-gray-400 hover:text-black transition-colors" title="Copy Order ID">
                {copying ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Placed on: {formatDate(order.createdAt)}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             <Link href={`/orders/${order._id}/track`} className="bg-[#111111] text-white px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
               <Navigation size={18} /> Track Order
             </Link>
             <button onClick={handleReorder} disabled={reordering} className="bg-[#FFE13C] text-[#111111] px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
               {reordering ? <RefreshCw size={18} className="animate-spin" /> : <Repeat size={18} />}
               Reorder
             </button>
             <Link href="/" className="bg-white border-2 border-gray-200 text-[#111111] px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
               Continue Shopping
             </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-6">
            
            {/* Status Timeline */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black mb-6">ORDER STATUS</h2>
              {isCancelled ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold flex flex-col items-center gap-3 border border-red-100 justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                  Order Cancelled
                </div>
              ) : (
                <div className="relative pl-6 space-y-8 py-2">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                  {statusesList.map((s, idx) => {
                    const isCompleted = currentIndex > idx;
                    const isCurrent = currentIndex === idx;
                    
                    let icon = <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white -ml-[31px]"></div>;
                    
                    if (isCompleted) {
                        icon = <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center -ml-[31px] shadow-sm"><CheckCircle2 size={16}/></div>;
                    } else if (isCurrent) {
                        icon = <div className="w-6 h-6 rounded-full bg-[#FFE13C] text-zinc-900 flex items-center justify-center -ml-[31px] border-4 border-yellow-100 shadow-sm"><div className="w-2 h-2 bg-zinc-900 rounded-full"></div></div>;
                    }

                    return (
                      <div key={s.key} className={`relative z-10 flex gap-4 ${(isCompleted || isCurrent) ? '' : 'opacity-40'}`}>
                        {icon}
                        <div>
                          <p className={`font-bold ${isCurrent ? 'text-[#111111] text-lg' : 'text-gray-600'}`}>{s.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black mb-6">Order Items</h2>
              <div className="space-y-6">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-[#111111] truncate">{item.name}</h3>
                      <p className="text-gray-500 font-medium">₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="font-black text-lg">₹{item.subtotal}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
          <div className="space-y-6">
            
            {/* Restaurant */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Restaurant</h2>
              <h3 className="font-black text-lg">{restaurant?.name || "FoodHub Restaurant"}</h3>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Delivery Address</h2>
              <div className="font-bold text-[#111111] mb-1">{order.deliveryAddress.name}</div>
              <div className="text-gray-600 font-medium text-sm mb-3">{order.deliveryAddress.phone}</div>
              <div className="text-gray-500 text-sm leading-relaxed">
                {order.deliveryAddress.addressLine1}
                {order.deliveryAddress.addressLine2 && <><br />{order.deliveryAddress.addressLine2}</>}
                <br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Information</h2>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 font-medium">Method</span>
                <span className="font-bold">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Status</span>
                <span className={`font-bold px-2.5 py-1 rounded-md text-xs ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#111111]">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-[#111111]">₹{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-bold text-[#111111]">₹{order.tax}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-bold">-₹{order.discount}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-black text-lg text-[#111111]">Total</span>
                  <span className="font-black text-2xl text-[#111111]">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Customer Note */}
            {order.customerNote && (
              <div className="bg-yellow-50 rounded-[32px] p-6 border border-yellow-100">
                <h2 className="text-sm font-bold text-yellow-800 uppercase tracking-wider mb-2">Customer Note</h2>
                <p className="text-sm font-medium text-yellow-900">{order.customerNote}</p>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
