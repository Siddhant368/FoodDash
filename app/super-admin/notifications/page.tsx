"use client";
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
}