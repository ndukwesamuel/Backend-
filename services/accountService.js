const UserProfile = require("../models/userProfile");
const wallet = require("../models/wallet");
const anchorService = require("../services/AncorService");

exports.UserWallet = async (userdata) => {
    // Updating userProfile model

    const walletInfo = await wallet.findOne({userId: userdata.userId._id});
    if (!walletInfo) {
        throw new Error("KYC information not found for this user");
    }

    // const customerId = userdata.CustomerInfo.data.id;
    const AcountdepositcustomerId = userdata.CostomerDepositAccount.data.id;
    let userData_info;
    const userProfile_info = await UserProfile.findOne({
        userId: userdata.userId._id,
    });

    const depositAccount = await anchorService.GetCustomerDepositAccount(
        AcountdepositcustomerId
    );

    userProfile_info.CostomerDepositAccount = depositAccount;

    await userProfile_info.save();

    userData_info = userProfile_info;

    const virtualNubans = await anchorService.GetCustomerDepositAccountNumber(
        userData_info.CostomerDepositAccount.data.relationships.virtualNubans
            .data[0].id
    );

    walletInfo.VirtualNuban = virtualNubans;

    await walletInfo.save();

    return {
        costomerInfo: userData_info.CustomerInfo,
        DepositAccountInfo: userData_info.CostomerDepositAccount,
        walletInfo,
    };

};

exports.AccountToAccountTransfer = async (userDetails) => {
    try {
        const options = {
            method: "POST",
            url: "https://api.sandbox.getanchor.co/api/v1/transfers",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "x-anchor-key":
                    "YaIjw.b37b8e82eef17f0258b8274a14b0c67dad9e08231221c2f13c2d1c484eb359144c3c0fa306d36bd49cfb8ed5f6dbb104f23e",
            },
            data: {
                data: {
                    attributes: {currency: "USD", amount: 40000},
                    relationships: {
                        destinationAccount: {
                            data: {type: "DepositAccount", id: "17133325035140-anc_acc"},
                        },
                        account: {
                            data: {type: "DepositAccount", id: "17135030866760-anc_acc"},
                        },
                    },
                    type: "BookTransfer",
                },
            },
        };

        const response = await axios.request(options);
        console.log({
            response: response.data,
        });

        // return response.data;
        return {name: "ddd"};
    } catch (error) {
        console.log({
            qqw: error,
        });
        console.log({cretaterror: error?.response?.data?.errors});

        if (error?.response?.data?.errors) {
            const errorDetail = error.response.data.errors[0].detail;
            throw new Error(errorDetail);
        } else {
            throw new Error("An unknown error occurred.");
        }
    }
};
