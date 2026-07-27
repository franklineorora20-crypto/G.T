import type { Order } from "../types";
import { supabase } from "./supabase";

export function mapDbOrderToOrder(order: Record<string, unknown>): Order {
  const trackingId = order.tracking_id as string | null | undefined;
  const numericId = order.id as number | string | undefined;

  return {
    id: trackingId ?? `GL-${numericId}`,
    customerName: (order.customerName as string) || "",
    phone: (order.phone as string) || "",
    email: (order.email as string) || undefined,
    branch: (order.branch as Order["branch"]) || "Rongai Branch",
    address: (order.address as string) || "",
    items: (order.items as Order["items"]) ?? [],
    totalPrice: (order.totalPrice as number) || 0,
    status: (order.status as Order["status"]) || "Order Received",
    createdAt: (order.created_at as string) || "",
    estimatedDelivery: (order.estimatedDelivery as string) || "Within 24 Hours",
    paymentStatus: (order.paymentStatus as Order["paymentStatus"]) || "Pay on Delivery",
    mpesaRef: order.mpesaRef as string | undefined,
    mpesaPhone: (order.mpesaPhone as string) || undefined,
    mpesaAmount: (order.mpesaAmount as number) || undefined,
    checkoutRequestId: (order.checkoutRequestId as string) || undefined,
    merchantRequestId: (order.merchantRequestId as string) || undefined,
    mpesaReceiptNumber: (order.mpesaReceiptNumber as string) || undefined,
    transactionDate: (order.transactionDate as string) || undefined,
    paymentStatusReason: (order.paymentStatusReason as string) || undefined,
    deliveryType: (order.deliveryType as Order["deliveryType"]) || "Delivery to Door",
    specialNotes: (order.specialNotes as string) || "",
    trackingNotes: (order.trackingNotes as Order["trackingNotes"]) ?? [],
  };
}

export async function getOrders() {
  const { data, error } = await supabase
    .from("Orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getOrderByTrackingId(trackingId: string) {
  const { data, error } = await supabase
    .from("Orders")
    .select("*")
    .eq("tracking_id", trackingId.trim())
    .maybeSingle();

  if (error) throw error;

  return data;
}
