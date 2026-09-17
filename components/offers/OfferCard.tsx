"use client";

import { useState } from "react";
import { Copy, CheckCircle, Tag } from "lucide-react";
import moment from "moment-timezone";

interface OfferCardProps {
  offer: {
    _id: string;
    title: string;
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    maxDiscount?: number;
    minOrderAmount: number;
    endDate: string;
  };
  onApply?: (code: string) => void;
  isApplying?: boolean;
}

export default function OfferCard({ offer, onApply, isApplying }: OfferCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDiscountText = () => {
    if (offer.discountType === "PERCENTAGE") return `${offer.discountValue}% OFF`;
    if (offer.discountType === "FLAT") return `₹${offer.discountValue} OFF`;
    return "FREE DELIVERY";
  };

  const validUntil = moment(offer.endDate).tz("Asia/Kolkata").format("DD MMM YYYY");

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFE13C]/10 rounded-bl-full -z-10 group-hover:bg-[#FFE13C]/20 transition-colors" />
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag size={16} className="text-[#FFE13C]" fill="currentColor" />
            <h3 className="font-black text-[#111111] text-lg">{offer.title}</h3>
          </div>
          <p className="text-2xl font-black text-[#111111] mb-1">{getDiscountText()}</p>
          <p className="text-sm text-gray-500 line-clamp-2">{offer.description}</p>
        </div>
      </div>

      <div className="mt-5 space-y-1.5 border-t border-dashed border-gray-200 pt-4">
        <p className="text-sm text-gray-600">
          <span className="font-bold text-[#111111]">Min Order:</span> ₹{offer.minOrderAmount}
        </p>
        {offer.maxDiscount && (
          <p className="text-sm text-gray-600">
            <span className="font-bold text-[#111111]">Max Discount:</span> ₹{offer.maxDiscount}
          </p>
        )}
        <p className="text-sm text-gray-600">
          <span className="font-bold text-[#111111]">Valid until:</span> {validUntil}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-between px-4 py-2.5">
          <span className="font-mono font-bold text-gray-800 text-lg tracking-wider">{offer.code}</span>
          <button 
            onClick={handleCopy}
            className="text-gray-500 hover:text-[#111111] transition-colors p-1"
            title="Copy code"
          >
            {copied ? <CheckCircle size={20} className="text-green-600" /> : <Copy size={20} />}
          </button>
        </div>
        
        {onApply && (
          <button
            onClick={() => onApply(offer.code)}
            disabled={isApplying}
            className="bg-[#111111] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#FFE13C] hover:text-[#111111] transition-colors disabled:opacity-50 shadow-lg shadow-[#111111]/10"
          >
            {isApplying ? "Applying..." : "Apply"}
          </button>
        )}
      </div>
    </div>
  );
}
