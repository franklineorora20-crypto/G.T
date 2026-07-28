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
          error: "Invalid callback",
        });
      }

      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const resultCode = stkCallback.ResultCode;

      console.log("RESULT CODE:", resultCode);
      console.log("CHECKOUT ID:", checkoutRequestId);

     const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

      if (resultCode === 0) {

        console.log(
          "CALLBACK METADATA:",
          JSON.stringify(stkCallback.CallbackMetadata, null, 2)
        );

        const metadata = stkCallback.CallbackMetadata?.Item || [];

        const receipt =
          metadata.find(
            (item) => item.Name === "MpesaReceiptNumber"
          )?.Value ?? null;

        const amount =
          metadata.find(
            (item) => item.Name === "Amount"
          )?.Value ?? null;

        const phone =
          metadata.find(
            (item) => item.Name === "PhoneNumber"
          )?.Value ?? null;

        const transactionDate =
          metadata.find(
            (item) => item.Name === "TransactionDate"
          )?.Value ?? null;

        console.log("MPESA RECEIPT:", receipt);
        console.log("MPESA AMOUNT:", amount);
        console.log("MPESA PHONE:", phone);
        console.log("TRANSACTION DATE:", transactionDate);

        const updateData = {
          paymentStatus: "Paid",
          mpesaRef: receipt,
          mpesa_amount: amount,
          mpesa_phone: phone,
          payment_status_reason: null,
        };

        console.log("UPDATING ORDER:", updateData);
        console.log("MATCHING CHECKOUT ID:", checkoutRequestId);

        console.log(
  "CHECKING ORDER ID:",
  checkoutRequestId
);

const { data: checkOrder, error: checkError } = await supabase
  .from("Orders")
  .select("id, checkout_request_id, paymentStatus")
  .eq("checkout_request_id", checkoutRequestId);

console.log(
  "MATCHING ORDER:",
  checkOrder
);

console.log(
  "CHECK ERROR:",
  checkError
);
        const { data, error } = await supabase
          .from("Orders")
          .update(updateData)
          .eq("checkout_request_id", checkoutRequestId)
          .select();

        console.log("UPDATE RESULT:", data);
        console.log("UPDATE ERROR:", error);

        if (error) {
          console.error("SUPABASE UPDATE ERROR:", error);
        } else {
          console.log("PAYMENT SUCCESS UPDATED");
        }

      } else {

        const updateData = {
          paymentStatus: "Payment Failed",
          payment_status_reason: stkCallback.ResultDesc,
        };

        console.log("UPDATING FAILED ORDER:", updateData);
        console.log("MATCHING CHECKOUT ID:", checkoutRequestId);

        const { data, error } = await supabase
          .from("Orders")
          .update(updateData)
          .eq("checkout_request_id", checkoutRequestId)
          .select();

        console.log("UPDATE RESULT:", data);
        console.log("UPDATE ERROR:", error);

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