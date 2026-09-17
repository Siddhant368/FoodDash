import Image from "next/image";
import { Star, Clock, MapPin, Search, ChevronLeft, Heart, Share, Info, User, ShoppingCart, ShoppingBag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";
import Cart from "@/models/Cart";
import { getCurrentUser } from "@/lib/auth/session";
import CartSummary from "./CartSummary";
import MenuClient from "./MenuClient";
import { SetLocationButton } from "@/components/SetLocationButton";
import AvailableOffers from "@/components/offers/AvailableOffers";

type Props = {
  params: Promise<{ id: string }>
}

export default async function RestaurantDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return notFound();
  }

  await connectDB();
  
  const restaurant = await Restaurant.findById(id).lean();
  if (!restaurant || !restaurant.isActive) {
    return notFound();
  }

  const categories = await Category.find({ restaurantId: id, isActive: true }).sort({ sortOrder: 1 }).lean();
  const menuItems = await MenuItem.find({ restaurantId: id, isAvailable: true }).lean();
  
  const user = await getCurrentUser();

  let initialCart = null;
  if (user) {
    initialCart = await Cart.findOne({ customerId: user.id, restaurantId: id }).lean();
  }

  const cartItemCount = initialCart ? initialCart.items.reduce((acc: number, item: any) => acc + item.quantity, 0) : 0;

  // Serialize IDs for client components
  const serializedCategories = categories.map(c => ({...c, _id: c._id.toString(), restaurantId: c.restaurantId.toString()}));
  const serializedMenuItems = menuItems.map(m => ({...m, _id: m._id.toString(), restaurantId: m.restaurantId.toString(), categoryId: m.categoryId.toString()}));

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] pb-24 lg:pb-0 scroll-smooth">
      {/* Hero Section containing Navbar and Cover Image */}
      <div className="w-full aspect-[16/10] md:aspect-[16/6] relative rounded-b-[48px] overflow-hidden shadow-xl">
        {/* Background Image */}
        <Image 
          src={restaurant.coverImage || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80"} 
          alt={restaurant.name} 
          fill
          priority
          className="object-cover" 
          sizes="100vw"
        />
        
        {/* Gradients for readability (Dark at top for navbar, dark at bottom for contrast) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/90 via-[#111111]/20 to-[#111111]/90"></div>

        {/* TOP NAVBAR (Matches FoodHub / FOODDASH) */}
        <header className="relative z-50 text-[#FFFFFF] px-4 py-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE13C] text-[#111111]">
                <span className="text-xl font-black">F</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-[#FFE13C]">FoodHub</h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link href="/" className="hover:text-[#FFE13C] transition-colors">Home</Link>
            <Link href="/restaurants" className="hover:text-[#FFE13C] transition-colors">Restaurants</Link>
            <Link href="/orders" className="hover:text-[#FFE13C] transition-colors">Orders</Link>
            <Link href="/favorites" className="hover:text-[#FFE13C] transition-colors">Favorites</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <SetLocationButton />

            {user ? (
              <>
                <Link href="/profile" className="bg-[#222222]/80 backdrop-blur-sm hover:bg-[#333333] text-white p-2 rounded-full transition-colors flex items-center justify-center">
                  <User size={20} />
                </Link>
                <Link href="/cart" className="bg-[#FFE13C] text-[#111111] px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#FFE13C]/20">
                  <ShoppingCart size={18} />
                  <span>{cartItemCount}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="bg-[#222222]/80 backdrop-blur-sm text-[#FFFDF0] p-2 rounded-full hover:bg-[#333333] transition-colors flex items-center justify-center">
                  <User size={20} />
                </Link>
                <Link href="/cart" className="bg-[#FFE13C] text-[#111111] px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#FFE13C]/20">
                  <ShoppingCart size={18} />
                  <span>0</span>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Action Buttons */}
        <div className="absolute bottom-6 right-6 lg:bottom-12 lg:right-12 flex gap-3 z-10">
          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors text-white border border-white/30">
            <Share size={20} />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors text-white border border-white/30">
            <Heart size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-24 relative z-10">
        
        {/* Restaurant Info Summary */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-xl shadow-black/5 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              {restaurant.logo && (
                <div className="relative w-16 h-16 rounded-2xl border-2 border-gray-100 shadow-md bg-white overflow-hidden flex-shrink-0">
                  <Image 
                    src={restaurant.logo} 
                    alt={restaurant.name} 
                    fill 
                    className="object-contain p-1" 
                    sizes="64px" 
                  />
                </div>
              )}
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{restaurant.name}</h1>
              {menuItems.some(i => i.isVeg) && (
                <div className="hidden sm:flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span> Pure Veg
                </div>
              )}
            </div>
            
            <p className="text-gray-500 font-medium mb-5">{restaurant.description || "Traditional cuisine, freshly prepared."}</p>
            
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <Star size={16} className="text-[#F97316] fill-[#F97316]" />
                <span>4.6</span>
                <span className="text-gray-400 font-medium">(1k+ reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <Clock size={16} className="text-[#111111]" />
                <span>25–35 min</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <ShoppingBag size={16} className="text-[#111111]" />
                <span>₹200 for two</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#FAFAF8] border border-gray-100 rounded-2xl p-5 flex gap-8 w-full md:w-auto justify-between md:justify-start">
            <div className="text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
              <p className={`font-black text-lg ${restaurant.isOpen ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{restaurant.isOpen ? "Open Now" : "Closed"}</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Delivery</p>
              <p className="font-black text-lg text-[#111111]">₹40</p>
            </div>
          </div>
        </div>

        {/* Desktop Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Menu */}
          <div className="flex-1 min-w-0">
            <AvailableOffers restaurantId={id} />
            
            <MenuClient 
              categories={serializedCategories} 
              menuItems={serializedMenuItems} 
              restaurantId={id} 
              initialCart={initialCart ? JSON.parse(JSON.stringify(initialCart)) : null} 
              isOpen={restaurant.isOpen} 
            />

            {/* Restaurant Details Below Menu */}
            <div className="mt-16 pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-black mb-6 uppercase">About {restaurant.name}</h2>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex gap-3">
                  <MapPin className="text-[#FFE13C] flex-shrink-0" />
                  <p className="text-gray-600 font-medium">{restaurant.address?.street}, {restaurant.address?.city}, {restaurant.address?.state} {restaurant.address?.pincode}</p>
                </div>
                <div className="flex gap-3">
                  <Clock className="text-[#FFE13C] flex-shrink-0" />
                  <p className="text-gray-600 font-medium">Opening Hours: 10:00 AM - 11:00 PM</p>
                </div>
                <div className="flex gap-3">
                  <Info className="text-[#FFE13C] flex-shrink-0" />
                  <p className="text-gray-600 font-medium">FSSAI License: 12345678901234</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16 pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-black mb-6 uppercase">Ratings & Reviews</h2>
              <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm text-center">
                <div className="flex items-center justify-center gap-2 mb-4 text-[#F97316]">
                  <Star size={32} className="fill-[#F97316]" />
                  <span className="text-4xl font-black text-[#111111]">4.6</span>
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-2">1,204 Reviews</h3>
                <p className="text-gray-500 font-medium max-w-md mx-auto">We are working on bringing you individual customer reviews. Check back later!</p>
              </div>
            </div>
            
          </div>

          {/* Right Column: Sticky Cart Summary */}
          <CartSummary restaurantId={id} />
        </div>

        {/* Related Restaurants */}
        <div className="mt-20 border-t border-gray-200 pt-16">
          <h2 className="text-2xl lg:text-3xl font-black mb-8 uppercase tracking-tight">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
             <Link href="/restaurants" className="group cursor-pointer rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-xl hover:shadow-black/5 transition-all text-center flex flex-col justify-center min-h-[200px]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#111111]">
                  <Search size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Explore More</h3>
                <p className="text-sm text-gray-500 font-medium">Find more restaurants nearby</p>
             </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#111111] text-white pt-16 pb-8 px-4 lg:px-8 mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE13C] text-[#111111]">
                <span className="text-xl font-black">F</span>
              </div>
              <h2 className="text-xl font-black text-[#FFE13C]">FoodHub</h2>
            </div>
            <p className="text-gray-400 font-medium mb-6 max-w-sm">
              Your favorite food, delivered with care. Premium dining experience at your doorstep.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-3 font-medium text-gray-400">
              <li><Link href="#" className="hover:text-[#FFE13C]">About Us</Link></li>
              <li><Link href="#" className="hover:text-[#FFE13C]">Contact</Link></li>
              <li><Link href="#" className="hover:text-[#FFE13C]">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-3 font-medium text-gray-400">
              <li><Link href="#" className="hover:text-[#FFE13C]">Terms & Conditions</Link></li>
              <li><Link href="#" className="hover:text-[#FFE13C]">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-[#FFE13C]">Help & Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-medium text-sm text-gray-500">
          <p>© 2026 FoodHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
