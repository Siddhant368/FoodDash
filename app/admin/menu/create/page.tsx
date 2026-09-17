"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CreateMenuItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categoryId: "",
    description: "",
    price: "",
    image: "",
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    preparationTime: "20"
  });

  useEffect(() => {
    fetch("/api/admin/categories?active=true")
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: json.data[0]._id }));
          }
        }
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (name === "name" && !formData.slug) {
        setFormData(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime, 10)
      };

      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success) {
        router.push("/admin/menu");
      } else {
        if (json.errors) setFieldErrors(json.errors);
        else setError(json.message || "Failed to create menu item.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/menu" className="p-2 rounded-xl bg-white border border-gray-200 text-[#111111] bg-white text-gray-500 hover:text-[#111111] hover:border-[#111111] transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight">Add Menu Item</h1>
          <p className="text-gray-500 font-medium mt-1">Create a new food item for your menu.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#111111]">Food Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C]" placeholder="e.g. Paneer Tikka Pizza" />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#111111]">Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C]" placeholder="e.g. paneer-tikka-pizza" />
              {fieldErrors.slug && <p className="text-red-500 text-xs mt-1">{fieldErrors.slug[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#111111]">Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C]">
                {categories.length === 0 && <option value="">No categories available</option>}
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {fieldErrors.categoryId && <p className="text-red-500 text-xs mt-1">{fieldErrors.categoryId[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#111111]">Price (₹)</label>
              <input type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C]" placeholder="e.g. 299" />
              {fieldErrors.price && <p className="text-red-500 text-xs mt-1">{fieldErrors.price[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#111111]">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C] resize-none" placeholder="Description..."></textarea>
            {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description[0]}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#111111]">Image URL (Optional)</label>
              <input type="text" name="image" value={formData.image} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C]" placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#111111]">Preparation Time (mins)</label>
              <input type="number" min="1" name="preparationTime" value={formData.preparationTime} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C]" />
            </div>
          </div>

          <div className="flex gap-8 py-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isVeg" checked={formData.isVeg} onChange={handleChange} className="w-5 h-5 rounded text-[#111111] focus:ring-[#FFE13C]" />
              <span className="font-bold text-[#111111] text-sm">Veg</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="w-5 h-5 rounded text-[#111111] focus:ring-[#FFE13C]" />
              <span className="font-bold text-[#111111] text-sm">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 rounded text-[#111111] focus:ring-[#FFE13C]" />
              <span className="font-bold text-[#111111] text-sm">Featured</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={loading} className="bg-[#111111] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#FFE13C] hover:text-[#111111] transition-colors shadow-lg shadow-[#111111]/10 flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Saving..." : "Add Menu Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
