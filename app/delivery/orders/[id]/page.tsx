"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { DeliveryOrder, DeliveryStatus } from "../../types";
import { ArrowLeft, MapPin, Phone, RefreshCw, Store, CheckCircle, Navigation } from "lucide-react";
import Link from "next/link";
import { io as socketIO, Socket } from "socket.io-client";

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationError("");
    
    // Connect socket
    if (!socketRef.current) {
      socketRef.current = socketIO({
        path: "/api/socket/io",
        addTrailingSlash: false,
      });
      socketRef.current.on("connect", () => {
        socketRef.current?.emit("delivery:join", id);
      });
    }

    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (socketRef.current) {
          socketRef.current.emit("delivery:location-update", {
            orderId: id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            updatedAt: new Date().toISOString()
          });
        }
      },
      (error) => {
        setIsTracking(false);
        if (error.code === 1) {
          setLocationError("Location permission is required to share your live location.");
        } else {
          setLocationError("Unable to get your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.emit("delivery:stop-tracking", id);
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsTracking(false);
  };

  async function updateStatus(status: DeliveryStatus) {
    try {
      setUpdating(true);
      const res = await fetch(`/api/delivery/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      
      if (status === "DELIVERED" || status === "CANCELLED") {
        stopTracking();
        router.push("/delivery/history");
      } else {
        await fetchOrder();
        if (status === "OUT_FOR_DELIVERY") {
          startTracking(); // auto-start tracking
        }
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
        return <button onClick={() => updateStatus("ACCEPTED")} disabled={updating} className="w-full py-4 rounded-xl bg-[#FFE13C] text-[#111111] font-black text-lg shadow-sm">Accept Order</button>;
      case "ACCEPTED":
        return <button onClick={() => updateStatus("PICKED_UP")} disabled={updating} className="w-full py-4 rounded-xl bg-[#FFE13C] text-[#111111] font-black text-lg shadow-sm">Mark as Picked Up</button>;
      case "PICKED_UP":
        return <button onClick={() => updateStatus("OUT_FOR_DELIVERY")} disabled={updating} className="w-full py-4 rounded-xl bg-[#FFE13C] text-[#111111] font-black text-lg shadow-sm">Start Delivery</button>;
      case "OUT_FOR_DELIVERY":
        return <button onClick={() => updateStatus("DELIVERED")} disabled={updating} className="w-full py-4 rounded-xl bg-green-500 text-white font-black text-lg shadow-sm">Mark as Delivered</button>;
      default:
        return null;
    }
  };

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
        <Link href="/delivery/orders" className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition"><ArrowLeft size={20} /></Link>
        <div>
          <h2 className="font-black text-lg text-[#111111]">Order Details</h2>
          <p className="text-gray-500 font-bold text-xs uppercase">#ORD-{order.order.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        
        {/* Tracking Card */}
        {order.assignment.status === "OUT_FOR_DELIVERY" && (
          <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
            <h3 className="font-black text-lg mb-3 flex items-center gap-2">
              <Navigation size={20} className={isTracking ? "text-blue-500" : "text-gray-400"} />
              Live Tracking
            </h3>
            
            {locationError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold mb-4 border border-red-100">
                {locationError}
              </div>
            )}
            
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
              <div>
                <p className="font-bold text-[#111111]">{isTracking ? "Sharing Location" : "Location Paused"}</p>
                <p className="text-xs text-gray-500 font-medium">Customer can see your live location</p>
              </div>
              <button 
                onClick={isTracking ? stopTracking : startTracking}
                className={`px-4 py-2 rounded-full font-black text-sm transition-colors ${isTracking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
              >
                {isTracking ? "Stop" : "Share"}
              </button>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
          <h3 className="font-black text-lg mb-4">Status Timeline</h3>
          <div className="flex flex-col gap-4 text-sm font-semibold">
             <div className="flex gap-3 items-center text-green-600"><CheckCircle size={18}/> Order Assigned</div>
             <div className={`flex gap-3 items-center ${["ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(order.assignment.status) ? "text-green-600" : "text-gray-300"}`}><CheckCircle size={18}/> Order Accepted</div>
             <div className={`flex gap-3 items-center ${["PICKED_UP", "OUT_FOR_DELIVERY"].includes(order.assignment.status) ? "text-green-600" : "text-gray-300"}`}><CheckCircle size={18}/> Food Picked Up</div>
             <div className={`flex gap-3 items-center ${["OUT_FOR_DELIVERY"].includes(order.assignment.status) ? "text-blue-600" : "text-gray-300"}`}><CheckCircle size={18}/> Out for Delivery</div>
          </div>
        </div>

        {/* Restaurant */}
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-400 text-[10px] tracking-wider uppercase mb-3">Restaurant Details</h3>
          <div className="flex gap-4 items-center">
             <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
               <Store size={24} />
             </div>
             <div>
               <p className="font-black text-base text-[#111111]">FoodHub Restaurant</p>
               <a href="#" className="text-blue-600 text-xs font-black bg-blue-50 px-2 py-1 rounded-md inline-block mt-1">Open Maps</a>
             </div>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-400 text-[10px] tracking-wider uppercase mb-3">Customer Details</h3>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl mb-4">
             <div>
               <p className="font-black text-[#111111]">{order.order.deliveryAddress.name}</p>
               <p className="text-sm font-medium text-gray-500 mt-0.5">{order.order.deliveryAddress.phone}</p>
             </div>
             <a href={`tel:${order.order.deliveryAddress.phone}`} className="bg-white shadow-sm border border-gray-100 text-blue-600 p-3 rounded-full hover:scale-105 transition-transform"><Phone size={20}/></a>
          </div>
          <div className="pt-2">
             <p className="font-bold text-sm mb-1 flex items-center gap-1.5"><MapPin size={16} className="text-gray-400"/> Delivery Address</p>
             <p className="text-sm font-medium text-gray-600 pl-5 leading-relaxed">{order.order.deliveryAddress.addressLine1}, {order.order.deliveryAddress.city}</p>
             <a href="#" className="text-blue-600 text-xs font-black bg-blue-50 px-2 py-1 rounded-md inline-block mt-2 ml-5">Open Maps</a>
          </div>
        </div>

        {/* Bill */}
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
          <h3 className="font-black text-lg mb-4">Order Summary</h3>
          {order.order.items.map(item => (
            <div key={item.name} className="flex justify-between text-sm font-medium text-gray-600 mb-2">
              <span>{item.quantity}x {item.name}</span>
              <span className="font-bold text-[#111111]">₹{item.subtotal}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-4 pt-4 text-base font-black flex justify-between">
            <span>Total</span>
            <span className="text-xl">₹{order.order.totalAmount}</span>
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-lg mx-auto">
          {getActionBtn()}
        </div>
      </div>
    </div>
  );
}