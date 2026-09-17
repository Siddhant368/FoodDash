"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchPartners() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/delivery/partners", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load");
      setPartners(data.partners || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPartners();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/admin/delivery/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create partner");
      }

      setSuccess("Delivery partner created successfully!");
      setIsAdding(false);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      
      await fetchPartners();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading delivery partners...</div>;

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#111111] p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-7">
        
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-[#FFE13C]/15 bg-gradient-to-br from-orange-500/[0.10] via-white/[0.03] to-transparent p-6 md:p-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE13C]/15 border border-[#FFE13C]/20 text-2xl">🛵</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#FFE13C] font-semibold">Staff</p>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Delivery Partners</h1>
                </div>
              </div>
              <p className="text-gray-500 mt-4 max-w-2xl">Manage your delivery staff.</p>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="px-5 py-3 rounded-xl bg-[#FFE13C] text-[#111111] font-bold shadow-sm hover:bg-orange-400 transition"
            >
              {isAdding ? "Cancel" : "+ Add Partner"}
            </button>
          </div>
        </div>

        {error && <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-200">{error}</div>}
        {success && <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200">{success}</div>}

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-xl font-bold">Create Delivery Partner</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Name *</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#FAFAF8] border border-gray-100 outline-none focus:border-[#FFE13C]" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email *</label>
                <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#FAFAF8] border border-gray-100 outline-none focus:border-[#FFE13C]" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone</label>
                <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#FAFAF8] border border-gray-100 outline-none focus:border-[#FFE13C]" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Password *</label>
                <input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#FAFAF8] border border-gray-100 outline-none focus:border-[#FFE13C]" />
              </div>
            </div>
            <button disabled={submitting} type="submit" className="w-full h-11 rounded-xl bg-[#111111] text-white font-bold hover:bg-gray-800 disabled:opacity-50">
              {submitting ? "Creating..." : "Create Partner"}
            </button>
          </form>
        )}

        {/* List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Active Partners</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">Contact</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partners.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-gray-500">No delivery partners found. Add one above.</td></tr>
              ) : partners.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-[#111111]">{p.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{p.email}</div>
                    <div className="text-sm text-gray-500">{p.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
