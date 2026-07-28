import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  console.log("MPESA CALLBACK FUNCTION HIT");

  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    console.log("RAW CALLBACK BODY:", body);

    try {
      const callbackData = JSON.parse(body);

      console.log(
        "MPESA CALLBACK DATA:",
        JSON.stringify(callbackData, null, 2)
      );

      const stkCallback = callbackData?.Body?.stkCallback;

if (!stkCallback) {
  console.log("INVALID CALLBACK DATA");
  return res.status(400).json({
    error: "Invalid callback"
  });
}

      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const resultCode = stkCallback.ResultCode;

      console.log("RESULT CODE:", resultCode);
      console.log("CHECKOUT ID:", checkoutRequestId);

      // Connect to Supabase
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      if (resultCode === 0) {
        // Payment successful
        const metadata = stkCallback.CallbackMetadata?.Item || [];

        const receipt = metadata.find(
          (item) => item.Name === "MpesaReceiptNumber"
        )?.Value;

        const amount = metadata.find(
          (item) => item.Name === "Amount"
        )?.Value;

        const phone = metadata.find(
          (item) => item.Name === "PhoneNumber"
        )?.Value;

        const transactionDate = metadata.find(
          (item) => item.Name === "TransactionDate"
        )?.Value;

        console.log("MPESA RECEIPT:", receipt);
        console.log("MPESA AMOUNT:", amount);
        console.log("MPESA PHONE:", phone);
        console.log("TRANSACTION DATE:", transactionDate);

        const { error } = await supabase
          .from("Orders")
          .update({
            paymentStatus: "Paid",
            mpesaRef: receipt,
            mpesa_amount: amount,
            mpesa_phone: phone,
            payment_status_reason: null,
          })
          .eq("checkout_request_id", checkoutRequestId);

        if (error) {
          console.error("SUPABASE UPDATE ERROR:", error);
        } else {
          console.log("PAYMENT SUCCESS UPDATED");
        }
      } else {
        // Payment failed
        const { error } = await supabase
          .from("Orders")
          .update({
            paymentStatus: "Payment Failed",
            payment_status_reason: stkCallback.ResultDesc,
          })
          .eq("checkout_request_id", checkoutRequestId);

        if (error) {
          console.error("SUPABASE UPDATE ERROR:", error);
        } else {
          console.log("PAYMENT FAILURE UPDATED");
        }
      }
    } catch (error) {
      console.error("CALLBACK ERROR:", error);
    }

    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  });
}