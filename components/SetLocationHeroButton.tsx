"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { useLocation } from "./LocationContext";

export function SetLocationHeroButton() {
  const { location, setIsModalOpen } = useLocation();

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        setIsModalOpen(true);
      }}
      className="hidden sm:flex items-center px-4 border-l border-gray-100 h-8 hover:bg-gray-50 transition-colors"
      type="button"
    >
      <MapPin size={20} className={location ? "text-green-500 mr-2" : "text-[#8A98AB] mr-2"} />
      <span className="text-sm font-bold text-[#111111]">
        {location ? "Location Selected" : "Set Location"}
      </span>
    </button>
  );
}

