const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
// app.use(express.static("public"));
// app.use(express.static("client/public"));
app.use(express.static(path.join(__dirname, "./client/public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Importing routes
const signupRoutes = require("./routes/sign-up");
const loginRoutes = require("./routes/login");
const ExpenseRoutes = require("./routes/expense");
const forgotpassRoutes = require("./routes/forgot-pass");
const downloadRoutes = require("./routes/download");

//Using routes
app.use(signupRoutes);
app.use(loginRoutes);
app.use(ExpenseRoutes);
app.use(forgotpassRoutes);
app.use(downloadRoutes);

mongoose
  .connect(
    "mongodb+srv://mohammedalifsd:1mBfLP40qBJg8OKl@cluster0.mkuais4.mongodb.net/expense-tracker?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("server connected");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
