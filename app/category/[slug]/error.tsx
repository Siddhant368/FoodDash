"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-[32px] border border-gray-100 p-10 max-w-lg w-full text-center shadow-sm">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black mb-3 text-[#111111] uppercase">Something went wrong.</h2>
        <p className="text-gray-500 font-medium mb-8">Unable to load dishes right now.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition-colors border border-gray-200">
            Go Home
          </Link>
          <button
            onClick={() => reset()}
            className="bg-[#FFE13C] text-[#111111] font-black px-6 py-3 rounded-full hover:scale-105 transition-transform"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
