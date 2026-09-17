"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag, 
  Bike, 
  Settings, 
  LogOut,
  Users,
  Grid,
  BarChart3,
  Store
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success && json.user) {
          setUserName(json.user.name);
        }
      } catch (err) {
        console.error("Failed to load session", err);
      }
    };
    fetchSession();
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
    { icon: UtensilsCrossed, label: "Menu", href: "/admin/menu" },
    { icon: Grid, label: "Categories", href: "/admin/categories" },
    { icon: ShoppingBag, label: "Offers & Coupons", href: "/admin/offers" },
    { icon: Bike, label: "Delivery", href: "/admin/delivery" },
    { icon: Users, label: "Customers", href: "/admin/customers" }, // Note: Customers page might not exist yet, but prompt asks for the link
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <aside className="w-64 bg-[#111111] text-gray-300 flex flex-col h-screen fixed top-0 left-0 z-50">
      <div className="h-20 flex items-center px-8 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFE13C] text-[#111111] rounded-xl flex items-center justify-center shadow-md">
            <Store size={22} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight text-white">FoodHub</span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 px-4">Menu</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Exact match for dashboard, prefix match for others to keep them highlighted on subpages
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive 
                  ? "bg-[#FFE13C] text-[#111111] shadow-lg shadow-[#FFE13C]/10" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 bg-[#0A0A0A]">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
           <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white border border-gray-700">
             <span className="font-bold">{userName.charAt(0).toUpperCase()}</span>
           </div>
           <div>
             <p className="text-sm font-bold text-white leading-tight">{userName}</p>
             <p className="text-[10px] uppercase font-bold tracking-wider text-[#FFE13C]">Restaurant Admin</p>
           </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut size={18} strokeWidth={2} />
          Logout
        </button>
      </div>
    </aside>
  );
}
