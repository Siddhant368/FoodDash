"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, ChevronDown, Store, LogOut, Settings, MessageSquare, Menu as MenuIcon } from "lucide-react";

export default function AdminTopbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success) {
          setSession(json);
        }
      } catch (err) {
        console.error("Failed to load session", err);
      }
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const userName = session?.user?.name || "Loading...";
  const role = session?.user?.role || "Staff";
  const restaurantName = session?.restaurant?.name || "FoodHub Restaurant";
  const isOpen = session?.restaurant?.isOpen;

  return (
    <header className="h-20 bg-white border-b border-[#111111]/5 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-500 hover:text-[#111111]">
          <MenuIcon size={24} />
        </button>
        <div className="relative w-full max-w-sm hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search orders, menu items..." 
            className="w-full h-11 bg-[#FAFAF8] border border-gray-200 rounded-full pl-12 pr-4 text-sm font-medium text-[#111111] focus:outline-none focus:border-[#FFE13C] focus:ring-4 focus:ring-[#FFE13C]/20 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {session?.restaurant !== undefined && (
          <div className="hidden sm:flex items-center gap-2 bg-[#FAFAF8] px-3 py-1.5 rounded-full border border-gray-200">
            <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-bold ${isOpen ? 'text-green-700' : 'text-red-700'}`}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        )}

        <Link href="/admin/messages" className="relative p-2.5 text-gray-600 hover:text-[#111111] hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
          <MessageSquare size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
        </Link>
        <button className="relative p-2.5 text-gray-600 hover:text-[#111111] hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center text-[#FFE13C] shadow-sm overflow-hidden">
               {session?.restaurant?.logo ? (
                 <img src={session.restaurant.logo} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                 <Store size={20} strokeWidth={2.5} />
               )}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-bold text-[#111111] leading-tight">{userName}</p>
              <p className="text-xs text-gray-500 font-medium">{restaurantName}</p>
            </div>
            <ChevronDown size={16} className={`text-gray-400 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-50 mb-2 md:hidden">
                <p className="text-sm font-bold text-[#111111]">{userName}</p>
                <p className="text-xs text-gray-500">{restaurantName}</p>
              </div>
              <button 
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/admin/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-gray-50 transition-colors"
              >
                <Settings size={16} />
                Restaurant Settings
              </button>
              <div className="h-px bg-gray-100 my-2"></div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
