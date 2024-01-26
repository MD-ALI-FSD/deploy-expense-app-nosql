const Razorpay = require("razorpay");
const ExpenseModel = require("../models/expense");
const OrderModel = require("../models/order");
const UserModel = require("../models/user");
const urlModel = require("../models/url");

const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../utils/database");
const mongoose = require("mongoose");

const AWS = require("aws-sdk");

/*************************************************************/
//  Render Expense Page
/*************************************************************/
exports.getExpensePage = (request, response, next) => {
  response.sendFile("expense.html", { root: "client/public/views" });
};

/*************************************************************/
//  Render Detailed-Expense Page
/*************************************************************/
exports.getDetailedExpensePage = (request, response, next) => {
  response.sendFile("detailed-expense.html", { root: "client/public/views" });
};

/*******************************************************/
// DOWNLOAD-Expense File
/*******************************************************/
//helper function to upload to s3 bucket
function uploadTos3(data, filename) {
  const Bucket_Name = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  //bucket instance
  let s3Bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    // Bucket: Bucket_Name,
  });

  var params = {
    Bucket: Bucket_Name,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("something  went wrong", err);
        reject(err);
      } else {
        console.log("success", s3response);
        resolve(s3response.Location);
      }
    });
  });
}

exports.downloadExpenses = async (req, res) => {
  try {
    console.log("inside download exp backend");
    const userId = req.user._id;

    // const expenses = await expenseModel.findAll({
    //   where: { userId: userid },
    // });
    const expenses = await ExpenseModel.find({ _id: userId });

    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expenses${userId}/${new Date()}.txt`;
    //function call
    const fileURL = await uploadTos3(stringifiedExpenses, filename);
    console.log(fileURL);
    await urlModel.create({
      url: fileURL,
      userId: userId,
    });
    res
      .status(200)
      .json({ fileURL, success: true, message: "File downloaded!" });
  } catch (err) {
    res.status(500).json({ fileURL: "", success: false, err: err });
  }
};

/*******************************************************/
// DOWNLOAD-Expense File Urls
/*******************************************************/
exports.getUrls = async (req, res) => {
  try {
    const urls = await urlModel.find({ userId: req.user._id });
    res.status(200).json({ urls, success: true });
  } catch (err) {
    res.status(404).send("Data not found");
  }
};

/*******************************************************/
//Add-Expense Controller
/*******************************************************/
exports.postAddExpense = async (req, res, next) => {
  //to abort a transaction if any error at any step
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("inside add backend");
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;
    const user = req.user;
    console.log("user back==>", user);

    const newExpense = await ExpenseModel.create(
      [
        {
          amount,
          description,
          category,
          userId: user._id,
        },
      ],
      { new: true, session }
    );

    console.log("new expense==>", newExpense);

    const totExp = user.totalExpenses + Number(amount);
    console.log("totExp==>", totExp);

    // Updating user
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { totalExpenses: totExp } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).send("Expense Added Successfully!!!");
  } catch (err) {
    res.status(500).json(err);
  }
};

/*******************************************************/
//  GET Expense Controller
/*******************************************************/
exports.getExpense = async (req, res, next) => {
  try {
    console.log("inside get exp back");
    const user = req.user;

    const expenses = await ExpenseModel.find(
      { userId: user._id } // Your query conditions
    );

    //fetching top 3 users by expense
    const topUsers = await UserModel.find()
      .sort({ totalExpenses: -1 }) //Sort in descending order based on totalexp
      .select("name totalExpenses") //Select only 'name' and 'totalExpenses'
      .limit(3); // Limit the result to 3 documents

    // const topUsers = await userModel.findAll({
    //   order: [["totalExpenses", "DESC"]],
    //   attributes: ["name", "totalExpenses"],
    //   limit: 3,
    // });

    res.status(200).json({
      expensesDetails: expenses,
      totalExpense: user.totalExpenses,
      topUsers: topUsers,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

/*******************************************************/
//  GET Single User Details
/*******************************************************/
exports.getUserDetails = async (req, res, next) => {
  try {
    console.log("inside get orders backend");
    console.log(req.user.id);
    const user = await UserModel.findAll({
      where: { _id: req.user._id },
    });

    // console.log(user);
    res.status(200).json({ users: user });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

/*******************************************************/
// Delete Single Expense
/*******************************************************/
exports.postDeleteExpense = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("inside post delete backend");
    const expenseId = req.params.expenseId;
    const user = req.user;

    // Fetching expense
    const expense = await ExpenseModel.findById(expenseId).session(session);
    if (!expense) {
      throw new Error("Expense not found");
    }

    // Fetching user
    const userData = await UserModel.findById(user._id).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedAmount = user.totalExpenses - expense.amount;
    console.log("updated amount: " + updatedAmount);

    // Update the user's totalExpenses
    await UserModel.findByIdAndUpdate(user._id, {
      totalExpenses: updatedAmount,
    }).session(session);

    // Remove the expense
    await expense.deleteOne().session(session);

    await session.commitTransaction(); // Commit the transaction
    res.status(200).send("Deleted successfully");
  } catch (err) {
    await session.abortTransaction(); // Rollback the transaction in case of an error
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

/*******************************************************/
// Edit Expense
/*******************************************************/
exports.postEditExpense = async (req, res, next) => {
  try {
    console.log("inside post edit expense backend");
    const expenseId = req.params.expenseId;
    console.log("exp id==>", expenseId);

    const amount = req.body.amount;
    const description = req.body.discription;
    const category = req.body.category;

    const filter = { _id: expenseId }; // Specify the condition for the update
    const update = {
      $set: {
        amount: amount,
        description: description,
        category: category,
      },
    };
    const result = await ExpenseModel.updateOne(filter, update);

    //WE CAN DO THIS TOO..
    // const updatedUser = await ExpenseModel.findOneAndUpdate(
    //   { _id: expenseId },
    //   { $set: { amount: amount, description: description, category: category } },
    //   { new: true, session }
    // );

    res.send("updated successfully");
  } catch (err) {
    console.log(err.message);
  }
};

/*******************************************************/
//Create Premium Order
/*******************************************************/
exports.getPurchasePremium = async (req, res) => {
  try {
    //  Initialize Razorpay with  API key_id and key_secret
    let rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 100;

    // if successfull then Razorpay creates an "order"
    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      if (err) {
        console.log("inside rzp error");
        throw new Error(JSON.stringify(err));
      }

      try {
        // If successful, create a new order in the database using Sequelize's create method.
        const createdOrder = await OrderModel.create({
          orderId: order.id,
          status: "PENDING",
          userId: req.user._id,
        });
        //It sends a JSON response to the frontend containing the order details and Razorpay key.
        return res
          .status(201)
          .json({ order: createdOrder, key_id: rzp.key_id });
      } catch (err) {
        throw new Error(err);
      }
    });
  } catch (err) {
    console.error(err);
    res
      .status(403)
      .json({ message: "Something went wrong", error: err.message });
  }
};

/*******************************************************/
//  Update Transaction Status after payment
/*******************************************************/
exports.postUpdateTransactionStatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;

    //1) verify premium order
    const order = await OrderModel.find({ orderId: order_id });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    //2) Update the specific order status to success.
    const updateData = {
      paymentId: payment_id,
      status: "SUCCESSFUL",
    };
    const filter = { orderId: order_id }; //Specify the condition for the update
    const result = await OrderModel.updateOne(filter, updateData);

    //3) make that user premium.
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { isPremiumUser: true } }
    );

    return res
      .status(202)
      .json({ success: true, message: "Transaction Successful" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
