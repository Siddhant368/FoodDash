"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  subtotal: number;
};

type Order = {
  _id: string;
  restaurantId: string;
  customerId: string;

  items: OrderItem[];

  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;

  status: OrderStatus;

  paymentMethod: "COD" | "ONLINE";
  paymentStatus: PaymentStatus;

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
  updatedAt?: string;
};

type ApiResponse = {
  success: boolean;
  order?: Order;
  assignment?: any;
  message?: string;
};

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const paymentStatuses: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [orderId, setOrderId] = useState("");

  const [order, setOrder] = useState<Order | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [updatingPayment, setUpdatingPayment] =
    useState(false);

  const [assignment, setAssignment] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const loadOrderId = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    };

    loadOrderId();
  }, [params]);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/orders/${orderId}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result: ApiResponse =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Failed to fetch order"
          );
        }

        if (!result.order) {
          throw new Error("Order not found");
        }

        setOrder(result.order);
        if (result.assignment) setAssignment(result.assignment);
        
        // Fetch partners
        try {
          const partnersRes = await fetch('/api/admin/delivery/partners', { credentials: 'include' });
          const partnersData = await partnersRes.json();
          if (partnersData.success && partnersData.partners) {
            setPartners(partnersData.partners);
          }
        } catch(e) {}

      } catch (error: unknown) {
        console.error(
          "ORDER DETAILS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch order"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const updateStatus = async (
    status: OrderStatus
  ) => {
    if (!order) return;

    try {
      setUpdatingStatus(true);

      const response = await fetch(
        `/api/admin/orders/${order._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update order status"
        );
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              status,
            }
          : current
      );
    } catch (error: unknown) {
      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const assignDeliveryPartner = async () => {
    if (!order || !selectedPartnerId) return;
    try {
      setAssigning(true);
      const res = await fetch('/api/admin/delivery/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId: order._id, deliveryPartnerId: selectedPartnerId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to assign delivery partner');
      }
      setAssignment(data.assignment);
      alert('Delivery partner assigned successfully');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to assign');
    } finally {
      setAssigning(false);
    }
  };

  const updatePaymentStatus = async (
    paymentStatus: PaymentStatus
  ) => {
    if (!order) return;

    try {
      setUpdatingPayment(true);

      const response = await fetch(
        `/api/admin/orders/${order._id}/payment-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            paymentStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update payment status"
        );
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              paymentStatus,
            }
          : current
      );
    } catch (error: unknown) {
      console.error(
        "PAYMENT UPDATE ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update payment status"
      );
    } finally {
      setUpdatingPayment(false);
    }
  };

  const getStatusClass = (
    status: OrderStatus
  ) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-[#FFE13C] border-yellow-500/20";

      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "PREPARING":
        return "bg-[#FFE13C]/10 text-[#FFE13C] border-[#FFE13C]/20";

      case "READY":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "OUT_FOR_DELIVERY":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

      case "DELIVERED":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      default:
        return "bg-white/5 text-gray-400 border-white/10";
    }
  };

  const getPaymentClass = (
    status: PaymentStatus
  ) => {
    switch (status) {
      case "PAID":
        return "text-green-400";

      case "FAILED":
        return "text-red-400";

      case "REFUNDED":
        return "text-purple-400";

      default:
        return "text-[#FFE13C]";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-zinc-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-64 bg-white/10 rounded" />
            <div className="h-40 bg-white/5 rounded-2xl" />
            <div className="h-60 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-zinc-800 p-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/admin/orders"
            className="text-gray-400 hover:text-zinc-800"
          >
            ← Back to Orders
          </Link>

          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-red-400">
              Unable to load order
            </h2>

            <p className="text-gray-400 mt-2">
              {error || "Order not found"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-zinc-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/admin/orders"
              className="text-sm text-gray-400 hover:text-zinc-800 transition"
            >
              ← Back to Orders
            </Link>

            <h1 className="text-3xl font-bold mt-3">
              Order #
              {order._id
                .slice(-8)
                .toUpperCase()}
            </h1>

            <p className="text-gray-400 mt-1">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div
            className={`inline-flex w-fit px-4 py-2 rounded-xl border text-sm font-medium ${getStatusClass(
              order.status
            )}`}
          >
            {order.status.replaceAll(
              "_",
              " "
            )}
          </div>
        </div>

        {/* Status Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

          {/* Order Status */}
          <div className="bg-[#131318] border border-white/10 rounded-2xl p-5">
            <p className="text-sm text-gray-400 mb-3">
              Order Status
            </p>

            <select
              value={order.status}
              disabled={
                updatingStatus ||
                order.status === "DELIVERED" ||
                order.status === "CANCELLED"
              }
              onChange={(e) =>
                updateStatus(
                  e.target.value as OrderStatus
                )
              }
              className={`w-full px-4 py-3 rounded-xl border bg-transparent outline-none ${getStatusClass(
                order.status
              )}`}
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                  className="bg-[#131318] text-zinc-800"
                >
                  {status.replaceAll(
                    "_",
                    " "
                  )}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div className="bg-[#131318] border border-white/10 rounded-2xl p-5">
            <p className="text-sm text-gray-400 mb-3">
              Payment Status
            </p>

            <select
              value={order.paymentStatus}
              disabled={
                updatingPayment ||
                order.paymentStatus === "REFUNDED"
              }
              onChange={(e) =>
                updatePaymentStatus(
                  e.target.value as PaymentStatus
                )
              }
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0b0b0f] outline-none"
            >
              {paymentStatuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                    className="bg-[#131318]"
                  >
                    {status}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Customer + Delivery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Customer */}
          <section className="bg-[#131318] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-5">
              Customer Information
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">
                  Name
                </p>

                <p className="mt-1">
                  {order.deliveryAddress.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Phone
                </p>

                <p className="mt-1">
                  {order.deliveryAddress.phone}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Customer ID
                </p>

                <p className="mt-1 text-sm text-gray-400 break-all">
                  {order.customerId}
                </p>
              </div>
            </div>
          </section>

          {/* Delivery Address */}
          <section className="bg-[#131318] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-5">
              Delivery Address
            </h2>

            <div className="text-gray-300 leading-7">
              <p>
                {order.deliveryAddress.addressLine1}
              </p>

              {order.deliveryAddress.addressLine2 && (
                <p>
                  {order.deliveryAddress.addressLine2}
                </p>
              )}

              <p>
                {order.deliveryAddress.city},{" "}
                {order.deliveryAddress.state}
              </p>

              <p>
                Pincode:{" "}
                {order.deliveryAddress.pincode}
              </p>
            </div>
          </section>
        </div>

        {/* Delivery Assignment */}
        <section className="bg-[#131318] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-5">Delivery Assignment</h2>
          {assignment ? (
            <div className="space-y-3">
              <p className="text-green-400 font-medium">Assigned</p>
              <p className="text-gray-400 text-sm">Status: <span className="text-white">{assignment.status}</span></p>
              {assignment.deliveryPartner && (
                <p className="text-gray-400 text-sm">Partner: <span className="text-white">{assignment.deliveryPartner.name}</span></p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {order.status !== "READY" ? (
                <p className="text-yellow-500 text-sm">Order must be READY before assigning a delivery partner.</p>
              ) : (
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-2 block">Select Delivery Partner</label>
                    <select
                      value={selectedPartnerId}
                      onChange={(e) => setSelectedPartnerId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0b0b0f] outline-none"
                    >
                      <option value="">-- Select Partner --</option>
                      {partners.map(p => (
                        <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={assignDeliveryPartner}
                    disabled={assigning || !selectedPartnerId}
                    className="px-6 py-3 bg-[#FFE13C] text-black font-semibold rounded-xl hover:bg-yellow-400 disabled:opacity-50"
                  >
                    {assigning ? "Assigning..." : "Assign"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Items */}
        <section className="bg-[#131318] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              Order Items
            </h2>

            <span className="text-sm text-gray-400">
              {order.items.length} item
              {order.items.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          <div className="space-y-4">
            {order.items.map(
              (item, index) => (
                <div
                  key={`${item.menuItemId}-${index}`}
                  className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(
                        item.price
                      )}{" "}
                      × {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {formatCurrency(
                      item.subtotal
                    )}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Price Summary */}
        <section className="bg-[#131318] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-5">
            Payment Summary
          </h2>

          <div className="max-w-md ml-auto space-y-3">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>

              <span>
                {formatCurrency(
                  order.subtotal
                )}
              </span>
            </div>

            <div className="flex justify-between text-gray-400">
              <span>Delivery Fee</span>

              <span>
                {order.deliveryFee === 0
                  ? "FREE"
                  : formatCurrency(
                      order.deliveryFee
                    )}
              </span>
            </div>

            <div className="flex justify-between text-gray-400">
              <span>Tax</span>

              <span>
                {formatCurrency(order.tax)}
              </span>
            </div>

            <div className="flex justify-between text-gray-400">
              <span>Discount</span>

              <span>
                -{formatCurrency(order.discount)}
              </span>
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-2xl font-bold">
                {formatCurrency(
                  order.totalAmount
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Payment Information */}
        <section className="bg-[#131318] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-5">
            Payment Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-gray-500">
                Payment Method
              </p>

              <p className="mt-1 font-medium">
                {order.paymentMethod}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Payment Status
              </p>

              <p
                className={`mt-1 font-medium ${getPaymentClass(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus}
              </p>
            </div>
          </div>
        </section>

        {/* Customer Note */}
        {order.customerNote && (
          <section className="bg-[#131318] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-3">
              Customer Note
            </h2>

            <p className="text-gray-400">
              {order.customerNote}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}