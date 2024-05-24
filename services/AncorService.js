const axios = require("axios");

const getanchor_API = process.env.getanchor_API;

const anchorKey =
  "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e";

exports.createCustomer = async (userDetails) => {
  try {
    const options = {
      method: "POST",
      url: "https://api.sandbox.getanchor.co/api/v1/customers",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-anchor-key": anchorKey,
      },
      data: {
        data: {
          attributes: {
            fullName: {
              firstName: userDetails.userId.firstName,
              lastName: userDetails.userId.lastName,
              // maidenName: "Samheart Ndukwwe",
              // middleName: "JOHN",
            },
            address: {
              country: userDetails.userId.country,
              state: userDetails.state,
              addressLine_1: userDetails.houseNumber,
              addressLine_2: userDetails.streetName,
              city: userDetails.city,
              postalCode: userDetails.postalCode,
            },
            email: userDetails.userId.email,
            phoneNumber: userDetails.phoneNumber,
          },
          type: "IndividualCustomer",
        },
      },
    };

    const response = await axios.request(options);

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });
    // let baderror = error?.response?.data?.errors;
    // throw baderror;

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.GetCustomer = async (userDetails) => {
  try {
    const options = {
      method: "GET",
      url: `https://api.sandbox.getanchor.co/api/v1/customers/${userDetails}?include=DepositAccount%2CIndividualCustomer%2CBusinessCustomer`,
      headers: {
        accept: "application/json",
        "x-anchor-key": anchorKey,
      },
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.GetCustomerDepositAccount = async (userDetails) => {
  try {
    const options = {
      method: "GET",
      url: `https://api.sandbox.getanchor.co/api/v1/accounts/${userDetails}?include=DepositAccount%2CIndividualCustomer%2CBusinessCustomer`,
      headers: {
        accept: "application/json",
        "x-anchor-key": anchorKey,
      },
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.GetCustomerDepositBalance = async (userDetails) => {
  try {
    const options = {
      method: "GET",
      url: `https://api.sandbox.getanchor.co/api/v1/accounts/balance/${userDetails}`,
      headers: {
        accept: "application/json",
        "x-anchor-key": anchorKey,
      },
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.GetCustomerDepositAccountNumber = async (userDetails) => {
  try {
    const options = {
      method: "GET",
      url: `https://api.sandbox.getanchor.co/api/v1/virtual-nubans/${userDetails}`,
      headers: {
        accept: "application/json",
        "x-anchor-key": anchorKey,
      },
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.VerifyCustomer = async (customerResponse, bvn, picture) => {
  const customerId = customerResponse.CustomerInfo.data.id;

  try {
    const verificationOptions = {
      method: "POST",
      //   url: `https://api.sandbox.getanchor.co/api/v1/customers/17132780770675-anc_ind_cst/verification/individual`,
      url: `${getanchor_API}customers/${customerId}/verification/individual`,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-anchor-key": anchorKey,
      },
      data: {
        data: {
          attributes: {
            level: "TIER_2",
            level2: {
              bvn: bvn,
              selfie: picture,
              dateOfBirth: "1996-04-30",
              gender: "Male",
            },
          },
          type: "Verification",
        },
      },
    };

    const response = await axios.request(verificationOptions);
    return response.data;
  } catch (error) {
    console.log({ kycerror: error.response.data.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;

      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.CreateDepositAccount = async (userDetails) => {
  try {
    const options = {
      method: "POST",
      url: "https://api.sandbox.getanchor.co/api/v1/accounts",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-anchor-key": anchorKey,
      },
      data: {
        data: {
          attributes: { productName: "SAVINGS" },
          relationships: {
            customer: {
              data: {
                id: userDetails,
                type: "IndividualCustomer",
              },
            },
          },
          type: "DepositAccount",
        },
      },
    };

    const response = await axios.request(options);

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.AccountToAccountTransfer = async (
  senderAccount,
  receiverAccount,
  amount
) => {
  try {
    const options = {
      method: "POST",
      url: "https://api.sandbox.getanchor.co/api/v1/transfers",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-anchor-key": anchorKey,
      },
      data: {
        data: {
          attributes: { currency: "USD", amount: amount },
          relationships: {
            destinationAccount: {
              data: { type: "DepositAccount", id: receiverAccount },
            },
            account: {
              data: { type: "DepositAccount", id: senderAccount },
            },
          },
          type: "BookTransfer",
        },
      },
    };

    const response = await axios.request(options);

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.VerifyAccountNumber = async (bankIdOrCode, accountNumber) => {
  try {
    const response = await axios.get(
      `https://api.sandbox.getanchor.co/api/v1/payments/verify-account/${bankIdOrCode}/${accountNumber}`,

      {
        headers: {
          accept: "application/json",
          "x-anchor-key": anchorKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.ListOfBank = async () => {
  try {
    const response = await axios.get(
      "https://api.sandbox.getanchor.co/api/v1/banks",
      {
        headers: {
          accept: "application/json",
          "x-anchor-key": anchorKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log({ yyycretaterror: error?.response.data.error });

    if (error?.response?.data?.error) {
      const errorDetail = error.response.data.error;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.CreateCounterparty = async (accountName, accountNumber, bankCode) => {
  try {
    const requestData = {
      data: {
        attributes: {
          accountName: accountName,
          bankCode: bankCode,
          accountNumber: accountNumber,
        },
        type: "CounterParty",
      },
    };

    // Request headers
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "x-anchor-key": anchorKey,
    };
    // Axios request
    const response = await axios.post(
      "https://api.sandbox.getanchor.co/api/v1/counterparties",
      requestData,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.TransferToBank = async (
  amount,
  reason,
  counterParty_id,
  DepositAccount_id
) => {
  try {
    // Request data
    const requestData = {
      data: {
        attributes: {
          currency: "NGN",
          amount: amount,
          reason: reason,
        },
        relationships: {
          destinationAccount: {
            data: {
              type: "SubAccount",
            },
          },
          account: {
            data: {
              type: "DepositAccount",
              id: DepositAccount_id,
            },
          },
          counterParty: {
            data: {
              id: counterParty_id,
              type: "CounterParty",
            },
          },
        },
        type: "NIPTransfer",
      },
    };

    // Request headers
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "x-anchor-key": anchorKey,
    };

    // Axios request
    const response = await axios.post(
      "https://api.sandbox.getanchor.co/api/v1/transfers",
      requestData,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.VerifyTransferToBank = async (transferId) => {
  try {
    // Request data

    const headers = {
      accept: "application/json",
      "x-anchor-key": anchorKey,
    };

    // Axios request
    const response = await axios.get(
      `https://api.sandbox.getanchor.co/api/v1/transfers/${transferId}?include=DepositAccount%2CIndividualCustomer%2CBusinessCustomer`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.ListBillersService = async () => {
  try {
    const response = await axios.get(`${getanchor_API}bills/billers`, {
      headers: {
        accept: "application/json",
        "x-anchor-key":
          "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
      },
    });
    console.log({
      qqq: getanchor_API,
    });

    return response.data;
  } catch (error) {
    console.log({ yyycretaterror: error?.response.data.error });

    if (error?.response?.data?.error) {
      const errorDetail = error.response.data.error;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.ListBillerProductsService = async (billerId) => {
  try {
    const response = await axios.get(
      `https://api.sandbox.getanchor.co/api/v1/bills/billers/${billerId}/products`,
      {
        headers: {
          accept: "application/json",
          "x-anchor-key":
            "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log({ yyycretaterror: error?.response.data.error });

    if (error?.response?.data?.error) {
      const errorDetail = error.response.data.error;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.Biller_Verify_Customer_Details_Service = async (
  productSlug,
  customerId
) => {
  try {
    const response = await axios.get(
      `https://api.sandbox.getanchor.co/api/v1/bills/customer-validation/${productSlug}/${customerId}`,
      {
        headers: {
          accept: "application/json",
          "x-anchor-key":
            "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log({ yyycretaterror: error?.response.data.error });

    if (error?.response?.data?.error) {
      const errorDetail = error.response.data.error;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.Create_Bill_Payment_Cable_Tv_Subscription_Service = async (
  smartCardNumber,
  amount,
  phoneNumber,
  reference,
  productSlug,
  DepositAccountId
) => {
  try {
    const requestData = {
      data: {
        attributes: {
          smartCardNumber: smartCardNumber,
          amount: amount,
          phoneNumber: phoneNumber,
          reference: reference,
          productSlug: productSlug,
        },
        relationships: {
          account: {
            data: {
              type: "DepositAccount",
              id: DepositAccountId,
            },
          },
        },
        type: "Television",
      },
    };

    // Request headers
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "x-anchor-key":
        "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
    };
    // Axios request
    const response = await axios.post(
      "https://api.sandbox.getanchor.co/api/v1/bills",
      requestData,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error });
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.Create_Bill_Payment_Purchase_airtime_Service = async (
  airtime_provider_slug,
  amount,
  phoneNumber,
  reference,
  DepositAccountId
) => {
  try {
    const requestData = {
      data: {
        attributes: {
          provider: airtime_provider_slug,
          amount: amount,
          phoneNumber: phoneNumber,
          reference: reference,
        },
        relationships: {
          account: {
            data: {
              type: "DepositAccount",
              id: DepositAccountId,
            },
          },
        },
        type: "Airtime",
      },
    };

    // Request headers
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "x-anchor-key":
        "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
    };
    // Axios request
    const response = await axios.post(
      "https://api.sandbox.getanchor.co/api/v1/bills",
      requestData,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error });
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.Create_Bill_Payment_Purchase_data_bundle_Service = async (
  productSlug,
  amount,
  phoneNumber,
  reference,
  DepositAccountId
) => {
  try {
    const requestData = {
      data: {
        attributes: {
          productSlug: productSlug,
          amount: amount,
          phoneNumber: phoneNumber,
          reference: reference,
        },
        relationships: {
          account: {
            data: {
              type: "DepositAccount",
              id: DepositAccountId,
            },
          },
        },
        type: "Data",
      },
    };

    // Request headers
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "x-anchor-key":
        "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
    };
    // Axios request
    const response = await axios.post(
      "https://api.sandbox.getanchor.co/api/v1/bills",
      requestData,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error });
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.Create_Bill_Payment_purchase_Electricity_Service = async (
  meterAccountNumber,
  amount,
  phoneNumber,
  reference,
  productSlug,
  DepositAccountId
) => {
  try {
    const requestData = {
      data: {
        attributes: {
          meterAccountNumber: meterAccountNumber,
          productSlug: productSlug,
          amount: amount,
          phoneNumber: phoneNumber,
          reference: reference,
        },
        relationships: {
          account: {
            data: {
              type: "DepositAccount",
              id: DepositAccountId,
            },
          },
        },
        type: "Electricity",
      },
    };

    // Request headers
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "x-anchor-key":
        "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
    };
    // Axios request
    const response = await axios.post(
      "https://api.sandbox.getanchor.co/api/v1/bills",
      requestData,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log({ cretaterror: error });
    console.log({ cretaterror: error?.response?.data?.errors });

    if (error?.response?.data?.errors) {
      const errorDetail = error.response.data.errors[0].detail;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.Fetch_Bill_Payment_Service = async (transaction_id) => {
  try {
    const response = await axios.get(
      `https://api.sandbox.getanchor.co/api/v1/bills/${transaction_id}`,
      // `https://api.sandbox.getanchor.co/api/v1/transactions/1714104715701227-anc_txn`,
      {
        headers: {
          accept: "application/json",
          "x-anchor-key":
            "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log({ yyycretaterror: error?.response.data.error });

    if (error?.response?.data?.error) {
      const errorDetail = error.response.data.error;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.Fetch_Transaction_Service = async (transaction_id) => {
  try {
    const response = await axios.get(
      `https://api.sandbox.getanchor.co/api/v1/transactions/${transaction_id}`,
      // `https://api.sandbox.getanchor.co/api/v1/transactions/1714104715701227-anc_txn`,
      {
        headers: {
          accept: "application/json",
          "x-anchor-key":
            "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
        },
      }
    );

    console.log({
      qqww: response.data,
    });
    return response.data;
  } catch (error) {
    console.log({ yyycretaterror: error?.response.data.error });

    if (error?.response?.data?.error) {
      const errorDetail = error.response.data.error;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.Fetch_Transfer_Service = async (transaction_id) => {
  try {
    const response = await axios.get(
      `https://api.sandbox.getanchor.co/api/v1/transfers/${transaction_id}`,
      {
        headers: {
          accept: "application/json",
          "x-anchor-key":
            "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
        },
      }
    );

    console.log({
      qqww: response.data,
    });
    return response.data;
  } catch (error) {
    console.log({ yyycretaterror: error?.response.data.error });

    if (error?.response?.data?.error) {
      const errorDetail = error.response.data.error;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.Fetch_Counterparty_Service = async (transaction_id) => {
  try {
    const response = await axios.get(
      `https://api.sandbox.getanchor.co/api/v1/counterparties/${transaction_id}`,
      {
        headers: {
          accept: "application/json",
          "x-anchor-key":
            "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
        },
      }
    );

    console.log({
      qqww: response.data,
    });
    return response.data;
  } catch (error) {
    console.log({ yyycretaterror: error?.response.data.error });

    if (error?.response?.data?.error) {
      const errorDetail = error.response.data.error;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

exports.Fetch_Payment_Service = async (transaction_id) => {
  try {
    const response = await axios.get(
      `https://api.sandbox.getanchor.co/api/v1/payments/${transaction_id}`,
      {
        headers: {
          accept: "application/json",
          "x-anchor-key":
            "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
        },
      }
    );

    console.log({
      qqww: response.data,
    });
    return response.data;
  } catch (error) {
    console.log({ yyycretaterror: error?.response.data.error });

    if (error?.response?.data?.error) {
      const errorDetail = error.response.data.error;
      throw new Error(errorDetail);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};
