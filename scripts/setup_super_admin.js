const fs = require('fs');
const path = require('path');

const rootDir = "C:\\Users\\siddh\\OneDrive\\Desktop\\restaurant-saas";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 1. Notification Model
const notificationModelContent = `import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  title: string;
  type: string;
  recipientRole: string;
  restaurantId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  recipientRole: { type: String, required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
`;

// 2. Orders API
const ordersApiRoute = `import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (searchParams.get("status")) filter.status = searchParams.get("status");
    if (searchParams.get("paymentStatus")) filter.paymentStatus = searchParams.get("paymentStatus");
    if (searchParams.get("restaurantId")) filter.restaurantId = searchParams.get("restaurantId");
    
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "restaurantId", model: Restaurant, select: "name" })
        .populate({ path: "customerId", model: User, select: "name email phone" })
        .lean(),
      Order.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.message === "FORBIDDEN" ? 403 : 500 });
  }
}
`;

const ordersIdApiRoute = `import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    const { id } = await params;
    
    const order = await Order.findById(id)
      .populate({ path: "restaurantId", model: Restaurant, select: "name email phone" })
      .populate({ path: "customerId", model: User, select: "name email phone" })
      .lean();

    if (!order) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`;

// 3. Staff API
const staffApiRoute = `import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";
import { checkSubscriptionLimit } from "@/lib/subscription/limits";
import { hashPassword } from "@/lib/auth/password";

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const filter: any = { role: "STAFF" };
    
    if (searchParams.get("restaurantId")) filter.restaurantId = searchParams.get("restaurantId");
    
    const [staff, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate({path: "restaurantId", model: Restaurant, select: "name"}).lean(),
      User.countDocuments(filter)
    ]);
    
    return NextResponse.json({ success: true, data: staff, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }});
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    const body = await request.json();
    
    if (!body.restaurantId) return NextResponse.json({ success: false, message: "restaurantId required" }, { status: 400 });
    
    const canAddStaff = await checkSubscriptionLimit(body.restaurantId, "STAFF");
    if (!canAddStaff) return NextResponse.json({ success: false, message: "Subscription limit reached for staff" }, { status: 403 });
    
    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 });
    
    const hashedPassword = await hashPassword(body.password);
    
    const staff = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      password: hashedPassword,
      role: "STAFF",
      restaurantId: body.restaurantId,
      isActive: body.isActive ?? true
    });
    
    return NextResponse.json({ success: true, data: staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`;

// 4. Delivery Partners API
const deliveryApiRoute = `import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";
import { checkSubscriptionLimit } from "@/lib/subscription/limits";
import { hashPassword } from "@/lib/auth/password";

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const filter: any = { role: "DELIVERY_PARTNER" };
    
    if (searchParams.get("restaurantId")) filter.restaurantId = searchParams.get("restaurantId");
    
    const [partners, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate({path: "restaurantId", model: Restaurant, select: "name"}).lean(),
      User.countDocuments(filter)
    ]);
    
    // Fetch stats for each partner
    const dataWithStats = await Promise.all(partners.map(async (p: any) => {
      const stats = await DeliveryAssignment.aggregate([
        { $match: { deliveryPartnerId: p._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);
      const statsMap = stats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
      return { ...p, stats: statsMap };
    }));
    
    return NextResponse.json({ success: true, data: dataWithStats, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }});
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    const body = await request.json();
    
    if (!body.restaurantId) return NextResponse.json({ success: false, message: "restaurantId required" }, { status: 400 });
    
    const canAddPartner = await checkSubscriptionLimit(body.restaurantId, "DELIVERY_PARTNER");
    if (!canAddPartner) return NextResponse.json({ success: false, message: "Subscription limit reached for delivery partners" }, { status: 403 });
    
    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 });
    
    const hashedPassword = await hashPassword(body.password);
    
    const partner = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      password: hashedPassword,
      role: "DELIVERY_PARTNER",
      restaurantId: body.restaurantId,
      isActive: body.isActive ?? true
    });
    
    return NextResponse.json({ success: true, data: partner });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`;

// 5. Notifications API
const notifApiRoute = `import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { requireRole } from "@/lib/auth/guards";
import Restaurant from "@/models/Restaurant";

export async function GET(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const filter: any = {};
    
    if (searchParams.get("restaurantId")) filter.restaurantId = searchParams.get("restaurantId");
    
    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate({path: "restaurantId", model: Restaurant, select: "name"}).lean(),
      Notification.countDocuments(filter)
    ]);
    
    return NextResponse.json({ success: true, data: notifications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }});
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`;

// 6. UI Pages (Placeholder structured for these 4 missing modules)
const ordersPage = `"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Search, Filter } from "lucide-react";

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
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white">Platform Orders</h1>
        <p className="text-zinc-400 mt-1">View and manage all orders across restaurants</p>
      </div>
      <div className="admin-card p-6">
        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#f97316]" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr><th>ID</th><th>Restaurant</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {orders.map((o: any) => (
                  <tr key={o._id} className="hover:bg-[#18181b]">
                    <td className="py-4"><Link href={\`/super-admin/orders/\${o._id}\`} className="text-[#f97316] hover:underline">{o._id.substring(18)}</Link></td>
                    <td>{o.restaurantId?.name || "Unknown"}</td>
                    <td>{o.customerId?.name || "Unknown"}</td>
                    <td>₹{o.totalAmount}</td>
                    <td><span className="px-2 py-1 bg-zinc-800 rounded text-xs">{o.status}</span></td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
`;

