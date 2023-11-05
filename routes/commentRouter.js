const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

const commentCtrl = require("../controllers/commentCtrl");

router.post("/comment", protect, commentCtrl.createComment);
router.patch("/comment/:id", protect, commentCtrl.updateComment);
router.patch("/comment/:id/like", protect, commentCtrl.likeComment);
router.patch("/comment/:id/unlike", protect, commentCtrl.unlikeComment);
router.delete("/comment/:id", protect, commentCtrl.deleteComment);

module.exports = router;
