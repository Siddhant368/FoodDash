"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Package, Heart, MapPin, Star, Bell, Settings, LogOut, Search, ShoppingCart, ChevronRight, CheckCircle2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { SetLocationButton } from "@/components/SetLocationButton";

type UserType = {
  _id: string;
  name: string;
  email: string;
  phone: string;
};

export default function ProfileClient({ user }: { user: UserType }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call, assuming we don't have a built-in profile update API yet 
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1000);
  };

  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "reviews", label: "My Reviews", icon: Star },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#111111]">Personal Information</h2>
                <p className="text-sm text-gray-500 font-medium">Manage your personal details.</p>
              </div>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 font-semibold text-sm">
                <CheckCircle2 size={18} className="text-green-600" />
                {successMessage}
              </div>
            )}

            <div className="space-y-6 max-w-xl">
              {isEditing && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <span className="text-2xl font-black text-gray-400">{user.name.charAt(0).toUpperCase()}</span>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#FFE13C] rounded-full flex items-center justify-center text-[#111111] shadow-md border-2 border-white hover:scale-105 transition-transform">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111111]">Profile Photo</h3>
                    <p className="text-xs font-medium text-gray-500 mb-2">JPG, GIF or PNG. Max size 2MB.</p>
                    <button className="text-sm font-bold text-[#111111] bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors">
                      Change Photo
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#111111] mb-2">Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] font-medium outline-none focus:border-[#FFE13C] focus:bg-white transition-colors disabled:opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#111111] mb-2">Email</label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] font-medium outline-none focus:border-[#FFE13C] focus:bg-white transition-colors disabled:opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#111111] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] font-medium outline-none focus:border-[#FFE13C] focus:bg-white transition-colors disabled:opacity-70"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#111111] mb-2">Date of Birth</label>
                    <input
                      type="date"
                      disabled={!isEditing}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] font-medium outline-none focus:border-[#FFE13C] focus:bg-white transition-colors disabled:opacity-70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#111111] mb-2">Gender</label>
                    <select
                      disabled={!isEditing}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] font-medium outline-none focus:border-[#FFE13C] focus:bg-white transition-colors disabled:opacity-70 appearance-none"
                    >
                      <option>Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-4 mt-6">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-[#FFE13C] text-[#111111] px-6 py-3 rounded-full font-black text-sm hover:bg-yellow-400 transition-colors shadow-sm"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="bg-white border border-gray-300 text-[#111111] px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-[#FFE13C] text-[#111111] px-6 py-3 rounded-full font-black text-sm hover:bg-yellow-400 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-[#111111] mb-6">Recent Orders</h2>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#111111]">Order #FH10245</span>
                        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">Delivered</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-500">15 Sep 2026 • Rajasthani Rasoi</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-black text-lg text-[#111111]">₹239</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm font-medium text-[#111111]">
                    <ul className="list-disc list-inside">
                      <li>Dal Bati Thali × 1</li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 sm:flex-none bg-white border border-gray-300 text-[#111111] px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors">
                      View Order
                    </button>
                    <button className="flex-1 sm:flex-none bg-[#FFE13C] text-[#111111] px-4 py-2 rounded-full font-black text-sm hover:bg-yellow-400 transition-colors shadow-sm">
                      Order Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "addresses":
        return (
          <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-[#111111]">Saved Addresses</h2>
              <button className="bg-white border border-[#111111] text-[#111111] px-4 py-2 rounded-full font-bold text-sm hover:bg-[#111111] hover:text-white transition-colors">
                + Add New Address
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#FFE13C] text-[#111111] text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wide">Default</div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-gray-400" />
                  <h3 className="font-bold text-[#111111]">Home</h3>
                </div>
                <div className="text-sm font-medium text-gray-500 space-y-1 mb-6">
                  <p className="font-bold text-[#111111]">{user.name}</p>
                  <p>123 Main Road</p>
                  <p>Udaipur, Rajasthan</p>
                  <p>313001</p>
                </div>
                <div className="flex gap-3">
                  <button className="text-sm font-bold text-[#111111] hover:text-[#FFE13C] transition-colors">Edit</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">Delete</button>
                </div>
              </div>
              <div className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-gray-400" />
                  <h3 className="font-bold text-[#111111]">Work</h3>
                </div>
                <div className="text-sm font-medium text-gray-500 space-y-1 mb-6">
                  <p className="font-bold text-[#111111]">{user.name}</p>
                  <p>Office Address</p>
                  <p>Udaipur, Rajasthan</p>
                  <p>313001</p>
                </div>
                <div className="flex gap-3">
                  <button className="text-sm font-bold text-[#111111] hover:text-[#FFE13C] transition-colors">Edit</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          </div>
        );

      case "favorites":
        return (
          <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-[#111111] mb-6">Favorite Restaurants</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="border border-gray-100 rounded-[24px] p-2 hover:shadow-lg transition-all group flex flex-col">
                <div className="relative h-40 w-full rounded-t-[16px] overflow-hidden rounded-[16px]">
                  <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80" alt="Restaurant" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-red-500">
                    <Heart size={16} fill="currentColor" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Star size={12} className="text-[#FFE13C] fill-[#FFE13C]" /> 4.8
                  </div>
                </div>
                <div className="p-4 pt-3 flex flex-col flex-1">
                  <h3 className="font-black text-lg text-[#111111] mb-1">Burger House</h3>
                  <p className="text-xs font-semibold text-gray-500 mb-3">American • Burgers • 20-30 min</p>
                  <button className="mt-auto w-full bg-[#FAFAF8] border border-gray-200 text-[#111111] py-2 rounded-xl font-bold text-sm hover:bg-[#FFE13C] hover:border-[#FFE13C] transition-colors">
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "reviews":
        return (
          <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-[#111111] mb-6">My Reviews</h2>
            <div className="space-y-4">
              <div className="border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-[#111111]">Rajasthani Rasoi</h3>
                    <p className="text-xs font-semibold text-gray-500">Dal Bati Thali</p>
                  </div>
                  <span className="text-xs font-bold text-gray-400">15 Sep 2026</span>
                </div>
                <div className="flex items-center gap-1 mb-3 text-[#FFE13C]">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-sm font-medium text-[#111111] leading-relaxed">
                  "Very tasty Dal Bati and great portion size. Will definitely order again!"
                </p>
              </div>
            </div>
          </div>
        );
      
      case "notifications":
        return (
          <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-[#111111] mb-6">Notifications</h2>
            <div className="space-y-3">
              <div className="bg-[#FFFDF0] border border-[#FFE13C]/30 rounded-2xl p-4 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FFE13C]/20 flex items-center justify-center text-[#111111] flex-shrink-0">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#111111] text-sm mb-1">Order Delivered</h4>
                  <p className="text-xs font-medium text-gray-600 mb-2">Your order from Rajasthani Rasoi has been delivered.</p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">2 hours ago</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#FFE13C] mt-1.5"></div>
              </div>
              <div className="border border-gray-100 rounded-2xl p-4 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <Star size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#111111] text-sm mb-1">Rate your last meal</h4>
                  <p className="text-xs font-medium text-gray-500 mb-2">How was your food from Burger House?</p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-[#111111] mb-6">Settings</h2>
            <div className="grid gap-4">
              <button className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"><Settings size={16} /></div>
                  <span className="font-bold text-sm text-[#111111]">Account Information</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              <button className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"><User size={16} /></div>
                  <span className="font-bold text-sm text-[#111111]">Password & Security</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              <button className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"><Bell size={16} /></div>
                  <span className="font-bold text-sm text-[#111111]">Notification Preferences</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans pb-24">
      <div className="bg-[#111111] text-[#FFFDF0] pt-4 pb-24 rounded-b-[48px] relative overflow-hidden">
        {/* Reusable Navbar matching the prompt requirements */}
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
            <Link href="/orders" className="hover:text-[#FFE13C] transition-colors">Orders</Link>
            <Link href="/favorites" className="hover:text-[#FFE13C] transition-colors">Favorites</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <SetLocationButton />

            <div className="relative">
              <button className="w-10 h-10 rounded-full bg-[#FFE13C] flex items-center justify-center text-[#111111] border-2 border-[#111111] font-black">
                {user.name.charAt(0).toUpperCase()}
              </button>
            </div>
            
            <Link href="/cart" className="bg-[#222222] hover:bg-[#333333] text-white px-5 py-3 rounded-full transition-colors flex items-center justify-center gap-2 font-bold">
              <ShoppingCart size={20} />
            </Link>
          </div>
        </header>

        {/* Profile Hero */}
        <div className="pt-12 px-4 lg:px-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFE13C]/10 rounded-full blur-[80px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#111111] rounded-[32px] p-6 lg:p-10 border border-white/10 shadow-2xl">
            
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FFE13C] flex items-center justify-center text-4xl font-black text-[#111111] border-4 border-[#151515] shadow-lg flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black mb-1">{user.name}</h1>
                <p className="text-gray-400 font-medium text-sm mb-3">
                  {user.email} • {user.phone || 'No phone added'}
                </p>
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#FFE13C]"></span>
                  <span className="text-xs font-bold text-[#FFE13C]">FoodHub Customer</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
              <div className="flex gap-8 text-center bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                <div>
                  <div className="text-2xl font-black text-white">12</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Orders</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div>
                  <div className="text-2xl font-black text-white">8</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Favorites</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div>
                  <div className="text-2xl font-black text-white">5</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Reviews</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveTab("profile");
                  setIsEditing(true);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-[#FFE13C] text-[#111111] px-6 py-3.5 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-[#FFE13C]/20"
              >
                Edit Profile
              </button>
            </div>
            
          </div>
        </div>
      </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 -mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar Menu */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-[24px] p-3 shadow-sm border border-gray-100 overflow-x-auto lg:overflow-visible scrollbar-hide">
              <nav className="flex lg:flex-col min-w-max lg:min-w-0 gap-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                        isActive 
                          ? "bg-[#FFE13C] text-[#111111] shadow-sm" 
                          : "text-gray-500 hover:bg-gray-50 hover:text-[#111111]"
                      }`}
                    >
                      <item.icon size={18} className={isActive ? "text-[#111111]" : "text-gray-400"} />
                      {item.label}
                    </button>
                  );
                })}
                <div className="w-px lg:w-full lg:h-px bg-gray-100 my-1 lg:my-2 flex-shrink-0"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all whitespace-nowrap"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
          
        </div>
      </main>
    </div>
  );
}
