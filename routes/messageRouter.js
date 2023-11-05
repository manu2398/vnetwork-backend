const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

const messageCtrl = require("../controllers/messageCtrl");

router.post("/message", protect, messageCtrl.createMessage);
router.get("/conversations", protect, messageCtrl.getConversations);
router.get("/message/:id", protect, messageCtrl.getMessages);

module.exports = router;
