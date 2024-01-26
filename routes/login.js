const express = require("express");
const router = express.Router();
//importing controllers from 'products.js' file.
const loginController = require("../controllers/login");

router.get("/login-page", loginController.getLoginPage);

router.post("/user/login", loginController.postVerifyUser);

module.exports = router;
