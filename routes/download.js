const express = require("express");
const router = express.Router();
//middleware to validate tokenised user-id received as a header in the GET request
const userAuthentication = require("../middlewares/auth");
const expenseController = require("../controllers/expense");

router.get(
  "/download/expenses",
  userAuthentication.authenticate,
  expenseController.downloadExpenses
);

router.get(
  "/download/expenseurls",
  userAuthentication.authenticate,
  expenseController.getUrls
);

module.exports = router;
