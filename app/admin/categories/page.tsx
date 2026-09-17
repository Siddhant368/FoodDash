"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      setCategories(categories.map(c => c._id === id ? { ...c, isActive: !current } : c));
      await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current })
      });
    } catch (error) {
      fetchCategories();
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/menu" className="p-2 rounded-xl bg-white border border-gray-200 text-[#111111] bg-white text-gray-500 hover:text-[#111111] hover:border-[#111111] transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#111111] tracking-tight">Categories</h1>
            <p className="text-gray-500 font-medium mt-1">Manage food categories for your menu.</p>
          </div>
        </div>
        <Link href="/admin/categories/create" className="bg-[#111111] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#FFE13C] hover:text-[#111111] transition-colors shadow-lg shadow-[#111111]/10 flex items-center gap-2 w-fit">
          <Plus size={18} /> Add Category
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-[#111111] mb-2">No categories found</h3>
            <p className="text-gray-500 mb-6">Create your first category to start organizing your menu.</p>
            <Link href="/admin/categories/create" className="text-[#111111] font-bold underline">Add Category</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="py-4 font-bold">Name</th>
                  <th className="py-4 font-bold">Slug</th>
                  <th className="py-4 font-bold">Status</th>
                  <th className="py-4 font-bold">Sort Order</th>
                  <th className="py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map(category => (
                  <tr key={category._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-bold text-[#111111]">{category.name}</td>
                    <td className="py-4 text-gray-600">{category.slug}</td>
                    <td className="py-4">
                      <button onClick={() => toggleStatus(category._id, category.isActive)} className={`flex items-center w-fit gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${category.isActive ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'}`}>
                        {category.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {category.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 text-gray-600">{category.sortOrder}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/categories/${category._id}/edit`} className="p-2 text-gray-400 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => deleteCategory(category._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
