"use client";

import React from "react";
import { MapPin, ChevronRight, Check } from "lucide-react";
import { useLocation } from "./LocationContext";

interface Props {
  className?: string;
  isDark?: boolean;
}

export function SetLocationButton({ className = "", isDark = true }: Props) {
  const { location, setIsModalOpen } = useLocation();

  return (
    <button 
    
      onClick={() => setIsModalOpen(true)}
      className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        isDark 
          ? "bg-[#222222] hover:bg-[#333333] text-white" 
          : "bg-white hover:bg-gray-50 border border-gray-200 text-[#111111]"
      } ${className}`}
    >
      <MapPin size={16} className="text-[#FFE13C]" />
      <span>{location ? "Location Selected" : "Set Location"}</span>
      {location ? (
        <Check size={16} className="text-green-500" />
      ) : (
        <ChevronRight size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />
      )}
    </button>
  );
}
