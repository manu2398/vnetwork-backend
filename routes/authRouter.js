const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

const authCtrl = require("../controllers/authCtrl");

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/logout", authCtrl.logout);
router.get("/me", protect, authCtrl.getLoggedInUser);
router.post("/refreshtoken", authCtrl.generateAccessToken);

module.exports = router;
