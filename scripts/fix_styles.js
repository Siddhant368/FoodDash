const fs = require('fs');
const path = require('path');

const rootDir = "C:\\Users\\siddh\\OneDrive\\Desktop\\restaurant-saas\\app\\super-admin";

const staffPage = `"use client";
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
                    <td className="p-4"><span className={\`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium \${s.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}\`}>{s.isActive ? "Active" : "Inactive"}</span></td>
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
}`;

const deliveryPage = `"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, X } from "lucide-react";

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", restaurantId: "", isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = () => {
    setLoading(true);
    fetch("/api/super-admin/delivery-partners")
      .then(res => res.json())
      .then(data => { setPartners(data.data || []); setLoading(false); });
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/super-admin/delivery-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchPartners();
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
          <h1 className="text-2xl font-bold text-[#111111]">Delivery Partners</h1>
          <p className="text-gray-500 mt-1">Platform-wide delivery partner overview</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-[#FFE13C] hover:bg-[#f0d32b] text-black px-6 py-2.5 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Create Partner
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 w-full max-w-md text-gray-900">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#111111]">Create Partner</h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-gray-100 p-2 rounded-full"><X className="text-gray-500 w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] bg-white text-gray-900 placeholder-gray-400" placeholder="Jane Doe" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] bg-white text-gray-900 placeholder-gray-400" placeholder="jane@example.com" onChange={e => setFormData({...formData, email: e.target.value})} />
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
                Active Partner
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
                  <th className="p-4 font-medium text-gray-500 text-sm">Restaurant</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Total Assignments</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Delivered</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p: any) => {
                   const total = Object.values(p.stats || {}).reduce((a:any, b:any) => a + b, 0);
                   return (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-gray-700">
                    <td className="p-4 font-semibold text-[#111111]">{p.name}</td>
                    <td className="p-4">{p.restaurantId?.name || "Unknown"}</td>
                    <td className="p-4">{total as number}</td>
                    <td className="p-4">{p.stats?.DELIVERED || 0}</td>
                    <td className="p-4"><span className={\`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium \${p.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}\`}>{p.isActive ? "Active" : "Inactive"}</span></td>
                  </tr>
                )})}
                {partners.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No delivery partners found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}`;

const notifPage = `"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/notifications")
      .then(res => res.json())
      .then(data => { setNotifs(data.data || []); setLoading(false); });
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Platform Notifications</h1>
          <p className="text-gray-500 mt-1">Manage platform-wide alerts</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#FFE13C]" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-medium text-gray-500 text-sm">Title</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Type</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Restaurant</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {notifs.map((n: any) => (
                  <tr key={n._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-gray-700">
                    <td className="p-4 font-semibold text-[#111111]">{n.title}</td>
                    <td className="p-4"><span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{n.type}</span></td>
                    <td className="p-4">{n.restaurantId?.name || "Global"}</td>
                    <td className="p-4 text-sm">{new Date(n.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {notifs.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No notifications found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}`;

const settingsPage = `"use client";

import { useState } from "react";
import { Save, AlertCircle, Check } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Platform Settings</h1>
          <p className="text-gray-500 mt-1">Configure global application defaults</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="sticky top-24 space-y-2">
            <div className="bg-[#111111] text-[#FFE13C] p-3 rounded-lg font-bold shadow-md cursor-pointer">General Setup</div>
            <div className="text-gray-600 p-3 rounded-lg font-medium hover:bg-gray-100 cursor-pointer">Authentication</div>
            <div className="text-gray-600 p-3 rounded-lg font-medium hover:bg-gray-100 cursor-pointer">Orders</div>
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-gray-900">
            <h2 className="text-xl font-bold text-[#111111] mb-6">General Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] bg-white text-gray-900 placeholder-gray-400" defaultValue="FoodHub" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                <input type="email" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] bg-white text-gray-900 placeholder-gray-400" defaultValue="support@foodhub.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Mode</label>
                <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] bg-white text-gray-900">
                  <option>Disabled</option>
                  <option>Enabled</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end">
                <button className="bg-[#111111] hover:bg-black text-white px-8 py-2.5 rounded-lg font-medium flex items-center transition-colors">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;

const ordersPage = `"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/orders")
      .then(res => res.json())
      .then(data => { setOrders(data.data || []); setLoading(false); });
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Platform Orders</h1>
          <p className="text-gray-500 mt-1">View and manage all orders across restaurants</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#FFE13C]" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-medium text-gray-500 text-sm">Order ID</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Restaurant</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Customer</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Amount</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Status</th>
                  <th className="p-4 font-medium text-gray-500 text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-gray-700">
                    <td className="p-4"><Link href={\`/super-admin/orders/\${o._id}\`} className="font-semibold text-[#111111] hover:text-[#FFE13C] transition-colors">{o._id.substring(18)}</Link></td>
                    <td className="p-4">{o.restaurantId?.name || "Unknown"}</td>
                    <td className="p-4">{o.customerId?.name || "Unknown"}</td>
                    <td className="p-4 font-medium">₹{o.totalAmount}</td>
                    <td className="p-4"><span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{o.status}</span></td>
                    <td className="p-4 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}`;

fs.writeFileSync(path.join(rootDir, "staff/page.tsx"), staffPage);
fs.writeFileSync(path.join(rootDir, "delivery-partners/page.tsx"), deliveryPage);
fs.writeFileSync(path.join(rootDir, "notifications/page.tsx"), notifPage);
fs.writeFileSync(path.join(rootDir, "settings/page.tsx"), settingsPage);
fs.writeFileSync(path.join(rootDir, "orders/page.tsx"), ordersPage);

console.log("Styling script complete.");
