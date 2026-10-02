"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function HeroSearch({ isCompact = false }: { isCompact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQ = (searchParams || new URLSearchParams()).get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQ);

  useEffect(() => {
    const currentQ = (searchParams || new URLSearchParams()).get("q") || "";
    if (searchTerm === currentQ) return;

    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams((searchParams || new URLSearchParams()).toString());
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }
      router.push(`/restaurants?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, router, searchParams]);

  return (
    <input 
      type="text" 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search for restaurants, dishes, cuisines..." 
      className={`bg-transparent outline-none w-full font-medium ${isCompact ? 'text-white placeholder-gray-500 text-sm' : 'text-[#111111] placeholder-gray-400 text-base lg:text-lg'}`}
    />
  );
}
