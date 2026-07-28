export default async function handler(req, res) {

  console.log("MPESA CALLBACK:", JSON.stringify(req.body));

  res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Accepted"
  });

}