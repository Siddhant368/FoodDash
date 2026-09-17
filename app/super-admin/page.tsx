"use client";

import { useEffect, useState } from "react";
import { Store, Users, DollarSign, ShoppingBag, RefreshCw, AlertCircle } from "lucide-react";
import { StatCard, RestaurantOverview, UserOverview, SubscriptionOverview, PlanOverview, DeliveryOverview, MenuOverview, QuickActions, SystemHealth, RecentOrders, TopRestaurants } from "@/components/super-admin/dashboard/DashboardWidgets";
import { RevenueChart, OrderStatusChart } from "@/components/super-admin/dashboard/DashboardCharts";

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("30Days");

  const fetchDashboardData = async (silently = false) => {
    if (!silently) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/super-admin/dashboard?range=${range}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load dashboard");
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [range]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-3xl"></div>
          <div className="h-96 bg-gray-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#111111] mb-2">Unable to load dashboard</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => fetchDashboardData()} className="bg-[#111111] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const { stats, subscriptions, plans, delivery, menu, recentOrders, topRestaurants, systemHealth } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight">Good Morning, Super Admin 👋</h1>
          <p className="text-gray-500 font-medium mt-1">Here's your platform overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-white border border-gray-200 text-[#111111] text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#FFE13C] shadow-sm"
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="7Days">Last 7 Days</option>
            <option value="30Days">Last 30 Days</option>
            <option value="90Days">Last 90 Days</option>
            <option value="Year">This Year</option>
          </select>
          <button 
            onClick={() => fetchDashboardData(true)} 
            className="bg-[#111111] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#FFE13C] hover:text-[#111111] transition-colors shadow-lg shadow-[#111111]/10 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value={`₹${stats.revenue.total.toLocaleString()}`} icon={DollarSign} growth={stats.revenue.growth} subtext={`AOV: ₹${stats.revenue.aov.toFixed(2)}`} />
        <StatCard label="Total Orders" value={stats.orders.total.toLocaleString()} icon={ShoppingBag} growth={stats.orders.growth} />
        <StatCard label="Active Restaurants" value={stats.restaurants.active.toLocaleString()} icon={Store} growth={stats.restaurants.growth} />
        <StatCard label="Total Users" value={stats.users.total.toLocaleString()} icon={Users} growth={stats.users.growth} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <RevenueChart data={stats.orders} />
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <OrderStatusChart data={stats.orders} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RecentOrders orders={recentOrders} />
          <TopRestaurants restaurants={topRestaurants} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <RestaurantOverview data={stats.restaurants} />
             <UserOverview data={stats.users} />
          </div>
        </div>
        <div className="space-y-8">
          <QuickActions />
          <SystemHealth data={systemHealth} />
          <SubscriptionOverview data={subscriptions} />
          <PlanOverview data={plans} />
          <DeliveryOverview data={delivery} />
          <MenuOverview data={menu} />
        </div>
      </div>
    </div>
  );
}