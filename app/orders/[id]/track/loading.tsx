export default function LoadingTracker() {
  return (
    <div className="min-h-screen bg-[#FFFDF0] text-[#111111] font-sans pb-24">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-16 flex items-center justify-between shadow-sm lg:px-8">
        <div className="flex items-center gap-4 w-full">
          <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse"></div>
          <div className="h-6 w-48 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Status Skeleton */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-black/5 border border-gray-100 flex flex-col items-center justify-center py-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl"></div>
              
              <div className="w-16 h-16 bg-gray-100 rounded-full animate-pulse mb-6 relative z-10"></div>
              <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse mb-3 relative z-10"></div>
              <div className="h-4 w-64 bg-gray-100 rounded-lg animate-pulse mb-8 relative z-10"></div>
              <div className="h-10 w-40 bg-gray-50 border border-gray-100 rounded-full animate-pulse relative z-10"></div>
            </div>

            {/* Timeline Skeleton */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-black/5 border border-gray-100">
              <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse mb-10"></div>
              <div className="space-y-10 pl-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-5 items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse border-4 border-white shadow-sm"></div>
                    <div className="h-6 w-40 bg-gray-100 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Delivery Partner Skeleton */}
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-gray-100">
              <div className="h-7 w-48 bg-gray-100 rounded-xl animate-pulse mb-6"></div>
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-[20px] animate-pulse"></div>
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-5 w-3/4 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-32 bg-gray-100 rounded-full animate-pulse mt-2"></div>
                </div>
              </div>
            </div>

            {/* Restaurant & Order Info Skeleton */}
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-gray-100 space-y-5">
              <div className="h-7 w-56 bg-gray-100 rounded-xl animate-pulse mb-5"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-5 w-1/3 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-5 w-1/3 bg-gray-100 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Skeleton */}
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-gray-100 space-y-3">
              <div className="h-7 w-48 bg-gray-100 rounded-xl animate-pulse mb-5"></div>
              <div className="h-5 w-1/2 bg-gray-100 rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-1/3 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-4 w-full bg-gray-100 rounded-lg animate-pulse mt-3"></div>
              <div className="h-4 w-2/3 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
