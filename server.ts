import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || (MPESA_ENVIRONMENT === 'production' ? '880100' : '174379');
const MPESA_ACCOUNT_REFERENCE = process.env.MPESA_ACCOUNT_REFERENCE || (MPESA_ENVIRONMENT === 'production' ? '1006242177' : 'TestReference');
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL;
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

const isValidCallbackUrl = (url: string | undefined) => {
  if (!url) return false;
  return /^https:\/\//i.test(url) && !url.includes('<your-project-id>');
};

const getMpesaLocalCallbackUrl = () => `http://localhost:${PORT}/api/callback/stk`;

const getMpesaCallbackUrl = () => {
  if (isValidCallbackUrl(MPESA_CALLBACK_URL)) {
    return MPESA_CALLBACK_URL;
  }

  if (SUPABASE_PROJECT_REF) {
    return `https://${SUPABASE_PROJECT_REF}.functions.supabase.co/mpesa-callback`;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('No valid MPESA_CALLBACK_URL configured; using local callback only for development. Daraja will not be able to call localhost directly.');
    return getMpesaLocalCallbackUrl();
  }

  return undefined;
};

const MPESA_CALLBACK_URL_RESOLVED = getMpesaCallbackUrl();
console.info('Using Node env:', process.env.NODE_ENV || 'undefined');
console.info('Configured MPESA_CALLBACK_URL:', MPESA_CALLBACK_URL || 'none');
console.info('Resolved MPESA callback URL:', MPESA_CALLBACK_URL_RESOLVED || 'none');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;
const WHATSAPP_FROM = process.env.WHATSAPP_FROM;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL in server environment.');
}

if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_PASSKEY || !MPESA_CALLBACK_URL_RESOLVED) {
  throw new Error('Missing Safaricom Daraja environment variables in server environment. Set MPESA_CALLBACK_URL or SUPABASE_PROJECT_REF for production, or run in development for local callback handling.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const getDarajaBaseUrl = () => {
  return MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
};

const getTimestamp = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());
  const second = pad(now.getSeconds());
  return `${year}${month}${day}${hour}${minute}${second}`;
};

