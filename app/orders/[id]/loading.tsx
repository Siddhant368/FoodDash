import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SetLocationButton } from "@/components/SetLocationButton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans pb-24">
      {/* Navbar skeleton */}
      <div className="bg-[#111111] text-[#FFFDF0]">
        <header className="px-4 py-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE13C]/20 animate-pulse text-[#111111]"></div>
            <div className="h-6 w-32 bg-white/10 rounded animate-pulse"></div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-[#FFE13C]/30 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
          </nav>
          
          <div className="flex items-center gap-4">
             <div className="h-10 w-32 bg-white/10 rounded-full animate-pulse"></div>
             <div className="h-12 w-12 bg-white/10 rounded-full animate-pulse"></div>
             <div className="h-12 w-20 bg-white/10 rounded-full animate-pulse"></div>
          </div>
        </header>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 lg:px-8 space-y-6">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>

        {/* Header Skeleton */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-12 w-36 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-12 w-32 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* Status Skeleton */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="h-6 w-40 bg-gray-200 rounded mb-6 animate-pulse"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items Skeleton */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="h-6 w-32 bg-gray-200 rounded mb-6 animate-pulse"></div>
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Restaurant Skeleton */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Address Skeleton */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-3">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Payment Skeleton */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="h-4 w-36 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Summary Skeleton */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
