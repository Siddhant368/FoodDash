"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListOrdered, History, User, Bell } from "lucide-react";
import { useState, useEffect } from "react";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { label: "Dashboard", href: "/delivery", icon: Home },
    { label: "Orders", href: "/delivery/orders", icon: ListOrdered },
    { label: "History", href: "/delivery/history", icon: History },
    { label: "Profile", href: "/delivery/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen fixed">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 bg-[#FFE13C] rounded-xl flex items-center justify-center font-black text-xl">
            FH
          </div>
          <h1 className="font-black text-2xl tracking-tight">Delivery</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/delivery");
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${isActive ? "bg-[#FFE13C] text-[#111111]" : "text-gray-500 hover:bg-gray-50 hover:text-[#111111]"}`}>
                <item.icon size={20} className={isActive ? "fill-[#111111]" : ""} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-20 px-4 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FFE13C] rounded-lg flex items-center justify-center font-black text-lg">
              FH
            </div>
            <h1 className="font-black text-xl tracking-tight">Delivery</h1>
          </div>
          <button className="relative p-2 text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center h-16">
            {navItems.map(item => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/delivery");
              return (
                <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? "text-[#111111]" : "text-gray-400 hover:text-gray-600"}`}>
                  <item.icon size={isActive ? 24 : 20} className={isActive ? "fill-[#FFE13C]" : ""} />
                  <span className={`text-[10px] font-bold ${isActive ? "text-[#111111]" : ""}`}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}