import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  Download,
  Trash2,
  ChevronRight,
  X,
  Menu,
  Filter,
  Package,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { signOutAdmin } from "../lib/auth";
import {
  type AdminOrder,

  fetchAdminOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  deleteOrderById,
} from "../lib/adminOrders";
import type { OrderStatus,PaymentStatus } from "../types";
import { computeAdminKpis, exportOrdersToCsv } from "./adminMetrics";
import { Toast, ToastMessage } from "../components/Toast";

const STATUS_OPTIONS: OrderStatus[] = [
  "Order Received",
  "Pickup Scheduled",
  "Picked Up",
  "Washing",
  "Drying",
  "Ironing",
  "Quality Check",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
];

const PAYMENT_OPTIONS: PaymentStatus[] = [
  "Paid via M-Pesa",
  "Pending M-Pesa",
  "Failed M-Pesa",
  "Cancelled M-Pesa",
  "Pay on Delivery",
];

function normalizeAdminStatus(status: OrderStatus): OrderStatus {
  switch (status) {
    case 'Inspection & Sorting':
      return 'Pickup Scheduled';
    case 'In Wash & Revitalizing':
      return 'Washing';
    case 'Ready for Pickup / Out for Delivery':
      return 'Out for Delivery';
    case 'Completed':
      return 'Delivered';
    default:
      return status;
  }
}

function nextStatus(current: OrderStatus): OrderStatus | null {
  const normalizedCurrent = normalizeAdminStatus(current);
  const i = STATUS_OPTIONS.indexOf(normalizedCurrent);
  if (i < 0 || i >= STATUS_OPTIONS.length - 1) return null;
  return STATUS_OPTIONS[i + 1];
}

