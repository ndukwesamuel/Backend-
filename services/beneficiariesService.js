const UserProfile = require("../models/userProfile");
const wallet = require("../models/wallet");
const anchorService = require("../services/AncorService");
const Beneficiaries = require("../models/beneficiaries");
const customError = require("../utils/customError");
const {log} = require("console");

exports.CreateZynopatToZnopaybeneficiariesService = async (
    user_data,
    username
) => {
    // Updating userProfile model
    const userProfile = await UserProfile.findOne({
        username: username,
    });

    const walletInfo = await wallet.findOne({userId: userProfile.userId});
    if (!walletInfo) {
        throw new Error("KYC information not found for this user");
    }

    let data___ = {
        userId: user_data.userId._id,
        accountNumber: walletInfo.VirtualNuban.data.attributes.accountNumber,
        bank: walletInfo.VirtualNuban.data.attributes.bank.name,
        accountName: walletInfo.VirtualNuban.data.attributes.accountName,
        bankCode: walletInfo.VirtualNuban.data.attributes.bank.nipCode,
        username: username,
        accountType: "zynopay",
    };

    const existingBeneficiary = await Beneficiaries.findOne({
        userId: data___.userId,
        accountNumber: data___.accountNumber,
        bank: data___.bank,
        accountName: data___.accountName,
        bankCode: data___.bankCode,
        username: data___.username,
    });

    if (existingBeneficiary) {
        return customError(401, "Beneficiary already exists for this user");
    }

    const beneficiary = new Beneficiaries({
        userId: data___.userId,
        accountNumber: data___.accountNumber,
        bank: data___.bank,
        accountName: data___.accountName,
        bankCode: data___.bankCode,
        username: data___.username,
        accountType: data___.accountType,
    });

    await beneficiary.save();
    return `${beneficiary.accountName} has been added as a beneficiary `;
};

exports.CreateZynopatToBankbeneficiariesService = async (userdata, others) => {
    // Updating userProfile model

    const existingBeneficiary = await Beneficiaries.findOne({
        userId: userdata.userId._id,
        accountNumber: others.accountNumber,
        bank: others.bank,
        accountName: others.accountName,
    });

    if (existingBeneficiary) {
        return customError(401, "Beneficiary already exists for this user");
    }

    const beneficiary = new Beneficiaries({
        userId: userdata.userId._id,
        accountName: others.accountName,
        accountNumber: others.accountNumber,
        bank: others.bank,
        bankCode: others.bankCode,
        accountType: "bank",
    });

    await beneficiary.save();

    return `${beneficiary.accountName} has been added as a beneficiary `;
};
