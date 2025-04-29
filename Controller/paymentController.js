const https = require("https");
require("dotenv").config();
const paymentVerification = require("../Models/paymentVerification");
const paystackKey = process.env.PAYSTACK_SECRET_KEY;
const Order = require("../Models/Order");
const User = require("../Models/Users");
const axios = require("axios");
const crypto = require("crypto");
const initializePaystackPayment = async (req, res) => {
  const { userId } = req.user;
  const { amount } = req.body;
  if (!amount) {
    res.status(422).json({ message: "Amount is required" });
    return;
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User details not found");
    }
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: amount * 100,
        callback_url: `${process.env.FRONTEND_URL}/verify`,
        metadata: { userId: userId.toString() },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json({
      success: true,
      message: "Payment initialized successfully",
      data: {
        authorizationUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
      },
    });
  } catch (error) {
    throw error;
  }
};

const payment = async (req, res) => {
  const { email, amount, firstname, lastname, phone } = req.body;
  try {
    const params = JSON.stringify({
      email: `${email}`,
      amount: `${amount * 100}`,
      metadata: {
        first_name: firstname,
        last_name: lastname,
        phone: phone,
      },

      callback_url: "https://webuyam.com/verify",
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

      respaystack.on("end", async () => {
        const response = JSON.parse(data);
        const userId = response.data.metadata.userId;
        const reference = response.data.reference;

        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User details not found");
        }
        const isVerified = await paymentVerification.findOne({
          userId,
          reference,
        });
        if (isVerified) {
          return res
            .status(200)
            .json({ message: "Payment is already verified." });
        }
        if (response.message && response.status === true) {
          const amountPaid = response.data.amount / 100;

          const newVerification = new paymentVerification({
            userId,
            amount: amountPaid,
            customer_code: response.data.customer.customer_code,
            customer_id: response.data.customer.id,
            verification_id: response.data.id,
            reference: response.data.reference,
            created_at: response.data.created_at,
          });
          newVerification.save();
        }

        // Update the wallet

        user.wallet += amountPaid;
        await user.save();

        res.status(200).json(response);
      });
    })
    .on("error", (error) => {
      res.send(JSON.parse(error));
    });
  reqpaystack.end();
};

const paystackWebhook = async (req, res) => {
  try {
    const event = req.body;
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json({ message: "Invalid signature" });
    }
    if (event.event === "charge.success") {
      const { metadata, status, gateway_response } = event.data;
      if (status === "success") {
        const userId = metadata.userId;
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User details not found");
        }
        const amountPaid = event.data.amount / 100;

        const newVerification = new paymentVerification({
          userId,
          amount: amountPaid,
          customer_code: event.data.customer.customer_code,
          customer_id: event.data.customer.id,
          verification_id: event.data.id,
          reference: event.data.reference,
          created_at: event.data.created_at,
        });
        newVerification.save();
        // Update the wallet

        user.wallet += amountPaid;
        await user.save();
      }
    }

    res.status(200).json({
      message: "Payment verification successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  payment,
  verifyPayment,
  initializePaystackPayment,
  paystackWebhook,
};
