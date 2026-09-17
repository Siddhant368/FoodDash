"use client";

import { useState, useEffect } from "react";
import { Plus, X, ArrowLeft, ArrowRight, Check, Eye, Pencil, Search, Filter, AlertCircle, Ban } from "lucide-react";

export default function UsersPage() {
  const [view, setView] = useState<"list" | "create" | "view">("list");
  const [users, setUsers] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [restaurantFilter, setRestaurantFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Creation Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "RESTAURANT_ADMIN",
    restaurantId: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (view === "list") fetchUsers();
  }, [view, page, roleFilter, restaurantFilter, statusFilter]);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/super-admin/restaurants?limit=1000");
      const data = await res.json();
      if (data.success) setRestaurants(data.restaurants);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(roleFilter !== "All" && { role: roleFilter }),
        ...(restaurantFilter !== "All" && { restaurantId: restaurantFilter }),
        ...(statusFilter !== "All" && { isActive: statusFilter === "Active" ? "true" : "false" }),
      });
      const res = await fetch(`/api/super-admin/users?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreate = async () => {
    setFormError("");
    if (!formData.name || !formData.email || !formData.password || !formData.restaurantId) {
      setFormError("Please fill all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/super-admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          restaurantId: formData.restaurantId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to create user");
      } else {
        setSuccessMsg("User created successfully");
        setTimeout(() => {
          setSuccessMsg("");
          setView("list");
          setFormData({ name: "", email: "", phone: "", password: "", confirmPassword: "", role: "RESTAURANT_ADMIN", restaurantId: "" });
        }, 2000);
      }
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (userId: string, currentStatus: boolean, userName: string, role: string) => {
    if (role === "SUPER_ADMIN") {
      alert("Cannot deactivate SUPER_ADMIN");
      return;
    }
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} ${userName}?`)) return;
    try {
      const res = await fetch(`/api/super-admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (view === "create") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#111111]">Create User</h1>
          <button onClick={() => setView("list")} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-gray-900">
          {formError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" /> {formError}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center">
              <Check className="w-5 h-5 mr-2" /> {successMsg}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">User Role *</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
                  <option value="STAFF">Staff</option>
                  <option value="DELIVERY_PARTNER">Delivery Partner</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant *</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400"
                  value={formData.restaurantId}
                  onChange={(e) => setFormData({...formData, restaurantId: e.target.value})}
                >
                  <option value="">Select a restaurant</option>
                  {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              
              <div className="col-span-2"><hr className="border-gray-100" /></div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              
              <div className="col-span-2"><hr className="border-gray-100" /></div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input type="password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                  value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button onClick={handleCreate} disabled={isSubmitting} className="bg-[#111111] hover:bg-black text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50">
                {isSubmitting ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Users</h1>
          <p className="text-gray-500 mt-1">Manage all platform users</p>
        </div>
        <button 
          onClick={() => setView("create")}
          className="bg-[#FFE13C] hover:bg-[#f0d32b] text-black px-6 py-2.5 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Create User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-4 text-gray-900">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="p-2.5 border border-gray-300 rounded-lg outline-none bg-white" value={roleFilter} onChange={e => {setRoleFilter(e.target.value); setPage(1);}}>
            <option value="All">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
            <option value="STAFF">Staff</option>
            <option value="DELIVERY_PARTNER">Delivery Partner</option>
            <option value="CUSTOMER">Customer</option>
          </select>
          <select className="p-2.5 border border-gray-300 rounded-lg outline-none bg-white max-w-xs truncate" value={restaurantFilter} onChange={e => {setRestaurantFilter(e.target.value); setPage(1);}}>
            <option value="All">All Restaurants</option>
            {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
          <select className="p-2.5 border border-gray-300 rounded-lg outline-none bg-white" value={statusFilter} onChange={e => {setStatusFilter(e.target.value); setPage(1);}}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg font-medium transition-colors">
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-medium text-gray-500 text-sm">User Info</th>
                <th className="p-4 font-medium text-gray-500 text-sm">Role</th>
                <th className="p-4 font-medium text-gray-500 text-sm">Restaurant</th>
                <th className="p-4 font-medium text-gray-500 text-sm">Status</th>
                <th className="p-4 font-medium text-gray-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-semibold text-[#111111]">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'RESTAURANT_ADMIN' ? 'bg-blue-100 text-blue-800' : 
                          user.role === 'STAFF' ? 'bg-orange-100 text-orange-800' : 
                          user.role === 'DELIVERY_PARTNER' ? 'bg-indigo-100 text-indigo-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {user.restaurant?.name || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== 'SUPER_ADMIN' && (
                           <button onClick={() => toggleStatus(user._id, user.isActive, user.name, user.role)} title={user.isActive ? "Deactivate" : "Activate"} className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                             <Ban className="w-4 h-4" />
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
