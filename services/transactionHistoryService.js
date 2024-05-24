const Transaction = require("../models/Transaction");
const anchorService = require("../services/AncorService");
const UserProfile = require("../models/userProfile");
const TransactionModel = require("../models/Transaction");

exports.BillPayment_History = async (BillsTransaction_history_info) => {
  // console.log(countryToCurrency[userData.country]); // USD

  console.log({
    BillsTransaction_history_info_BillsTransaction_history:
      BillsTransaction_history_info,
    BillsTransaction_history_info_BillsTransaction_history2:
      BillsTransaction_history_info.data,
    BillsTransaction_history3: BillsTransaction_history_info.data.relationships,
  });

  let billPaymentId =
    BillsTransaction_history_info.data.relationships.billPayment.data.id;

  const Fetch_Bill_Payment_Response =
    await anchorService.Fetch_Bill_Payment_Service(billPaymentId);

  let DepositAccount_id =
    BillsTransaction_history_info.data.relationships.account.data.id;

  const USer_profiles = await UserProfile.findOne({
    "CostomerDepositAccount.data.id": DepositAccount_id,
  });

  let history_data = {
    from: USer_profiles.username,
    to: Fetch_Bill_Payment_Response.data.attributes.detail.provider,
    amount: BillsTransaction_history_info.data.attributes.amount,
    transactionId: BillsTransaction_history_info.data.id,
    Note: BillsTransaction_history_info.data.attributes.summary,
  };

  const userID = USer_profiles.userId;
  console.log({
    history_data: history_data,
    userID,
    USer_profiles: USer_profiles,
  });
  const transaction_created = await TransactionModel.create({
    userId: userID,
    transactionShort: history_data,
    transactionHistory: BillsTransaction_history_info,
    paymentType: Fetch_Bill_Payment_Response,
  });

  return {
    wqw: "history_data",
    transaction_created,
  };
};

exports.BOOK_TRANSFER_History = async (info) => {
  // console.log(countryToCurrency[userData.country]); // USD

  console.log({
    transfer_BillsTransaction_history: info,
    transfer_BillsTransaction_history2: info.data,
    transfer_BillsTransaction_history3: info.data.relationships,
  });

  let transferId = info.data.relationships.transfer.data.id;
  const Fetch_Transfer_Response = await anchorService.Fetch_Transfer_Service(
    transferId
  );

  console.log({
    dddd: Fetch_Transfer_Response,
  });

  if (Fetch_Transfer_Response.data.type === "NIP_TRANSFER") {
    console.log({
      NIP_TRANSFER1: Fetch_Transfer_Response.data.attributes,
      NIP_TRANSFER2: Fetch_Transfer_Response.data.relationships,
      NIP_TRANSFER3:
        Fetch_Transfer_Response.data.relationships.counterParty.data,
      NIP_TRANSFER4: Fetch_Transfer_Response.data.relationships.account.data,
      NIP_TRANSFER5: Fetch_Transfer_Response.data.relationships.customer.data,
    });

    let transferId =
      Fetch_Transfer_Response.data.relationships.counterParty.data.id;

    const Fetch_Counterparty_Response =
      await anchorService.Fetch_Counterparty_Service(transferId);

    let DepositAccount_id =
      Fetch_Transfer_Response.data.relationships.account.data.id;

    const USer_profiles = await UserProfile.findOne({
      "CostomerDepositAccount.data.id": DepositAccount_id,
    });

    let history_data = {
      from: USer_profiles.username,
      to: Fetch_Counterparty_Response.data.attributes.accountName,
      amount: Fetch_Transfer_Response.data.attributes.amount,
      transactionId: Fetch_Transfer_Response.data.id,
      Note: Fetch_Transfer_Response.data.attributes.reason,
    };

    const userID = USer_profiles.userId;
    console.log({
      history_data: history_data,
      USer_profiles: USer_profiles,
    });
    const transaction_created = await TransactionModel.create({
      userId: userID,
      transactionShort: history_data,
      transactionHistory: info,
      paymentType: { Fetch_Transfer_Response, Fetch_Counterparty_Response },
    });

    return transaction_created;
  } else {
    let DepositAccount_id = info.data.relationships.account.data.id;

    const USer_profiles = await UserProfile.findOne({
      "CostomerDepositAccount.data.id": DepositAccount_id,
    });

    let destinationAccount =
      Fetch_Transfer_Response.data.relationships.destinationAccount.data.id;

    const Detination_USer_profiles = await UserProfile.findOne({
      "CostomerDepositAccount.data.id": destinationAccount,
    });

    let history_data = {
      from: USer_profiles.username,
      to: Detination_USer_profiles.username,
      amount: info.data.attributes.amount,
      transactionId: info.data.id,
      Note: info.data.attributes.summary,
    };

    const userID = USer_profiles.userId;
    console.log({
      history_data: history_data,
      userID,
      USer_profiles: USer_profiles,
      Detination_USer_profiles,
    });
    const transaction_created = await TransactionModel.create({
      userId: userID,
      transactionShort: history_data,
      transactionHistory: info,
      paymentType: Fetch_Transfer_Response,
    });

    return {
      transaction_created,
    };
  }
};

exports.Recive_TRANSFER_History = async (info) => {
  // console.log(countryToCurrency[userData.country]); // USD

  console.log({
    Recive_TRANSFER_History: info,
    Recive_TRANSFER_History2: info.data,
    Recive_TRANSFER_History3: info.data.relationships,
    Recive_TRANSFER_History4: info.data.relationships.payment.data,
    Recive_TRANSFER_History5: info.data.relationships.account.data,
  });

  let transferId = info.data.relationships.payment.data.id;
  const Fetch_Transfer_Response = await anchorService.Fetch_Payment_Service(
    transferId
  );
  // pls add payment here

  console.log({
    dddd: Fetch_Transfer_Response,
  });

  let DepositAccount_id = info.data.relationships.account.data.id;

  const USer_profiles = await UserProfile.findOne({
    "CostomerDepositAccount.data.id": DepositAccount_id,
  });

  let history_data = {
    from: USer_profiles.username,
    // to: Detination_USer_profiles.username,
    amount: info.data.attributes.amount,
    transactionId: info.data.id,
    Note: info.data.attributes.summary,
  };

  const userID = USer_profiles.userId;
  console.log({
    history_data: history_data,
    userID,
    USer_profiles: USer_profiles,
  });
  const transaction_created = await TransactionModel.create({
    userId: userID,
    transactionShort: history_data,
    transactionHistory: info,
    paymentType: Fetch_Transfer_Response,
  });

  return transaction_created; //: "ffff", Fetch_Transfer_Response };
};
