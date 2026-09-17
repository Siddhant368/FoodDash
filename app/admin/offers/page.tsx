"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import moment from "moment-timezone";

interface Offer {
  _id: string;
  title: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  applicableTo: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usedCount: number;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/offers");
      const json = await res.json();
      if (json.success) setOffers(json.data);
    } catch (error) {
      console.error("Failed to fetch offers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      setOffers(offers.map(o => o._id === id ? { ...o, isActive: !current } : o));
      await fetch(`/api/admin/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current })
      });
    } catch (error) {
      fetchOffers();
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
      fetchOffers();
    } catch (error) {
      console.error("Failed to delete offer", error);
    }
  };

  const getStatus = (offer: Offer) => {
    if (!offer.isActive) return { label: "Disabled", color: "bg-gray-100 text-gray-600" };
    const now = moment().tz("Asia/Kolkata");
    const start = moment(offer.startDate).tz("Asia/Kolkata").startOf("day");
    const end = moment(offer.endDate).tz("Asia/Kolkata").endOf("day");

    if (now.isBefore(start)) return { label: "Scheduled", color: "bg-blue-100 text-blue-700" };
    if (now.isAfter(end)) return { label: "Expired", color: "bg-red-100 text-red-700" };
    return { label: "Active", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-xl bg-white border border-gray-200 text-[#111111] hover:text-[#111111] hover:border-[#111111] transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#111111] tracking-tight">Offers & Coupons</h1>
            <p className="text-gray-500 font-medium mt-1">Manage discounts and promotions for your customers.</p>
          </div>
        </div>
        <Link href="/admin/offers/create" className="bg-[#111111] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#FFE13C] hover:text-[#111111] transition-colors shadow-lg shadow-[#111111]/10 flex items-center gap-2 w-fit">
          <Plus size={18} /> Create Offer
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-[#111111] mb-2">No offers found</h3>
            <p className="text-gray-500 mb-6">Create your first offer to start running promotions.</p>
            <Link href="/admin/offers/create" className="text-[#111111] font-bold underline">Create Offer</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="py-4 font-bold">Offer Title</th>
                  <th className="py-4 font-bold">Coupon Code</th>
                  <th className="py-4 font-bold">Discount</th>
                  <th className="py-4 font-bold">Min. Order</th>
                  <th className="py-4 font-bold">Applicable To</th>
                  <th className="py-4 font-bold">Usage</th>
                  <th className="py-4 font-bold">Status</th>
                  <th className="py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {offers.map(offer => {
                  const status = getStatus(offer);
                  return (
                    <tr key={offer._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-bold text-[#111111]">{offer.title}</td>
                      <td className="py-4">
                        <span className="font-mono bg-gray-100 text-gray-900 px-2 py-1 rounded-md text-sm font-semibold">{offer.code}</span>
                      </td>
                      <td className="py-4 text-gray-600">
                        {offer.discountType === "PERCENTAGE" ? `${offer.discountValue}%` : offer.discountType === "FLAT" ? `₹${offer.discountValue}` : "Free Delivery"}
                      </td>
                      <td className="py-4 text-gray-600">₹{offer.minOrderAmount}</td>
                      <td className="py-4 text-gray-600 capitalize">{offer.applicableTo.replace("_", " ").toLowerCase()}</td>
                      <td className="py-4 text-gray-600">{offer.usedCount}</td>
                      <td className="py-4">
                        <button onClick={() => toggleStatus(offer._id, offer.isActive)} className={`flex items-center w-fit px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${status.color}`}>
                          {status.label}
                        </button>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/offers/${offer._id}/edit`} className="p-2 text-gray-400 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit size={18} />
                          </Link>
                          <button onClick={() => deleteOffer(offer._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
