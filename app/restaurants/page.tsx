import Image from "next/image";
import { Star, Clock, Heart, MapPin, User, ShoppingCart, ShoppingBag, XCircle, Search, Menu, ChevronRight } from "lucide-react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import Cart from "@/models/Cart";
import { getCurrentUser } from "@/lib/auth/session";
import SearchFilters from "./SearchFilters";
import { SetLocationButton } from "@/components/SetLocationButton";
import { SetLocationHeroButton } from "@/components/SetLocationHeroButton";
import HeroSearch from "./HeroSearch";
import CuisineChips from "./CuisineChips";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RestaurantsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : "";
  const filter = typeof resolvedParams.filter === 'string' ? resolvedParams.filter : "all";
  const cuisine = typeof resolvedParams.cuisine === 'string' ? resolvedParams.cuisine : "all";

  await connectDB();
  const user = await getCurrentUser();

  let cartItemCount = 0;
  if (user) {
    const cart = await Cart.findOne({ customerId: user.id }).lean();
    if (cart && cart.items) {
      cartItemCount = cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    }
  }

  const query: any = { isActive: true };
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { address: { $regex: q, $options: "i" } }
    ];
  }
  
  if (filter === "open") {
    query.isOpen = true;
  }
  
  if (cuisine !== "all") {
    query.description = { $regex: cuisine, $options: "i" };
  }

  const restaurants = await Restaurant.find(query)
    .select("_id name slug logo coverImage description address isOpen isActive")
    .limit(50)
    .lean();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans">
      
      {/* Black/dark hero section matching Home Page */}
      <div className="bg-[#111111] text-[#FFFFFF] pt-4 pb-16 lg:pb-24 rounded-b-[48px] relative overflow-hidden shadow-lg">
        
        {/* Same Navbar as existing home page */}
        <header className="px-4 py-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE13C] text-[#111111]">
                <span className="text-2xl font-black">F</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[#FFE13C]">FOODDASH</h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link href="/" className="hover:text-[#FFE13C] transition-colors">Home</Link>
            <Link href="/restaurants" className="text-[#FFE13C]">Restaurants</Link>
            <Link href="/orders" className="hover:text-[#FFE13C] transition-colors">Orders</Link>
            <Link href="/favorites" className="hover:text-[#FFE13C] transition-colors">Favorites</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <SetLocationButton />

            {user ? (
              <>
                <Link href="/profile" className="bg-[#222222] hover:bg-[#333333] text-white p-3 rounded-full transition-colors flex items-center justify-center">
                  <User size={20} />
                </Link>
                <Link href="/cart" className="bg-[#FFE13C] text-[#111111] px-5 py-3 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#FFE13C]/20">
                  <ShoppingCart size={20} />
                  <span>{cartItemCount}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="bg-[#222222] text-[#FFFDF0] p-3 rounded-full hover:bg-[#333333] transition-colors flex items-center justify-center">
                  <User size={20} />
                </Link>
                <Link href="/cart" className="bg-[#FFE13C] text-[#111111] px-5 py-3 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#FFE13C]/20">
                  <ShoppingCart size={20} />
                  <span>0</span>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* HERO CONTENT */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 lg:pt-16 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          
          {/* Left Content */}
          <div className="flex-1 w-full max-w-2xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FFE13C] text-[#111111] font-black text-xs uppercase tracking-widest mb-6 shadow-sm">
              EXPLORE
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              GOOD FOOD,<br /><span className="text-[#FFE13C]">GOOD MOOD.</span>
            </h1>
            <p className="text-lg font-medium text-[#8A98AB] mb-10 max-w-lg">
              Discover the best restaurants and delicious meals around you.
            </p>

            {/* Large white search bar */}
            <div className="bg-white rounded-full p-2 flex flex-col sm:flex-row items-center shadow-2xl shadow-black/50 gap-2 mb-8 relative z-20 border border-white/20">
              <div className="flex-1 flex items-center gap-3 px-4 w-full h-12">
                <Search size={22} className="text-[#111111]" />
                <HeroSearch isCompact={false} />
              </div>
              <SetLocationHeroButton />
              <button className="bg-[#FFE13C] text-[#111111] w-full sm:w-auto px-8 h-12 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-sm">
                Find Food
              </button>
            </div>
            
            <div className="mt-8">
              <CuisineChips currentCuisine={cuisine} />
            </div>
          </div>

          {/* Right Collage / Premium Food Photography */}
          <div className="flex-1 relative w-full h-[400px] lg:h-[500px] hidden md:block">
            {/* Subtle yellow decorative element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#FFE13C] rounded-full blur-[120px] opacity-15"></div>
            
            <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80" alt="Indian Thali" className="absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-[60%] w-72 h-72 object-cover rounded-full shadow-2xl z-20 border-8 border-[#111111] hover:scale-105 transition-transform duration-500" />
            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" alt="Pizza" className="absolute top-1/2 left-1/2 -translate-x-[-10%] -translate-y-[30%] w-60 h-60 object-cover rounded-full shadow-2xl z-30 border-8 border-[#111111] hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        
        {/* EXPLORE RESTAURANTS Section Header */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">EXPLORE RESTAURANTS</h2>
              <div className="w-12 h-2 bg-[#FFE13C] rounded-full mt-2"></div>
            </div>
            <p className="text-[#8A98AB] font-medium text-lg">Find your next favorite place to eat.</p>
          </div>
          <button className="text-[#111111] font-bold flex items-center hover:text-[#8A98AB] transition-colors whitespace-nowrap">
            View All <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        
        {/* FILTER BAR */}
        <div className="mb-10">
          <SearchFilters currentFilter={filter} />
        </div>
        
        {/* EMPTY STATE */}
        {restaurants.length === 0 ? (
          <div className="bg-white rounded-[24px] p-16 text-center border border-gray-100 shadow-sm max-w-3xl mx-auto my-10">
            <div className="w-24 h-24 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100">
              <Search size={40} className="text-[#8A98AB]" />
            </div>
            <h2 className="text-2xl font-black mb-3 text-[#111111] uppercase tracking-wide">NO RESTAURANTS FOUND</h2>
            <p className="text-[#8A98AB] font-medium mb-10 text-lg">Try changing your search or filters.</p>
            <Link href="/restaurants" className="inline-flex items-center justify-center bg-[#FFE13C] hover:bg-yellow-400 text-[#111111] font-black px-10 py-4 rounded-full transition-transform hover:-translate-y-1 shadow-sm text-base">
              Clear Filters
            </Link>
          </div>
        ) : (
          /* RESTAURANT GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {restaurants.map((restaurant) => (
              <Link 
                href={`/restaurants/${restaurant._id.toString()}`}
                key={restaurant._id.toString()}
                className="group cursor-pointer rounded-[20px] bg-white border border-gray-100 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 flex flex-col relative pb-5 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative w-full aspect-[16/10]">
                  <Image 
                    src={restaurant.coverImage || restaurant.logo || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80"} 
                    alt={restaurant.name}
                    fill
                    className="object-cover rounded-t-[20px]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm font-black text-xs text-[#111111]">
                    <Star size={12} className="text-[#FFE13C] fill-[#FFE13C]" />
                    4.6
                  </div>
                  {/* Favorite Button */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-400 hover:bg-white hover:text-red-500 transition-colors shadow-sm">
                    <Heart size={16} />
                  </div>
                  {/* Open/Closed Badge */}
                  <div className="absolute bottom-3 left-3">
                     <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${restaurant.isOpen ? 'bg-[#22C55E]/90 text-white' : 'bg-red-500/90 text-white'}`}>
                        {restaurant.isOpen ? "Open" : "Closed"}
                     </div>
                  </div>
                </div>

                {/* Overlapping Logo/Avatar */}
                <div className="relative -mt-6 ml-5 w-14 h-14 rounded-xl bg-white p-1 shadow-sm border border-gray-50 z-10">
                  <div className="relative w-full h-full rounded-lg bg-[#FAFAF8] flex items-center justify-center overflow-hidden font-black text-lg text-gray-400">
                    {restaurant.logo ? (
                      <Image src={restaurant.logo} alt={restaurant.name} fill className="object-contain p-0.5" sizes="56px" />
                    ) : (
                      restaurant.name.charAt(0)
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 pt-3 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-[#111111] group-hover:text-yellow-600 transition-colors line-clamp-1 mb-1">
                    {restaurant.name}
                  </h3>
                  
                  <p className="text-xs font-semibold text-[#8A98AB] mb-4 line-clamp-1">
                    {restaurant.description || "North Indian • Indian • Thali"}
                  </p>

                  <div className="flex items-center justify-between text-xs font-bold text-[#111111] mb-4">
                      <div className="flex items-center gap-1.5 bg-[#FAFAF8] px-3 py-1.5 rounded-full border border-gray-100">
                        <Clock size={14} className="text-[#8A98AB]" />
                        25–35 min
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#FAFAF8] px-3 py-1.5 rounded-full border border-gray-100">
                        <ShoppingBag size={14} className="text-[#8A98AB]" />
                        ₹200 for two
                      </div>
                    </div>
                  
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8A98AB] mb-6 line-clamp-1">
                    <MapPin size={14} className="flex-shrink-0" />
                    {restaurant.address 
                        ? [restaurant.address.street, restaurant.address.city].filter(Boolean).join(', ') 
                        : "Udaipur, Rajasthan"}
                  </div>

                  <div className="mt-auto">
                    <button className="w-full bg-[#FFE13C] hover:bg-yellow-400 text-[#111111] font-black py-3.5 rounded-full text-sm transition-colors shadow-sm flex justify-center items-center gap-2">
                      View Menu <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#111111] text-white pt-20 pb-8 px-4 lg:px-8 mt-12 rounded-t-[48px]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE13C] text-[#111111]">
                <span className="text-2xl font-black">F</span>
              </div>
              <h2 className="text-2xl font-black text-[#FFE13C]">FOODDASH</h2>
            </div>
            <p className="text-[#8A98AB] font-medium mb-8 max-w-sm leading-relaxed">
              Find the best food in your city. Fresh, fast, and exactly what you're craving right now.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </button>
              <button className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </button>
              <button className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-black text-lg mb-6">Links</h3>
            <ul className="space-y-4 font-semibold text-[#8A98AB]">
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Company</a></li>
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-lg mb-6">Legal</h3>
            <ul className="space-y-4 font-semibold text-[#8A98AB]">
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Refund Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-lg mb-6">Download App</h3>
            <div className="space-y-3">
              <button className="w-full bg-[#222222] hover:bg-[#333333] border border-gray-800 px-4 py-3 rounded-2xl font-bold transition-colors flex items-center gap-3">
                <div className="text-left">
                  <div className="text-[10px] text-[#8A98AB] font-medium uppercase tracking-wider">Download on the</div>
                  <div className="text-sm">App Store</div>
                </div>
              </button>
              <button className="w-full bg-[#222222] hover:bg-[#333333] border border-gray-800 px-4 py-3 rounded-2xl font-bold transition-colors flex items-center gap-3">
                <div className="text-left">
                  <div className="text-[10px] text-[#8A98AB] font-medium uppercase tracking-wider">GET IT ON</div>
                  <div className="text-sm">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-semibold text-sm text-[#8A98AB]">
          <p>Copyright © 2026 FOODDASH. All rights reserved.</p>
          <div className="flex gap-6">
            <button className="hover:text-[#FFE13C] transition-colors">English (US)</button>
            <button className="hover:text-[#FFE13C] transition-colors">India</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