function formatMoney(n: number) {
  return `Ksh ${n.toLocaleString()}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

interface AdminDashboardProps {
  session: Session;
  onSignedOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  onSignedOut,
}) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminOrder | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const showToast = (
    title: string,
    message?: string,
    type: "success" | "error" | "info" = "success"
  ) => setToast({ id: `${Date.now()}`, title, message, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch (e) {
      showToast(
        "Failed to load orders",
        e instanceof Error ? e.message : "Unknown error",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = useMemo(() => computeAdminKpis(orders), [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...orders];

    if (q) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.trackingId ?? "").toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.address.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (branchFilter !== "all") {
      list = list.filter((o) => o.branch === branchFilter);
    }

    list.sort((a, b) => {
      const ta = new Date(a.rawCreatedAt).getTime();
      const tb = new Date(b.rawCreatedAt).getTime();
      return sortAsc ? ta - tb : tb - ta;
    });

    return list;
  }, [orders, search, statusFilter, branchFilter, sortAsc]);

  const handleSignOut = async () => {
    await signOutAdmin();
    onSignedOut();
  };

  const handleAdvanceStatus = async (order: AdminOrder) => {
    const next = nextStatus(order.status);
    if (!next) return;
    setActionId(order.dbId);
    try {
      await updateOrderStatus(order.dbId, next);
      showToast("Status updated", `${order.id} → ${next}`);
      await load();
      if (selected?.dbId === order.dbId) {
        setSelected((s) => (s ? { ...s, status: next } : null));
      }
    } catch (e) {
      showToast(
        "Update failed",
        e instanceof Error ? e.message : "Check admin RLS policies",
        "error"
      );
    } finally {
      setActionId(null);
    }
  };

  const handleSetStatus = async (order: AdminOrder, status: OrderStatus) => {
    setActionId(order.dbId);
    try {
      await updateOrderStatus(order.dbId, status);
      showToast("Status updated", `${order.id} → ${status}`);
      await load();
      if (selected?.dbId === order.dbId) {
        setSelected((s) => (s ? { ...s, status } : null));
      }
    } catch (e) {
      showToast(
        "Update failed",
        e instanceof Error ? e.message : "Check admin RLS policies",
        "error"
      );
    } finally {
      setActionId(null);
    }
  };

  const handlePaymentChange = async (
    order: AdminOrder,
    paymentStatus: PaymentStatus
  ) => {
    setActionId(order.dbId);
    try {
      await updateOrderPaymentStatus(order.dbId, paymentStatus);
      showToast("Payment updated", `${order.id}: ${paymentStatus}`);
      await load();
      if (selected?.dbId === order.dbId) {
        setSelected((s) => (s ? { ...s, paymentStatus } : null));
      }
    } catch (e) {
      showToast(
        "Update failed",
        e instanceof Error ? e.message : "Check admin RLS policies",
        "error"
      );
    } finally {
      setActionId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionId(deleteTarget.dbId);
    try {
      await deleteOrderById(deleteTarget.dbId);
      showToast("Order deleted", deleteTarget.id);
      setDeleteTarget(null);
      if (selected?.dbId === deleteTarget.dbId) setSelected(null);
      await load();
    } catch (e) {
      showToast(
        "Delete failed",
        e instanceof Error ? e.message : "Check admin RLS policies",
        "error"
      );
    } finally {
      setActionId(null);
    }
  };

  const kpiCards = [
    { label: "Total Orders", value: kpis.totalOrders, accent: "border-l-[#341168]" },
    { label: "Orders Today", value: kpis.ordersToday, accent: "border-l-[#fed65b]" },
    { label: "Pending", value: kpis.pendingOrders, accent: "border-l-amber-500" },
    { label: "Active", value: kpis.activeOrders, accent: "border-l-sky-500" },
    { label: "Completed", value: kpis.completedOrders, accent: "border-l-emerald-500" },
    {
      label: "Revenue Today",
      value: formatMoney(kpis.revenueToday),
      accent: "border-l-[#341168]",
      isMoney: true,
    },
    {
      label: "Revenue This Month",
      value: formatMoney(kpis.revenueThisMonth),
      accent: "border-l-[#fed65b]",
      isMoney: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f0ef] font-worksans flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#341168] text-white flex flex-col shrink-0 transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 font-manrope font-extrabold text-lg">
            <LayoutDashboard className="w-6 h-6 text-[#fed65b]" />
            Admin
          </div>
          <p className="text-white/60 text-xs mt-1 truncate">{session.user.email}</p>
        </div>
        <nav className="p-4 flex-1">
          <div className="px-3 py-2 rounded-xl bg-white/10 text-sm font-bold font-manrope">
            Orders Dashboard
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-bold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-[#e5e2e1] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-[#f6f3f2] cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-[#341168]" />
            </button>
            <div>
              <h1 className="font-manrope font-extrabold text-[#341168] text-lg sm:text-xl truncate">
                Operations Overview
              </h1>
              <p className="text-xs text-[#7b7581] hidden sm:block">
                Manage bookings, status, and payments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e5e2e1] text-xs font-bold text-[#341168] hover:bg-[#f6f3f2] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => exportOrdersToCsv(filtered)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#341168] text-white text-xs font-bold hover:bg-[#4b2c7f] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-auto">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
            {kpiCards.map((k) => (
              <div
                key={k.label}
                className={`bg-white rounded-2xl border border-[#e5e2e1] p-4 shadow-sm border-l-4 ${k.accent}`}
              >
                <p className="text-[10px] sm:text-xs font-bold text-[#7b7581] uppercase tracking-wide font-manrope">
                  {k.label}
                </p>
                <p
                  className={`mt-1 font-extrabold font-manrope text-[#341168] ${
                    k.isMoney ? "text-sm sm:text-base" : "text-xl sm:text-2xl"
                  }`}
                >
                  {k.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[#e5e2e1] p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#341168] font-manrope">
              <Filter className="w-4 h-4" />
              Filters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7b7581]" />
                <input
                  type="search"
                  placeholder="Search ID, name, phone…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm focus:ring-2 focus:ring-[#341168] outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2.5 px-3 rounded-xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm font-medium"
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="py-2.5 px-3 rounded-xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm font-medium"
              >
                <option value="all">All branches</option>
                <option value="Rongai Branch">Rongai Branch</option>
                <option value="Ngong Branch">Ngong Branch</option>
              </select>
              <select
                value={sortAsc ? "asc" : "desc"}
                onChange={(e) => setSortAsc(e.target.value === "asc")}
                className="py-2.5 px-3 rounded-xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm font-medium"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
            <p className="text-xs text-[#7b7581]">
              Showing {filtered.length} of {orders.length} orders
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#e5e2e1] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f6f3f2] text-left text-xs font-bold font-manrope text-[#341168] uppercase">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e2e1]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[#7b7581]">
                        {loading ? "Loading orders…" : "No orders match your filters."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => (
                      <tr key={order.dbId} className="hover:bg-[#fcf9f8]">
                        <td className="px-4 py-3 font-bold text-[#341168]">{order.id}</td>
                        <td className="px-4 py-3">
                          <div>{order.customerName}</div>
                          <div className="text-xs text-[#7b7581]">{order.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">{order.branch}</td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            disabled={actionId === order.dbId}
                            onChange={(e) =>
                              handleSetStatus(order, e.target.value as OrderStatus)
                            }
                            className="text-xs max-w-[180px] py-1.5 px-2 rounded-lg border border-[#e5e2e1] bg-white"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.paymentStatus}
                            disabled={actionId === order.dbId}
                            onChange={(e) =>
                              handlePaymentChange(
                                order,
                                e.target.value as PaymentStatus
                              )
                            }
                            className="text-xs max-w-[140px] py-1.5 px-2 rounded-lg border border-[#e5e2e1] bg-white"
                          >
                            {PAYMENT_OPTIONS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 font-bold">{formatMoney(order.totalPrice)}</td>
                        <td className="px-4 py-3 text-xs text-[#7b7581] whitespace-nowrap">
                          {formatDate(order.rawCreatedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {nextStatus(order.status) && (
                              <button
                                type="button"
                                title="Advance status"
                                disabled={actionId === order.dbId}
                                onClick={() => handleAdvanceStatus(order)}
                                className="p-2 rounded-lg bg-[#341168]/10 text-[#341168] hover:bg-[#341168]/20 cursor-pointer disabled:opacity-50"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelected(order)}
                              className="px-2 py-1.5 text-xs font-bold rounded-lg border border-[#e5e2e1] hover:bg-[#f6f3f2] cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(order)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-[#7b7581] border border-[#e5e2e1]">
                {loading ? "Loading orders…" : "No orders match your filters."}
              </div>
            ) : (
              filtered.map((order) => (
                <div
                  key={order.dbId}
                  className="bg-white rounded-2xl border border-[#e5e2e1] p-4 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold font-manrope text-[#341168]">{order.id}</p>
                      <p className="text-sm">{order.customerName}</p>
                      <p className="text-xs text-[#7b7581]">{order.phone}</p>
                    </div>
                    <p className="font-bold text-sm">{formatMoney(order.totalPrice)}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={order.status}
                      disabled={actionId === order.dbId}
                      onChange={(e) =>
                        handleSetStatus(order, e.target.value as OrderStatus)
                      }
                      className="text-xs py-2 px-2 rounded-lg border border-[#e5e2e1]"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <select
                      value={order.paymentStatus}
                      disabled={actionId === order.dbId}
                      onChange={(e) =>
                        handlePaymentChange(order, e.target.value as PaymentStatus)
                      }
                      className="text-xs py-2 px-2 rounded-lg border border-[#e5e2e1]"
                    >
                      {PAYMENT_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    {nextStatus(order.status) && (
                      <button
                        type="button"
                        disabled={actionId === order.dbId}
                        onClick={() => handleAdvanceStatus(order)}
                        className="flex-1 py-2 rounded-xl bg-[#341168] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        Next step
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelected(order)}
                      className="flex-1 py-2 rounded-xl border border-[#e5e2e1] text-xs font-bold cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(order)}
                      className="p-2 rounded-xl text-red-600 border border-red-200 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={() => setSelected(null)}
          />
          <div className="relative bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-extrabold font-manrope text-[#341168] flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {selected.id}
                </h2>
                <p className="text-xs text-[#7b7581]">{formatDate(selected.rawCreatedAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-full hover:bg-[#f6f3f2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <dl className="space-y-3 text-sm">
              <DetailRow icon={User} label="Customer" value={selected.customerName} />
              <DetailRow icon={Phone} label="Phone" value={selected.phone} />
              <DetailRow icon={MapPin} label="Address" value={selected.address} />
              <DetailRow icon={MapPin} label="Branch" value={selected.branch} />
              <DetailRow
                icon={Calendar}
                label="Pickup"
                value={`${selected.pickupDate ?? "—"} · ${selected.timeSlot ?? "—"}`}
              />
              <DetailRow icon={CreditCard} label="Total" value={formatMoney(selected.totalPrice)} />
              {selected.mpesaPhone && (
                <DetailRow icon={Phone} label="M-Pesa Phone" value={selected.mpesaPhone} />
              )}
              {selected.checkoutRequestId && (
                <DetailRow icon={Clock} label="Checkout Request" value={selected.checkoutRequestId} />
              )}
              {selected.merchantRequestId && (
                <DetailRow icon={Clock} label="Merchant Request" value={selected.merchantRequestId} />
              )}
              {selected.mpesaReceiptNumber && (
                <DetailRow icon={CheckCircle2} label="Mpesa Receipt" value={selected.mpesaReceiptNumber} />
              )}
              {selected.transactionDate && (
                <DetailRow icon={Calendar} label="Transaction Date" value={formatDate(selected.transactionDate)} />
              )}
              {selected.paymentStatusReason && (
                <DetailRow
                  icon={Package}
                  label="Payment note"
                  value={selected.paymentStatusReason}
                />
              )}
              <DetailRow icon={Clock} label="Est. delivery" value={selected.estimatedDelivery} />
              {selected.specialNotes && (
                <DetailRow icon={Package} label="Care notes" value={selected.specialNotes} />
              )}
            </dl>

            <div className="pt-2 space-y-2 border-t border-[#e5e2e1]">
              <label className="text-xs font-bold text-[#341168] font-manrope">Order status</label>
              <select
                value={selected.status}
                disabled={actionId === selected.dbId}
                onChange={(e) =>
                  handleSetStatus(selected, e.target.value as OrderStatus)
                }
                className="w-full py-2.5 px-3 rounded-xl border border-[#e5e2e1] text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label className="text-xs font-bold text-[#341168] font-manrope">Payment status</label>
              <select
                value={selected.paymentStatus}
                disabled={actionId === selected.dbId}
                onChange={(e) =>
                  handlePaymentChange(selected, e.target.value as PaymentStatus)
                }
                className="w-full py-2.5 px-3 rounded-xl border border-[#e5e2e1] text-sm"
              >
                {PAYMENT_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cancel"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-extrabold font-manrope text-[#341168] text-lg">Delete order?</h3>
            <p className="text-sm text-[#4a4550]">
              Permanently remove order <strong>{deleteTarget.id}</strong> for{" "}
              {deleteTarget.customerName}? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#e5e2e1] font-bold text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionId === deleteTarget.dbId}
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="w-4 h-4 text-[#341168] shrink-0 mt-0.5" />
      <div>
        <dt className="text-[10px] font-bold uppercase text-[#7b7581] font-manrope">{label}</dt>
        <dd className="text-[#1c1b1b]">{value}</dd>
      </div>
    </div>
  );
}