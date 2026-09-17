"use client";

import { useEffect, useState } from "react";
import { MapPin, Wallet, CreditCard, CheckCircle2, RefreshCw, AlertCircle, ShoppingCart, User, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocation } from "@/components/LocationContext";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  
  const { location, setIsModalOpen } = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    customerNote: "",
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNote = localStorage.getItem('customerNote');
      if (savedNote) {
        setFormData(prev => ({ ...prev, customerNote: savedNote }));
      }
    }
  }, []);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart");
        const data = await res.json();
        if (res.ok && data.success && data.cart) {
          setCart(data.cart);
          setSummary(data.summary);
        } else {
          router.push("/cart"); // redirect back if cart is empty
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const placeOrder = async () => {
    if (!cart?.restaurantId) return;

    if (!formData.name || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
      setError("Please fill all required delivery details.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: cart.restaurantId,
          items: cart.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
          paymentMethod,
          deliveryAddress: {
            name: formData.name,
            phone: formData.phone,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            latitude: location?.latitude,
            longitude: location?.longitude,
          },
          customerNote: formData.customerNote,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('customerNote');
        }
        router.push(`/orders/success?orderId=${data.data.orderId}`);
      } else {
        setError(data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
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
          <Link href="/cart" className="relative cursor-pointer flex items-center justify-center text-[#FFE13C]">
            <ShoppingCart size={20} />
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#FFE13C] rounded-full text-[#111111] text-[10px] font-black flex items-center justify-center border-2 border-[#151515]">
              {cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
            </div>
          </Link>
          <Link href="/profile" className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center hover:bg-[#333] transition-colors"><User size={18} /></Link>
        </div>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <RefreshCw className="animate-spin text-[#FFE13C]" size={32} />
      </div>
    );
  }

  if (!cart) {
    return null; // redirecting
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] pb-24 lg:pb-0">
      {renderNavbar()}

      {/* Dark Hero Section (similar to Cart page) */}
      <div className="bg-[#151515] pt-10 pb-24 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight">Checkout</h1>
          <p className="text-gray-400 font-medium">Complete your order details below.</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 -mt-16 pb-16">
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2 border border-red-200">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
              <h2 className="text-xl font-black mb-6">Delivery Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-[#FFE13C] focus:bg-white transition-colors outline-none font-medium text-sm text-[#111111]" />
                  <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-[#FFE13C] focus:bg-white transition-colors outline-none font-medium text-sm text-[#111111]" />
                </div>
                
                <input required name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="Address Line 1" className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-[#FFE13C] focus:bg-white transition-colors outline-none font-medium text-sm text-[#111111]" />
                <input name="addressLine2" value={formData.addressLine2} onChange={handleChange} placeholder="Address Line 2 (Optional)" className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-[#FFE13C] focus:bg-white transition-colors outline-none font-medium text-sm text-[#111111]" />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input required name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-[#FFE13C] focus:bg-white transition-colors outline-none font-medium text-sm text-[#111111]" />
                  <input required name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-[#FFE13C] focus:bg-white transition-colors outline-none font-medium text-sm text-[#111111]" />
                  <input required name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" className="col-span-2 md:col-span-1 w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-[#FFE13C] focus:bg-white transition-colors outline-none font-medium text-sm text-[#111111]" />
                </div>

                <textarea name="customerNote" value={formData.customerNote} onChange={handleChange} placeholder="Delivery Instructions (Optional)" rows={2} className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-[#FFE13C] focus:bg-white transition-colors outline-none resize-none font-medium text-sm text-[#111111]"></textarea>
              </div>

              {!location && (
                <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-amber-600" />
                    <span className="text-amber-900 font-medium">Please select your delivery location.</span>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    type="button"
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                  >
                    Set Location
                  </button>
                </div>
              )}
              {location && (
                <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-green-600" />
                    <span className="text-green-900 font-medium">Delivery location selected.</span>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    type="button"
                    className="bg-green-100 hover:bg-green-200 text-green-900 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                  >
                    Change
                  </button>
                </div>
              )}
            </section>

            <section className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
              <h2 className="text-xl font-black mb-6">Payment Method</h2>
              <div className="space-y-3">
                <div 
                  className={`border rounded-2xl p-4 flex gap-4 cursor-pointer transition-colors items-center relative ${paymentMethod === 'ONLINE' ? 'border-gray-200 bg-gray-50 opacity-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <CreditCard size={24} className="text-gray-500"/>
                  <div className="flex-1">
                    <span className="font-bold block text-[#111111]">Online Payment (Card/UPI)</span>
                    <span className="text-xs text-orange-600 font-bold bg-orange-100 px-2 py-0.5 rounded">Coming Soon</span>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-2xl p-4 flex gap-4 cursor-pointer transition-colors items-center relative ${paymentMethod === 'COD' ? 'border-[#FFE13C] bg-[#FFE13C]/10' : 'border-gray-200 bg-white hover:border-[#FFE13C]'}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  {paymentMethod === 'COD' && <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[#FFD83D]"><CheckCircle2 size={20} className="fill-[#FFE13C] text-[#111111]" /></div>}
                  <Wallet size={24} className={paymentMethod === 'COD' ? "text-yellow-600" : "text-gray-500"}/>
                  <span className={`font-bold ${paymentMethod === 'COD' ? "text-yellow-800" : "text-[#111111]"}`}>Cash on Delivery</span>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-gray-100 rounded-[24px] p-6 lg:p-8 shadow-sm">
              <h2 className="text-xl font-black mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item: any, idx: number) => (
                  <div key={item.menuItemId} className="flex justify-between text-sm font-medium">
                    <span className="text-gray-600">{item.quantity}x {item.name}</span>
                    <span className="text-[#111111]">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3.5 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-[#111111]">₹{summary?.subtotal}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-[#111111]">{summary?.deliveryFee === 0 ? 'Free' : `₹${summary?.deliveryFee}`}</span>
                </div>
                {summary?.tax > 0 && (
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-[#111111]">₹{summary?.tax}</span>
                  </div>
                )}
                {summary?.discount > 0 && (
                  <div className="flex justify-between font-medium">
                    <span className="text-[#22C55E]">Discount</span>
                    <span className="text-[#22C55E]">-₹{summary?.discount}</span>
                  </div>
                )}
                
                <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-gray-500 text-lg">Total</span>
                    <span className="text-2xl font-black text-[#111111]">₹{summary?.total}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={placeOrder}
                disabled={submitting}
                className="hidden lg:flex w-full mt-8 bg-[#FFE13C] hover:bg-yellow-400 text-[#111111] h-14 rounded-xl font-black text-lg items-center justify-center transition-colors disabled:opacity-50 shadow-lg shadow-[#FFE13C]/30"
              >
                {submitting ? <RefreshCw className="animate-spin" size={24} /> : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Sticky Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 p-4 pb-safe shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={placeOrder}
          disabled={submitting}
          className="w-full bg-[#FFE13C] text-[#111111] h-14 rounded-xl font-black text-lg flex items-center justify-between px-6 hover:bg-[#FFD600] transition-colors disabled:opacity-50"
        >
          <div className="flex flex-col items-start leading-tight">
            <span>₹{summary?.total} Total</span>
          </div>
          <span>{submitting ? <RefreshCw className="animate-spin" size={20} /> : "Place Order →"}</span>
        </button>
      </div>
    </div>
  );
}