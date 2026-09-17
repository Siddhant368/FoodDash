"use client";

import { User, Wallet, Bell, XCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm text-center mb-6">
        <div className="w-28 h-28 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#FFE13C]">
          <User size={48} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-black text-[#111111]">Rajesh Singh</h2>
        <p className="text-gray-500 font-medium">Delivery Partner</p>
        <div className="mt-4">
           <span className="bg-green-100 text-green-800 text-sm font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
           </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center gap-4 cursor-pointer hover:bg-gray-50">
          <div className="bg-gray-100 p-3 rounded-xl"><User size={20} /></div>
          <div><p className="font-bold">Personal Information</p></div>
        </div>
        <div className="p-5 border-b border-gray-50 flex items-center gap-4 cursor-pointer hover:bg-gray-50 text-red-600">
          <div className="bg-red-50 p-3 rounded-xl"><XCircle size={20} /></div>
          <div><p className="font-bold">Logout</p></div>
        </div>
      </div>
    </div>
  );
}