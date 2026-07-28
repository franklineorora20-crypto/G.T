import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {

  console.log("MPESA CALLBACK FUNCTION HIT");

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });


  req.on("end", async () => {

    console.log(
      "RAW CALLBACK BODY:",
      body
    );


    try {

      const callbackData = JSON.parse(body);

      console.log(
        "MPESA CALLBACK DATA:",
        JSON.stringify(callbackData, null, 2)
      );


      const stkCallback =
        callbackData.Body.stkCallback;


      const checkoutRequestId =
        stkCallback.CheckoutRequestID;


      const resultCode =
        stkCallback.ResultCode;


      console.log(
        "RESULT CODE:",
        resultCode
      );


      console.log(
        "CHECKOUT ID:",
        checkoutRequestId
      );


      // Connect to Supabase
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );


      if (resultCode === 0) {

        // Payment successful

        const { error } = await supabase
          .from("Orders")
          .update({
            paymentStatus: "Paid"
          })
          .eq(
            "checkout_request_id",
            checkoutRequestId
          );


        if(error){
          console.error(
            "SUPABASE UPDATE ERROR:",
            error
          );
        }


        console.log(
          "PAYMENT SUCCESS UPDATED"
        );


      } else {

        // Payment failed

        const { error } = await supabase
          .from("Orders")
          .update({
            paymentStatus: "Payment Failed",
            payment_status_reason:
              stkCallback.ResultDesc
          })
          .eq(
            "checkout_request_id",
            checkoutRequestId
          );


        if(error){
          console.error(
            "SUPABASE UPDATE ERROR:",
            error
          );
        }


        console.log(
          "PAYMENT FAILURE UPDATED"
        );

      }


    } catch(error){

      console.error(
        "CALLBACK ERROR:",
        error
      );

    }


    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    });

  });

}