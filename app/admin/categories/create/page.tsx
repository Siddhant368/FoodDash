"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sortOrder: 0,
    isActive: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from name
      if (name === "name") {
        setFormData(prev => ({
          ...prev,
          slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          sortOrder: Number(formData.sortOrder)
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        router.push("/admin/menu");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch {
      alert("Error creating category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/menu" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight">Add New Category</h1>
          <p className="text-gray-500 font-medium mt-1">Create a new category for your menu items.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
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
                placeholder="e.g. Main Course" 
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
                placeholder="e.g. main-course" 
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
                placeholder="0" 
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
            disabled={loading}
            className="w-full bg-[#111111] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#FFE13C] hover:text-[#111111] transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>
    </div>
  );
}
