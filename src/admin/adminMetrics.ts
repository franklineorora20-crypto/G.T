import type { AdminOrder } from "../lib/adminOrders";
import type { OrderStatus } from "../types";

export interface AdminKpis {
  totalOrders: number;
  ordersToday: number;
  pendingOrders: number;
  activeOrders: number;
  completedOrders: number;
  revenueToday: number;
  revenueThisMonth: number;
}

function isSameLocalDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

function isSameLocalMonth(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function isPaid(order: AdminOrder): boolean {
  return order.paymentStatus === "Paid via M-Pesa";
}

const PENDING_STATUSES: OrderStatus[] = ["Order Received"];

export function computeAdminKpis(orders: AdminOrder[], now = new Date()): AdminKpis {
  let ordersToday = 0;
  let pendingOrders = 0;
  let activeOrders = 0;
  let completedOrders = 0;
  let revenueToday = 0;
  let revenueThisMonth = 0;

  for (const order of orders) {
    if (isSameLocalDay(order.rawCreatedAt, now)) ordersToday += 1;
    if (PENDING_STATUSES.includes(order.status)) pendingOrders += 1;
    if (order.status === "Completed") completedOrders += 1;
    else activeOrders += 1;

    const amount = order.totalPrice || 0;
    if (isPaid(order) && isSameLocalDay(order.rawCreatedAt, now)) {
      revenueToday += amount;
    }
    if (isPaid(order) && isSameLocalMonth(order.rawCreatedAt, now)) {
      revenueThisMonth += amount;
    }
  }

  return {
    totalOrders: orders.length,
    ordersToday,
    pendingOrders,
    activeOrders,
    completedOrders,
    revenueToday,
    revenueThisMonth,
  };
}

export function exportOrdersToCsv(orders: AdminOrder[], filename?: string): void {
  const headers = [
    "Tracking ID",
    "Customer",
    "Phone",
    "Branch",
    "Address",
    "Status",
    "Payment",
    "Total (KES)",
    "Pickup Date",
    "Time Slot",
    "Created At",
    "Notes",
  ];

  const escape = (v: string | number) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const rows = orders.map((o) =>
    [
      o.trackingId ?? o.id,
      o.customerName,
      o.phone,
      o.branch,
      o.address,
      o.status,
      o.paymentStatus,
      o.totalPrice,
      o.pickupDate ?? "",
      o.timeSlot ?? "",
      o.rawCreatedAt,
      o.specialNotes ?? "",
    ]
      .map(escape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ??
    `goldtribe-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
