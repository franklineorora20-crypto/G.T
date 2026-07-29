import type { Order } from "../types";
import { supabase } from "./supabase";

export function mapDbOrderToOrder(
  row: Record<string, unknown>
): Order {

  const trackingId =
    row.tracking_id as string | null | undefined;

  const numericId =
    row.id as number | string | undefined;

  return {

    //----------------------------------
    // BASIC DETAILS
    //----------------------------------

    id:
      trackingId ?? `GL-${numericId}`,

    customerName:
      (row.customerName as string) ?? "",

    phone:
      (row.phone as string) ?? "",

    email:
      (row.email as string) ?? undefined,

    branch:
      (row.branch as Order["branch"]) ??
      "Rongai Branch",

    address:
      (row.address as string) ?? "",

    items:
      (row.items as Order["items"]) ?? [],

    totalPrice:
      Number(row.totalPrice ?? 0),

    status:
      (row.status as Order["status"]) ??
      "Order Received",

    createdAt:
      (row.created_at as string) ?? "",

    estimatedDelivery:
      (row.estimatedDelivery as string) ??
      "Within 24 Hours",

    paymentStatus:
      (row.paymentStatus as Order["paymentStatus"]) ??
      "Pay on Delivery",

    deliveryType:
      (row.deliveryType as Order["deliveryType"]) ??
      "Delivery to Door",

    specialNotes:
      (row.specialNotes as string) ?? "",

    trackingNotes:
      (row.trackingNotes as Order["trackingNotes"]) ?? [],

    //----------------------------------
    // M-PESA
    //----------------------------------

    mpesaRef:
      (row.mpesaRef as string) ?? undefined,

    mpesaPhone:
      (row.mpesa_phone as string) ?? undefined,

    mpesaAmount:
      row.mpesa_amount != null
        ? Number(row.mpesa_amount)
        : undefined,

    checkoutRequestId:
      (row.checkout_request_id as string) ??
      undefined,

    merchantRequestId:
      (row.merchant_request_id as string) ??
      undefined,

    mpesaReceiptNumber:
      (row.mpesaRef as string) ??
      undefined,

    transactionDate:
      undefined,

    paymentStatusReason:
      (row.payment_status_reason as string) ??
      undefined,
  };
}

export async function getOrders() {

  const { data, error } =
    await supabase
      .from("Orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) throw error;

  return data ?? [];
}

export async function getOrderByTrackingId(
  trackingId: string
) {

  const { data, error } =
    await supabase
      .from("Orders")
      .select("*")
      .eq("tracking_id", trackingId.trim())
      .maybeSingle();

  if (error) throw error;

  return data;
}