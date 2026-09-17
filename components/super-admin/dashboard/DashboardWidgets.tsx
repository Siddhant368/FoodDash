import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle } from "lucide-react";

export function StatCard({ label, value, icon: Icon, growth, subtext }: any) {
  const isPositive = growth >= 0;
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-[#111111]">
        <Icon size={80} />
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="w-12 h-12 bg-[#FAFAF8] rounded-2xl flex items-center justify-center border border-gray-100">
          <Icon className="text-[#111111]" size={22} />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-gray-500 font-semibold text-sm mb-1">{label}</h3>
        <p className="text-3xl font-black text-[#111111]">{value}</p>
        {subtext && <p className="text-xs font-medium text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

export function RecentOrders({ orders }: { orders: any[] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#111111]">Recent Platform Orders</h2>
        <Link href="/super-admin/orders" className="text-sm font-bold text-gray-500 hover:text-[#111111]">View All</Link>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 pr-4">Order ID</th>
                <th className="pb-3 pr-4">Restaurant</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-gray-50">
              {orders.map((o: any) => (
                <tr key={o._id} className="hover:bg-gray-50/50">
                  <td className="py-3 pr-4 text-gray-500">#{o._id.toString().slice(-6).toUpperCase()}</td>
                  <td className="py-3 pr-4 text-[#111111]">{o.restaurantId?.name || "Unknown"}</td>
                  <td className="py-3 pr-4 text-[#111111]">₹{o.totalAmount}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link href={`/super-admin/orders/${o._id}`} className="text-[#FFE13C] hover:text-yellow-600 font-bold bg-[#111111] px-3 py-1.5 rounded-lg text-xs">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function TopRestaurants({ restaurants }: { restaurants: any[] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#111111]">Restaurant Performance</h2>
        <Link href="/super-admin/restaurants" className="text-sm font-bold text-gray-500 hover:text-[#111111]">View All</Link>
      </div>
      {restaurants.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No restaurants yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-semibold">
            <thead>
              <tr className="text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 pr-4">Restaurant</th>
                <th className="pb-3 pr-4">Revenue</th>
                <th className="pb-3 pr-4">Orders</th>
                <th className="pb-3 pr-4">Subscription</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {restaurants.map((r: any) => (
                <tr key={r._id} className="hover:bg-gray-50/50">
                  <td className="py-3 pr-4 text-[#111111]">{r.name}</td>
                  <td className="py-3 pr-4 text-[#111111]">₹{r.revenue.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-gray-600">{r.orders}</td>
                  <td className="py-3 pr-4 text-gray-600">{r.subscriptionStatus}</td>
                  <td className="py-3">
                    {r.isActive ? <CheckCircle2 className="text-green-500" size={18} /> : <XCircle className="text-red-500" size={18} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function RestaurantOverview({ data }: any) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#111111] mb-4">Restaurants</h2>
      <div className="space-y-4 text-sm font-bold">
        <div className="flex justify-between items-center"><span className="text-gray-500">Total</span> <span className="text-[#111111] bg-gray-100 px-2 py-1 rounded-lg">{data.total}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-500">Active</span> <span className="text-green-700 bg-green-100 px-2 py-1 rounded-lg">{data.active}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-500">Inactive</span> <span className="text-red-700 bg-red-100 px-2 py-1 rounded-lg">{data.inactive}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-500">Currently Open</span> <span className="text-[#111111] bg-yellow-100 px-2 py-1 rounded-lg">{data.open}</span></div>
      </div>
      <Link href="/super-admin/restaurants" className="block text-center w-full mt-6 py-2.5 bg-[#FAFAF8] text-[#111111] rounded-xl hover:bg-gray-100 transition-colors">Manage Restaurants</Link>
    </div>
  );
}

export function UserOverview({ data }: any) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#111111] mb-4">User Roles</h2>
      <div className="space-y-4 text-sm font-bold">
        <div className="flex justify-between items-center"><span className="text-gray-500">Customers</span> <span className="text-[#111111] bg-gray-100 px-2 py-1 rounded-lg">{data.customers}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-500">Restaurant Admins</span> <span className="text-[#111111] bg-gray-100 px-2 py-1 rounded-lg">{data.restaurantAdmins}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-500">Staff</span> <span className="text-[#111111] bg-gray-100 px-2 py-1 rounded-lg">{data.staff}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-500">Delivery Partners</span> <span className="text-[#111111] bg-gray-100 px-2 py-1 rounded-lg">{data.deliveryPartners}</span></div>
      </div>
      <Link href="/super-admin/users" className="block text-center w-full mt-6 py-2.5 bg-[#FAFAF8] text-[#111111] rounded-xl hover:bg-gray-100 transition-colors">Manage Users</Link>
    </div>
  );
}

export function SubscriptionOverview({ data }: any) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#111111] mb-4">Subscriptions</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
          <p className="text-xs font-bold text-green-600 mb-1">Active</p>
          <p className="text-2xl font-black text-green-700">{data.active}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-xl border border-red-100">
          <p className="text-xs font-bold text-red-600 mb-1">Expired/Cancelled</p>
          <p className="text-2xl font-black text-red-700">{data.expired + data.cancelled}</p>
        </div>
      </div>
      {data.expiringSoon > 0 && (
        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-center justify-between text-sm font-bold">
          <span className="text-orange-700">Expiring in 7 Days</span>
          <span className="bg-orange-200 text-orange-800 px-2 rounded-lg">{data.expiringSoon}</span>
        </div>
      )}
    </div>
  );
}

export function PlanOverview({ data }: any) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
         <h2 className="text-xl font-bold text-[#111111]">Plans</h2>
         <Link href="/super-admin/plans" className="text-xs font-bold text-gray-500 hover:text-[#111111]">Manage</Link>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No plans defined.</p>
      ) : (
        <div className="space-y-3">
          {data.map((p: any) => (
            <div key={p._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
              <div>
                <p className="text-sm font-bold text-[#111111] flex items-center gap-2">
                  {p.name}
                  {!p.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md uppercase">Inactive</span>}
                </p>
                <p className="text-xs text-gray-500 font-medium">₹{p.price}/{p.billingCycle.toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-[#111111]">{p.subscribers}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Subscribers</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DeliveryOverview({ data }: any) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#111111] mb-4">Delivery Activity</h2>
      <div className="space-y-3 text-sm font-bold">
        <div className="flex justify-between items-center"><span className="text-gray-500">Assigned</span> <span className="text-[#111111]">{data.assigned}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-500">Accepted</span> <span className="text-blue-600">{data.accepted}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-500">Picked Up</span> <span className="text-purple-600">{data.pickedUp}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-500">Out for Delivery</span> <span className="text-orange-600">{data.outForDelivery}</span></div>
      </div>
    </div>
  );
}

export function MenuOverview({ data }: any) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#111111] mb-4">Platform Menu</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-[#FAFAF8] rounded-xl border border-gray-100">
          <p className="text-2xl font-black text-[#111111]">{data.total}</p>
          <p className="text-xs font-bold text-gray-500">Total Items</p>
        </div>
        <div className="text-center p-3 bg-[#FAFAF8] rounded-xl border border-gray-100">
          <p className="text-2xl font-black text-[#111111]">{data.categories}</p>
          <p className="text-xs font-bold text-gray-500">Categories</p>
        </div>
      </div>
    </div>
  );
}

export function SystemHealth({ data }: any) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#111111] mb-4">System Health</h2>
      <div className="space-y-3 text-sm font-bold">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Database</span>
          <span className={`px-2 py-1 rounded-lg ${data.database === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{data.database}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Authentication</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg">{data.authentication}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">API</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg">{data.api}</span>
        </div>
      </div>
    </div>
  );
}

export function QuickActions() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#111111] mb-4">Quick Actions</h2>
      <div className="space-y-2">
        <Link href="/super-admin/restaurants/new" className="block w-full py-2.5 px-4 bg-[#FAFAF8] hover:bg-gray-100 border border-gray-100 rounded-xl text-sm font-bold text-[#111111] transition-colors text-center">+ Add Restaurant</Link>
        <Link href="/super-admin/plans/new" className="block w-full py-2.5 px-4 bg-[#FAFAF8] hover:bg-gray-100 border border-gray-100 rounded-xl text-sm font-bold text-[#111111] transition-colors text-center">+ Create Plan</Link>
        <Link href="/super-admin/users/new" className="block w-full py-2.5 px-4 bg-[#FAFAF8] hover:bg-gray-100 border border-gray-100 rounded-xl text-sm font-bold text-[#111111] transition-colors text-center">+ Create User</Link>
      </div>
    </div>
  );
}
