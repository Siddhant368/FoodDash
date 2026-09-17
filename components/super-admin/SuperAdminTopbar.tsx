"use client";
import { Search, Bell, ChevronDown, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SuperAdminTopbar() {
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push("/super-admin/users?search=" + encodeURIComponent(search));
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className="h-20 bg-white border-b border-[#111111]/5 flex items-center justify-between px-8 sticky top-0 z-40">
      <form onSubmit={handleSearch} className="relative w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users or restaurants..." 
          className="w-full h-11 bg-[#FAFAF8] border border-gray-200 rounded-full pl-12 pr-4 text-sm font-medium text-[#111111] focus:outline-none focus:border-[#FFE13C] focus:ring-4 focus:ring-[#FFE13C]/20 transition-all placeholder:text-gray-400"
        />
      </form>

      <div className="flex items-center gap-6">
        <Link href="/super-admin/notifications" className="relative p-2.5 text-gray-600 hover:text-[#111111] hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Link>
        
        <div className="h-8 w-px bg-gray-200"></div>

        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="w-10 h-10 rounded-full bg-[#FFE13C] flex items-center justify-center text-[#111111] font-bold text-lg border-2 border-white shadow-sm">
              SA
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-bold text-[#111111] leading-tight">Super Admin</p>
              <p className="text-xs text-gray-500 font-medium">System Manager</p>
            </div>
            <ChevronDown size={16} className="text-gray-400 ml-1" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <Link href="/super-admin/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <User size={16} /> Admin Profile
              </Link>
              <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