const normalizeMpesaPhone = (phone: string) => {
  const digits = String(phone).trim().replace(/[^0-9]/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  if (digits.startsWith('7') && digits.length === 9) {
    return `254${digits}`;
  }
  if (digits.startsWith('254') && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith('255') && digits.length === 12) {
    return digits;
  }
  return digits;
};

const getAccessToken = async () => {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const url = `${getDarajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Daraja auth failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.access_token as string;
};

const normalizeOrderItems = (items: unknown) => {
  if (Array.isArray(items)) return items;
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [items];
    }
  }
  if (items == null) return [];
  return [items];
};

const insertOrderRecord = async (orderData: Record<string, unknown>) => {
  const trackingId = `GL-${Math.floor(100000 + Math.random() * 900000)}`;
  const items = normalizeOrderItems(orderData.items);
  const payload = {
    tracking_id: trackingId,
    status: 'Order Received',
    paymentStatus: String(orderData.paymentStatus || 'Pay on Delivery'),
    created_at: new Date().toISOString(),
    customerName: orderData.customerName || null,
    phone: orderData.phone || null,
    email: orderData.email || null,
    branch: orderData.branch || null,
    address: orderData.address || null,
    items,
    totalPrice: Number(orderData.totalPrice || 0),
    pickupDate: orderData.pickupDate || null,
    timeSlot: orderData.timeSlot || null,
    specialNotes: orderData.specialNotes || null,
    deliveryType: orderData.deliveryType || null,
  };

  console.info('Inserting order record into Supabase:', {
    trackingId,
    paymentStatus: payload.paymentStatus,
    totalPrice: payload.totalPrice,
    phone: payload.phone,
    items: payload.items,
  });

  const result = await supabase.from('Orders').insert([payload]).select().single();
  if (result.error) {
    console.error('Supabase order insert failed:', {
      message: result.error.message,
      details: result.error.details,
      hint: result.error.hint,
      code: result.error.code,
      payload,
    });
    const rawError = result.error.message || result.error.details || JSON.stringify(result.error);
    throw new Error(rawError || 'Supabase order insert failed.');
  }

  return result.data;
};

const notifyPaymentStatusUpdate = async (order: Record<string, unknown>) => {
  const phone = order.phone as string | undefined;
  const email = order.email as string | undefined;
  const id = order.tracking_id as string | undefined;
  const status = order.paymentStatus as string | undefined;
  const receipt = order.mpesa_receipt_number as string | undefined;
  const updatedMessage = `Goldtribe order ${id} payment status updated to ${status}. Receipt: ${receipt || 'N/A'}.`;
  const updatedEmailContent = `Hello ${order.customerName},\n\nYour Goldtribe order ${id} payment status has been updated to ${status}.\nReceipt: ${receipt || 'Pending'}.\n\nThank you for choosing Goldtribe.`;

  if (phone) {
    await sendSms(phone, updatedMessage);
    await sendWhatsapp(phone, updatedMessage);
  }
  if (email) {
    await sendEmail(email, 'Goldtribe Payment Update', updatedEmailContent);
  }
};

const sendSms = async (phone: string, message: string) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM) {
    console.log('SMS hook skipped (Twilio not configured)', { phone, message });
    return;
  }

  const body = new URLSearchParams({
    To: phone,
    From: TWILIO_FROM,
    Body: message,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Twilio SMS failed', errorText);
  }
};

const sendWhatsapp = async (phone: string, message: string) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !WHATSAPP_FROM) {
    console.log('WhatsApp hook skipped (Twilio WhatsApp not configured)', { phone, message });
    return;
  }

  const body = new URLSearchParams({
    To: `whatsapp:${phone}`,
    From: WHATSAPP_FROM,
    Body: message,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Twilio WhatsApp failed', errorText);
  }
};

const sendEmail = async (email: string, subject: string, content: string) => {
  if (!SENDGRID_API_KEY || !EMAIL_FROM) {
    console.log('Email hook skipped (SendGrid not configured)', { email, subject });
    return;
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: EMAIL_FROM },
      subject,
      content: [{ type: 'text/plain', value: content }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SendGrid email failed', errorText);
  }
};

const notifyOrderCreated = async (order: Record<string, unknown>) => {
  const phone = order.phone as string | undefined;
  const email = order.email as string | undefined;
  const id = order.tracking_id as string | undefined;
  const totalPrice = order.totalPrice as number | string | undefined;
  const status = order.paymentStatus as string | undefined;

  const message = `Goldtribe order ${id} confirmed. Amount: Ksh ${totalPrice}. Status: ${status}.`; 
  const emailContent = `Hello ${order.customerName},\n\nYour Goldtribe order ${id} has been created successfully.\nAmount: Ksh ${totalPrice}.\nStatus: ${status}.\n\nThank you for choosing Goldtribe.`;

  if (phone) {
    await sendSms(phone, message);
    await sendWhatsapp(phone, message);
  }
  if (email) {
    await sendEmail(email, 'Goldtribe Order Confirmation', emailContent);
  }
};

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

app.post('/api/stkpush', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      branch,
      address,
      items,
      totalPrice,
      pickupDate,
      timeSlot,
      specialNotes,
      deliveryType,
    } = req.body;

    if (!phone || !totalPrice || !customerName) {
      return res.status(400).json({ error: 'Missing required payment or customer details.' });
    }

    const normalizedPhone = normalizeMpesaPhone(phone);
    if (!/^254[0-9]{9}$/.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid MPESA phone number. Use 07XXXXXXXX or 2547XXXXXXXX format.' });
    }

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const body = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: totalPrice,
      PartyA: normalizedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: MPESA_CALLBACK_URL_RESOLVED,
      AccountReference: MPESA_ACCOUNT_REFERENCE,
      TransactionDesc: 'Goldtribe Laundry Order Payment',
    };

    console.info('Sending Daraja STK Push request:', {
      phone: normalizedPhone,
      amount: totalPrice,
      shortcode: MPESA_SHORTCODE,
      callbackUrl: MPESA_CALLBACK_URL_RESOLVED,
      accountReference: MPESA_ACCOUNT_REFERENCE,
    });

    const response = await fetch(`${getDarajaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: any = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.warn('Daraja returned invalid JSON:', text);
        data = { rawResponse: text };
      }
    }

    if (!response.ok) {
      console.error('Daraja STK Push error response:', response.status, response.statusText, text);
      return res.status(response.status).json({
        error: data.errorMessage || data.error || response.statusText || 'STK Push request failed.',
        raw: text,
      });
    }

    const { CheckoutRequestID, MerchantRequestID, ResponseCode, ResponseDescription } = data;
    if (ResponseCode !== '0' && ResponseCode !== 0) {
      console.error('Daraja STK Push rejected:', data);
      return res.status(400).json({
        error: ResponseDescription || 'STK Push was rejected by Daraja.',
        raw: text,
      });
    }

    if (!CheckoutRequestID || !MerchantRequestID) {
      console.error('Daraja STK Push missing IDs:', data);
      return res.status(500).json({
        error: 'Missing Daraja checkout identifiers.',
        raw: text,
      });
    }

    const trackingId = `GL-${Math.floor(100000 + Math.random() * 900000)}`;
    const result = await supabase.from('Orders').insert([
      {
        tracking_id: trackingId,
        customerName,
        phone,
        branch,
        address,
        items,
        totalPrice,
        status: 'Order Received',
        paymentStatus: 'Pending M-Pesa',
        mpesa_phone: normalizedPhone,
        mpesa_amount: totalPrice,
        checkout_request_id: CheckoutRequestID,
        merchant_request_id: MerchantRequestID,
        payment_status_reason: ResponseDescription,
        pickupDate,
        timeSlot,
        specialNotes,
        deliveryType,
        created_at: new Date().toISOString(),
      },
    ]).select().single();

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    await notifyOrderCreated(result.data);

    return res.status(200).json({
      order: result.data,
      checkoutRequestId: CheckoutRequestID,
      merchantRequestId: MerchantRequestID,
      responseDescription: ResponseDescription,
    });
  } catch (error: any) {
    console.error('STK Push error:', error);
    return res.status(500).json({ error: error?.message || String(error) || 'Unable to initiate STK Push request.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      branch,
      address,
      items,
      totalPrice,
      pickupDate,
      timeSlot,
      specialNotes,
      deliveryType,
      paymentMethod,
    } = req.body;

    if (!customerName || !phone || !totalPrice) {
      return res.status(400).json({ error: 'Missing required order details.' });
    }

    const paymentStatus = paymentMethod === 'mpesa' ? 'Pending M-Pesa' : 'Pay on Delivery';

    const orderData = {
      customerName,
      phone,
      email,
      branch,
      address,
      items,
      totalPrice,
      paymentStatus,
      pickupDate,
      timeSlot,
      specialNotes,
      deliveryType,
    };

    const result = await insertOrderRecord(orderData);

    res.status(201).json({ order: result });

    try {
      await notifyOrderCreated(result);
    } catch (notificationError) {
      console.error('Order created but notification failed:', notificationError);
    }

    return;
  } catch (error: any) {
    const message =
      typeof error === 'string'
        ? error
        : error instanceof Error
        ? error.message
        : JSON.stringify(error);
    console.error('Order creation error:', message, error);
    return res.status(500).json({ error: message || 'Unable to create order.' });
  }
});

