const UserModel = require("../models/user");
const forgotPassModel = require("../models/forgot-pass");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sib = require("sib-api-v3-sdk");

const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();

/*************************************************************/
//  Fetching Data of Already Available Users
/*************************************************************/
exports.getLoginPage = (request, response, next) => {
  response.sendFile("login.html", { root: "client/public/views" });
};

/***********************************************************/
//  Controller to verify User before loggin in
/***********************************************************/
//helper function to verify credentials
function isstringinvalid(string) {
  if (string == undefined || string.length === 0) {
    return true;
  } else {
    return false;
  }
}
//helper function to generate tokenised user-Id from userid
const token = process.env.TOKEN_SECRET;
function generateAccessToken(id) {
  return jwt.sign({ userId: id }, token);
}

exports.postVerifyUser = async (req, res, next) => {
  try {
    const uemail = req.body.email;
    const upassword = req.body.password;

    //data validation
    if (isstringinvalid(uemail) || isstringinvalid(upassword)) {
      return res
        .status(400)
        .json({ message: "Email id or password is missing" });
    }

    //fetching data from the user table and then comparing it.
    const user = await UserModel.find({ email: uemail });

    if (user.length > 0) {
      //comparing hashed user-id with real user-id in the table
      bcrypt.compare(upassword, user[0].password, (err, result) => {
        if (err) {
          res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
        }
        if (result === true) {
          console.log("type==>", typeof user[0]._id);
          res.status(200).json({
            success: true,
            message: "user logged in successfully",
            token: generateAccessToken(user[0].id),
          });
        } else {
          return res
            .status(401)
            .json({ success: false, message: "password is incorrect" });
        }
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
  } catch (err) {
    res.status(500).json({ message: err, success: false });
  }
};
