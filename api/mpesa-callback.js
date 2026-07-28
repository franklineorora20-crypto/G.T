export default async function handler(req, res) {

  console.log("MPESA CALLBACK FUNCTION HIT");

  console.log(
    "MPESA CALLBACK DATA:",
    JSON.stringify(req.body, null, 2)
  );

  return res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Accepted"
  });

}