app.post('/api/callback/stk', async (req, res) => {
  try {
    const payload = req.body;
    const callback = payload?.Body?.stkCallback;
    if (!callback) {
      return res.status(400).json({ error: 'Invalid Daraja callback payload.' });
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
    let paymentStatus: string = 'Pending M-Pesa';

    if (ResultCode === 0) {
      paymentStatus = 'Paid via M-Pesa';
    } else if (resultDesc.includes('cancel') || resultDesc.includes('cancelled')) {
      paymentStatus = 'Cancelled M-Pesa';
    } else {
      paymentStatus = 'Failed M-Pesa';
    }

    const transactionDate = formatDarajaTimestamp(parsed.TransactionDate);

    const updates: Record<string, unknown> = {
      paymentStatus,
      merchant_request_id: MerchantRequestID,
      checkout_request_id: CheckoutRequestID,
      mpesa_receipt_number: parsed.MpesaReceiptNumber || null,
      transaction_date: transactionDate || null,
      mpesa_phone: parsed.PhoneNumber || null,
      mpesa_amount: parsed.Amount || null,
      payment_status_reason: ResultDesc || null,
    };

    const { error } = await supabase
      .from('Orders')
      .update(updates)
      .eq('checkout_request_id', CheckoutRequestID);

    if (error) {
      console.error('Daraja callback update failed:', error);
      return res.status(500).json({ error: 'Failed to update order payment status.' });
    }

    const orderResult = await supabase
      .from('Orders')
      .select('*')
      .eq('checkout_request_id', CheckoutRequestID)
      .maybeSingle();

    if (!orderResult.error && orderResult.data) {
      await notifyPaymentStatusUpdate(orderResult.data);
    }

    return res.status(200).json({ result: 'success' });
  } catch (error) {
    console.error('Daraja callback error:', error);
    return res.status(500).json({ error: 'Daraja callback handler failed.' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Daraja backend is listening on http://localhost:${PORT}`);
});
