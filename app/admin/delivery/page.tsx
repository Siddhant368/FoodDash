"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DeliveryStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

interface Order {
  _id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  deliveryAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  customerNote?: string;
  createdAt: string;
}

interface DeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

interface Assignment {
  id: string;
  status: DeliveryStatus;
  assignedAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  deliveryNote?: string;
}

interface DeliveryRecord {
  assignment: Assignment;
  order: Order | null;
  deliveryPartner: DeliveryPartner | null;
}

interface DeliveryResponse {
  success: boolean;
  assignments: DeliveryRecord[];
  total: number;
  message?: string;
}

interface ReadyOrder {
  _id: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "COD" | "ONLINE";
  deliveryAddress: {
    name: string;
    phone: string;
    city: string;
    pincode: string;
  };
  createdAt: string;
}

interface OrdersResponse {
  success: boolean;
  orders?: ReadyOrder[];
  data?: ReadyOrder[];
  message?: string;
}

interface PartnersResponse {
  success: boolean;
  partners: DeliveryPartner[];
  message?: string;
}

export default function AdminDeliveryPage() {
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [readyOrders, setReadyOrders] = useState<ReadyOrder[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("ALL");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [deliveryResponse, ordersResponse, partnersResponse] =
        await Promise.all([
          fetch("/api/admin/delivery", {
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/admin/orders?status=READY&page=1&limit=100", {
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/admin/delivery/partners", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

      const deliveryData: DeliveryResponse =
        await deliveryResponse.json();

      const ordersData: OrdersResponse =
        await ordersResponse.json();

      const partnersData: PartnersResponse =
        await partnersResponse.json();

      if (!deliveryResponse.ok || !deliveryData.success) {
        throw new Error(
          deliveryData.message || "Failed to load deliveries"
        );
      }

      if (!ordersResponse.ok || !ordersData.success) {
        throw new Error(
          ordersData.message || "Failed to load ready orders"
        );
      }

      if (!partnersResponse.ok || !partnersData.success) {
        throw new Error(
          partnersData.message || "Failed to load delivery partners"
        );
      }

      setRecords(deliveryData.assignments || []);
      setReadyOrders(ordersData.data || ordersData.orders || []);
      setPartners(partnersData.partners || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load delivery data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function assignDelivery() {
    if (!selectedOrderId) {
      setError("Please select an order.");
      return;
    }

    if (!selectedPartnerId) {
      setError("Please select a delivery partner.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/delivery/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          orderId: selectedOrderId,
          deliveryPartnerId: selectedPartnerId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to assign delivery"
        );
      }

      setSuccess("Delivery partner assigned successfully.");

      setSelectedOrderId("");
      setSelectedPartnerId("");

      await loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to assign delivery"
      );
    } finally {
      setAssigning(false);
    }
  }

  const statistics = useMemo(() => {
    return {
      total: records.length,

      assigned: records.filter(
        (item) => item.assignment.status === "ASSIGNED"
      ).length,

      accepted: records.filter(
        (item) => item.assignment.status === "ACCEPTED"
      ).length,

      pickedUp: records.filter(
        (item) => item.assignment.status === "PICKED_UP"
      ).length,

      outForDelivery: records.filter(
        (item) => item.assignment.status === "OUT_FOR_DELIVERY"
      ).length,

      delivered: records.filter(
        (item) => item.assignment.status === "DELIVERED"
      ).length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (selectedStatus === "ALL") {
      return records;
    }

    return records.filter(
      (item) => item.assignment.status === selectedStatus
    );
  }, [records, selectedStatus]);

  function formatStatus(status: string) {
    return status
      .split("_")
      .map(
        (word) =>
          word.charAt(0) + word.slice(1).toLowerCase()
      )
      .join(" ");
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getStatusStyle(status: DeliveryStatus) {
    switch (status) {
      case "ASSIGNED":
        return {
          wrapper:
            "border-[#FFE13C]/30 bg-[#FFE13C]/10 text-orange-700",
          dot: "bg-orange-400",
        };

      case "ACCEPTED":
        return {
          wrapper:
            "border-amber-400/30 bg-amber-400/10 text-amber-700",
          dot: "bg-amber-400",
        };

      case "PICKED_UP":
        return {
          wrapper:
            "border-orange-400/30 bg-orange-400/10 text-orange-600",
          dot: "bg-orange-300",
        };

      case "OUT_FOR_DELIVERY":
        return {
          wrapper:
            "border-[#FFE13C]/50 bg-[#FFE13C]/15 text-orange-700",
          dot: "bg-[#FFE13C]",
        };

      case "DELIVERED":
        return {
          wrapper:
            "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
          dot: "bg-emerald-400",
        };

      case "CANCELLED":
        return {
          wrapper:
            "border-red-500/30 bg-red-500/10 text-red-700",
          dot: "bg-red-400",
        };
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] text-[#111111] p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-12 w-72 rounded-xl bg-white/5" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl bg-white/5 border border-white/5"
              />
            ))}
          </div>

          <div className="h-72 rounded-3xl bg-white/5 border border-white/5" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#111111] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-7">

        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl border border-[#FFE13C]/15 bg-gradient-to-br from-orange-500/[0.10] via-white/[0.03] to-transparent p-6 md:p-8">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#FFE13C]/10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE13C]/15 border border-[#FFE13C]/20 text-2xl">
                  🚚
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#FFE13C] font-semibold">
                    Operations
                  </p>

                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Delivery Management
                  </h1>
                </div>
              </div>

              <p className="text-gray-500 mt-4 max-w-2xl">
                Assign orders, monitor delivery partners and track
                every delivery in real time.
              </p>
            </div>

            <button
              onClick={loadData}
              className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#FFE13C]/20 bg-[#FFE13C]/10 text-orange-700 hover:bg-[#FFE13C]/20 hover:border-[#FFE13C]/40 transition"
            >
              <span className="group-hover:rotate-180 transition-transform duration-500">
                ↻
              </span>
              Refresh
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-700">
            <span className="text-xl">!</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-emerald-700">
            <span className="text-xl">✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* STATISTICS */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total"
            value={statistics.total}
            icon="◉"
            active
          />

          <StatCard
            title="Assigned"
            value={statistics.assigned}
            icon="◌"
          />

          <StatCard
            title="Accepted"
            value={statistics.accepted}
            icon="✓"
          />

          <StatCard
            title="Picked Up"
            value={statistics.pickedUp}
            icon="↑"
          />

          <StatCard
            title="On Delivery"
            value={statistics.outForDelivery}
            icon="→"
            active
          />

          <StatCard
            title="Delivered"
            value={statistics.delivered}
            icon="✓"
            delivered
          />
        </section>

        {/* ASSIGN DELIVERY */}
        <section className="relative overflow-hidden rounded-3xl border border-[#FFE13C]/20 bg-white">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#FFE13C]/[0.07] blur-3xl pointer-events-none" />

          <div className="relative p-5 md:p-7">

            <div className="flex items-start gap-4 mb-7">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFE13C] text-xl shadow-[0_0_30px_rgba(249,115,22,0.20)]">
                🚚
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-bold">
                  Assign Delivery
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Assign a ready order to an active delivery partner.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* ORDER SELECT */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Ready Order
                </label>

                <select
                  value={selectedOrderId}
                  onChange={(e) =>
                    setSelectedOrderId(e.target.value)
                  }
                  className="w-full h-12 px-4 rounded-xl bg-[#FAFAF8] border border-gray-100 text-[#111111] outline-none focus:border-[#FFE13C]/50 focus:ring-2 focus:ring-orange-500/10 transition"
                >
                  <option value="">
                    Select a READY order
                  </option>

                  {readyOrders.map((order) => (
                    <option
                      key={order._id}
                      value={order._id}
                    >
                      #{order._id.slice(-6).toUpperCase()} — ₹
                      {order.totalAmount} —{" "}
                      {order.deliveryAddress.name}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-gray-500 mt-2">
                  {readyOrders.length} ready order
                  {readyOrders.length !== 1 ? "s" : ""} available
                </p>
              </div>

              {/* PARTNER SELECT */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Delivery Partner
                </label>

                <select
                  value={selectedPartnerId}
                  onChange={(e) =>
                    setSelectedPartnerId(e.target.value)
                  }
                  className="w-full h-12 px-4 rounded-xl bg-[#FAFAF8] border border-gray-100 text-[#111111] outline-none focus:border-[#FFE13C]/50 focus:ring-2 focus:ring-orange-500/10 transition"
                >
                  <option value="">
                    Select delivery partner
                  </option>

                  {partners.map((partner) => (
                    <option
                      key={partner._id}
                      value={partner._id}
                    >
                      {partner.name}
                      {partner.phone
                        ? ` — ${partner.phone}`
                        : ""}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-gray-500 mt-2">
                  {partners.length} active partner
                  {partners.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* BUTTON */}
              <div className="flex items-end">
                <button
                  onClick={assignDelivery}
                  disabled={
                    assigning ||
                    !selectedOrderId ||
                    !selectedPartnerId
                  }
                  className="relative overflow-hidden w-full h-12 rounded-xl bg-[#FFE13C] text-[#111111] font-semibold shadow-[0_8px_30px_rgba(249,115,22,0.18)] hover:bg-orange-400 hover:shadow-[0_8px_35px_rgba(249,115,22,0.28)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  {assigning ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-800 animate-spin" />
                      Assigning...
                    </span>
                  ) : (
                    "Assign Delivery"
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#FFE13C] font-semibold">
              Live Tracking
            </p>

            <h2 className="text-2xl font-bold mt-1">
              Delivery Assignments
            </h2>
          </div>

          <div className="text-sm text-gray-500">
            {filteredRecords.length} assignment
            {filteredRecords.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            "ALL",
            "ASSIGNED",
            "ACCEPTED",
            "PICKED_UP",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED",
          ].map((status) => {
            const active = selectedStatus === status;

            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`shrink-0 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                  active
                    ? "bg-[#FFE13C] border-[#FFE13C] text-[#111111] shadow-[0_5px_20px_rgba(249,115,22,0.18)]"
                    : "bg-gray-50 border-gray-100 text-gray-500 hover:border-[#FFE13C]/30 hover:text-orange-700"
                }`}
              >
                {status === "ALL"
                  ? "All"
                  : formatStatus(status)}
              </button>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filteredRecords.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 p-12 text-center">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FFE13C]/10 border border-[#FFE13C]/20 text-4xl">
              🚚
            </div>

            <h3 className="text-xl font-semibold mt-5">
              No delivery assignments
            </h3>

            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Assign a READY order to a delivery partner and
              it will appear here.
            </p>
          </div>
        )}

        {/* DESKTOP TABLE */}
        {filteredRecords.length > 0 && (
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-gray-100 bg-white">

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Order
                    </th>

                    <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Customer
                    </th>

                    <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Partner
                    </th>

                    <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Amount
                    </th>

                    <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Order
                    </th>

                    <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Delivery
                    </th>

                    <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {filteredRecords.map((record) => {
                    const order = record.order;
                    const partner = record.deliveryPartner;

                    if (!order) return null;

                    const style = getStatusStyle(
                      record.assignment.status
                    );

                    return (
                      <tr
                        key={record.assignment.id}
                        className="group hover:bg-[#FFE13C]/[0.025] transition"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-[#111111]">
                            #
                            {order._id
                              .slice(-6)
                              .toUpperCase()}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-medium">
                            {order.deliveryAddress.name}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {order.deliveryAddress.phone}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          {partner ? (
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-[#FFE13C]/10 border border-[#FFE13C]/20 flex items-center justify-center text-[#FFE13C] font-semibold">
                                {partner.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="font-medium">
                                  {partner.name}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                  {partner.phone ||
                                    partner.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">
                              Partner unavailable
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-bold text-orange-700">
                            ₹{order.totalAmount}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {order.paymentMethod}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex px-3 py-1.5 rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-700">
                            {formatStatus(order.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${style.wrapper}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                            />

                            {formatStatus(
                              record.assignment.status
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/delivery/${record.assignment.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#FFE13C]/20 bg-[#FFE13C]/5 text-orange-700 text-sm hover:bg-[#FFE13C]/15 hover:border-[#FFE13C]/40 transition"
                          >
                            Details
                            <span>→</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MOBILE CARDS */}
        {filteredRecords.length > 0 && (
          <div className="lg:hidden space-y-4">
            {filteredRecords.map((record) => {
              const order = record.order;
              const partner = record.deliveryPartner;

              if (!order) return null;

              const style = getStatusStyle(
                record.assignment.status
              );

              return (
                <div
                  key={record.assignment.id}
                  className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-orange-500/60 via-orange-500/10 to-transparent" />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold">
                        #
                        {order._id
                          .slice(-6)
                          .toUpperCase()}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${style.wrapper}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                      />

                      {formatStatus(
                        record.assignment.status
                      )}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100 my-5" />

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500">
                        Customer
                      </p>

                      <p className="font-medium mt-1">
                        {order.deliveryAddress.name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {order.deliveryAddress.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500">
                        Amount
                      </p>

                      <p className="font-bold text-orange-700 mt-1">
                        ₹{order.totalAmount}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500">
                      Delivery Partner
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="h-9 w-9 rounded-xl bg-[#FFE13C]/10 border border-[#FFE13C]/20 flex items-center justify-center text-[#FFE13C] font-semibold">
                        {partner
                          ? partner.name
                              .charAt(0)
                              .toUpperCase()
                          : "?"}
                      </div>

                      <div>
                        <p className="font-medium">
                          {partner?.name ||
                            "Unavailable"}
                        </p>

                        {partner?.phone && (
                          <p className="text-xs text-gray-500">
                            {partner.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500">
                      Delivery Address
                    </p>

                    <p className="text-sm text-gray-500 mt-2 leading-6">
                      {order.deliveryAddress.addressLine1}
                      {order.deliveryAddress.addressLine2 &&
                        `, ${order.deliveryAddress.addressLine2}`}
                      , {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.state} -{" "}
                      {order.deliveryAddress.pincode}
                    </p>
                  </div>

                  <Link
                    href={`/admin/delivery/${record.assignment.id}`}
                    className="flex items-center justify-center gap-2 w-full mt-5 px-4 py-3 rounded-xl bg-[#FFE13C] text-[#111111] font-semibold hover:bg-orange-400 transition"
                  >
                    View Delivery Details
                    <span>→</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  active = false,
  delivered = false,
}: {
  title: string;
  value: number;
  icon: string;
  active?: boolean;
  delivered?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-4 md:p-5 transition ${
        active
          ? "border-[#FFE13C]/20 bg-[#FFE13C]/[0.055] hover:border-[#FFE13C]/35"
          : delivered
          ? "border-emerald-500/15 bg-emerald-500/[0.035]"
          : "border-gray-100 bg-gray-50 hover:border-[#FFE13C]/20"
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs md:text-sm text-gray-500">
          {title}
        </p>

        <span
          className={`text-lg ${
            active
              ? "text-[#FFE13C]"
              : delivered
              ? "text-emerald-400"
              : "text-gray-500"
          }`}
        >
          {icon}
        </span>
      </div>

      <p className="text-2xl md:text-3xl font-bold mt-3">
        {value}
      </p>

      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
      )}
    </div>
  );
}