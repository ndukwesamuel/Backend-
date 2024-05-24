const anchorService = require("../services/AncorService");
const transactionHistoryService = require("../services/transactionHistoryService");
const TransactionModel = require("../models/Transaction");
const UserProfile = require("../models/userProfile");
const { isFailedEvent } = require("../utils/WebhookEvent");

const BillsTransaction_history = async (info) => {
  try {
    // Updating userProfile model

    console.log({
      BillsTransaction_history: info,
      BillsTransaction_history2: info.data,
      BillsTransaction_history3: info.data.relationships,
    });

    if (info?.data?.relationships?.billPayment) {
      const BillPayment_History_response =
        await transactionHistoryService.BillPayment_History(info);
      return BillPayment_History_response;
    } else if (info?.data?.relationships?.transfer) {
      const BOOK_TRANSFER_History_response =
        await transactionHistoryService.BOOK_TRANSFER_History(info);
      return BOOK_TRANSFER_History_response;
    } else if (info?.data?.relationships?.payment) {
      const Recive_TRANSFER_History_response =
        await transactionHistoryService.Recive_TRANSFER_History(info);
      return Recive_TRANSFER_History_response;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const processTransactionCreated = async (userdata) => {
  try {
    // Updating userProfile model

    console.log({
      processTransactionCreated_data2: userdata?.type,
      processTransactionCreated_data3: userdata?.attributes,
      processTransactionCreated_date4: userdata?.relationships,
      processTransactionCreated_date5: userdata?.relationships?.account?.data,
      processTransactionCreated_date6:
        userdata?.relationships?.transaction?.data,

      processTransactionCreated_date7:
        userdata?.relationships?.transaction?.data?.id,
      processTransactionCreated_date8:
        userdata?.relationships?.account?.data?.id,
    });

    const Fetch_Transaction_Responds =
      await anchorService.Fetch_Transaction_Service(
        userdata?.relationships?.transaction?.data?.id
      );

    if (
      Fetch_Transaction_Responds.data.type === "BillsTransaction" ||
      Fetch_Transaction_Responds.data.type === "BookTransaction" ||
      Fetch_Transaction_Responds.data.type === "NIPTransaction"
    ) {
      const BillsTransaction_history_data = await BillsTransaction_history(
        Fetch_Transaction_Responds
      );
      console.log({
        yyycretaterror: BillsTransaction_history_data,
      });

      return BillsTransaction_history_data;
    } else {
      console.log({
        processTransactionCreated_didNotWork: userdata,
        processTransactionCreated_didNotWork2: "didnotworkto",
      });
    }
  } catch (error) {
    // throw error;
    console.log({ processTransactionCreated_error: error });
    throw new Error(error);
  }
};

exports.GetWebHookdata = async (userdata) => {
  try {
    // Updating userProfile model
    console.log({
      GetWebHookdata_data1: userdata,
      GetWebHookdata_data3: userdata?.attributes,
      GetWebHookdata_date2: userdata?.relationships,
    });
    if (userdata?.type === "transaction.created") {
      const processedTransaction = await processTransactionCreated(userdata);

      console.log({ processedTransaction });
      return processedTransaction;
    } else if (isFailedEvent(userdata?.type)) {
      console.log("Failed event detected:", userdata?.type);
      console.log({
        isFailedEvent1: userdata?.relationships.resource.data,
        isFailedEvent2: userdata?.attributes,
      });
    } else {
      console.log({
        GetWebHookdata_FirstdidNotWork: userdata,
        GetWebHookdata_FirstdidNotWork2: "Firstdidnotworkto",
      });
    }
  } catch (error) {
    console.log({
      GetWebHookdata_error: error,
    });
    throw error;
  }
};
