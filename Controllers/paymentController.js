require("dotenv").config();
const https = require("https");
const paymentVerification = require("../Models/paymentVerification");

const paystackKey = process.env.PAYSTACK_SECRET_KEY;

const payment = async (req, res) => {
  const { email, amount, firstname, lastname, phone } = req.body;
  try {
    const params = JSON.stringify({
      email: `${email}`,
      amount: `${amount * 100}`,
      first_name: firstname,
      last_name: lastname,
      phone: phone,
      metadata: {
        first_name: firstname,
        last_name: lastname,
        phone: phone,
      },

      callback_url: "https://webuy-opal.vercel.app/verify",
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
    };
    // client request to paystack API
    const reqpaystack = https
      .request(options, (reqpaystack) => {
        let data = "";

        reqpaystack.on("data", (chunk) => {
          data += chunk;
        });

        reqpaystack.on("end", () => {
          res.status(200).json(data);
        });
      })
      .on("error", (error) => {
        res.send(error);
      });

    reqpaystack.write(params);
    reqpaystack.end();
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const verifyPayment = async (req, res) => {
  const { reference } = req.body;
  const https = require("https");

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${paystackKey}`,
    },
  };

  const reqpaystack = https
    .request(options, (respaystack) => {
      let data = "";

      respaystack.on("data", (chunk) => {
        data += chunk;
      });

      respaystack.on("end", () => {
        const response = JSON.parse(data);
        if (response.message && response.status === true) {
          const amountPaid = response.data.amount / 100;

          const newVerification = new paymentVerification({
            firstname: response.data.metadata.first_name,
            lastname: response.data.metadata.last_name,
            amount: amountPaid,
            userId: req.user.id,
            email: response.data.customer.email,
            customer_code: response.data.customer.customer_code,
            phone: response.data.metadata.phone,
            customer_id: response.data.customer.id,
            verification_id: response.data.id,
            reference: response.data.reference,
            created_at: response.data.created_at,
          });
          newVerification.save();
        }
        res.status(200).json(response);
      });
    })
    .on("error", (error) => {
      res.send(JSON.parse(error));
    });
  reqpaystack.end();
};

const createCustomerAccount = async (req, res) => {
  const { email, firstname, lastname, phone } = req.body;
  var https = require("follow-redirects").https;
  var fs = require("fs");

  var options = {
    method: "POST",
    hostname: "api.paystack.co",
    path: "/dedicated_account/assign",
    headers: {
      Authorization: `Bearer ${paystackKey}`,
      "Content-Type": "application/json",
    },
    maxRedirects: 20,
  };

  var reqpaystack = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });

    res.on("error", function (error) {
      console.error(error);
    });
  });

  var postData = JSON.stringify({
    email: email,
    first_name: firstname,
    last_name: lastname,
    phone: phone,
    preferred_bank: "test-bank",
    country: "NG",
  });

  reqpaystack.write(postData);

  reqpaystack.end();
};

module.exports = {
  payment,
  verifyPayment,
  createCustomerAccount,
};
