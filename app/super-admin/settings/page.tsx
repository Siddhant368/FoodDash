"use client";

import { useState, useEffect } from "react";
import { Save, AlertCircle, Check, Loader2 } from "lucide-react";

const SECTIONS = [
  { id: "general", label: "General Setup" },
  { id: "platform", label: "Platform Rules" },
  { id: "restaurantDefaults", label: "Restaurant Defaults" },
  { id: "order", label: "Order Settings" },
  { id: "delivery", label: "Delivery Config" },
  { id: "notifications", label: "Notifications" },
  { id: "subscription", label: "Subscriptions" },
  { id: "payment", label: "Payment Gateways" },
  { id: "email", label: "Email / SMTP" }
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<any>({});
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/super-admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setFormData(data[activeTab] || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (settings) {
      setFormData(settings[activeTab] || {});
      setMessage({ type: "", text: "" });
    }
  }, [activeTab, settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/super-admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeTab, data: formData }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setSettings({ ...settings, [activeTab]: formData });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-[#FFE13C] w-8 h-8" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center text-gray-500">
        Failed to load settings
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Platform Settings</h1>
          <p className="text-gray-500 mt-1">Configure global application defaults and rules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="sticky top-24 space-y-1 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            {SECTIONS.map((sec) => {
              const isActive = activeTab === sec.id;
              const btnClass = isActive ? "w-full text-left p-3 rounded-lg font-medium transition-colors bg-[#111111] text-[#FFE13C] shadow-md" : "w-full text-left p-3 rounded-lg font-medium transition-colors text-gray-600 hover:bg-gray-100";
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={btnClass}
                >
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-gray-900">
            <h2 className="text-xl font-bold text-[#111111] mb-6 border-b border-gray-100 pb-4">
              {SECTIONS.find(s => s.id === activeTab)?.label}
            </h2>

            {message.text && (
              <div className={message.type === "success" ? "mb-6 p-4 rounded-lg flex items-center bg-green-50 text-green-700 border border-green-200" : "mb-6 p-4 rounded-lg flex items-center bg-red-50 text-red-700 border border-red-200"}>
                {message.type === "success" ? <Check className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {Object.keys(formData).map((key) => {
                const value = formData[key];
                const type = typeof value;
                
                if (key === "_id" || key === "__v" || key === "createdAt" || key === "updatedAt") {
                  return null;
                }

                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                if (type === "boolean") {
                  return (
                    <label key={key} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <span className="font-medium text-gray-700">{label}</span>
                      <input 
                        type="checkbox" 
                        checked={value} 
                        onChange={(e) => handleInputChange(key, e.target.checked)}
                        className="w-5 h-5 accent-[#FFE13C]"
                      />
                    </label>
                  );
                }

                if (type === "number") {
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input 
                        type="number" 
                        value={value} 
                        onChange={(e) => handleInputChange(key, Number(e.target.value))}
                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] text-gray-900"
                      />
                    </div>
                  );
                }

                const isPassword = key.toLowerCase().includes("password");
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input 
                      type={isPassword ? "password" : "text"} 
                      value={value} 
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FFE13C] text-gray-900"
                    />
                  </div>
                );
              })}

              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-[#FFE13C] hover:bg-[#f0d32b] text-[#111111] px-8 py-2.5 rounded-lg font-bold flex items-center transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}