const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

const userCtrl = require("../controllers/userCtrl");

router.get("/search-users", protect, userCtrl.searchUser);
router.get("/get-user/:username", protect, userCtrl.getUser);
router.patch("/user", protect, userCtrl.updateUser);
router.patch("/user/follow/:username", protect, userCtrl.follow);
router.patch("/user/un-follow/:username", protect, userCtrl.unFollow);

module.exports = router;
