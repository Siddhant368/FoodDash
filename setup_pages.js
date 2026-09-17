const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'app');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const files = {
  'cart/page.tsx': `import { ChevronLeft, MapPin, CreditCard, Clock, ChevronRight, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.07] px-4 h-16 flex items-center justify-between lg:px-8">
        <Link href="/restaurants/1" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors"><ChevronLeft size={20} /></Link>
        <h1 className="text-lg font-bold">Your Cart</h1>
        <div className="w-10"></div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
        <div className="space-y-6">
          <div className="bg-[#121214] border border-white/[0.08] rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6">Burger House</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80" alt="Burger" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1"><h3 className="font-bold">Double Smash Burger</h3><span className="font-bold">₹698</span></div>
                  <p className="text-sm text-zinc-400 mb-3">No onions, extra sauce</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-[#18181b] border border-white/[0.08] rounded-lg">
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-white/[0.05] transition-colors">-</button>
                      <span className="w-8 text-center text-sm font-medium">2</span>
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-white/[0.05] transition-colors text-orange-500">+</button>
                    </div>
                    <button className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-3 border border-white/[0.1] hover:bg-white/[0.02] transition-colors rounded-xl font-medium text-sm">+ Add more items</button>
          </div>
          <div className="bg-[#121214] border border-white/[0.08] rounded-3xl p-6">
            <h2 className="font-bold mb-4">Bill Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400"><span>Item Total</span><span>₹698</span></div>
              <div className="flex justify-between text-zinc-400"><span>Delivery Fee</span><span>₹40</span></div>
              <div className="flex justify-between text-zinc-400"><span>Taxes & Charges</span><span>₹35</span></div>
              <div className="pt-4 mt-2 border-t border-white/[0.08] flex justify-between font-bold text-lg text-white"><span>Total</span><span>₹773</span></div>
            </div>
          </div>
          <div className="bg-[#121214] border border-white/[0.08] rounded-3xl p-6">
            <h2 className="font-bold mb-4">You may also like</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
               <div className="min-w-[150px] space-y-2">
                 <img src="https://images.unsplash.com/photo-1576107232684-1279f390859f?w=200&q=80" className="w-full h-24 object-cover rounded-xl"/>
                 <p className="text-sm font-bold">Fries</p>
                 <div className="flex justify-between items-center"><span className="text-sm">₹120</span><button className="bg-orange-500 text-white rounded p-1"><Plus size={14}/></button></div>
               </div>
            </div>
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 inset-x-0 p-4 bg-[#09090b]/95 backdrop-blur-md border-t border-white/[0.07] z-50 flex justify-center">
        <Link href="/checkout" className="w-full max-w-3xl bg-orange-500 hover:bg-orange-600 text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center transition-colors">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}`,
  'checkout/page.tsx': `import { MapPin, Plus, Wallet, CreditCard, CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.07] px-4 h-16 flex items-center gap-4 lg:px-8">
        <Link href="/cart" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors"><ChevronLeft size={20} /></Link>
        <h1 className="text-lg font-bold">Secure Checkout</h1>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <section className="bg-[#121214] border border-white/[0.08] rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-6">Delivery Address</h2>
              <div className="space-y-3">
                <div className="border border-[#FFD83D] bg-[#FFD83D]/10 rounded-2xl p-4 flex gap-4 cursor-pointer relative">
                  <div className="absolute top-4 right-4 text-[#FFD83D]"><CheckCircle2 size={20} className="fill-[#FFD83D] text-black" /></div>
                  <div className="w-10 h-10 rounded-full bg-[#FFD83D]/20 text-[#FFD83D] flex items-center justify-center"><MapPin size={20} /></div>
                  <div><p className="font-bold text-[#FFD83D]">Home</p><p className="text-sm text-zinc-300">123 Main St, Apartment 4B<br/>New York, NY 10001</p></div>
                </div>
                <div className="border border-white/[0.08] bg-[#18181b] rounded-2xl p-4 flex gap-4 cursor-pointer hover:border-white/[0.2] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/[0.05] text-zinc-400 flex items-center justify-center"><MapPin size={20} /></div>
                  <div><p className="font-bold">Work</p><p className="text-sm text-zinc-400">456 Office Tower, Floor 12</p></div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-white/[0.2] rounded-2xl hover:bg-white/[0.02] text-zinc-300 font-medium transition-colors"><Plus size={18}/> Add new address</button>
              </div>
            </section>
            <section className="bg-[#121214] border border-white/[0.08] rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-3">
                <div className="border border-white/[0.08] bg-[#18181b] rounded-2xl p-4 flex gap-4 cursor-pointer hover:border-white/[0.2] transition-colors items-center">
                  <CreditCard size={24} className="text-zinc-400"/>
                  <span className="font-bold flex-1">Online Payment (Card/UPI)</span>
                </div>
                <div className="border border-[#FFD83D] bg-[#FFD83D]/10 rounded-2xl p-4 flex gap-4 cursor-pointer items-center relative">
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[#FFD83D]"><CheckCircle2 size={20} className="fill-[#FFD83D] text-black" /></div>
                  <Wallet size={24} className="text-[#FFD83D]"/>
                  <span className="font-bold text-[#FFD83D]">Cash on Delivery</span>
                </div>
              </div>
            </section>
          </div>
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-24 bg-[#121214] border border-white/[0.08] rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex gap-3 items-center mb-6 border-b border-white/[0.08] pb-4">
                <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=50&q=80" className="w-10 h-10 rounded-lg object-cover"/>
                <p className="font-bold">Burger House</p>
              </div>
              <div className="space-y-4 mb-6"><div className="flex justify-between text-sm text-zinc-300"><span>2x Double Smash Burger</span><span>₹698</span></div></div>
              <div className="space-y-3 text-sm text-zinc-400 border-t border-white/[0.08] pt-4">
                <div className="flex justify-between"><span>Subtotal</span><span>₹698</span></div>
                <div className="flex justify-between"><span>Delivery Fee</span><span>₹40</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₹35</span></div>
                <div className="flex justify-between pt-4 mt-2 border-t border-white/[0.08] font-bold text-lg text-white"><span>Total</span><span>₹773</span></div>
              </div>
              <Link href="/checkout/success" className="w-full mt-8 bg-black hover:bg-zinc-900 border border-zinc-800 text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center transition-colors">
                Place Order
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}`,
  'checkout/success/page.tsx': `import { CheckCircle2, Navigation } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FFD83D] flex flex-col items-center justify-center text-black px-4">
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
}`,
  'orders/page.tsx': `import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.07] px-4 py-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between"><h1 className="text-xl font-bold">My Orders</h1></div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="flex gap-4 mb-8 overflow-x-auto scrollbar-hide border-b border-white/[0.08]">
          <button className="pb-3 border-b-2 border-orange-500 text-white font-medium">All</button>
          <button className="pb-3 border-b-2 border-transparent text-zinc-400 hover:text-white">Active</button>
          <button className="pb-3 border-b-2 border-transparent text-zinc-400 hover:text-white">Completed</button>
          <button className="pb-3 border-b-2 border-transparent text-zinc-400 hover:text-white">Cancelled</button>
        </div>
        <div className="space-y-4">
          <div className="bg-[#121214] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.2] transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">Burger House</h3>
                <p className="text-sm text-zinc-400">Order #FH10245 • Today, 10:45 AM</p>
              </div>
              <span className="text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Preparing</span>
            </div>
            <p className="text-sm text-zinc-300 mb-4">2x Double Smash Burger</p>
            <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
              <span className="font-bold">Total: ₹773</span>
              <Link href="/orders/FH10245" className="text-orange-500 font-medium text-sm flex items-center gap-1 hover:text-orange-400">View Order <ChevronRight size={16}/></Link>
            </div>
          </div>
          <div className="bg-[#121214] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.2] transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">Pizza Paradise</h3>
                <p className="text-sm text-zinc-400">Order #FH09982 • Yesterday, 08:30 PM</p>
              </div>
              <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Delivered</span>
            </div>
            <p className="text-sm text-zinc-300 mb-4">1x Spicy Pepperoni Pizza</p>
            <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
              <span className="font-bold">Total: ₹499</span>
              <Link href="/orders/FH09982" className="text-orange-500 font-medium text-sm flex items-center gap-1 hover:text-orange-400">View Order <ChevronRight size={16}/></Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}`,
  'orders/[id]/page.tsx': `import { MapPin, Navigation, Clock, Phone, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.07] px-4 h-16 flex items-center gap-4 lg:px-8">
        <Link href="/orders" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors"><ChevronLeft size={20} /></Link>
        <h1 className="text-lg font-bold">Track Order</h1>
      </header>
      
      {/* Light Map Placeholder */}
      <div className="w-full h-[300px] bg-zinc-200 relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 bg-white text-black p-3 rounded-xl shadow-xl flex items-center gap-3">
           <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center"><Navigation size={18}/></div>
           <div><p className="text-xs text-zinc-500">Arriving in</p><p className="font-bold text-sm">15 mins</p></div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 lg:px-8 -mt-6 relative z-10">
        <div className="bg-[#121214] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-8">
          <div className="flex justify-between items-start">
            <div><h2 className="text-2xl font-bold mb-1">Preparing Order</h2><p className="text-zinc-400">Order #FH10245</p></div>
            <div className="text-right"><p className="text-zinc-400 text-sm mb-1">Estimated delivery</p><p className="font-bold text-lg text-orange-500">11:15 AM</p></div>
          </div>
          
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-zinc-800"></div>
            <div className="relative z-10 flex gap-4 opacity-50"><div className="w-6 h-6 rounded-full bg-green-500 text-black flex items-center justify-center -ml-[31px]">✓</div><div><p className="font-bold">Order placed</p><p className="text-sm text-zinc-400">10:45 AM</p></div></div>
            <div className="relative z-10 flex gap-4 opacity-50"><div className="w-6 h-6 rounded-full bg-green-500 text-black flex items-center justify-center -ml-[31px]">✓</div><div><p className="font-bold">Restaurant confirmed</p><p className="text-sm text-zinc-400">10:46 AM</p></div></div>
            <div className="relative z-10 flex gap-4"><div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center -ml-[31px]">●</div><div><p className="font-bold text-orange-500">Preparing</p><p className="text-sm text-zinc-400">Your food is being prepared</p></div></div>
            <div className="relative z-10 flex gap-4 opacity-50"><div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-700 -ml-[31px]"></div><div><p className="font-bold">Out for delivery</p></div></div>
            <div className="relative z-10 flex gap-4 opacity-50"><div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-700 -ml-[31px]"></div><div><p className="font-bold">Delivered</p></div></div>
          </div>
        </div>
      </main>
    </div>
  );
}`,
  'profile/page.tsx': `import { User, MapPin, CreditCard, Clock, Heart, Bell, Shield, LogOut } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-24">
      <header className="pt-12 pb-6 px-4 lg:px-8 border-b border-white/[0.07] bg-[#121214]">
        <div className="max-w-3xl mx-auto flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-3xl font-bold border-2 border-orange-500/50">S</div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Siddhant</h1>
            <p className="text-zinc-400 mb-2">sid@example.com • +91 9876543210</p>
            <button className="text-xs bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 rounded-lg transition-colors font-medium">Edit Profile</button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { icon: User, label: "Personal Information" },
            { icon: MapPin, label: "Saved Addresses" },
            { icon: CreditCard, label: "Payment Methods" },
            { icon: Clock, label: "Order History" },
            { icon: Heart, label: "Favorites" },
            { icon: Bell, label: "Notifications" },
            { icon: Shield, label: "Security" },
          ].map((item, i) => (
            <button key={i} className="flex items-center gap-4 p-5 bg-[#121214] border border-white/[0.08] rounded-2xl hover:border-white/[0.2] transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-zinc-300"><item.icon size={20}/></div>
              <span className="font-bold text-zinc-200">{item.label}</span>
            </button>
          ))}
          <button className="flex items-center gap-4 p-5 border border-red-500/20 bg-red-500/5 rounded-2xl hover:bg-red-500/10 transition-colors text-left text-red-500 mt-4 md:mt-0 md:col-span-2">
            <LogOut size={20}/>
            <span className="font-bold">Log out</span>
          </button>
        </div>
      </main>
    </div>
  );
}`,
  'favorites/page.tsx': `import { Heart } from "lucide-react";

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.07] px-4 py-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between"><h1 className="text-xl font-bold">Favorites</h1></div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="flex gap-4 mb-8 border-b border-white/[0.08]">
          <button className="pb-3 border-b-2 border-orange-500 text-white font-medium">Restaurants</button>
          <button className="pb-3 border-b-2 border-transparent text-zinc-400 hover:text-white">Dishes</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group cursor-pointer rounded-2xl overflow-hidden bg-[#121214] border border-white/[0.08]">
            <div className="relative h-48 w-full">
              <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" className="w-full h-full object-cover"/>
              <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white"><Heart size={16} className="fill-white"/></button>
            </div>
            <div className="p-4"><h3 className="text-lg font-bold">Burger House</h3><p className="text-sm text-zinc-400">American • Burgers</p></div>
          </div>
        </div>
      </main>
    </div>
  );
}`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(root, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content);
}
console.log('Generated ' + Object.keys(files).length + ' pages.');
