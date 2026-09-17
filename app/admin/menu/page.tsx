"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface MenuStats {
  totalItems: number;
  availableItems: number;
  unavailableItems: number;
  featuredItems: number;
  totalCategories: number;
}

interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  categoryId: { _id: string; name: string };
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number;
  image?: string;
}

export default function MenuPage() {
  const [stats, setStats] = useState<MenuStats | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [featured, setFeatured] = useState("all");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/menu/stats");
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories?active=true");
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/menu?page=${page}&limit=${limit}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (category !== "all") url += `&categoryId=${category}`;
      if (status !== "all") url += `&isAvailable=${status === "available"}`;
      if (type !== "all") url += `&isVeg=${type === "veg"}`;
      if (featured !== "all") url += `&isFeatured=${featured === "featured"}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setTotalPages(json.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch menu items", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, category, status, type, featured]);

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      setItems(items.map(item => item._id === id ? { ...item, isAvailable: !current } : item));
      await fetch(`/api/admin/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !current })
      });
      fetchStats();
    } catch (error) {
      console.error("Failed to toggle availability", error);
      fetchItems(); // Revert on failure
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      setItems(items.map(item => item._id === id ? { ...item, isFeatured: !current } : item));
      await fetch(`/api/admin/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !current })
      });
      fetchStats();
    } catch (error) {
      console.error("Failed to toggle featured", error);
      fetchItems(); // Revert on failure
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to remove this menu item?")) return;
    try {
      await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
      fetchItems();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight">Menu Management</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your restaurant categories and menu items.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/categories" className="bg-white border border-gray-200 text-[#111111] px-5 py-2.5 rounded-xl font-bold text-sm hover:border-[#111111] transition-colors flex items-center gap-2 shadow-sm">
             Categories
          </Link>
          <Link href="/admin/menu/create" className="bg-[#111111] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#FFE13C] hover:text-[#111111] transition-colors shadow-lg shadow-[#111111]/10 flex items-center gap-2">
            <Plus size={18} /> Add Menu Item
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm font-bold">Total Items</p>
            <p className="text-2xl font-black text-[#111111]">{stats.totalItems}</p>
          </div>
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm font-bold">Available</p>
            <p className="text-2xl font-black text-green-600">{stats.availableItems}</p>
          </div>
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm font-bold">Unavailable</p>
            <p className="text-2xl font-black text-red-500">{stats.unavailableItems}</p>
          </div>
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm font-bold">Categories</p>
            <p className="text-2xl font-black text-[#111111]">{stats.totalCategories}</p>
          </div>
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm font-bold">Featured</p>
            <p className="text-2xl font-black text-yellow-500">{stats.featuredItems}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search menu items..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C]">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C]">
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C]">
            <option value="all">All Types</option>
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
          </select>
          <select value={featured} onChange={(e) => { setFeatured(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE13C]">
            <option value="all">Featured: Any</option>
            <option value="featured">Featured Only</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-[#111111] mb-2">No menu items match your filters</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearch(""); setCategory("all"); setStatus("all"); setType("all"); setFeatured("all"); }} className="text-[#111111] font-bold underline">Clear Filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="py-4 font-bold">Image</th>
                  <th className="py-4 font-bold">Food Name</th>
                  <th className="py-4 font-bold">Category</th>
                  <th className="py-4 font-bold">Price</th>
                  <th className="py-4 font-bold">Type</th>
                  <th className="py-4 font-bold">Availability</th>
                  <th className="py-4 font-bold">Featured</th>
                  <th className="py-4 font-bold">Time</th>
                  <th className="py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      {item.image ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">No Img</div>
                      )}
                    </td>
                    <td className="py-4 font-bold text-[#111111]">{item.name}</td>
                    <td className="py-4 text-gray-600">{item.categoryId?.name}</td>
                    <td className="py-4 font-bold text-[#111111]">₹{item.price}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="py-4">
                      <button onClick={() => toggleAvailability(item._id, item.isAvailable)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${item.isAvailable ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'}`}>
                        {item.isAvailable ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="py-4">
                      <button onClick={() => toggleFeatured(item._id, item.isFeatured)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${item.isFeatured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        <Star size={14} className={item.isFeatured ? "fill-yellow-500" : ""} />
                        {item.isFeatured ? 'ON' : 'OFF'}
                      </button>
                    </td>
                    <td className="py-4 text-gray-600 text-sm">{item.preparationTime}m</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/menu/${item._id}/edit`} className="p-2 text-gray-400 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => deleteItem(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
        
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-6 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Show</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border border-gray-200 text-[#111111] bg-white rounded-lg px-2 py-1 focus:outline-none">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-gray-200 text-[#111111] bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-[#111111]">
              Page {page} of {totalPages || 1}
            </span>
            <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-gray-200 text-[#111111] bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
