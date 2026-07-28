export default async function handler(req, res) {

  console.log("CALLBACK METHOD:", req.method);
  console.log("CALLBACK HEADERS:", req.headers);
  console.log("CALLBACK BODY:", req.body);

  res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Accepted"
  });

}