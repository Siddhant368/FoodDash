"use client";

import React from "react";
import { X, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import { useLocation } from "./LocationContext";

export function LocationModal() {
  const { isModalOpen, setIsModalOpen, detectLocation, loading, error, location } = useLocation();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 pb-0 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#111111]">Set Location</h2>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <button 
            onClick={detectLocation}
            disabled={loading}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#FFE13C]/10 border border-[#FFE13C] hover:bg-[#FFE13C]/20 transition-colors disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-[#FFE13C] flex items-center justify-center flex-shrink-0">
              {loading ? (
                <RefreshCw size={20} className="text-[#111111] animate-spin" />
              ) : (
                <MapPin size={20} className="text-[#111111]" />
              )}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-[#111111]">
                {loading ? "Detecting your location..." : "Use Current Location"}
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Using GPS
              </p>
            </div>
          </button>

          {error && (
            <div className="flex gap-2 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {location && !error && !loading && (
            <div className="flex gap-2 p-4 rounded-xl bg-green-50 text-green-700 text-sm font-semibold border border-green-100">
              <p>Location selected successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
