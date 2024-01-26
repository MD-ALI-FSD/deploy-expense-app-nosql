const express = require("express");
const router = express.Router();

//importing controllers from 'products.js' file.
const ExpenseController = require("../controllers/expense");
//middleware to validate tokenised user-id received as a header in the GET request
const userAuthentication = require("../middlewares/auth");

router.get("/expense-page", ExpenseController.getExpensePage);

router.get("/detailed-expense-page", ExpenseController.getDetailedExpensePage);

//router to add Expenses
router.post(
  "/addexpense",
  userAuthentication.authenticate,
  ExpenseController.postAddExpense
);

//router to edit expense details.
router.put("/editexpense/:expenseId", ExpenseController.postEditExpense);

//router to delete an expense
router.delete(
  "/deleteexpense/:expenseId",
  userAuthentication.authenticate,
  ExpenseController.postDeleteExpense
);

//router to get expenses
router.get(
  "/getexpense",
  userAuthentication.authenticate,
  ExpenseController.getExpense
);

//router to get purchase premium order id.
router.get(
  "/purchasepremium",
  userAuthentication.authenticate,
  ExpenseController.getPurchasePremium
);
//router to Update orders table after purchasing premium.
router.post(
  "/updatetransactionstatus",
  userAuthentication.authenticate,
  ExpenseController.postUpdateTransactionStatus
);

// //router to get details of a single user.
router.get(
  "/getuser",
  userAuthentication.authenticate,
  ExpenseController.getUserDetails
);

module.exports = router;
