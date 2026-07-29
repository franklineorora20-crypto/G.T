import type { Order, OrderStatus, PaymentStatus } from "../types";
import { mapDbOrderToOrder } from "./orders";
import { supabase } from "./supabase";

export interface AdminOrder extends Order {
  dbId: number;
  trackingId: string | null;
  rawCreatedAt: string;

  pickupDate?: string;
  timeSlot?: string;

  mpesaReceiptNumber?: string;
  mpesaAmount?: number;
  mpesaPhone?: string;

  checkoutRequestId?: string;
  merchantRequestId?: string;

  paymentStatusReason?: string;
}

export function mapRowToAdminOrder(
  row: Record<string, unknown>
): AdminOrder {

  const base = mapDbOrderToOrder(row);

  return {

    ...base,

    dbId:
      Number(row.id),

    trackingId:
      (row.tracking_id as string | null) ?? null,

    rawCreatedAt:
      (row.created_at as string) ?? "",

    pickupDate:
      (row.pickupDate as string) ?? undefined,

    timeSlot:
      (row.timeSlot as string) ?? undefined,

    //----------------------------------
    // MPESA
    //----------------------------------

    mpesaReceiptNumber:
      (row.mpesaRef as string) ?? undefined,

    mpesaAmount:
      row.mpesa_amount != null
        ? Number(row.mpesa_amount)
        : undefined,

    mpesaPhone:
      (row.mpesa_phone as string) ?? undefined,

    checkoutRequestId:
      (row.checkout_request_id as string) ?? undefined,

    merchantRequestId:
      (row.merchant_request_id as string) ?? undefined,

    paymentStatusReason:
      (row.payment_status_reason as string) ?? undefined,
  };
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {

  const { data, error } = await supabase
    .from("Orders")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return (data ?? []).map((row) =>
    mapRowToAdminOrder(row as Record<string, unknown>)
  );
}

export async function updateOrderStatus(
  dbId: number,
  status: OrderStatus
): Promise<void> {

  const { error } = await supabase
    .from("Orders")
    .update({ status })
    .eq("id", dbId);

  if (error) throw error;
}

export async function updateOrderPaymentStatus(
  dbId: number,
  paymentStatus: PaymentStatus
): Promise<void> {

  const { error } = await supabase
    .from("Orders")
    .update({
      paymentStatus,
    })
    .eq("id", dbId);

  if (error) throw error;
}

export async function deleteOrderById(
  dbId: number
): Promise<void> {

  const { error } = await supabase
    .from("Orders")
    .delete()
    .eq("id", dbId);

  if (error) throw error;
}