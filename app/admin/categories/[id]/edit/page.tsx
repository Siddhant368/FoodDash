"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { use } from "react";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sortOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetch(`/api/admin/categories/${resolvedParams.id}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setFormData({
            name: json.data.name,
            slug: json.data.slug,
            sortOrder: json.data.sortOrder,
            isActive: json.data.isActive
          });
        } else {
          setError(json.message || "Failed to load category");
        }
      })
      .catch(() => setError("An unexpected error occurred"))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    try {
      const res = await fetch(`/api/admin/categories/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sortOrder: Number(formData.sortOrder)
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        router.push("/admin/categories");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("Error updating category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight">Edit Category</h1>
          <p className="text-gray-500 font-medium mt-1">Update category details.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
              <input 
                required
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#FAFAF8] border border-gray-200 text-[#111111] bg-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFE13C]" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Slug</label>
              <input 
                required
                type="text" 
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-[#FAFAF8] border border-gray-200 text-[#111111] bg-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFE13C]" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Sort Order</label>
              <input 
                required
                type="number" 
                name="sortOrder"
                min="0"
                value={formData.sortOrder}
                onChange={handleChange}
                className="w-full bg-[#FAFAF8] border border-gray-200 text-[#111111] bg-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFE13C]" 
              />
            </div>
            
            <div className="flex flex-col justify-center mt-2">
              <label className="flex items-center gap-2 cursor-pointer mt-5">
                <input 
                  type="checkbox" 
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 accent-[#FFE13C]" 
                />
                <span className="text-sm font-bold text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-[#111111] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#FFE13C] hover:text-[#111111] transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
