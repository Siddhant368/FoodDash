"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ChevronLeft, MapPin, Search, User, ShoppingCart,
  Plus, Trash2, Minus, RefreshCw, AlertCircle, ShoppingBag, Store, Clock, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [customerNote, setCustomerNote] = useState("");
  const router = useRouter();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (res.ok && data.success && data.cart) {
        setCart({ ...data.cart, summary: data.summary });
      } else {
        setCart(null);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNote = localStorage.getItem('customerNote');
      if (savedNote) {
        setCustomerNote(savedNote);
      }
    }
  }, []);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const note = e.target.value;
    setCustomerNote(note);
    if (typeof window !== 'undefined') {
      localStorage.setItem('customerNote', note);
    }
  };

  const updateQuantity = async (menuItemId: string, newQuantity: number) => {
    if (!cart?.restaurantId) return;
    
    // Optimistic Update
    const originalCart = { ...cart };
    
    // update state
    const updatedItems = cart.items.map((item: any) => 
      item.menuItemId === menuItemId 
        ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity } 
        : item
    );
    
    // simple subtotal recalc for optimistic UI
    const subtotal = updatedItems.reduce((acc: number, item: any) => acc + item.subtotal, 0);
    const tax = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const total = subtotal + tax + deliveryFee;

    setCart({
      ...cart,
      items: updatedItems,
      summary: {
        ...cart.summary,
        subtotal,
        tax,
        deliveryFee,
        total
      }
    });

    try {
      setActionLoading(menuItemId);
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: cart.restaurantId,
          menuItemId,
          quantity: newQuantity,
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Revert
        setCart(originalCart);
        alert(data.message || "Failed to update quantity");
      } else {
        // Use server data to be accurate
        fetchCart();
      }
    } catch (err) {
      console.error(err);
      setCart(originalCart);
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const removeItem = async (menuItemId: string) => {
    if (!cart?.restaurantId) return;
    try {
      setActionLoading(menuItemId);
      const res = await fetch(`/api/cart?restaurantId=${cart.restaurantId}&menuItemId=${menuItemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchCart();
      } else {
        alert(data.message || "Failed to remove item");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim() || !cart?.restaurantId) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/offers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), restaurantId: cart.restaurantId })
      });
      const json = await res.json();
      if (json.success) {
        fetchCart();
      } else {
        alert(json.message);
      }
    } catch (e) {
      alert("Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    if (!cart?.restaurantId) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/offers/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: cart.restaurantId })
      });
      const json = await res.json();
      if (json.success) {
        setCouponCode("");
        fetchCart();
      } else {
        alert(json.message);
      }
    } catch (e) {
      alert("Failed to remove coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    router.push("/checkout");
  };

  const renderNavbar = () => (
    <header className="bg-[#151515] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFE13C] rounded-lg flex items-center justify-center font-black text-lg text-[#111111]">F</div>
          <span className="font-black text-xl hidden sm:block">FoodHub</span>
        </Link>
        <div className="hidden md:flex flex-1 max-w-md mx-8 items-center bg-[#252525] rounded-full px-4 py-2 border border-[#333] focus-within:border-gray-400 transition-colors">
          <Search size={18} className="text-gray-400 mr-2" />
          <input type="text" placeholder="Search..." className="bg-transparent outline-none w-full text-sm font-medium text-white placeholder-gray-500" />
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/restaurants" className="font-bold text-sm hidden sm:block text-gray-300 hover:text-white transition-colors">Restaurants</Link>
          <Link href="/orders" className="font-bold text-sm hidden sm:block text-gray-300 hover:text-white transition-colors">Orders</Link>
          <Link href="/favorites" className="font-bold text-sm hidden sm:block text-gray-300 hover:text-white transition-colors">Favorites</Link>
          <div className="relative cursor-pointer flex items-center justify-center text-[#FFE13C]">
            <ShoppingCart size={20} />
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#FFE13C] rounded-full text-[#111111] text-[10px] font-black flex items-center justify-center border-2 border-[#151515]">
              {cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
            </div>
          </div>
          <Link href="/profile" className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center hover:bg-[#333] transition-colors"><User size={18} /></Link>
        </div>
      </div>
    </header>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-[#111111] mb-2">Unable to load your cart</h2>
        <p className="text-gray-500 mb-6">Something went wrong while fetching your cart details.</p>
        <button onClick={fetchCart} className="bg-[#111111] text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        {renderNavbar()}
        <div className="bg-[#151515] pt-10 pb-24 px-4">
          <div className="max-w-6xl mx-auto h-16"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 -mt-16 pb-32 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-28 bg-white/50 rounded-3xl"></div>
              <div className="h-64 bg-white/50 rounded-3xl"></div>
            </div>
            <div className="h-96 bg-white/50 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#111111]">
        {renderNavbar()}
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 mb-8">
            <ShoppingCart size={64} className="text-gray-200" />
          </div>
          <h1 className="text-3xl font-black mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything yet.</p>
          <Link href="/restaurants" className="bg-[#FFE13C] text-[#111111] font-black px-8 py-4 rounded-xl hover:-translate-y-1 transition-transform shadow-lg shadow-[#FFE13C]/20">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] pb-32 lg:pb-12">
      {renderNavbar()}

      {/* Dark Hero Section */}
      <div className="bg-[#151515] pt-10 pb-24 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight">Your Cart</h1>
          <p className="text-gray-400 font-medium">Review your items and complete your order.</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Restaurant + Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Restaurant Info */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 flex-shrink-0">
                  <Store className="text-gray-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#111111]">{cart.restaurant?.name || "Restaurant"}</h2>
                  <div className="flex items-center text-gray-500 text-sm font-medium gap-3 mt-1">
                    <span className="line-clamp-1">
                      {cart.restaurant?.address 
                        ? [cart.restaurant.address.street, cart.restaurant.address.city].filter(Boolean).join(', ') || "Location unavailable"
                        : "Location unavailable"
                      }
                    </span>
                    {cart.restaurant?.isOpen ? (
                      <span className="text-[#22C55E] font-bold">Open</span>
                    ) : (
                      <span className="text-[#EF4444] font-bold">Closed</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <Link href={`/restaurants/${cart.restaurantId}`} className="block text-center sm:inline-block text-sm font-bold bg-[#FAFAF8] text-[#111111] px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                  Add more items
                </Link>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="space-y-6">
                {cart.items.map((item: any, idx: number) => (
                  <div key={item.menuItemId} className={`flex gap-4 lg:gap-6 ${idx !== cart.items.length -1 ? 'pb-6 border-b border-gray-100' : ''}`}>
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="m-auto mt-8 text-gray-300" />
                      )}
                      {/* Veg/Non-veg indicator */}
                      <div className="absolute top-2 left-2 bg-white/90 p-1 rounded shadow-sm backdrop-blur-sm">
                        <div className={`w-3 h-3 rounded-sm border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-lg text-[#111111] leading-tight mb-1">{item.name}</h4>
                        {item.description && <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>}
                        <div className="font-bold text-[#111111] mt-1">₹{item.price}</div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-[#FAFAF8] border border-gray-200 rounded-xl overflow-hidden h-9 shadow-sm">
                          <button 
                            disabled={actionLoading === item.menuItemId || item.quantity <= 1}
                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                            className="w-9 h-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 text-gray-600"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                          <button 
                            disabled={actionLoading === item.menuItemId || item.quantity >= 50}
                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            className="w-9 h-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 text-[#111111]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-black text-lg text-[#111111]">₹{item.subtotal}</span>
                          <button 
                            disabled={actionLoading === item.menuItemId}
                            onClick={() => removeItem(item.menuItemId)}
                            className="text-gray-400 hover:text-[#EF4444] hover:bg-red-50 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Link href={`/restaurants/${cart.restaurantId}`} className="text-[#111111] font-bold text-sm flex items-center gap-1 hover:text-yellow-600 transition-colors inline-flex">
                    <Plus size={16}/> Add more items
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Note */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <h3 className="font-black text-lg mb-1 text-[#111111]">Add a note for the restaurant</h3>
              <p className="text-sm text-gray-500 mb-4">Any special instructions?</p>
              <textarea 
                value={customerNote}
                onChange={handleNoteChange}
                placeholder="e.g., Please make it extra spicy..." 
                className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 outline-none focus:border-[#FFE13C] focus:bg-white transition-colors resize-none font-medium text-sm text-[#111111]"
                rows={2}
              ></textarea>
            </div>

          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black mb-6 text-[#111111]">Order Summary</h3>
              
              {/* Apply Coupon */}
              <div className="mb-6">
                <h4 className="font-bold text-[#111111] mb-2 text-sm">Apply Coupon</h4>
                {cart.appliedOffer ? (
                  <div className="bg-white border-2 border-[#FFE13C] rounded-2xl p-4 shadow-sm relative overflow-hidden z-10">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFE13C]/20 rounded-bl-full -z-10"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="text-green-500" size={18} />
                      <span className="font-black text-green-600 text-sm uppercase tracking-wide">Coupon Applied</span>
                    </div>
                    <h5 className="font-black text-xl text-[#111111] leading-tight mb-2">{cart.appliedOffer.title}</h5>
                    <div className="flex flex-col gap-1 mb-4">
                      <div className="font-mono bg-gray-100 border border-gray-200 text-[#111111] px-2 py-0.5 rounded text-sm font-bold w-fit">
                        {cart.appliedOffer.code}
                      </div>
                      <div className="text-sm font-bold text-[#111111] mt-1">
                        {cart.appliedOffer.discountType === "PERCENTAGE" && `${cart.appliedOffer.discountValue}% OFF`}
                        {cart.appliedOffer.discountType === "FLAT" && `₹${cart.appliedOffer.discountValue} OFF`}
                        {cart.appliedOffer.discountType === "FREE_DELIVERY" && "FREE DELIVERY"}
                      </div>
                      {cart.appliedOffer.maxDiscount > 0 && (
                        <p className="text-xs text-gray-500 font-medium">Maximum discount ₹{cart.appliedOffer.maxDiscount}</p>
                      )}
                      {cart.appliedOffer.minOrderAmount > 0 && (
                        <p className="text-xs text-gray-500 font-medium">Minimum order ₹{cart.appliedOffer.minOrderAmount}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
                      <span className="font-black text-[#22C55E]">You saved ₹{cart.summary.discount}</span>
                      <button onClick={removeCoupon} disabled={applyingCoupon} className="text-red-500 hover:text-red-600 text-sm font-bold disabled:opacity-50">
                        {applyingCoupon ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code" 
                      className="flex-1 min-w-0 bg-[#FAFAF8] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#111111] uppercase font-mono text-sm text-[#111111]"
                    />
                    <button 
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || applyingCoupon}
                      className="bg-[#111111] text-white px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50 whitespace-nowrap flex-shrink-0"
                    >
                      {applyingCoupon ? "Applying..." : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6 text-sm font-medium">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total</span>
                  <span className="text-[#111111] font-bold">₹{cart.summary?.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-[#111111] font-bold">{cart.summary?.deliveryFee === 0 ? 'Free' : `₹${cart.summary?.deliveryFee}`}</span>
                </div>
                {cart.summary?.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & Charges</span>
                    <span className="text-[#111111] font-bold">₹{cart.summary?.tax}</span>
                  </div>
                )}
                {cart.summary?.discount > 0 && (
                  <div className="flex justify-between text-[#22C55E]">
                    <span>Coupon ({cart.appliedCouponCode})</span>
                    <span className="font-bold">-₹{cart.summary?.discount}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-dashed border-gray-200 pt-6 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-black text-gray-500 text-lg">Total</span>
                  <span className="text-3xl font-black text-[#111111]">₹{cart.summary?.total}</span>
                </div>
              </div>

              {/* Desktop Checkout Button */}
              <button 
                onClick={handleProceedToCheckout}
                disabled={!cart.restaurant?.isOpen}
                className="hidden lg:flex w-full bg-[#FFE13C] hover:bg-[#FFD600] text-[#111111] h-14 rounded-xl font-black text-lg items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {!cart.restaurant?.isOpen ? "Restaurant Closed" : "Proceed to Checkout →"}
              </button>
              
              <div className="hidden lg:flex items-center justify-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
                <span>🔒 Safe & secure checkout</span>
              </div>

              {/* Info Cards */}
              <div className="bg-[#FAFAF8] rounded-xl p-4 border border-gray-100 space-y-3">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <Clock size={16} className="text-gray-400"/>
                  <span>Estimated delivery: 25–35 min</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <MapPin size={16} className="text-gray-400"/>
                  <span className="line-clamp-1">
                    {cart.restaurant?.address 
                      ? [cart.restaurant.address.street, cart.restaurant.address.city].filter(Boolean).join(', ') 
                      : "Restaurant location"}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Mobile Sticky Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 p-4 pb-safe shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleProceedToCheckout}
          disabled={!cart.restaurant?.isOpen}
          className="w-full bg-[#FFE13C] text-[#111111] h-14 rounded-xl font-black text-lg flex items-center justify-between px-6 hover:bg-[#FFD600] transition-colors disabled:opacity-50"
        >
          <div className="flex flex-col items-start leading-tight">
            <span>₹{cart.summary?.total} Total</span>
          </div>
          <span>{!cart.restaurant?.isOpen ? "Closed" : "Proceed to Checkout →"}</span>
        </button>
      </div>
    </div>
  );
}