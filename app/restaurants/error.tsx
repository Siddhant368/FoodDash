"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function RestaurantsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Restaurants Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-xl shadow-black/5 max-w-md w-full">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={36} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black mb-3 text-[#111111]">Unable to load restaurants</h2>
        <p className="text-gray-500 font-medium mb-8">
          We encountered an error while trying to fetch the restaurant list. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="w-full inline-flex items-center justify-center bg-[#FFE13C] hover:bg-yellow-400 text-[#111111] font-bold px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-[#FFE13C]/20"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
