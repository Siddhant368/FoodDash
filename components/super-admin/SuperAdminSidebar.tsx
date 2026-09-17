"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  CreditCard, 
  CalendarCheck, 
  TrendingUp, 
  Settings, 
  LogOut,
  ShoppingBag,
  UserCircle,
  Bike,
  Bell
} from "lucide-react";

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/super-admin" },
    { icon: Store, label: "Restaurants", href: "/super-admin/restaurants" },
    { icon: ShoppingBag, label: "Orders", href: "/super-admin/orders" },
    { icon: Users, label: "Users", href: "/super-admin/users" },
    { icon: UserCircle, label: "Staff", href: "/super-admin/staff" },
    { icon: Bike, label: "Delivery Partners", href: "/super-admin/delivery-partners" },
    { icon: CreditCard, label: "Plans", href: "/super-admin/plans" },
    { icon: CalendarCheck, label: "Subscriptions", href: "/super-admin/subscriptions" },
    { icon: TrendingUp, label: "Analytics", href: "/super-admin/analytics" },
    { icon: Bell, label: "Notifications", href: "/super-admin/notifications" },
    { icon: Settings, label: "Settings", href: "/super-admin/settings" },
  ];

  return (
    <aside className="w-64 bg-[#FFE13C] text-[#111111] flex flex-col h-screen fixed top-0 left-0 border-r border-[#111111]/10 z-50">
      <div className="h-20 flex items-center px-8 border-b border-[#111111]/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#111111] text-white rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">🍴</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-[#111111]">FoodHub</span>
        </Link>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-bold uppercase tracking-widest text-[#111111]/50 mb-4 px-4">Super Admin</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${
                isActive 
                  ? "bg-[#111111] text-[#FFE13C] shadow-lg shadow-[#111111]/20 scale-[1.02]" 
                  : "text-[#111111] hover:bg-white/40 hover:scale-[1.01]"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#111111]/10">
        <button 
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-[#111111] hover:bg-white/40 hover:text-red-600 transition-all"
        >
          <LogOut size={20} strokeWidth={2} />
          Logout
        </button>
      </div>
    </aside>
  );
}