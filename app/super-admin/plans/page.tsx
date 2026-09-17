"use client";

import { useState, useEffect } from "react";
import { Plus, X, Check, Pencil, Search, Trash2, Shield, AlertCircle, Ban, Star, Crown } from "lucide-react";

export default function PlansPage() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [billingFilter, setBillingFilter] = useState("All");
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    price: 0,
    billingCycle: "MONTHLY",
    features: [] as string[],
    maxStaff: 5,
    maxDeliveryPartners: 2,
    maxMenuItems: 50,
    isPopular: false,
    sortOrder: 0,
    isActive: true,
  });
  
  const [featureInput, setFeatureInput] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (view === "list") fetchPlans();
  }, [view, search, statusFilter, billingFilter]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        limit: "100", // Fetch enough for UI sorting
        ...(search && { search }),
        ...(statusFilter !== "All" && { isActive: statusFilter === "Active" ? "true" : "false" }),
        ...(billingFilter !== "All" && { billingCycle: billingFilter }),
      });
      const res = await fetch(`/api/super-admin/plans?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPlans(data.data.plans);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    setFormError("");
    if (!formData.name || !formData.slug || formData.price < 0) {
      setFormError("Please fill all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = view === "edit" ? `/api/super-admin/plans/${formData.id}` : "/api/super-admin/plans";
      const method = view === "edit" ? "PATCH" : "POST";
      
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: Number(formData.price),
        billingCycle: formData.billingCycle,
        features: formData.features,
        maxStaff: Number(formData.maxStaff),
        maxDeliveryPartners: Number(formData.maxDeliveryPartners),
        maxMenuItems: Number(formData.maxMenuItems),
        isPopular: formData.isPopular,
        sortOrder: Number(formData.sortOrder),
        isActive: formData.isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || `Failed to ${view} plan`);
      } else {
        setSuccessMsg(`Plan ${view === "edit" ? "updated" : "created"} successfully!`);
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

  const deactivatePlan = async (id: string, currentStatus: boolean, name: string) => {
    if (currentStatus) {
      if (!confirm(`Are you sure you want to deactivate ${name}? Existing subscriptions will remain active.`)) return;
    } else {
      if (!confirm(`Are you sure you want to reactivate ${name}?`)) return;
    }
    
    try {
      const res = await fetch(`/api/super-admin/plans/${id}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchPlans();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
      setFeatureInput("");
    }
  };

  const removeFeature = (f: string) => {
    setFormData({ ...formData, features: formData.features.filter(feat => feat !== f) });
  };

  const resetForm = () => {
    setFormData({ id: "", name: "", slug: "", description: "", price: 0, billingCycle: "MONTHLY", features: [], maxStaff: 5, maxDeliveryPartners: 2, maxMenuItems: 50, isPopular: false, sortOrder: 0, isActive: true });
    setFormError("");
  };

  const openEdit = (plan: any) => {
    setFormData({
      id: plan._id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description || "",
      price: plan.price,
      billingCycle: plan.billingCycle,
      features: plan.features || [],
      maxStaff: plan.maxStaff,
      maxDeliveryPartners: plan.maxDeliveryPartners,
      maxMenuItems: plan.maxMenuItems,
      isPopular: plan.isPopular || false,
      sortOrder: plan.sortOrder || 0,
      isActive: plan.isActive,
    });
    setView("edit");
  };

  if (view === "create" || view === "edit") {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#111111]">{view === "create" ? "Create Plan" : "Edit Plan"}</h1>
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
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center"><Crown className="w-5 h-5 mr-2 text-[#FFE13C]" /> Basic Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.name} onChange={(e) => {
                      const name = e.target.value;
                      setFormData({...formData, name, slug: view === "create" ? generateSlug(name) : formData.slug});
                    }} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="e.g. Perfect for growing restaurants" />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Pricing */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Pricing & Configuration</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" min="0" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle *</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400"
                    value={formData.billingCycle} onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col justify-center">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 text-[#FFE13C] focus:ring-[#FFE13C] border-gray-300 rounded"
                      checked={formData.isPopular} onChange={(e) => setFormData({...formData, isPopular: e.target.checked})} />
                    <span className="text-gray-700 font-medium flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" /> Mark as Most Popular</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-8">This will unmark any other popular plans.</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})} />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Limits */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Resource Limits</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Staff</label>
                  <input type="number" min="0" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.maxStaff} onChange={(e) => setFormData({...formData, maxStaff: Number(e.target.value)})} />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Delivery Partners</label>
                  <input type="number" min="0" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.maxDeliveryPartners} onChange={(e) => setFormData({...formData, maxDeliveryPartners: Number(e.target.value)})} />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Menu Items</label>
                  <input type="number" min="0" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.maxMenuItems} onChange={(e) => setFormData({...formData, maxMenuItems: Number(e.target.value)})} />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Features */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Features</h2>
              <div className="flex gap-2 mb-4">
                <input type="text" className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400" 
                  placeholder="Add a feature (e.g. Advanced Analytics)" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addFeature()} />
                <button type="button" onClick={addFeature} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 rounded-lg font-medium transition-colors">Add</button>
              </div>
              
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 min-h-[100px]">
                {formData.features.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center pt-4">No features added yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {formData.features.map(f => (
                      <li key={f} className="flex justify-between items-center bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm">
                        <span className="flex items-center text-sm"><Check className="w-4 h-4 text-green-500 mr-2" /> {f}</span>
                        <button type="button" onClick={() => removeFeature(f)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 gap-4">
              <button onClick={() => { setView("list"); resetForm(); }} disabled={isSubmitting} className="px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleCreateOrUpdate} disabled={isSubmitting} className="bg-[#111111] hover:bg-black text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50">
                {isSubmitting ? "Saving..." : view === "create" ? "Create Plan" : "Update Plan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Plans</h1>
          <p className="text-gray-500 mt-1">Manage platform subscription packages</p>
        </div>
        <button 
          onClick={() => setView("create")}
          className="bg-[#FFE13C] hover:bg-[#f0d32b] text-black px-6 py-2.5 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Create Plan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 p-4 text-gray-900">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search plans..." className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] outline-none text-gray-900 bg-white placeholder-gray-400"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="p-2.5 border border-gray-300 rounded-lg outline-none text-gray-900 bg-white placeholder-gray-400" value={billingFilter} onChange={e => setBillingFilter(e.target.value)}>
            <option value="All">All Billing</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
          <select className="p-2.5 border border-gray-300 rounded-lg outline-none text-gray-900 bg-white placeholder-gray-400" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-900">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Shield className="w-8 h-8 text-gray-400" /></div>
          <h3 className="text-xl font-bold mb-2">No subscription plans found</h3>
          <p className="text-gray-500 mb-6">Create your first subscription plan to start onboarding restaurants.</p>
          <button onClick={() => setView("create")} className="bg-[#111111] hover:bg-black text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className={`bg-white rounded-2xl border ${plan.isPopular ? 'border-[#FFE13C] shadow-md relative' : 'border-gray-200 shadow-sm'} overflow-hidden text-gray-900 flex flex-col`}>
              {plan.isPopular && (
                <div className="bg-[#FFE13C] text-black text-xs font-bold uppercase tracking-wider py-1 text-center">
                  Most Popular
                </div>
              )}
              {!plan.isActive && (
                <div className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider py-1 text-center border-b border-red-100">
                  Inactive
                </div>
              )}
              
              <div className="p-6 border-b border-gray-100 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(plan)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deactivatePlan(plan._id, plan.isActive, plan.name)} title={plan.isActive ? "Deactivate" : "Activate"} className={`p-1.5 rounded transition-colors ${plan.isActive ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-red-500 hover:text-green-600 hover:bg-green-50'}`}>
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 min-h-[40px] mb-4">{plan.description}</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">₹{plan.price}</span>
                  <span className="text-gray-500 ml-1">/{plan.billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-6 text-center text-sm">
                  <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="font-bold">{plan.maxStaff}</div><div className="text-[10px] text-gray-500 uppercase tracking-wide">Staff</div></div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="font-bold">{plan.maxDeliveryPartners}</div><div className="text-[10px] text-gray-500 uppercase tracking-wide">Delivery</div></div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="font-bold">{plan.maxMenuItems}</div><div className="text-[10px] text-gray-500 uppercase tracking-wide">Menu</div></div>
                </div>

                <div className="space-y-3 mt-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Features</h4>
                  <ul className="space-y-2 text-sm">
                    {plan.features.slice(0, 5).map((f: string, i: number) => (
                      <li key={i} className="flex items-start"><Check className="w-4 h-4 text-[#FFE13C] mr-2 shrink-0 mt-0.5" /> <span>{f}</span></li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-gray-500 italic pl-6">+ {plan.features.length - 5} more features</li>
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-600">Active Subscriptions</span>
                <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">{plan.subscriberCount || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
