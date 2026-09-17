"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, X, Search } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", restaurantId: "", isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = () => {
    setLoading(true);
    fetch("/api/super-admin/staff")
      .then(res => res.json())
      .then(data => { setStaff(data.data || []); setLoading(false); });
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/super-admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchStaff();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Staff Management</h1>
          <p className="text-gray-500 mt-1">Platform-wide staff oversight</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-[#FFE13C] hover:bg-[#f0d32b] text-black px-6 py-2.5 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Create Staff
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 w-full max-w-md text-gray-900">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#111111]">Create Staff</h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-gray-100 p-2 rounded-full"><X className="text-gray-500 w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] bg-white text-gray-900 placeholder-gray-400" placeholder="John Doe" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] bg-white text-gray-900 placeholder-gray-400" placeholder="john@example.com" onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] bg-white text-gray-900 placeholder-gray-400" placeholder="+1234567890" onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input required type="password" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] bg-white text-gray-900 placeholder-gray-400" placeholder="••••••••" onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant ID</label>
                <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] bg-white text-gray-900 placeholder-gray-400" placeholder="Restaurant ObjectId" onChange={e => setFormData({...formData, restaurantId: e.target.value})} />
              </div>
              <label className="flex items-center gap-2 text-gray-700 font-medium pt-2">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="accent-[#FFE13C] w-4 h-4" />
                Active Staff
              </label>
              <button disabled={saving} type="submit" className="bg-[#111111] hover:bg-black text-white px-8 py-3 rounded-lg font-medium w-full mt-4 transition-colors">
                {saving ? "Saving..." : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#FFE13C]" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-medium text-gray-500 text-sm">Name</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Email</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Restaurant</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Status</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Joined</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s: any) => (
                  <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-gray-700">
                    <td className="p-4 font-semibold text-[#111111]">{s.name}</td>
                    <td className="p-4">{s.email}</td>
                    <td className="p-4">{s.restaurantId?.name || "Unknown"}</td>
                    <td className="p-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${s.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{s.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="p-4 text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No staff found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}