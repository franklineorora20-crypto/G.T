// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const parseCallbackMetadata = (items: any[] = []) => {
  const result: {
    Amount?: number;
    MpesaReceiptNumber?: string;
    TransactionDate?: string;
    PhoneNumber?: string;
  } = {};

  for (const item of items) {
    if (item.Name === 'Amount') result.Amount = Number(item.Value);
    if (item.Name === 'MpesaReceiptNumber') result.MpesaReceiptNumber = String(item.Value);
    if (item.Name === 'TransactionDate') result.TransactionDate = String(item.Value);
    if (item.Name === 'PhoneNumber') result.PhoneNumber = String(item.Value);
  }

  return result;
};

const formatDarajaTimestamp = (timestamp?: string) => {
  if (!timestamp) return undefined;
  const padded = String(timestamp).padStart(14, '0');
  const year = padded.slice(0, 4);
  const month = padded.slice(4, 6);
  const day = padded.slice(6, 8);
  const hour = padded.slice(8, 10);
  const minute = padded.slice(10, 12);
  const second = padded.slice(12, 14);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
};

export default withSupabase({ auth: [] }, async (req, ctx) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = await req.json().catch(() => null);
  const callback = payload?.Body?.stkCallback;

  if (!callback) {
    return new Response(JSON.stringify({ error: 'Invalid Daraja callback payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    MerchantRequestID,
    CheckoutRequestID,
    ResultCode,
    ResultDesc,
    CallbackMetadata,
  } = callback;

  const parsed = parseCallbackMetadata(CallbackMetadata?.Item || []);
  const resultDesc = String(ResultDesc || '').toLowerCase();
  let paymentStatus = 'Pending M-Pesa';

  if (ResultCode === 0) {
    paymentStatus = 'Paid via M-Pesa';
  } else if (resultDesc.includes('cancel') || resultDesc.includes('cancelled')) {
    paymentStatus = 'Cancelled M-Pesa';
  } else {
    paymentStatus = 'Failed M-Pesa';
  }

  const transactionDate = formatDarajaTimestamp(parsed.TransactionDate);
  const updates = {
    paymentStatus,
    merchant_request_id: MerchantRequestID,
    checkout_request_id: CheckoutRequestID,
    mpesa_receipt_number: parsed.MpesaReceiptNumber || null,
    transaction_date: transactionDate || null,
    mpesa_phone: parsed.PhoneNumber || null,
    mpesa_amount: parsed.Amount || null,
    payment_status_reason: ResultDesc || null,
  };

  const { error } = await ctx.supabaseAdmin
    .from('Orders')
    .update(updates)
    .eq('checkout_request_id', CheckoutRequestID);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ result: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/mpesa-callback' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
