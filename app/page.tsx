import Image from "next/image";
import Link from "next/link";
import { SetLocationButton } from "@/components/SetLocationButton";
import { getCurrentUser } from "@/lib/auth/session";
import { 
  Star, 
  Clock, 
  Truck, 
  Search, 
  ChevronRight, 
  MapPin, 
  ShoppingCart, 
  User, 
  Plus, 
  Smartphone, 
  Heart
} from "lucide-react";
import Restaurant from "@/models/Restaurant";
import Cart from "@/models/Cart";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
import { connectDB } from "@/lib/db";
import { Suspense } from "react";

// Mock Data
const categories = [
  { name: "Burgers", icon: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", color: "bg-[#FFE13C]/10 text-[#FFE13C]" },
  { name: "Pizza", icon: "🍕", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", color: "bg-red-500/10 text-red-500" },
  { name: "Chicken", icon: "🍗", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80", color: "bg-amber-500/10 text-amber-500" },
  { name: "Asian", icon: "🍜", image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&q=80", color: "bg-green-500/10 text-green-500" },
  { name: "Healthy", icon: "🥗", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", color: "bg-emerald-500/10 text-emerald-500" },
  { name: "Desserts", icon: "🍰", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80", color: "bg-pink-500/10 text-pink-500" },
  { name: "Coffee", icon: "☕", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80", color: "bg-stone-500/10 text-stone-500" },
  { name: "Drinks", icon: "🥤", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80", color: "bg-blue-500/10 text-blue-500" },
];

async function getRestaurants() {
  try {
    await connectDB();
    const restaurants = await Restaurant.find({ isActive: true }).limit(10).lean();
    return restaurants.map(r => ({
      id: r._id.toString(),
      name: r.name,
      image: r.coverImage || r.logo || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
      tags: r.description ? r.description.substring(0, 30) : "Restaurant",
      rating: 4.5,
      time: "20-30 min",
      deliveryFee: "₹40 delivery",
      slug: r.slug,
    }));
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return [];
  }
}

async function getDishRecommendations(userId?: string) {
  try {
    await connectDB();
    let recommendedDishes: any[] = [];

    if (userId) {
      const recentOrders = await Order.find({ customerId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("items.menuItemId")
        .lean();

      if (recentOrders.length > 0) {
        const orderedItemIds = recentOrders.flatMap(order => order.items.map((item: any) => item.menuItemId));
        
        const previouslyOrderedItems = await MenuItem.find({ _id: { $in: orderedItemIds } })
          .select("categoryId")
          .lean();

        const categoryIds = [...new Set(previouslyOrderedItems.map(item => item.categoryId.toString()))];

        recommendedDishes = await MenuItem.find({
          categoryId: { $in: categoryIds },
          isAvailable: true,
        })
          .populate("restaurantId", "name isActive")
          .limit(10)
          .lean();

        recommendedDishes = recommendedDishes.filter((dish: any) => dish.restaurantId?.isActive !== false);
        recommendedDishes = recommendedDishes.sort(() => 0.5 - Math.random()).slice(0, 4);
      }
    }

    if (recommendedDishes.length === 0) {
      recommendedDishes = await MenuItem.find({ isAvailable: true })
        .populate("restaurantId", "name isActive")
        .limit(10)
        .lean();

      recommendedDishes = recommendedDishes.filter((dish: any) => dish.restaurantId?.isActive !== false);
      recommendedDishes = recommendedDishes.sort(() => 0.5 - Math.random()).slice(0, 4);
    }

    return recommendedDishes.map((dish: any) => ({
      id: dish._id.toString(),
      name: dish.name,
      restaurant: dish.restaurantId?.name || "Unknown Restaurant",
      restaurantId: dish.restaurantId?._id?.toString(),
      image: dish.image || "/placeholder-food.jpg",
      price: `₹${dish.price}`,
    }));
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}

async function DishRecommendations({ userId }: { userId?: string }) {
  const dishes = await getDishRecommendations(userId);

  if (!dishes || dishes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 text-center px-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Search size={22} className="text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-[#111111] mb-2">No recommendations yet</h3>
        <p className="text-gray-500 font-medium text-sm sm:text-base max-w-md">We couldn't find any dish recommendations at the moment. Try searching for your favorite food above!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {dishes.map((dish) => (
        <div key={dish.id} className="bg-white border border-gray-100 rounded-[24px] sm:rounded-[32px] p-3 hover:shadow-xl hover:shadow-black/5 transition-all group flex flex-col">
          <div className="w-full aspect-[16/10] sm:aspect-[4/3] rounded-[18px] sm:rounded-[24px] overflow-hidden mb-3 sm:mb-4 relative bg-gray-50">
            <Image 
              src={dish.image} 
              alt={dish.name} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
          <div className="px-2 pb-2 flex-1 flex flex-col">
            <h3 className="font-black text-base sm:text-lg text-[#111111] truncate mb-0.5 sm:mb-1">{dish.name}</h3>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-3 sm:mb-4 truncate">{dish.restaurant}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="font-black text-lg sm:text-xl text-[#111111]">{dish.price}</span>
              <Link 
                href={`/restaurants/${dish.restaurantId}`} 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFF9D6] text-[#111111] hover:bg-[#FFE13C] flex items-center justify-center transition-colors active:scale-95"
                aria-label={`View ${dish.name}`}
              >
                <Plus size={20} className="font-bold sm:w-6 sm:h-6" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DishRecommendationsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-[24px] sm:rounded-[32px] p-3 flex flex-col animate-pulse">
          <div className="w-full aspect-[16/10] sm:aspect-[4/3] rounded-[18px] sm:rounded-[24px] bg-gray-200 mb-3 sm:mb-4"></div>
          <div className="px-2 pb-2 flex-1 flex flex-col">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  const user = await getCurrentUser();
  const restaurants = await getRestaurants();

  let cartItemCount = 0;
  if (user) {
    const carts = await Cart.find({ customerId: user.id }).lean();
    cartItemCount = carts.reduce((acc, cart) => acc + cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0), 0);
  }

  return (
    <div className="min-h-screen bg-[#FFFDF0] text-[#111111] font-sans pb-16 md:pb-0">
      
      {/* Hero Section */}
      <div className="bg-[#111111] text-[#FFFDF0] pt-2 sm:pt-4 pb-14 sm:pb-20 lg:pb-24 rounded-b-[36px] sm:rounded-b-[48px] relative overflow-hidden">
        
        {/* Header */}
        <header className="px-4 py-4 sm:py-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between relative z-20">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFE13C] text-[#111111] transition-transform group-hover:scale-105">
              <span className="text-xl sm:text-2xl font-black">F</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#FFE13C]">FOODDASH</h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link href="/" className="text-[#FFE13C]">Home</Link>
            <Link href="/restaurants" className="hover:text-[#FFE13C] transition-colors">Restaurants</Link>
            <Link href="/orders" className="hover:text-[#FFE13C] transition-colors">Orders</Link>
            <Link href="/favorites" className="hover:text-[#FFE13C] transition-colors">Favorites</Link>
          </nav>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <SetLocationButton />

            {user ? (
              <>
                <Link 
                  href="/profile" 
                  className="bg-[#222222] hover:bg-[#333333] text-white p-2.5 sm:p-3 rounded-full transition-colors flex items-center justify-center"
                  aria-label="Profile"
                >
                  <User size={18} className="sm:w-5 sm:h-5" />
                </Link>
                <Link 
                  href="/cart" 
                  className="bg-[#FFE13C] text-[#111111] px-3.5 py-2 sm:px-5 sm:py-3 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 font-bold shadow-lg shadow-[#FFE13C]/20 text-xs sm:text-sm"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                  <span>{cartItemCount}</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="bg-[#222222] text-[#FFFDF0] p-2.5 sm:p-3 rounded-full hover:bg-[#333333] transition-colors flex items-center justify-center"
                  aria-label="Login"
                >
                  <User size={18} className="sm:w-5 sm:h-5" />
                </Link>
                <Link 
                  href="/cart" 
                  className="bg-[#FFE13C] text-[#111111] px-3.5 py-2 sm:px-5 sm:py-3 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 font-bold shadow-lg shadow-[#FFE13C]/20 text-xs sm:text-sm"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                  <span>0</span>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Hero Body */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 sm:pt-12 lg:pt-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
          
          {/* Left Content */}
          <div className="flex-1 w-full max-w-2xl text-left">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.15] mb-3 sm:mb-6">
              DELICIOUS MEALS,<br /><span className="text-[#FFE13C]">DELIVERED FAST.</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-400 mb-6 sm:mb-10 max-w-lg leading-relaxed">
              Find the best food in your city. Fresh, fast, and exactly what you're craving right now.
            </p>

            {/* Address Search UI */}
            <form 
              action="/restaurants" 
              className="bg-white rounded-2xl sm:rounded-full p-1.5 sm:p-2 flex flex-col sm:flex-row items-center shadow-2xl shadow-black/50 gap-2 mb-6 sm:mb-8 relative z-20"
            >
              <div className="flex-1 flex items-center gap-3 px-3 sm:px-4 w-full h-11 sm:h-12">
                <Search size={20} className="text-[#111111] shrink-0" />
                <input 
                  type="text" 
                  name="q"
                  placeholder="Search restaurants, dishes, cuisines..." 
                  className="w-full bg-transparent outline-none text-[#111111] font-medium text-sm sm:text-base placeholder:text-gray-400"
                />
              </div>
              <button 
                type="submit" 
                className="bg-[#FFE13C] text-[#111111] w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 rounded-xl sm:rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-transform shrink-0 flex items-center justify-center"
              >
                Find Food
              </button>
            </form>
            
            {/* Popular Search Chips */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-semibold">
              <span className="text-gray-400">Popular:</span>
              <Link href="/restaurants?q=Pizza" className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-gray-700 hover:border-[#FFE13C] hover:text-[#FFE13C] transition-colors">Pizza</Link>
              <Link href="/restaurants?q=Burgers" className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-gray-700 hover:border-[#FFE13C] hover:text-[#FFE13C] transition-colors">Burgers</Link>
              <Link href="/restaurants?q=Biryani" className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-gray-700 hover:border-[#FFE13C] hover:text-[#FFE13C] transition-colors">Biryani</Link>
              <Link href="/restaurants?q=South Indian" className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-gray-700 hover:border-[#FFE13C] hover:text-[#FFE13C] transition-colors">South Indian</Link>
            </div>
          </div>

          {/* Right Collage - Desktop/Tablet only */}
          <div className="flex-1 relative w-full h-[400px] lg:h-[500px] hidden md:block">
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80" alt="Healthy Bowl" className="absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-1/2 w-72 h-72 object-cover rounded-full shadow-2xl z-20 border-8 border-[#111111]" />
            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" alt="Pizza" className="absolute top-1/2 left-1/2 -translate-x-[-10%] -translate-y-[40%] w-60 h-60 object-cover rounded-full shadow-2xl z-30 border-8 border-[#111111]" />
          </div>
        </div>
      </div>

      <main>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 sm:py-14 lg:py-16 space-y-12 sm:space-y-16 lg:space-y-24">

          {/* Categories Section */}
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Food Categories</h2>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-3 sm:gap-6 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
              {categories.map((category, index) => (
                <Link 
                  href={`/category/${category.name.toLowerCase()}`}
                  key={category.name}
                  className="flex-shrink-0 flex flex-col items-center gap-2 sm:gap-4 group"
                >
                  <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center text-4xl shadow-sm border border-gray-100 transition-all ${index === 0 ? 'bg-[#FFE13C] shadow-lg shadow-[#FFE13C]/20 border-transparent' : 'bg-[#FFFDF0] hover:scale-105 group-hover:shadow-lg'}`}>
                    <Image src={category.image} alt={category.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="96px" />
                  </div>
                  <span className="text-xs sm:text-base font-bold text-[#111111] text-center">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Top Restaurants Section */}
          <section>
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Featured Restaurants</h2>
              <Link 
                href="/restaurants" 
                className="text-[#111111] font-bold flex items-center hover:text-gray-600 transition-colors bg-[#FFF9D6] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm active:scale-95"
              >
                View All <ChevronRight size={14} className="ml-1 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {restaurants.map((restaurant) => (
                <Link 
                  href={`/restaurants/${restaurant.id}`}
                  key={restaurant.id}
                  className="group cursor-pointer rounded-[24px] sm:rounded-[32px] overflow-hidden bg-white border border-gray-100 hover:shadow-xl hover:shadow-black/5 transition-all flex flex-col"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden p-2">
                    <div className="relative w-full h-full rounded-[18px] sm:rounded-[24px] overflow-hidden">
                      <Image 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-white/95 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1.5 shadow-sm font-bold text-xs sm:text-sm">
                      <Star size={13} className="text-[#FFE13C] fill-[#FFE13C] sm:w-3.5 sm:h-3.5" />
                      {restaurant.rating}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6 pt-2 sm:pt-4 flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl font-black text-[#111111] mb-1 line-clamp-1">
                      {restaurant.name}
                    </h3>
                    
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-3 sm:mb-4 line-clamp-1">{restaurant.tags}</p>

                    <div className="flex items-center gap-2.5 sm:gap-4 text-xs font-bold text-[#111111] mb-4 sm:mb-6">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                        <Clock size={13} className="text-gray-400" />
                        <span>{restaurant.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                        <Truck size={13} className="text-gray-400" />
                        <span>{restaurant.deliveryFee}</span>
                      </div>
                    </div>
                    
                    <button className="mt-auto w-full bg-[#FFE13C] hover:bg-yellow-400 active:scale-98 text-[#111111] font-black py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-colors shadow-sm text-sm sm:text-base">
                      Order Now
                    </button>
                  </div>
                </Link>
              ))}

              {/* Extra card for 4 cols symmetry on desktop */}
              <div className="group cursor-pointer rounded-[32px] overflow-hidden bg-white border border-gray-100 hover:shadow-xl hover:shadow-black/5 transition-all flex flex-col hidden xl:flex">
                <div className="relative w-full aspect-[16/10] overflow-hidden p-2">
                  <div className="relative w-full h-full rounded-[24px] overflow-hidden">
                    <Image 
                      src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80" 
                      alt="Burger House" 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute top-5 right-5 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm font-bold text-sm">
                    <Star size={14} className="text-[#FFE13C] fill-[#FFE13C]" />
                    4.9
                  </div>
                </div>
                <div className="p-6 pt-4 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-[#111111] mb-1">Burger Joint</h3>
                  <p className="text-sm font-semibold text-gray-500 mb-4">American • Burgers</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-[#111111] mb-6">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full"><Clock size={14} className="text-gray-400" />15–25 min</div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full"><Truck size={14} className="text-gray-400" />Free</div>
                  </div>
                  <button className="mt-auto w-full bg-[#FFE13C] hover:bg-yellow-400 text-[#111111] font-black py-3.5 rounded-2xl transition-colors shadow-sm">Order Now</button>
                </div>
              </div>
            </div>
          </section>

          {/* Offers Section */}
          <section id="offers">
            <h2 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 tracking-tight">Special Offers</h2>
            <div className="bg-[#111111] rounded-[28px] sm:rounded-[40px] p-6 sm:p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFE13C]/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="w-full md:flex-1 relative z-10 flex justify-center md:justify-start gap-3 sm:gap-4">
                <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl border-4 border-[#222222] -rotate-6 shrink-0">
                  <Image src="https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&q=80" alt="Tacos" fill className="object-cover" sizes="(max-width: 640px) 150px, 200px" />
                </div>
                <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl border-4 border-[#222222] rotate-3 hidden sm:block mt-6 shrink-0">
                  <Image src="https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&q=80" alt="Noodles" fill className="object-cover" sizes="200px" />
                </div>
              </div>

              <div className="w-full md:flex-1 text-center md:text-right z-10">
                <h3 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-4 leading-tight">
                  Get <span className="text-[#FFE13C]">30% OFF</span><br />Your First Order!
                </h3>
                <p className="text-gray-400 font-semibold mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">Use code at checkout to claim your discount.</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="bg-[#222222] text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl font-mono text-base sm:text-xl font-bold tracking-widest border border-gray-700 text-center">
                    EATNEW30
                  </div>
                  <Link 
                    href="/restaurants?offer=EATNEW30" 
                    className="bg-[#FFE13C] text-[#111111] px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#FFE13C]/20 flex items-center justify-center text-center"
                  >
                    Claim Offer
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Dish Recommendations */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 tracking-tight">Dish Recommendations</h2>
            <Suspense fallback={<DishRecommendationsSkeleton />}>
              <DishRecommendations userId={user?.id} />
            </Suspense>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#111111] text-white pt-5 sm:pt-16 lg:pt-20 pb-20 sm:pb-8 px-4 sm:px-6 lg:px-8 mt-6 sm:mt-12 rounded-t-[20px] sm:rounded-t-[48px]">
        {/* Mobile Minimalist Footer (< sm) */}
        <div className="sm:hidden space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFE13C] text-[#111111]">
                <span className="text-sm font-black">F</span>
              </div>
              <h2 className="text-base font-black text-[#FFE13C]">FOODDASH</h2>
            </div>
            
            <div className="flex gap-2">
              <button aria-label="Social link" className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </button>
              <button aria-label="Social link" className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </button>
              <button aria-label="Social link" className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-y-1.5 text-[11px] font-semibold text-gray-400 pt-2 border-t border-gray-800/80">
            <Link href="/restaurants" className="hover:text-[#FFE13C] transition-colors">Restaurants</Link>
            <Link href="/orders" className="hover:text-[#FFE13C] transition-colors">Orders</Link>
            <Link href="/favorites" className="hover:text-[#FFE13C] transition-colors">Favorites</Link>
            <Link href="/#offers" className="hover:text-[#FFE13C] transition-colors">Offers</Link>
            <a href="#" className="hover:text-[#FFE13C] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#FFE13C] transition-colors">Terms</a>
          </div>

          <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-[10px] text-gray-500 font-medium">
            <p>© 2026 FOODDASH</p>
            <div className="flex gap-3">
              <span>English (US)</span>
              <span>India</span>
            </div>
          </div>
        </div>

        {/* Desktop View (>= sm) */}
        <div className="hidden sm:block">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-12 mb-6 sm:mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-6">
                <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFE13C] text-[#111111]">
                  <span className="text-lg sm:text-2xl font-black">F</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-[#FFE13C]">FOODDASH</h2>
              </div>
              <p className="text-gray-400 font-medium mb-3 sm:mb-8 max-w-sm leading-snug sm:leading-relaxed text-xs sm:text-base">
                Find the best food in your city. Fresh, fast, and exactly what you're craving right now.
              </p>
              <div className="flex gap-2.5 sm:gap-4">
                <button aria-label="Social link" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </button>
                <button aria-label="Social link" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </button>
                <button aria-label="Social link" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </button>
              </div>
            </div>

            <div className="col-span-1">
              <h3 className="font-black text-sm sm:text-lg mb-2 sm:mb-6">Links</h3>
              <ul className="space-y-1.5 sm:space-y-4 font-semibold text-gray-400 text-xs sm:text-base">
                <li><Link href="/restaurants" className="hover:text-[#FFE13C] transition-colors">Restaurants</Link></li>
                <li><Link href="/orders" className="hover:text-[#FFE13C] transition-colors">Track Orders</Link></li>
                <li><Link href="/favorites" className="hover:text-[#FFE13C] transition-colors">Favorites</Link></li>
                <li><Link href="/#offers" className="hover:text-[#FFE13C] transition-colors">Offers</Link></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="font-black text-sm sm:text-lg mb-2 sm:mb-6">Legal</h3>
              <ul className="space-y-1.5 sm:space-y-4 font-semibold text-gray-400 text-xs sm:text-base">
                <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Refund Policy</a></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <h3 className="font-black text-sm sm:text-lg mb-2 sm:mb-6">Download App</h3>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:space-y-3 sm:block">
                <button className="w-full bg-[#222222] hover:bg-[#333333] border border-gray-800 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-colors flex items-center gap-2 sm:gap-3">
                  <Smartphone size={18} className="text-[#FFE13C] shrink-0 sm:w-[22px] sm:h-[22px]" /> 
                  <div className="text-left">
                    <div className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-none">Download on the</div>
                    <div className="text-xs sm:text-sm font-bold">App Store</div>
                  </div>
                </button>
                <button className="w-full bg-[#222222] hover:bg-[#333333] border border-gray-800 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-colors flex items-center gap-2 sm:gap-3 sm:mt-3">
                  <Smartphone size={18} className="text-[#FFE13C] shrink-0 sm:w-[22px] sm:h-[22px]" /> 
                  <div className="text-left">
                    <div className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-none">GET IT ON</div>
                    <div className="text-xs sm:text-sm font-bold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto border-t border-gray-800 pt-4 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 font-semibold text-[11px] sm:text-sm text-gray-500 text-center sm:text-left">
            <p>Copyright © 2026 FOODDASH. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              <button className="hover:text-[#FFE13C] transition-colors">English (US)</button>
              <button className="hover:text-[#FFE13C] transition-colors">India</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
