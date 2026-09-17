"use client";

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

type Order = {
  _id: string;
  customerId: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    image?: string;
  }[];
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
};

type OrdersResponse = {
  success: boolean;
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [updatingOrder, setUpdatingOrder] = useState<string | null>(
    null
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", page.toString());
      params.set("limit", "10");

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const response = await fetch(
        `/api/admin/orders?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result: OrdersResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch orders"
        );
      }

      setOrders(result.data || []);

      setTotalPages(
        result.pagination?.totalPages || 1
      );
    } catch (error: unknown) {
      console.error("ORDERS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus
  ) => {
    try {
      setUpdatingOrder(orderId);

      const response = await fetch(
        `/api/admin/orders/${orderId}/status`,
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
          result.message || "Failed to update order status"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );
    } catch (error: unknown) {
      console.error("STATUS UPDATE ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update status"
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const updatePaymentStatus = async (
    orderId: string,
    paymentStatus: PaymentStatus
  ) => {
    try {
      setUpdatingOrder(orderId);

      const response = await fetch(
        `/api/admin/orders/${orderId}/payment-status`,
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

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                paymentStatus,
              }
            : order
        )
      );
    } catch (error: unknown) {
      console.error(
        "PAYMENT STATUS UPDATE ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update payment status"
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

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

  const getStatusClass = (status: OrderStatus) => {
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
        return "bg-white/5 text-gray-500 border-white/10";
    }
  };

  const getPaymentClass = (
    paymentStatus: PaymentStatus
  ) => {
    switch (paymentStatus) {
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#111111] tracking-tight">
              Orders
            </h1>

            <p className="text-gray-500 font-medium mt-1">
              Manage restaurant orders and payments.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="bg-[#111111] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#FFE13C] hover:text-[#111111] transition-colors shadow-lg shadow-[#111111]/10"
          >
            Refresh
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <label className="text-sm text-gray-500">
              Filter by status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none text-[#111111]"
            >
              <option value="">All Orders</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6">
            <p className="text-red-400">
              {error}
            </p>

            <button
              onClick={fetchOrders}
              className="mt-3 px-4 py-2 bg-red-500 rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-gray-500">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">
              📦
            </div>

            <h2 className="text-xl font-semibold">
              No orders found
            </h2>

            <p className="text-gray-500 mt-2">
              There are no orders matching your filter.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FAFAF8] border-b border-gray-100">
                    <tr className="text-left text-sm text-gray-500 font-semibold">
                      <th className="px-5 py-4">
                        Order
                      </th>

                      <th className="px-5 py-4">
                        Customer
                      </th>

                      <th className="px-5 py-4">
                        Items
                      </th>

                      <th className="px-5 py-4">
                        Total
                      </th>

                      <th className="px-5 py-4">
                        Payment
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-50 last:border-0 hover:bg-[#FAFAF8] transition-colors"
                      >
                        <td className="px-5 py-5">
                          <p className="font-medium">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>

                          <p className="text-xs text-gray-500 mt-1 font-medium">
                            {formatDate(order.createdAt)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p>
                            {order.deliveryAddress.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {order.deliveryAddress.phone}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p>
                            {order.items.length} item
                            {order.items.length !== 1
                              ? "s"
                              : ""}
                          </p>

                          <p className="text-xs text-gray-500 mt-1 font-medium max-w-[200px] truncate">
                            {order.items
                              .map(
                                (item) =>
                                  `${item.name} × ${item.quantity}`
                              )
                              .join(", ")}
                          </p>
                        </td>

                        <td className="px-5 py-5 font-semibold">
                          {formatCurrency(
                            order.totalAmount
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm">
                            {order.paymentMethod}
                          </p>

                          <p
                            className={`text-xs mt-1 ${getPaymentClass(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <select
                            value={order.status}
                            disabled={
                              updatingOrder === order._id ||
                              order.status === "DELIVERED" ||
                              order.status === "CANCELLED"
                            }
                            onChange={(e) =>
                              updateOrderStatus(
                                order._id,
                                e.target.value as OrderStatus
                              )
                            }
                            className={`px-3 py-2 rounded-lg border text-xs font-medium bg-transparent outline-none ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {statuses.map((status) => (
                              <option
                                key={status}
                                value={status}
                                className="bg-white text-[#111111]"
                              >
                                {status.replaceAll(
                                  "_",
                                  " "
                                )}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="lg:hidden space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        #{order._id
                          .slice(-8)
                          .toUpperCase()}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span className="font-bold">
                      {formatCurrency(
                        order.totalAmount
                      )}
                    </span>
                  </div>

                  <div className="border-b border-gray-50 last:border-0 hover:bg-[#FAFAF8] transition-colors my-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Customer
                      </span>

                      <span>
                        {order.deliveryAddress.name}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Phone
                      </span>

                      <span>
                        {order.deliveryAddress.phone}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Payment
                      </span>

                      <span>
                        {order.paymentMethod}{" "}
                        <span
                          className={getPaymentClass(
                            order.paymentStatus
                          )}
                        >
                          ({order.paymentStatus})
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Items
                    </p>

                    <div className="space-y-1">
                      {order.items.map(
                        (item, index) => (
                          <div
                            key={`${item.name}-${index}`}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.name} ×{" "}
                              {item.quantity}
                            </span>

                            <span>
                              {formatCurrency(
                                item.subtotal
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm text-gray-500 mb-2">
                      Order Status
                    </p>

                    <select
                      value={order.status}
                      disabled={
                        updatingOrder === order._id ||
                        order.status === "DELIVERED" ||
                        order.status === "CANCELLED"
                      }
                      onChange={(e) =>
                        updateOrderStatus(
                          order._id,
                          e.target.value as OrderStatus
                        )
                      }
                      className={`w-full px-3 py-2.5 rounded-xl border bg-transparent outline-none text-sm ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {statuses.map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="bg-white text-[#111111]"
                        >
                          {status.replaceAll(
                            "_",
                            " "
                          )}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Payment Status
                    </p>

                    <select
                      value={order.paymentStatus}
                      disabled={
                        updatingOrder === order._id ||
                        order.paymentStatus === "REFUNDED"
                      }
                      onChange={(e) =>
                        updatePaymentStatus(
                          order._id,
                          e.target
                            .value as PaymentStatus
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none text-sm text-[#111111]"
                    >
                      {paymentStatuses.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                            className="bg-white"
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <button
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                className="px-4 py-2 rounded-xl border border-gray-200 bg-[#FAFAF8] text-[#111111] font-bold hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
                className="px-4 py-2 rounded-xl border border-gray-200 bg-[#FAFAF8] text-[#111111] font-bold hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}