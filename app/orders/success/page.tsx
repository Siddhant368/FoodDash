import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import SuccessClient from "./SuccessClient";
import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";
import { SetLocationButton } from "@/components/SetLocationButton";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const orderId = typeof resolvedSearchParams.orderId === 'string' ? resolvedSearchParams.orderId : undefined;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans flex flex-col">
      <div className="bg-[#111111] text-[#FFFDF0]">
        <header className="px-4 py-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between relative z-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE13C] text-[#111111]">
              <span className="text-2xl font-black">F</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#FFE13C]">FoodHub</h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link href="/" className="hover:text-[#FFE13C] transition-colors">Home</Link>
            <Link href="/restaurants" className="hover:text-[#FFE13C] transition-colors">Restaurants</Link>
            <Link href="/orders" className="hover:text-[#FFE13C] transition-colors">Orders</Link>
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

      <SuccessClient orderId={orderId} />
    </div>
  );
}
