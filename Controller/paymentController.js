const https = require("https");
require("dotenv").config();
const paymentVerification = require("../Models/paymentVerification");
const paystackKey = process.env.PAYSTACK_SECRET_KEY;

const payment = async (req, res) => {
  const {
    email,
    amount,
    firstname,
    lastname,
    phone,
    country,
    state,
    city,
    zip_code,
    address,
    name,
    image,
    price,
    description,
    brand,
    quantity,
    subTotal,
  } = req.body;
  try {
    const params = JSON.stringify({
      email: `${email}`,
      amount: `${amount * 100}`,
      metadata: {
        first_name: firstname,
        last_name: lastname,
        phone: phone,
        country: country,
        state: state,
        city: city,
        zip_code: zip_code,
        address: address,
        product_name: name,
        image: image,
        price: price,
        description: description,
        brand: brand,
        quantity: quantity,
        subTotal: subTotal,
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

      respaystack.on("end", () => {
        const response = JSON.parse(data);
        if (response.message && response.status === true) {
          const amountPaid = response.data.amount / 100;

          const productDetails = [];
          productDetails.push({
            product: [
              {
                product_name: response.data.metadata.name,
                image: response.data.metadata.image,
                price: response.data.metadata.price,
                description: response.data.metadata.description,
                brand: response.data.metadata.brand,
                quantity: response.data.metadata.quantity,
              },
            ],
            subTotal: response.data.metadata.subTotal,
          });

          const newVerification = new paymentVerification({
            firstname: response.data.metadata.first_name,
            lastname: response.data.metadata.last_name,
            phone: response.data.metadata.phone,
            country: response.data.metadata.country,
            state: response.data.metadata.state,
            city: response.data.metadata.city,
            zip_code: response.data.metadata.zip_code,
            address: response.data.metadata.address,
            order: productDetails,
            amount: amountPaid,
            email: response.data.customer.email,
            customer_code: response.data.customer.customer_code,
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

module.exports = {
  payment,
  verifyPayment,
};
