import { Heart } from "lucide-react";

import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";
import { SetLocationButton } from "@/components/SetLocationButton";

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="bg-[#111111] text-[#FFFDF0]">
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
            <Link href="/favorites" className="text-[#FFE13C]">Favorites</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <SetLocationButton />

            <Link href="/profile" className="bg-[#FFE13C] text-[#111111] p-3 rounded-full transition-colors flex items-center justify-center">
              <User size={20} />
            </Link>
            <Link href="/cart" className="bg-[#222222] hover:bg-[#333333] text-white px-5 py-3 rounded-full transition-colors flex items-center justify-center gap-2 font-bold">
              <ShoppingCart size={20} />
            </Link>
          </div>
        </header>
      </div>
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="flex gap-4 mb-8 border-b border-zinc-200">
          <button className="pb-3 border-b-2 border-[#FFE13C] text-zinc-900 font-medium">Restaurants</button>
          <button className="pb-3 border-b-2 border-transparent text-zinc-500 hover:text-zinc-900">Dishes</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-zinc-200">
            <div className="relative h-48 w-full">
              <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" className="w-full h-full object-cover"/>
              <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-zinc-900"><Heart size={16} className="fill-white"/></button>
            </div>
            <div className="p-4"><h3 className="text-lg font-bold">Burger House</h3><p className="text-sm text-zinc-500">American • Burgers</p></div>
          </div>
        </div>
      </main>
    </div>
  );
}