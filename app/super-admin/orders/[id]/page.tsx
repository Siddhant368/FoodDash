"use client";
import { useState, useEffect, use } from "react";
import { Loader2 } from "lucide-react";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = use(params);

  useEffect(() => {
    fetch(`/api/super-admin/orders/${id}`)
      .then(res => res.json())
      .then(data => { setOrder(data.data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#FFE13C]" /></div>;
  if (!order) return <div className="p-8 text-gray-500">Order not found</div>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Order Details</h1>
          <p className="text-gray-500 mt-1">Order #{order._id.substring(18)}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-gray-900">
        <h2 className="text-xl font-bold text-[#111111] mb-4">Items</h2>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item: any) => (
             <div key={item._id} className="py-3 flex justify-between text-gray-700">
                <span><span className="font-medium">{item.quantity}x</span> {item.name}</span>
                <span className="font-medium text-[#111111]">₹{item.subtotal}</span>
             </div>
          ))}
        </div>
        <div className="pt-6 mt-4 border-t border-gray-100 space-y-2 text-gray-600">
          <div className="flex justify-between"><p>Subtotal</p><p>₹{order.subtotal}</p></div>
          <div className="flex justify-between"><p>Delivery Fee</p><p>₹{order.deliveryFee}</p></div>
          <div className="flex justify-between"><p>Tax</p><p>₹{order.tax}</p></div>
          <div className="flex justify-between pt-4"><p className="font-bold text-[#111111] text-lg">Total</p><p className="font-bold text-[#111111] text-lg">₹{order.totalAmount}</p></div>
        </div>
      </div>
    </div>
  );
}
