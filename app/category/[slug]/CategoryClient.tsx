"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import { Search, Info, SlidersHorizontal, ChevronDown, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/app/restaurants/[id]/AddToCartButton";

export default function CategoryClient({ initialDishes, initialTotal, initialCart, slug }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams?.get("q") || "");
  const currentType = searchParams?.get("type") || "all";
  const currentSort = searchParams?.get("sort") || "popular";

  // Debounced Search using useEffect
  useEffect(() => {
    const currentQ = searchParams?.get("q") || "";
    if (searchTerm === currentQ) return; // Prevent infinite loop and redundant routing

    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }
      params.set("page", "1"); // Reset page on search
      router.push(`/category/${slug}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, router, searchParams, slug]);

  const handleType = (type: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    params.set("page", "1");
    router.push(`/category/${slug}?${params.toString()}`);
  };

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (sort === "popular") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    params.set("page", "1");
    router.push(`/category/${slug}?${params.toString()}`);
  };

  const getInitialQuantity = (menuItemId: string) => {
    if (!initialCart) return 0;
    const item = initialCart.items?.find((i: any) => i.menuItemId.toString() === menuItemId);
    return item ? item.quantity : 0;
  };

  const types = [
    { id: "all", label: "All" },
    { id: "veg", label: "Veg" },
    { id: "non-veg", label: "Non-Veg" },
  ];

  return (
    <div className="space-y-8">
      {/* Controls: Search, Filter, Sort */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white p-4 lg:p-6 rounded-[24px] border border-gray-100 shadow-sm">
        
        {/* Search */}
        <div className="w-full lg:w-1/3 bg-[#FAFAF8] rounded-xl flex items-center px-4 py-3 border border-gray-200">
          <Search size={20} className="text-gray-400 mr-3 shrink-0" />
          <input 
            type="text" 
            placeholder="Search in this category..." 
            className="w-full bg-transparent outline-none font-medium text-[#111111] placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
          {/* Type Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide shrink-0">
            {types.map(t => (
              <button 
                key={t.id}
                onClick={() => handleType(t.id)}
                className={`whitespace-nowrap font-bold text-sm px-5 py-2.5 rounded-full transition-all border ${currentType === t.id ? "bg-[#FFE13C] text-[#111111] border-[#FFE13C]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-[#111111]"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 border-l-0 sm:border-l border-gray-200 sm:pl-6">
            <span className="text-sm font-bold text-gray-500 hidden sm:block">Sort By:</span>
            <div className="relative w-full sm:w-48">
              <select 
                value={currentSort}
                onChange={(e) => handleSort(e.target.value)}
                className="w-full appearance-none bg-[#FAFAF8] border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#111111] focus:outline-none focus:border-[#FFE13C] cursor-pointer"
              >
                <option value="popular">Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="time">Preparation Time</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-[#111111]">{initialTotal} Dishes Found</h2>
      </div>

      {/* Empty State */}
      {initialDishes.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-gray-100 py-20 px-4 text-center shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🍽️</span>
          </div>
          <h3 className="text-2xl font-black text-[#111111] mb-2 uppercase">No dishes available</h3>
          <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">There are currently no available dishes matching your filters in this category.</p>
          <button 
            onClick={() => {
              setSearchTerm("");
              router.push(`/category/${slug}`);
            }}
            className="bg-[#FFE13C] text-[#111111] font-black px-8 py-4 rounded-full hover:scale-105 transition-transform"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Food Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {initialDishes.map((item: any) => (
            <div key={item._id} className="group bg-white rounded-[24px] border border-gray-100 p-4 hover:shadow-xl hover:shadow-black/5 transition-all flex flex-col h-full">
              {/* Image */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-50">
                {item.image ? (
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl opacity-20">🍽️</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <div className={`bg-white px-2 py-1 rounded-md shadow-sm border flex items-center justify-center ${item.isVeg ? 'border-green-600/30' : 'border-red-600/30'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  </div>
                  {item.isFeatured && (
                    <div className="bg-[#FFE13C] text-[#111111] px-2 py-1 rounded-md shadow-sm text-xs font-black uppercase tracking-wider">
                      Featured
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col px-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-black text-lg text-[#111111] line-clamp-1">{item.name}</h3>
                </div>
                
                <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-3 min-h-[40px]">{item.description}</p>
                
                <Link href={`/restaurants/${item.restaurantId}`} className="flex items-center gap-1 text-sm font-semibold text-[#111111] bg-gray-50 hover:bg-gray-100 w-fit px-2.5 py-1 rounded-lg mb-4 transition-colors">
                  <MapPin size={14} className="text-gray-400" /> 
                  <span className="truncate max-w-[140px]">{item.restaurantName}</span>
                </Link>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="font-black text-xl text-[#111111]">₹{item.price.toFixed(2)}</span>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">⏱ {item.preparationTime || 20} min</p>
                  </div>
                  <AddToCartButton 
                    item={item} 
                    restaurantId={item.restaurantId} 
                    initialQuantity={getInitialQuantity(item._id)} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