const ordersIdPage = `"use client";
import { useState, useEffect, use } from "react";
import { Loader2 } from "lucide-react";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = use(params);

  useEffect(() => {
    fetch(\`/api/super-admin/orders/\${id}\`)
      .then(res => res.json())
      .then(data => { setOrder(data.data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#f97316]" /></div>;
  if (!order) return <div className="p-8 text-white">Order not found</div>;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-black text-white mb-6">Order Details</h1>
      <div className="admin-card p-6 space-y-4 text-zinc-300">
        <h2 className="text-xl font-bold text-white">Items</h2>
        <div className="divide-y divide-zinc-800">
          {order.items?.map((item: any) => (
             <div key={item._id} className="py-2 flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{item.subtotal}</span>
             </div>
          ))}
        </div>
        <div className="pt-4 border-t border-zinc-800">
          <p>Subtotal: ₹{order.subtotal}</p>
          <p>Delivery Fee: ₹{order.deliveryFee}</p>
          <p>Tax: ₹{order.tax}</p>
          <p className="font-bold text-white text-lg">Total: ₹{order.totalAmount}</p>
        </div>
      </div>
    </div>
  );
}
`;

const staffPage = `"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/staff")
      .then(res => res.json())
      .then(data => { setStaff(data.data || []); setLoading(false); });
  }, []);

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Staff Management</h1>
          <p className="text-zinc-400 mt-1">Platform-wide staff oversight</p>
        </div>
      </div>
      <div className="admin-card p-6">
        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#f97316]" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr><th>Name</th><th>Email</th><th>Restaurant</th><th>Status</th><th>Joined</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {staff.map((s: any) => (
                  <tr key={s._id} className="hover:bg-[#18181b]">
                    <td className="py-4 font-medium">{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.restaurantId?.name || "Unknown"}</td>
                    <td><span className={s.isActive ? "text-green-500" : "text-red-500"}>{s.isActive ? "Active" : "Inactive"}</span></td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
`;

const deliveryPage = `"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/delivery-partners")
      .then(res => res.json())
      .then(data => { setPartners(data.data || []); setLoading(false); });
  }, []);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white">Delivery Partners</h1>
        <p className="text-zinc-400 mt-1">Platform-wide delivery partner overview</p>
      </div>
      <div className="admin-card p-6">
        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#f97316]" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr><th>Name</th><th>Restaurant</th><th>Total Assignments</th><th>Delivered</th><th>Status</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {partners.map((p: any) => {
                   const total = Object.values(p.stats || {}).reduce((a:any, b:any) => a + b, 0);
                   return (
                  <tr key={p._id} className="hover:bg-[#18181b]">
                    <td className="py-4 font-medium">{p.name}</td>
                    <td>{p.restaurantId?.name || "Unknown"}</td>
                    <td>{total as number}</td>
                    <td>{p.stats?.DELIVERED || 0}</td>
                    <td><span className={p.isActive ? "text-green-500" : "text-red-500"}>{p.isActive ? "Active" : "Inactive"}</span></td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
`;

const notificationsPage = `"use client";
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
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white">Platform Notifications</h1>
        <p className="text-zinc-400 mt-1">Manage platform-wide alerts</p>
      </div>
      <div className="admin-card p-6">
        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#f97316]" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr><th>Title</th><th>Type</th><th>Restaurant</th><th>Date</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {notifs.map((n: any) => (
                  <tr key={n._id} className="hover:bg-[#18181b]">
                    <td className="py-4 font-medium">{n.title}</td>
                    <td><span className="px-2 py-1 bg-zinc-800 rounded text-xs">{n.type}</span></td>
                    <td>{n.restaurantId?.name || "Global"}</td>
                    <td>{new Date(n.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
`;

// Write Models
fs.writeFileSync(path.join(rootDir, "models", "Notification.ts"), notificationModelContent);

// Write API Routes
const apis = {
  "orders": ordersApiRoute,
  "orders/[id]": ordersIdApiRoute,
  "staff": staffApiRoute,
  "delivery-partners": deliveryApiRoute,
  "notifications": notifApiRoute
};

Object.keys(apis).forEach(route => {
  const dir = path.join(rootDir, "app/api/super-admin", route);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "route.ts"), apis[route]);
});

// Write UI Pages
const pages = {
  "orders": ordersPage,
  "orders/[id]": ordersIdPage,
  "staff": staffPage,
  "delivery-partners": deliveryPage,
  "notifications": notificationsPage
};

Object.keys(pages).forEach(route => {
  const dir = path.join(rootDir, "app/super-admin", route);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "page.tsx"), pages[route]);
});

console.log("Success! Models, APIs, and UI generated.");
