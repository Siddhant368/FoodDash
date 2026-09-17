import { CheckCircle2, Navigation } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FFE13C] flex flex-col items-center justify-center text-black px-4">
      <CheckCircle2 size={80} className="mb-6 text-black" />
      <h1 className="text-4xl md:text-5xl font-black text-center mb-2 tracking-tight">Order placed successfully!</h1>
      <p className="text-xl font-medium opacity-80 mb-8">Order #FH10245</p>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl mb-8">
        <p className="text-zinc-500 font-medium mb-1">Estimated delivery</p>
        <p className="text-3xl font-black mb-6">25–35 minutes</p>
        <Link href="/orders/FH10245" className="w-full bg-black text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 mb-4">
          <Navigation size={20}/> Track Order
        </Link>
        <Link href="/" className="text-black font-bold hover:underline">Continue Shopping</Link>
      </div>
    </div>
  );
}