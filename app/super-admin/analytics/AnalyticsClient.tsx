"use client";

import { useEffect, useState } from "react";
import { 
  Store, Users, DollarSign, ShoppingBag, 
  ArrowUpRight, ArrowDownRight, RefreshCcw, Loader2
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ['#FFE13C', '#111111', '#22C55E', '#EAB308', '#EF4444', '#3B82F6', '#8B5CF6', '#F97316'];

export default function AnalyticsClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  
  const [period, setPeriod] = useState("30d");
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurants, setRestaurants] = useState<any[]>([]);

  useEffect(() => {
    // Fetch restaurants for filter
    fetch('/api/super-admin/restaurants?limit=1000')
      .then(res => res.json())
      .then(d => {
        if(d.success) setRestaurants(d.data.restaurants || []);
      })
      .catch(() => {});
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (restaurantId) params.append('restaurantId', restaurantId);

      const res = await fetch(`/api/super-admin/analytics?${params.toString()}`);
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch analytics");
      }
      
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, restaurantId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-[#111111] text-white rounded-lg hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹${val?.toLocaleString('en-IN') || 0}`;

  return (
    <div className="space-y-8">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight">Analytics</h1>
          <p className="text-gray-500 font-medium mt-1">Platform performance overview</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="bg-white border border-gray-200 text-[#111111] text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#FFE13C]"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>

          <select 
            className="bg-white border border-gray-200 text-[#111111] text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#FFE13C]"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
          >
            <option value="">All Restaurants</option>
            {restaurants.map(r => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>

          <button 
            onClick={fetchAnalytics}
            className="p-2.5 bg-white border border-gray-200 text-[#111111] rounded-xl hover:bg-gray-50 flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center h-64 items-center">
          <Loader2 className="animate-spin text-[#111111]" size={32} />
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard 
              title="Revenue" 
              value={formatCurrency(data?.summary?.totalRevenue?.current || 0)} 
              previous={data?.summary?.totalRevenue?.previous}
              growth={data?.summary?.totalRevenue?.growth}
              icon={DollarSign} 
            />
            <KpiCard 
              title="Orders" 
              value={(data?.summary?.totalOrders?.current || 0).toLocaleString('en-IN')} 
              previous={data?.summary?.totalOrders?.previous}
              growth={data?.summary?.totalOrders?.growth}
              icon={ShoppingBag} 
            />
            <KpiCard 
              title="Restaurants" 
              value={(data?.summary?.totalRestaurants?.current || 0).toLocaleString('en-IN')} 
              previous={data?.summary?.totalRestaurants?.previous}
              growth={data?.summary?.totalRestaurants?.growth}
              icon={Store} 
            />
            <KpiCard 
              title="Customers" 
              value={(data?.summary?.totalCustomers?.current || 0).toLocaleString('en-IN')} 
              previous={data?.summary?.totalCustomers?.previous}
              growth={data?.summary?.totalCustomers?.growth}
              icon={Users} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* REVENUE TREND */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-[#111111] mb-6">Revenue Trend</h2>
              {data?.dailyRevenue?.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.dailyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFE13C" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FFE13C" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#EAB308" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-400">No data available for this period.</div>
              )}
            </div>

            {/* ORDERS TREND */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-[#111111] mb-6">Orders Trend</h2>
              {data?.dailyRevenue?.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value: any) => [value, "Orders"]} />
                      <Line type="monotone" dataKey="orders" stroke="#111111" strokeWidth={3} dot={{r: 4, fill: '#111111'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-400">No data available for this period.</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ORDER STATUS */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-[#111111] mb-6">Order Status</h2>
              <div className="h-64">
                {Object.keys(data?.orderStatus || {}).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(data.orderStatus).map(([name, value]) => ({ name, value }))}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                      >
                        {Object.entries(data.orderStatus).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">No data available.</div>
                )}
              </div>
            </div>

            {/* SUBSCRIPTION PLANS */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-[#111111] mb-6">Subscription Plans</h2>
              <div className="h-64">
                {data?.planDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.planDistribution}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="subscribers" nameKey="name"
                      >
                        {data.planDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage.toFixed(1)}%)`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">No data available.</div>
                )}
              </div>
            </div>

            {/* PAYMENT ANALYTICS */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-[#111111] mb-6">Payment Methods</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Online</span>
                  <span className="font-bold">{data?.paymentMethod?.ONLINE || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-700">COD</span>
                  <span className="font-bold">{data?.paymentMethod?.COD || 0}</span>
                </div>
              </div>
              <h2 className="text-lg font-bold text-[#111111] mt-6 mb-4">Payment Status</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Paid</span><span className="font-semibold">{data?.paymentStatus?.PAID || 0}</span></div>
                <div className="flex justify-between text-gray-600"><span>Pending</span><span className="font-semibold">{data?.paymentStatus?.PENDING || 0}</span></div>
                <div className="flex justify-between text-gray-600"><span>Failed</span><span className="font-semibold">{data?.paymentStatus?.FAILED || 0}</span></div>
                <div className="flex justify-between text-gray-600"><span>Refunded</span><span className="font-semibold">{data?.paymentStatus?.REFUNDED || 0}</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TOP RESTAURANTS */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <h2 className="text-xl font-bold text-[#111111] mb-6">Top Restaurants</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-100">
                      <th className="pb-3 font-semibold">Restaurant</th>
                      <th className="pb-3 font-semibold text-right">Orders</th>
                      <th className="pb-3 font-semibold text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.restaurantPerformance?.length > 0 ? (
                      data.restaurantPerformance.slice(0, 5).map((r: any, i: number) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 font-semibold text-[#111111]">{r.name}</td>
                          <td className="py-3 text-right">{r.totalOrders}</td>
                          <td className="py-3 text-right font-bold">{formatCurrency(r.revenue)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="py-6 text-center text-gray-400">No data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOP MENU ITEMS */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <h2 className="text-xl font-bold text-[#111111] mb-6">Top Menu Items</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-100">
                      <th className="pb-3 font-semibold">Item</th>
                      <th className="pb-3 font-semibold text-right">Sold</th>
                      <th className="pb-3 font-semibold text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.topSellingItems?.length > 0 ? (
                      data.topSellingItems.slice(0, 5).map((m: any, i: number) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 font-semibold text-[#111111]">
                            {m.name}
                            <div className="text-xs text-gray-400 font-normal">{m.restaurantName}</div>
                          </td>
                          <td className="py-3 text-right">{m.quantitySold}</td>
                          <td className="py-3 text-right font-bold">{formatCurrency(m.revenue)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="py-6 text-center text-gray-400">No data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* DELIVERY & ADDITIONAL STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-[#111111] mb-4">Delivery Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Avg Acceptance</span><span className="font-bold">{data?.deliveryStats?.avgAcceptanceTime ? `${data.deliveryStats.avgAcceptanceTime} min` : 'N/A'}</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: '30%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Avg Pickup</span><span className="font-bold">{data?.deliveryStats?.avgPickupTime ? `${data.deliveryStats.avgPickupTime} min` : 'N/A'}</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-yellow-500 h-1.5 rounded-full" style={{width: '60%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Avg Delivery</span><span className="font-bold">{data?.deliveryStats?.avgDeliveryTime ? `${data.deliveryStats.avgDeliveryTime} min` : 'N/A'}</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{width: '80%'}}></div></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-[#111111] mb-4">Misc Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Avg Order Value</span><span className="font-bold">{formatCurrency(data?.summary?.averageOrderValue || 0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Cancellation Rate</span><span className="font-bold text-red-500">{data?.summary?.cancellationRate?.toFixed(1) || 0}%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Cancelled Orders</span><span className="font-bold">{data?.summary?.cancelledOrders || 0}</span></div>
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  );
}

function KpiCard({ title, value, previous, growth, icon: Icon }: any) {
  const isNew = previous === 0 || previous === null || previous === undefined;
  const isPositive = growth !== null && growth >= 0;
  
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="w-12 h-12 bg-[#FAFAF8] rounded-2xl flex items-center justify-center border border-gray-100">
          <Icon className="text-[#111111]" size={22} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full ${isNew ? 'bg-gray-100 text-gray-700' : isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {!isNew && (isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />)}
          {isNew ? 'New' : `${Math.abs(growth).toFixed(1)}%`}
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-gray-500 font-semibold text-sm mb-1">{title}</h3>
        <p className="text-3xl font-black text-[#111111]">{value}</p>
      </div>
    </div>
  );
}
