import { Search, SlidersHorizontal, MapPin } from "lucide-react";

export default function LoadingRestaurants() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] animate-pulse">
      {/* Navbar Skeleton */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-200"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-md my-auto hidden md:block"></div>
          </div>
          <div className="hidden lg:flex gap-6">
            <div className="h-4 w-16 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-100 pb-6 pt-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <div className="h-6 w-32 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-12 w-64 md:w-96 bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-6 w-48 md:w-80 bg-gray-200 rounded-md"></div>
          </div>

          <div className="flex w-full md:w-auto flex-1 max-w-2xl gap-3">
            <div className="h-12 flex-1 bg-gray-200 rounded-full"></div>
            <div className="h-12 w-28 bg-gray-200 rounded-full hidden sm:block"></div>
          </div>

          <div className="mt-8 flex gap-3 overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-full flex-shrink-0"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="rounded-[32px] overflow-hidden bg-white border border-gray-100 shadow-sm flex flex-col h-[320px]">
              <div className="h-48 w-full bg-gray-200 p-2">
                <div className="w-full h-full bg-gray-300 rounded-[24px]"></div>
              </div>
              <div className="p-5 pt-3 flex-1 flex flex-col gap-3">
                <div className="h-6 w-3/4 bg-gray-200 rounded-md"></div>
                <div className="h-4 w-full bg-gray-200 rounded-md"></div>
                <div className="flex gap-3 mt-auto">
                  <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
