"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import moment from "moment-timezone";

export default function EditOfferPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxDiscount: "",
    minOrderAmount: "0",
    applicableTo: "ALL",
    startDate: "",
    endDate: "",
    usageLimit: "",
    perCustomerLimit: "1",
    isActive: true
  });

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await fetch(`/api/admin/offers/${params.id}`);
        const json = await res.json();
        if (json.success) {
          const data = json.data;
          setFormData({
            ...data,
            startDate: moment(data.startDate).format("YYYY-MM-DD"),
            endDate: moment(data.endDate).format("YYYY-MM-DD"),
            maxDiscount: data.maxDiscount || "",
            usageLimit: data.usageLimit || "",
          });
        } else {
          setError(json.message);
        }
      } catch (err: any) {
        setError("Failed to load offer");
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        minOrderAmount: Number(formData.minOrderAmount),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        perCustomerLimit: Number(formData.perCustomerLimit)
      };

      const res = await fetch(`/api/admin/offers/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        router.push("/admin/offers");
        router.refresh();
      } else {
        setError(json.message || "Failed to update offer");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 flex justify-center"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/offers" className="p-2 rounded-xl bg-white border border-gray-200 text-[#111111] hover:text-[#111111] hover:border-[#111111] transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight">Edit Offer</h1>
          <p className="text-gray-500 font-medium mt-1">Update discount code or promotion.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Offer Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all text-[#111111] bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Coupon Code</label>
              <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all uppercase text-[#111111] bg-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all text-[#111111] bg-white" rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Discount Type</label>
              <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all bg-white text-[#111111]">
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat Amount</option>
                <option value="FREE_DELIVERY">Free Delivery</option>
              </select>
            </div>
            {formData.discountType !== "FREE_DELIVERY" && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Discount Value</label>
                <input type="number" required min="0" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all text-[#111111] bg-white" />
              </div>
            )}
            {formData.discountType === "PERCENTAGE" && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Max Discount (₹)</label>
                <input type="number" min="0" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all text-[#111111] bg-white" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Minimum Order Amount (₹)</label>
              <input type="number" required min="0" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all text-[#111111] bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Applicable To</label>
              <select value={formData.applicableTo} onChange={e => setFormData({...formData, applicableTo: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all bg-white text-[#111111]">
                <option value="ALL">All Items</option>
                <option value="CATEGORY">Specific Categories</option>
                <option value="MENU_ITEM">Specific Menu Items</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Start Date</label>
              <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">End Date</label>
              <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Total Usage Limit</label>
              <input type="number" min="1" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all" placeholder="Leave empty for unlimited" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Per Customer Limit</label>
              <input type="number" required min="1" value={formData.perCustomerLimit} onChange={e => setFormData({...formData, perCustomerLimit: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-3 py-4">
             <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-[#111111] rounded" />
             <label htmlFor="isActive" className="font-bold text-[#111111]">Offer is Active</label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={saving} className="bg-[#111111] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#FFE13C] hover:text-[#111111] transition-all shadow-lg shadow-[#111111]/10 flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {saving ? "Updating..." : "Update Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
