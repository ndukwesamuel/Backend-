const smileIdentityCore = require("smile-identity-core");
const { v4: UUID } = require("uuid");
const kyc = require("../models/kyc");

const WebApi = smileIdentityCore.WebApi;
const IDApi = smileIdentityCore.IDApi;
const Signature = smileIdentityCore.Signature;
const Utilities = smileIdentityCore.Utilities;

const partnerId = "6804";
const defaultCallback = "/api/kyc/callback";
const apiKey = "9a2ed0f7-33f2-475a-9336-c148aa8c6e4f";
const sidServer = "0"; // Use '0' for the sandbox server, '1' for production server
// const smileApi = new WebApi(partnerId, defaultCallback, apiKey, sidServer);
const connection = new WebApi(partnerId, defaultCallback, apiKey, sidServer);

exports.BiometricKYC = async (user_data, data) => {
  try {
    let partner_params = {
      user_id: user_data.userId._id,
      job_id: `job-${UUID()}-${user_data.userId._id}`,
      job_type: 1,
    };

    let image_details = data.data.images;

    let id_info = {
      first_name: user_data.userId.firstName,
      last_name: user_data.userId.lastName,
      country: data.country,
      id_type: "NIN_V2",
      id_number: data.NIN_V2,
      dob: "1996-04-30",
      entered: "true",
    };

    let options = {
      return_job_status: true,
      return_history: true,
      return_image_links: true,
      signature: true,
    };

    // const existingKyc = await kyc.findOne({ userId: user_data.userId._id });
    // if (!existingKyc) {
    //   throw new Error("KYC information not found for this user");
    // }

    // existingKyc.country = data.country;
    // existingKyc.nin = data.NIN_V2;
    // existingKyc.bvn = data.BVN;

    // await existingKyc.save();

    const response = await connection.submit_job(
      partner_params,
      image_details,
      id_info,
      options
    );
    return {
      response,
    };
  } catch (error) {
    console.log({
      error: error,
    });
    throw error;
  }
};
