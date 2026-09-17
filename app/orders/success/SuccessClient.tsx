"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, MapPin, CreditCard, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessClientProps {
  orderId?: string;
}

export default function SuccessClient({ orderId }: SuccessClientProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!orderId) {
      setError("Order not found");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || "We couldn't find this order.");
        }
      } catch (err) {
        setError("A network error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center pt-12 pb-24 px-4 w-full">
        {/* Success Header Skeleton */}
        <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-6"></div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Restaurant Skeleton */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse">
              <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
            </div>

            {/* Items Skeleton */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse space-y-4">
              <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Address Skeleton */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse space-y-4">
              <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Summary Skeleton */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse space-y-4">
              <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between"><div className="h-4 w-1/3 bg-gray-200 rounded"></div><div className="h-4 w-1/4 bg-gray-200 rounded"></div></div>
              <div className="flex justify-between"><div className="h-4 w-1/3 bg-gray-200 rounded"></div><div className="h-4 w-1/4 bg-gray-200 rounded"></div></div>
              <div className="flex justify-between"><div className="h-4 w-1/3 bg-gray-200 rounded"></div><div className="h-4 w-1/4 bg-gray-200 rounded"></div></div>
              <div className="border-t border-gray-100 pt-4 flex justify-between"><div className="h-5 w-1/3 bg-gray-200 rounded"></div><div className="h-5 w-1/4 bg-gray-200 rounded"></div></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AlertCircle size={64} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-black mb-2 text-center">{error || "Order not found"}</h1>
        <p className="text-gray-500 mb-8 text-center">We couldn't find this order. It may have been removed or you don't have permission to view it.</p>
        <Link href="/orders" className="bg-[#FFE13C] text-[#111111] px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-[#FFE13C]/20">
          View My Orders
        </Link>
      </div>
    );
  }

  // Format Status for display
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case "PENDING": return { text: "Order Received", color: "bg-yellow-100 text-yellow-700" };
      case "CONFIRMED": return { text: "Confirmed", color: "bg-blue-100 text-blue-700" };
      case "PREPARING": return { text: "Preparing", color: "bg-orange-100 text-orange-700" };
      case "READY": return { text: "Ready", color: "bg-green-100 text-green-700" };
      case "OUT_FOR_DELIVERY": return { text: "Out for Delivery", color: "bg-indigo-100 text-indigo-700" };
      case "DELIVERED": return { text: "Delivered", color: "bg-green-100 text-green-700" };
      case "CANCELLED": return { text: "Cancelled", color: "bg-red-100 text-red-700" };
      default: return { text: status, color: "bg-gray-100 text-gray-700" };
    }
  };

  const statusInfo = getStatusDisplay(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: true
  });

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 pt-12 pb-24">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-sm border-8 border-green-50 animate-in zoom-in duration-500">
          <CheckCircle2 size={40} className="stroke-[3]" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-[#111111] mb-3 tracking-tight">Order Placed Successfully</h1>
        <p className="text-gray-500 mb-6 font-medium max-w-md">Your order has been received and is being prepared.</p>
        <div className="bg-white px-6 py-2 rounded-full border border-gray-200 shadow-sm font-bold text-lg">
          Order <span className="text-gray-400">#</span>{order._id.slice(-8).toUpperCase()}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column - Order Details */}
        <div className="w-full lg:flex-1 space-y-6">
          
          {/* Restaurant & Status */}
          <div className="bg-white p-6 lg:p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-[#111111] mb-1">
                  {order.restaurantId?.name || "Restaurant"}
                </h2>
                <p className="text-sm font-medium text-gray-500">
                  Order placed: {formattedDate}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold text-sm inline-flex w-fit ${statusInfo.color}`}>
                {statusInfo.text}
              </div>
            </div>

            {/* Tracking Progress */}
            {order.status !== "CANCELLED" && (
              <div className="mt-8 mb-4">
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
                  
                  {/* Dynamic Progress Bar */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out rounded-full" 
                    style={{ 
                      width: 
                        order.status === 'PENDING' ? '10%' : 
                        order.status === 'CONFIRMED' ? '30%' : 
                        order.status === 'PREPARING' ? '50%' : 
                        order.status === 'READY' ? '70%' : 
                        order.status === 'OUT_FOR_DELIVERY' ? '90%' : 
                        order.status === 'DELIVERED' ? '100%' : '0%'
                    }}
                  ></div>

                  <div className="relative z-10 flex justify-between">
                    {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((step, idx) => {
                      const isCompleted = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.status) >= idx;
                      const isCurrent = order.status === step;
                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${isCompleted ? 'bg-green-500 shadow-lg shadow-green-500/30 ring-4 ring-white' : 'bg-gray-200'} ${isCurrent ? 'scale-125' : ''} transition-all duration-300`}></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-[10px] sm:text-xs font-bold text-gray-400">
                  <span className={['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.status) >= 0 ? "text-[#111111]" : ""}>Placed</span>
                  <span className={['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.status) >= 0 ? "text-[#111111]" : ""}>Confirmed</span>
                  <span className="hidden sm:block">Preparing</span>
                  <span className="hidden sm:block">Ready</span>
                  <span className={['OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.status) >= 0 ? "text-[#111111]" : ""}>Out</span>
                  <span className={order.status === 'DELIVERED' ? "text-[#111111]" : ""}>Delivered</span>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white p-6 lg:p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-[#111111] mb-6 flex items-center gap-2">
              <ShoppingBag size={20} className="text-gray-400" />
              Order Items
            </h3>
            <div className="space-y-6">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#111111] line-clamp-1">{item.name}</h4>
                    <p className="text-sm font-semibold text-gray-500 mt-1">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <div className="font-black text-[#111111]">
                    ₹{item.subtotal}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-[#111111] mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-gray-400" />
                Delivery Address
              </h3>
              <div className="space-y-1 text-sm font-medium text-gray-600">
                <p className="font-bold text-[#111111] text-base mb-2">{order.deliveryAddress.name}</p>
                <p>{order.deliveryAddress.phone}</p>
                <p>{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-[#111111] mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-gray-400" />
                Payment
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-sm font-medium text-gray-500">Method</span>
                  <span className="font-bold text-[#111111]">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-xs ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-[#111111] mb-6 text-center">Order Summary</h3>
            
            <div className="space-y-4 text-sm font-medium text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#111111]">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
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
            </div>

            <div className="pt-4 border-t border-dashed border-gray-200 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-black text-[#111111]">Total</span>
                <span className="text-2xl font-black text-[#FFE13C]">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link 
                href={`/orders/${order._id}`}
                className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-black/20"
              >
                Track Order
              </Link>
              <Link 
                href="/orders"
                className="w-full bg-white border border-gray-200 text-[#111111] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                View My Orders
              </Link>
              <Link 
                href="/"
                className="w-full bg-[#FFE13C] text-[#111111] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors shadow-lg shadow-[#FFE13C]/20"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
