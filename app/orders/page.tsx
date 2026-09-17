import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { MapPin, ChevronRight, User, ShoppingCart } from "lucide-react";
import OrdersClient from "./OrdersClient";
import { SetLocationButton } from "@/components/SetLocationButton";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans">
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
            <Link href="/orders" className="text-[#FFE13C]">Orders</Link>
            <Link href="/favorites" className="hover:text-[#FFE13C] transition-colors">Favorites</Link>
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

      <OrdersClient />
    </div>
  );
}