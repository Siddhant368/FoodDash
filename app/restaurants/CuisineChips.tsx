"use client";

import { useRouter, useSearchParams } from "next/navigation";

const cuisines = [
  "All",
  "Rajasthani",
  "Dal Bati",
  "Indian",
  "North Indian",
  "Thali",
  "Fast Food",
  "Desserts",
  "Beverages"
];

export default function CuisineChips({ currentCuisine }: { currentCuisine: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCuisine = (cuisine: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = cuisine.toLowerCase();
    if (val === "all") {
      params.delete("cuisine");
    } else {
      params.set("cuisine", val);
    }
    router.push(`/restaurants?${params.toString()}`);
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-400 mb-3 tracking-wide">Popular Cuisines:</h3>
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
        {cuisines.map((c) => {
          const isActive = currentCuisine === c.toLowerCase() || (c === 'All' && currentCuisine === 'all');
          return (
            <button
              key={c}
              onClick={() => handleCuisine(c)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                isActive 
                  ? "bg-[#FFE13C] text-[#111111] border-[#FFE13C]" 
                  : "bg-transparent text-gray-400 border-white/20 hover:border-white/50 hover:text-white"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
