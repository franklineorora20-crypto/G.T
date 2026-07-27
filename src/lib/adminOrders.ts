import type { Order, OrderStatus } from "../types";
import { mapDbOrderToOrder } from "./orders";
import { supabase } from "./supabase";

export type PaymentStatus = Order["paymentStatus"];

export interface AdminOrder extends Order {
  dbId: number;
  trackingId: string | null;
  rawCreatedAt: string;
  pickupDate?: string;
  timeSlot?: string;
}

export function mapRowToAdminOrder(row: Record<string, unknown>): AdminOrder {
  const base = mapDbOrderToOrder(row);
  return {
    ...base,
    dbId: row.id as number,
    trackingId: (row.tracking_id as string | null) ?? null,
    rawCreatedAt: (row.created_at as string) || "",
    pickupDate: row.pickupDate as string | undefined,
    timeSlot: row.timeSlot as string | undefined,
  };
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("Orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapRowToAdminOrder(row as Record<string, unknown>));
}

export async function updateOrderStatus(
  dbId: number,
  status: OrderStatus
): Promise<void> {
  const { error } = await supabase.from("Orders").update({ status }).eq("id", dbId);
  if (error) throw error;
}

export async function updateOrderPaymentStatus(
  dbId: number,
  paymentStatus: PaymentStatus
): Promise<void> {
  const { error } = await supabase
    .from("Orders")
    .update({ paymentStatus })
    .eq("id", dbId);
  if (error) throw error;
}

export async function deleteOrderById(dbId: number): Promise<void> {
  const { error } = await supabase.from("Orders").delete().eq("id", dbId);
  if (error) throw error;
}
