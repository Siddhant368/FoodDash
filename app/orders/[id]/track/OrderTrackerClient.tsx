"use client";

import { useEffect, useState } from "react";
import { 
  ChevronLeft, 
  MapPin, 
  CheckCircle2, 
  Receipt, 
  User, 
  CreditCard,
  Phone
} from "lucide-react";
import Link from "next/link";
import { getOrderUpdate } from "./actions";

const STATUS_MAP: Record<string, { label: string; icon: string; title: string; subtitle: string; index: number }> = {
  PENDING: { label: "Order Placed", icon: "📝", title: "Order received", subtitle: "Waiting for restaurant to confirm", index: 0 },
  CONFIRMED: { label: "Confirmed", icon: "✅", title: "Order confirmed", subtitle: "The restaurant has accepted your order", index: 1 },
  PREPARING: { label: "Preparing", icon: "🍳", title: "Preparing your food", subtitle: "The kitchen is preparing your order", index: 2 },
  READY: { label: "Ready", icon: "🛍️", title: "Ready for pickup", subtitle: "Waiting for delivery partner", index: 3 },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", icon: "🚴", title: "Your order is on the way", subtitle: "Delivery partner is heading to you", index: 4 },
  DELIVERED: { label: "Delivered", icon: "🎉", title: "Order delivered", subtitle: "Enjoy your meal!", index: 5 },
  CANCELLED: { label: "Cancelled", icon: "❌", title: "Order cancelled", subtitle: "Your order has been cancelled", index: -1 },
};

const TIMELINE_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

