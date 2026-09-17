"use client";

import { useState, useEffect } from "react";
import { Plus, X, Search, Check, AlertCircle, Eye, Calendar, RefreshCcw, Ban, BarChart3, Crown, Store } from "lucide-react";

export default function SubscriptionsPage() {
  const [view, setView] = useState<"list" | "create" | "view">("list");
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [autoRenewFilter, setAutoRenewFilter] = useState("All");

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    restaurantId: "",
    planId: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
    autoRenew: true,
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [usageData, setUsageData] = useState<any>(null);

  useEffect(() => {
    if (view === "list") fetchSubscriptions();
    if (view === "create" && plans.length === 0) {
      fetchOptions();
    }
  }, [view, search, statusFilter, planFilter, autoRenewFilter]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        limit: "100",
        ...(search && { search }),
        ...(statusFilter !== "All" && { status: statusFilter }),
        ...(planFilter !== "All" && { planId: planFilter }),
        ...(autoRenewFilter !== "All" && { autoRenew: autoRenewFilter }),
      });
      const res = await fetch(`/api/super-admin/subscriptions?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.data.subscriptions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [resR, resP] = await Promise.all([
        fetch("/api/super-admin/restaurants?limit=1000"),
        fetch("/api/super-admin/plans?limit=100")
      ]);
      const [dataR, dataP] = await Promise.all([resR.json(), resP.json()]);
      if (dataR.success) setRestaurants(dataR.restaurants);
      if (dataP.success) setPlans(dataP.data.plans);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsage = async (id: string) => {
    try {
      const res = await fetch(`/api/super-admin/subscriptions/${id}/usage`);
      const data = await res.json();
      if (data.success) setUsageData(data.data.usage);
    } catch (err) {}
  };

  const handleCreate = async () => {
    setFormError("");
    if (!formData.restaurantId || !formData.planId || !formData.startDate || !formData.endDate) {
      setFormError("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/super-admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: formData.restaurantId,
          planId: formData.planId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
          autoRenew: formData.autoRenew,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to create subscription");
      } else {
        setSuccessMsg("Subscription created successfully!");
        setTimeout(() => {
          setSuccessMsg("");
          setView("list");
          resetForm();
        }, 1500);
      }
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (updates: any, subId: string = selectedSub?._id) => {
    try {
      const res = await fetch(`/api/super-admin/subscriptions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        fetchSubscriptions();
        if (selectedSub && selectedSub._id === subId) {
          setSelectedSub({ ...selectedSub, ...updates });
        }
        return true;
      } else {
        alert(data.message);
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const resetForm = () => {
    setFormData({ id: "", restaurantId: "", planId: "", startDate: "", endDate: "", status: "ACTIVE", autoRenew: true });
    setFormError("");
  };

  const handlePlanSelect = (e: any) => {
    const pid = e.target.value;
    const plan = plans.find(p => p._id === pid);
    let sDate = formData.startDate;
    let eDate = formData.endDate;
    if (plan && sDate) {
      const start = new Date(sDate);
      if (plan.billingCycle === "YEARLY") start.setFullYear(start.getFullYear() + 1);
      else start.setMonth(start.getMonth() + 1);
      eDate = start.toISOString().split("T")[0];
    }
    setFormData({ ...formData, planId: pid, endDate: eDate });
  };

  const handleDateChange = (e: any) => {
    const sDate = e.target.value;
    const plan = plans.find(p => p._id === formData.planId);
    let eDate = formData.endDate;
    if (plan && sDate) {
      const start = new Date(sDate);
      if (plan.billingCycle === "YEARLY") start.setFullYear(start.getFullYear() + 1);
      else start.setMonth(start.getMonth() + 1);
      eDate = start.toISOString().split("T")[0];
    }
    setFormData({ ...formData, startDate: sDate, endDate: eDate });
  };

  const openView = async (sub: any) => {
    if (plans.length === 0) await fetchOptions();
    setSelectedSub(sub);
    setUsageData(null);
    setView("view");
    loadUsage(sub._id);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });

  if (view === "create") {
    const selPlan = plans.find(p => p._id === formData.planId);
    const selRest = restaurants.find(r => r._id === formData.restaurantId);

    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#111111]">Create Subscription</h1>
          <button onClick={() => { setView("list"); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-6 h-6" />
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

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant *</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400"
                  value={formData.restaurantId} onChange={(e) => setFormData({...formData, restaurantId: e.target.value})}
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.filter(r => r.isActive).map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
                {selRest && <p className="text-xs text-gray-500 mt-1">{selRest.address?.city}, {selRest.address?.state}</p>}
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan *</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400"
                  value={formData.planId} onChange={handlePlanSelect}
                >
                  <option value="">Select Plan</option>
                  {plans.filter(p => p.isActive).map(p => <option key={p._id} value={p._id}>{p.name} - ₹{p.price}/{p.billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</option>)}
                </select>
              </div>
            </div>

            {selPlan && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center"><Crown className="w-4 h-4 mr-1"/> Plan Preview: {selPlan.name}</h4>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div><span className="text-gray-500">Staff Limit:</span> <span className="font-medium text-gray-900">{selPlan.maxStaff}</span></div>
                  <div><span className="text-gray-500">Delivery Limit:</span> <span className="font-medium text-gray-900">{selPlan.maxDeliveryPartners}</span></div>
                  <div><span className="text-gray-500">Menu Limit:</span> <span className="font-medium text-gray-900">{selPlan.maxMenuItems}</span></div>
                </div>
                <div><span className="text-gray-500">Features:</span> <span className="text-gray-700">{selPlan.features.join(", ")}</span></div>
              </div>
            )}

            <hr className="border-gray-100" />

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                  value={formData.startDate} onChange={handleDateChange} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                  value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400"
                  value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div className="col-span-2 md:col-span-1 flex items-center pt-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-[#FFE13C] focus:ring-[#FFE13C] border-gray-300 rounded"
                    checked={formData.autoRenew} onChange={(e) => setFormData({...formData, autoRenew: e.target.checked})} />
                  <span className="text-gray-700 font-medium">Auto Renew Enabled</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 gap-4">
              <button onClick={() => { setView("list"); resetForm(); }} disabled={isSubmitting} className="px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={isSubmitting} className="bg-[#111111] hover:bg-black text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Create Subscription"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "view" && selectedSub) {
    const p = selectedSub.plan || {};
    const r = selectedSub.restaurant || {};
    
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#111111]">Subscription Details</h1>
          <button onClick={() => setView("list")} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-3 lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-900">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center"><Store className="w-5 h-5 mr-2 text-gray-400" /> Overview</h2>
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Restaurant</p>
                <p className="font-medium text-lg">{r.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Plan</p>
                <p className="font-medium text-lg flex items-center"><Crown className="w-4 h-4 text-[#FFE13C] mr-1"/> {p.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                    ${selectedSub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      selectedSub.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {selectedSub.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Auto Renew</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${selectedSub.autoRenew ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                    {selectedSub.autoRenew ? 'ON' : 'OFF'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Start Date</p>
                <p className="font-medium flex items-center"><Calendar className="w-4 h-4 text-gray-400 mr-2" /> {formatDate(selectedSub.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">End Date</p>
                <p className="font-medium flex items-center"><Calendar className="w-4 h-4 text-gray-400 mr-2" /> {formatDate(selectedSub.endDate)}</p>
              </div>
            </div>
          </div>

          <div className="col-span-3 lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-900 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Actions</h2>
              <div className="space-y-3">
                {selectedSub.status === 'ACTIVE' && (
                  <button onClick={() => {
                    if(confirm("Are you sure you want to cancel this subscription?")) handleUpdate({ status: "CANCELLED" });
                  }} className="w-full text-left px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center">
                    <Ban className="w-4 h-4 mr-2" /> Cancel Subscription
                  </button>
                )}
                {selectedSub.status !== 'ACTIVE' && (
                  <button onClick={() => {
                    if(confirm("Reactivate subscription?")) handleUpdate({ status: "ACTIVE" });
                  }} className="w-full text-left px-4 py-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 font-medium transition-colors flex items-center">
                    <Check className="w-4 h-4 mr-2" /> Reactivate
                  </button>
                )}
                <button onClick={() => {
                  const end = new Date(selectedSub.endDate);
                  if (p.billingCycle === "YEARLY") end.setFullYear(end.getFullYear() + 1);
                  else end.setMonth(end.getMonth() + 1);
                  if(confirm(`Renew until ${formatDate(end.toISOString())}?`)) handleUpdate({ endDate: end.toISOString() });
                }} className="w-full text-left px-4 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium transition-colors flex items-center">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Renew Period
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
               <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium">
                  <input type="checkbox" className="w-4 h-4 text-[#FFE13C] focus:ring-[#FFE13C] border-gray-300 rounded"
                    checked={selectedSub.autoRenew} onChange={(e) => handleUpdate({ autoRenew: e.target.checked })} />
                  <span>Auto Renew {selectedSub.autoRenew ? 'Enabled' : 'Disabled'}</span>
               </label>
            </div>
          </div>
        </div>

        {/* Usage & Limits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-900 mb-6">
           <h2 className="text-lg font-semibold border-b pb-2 mb-6 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-gray-400" /> Usage vs Limits</h2>
           {!usageData ? (
             <div className="text-gray-400 text-sm">Loading usage data...</div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { label: "Staff", used: usageData.staff, limit: p.maxStaff },
                 { label: "Delivery Partners", used: usageData.deliveryPartners, limit: p.maxDeliveryPartners },
                 { label: "Menu Items", used: usageData.menuItems, limit: p.maxMenuItems }
               ].map((item, i) => {
                 const pct = Math.min((item.used / (item.limit || 1)) * 100, 100);
                 const warning = item.limit - item.used <= 2 && item.limit - item.used >= 0;
                 return (
                   <div key={i}>
                     <div className="flex justify-between text-sm mb-1 font-medium">
                       <span>{item.label}</span>
                       <span className={warning ? 'text-orange-500' : 'text-gray-600'}>{item.used} / {item.limit}</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2">
                       <div className={`h-2 rounded-full ${warning ? 'bg-orange-500' : 'bg-[#FFE13C]'}`} style={{ width: `${pct}%` }}></div>
                     </div>
                     {warning && <div className="text-xs text-orange-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Nearing limit</div>}
                   </div>
                 )
               })}
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Subscriptions</h1>
          <p className="text-gray-500 mt-1">Manage all active restaurant plans</p>
        </div>
        <button onClick={() => setView("create")} className="bg-[#FFE13C] hover:bg-[#f0d32b] text-black px-6 py-2.5 rounded-lg font-medium flex items-center transition-colors">
          <Plus className="w-5 h-5 mr-2" /> New Subscription
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 p-4 text-gray-900">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search restaurant or plan..." className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="p-2.5 border border-gray-300 rounded-lg outline-none text-gray-900 bg-white placeholder-gray-400" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-medium text-gray-500 text-sm">Restaurant</th>
                <th className="p-4 font-medium text-gray-500 text-sm">Plan</th>
                <th className="p-4 font-medium text-gray-500 text-sm">Timeline</th>
                <th className="p-4 font-medium text-gray-500 text-sm">Status & Billing</th>
                <th className="p-4 font-medium text-gray-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading subscriptions...</td></tr>
              ) : subscriptions.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No subscriptions found.</td></tr>
              ) : (
                subscriptions.map((sub) => {
                  const isExpired = new Date(sub.endDate) < new Date();
                  const showStatus = isExpired && sub.status === 'ACTIVE' ? 'EXPIRED' : sub.status;
                  
                  return (
                    <tr key={sub._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-semibold text-[#111111]">{sub.restaurant?.name || 'Unknown'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 flex items-center">{sub.plan?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">₹{sub.priceAtPurchase}/{sub.billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600 flex flex-col gap-1">
                           <span><span className="text-gray-400">Start:</span> {formatDate(sub.startDate)}</span>
                           <span><span className="text-gray-400">End:</span> <span className={isExpired ? 'text-red-500 font-medium' : ''}>{formatDate(sub.endDate)}</span></span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                            ${showStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                              showStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                              showStatus === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {showStatus}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                             <RefreshCcw className="w-3 h-3 mr-1" /> Auto Renew {sub.autoRenew ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openView(sub)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
