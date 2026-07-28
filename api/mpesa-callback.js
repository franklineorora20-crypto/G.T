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


      console.log(
        "RESULT CODE:",
        stkCallback.ResultCode
      );


      console.log(
        "CHECKOUT ID:",
        stkCallback.CheckoutRequestID
      );


    } catch(error){

      console.error(
        "CALLBACK PARSE ERROR:",
        error
      );

    }


    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    });

  });

}