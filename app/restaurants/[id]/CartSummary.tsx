"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function CartSummary({ restaurantId }: { restaurantId: string }) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cart?restaurantId=${restaurantId}`);
      const data = await res.json();
      if (res.ok && data.success && data.cart) {
        setCart({ ...data.cart, summary: data.summary });
      } else {
        setCart(null);
      }
    } catch (err) {
      console.error("Cart fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    
    // Listen for add to cart events
    const handleCartUpdate = () => {
      fetchCart();
    };
    
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, [restaurantId]);

  if (loading && !cart) {
    return (
      <div className="hidden lg:block w-[350px] flex-shrink-0">
        <div className="sticky top-28 bg-white border border-gray-100 rounded-[32px] p-6 text-center shadow-xl shadow-black/5 flex items-center justify-center min-h-[200px]">
          <RefreshCw className="animate-spin text-[#FFE13C]" size={32} />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0 || cart.restaurantId !== restaurantId) {
    return (
      <div className="hidden lg:block w-[350px] flex-shrink-0">
        <div className="sticky top-28 bg-white border border-gray-100 rounded-[32px] p-8 text-center shadow-xl shadow-black/5 min-h-[250px] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <h2 className="text-xl font-black mb-2 text-[#111111]">Cart is empty</h2>
          <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-[200px] mx-auto">Add items from the menu to start your order.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block w-[350px] flex-shrink-0">
        <div className="sticky top-28 bg-white border border-gray-100 rounded-[32px] p-6 shadow-xl shadow-black/5">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            Your Cart
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}</span>
          </h2>
          
          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
            {cart.items.map((item: any) => (
              <div key={item.menuItemId} className="flex justify-between text-sm group">
                <div className="flex gap-3">
                  <span className="font-bold text-[#F97316] border border-orange-100 bg-orange-50 px-1.5 py-0.5 rounded-md text-xs h-fit">
                    {item.quantity}x
                  </span>
                  <div>
                    <p className="text-[#111111] font-bold group-hover:text-[#F97316] transition-colors">{item.name}</p>
                    <p className="text-gray-400 font-medium">₹{item.price}</p>
                  </div>
                </div>
                <span className="text-[#111111] font-bold">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Subtotal</span>
              <span className="text-[#111111] font-bold">₹{cart.summary?.subtotal || cart.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Delivery Fee</span>
              <span className="text-[#111111] font-bold">₹{cart.summary?.deliveryFee || cart.deliveryFee}</span>
            </div>
            {(cart.summary?.tax > 0 || cart.tax > 0) && (
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Tax</span>
                  <span className="text-[#111111] font-bold">₹{cart.summary?.tax || cart.tax}</span>
                </div>
            )}
            {(cart.summary?.discount > 0 || cart.discount > 0) && (
                <div className="flex justify-between text-sm text-[#22C55E] font-medium">
                  <span>Coupon {cart.appliedCouponCode ? `(${cart.appliedCouponCode})` : ''}</span>
                  <span className="font-bold">-₹{cart.summary?.discount || cart.discount}</span>
                </div>
            )}
            <div className="flex justify-between font-black text-[#111111] text-xl mt-2 pt-4 border-t border-gray-100">
              <span>Total</span>
              <span>₹{cart.summary?.total || cart.totalAmount}</span>
            </div>
          </div>

          <Link href="/cart" className="w-full bg-[#FFE13C] hover:bg-yellow-400 text-[#111111] h-14 rounded-2xl font-black text-lg flex items-center justify-center transition-colors shadow-[0_0_20px_rgba(255,225,60,0.3)]">
            Checkout
          </Link>
        </div>
      </div>

      {/* Mobile Cart Button */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 p-4 bg-zinc-50/95 backdrop-blur-md border-t border-zinc-200 z-50 flex justify-center pb-safe">
        <Link href="/cart" className="w-full max-w-md bg-[#FFE13C] hover:bg-yellow-400 text-zinc-900 h-14 rounded-2xl font-black text-lg flex items-center justify-between px-6 transition-colors shadow-lg shadow-[#FFE13C]/30">
          <div className="flex items-center gap-2">
            <span className="bg-black/10 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
              {cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
            </span>
            <span>View Cart</span>
          </div>
          <span>₹{cart.summary?.total || cart.totalAmount}</span>
        </Link>
      </div>
    </>
  );
}