export default function OrderTrackerClient({ initialData, orderId }: { initialData: any, orderId: string }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (["DELIVERED", "CANCELLED"].includes(data.orderStatus)) return;

    const interval = setInterval(async () => {
      const res = await getOrderUpdate(orderId);
      if (res) {
        setData((prev: any) => ({ ...prev, ...res }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [data.orderStatus, orderId]);

  const currentStatusInfo = STATUS_MAP[data.orderStatus] || STATUS_MAP.PENDING;
  const currentStepIndex = TIMELINE_STEPS.indexOf(data.orderStatus);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF0] text-[#111111] font-sans pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-16 flex items-center justify-between shadow-sm lg:px-8">
        <div className="flex items-center gap-4">
          <Link href={`/orders/${orderId}`} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-[#FFF9D6] transition-colors border border-gray-100 text-[#111111]">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-black tracking-tight">Track Your Order</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Progress & Map/Status Header */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Status Header Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-black/5 border border-gray-100 flex flex-col items-center justify-center text-center py-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFE13C]/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFE13C]/20 rounded-full blur-3xl"></div>
              
              <div className="text-6xl mb-6 relative z-10">{currentStatusInfo.icon}</div>
              <h2 className="text-3xl font-black mb-2 tracking-tight relative z-10">{currentStatusInfo.title}</h2>
              <p className="text-gray-500 font-semibold relative z-10">{currentStatusInfo.subtitle}</p>
              <div className="mt-8 inline-block bg-[#FFFDF0] border border-gray-100 px-6 py-2.5 rounded-full text-sm font-black text-[#111111] relative z-10 shadow-sm">
                Order #{orderId.slice(-8).toUpperCase()}
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-black/5 border border-gray-100">
              <h3 className="font-black text-2xl mb-8 tracking-tight">Order Progress</h3>
              
              {data.orderStatus === "CANCELLED" ? (
                <div className="bg-red-50 text-red-600 p-8 rounded-[24px] font-black flex flex-col items-center gap-4 border border-red-100 text-center text-lg">
                  <span className="text-4xl">❌</span>
                  Order Cancelled
                </div>
              ) : (
                <div className="relative pl-8 space-y-10 py-2">
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100"></div>
                  
                  {TIMELINE_STEPS.map((stepStatus, idx) => {
                    const stepInfo = STATUS_MAP[stepStatus];
                    const isCompleted = currentStepIndex > idx;
                    const isCurrent = currentStepIndex === idx;
                    const isFuture = currentStepIndex < idx;
                    
                    let indicator = (
                      <div className="w-8 h-8 rounded-full bg-white border-[3px] border-gray-200 -ml-[40px] z-10 relative"></div>
                    );
                    
                    if (isCompleted) {
                      indicator = (
                        <div className="w-8 h-8 rounded-full bg-[#111111] text-[#FFE13C] flex items-center justify-center -ml-[40px] z-10 relative shadow-md">
                          <CheckCircle2 size={18} strokeWidth={3} />
                        </div>
                      );
                    } else if (isCurrent) {
                      indicator = (
                        <div className="w-8 h-8 rounded-full bg-[#FFE13C] flex items-center justify-center -ml-[40px] z-10 relative border-[4px] border-white shadow-md ring-1 ring-gray-100">
                          <div className="w-3 h-3 bg-[#111111] rounded-full"></div>
                        </div>
                      );
                    }

                    return (
                      <div key={stepStatus} className={`relative flex gap-5 items-center ${isFuture ? 'opacity-40' : ''}`}>
                        {indicator}
                        <div>
                          <p className={`font-black ${isCurrent ? 'text-[#111111] text-xl' : 'text-gray-600 text-lg'}`}>
                            {stepInfo.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            
            {/* Delivery Partner */}
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-gray-100">
              <h3 className="font-black text-xl mb-6 tracking-tight flex items-center gap-2">
                <User size={22} className="text-[#FFE13C]" />
                Delivery Partner
              </h3>
              
              {data.deliveryPartner ? (
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#FFFDF0] border border-gray-100 rounded-[20px] flex items-center justify-center text-[#111111]">
                    <User size={28} />
                  </div>
                  <div>
                    <p className="font-black text-lg text-[#111111]">{data.deliveryPartner.name}</p>
                    <p className="text-sm text-gray-500 font-semibold mb-3">{data.deliveryStatus?.replace(/_/g, " ")}</p>
                    <a href={`tel:${data.deliveryPartner.phone}`} className="inline-flex items-center gap-1.5 text-sm font-black bg-[#FFE13C] text-[#111111] px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-sm">
                      <Phone size={14} /> Call Driver
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FFFDF0] rounded-[24px] p-5 text-center border border-gray-100">
                  <p className="text-gray-500 font-semibold text-sm">Delivery partner will be assigned soon.</p>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-gray-100 space-y-5">
              <h3 className="font-black text-xl tracking-tight flex items-center gap-2 mb-2">
                <Receipt size={22} className="text-[#FFE13C]" />
                Order Information
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 font-semibold">Restaurant</span>
                  <span className="font-black text-right text-base">{data.restaurantName}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 font-semibold">Date</span>
                  <span className="font-bold text-right text-[#111111]">{formatDate(data.createdAt)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 font-semibold">Items</span>
                  <span className="font-bold text-right text-[#111111]">{data.itemCount} {data.itemCount === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="flex justify-between items-start pt-4 border-t border-gray-100">
                  <span className="text-gray-500 font-semibold">Total</span>
                  <span className="font-black text-right text-xl text-[#111111]">₹{data.totalAmount}</span>
                </div>
                <div className="flex justify-between items-start pt-4 border-t border-gray-100">
                  <span className="text-gray-500 font-semibold flex items-center gap-1.5"><CreditCard size={16} /> Payment</span>
                  <div className="text-right">
                    <span className="font-black block">{data.paymentMethod}</span>
                    <span className={`text-xs font-black px-2 py-1 rounded-md mt-1 inline-block ${data.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {data.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-gray-100">
              <h3 className="font-black text-xl mb-5 tracking-tight flex items-center gap-2">
                <MapPin size={22} className="text-[#FFE13C]" />
                Delivery Address
              </h3>
              
              <div className="text-sm space-y-1.5 text-gray-600 font-medium">
                <p className="font-black text-base text-[#111111]">{data.deliveryAddress.name}</p>
                <p>{data.deliveryAddress.phone}</p>
                <p className="mt-3">{data.deliveryAddress.addressLine1}</p>
                {data.deliveryAddress.addressLine2 && <p>{data.deliveryAddress.addressLine2}</p>}
                <p>{data.deliveryAddress.city}, {data.deliveryAddress.state} {data.deliveryAddress.pincode}</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Action Bar (Sticky Bottom on Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 z-40 lg:static lg:bg-transparent lg:border-t-0 lg:p-0 lg:max-w-4xl lg:mx-auto lg:px-8 lg:mt-8">
        <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
          <Link href={`/orders/${orderId}`} className="flex-1 lg:flex-none text-center bg-[#111111] text-[#FFFDF0] px-8 py-4 rounded-[20px] font-black hover:scale-105 transition-transform shadow-lg shadow-black/20">
            Back to Order
          </Link>
          <Link href="/orders" className="flex-1 lg:flex-none text-center bg-[#FFF9D6] text-[#111111] px-8 py-4 rounded-[20px] font-black hover:scale-105 transition-transform">
            My Orders
          </Link>
          <Link href="/" className="w-full lg:w-auto text-center bg-transparent border-2 border-gray-200 text-[#111111] px-8 py-4 rounded-[20px] font-black hover:border-[#111111] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
