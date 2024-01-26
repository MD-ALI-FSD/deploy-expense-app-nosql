const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

// Import the variable from loginController.js file
// const importedToken = require("../backend/controller/loginController");

exports.authenticate = (req, res, next) => {
  try {
    console.log("inside auth");
    //token recived from the header of the GET request
    const token = req.header("Authorization");

    //decrypting tokenised user-id
    const user = jwt.verify(token, "69EdyIEvGh2Dj2jlihmhOhZ9S2VwvGMb");
    console.log("inside auth user==>", user);

    // checking the user table for a user with this user-id
    UserModel.findById(user.userId)
      .then((user) => {
        req.user = user;

        next();
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false });
  }
};
