//Importing "Product" model to save and retrive data from the products table in the database
const UserModel = require("../models/user");
const ExpenseModel = require("../models/expense");
const OrderModel = require("../models/order");
const urlModel = require("../models/url");
const bcrypt = require("bcrypt");

/*************************************************************/
//  Fetching Data of Already Available Users
/*************************************************************/
exports.gethomePage = (request, response, next) => {
  response.sendFile("sign-up.html", { root: "client/public/views" });
};

/*************************************************************/
//  Fetching Data of Already Available Users
/*************************************************************/
exports.getUsers = async (req, res, next) => {
  try {
    // const users = await userModel.findAll({
    //   attributes: ["email", "phoneNumber"],
    // });

    const users = await UserModel.find();
    // console.log(users);
    res.status(200).json({ allUsers: users });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

/*************************************************************/
//  Adding New User
/*************************************************************/
exports.postAddUser = async (req, res, next) => {
  try {
    const uname = req.body.username;
    const uemail = req.body.email;
    const uphonenumber = req.body.mobile;
    const upassword = req.body.password;

    bcrypt.hash(upassword, 10, async (err, hash) => {
      console.log(err);

      // const data = await userModel.create({
      //   name: uname,
      //   email: uemail,
      //   phoneNumber: uphonenumber,
      //   password: hash,
      // });

      const user = new UserModel({
        name: uname,
        email: uemail,
        phoneNumber: uphonenumber,
        password: hash,
      });
      user.save();

      res.status(201).json({ newUserDetail: user });
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

/*************************************************************/
//  Deleting User
/*************************************************************/
exports.postDeleteUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // await UserModel.destroy({ where: { id: userId } });
    // await urlModel.destroy({ where: { userId: userId } });
    // await ExpenseModel.destroy({ where: { userId: userId } });
    // await OrderModel.destroy({ where: { userId: userId } });

    // Delete user
    await UserModel.deleteOne({ _id: userId });
    // Delete URLs associated with the user
    await urlModel.deleteMany({ userId: userId });
    // Delete expenses associated with the user
    await ExpenseModel.deleteMany({ userId: userId });
    // Delete orders associated with the user
    await OrderModel.deleteMany({ userId: userId });

    res.status(200).json({ message: "User Deleted succesfully!" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

/*************************************************************/
//  Editing User
/*************************************************************/
// exports.postEditUser = (req, res, next) => {
//   console.log("inside post editer backend");
//   const userId = req.params.userId;
//   const updatedName = req.body.uname;
//   const updatedEmail = req.body.email;
//   const updatedPhonenumber = req.body.mobile;
//   userModel
//     .update(
//       {
//         name: updatedName,
//         email: updatedEmail,
//         phonenumber: updatedPhonenumber,
//       },
//       { where: { id: userId } }
//     )
//     .then((user) => {
//       console.log("consoled updated succesfully");
//       res.send("updated successfully");
//     })
//     .catch((err) => console.log(err.message));
// };
