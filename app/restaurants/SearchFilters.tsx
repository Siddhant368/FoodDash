"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export default function SearchFilters({ currentFilter }: { currentFilter: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (filter: string) => {
    const params = new URLSearchParams((searchParams || new URLSearchParams()).toString());
    if (filter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filter);
    }
    router.push(`/restaurants?${params.toString()}`);
  };

  const handleSort = (sort: string) => {
    const params = new URLSearchParams((searchParams || new URLSearchParams()).toString());
    if (sort === "recommended") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    router.push(`/restaurants?${params.toString()}`);
  };

  const filters = [
    { id: "all", label: "All" },
    { id: "open", label: "Open Now" },
    { id: "veg", label: "Pure Veg" },
    { id: "rating", label: "Rating 4+" },
    { id: "fast", label: "Fast Delivery" },
  ];

  const currentSort = (searchParams || new URLSearchParams()).get("sort") || "recommended";

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
      
      {/* Left: Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 mr-2 flex-shrink-0 lg:hidden shadow-sm">
           <SlidersHorizontal size={16} />
        </div>
        {filters.map((f) => {
          const isActive = currentFilter === f.id || (f.id === 'all' && currentFilter === 'all');
          return (
            <button 
              key={f.id} 
              onClick={() => handleFilter(f.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all border shadow-sm ${
                isActive 
                  ? "bg-[#FFE13C] text-[#111111] border-[#FFE13C]" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-[#111111]"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Right: Sort Dropdown (Simulated) */}
      <div className="flex items-center gap-3 w-full lg:w-auto">
        <span className="text-sm font-bold text-gray-500 hidden sm:block">Sort by:</span>
        <div className="relative flex-1 lg:flex-none">
          <select 
            value={currentSort}
            onChange={(e) => handleSort(e.target.value)}
            className="w-full lg:w-48 appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#111111] shadow-sm focus:outline-none focus:border-[#FFE13C] cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Rating</option>
            <option value="delivery_time">Delivery Time</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
      
    </div>
  );
}
