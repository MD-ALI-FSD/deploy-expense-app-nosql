const express = require("express");
const router = express.Router();

//importing controllers from 'products.js' file.
const signupController = require("../controllers/sign-up");
//middleware to validate tokenised user-id received as a header in the GET request
const userAuthentication = require("../middlewares/auth");

router.get("/", signupController.gethomePage);

router.post("/signup", signupController.postAddUser);

router.get("/get-user", signupController.getUsers);

router.delete(
  "/delete-user",
  userAuthentication.authenticate,
  signupController.postDeleteUser
);

// router.put("/user/edit-user/:userId", userController.postEditUser);

module.exports = router;
