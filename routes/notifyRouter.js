const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

const notifyCtrl = require("../controllers/notifyCtrl");

router.post("/notify", protect, notifyCtrl.createNotify);
router.get("/notifies", protect, notifyCtrl.getNotify);
router.delete("/notify/:id", protect, notifyCtrl.deleteNotify);

module.exports = router;
