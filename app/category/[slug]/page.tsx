import { Star, Clock, Heart, Search, ChevronLeft, ChevronRight, User, ShoppingCart, Info, MapPin } from "lucide-react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";
import Restaurant from "@/models/Restaurant";
import Cart from "@/models/Cart";
import { getCurrentUser } from "@/lib/auth/session";
import { SetLocationButton } from "@/components/SetLocationButton";
import CategoryClient from "./CategoryClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { slug } = resolvedParams;
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const type = typeof resolvedSearchParams.type === "string" ? resolvedSearchParams.type : "all";
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "popular";
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1;

  await connectDB();
  const user = await getCurrentUser();

  // Find all active restaurants
  const activeRestaurants = await Restaurant.find({ isActive: true }).select("_id name").lean();
  const activeRestaurantIds = activeRestaurants.map(r => r._id);

  // Find categories matching the slug globally across active restaurants
  const categories = await Category.find({ 
    slug: slug.toLowerCase(), 
    restaurantId: { $in: activeRestaurantIds } 
  }).lean();

  const categoryIds = categories.map(c => c._id);
  
  // Use category details from the first match (if available)
  const categoryName = categories.length > 0 ? categories[0].name : slug.charAt(0).toUpperCase() + slug.slice(1);
  const categoryImage = categories.find(c => c.image)?.image || null;

  // Build the query for menu items
  const query: any = {
    categoryId: { $in: categoryIds },
    restaurantId: { $in: activeRestaurantIds },
    isAvailable: true
  };

  if (q) {
    query.name = { $regex: q, $options: "i" };
  }

  if (type === "veg") {
    query.isVeg = true;
  } else if (type === "non-veg") {
    query.isVeg = false;
  }

  // Determine sorting
  let sortOption: any = {};
  if (sort === "price_low") sortOption.price = 1;
  else if (sort === "price_high") sortOption.price = -1;
  else if (sort === "time") sortOption.preparationTime = 1;
  else if (sort === "popular") sortOption.isFeatured = -1; 
  else sortOption.isFeatured = -1;

  const limit = 20;
  const skip = (Number(page) - 1) * limit;

  const totalDishes = await MenuItem.countDocuments(query);
  const dishes = await MenuItem.find(query)
    .populate("restaurantId", "name slug")
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();

  // Fetch initial cart for cart counts and AddToCart buttons
  let initialCart = null;
  let cartItemCount = 0;
  if (user) {
    const carts = await Cart.find({ customerId: user.id }).lean();
    if (carts.length > 0) {
      // Assuming user only has one active cart based on previous code
      initialCart = carts[0];
      cartItemCount = carts.reduce((acc, cart) => acc + cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0), 0);
    }
  }

  // Serialize objects for client components
  const serializedDishes = dishes.map(d => ({
    ...d,
    _id: d._id.toString(),
    restaurantId: (d.restaurantId as any)._id.toString(),
    restaurantName: (d.restaurantId as any).name,
    restaurantSlug: (d.restaurantId as any).slug,
    categoryId: d.categoryId.toString(),
  }));

  const serializedCart = initialCart ? JSON.parse(JSON.stringify(initialCart)) : null;
  
  // Total overall dishes available in this category without search/type filters
  const totalCategoryDishes = await MenuItem.countDocuments({
    categoryId: { $in: categoryIds },
    restaurantId: { $in: activeRestaurantIds },
    isAvailable: true
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans pb-24">
      {/* Black/dark header mimicking existing style */}
      <div className="bg-[#111111] text-[#FFFFFF] pt-4 pb-8 rounded-b-[48px] relative overflow-hidden shadow-lg">
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
            <Link href="/restaurants" className="hover:text-[#FFE13C] transition-colors">Restaurants</Link>
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

        {/* Header Content */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-4 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-bold text-sm mb-6 transition-colors">
            <ChevronLeft size={18} /> Back to Home
          </Link>
          
          <div className="flex items-center gap-6">
            {categoryImage ? (
              <img src={categoryImage} alt={categoryName} className="w-24 h-24 rounded-2xl object-cover border-4 border-[#222222]" />
            ) : (
              <div className="w-20 h-20 bg-[#222222] rounded-2xl flex items-center justify-center text-4xl shadow-xl shadow-black/50">
                🍽️
              </div>
            )}
            <div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">{categoryName}</h1>
              <p className="text-gray-400 font-medium text-lg">Explore delicious {categoryName.toLowerCase()} from available restaurants.</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-bold bg-[#222222] w-fit px-4 py-1.5 rounded-full text-[#FFE13C]">
                {totalCategoryDishes} Dishes Available
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <CategoryClient 
          initialDishes={serializedDishes}
          initialTotal={totalDishes}
          initialCart={serializedCart}
          slug={slug}
        />
      </main>

      {/* Footer (Matches Existing Layout) */}
      <footer className="bg-[#111111] text-white pt-20 pb-8 px-4 lg:px-8 mt-12 rounded-t-[48px]">
        {/* Same standard footer content from app/page.tsx or layout could go here, simplified for brevity */}
        <div className="max-w-7xl mx-auto text-center border-t border-gray-800 pt-8 font-semibold text-sm text-[#8A98AB]">
          <p>Copyright © 2026 FOODDASH. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
