const paymentVerification = require("../Models/paymentVerification");

const order = async (req, res) => {
  const isPaymentVerified = await paymentVerification.find();

  console.log(isPaymentVerified.order);
  // res.status(200).json(isPaymentVerified);
};

module.exports = {
  order,
};
