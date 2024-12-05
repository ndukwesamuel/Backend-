const express = require("express");
const axios = require("axios");
const router = express.Router();

// Environment Variables (These should be set in your .env file)
const { REMITA_BASE_URL, REMITA_MERCHANT_ID, REMITA_API_KEY, REMITA_SECRET } =
  process.env;

// Helper function to generate a SHA-512 hash for security
const generateHash = (params) => {
  const crypto = require("crypto");
  return crypto.createHash("sha512").update(params).digest("hex");
};

// Route to authenticate and generate a token from Remita
// You need this token to make further API requests
router.post("/remita/auth", async (req, res) => {
  try {
    const authResponse = await axios.post(`${REMITA_BASE_URL}/uaa/token`, {
      username: REMITA_MERCHANT_ID, // Use merchant ID
      password: REMITA_API_KEY, // Use API key provided by Remita
    });

    // Extract and send the access token for use in subsequent requests
    const accessToken = authResponse.data.accessToken;
    res.status(200).json({ token: accessToken });
  } catch (error) {
    res.status(500).json({ error: "Authentication failed", details: error });
  }
});

// Route to create a Direct Debit Mandate
// This is where you set up the recurring debit instructions for the customer
router.post("/remita/mandate", async (req, res) => {
  const {
    customerId,
    accountNumber,
    bankCode,
    amount,
    startDate,
    endDate,
    frequency,
  } = req.body;

  try {
    const orderId = Date.now().toString(); // Generate a unique order ID
    const hash = generateHash(
      `${REMITA_MERCHANT_ID}${orderId}${amount}${REMITA_API_KEY}`
    );

    // Make a POST request to Remita to create a mandate
    const mandateResponse = await axios.post(
      `${REMITA_BASE_URL}/directdebit/initiate`,
      {
        merchantId: REMITA_MERCHANT_ID, // Merchant ID for identification
        orderId, // Unique order ID for the transaction
        serviceTypeId: "DIRECT_DEBIT", // Service Type ID for direct debit
        amount, // Amount to be debited
        startDate, // Start date of the recurring debit
        endDate, // End date of the recurring debit
        frequency, // How often the debit occurs (monthly, weekly, etc.)
        payerAccount: {
          bankCode, // Bank code of the customer's account
          accountNumber, // Account number to debit
        },
      },
      {
        headers: {
          Authorization: `Bearer ${req.headers.token}`, // Include the auth token
          "Content-Type": "application/json",
        },
      }
    );

    // Respond with the mandate details
    res.status(200).json(mandateResponse.data);
  } catch (error) {
    res.status(500).json({ error: "Mandate creation failed", details: error });
  }
});

// Route to activate a mandate after customer approval
// The customer will typically receive an OTP to authorize the mandate
router.post("/remita/mandate/activate", async (req, res) => {
  const { mandateId, otp } = req.body;

  try {
    const activateResponse = await axios.post(
      `${REMITA_BASE_URL}/directdebit/activate`,
      {
        merchantId: REMITA_MERCHANT_ID, // Merchant ID
        mandateId, // Mandate ID to be activated
        otp, // OTP for authentication
      },
      {
        headers: {
          Authorization: `Bearer ${req.headers.token}`, // Auth token required
          "Content-Type": "application/json",
        },
      }
    );

    // Respond with activation confirmation
    res.status(200).json(activateResponse.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Mandate activation failed", details: error });
  }
});

// Route to debit the customer's account based on the mandate
// This will initiate the actual debit process based on the mandate
router.post("/remita/directdebit/debit", async (req, res) => {
  const { mandateId, amount, customerId } = req.body;

  try {
    // Make a POST request to debit the customer's account
    const debitResponse = await axios.post(
      `${REMITA_BASE_URL}/directdebit/debit`,
      {
        merchantId: REMITA_MERCHANT_ID, // Merchant ID
        mandateId, // The mandate that authorizes the debit
        amount, // Amount to debit
        customerId, // Customer's ID
      },
      {
        headers: {
          Authorization: `Bearer ${req.headers.token}`, // Auth token required
          "Content-Type": "application/json",
        },
      }
    );

    // Respond with the result of the debit transaction
    res.status(200).json(debitResponse.data);
  } catch (error) {
    res.status(500).json({ error: "Direct debit failed", details: error });
  }
});

module.exports = router;
