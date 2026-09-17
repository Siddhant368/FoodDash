export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans pb-24 animate-pulse">
      <div className="bg-[#111111] pt-4 pb-8 rounded-b-[48px] relative overflow-hidden shadow-lg h-[250px]">
         <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-4">
            <div className="w-24 h-4 bg-gray-700 rounded mb-6"></div>
            <div className="flex items-center gap-6">
               <div className="w-24 h-24 bg-gray-700 rounded-2xl"></div>
               <div>
                 <div className="w-48 h-10 bg-gray-700 rounded mb-2"></div>
                 <div className="w-64 h-4 bg-gray-700 rounded"></div>
               </div>
            </div>
         </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="bg-white p-4 lg:p-6 rounded-[24px] border border-gray-100 shadow-sm h-24 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-[24px] border border-gray-100 p-4 h-[350px]">
              <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4"></div>
              <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
              <div className="w-full h-4 bg-gray-200 rounded mb-4"></div>
              <div className="w-1/2 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
