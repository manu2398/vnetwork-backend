const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

const postCtrl = require("../controllers/postCtrl");

router.post("/posts", protect, postCtrl.createPost);
router.get("/posts", protect, postCtrl.getPosts);
router.get("/user-posts/:username", protect, postCtrl.getUserPosts);
router.patch("/posts/:id", protect, postCtrl.updatePost);
router.get("/post/:id", protect, postCtrl.getPost);
router.patch("/posts-like/:id", protect, postCtrl.likePost);
router.patch("/posts-unlike/:id", protect, postCtrl.unLikePost);
router.delete("/post/:id", protect, postCtrl.deletePost);

module.exports = router;
