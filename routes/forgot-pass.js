const express = require("express");
const router = express.Router();

//importing controllers from 'products.js' file.
const forgotController = require("../controllers/forgot");
//middleware to validate tokenised user-id received as a header in the GET request
const userAuthentication = require("../middlewares/auth");

router.get("/forgot-password-page", forgotController.getForgotPasswordPage);

router.post("/forgot-password-email", forgotController.postForgotPasswordEmail);

router.get("/password/verifyLink/:uniqueId", forgotController.postVerifyLink);

router.post("/resetpassword", forgotController.PostCreateNewPassword);

module.exports = router;
