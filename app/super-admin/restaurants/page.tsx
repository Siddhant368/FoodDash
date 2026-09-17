"use client";

import { useState, useEffect } from "react";
import { Plus, X, ArrowLeft, ArrowRight, Check, Eye, Pencil, Trash2 } from "lucide-react";

export default function RestaurantsPage() {
  const [view, setView] = useState<"list" | "create" | "view">("list");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Creation Form State
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    restaurant: {
      name: "",
      slug: "",
      description: "",
      email: "",
      phone: "",
      address: { street: "", city: "", state: "", pincode: "", country: "India" },
    },
    admin: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    planId: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRestaurant, setCreatedRestaurant] = useState<any>(null);

  useEffect(() => {
    if (view === "list") fetchRestaurants();
    if (view === "create") fetchPlans();
  }, [view]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/restaurants");
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.restaurants);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/super-admin/plans?isActive=true");
      const data = await res.json();
      if (data.success) {
        setPlans(data.data.plans);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    setFormError("");
    if (formData.admin.password !== formData.admin.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/super-admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant: formData.restaurant,
          admin: {
            name: formData.admin.name,
            email: formData.admin.email,
            phone: formData.admin.phone,
            password: formData.admin.password,
          },
          planId: formData.planId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to create restaurant");
      } else {
        setCreatedRestaurant(data.restaurant);
        setStep(4); // Success step
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  if (view === "create") {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#111111]">Create Restaurant</h1>
          <button onClick={() => setView("list")} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {step < 4 && (
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-[#FFE13C] -z-10 -translate-y-1/2 transition-all" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${s <= step ? 'bg-[#FFE13C] border-[#FAFAF8] text-black' : 'bg-gray-200 border-white text-gray-500'}`}>
                {s}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-gray-900">
          {formError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
              {formError}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Restaurant Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.restaurant.name} 
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({...formData, restaurant: {...formData.restaurant, name, slug: generateSlug(name)}});
                    }} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.restaurant.slug} 
                    onChange={(e) => setFormData({...formData, restaurant: {...formData.restaurant, slug: e.target.value}})} 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    rows={3}
                    value={formData.restaurant.description} 
                    onChange={(e) => setFormData({...formData, restaurant: {...formData.restaurant, description: e.target.value}})} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.restaurant.email} 
                    onChange={(e) => setFormData({...formData, restaurant: {...formData.restaurant, email: e.target.value}})} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.restaurant.phone} 
                    onChange={(e) => setFormData({...formData, restaurant: {...formData.restaurant, phone: e.target.value}})} 
                  />
                </div>
                
                <div className="col-span-2 mt-4"><h3 className="font-medium border-b pb-2">Address</h3></div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.restaurant.address.street} 
                    onChange={(e) => setFormData({...formData, restaurant: {...formData.restaurant, address: {...formData.restaurant.address, street: e.target.value}}})} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.restaurant.address.city} 
                    onChange={(e) => setFormData({...formData, restaurant: {...formData.restaurant, address: {...formData.restaurant.address, city: e.target.value}}})} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.restaurant.address.state} 
                    onChange={(e) => setFormData({...formData, restaurant: {...formData.restaurant, address: {...formData.restaurant.address, state: e.target.value}}})} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.restaurant.address.pincode} 
                    onChange={(e) => setFormData({...formData, restaurant: {...formData.restaurant, address: {...formData.restaurant.address, pincode: e.target.value}}})} 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button onClick={() => {
                  if (!formData.restaurant.name || !formData.restaurant.slug || !formData.restaurant.address.city || !formData.restaurant.address.state || !formData.restaurant.address.street || !formData.restaurant.address.pincode) {
                    setFormError("Please fill all required restaurant fields");
                    return;
                  }
                  setFormError("");
                  setStep(2);
                }} className="bg-[#FFE13C] hover:bg-[#f0d32b] text-black px-6 py-3 rounded-lg font-medium flex items-center transition-colors">
                  Next Step <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Restaurant Admin Information</h2>
              <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-sm text-yellow-800">
                This will create a new user with RESTAURANT_ADMIN role linked to {formData.restaurant.name}.
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.admin.name} 
                    onChange={(e) => setFormData({...formData, admin: {...formData.admin, name: e.target.value}})} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
                  <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.admin.email} 
                    onChange={(e) => setFormData({...formData, admin: {...formData.admin, email: e.target.value}})} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Phone</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.admin.phone} 
                    onChange={(e) => setFormData({...formData, admin: {...formData.admin, phone: e.target.value}})} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.admin.password} 
                    onChange={(e) => setFormData({...formData, admin: {...formData.admin, password: e.target.value}})} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input type="password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE13C] focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400" 
                    value={formData.admin.confirmPassword} 
                    onChange={(e) => setFormData({...formData, admin: {...formData.admin, confirmPassword: e.target.value}})} 
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button onClick={() => setStep(1)} className="px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 flex items-center transition-colors">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </button>
                <button onClick={() => {
                  if (!formData.admin.name || !formData.admin.email || !formData.admin.password) {
                    setFormError("Please fill all required admin fields");
                    return;
                  }
                  if (formData.admin.password !== formData.admin.confirmPassword) {
                    setFormError("Passwords do not match");
                    return;
                  }
                  setFormError("");
                  setStep(3);
                }} className="bg-[#FFE13C] hover:bg-[#f0d32b] text-black px-6 py-3 rounded-lg font-medium flex items-center transition-colors">
                  Next Step <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Select Plan & Review</h2>
              
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div key={plan._id} 
                      onClick={() => setFormData({...formData, planId: plan._id})}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${formData.planId === plan._id ? 'border-[#FFE13C] bg-yellow-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">{plan.name}</h4>
                        {formData.planId === plan._id && <Check className="text-[#FFE13C] w-5 h-5" />}
                      </div>
                      <div className="text-2xl font-bold mb-4">₹{plan.price}<span className="text-sm font-normal text-gray-500">/{plan.billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</span></div>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• {plan.maxStaff} Staff</li>
                        <li>• {plan.maxDeliveryPartners} Delivery Partners</li>
                        <li>• {plan.maxMenuItems} Menu Items</li>
                      </ul>
                    </div>
                  ))}
                  <div 
                      onClick={() => setFormData({...formData, planId: ""})}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-center items-center text-center ${formData.planId === "" ? 'border-[#FFE13C] bg-yellow-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <h4 className="font-bold text-gray-600 mb-2">No Plan</h4>
                      <p className="text-xs text-gray-500">Create without subscription</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold mb-4 border-b pb-2">Review Summary</h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <div className="text-gray-500">Restaurant Name</div>
                    <div className="font-medium">{formData.restaurant.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Location</div>
                    <div className="font-medium">{formData.restaurant.address.city}, {formData.restaurant.address.state}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Admin Email</div>
                    <div className="font-medium">{formData.admin.email}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Selected Plan</div>
                    <div className="font-medium">{plans.find(p => p._id === formData.planId)?.name || "None"}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button onClick={() => setStep(2)} disabled={isSubmitting} className="px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 flex items-center transition-colors">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </button>
                <button onClick={handleCreate} disabled={isSubmitting} className="bg-[#111111] hover:bg-black text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50">
                  {isSubmitting ? "Creating Restaurant..." : "Create Restaurant"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Restaurant Created Successfully!</h2>
              <p className="text-gray-500 mb-8">The restaurant and admin account have been set up.</p>
              
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto text-left mb-8 border border-gray-100 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-gray-500">Restaurant:</div>
                  <div className="font-semibold">{formData.restaurant.name}</div>
                  <div className="text-gray-500">Admin Email:</div>
                  <div className="font-semibold">{formData.admin.email}</div>
                  <div className="text-gray-500">Plan:</div>
                  <div className="font-semibold">{plans.find(p => p._id === formData.planId)?.name || "None"}</div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button onClick={() => {
                  setView("list");
                  setStep(1);
                  setFormData({
                    restaurant: { name: "", slug: "", description: "", email: "", phone: "", address: { street: "", city: "", state: "", pincode: "", country: "India" } },
                    admin: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
                    planId: "",
                  });
                }} className="px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
                  Back to Restaurants
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Restaurants</h1>
          <p className="text-gray-500 mt-1">Manage your platform restaurants here.</p>
        </div>
        <button 
          onClick={() => setView("create")}
          className="bg-[#FFE13C] hover:bg-[#f0d32b] text-black px-6 py-2.5 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Create Restaurant
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-medium text-gray-500 text-sm">Restaurant Info</th>
                <th className="p-4 font-medium text-gray-500 text-sm">Admin</th>
                <th className="p-4 font-medium text-gray-500 text-sm">Plan & Status</th>
                <th className="p-4 font-medium text-gray-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Loading restaurants...</td>
                </tr>
              ) : restaurants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No restaurants found. Create one to get started.</td>
                </tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr key={restaurant._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-semibold text-[#111111]">{restaurant.name}</div>
                      <div className="text-xs text-gray-500">{restaurant.address?.city}, {restaurant.address?.state}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{restaurant.admin?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{restaurant.admin?.email || 'No admin linked'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {restaurant.plan ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 self-start">
                            {restaurant.plan.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No active plan</span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium self-start ${restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {restaurant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
