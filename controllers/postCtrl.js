const Posts = require("../models/postModel");
const Comments = require("../models/commentModel");
const Users = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

const postCtrl = {
  createPost: asyncHandler(async (req, res, next) => {
    const { content, images, alias, link } = req.body;

    if (images.length === 0)
      return next(new ErrorResponse("Please add atleast one photo", 400));

    const newPost = new Posts({
      content,
      images,
      alias,
      link,
      user: req.user._id,
    });

    await newPost.save();

    res.json({ newPost: { ...newPost._doc, user: req.user } });
  }),

  getPosts: asyncHandler(async (req, res, next) => {
    const posts = await Posts.find({
      user: [...req.user.following, req.user._id],
    })
      .sort("-createdAt")
      .populate("user likes", "avatar username fullname followers")
      .populate({
        path: "comments",
        populate: {
          path: "user likes",
        },
      });
    res.json({ success: true, result: posts.length, posts });
  }),

  updatePost: asyncHandler(async (req, res, next) => {
    const { content, images, alias, link } = req.body;

    const post = await Posts.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      { content, images, alias, link },
      { new: true }
    )
      .populate("user likes", "avatar username fullname")
      .populate({
        path: "comments",
        populate: {
          path: "user likes",
        },
      });

    res.json({
      msg: "Post Updated Successfully",
      newPost: { ...post._doc, content, images, alias, link },
    });
  }),

  likePost: asyncHandler(async (req, res, next) => {
    await Posts.findByIdAndUpdate(
      { _id: req.params.id },
      { $push: { likes: req.user._id } },
      { new: true }
    );
    res.json({ msg: "Liked" });
  }),

  unLikePost: asyncHandler(async (req, res, next) => {
    await Posts.findByIdAndUpdate(
      { _id: req.params.id },
      { $pull: { likes: req.user._id } },
      { new: true }
    );
    res.json({ msg: "UnLiked" });
  }),

  getUserPosts: asyncHandler(async (req, res, next) => {
    const myUser = await Users.find({ username: req.params.username });

    if (myUser.length === 0)
      return next(
        new ErrorResponse(
          `Cannot find user with ${req.params.username} username`,
          400
        )
      );

    const posts = await Posts.find({ user: myUser[0]._id }).sort("-createdAt");

    res.json({ posts, result: posts.length });
  }),

  getPost: asyncHandler(async (req, res, next) => {
    const post = await Posts.findById(req.params.id)
      .populate("user likes", "avatar username fullname followers")
      .populate({
        path: "comments",
        populate: {
          path: "user likes",
        },
      });

    if (!post)
      return next(new ErrorResponse("Post is no longer available", 400));

    res.json({ post });
  }),

  deletePost: asyncHandler(async (req, res, next) => {
    const post = await Posts.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    await Comments.deleteMany({ _id: { $in: post.comments } });

    res.json({ msg: "Post deleted" });
  }),
};

module.exports = postCtrl;
