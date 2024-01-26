const path = require("path");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const Sib = require("sib-api-v3-sdk");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const UserModel = require("../models/user");
const ForgotPassModel = require("../models/forgot-pass");

const sequelize = require("../utils/database");
const { CLIENT_RENEG_LIMIT } = require("tls");

/*************************************************************/
//  Render Forgot Password Page
/*************************************************************/
exports.getForgotPasswordPage = (request, response, next) => {
  response.sendFile("forgot.html", { root: "client/public/views" });
};

/***********************************************************/
// Sending Email for Forgot Password
/***********************************************************/
exports.postForgotPasswordEmail = async (req, res) => {
  try {
    const receiverEmail = req.body.email;
    const baseUrl = req.body.baseUrl;
    console.log("receiverEmail==>", baseUrl);

    const user = await UserModel.find({ email: receiverEmail });

    // If user not found.
    if (user.length === 0) {
      console.log("user not found");
      return res
        .status(400)
        .json({ success: false, message: "email does not Exists!" });
    }

    const uniqeId = uuidv4();
    console.log("uniqeId==>", uniqeId);

    // Create an expense associated with the user
    await ForgotPassModel.create({
      requestId: uniqeId,
      isActive: true,
      userId: user[0]._id,
    });

    // setting up sendinblue
    // Initialize the default client
    const defaultClient = await Sib.ApiClient.instance;
    var apiKey = await defaultClient.authentications["api-key"];

    // Create a new instance of the TransactionalEmailsApi
    const transEmailApi = await new Sib.TransactionalEmailsApi();
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
    // console.log("website==>", process.env.WEBSITE);
    const path = `${baseUrl}/password/verifyLink/${uniqeId}`;

    const sender = {
      email: "alidj007@gmail.com",
      name: "Ali",
    };

    const receivers = [
      {
        email: receiverEmail,
      },
    ];

    const sendEmail = await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Forgot Password",
      htmlContent: `<a href="${path}">Click Here</a> to reset your password!`,
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error sending email" });
  }
};

/*********************************************************/
//Verify Link & send HTML file to update password
/*********************************************************/
exports.postVerifyLink = async (req, res, next) => {
  try {
    res.sendFile("update-password.html", { root: "client/public/views" });
  } catch (error) {
    console.error(error);
  }
};

/*********************************************************/
//update Password
/*********************************************************/
exports.PostCreateNewPassword = async (req, res, next) => {
  const { pass, confirmPass, linkId } = req.body;
  const idd = linkId;
  console.log("inside update pass");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Matching both passwords
    if (pass !== confirmPass) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Mismatched Passwords!" });
    }

    const forgotPassDoc = await ForgotPassModel.findOneAndUpdate(
      { requestId: idd, isActive: true },
      { $set: { isActive: false } },
      { new: true, session }
    );

    // If link is not active
    if (!forgotPassDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Link Expired! Go back and generate a New Link",
      });
    }

    // Encrypting the password
    const hashedPassword = bcrypt.hashSync(pass, 10);

    // Updating password
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: forgotPassDoc.userId },
      { $set: { password: hashedPassword } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
