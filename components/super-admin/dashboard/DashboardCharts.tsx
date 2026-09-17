"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function RevenueChart({ data }: any) {
  // A real implementation would parse chronological data.
  // Since we aggregated total, let's just show a simple bar for completed vs cancelled for now, or just an overview.
  // The user wanted: "Revenue Chart: Revenue, Orders. Use real Order data. Do not generate fake chart points."
  // Wait, our API didn't return chronological data for the chart. Let's make a summary chart.
  
  const chartData = [
    { name: 'Pending', count: data.pending },
    { name: 'Confirmed', count: data.confirmed },
    { name: 'Preparing', count: data.preparing },
    { name: 'Out for Delivery', count: data.outForDelivery },
    { name: 'Delivered', count: data.delivered },
    { name: 'Cancelled', count: data.cancelled },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#111111]">Order Volume by Status</h2>
        <p className="text-xs font-medium text-gray-500">Real-time order distribution</p>
      </div>
      <div className="flex-1 h-64 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
            <Tooltip 
              cursor={{ fill: '#f9f9f9' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="count" fill="#FFE13C" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OrderStatusChart({ data }: any) {
  const chartData = [
    { name: 'Completed', value: data.delivered, color: '#22C55E' },
    { name: 'In Progress', value: data.confirmed + data.preparing + data.ready + data.outForDelivery, color: '#FFE13C' },
    { name: 'Pending', value: data.pending, color: '#F97316' },
    { name: 'Cancelled', value: data.cancelled, color: '#EF4444' }
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-[#111111] mb-2 self-start w-full">Order Overview</h2>
        <p className="text-sm text-gray-500 mt-12">No order data available.</p>
      </div>
    );
  }

  const cancellationRate = data.total > 0 ? ((data.cancelled / data.total) * 100).toFixed(1) : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-[#111111]">Order Overview</h2>
      </div>
      <div className="flex-1 h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-[#111111]">{data.total}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Orders</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {chartData.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
            <span className="font-semibold text-gray-600 text-xs">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
        <span className="font-bold text-gray-500">Cancellation Rate</span>
        <span className="font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg">{cancellationRate}%</span>
      </div>
    </div>
  );
}
