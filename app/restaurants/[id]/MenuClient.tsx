"use client";

import Image from "next/image";
import { useState } from "react";
import { Search, Star } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

export default function MenuClient({ categories, menuItems, restaurantId, initialCart, isOpen }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const getInitialQuantity = (menuItemId: string) => {
    if (!initialCart) return 0;
    const item = initialCart.items?.find((i: any) => i.menuItemId.toString() === menuItemId.toString());
    return item ? item.quantity : 0;
  };

  const filteredItems = menuItems.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl flex items-center px-4 py-3 shadow-sm border border-gray-200">
          <Search size={20} className="text-[#111111] mr-3" />
          <input 
            type="text" 
            placeholder="Search in this restaurant..." 
            className="w-full bg-transparent outline-none font-medium text-[#111111] placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sticky Category Navigation */}
      <div className="sticky top-16 z-40 bg-[#FAFAF8]/95 backdrop-blur-md pt-4 pb-4 border-b border-gray-200 flex items-center gap-4 mb-8">
        <div className="flex overflow-x-auto scrollbar-hide gap-3 w-full">
          <button 
            onClick={() => { setActiveCategory("all"); document.getElementById("all")?.scrollIntoView({ behavior: "smooth" }); }}
            className={`whitespace-nowrap font-bold text-sm px-5 py-2.5 rounded-full transition-colors ${activeCategory === "all" ? "bg-[#FFE13C] text-[#111111]" : "bg-white border border-gray-200 text-[#111111] hover:bg-gray-50"}`}
          >
            All
          </button>
          {categories.map((cat: any) => {
            const hasItems = filteredItems.some((i: any) => i.categoryId.toString() === cat._id.toString());
            if (!hasItems) return null;
            return (
              <button 
                key={cat._id.toString()} 
                onClick={() => { setActiveCategory(cat._id.toString()); document.getElementById(`cat-${cat._id}`)?.scrollIntoView({ behavior: "smooth" }); }}
                className={`whitespace-nowrap font-bold text-sm px-5 py-2.5 rounded-full transition-colors ${activeCategory === cat._id.toString() ? "bg-[#FFE13C] text-[#111111]" : "bg-white border border-gray-200 text-[#111111] hover:bg-gray-50"}`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* EXPLORE THE MENU */}
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase">EXPLORE THE MENU</h2>
        <p className="text-gray-500 font-medium">Freshly prepared favorites, made for you.</p>
      </div>

      {/* Menu Sections */}
      <div className="space-y-12" id="all">
        {/* Popular Section */}
        {!searchTerm && menuItems.some((i: any) => i.isFeatured) && (
          <section id="featured" className="scroll-mt-36">
            <h2 className="text-xl lg:text-2xl font-black mb-6 uppercase">Popular at this restaurant</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {menuItems.filter((i: any) => i.isFeatured).map((item: any) => (
                <MenuCard key={'feat-'+item._id.toString()} item={item} getInitialQuantity={getInitialQuantity} restaurantId={restaurantId} isOpen={isOpen} />
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        {categories.map((category: any) => {
          const items = filteredItems.filter((item: any) => item.categoryId.toString() === category._id.toString());
          if (items.length === 0) return null;

          return (
            <section key={category._id.toString()} id={`cat-${category._id}`} className="scroll-mt-36">
              <h2 className="text-xl lg:text-2xl font-black mb-6 uppercase text-[#111111] border-b-2 border-gray-100 pb-2">
                {category.name}
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {items.map((item: any) => (
                  <MenuCard key={item._id.toString()} item={item} getInitialQuantity={getInitialQuantity} restaurantId={restaurantId} isOpen={isOpen} />
                ))}
              </div>
            </section>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-500 font-medium text-lg">No items found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuCard({ item, getInitialQuantity, restaurantId, isOpen }: any) {
  return (
    <div className="group flex gap-4 p-4 lg:p-5 rounded-3xl bg-white border border-gray-100 hover:shadow-xl hover:shadow-black/5 hover:border-gray-200 transition-all relative flex-col sm:flex-row h-full">
      <div className="flex-1 order-2 sm:order-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1.5">
          <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
          </div>
          <h3 className="font-black text-lg text-[#111111]">{item.name}</h3>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium">{item.description}</p>
        <div className="flex items-center gap-3 mt-auto">
          <span className="font-black text-lg text-[#111111]">₹{item.price.toFixed(2)}</span>
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{item.preparationTime || 15} min</span>
        </div>
      </div>
      
      <div className="relative w-full sm:w-[130px] flex-shrink-0 flex flex-col items-center order-1 sm:order-2 mb-6 sm:mb-0">
        <div className="relative w-full aspect-[4/3] rounded-2xl border border-gray-100 overflow-hidden bg-gray-50">
          {item.image ? (
            <Image 
              src={item.image} 
              alt={item.name} 
              fill 
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 130px" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Star className="opacity-20" size={32} />
            </div>
          )}
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
            {!isOpen ? (
                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm whitespace-nowrap">Closed</span>
            ) : !item.isAvailable ? (
                <span className="bg-red-50 text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-100 shadow-sm whitespace-nowrap">Unavailable</span>
            ) : (
                <AddToCartButton item={item} restaurantId={restaurantId} initialQuantity={getInitialQuantity(item._id.toString())} />
            )}
        </div>
      </div>
    </div>
  );
}
