"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, RefreshCw } from "lucide-react";

export default function AddToCartButton({ item, restaurantId, initialQuantity = 0 }: { item: any, restaurantId: string, initialQuantity?: number }) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const updateCart = async (newQuantity: number) => {
    try {
      setLoading(true);
      
      let res;
      if (newQuantity === 0) {
        // Remove item from cart
        res = await fetch(`/api/cart?restaurantId=${restaurantId}&menuItemId=${item._id}`, {
          method: "DELETE",
        });
      } else if (quantity === 0) {
        // Add new item to cart
        res = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            restaurantId,
            menuItemId: item._id,
            quantity: newQuantity,
          }),
        });
      } else {
        // Update quantity
        res = await fetch("/api/cart", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            restaurantId,
            menuItemId: item._id,
            quantity: newQuantity,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        if (data.code === "DIFFERENT_RESTAURANT") {
          const confirmClear = window.confirm(data.message || "Your cart contains items from another restaurant. Clear Cart & Add New Item?");
          if (confirmClear) {
            // Try again with clearCart = true
            setLoading(true);
            const clearRes = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                restaurantId,
                menuItemId: item._id,
                quantity: newQuantity,
                clearCart: true,
              }),
            });
            const clearData = await clearRes.json();
            if (!clearRes.ok) {
              alert(clearData.message || "Failed to update cart.");
              return false;
            } else {
              window.dispatchEvent(new Event("cart-updated"));
              setQuantity(newQuantity);
              return true;
            }
          }
          return false;
        }
        
        alert(data.message || "Failed to update cart.");
        return false;
      } else {
        window.dispatchEvent(new Event("cart-updated"));
        setQuantity(newQuantity);
        return true;
      }
    } catch (err) {
      alert("Something went wrong");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => updateCart(quantity + 1);
  const handleDecrement = () => updateCart(Math.max(0, quantity - 1));

  if (!item.isAvailable) {
    return <span className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg">Unavailable</span>;
  }

  if (quantity > 0) {
    return (
      <div className="bg-white text-[#111111] font-bold text-sm px-2 py-1.5 rounded-lg shadow-lg border border-gray-100 flex items-center justify-between min-w-[90px]">
        <button onClick={handleDecrement} disabled={loading} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50 text-red-500">
          <Minus size={14} />
        </button>
        <span className="w-4 text-center">{loading ? <RefreshCw size={14} className="animate-spin mx-auto" /> : quantity}</span>
        <button onClick={handleIncrement} disabled={loading} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50 text-green-600">
          <Plus size={14} />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => updateCart(1)}
      disabled={loading}
      className="bg-white text-green-600 font-black text-sm px-4 py-1.5 rounded-lg shadow-lg hover:bg-gray-50 transition-colors border border-gray-100 disabled:opacity-50 flex items-center justify-center min-w-[90px] gap-1 uppercase"
    >
      {loading ? <RefreshCw size={14} className="animate-spin" /> : <><Plus size={16} /> Add</>}
    </button>
  );
}
