const Comments = require("../models/commentModel");
const Posts = require("../models/postModel");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

const commentCtrl = {
  createComment: asyncHandler(async (req, res, next) => {
    const { postId, content, tag, reply, postUserId } = req.body;

    if (!content)
      return next(new ErrorResponse("Comment field cannot be empty", 400));

    const newComment = await Comments.create({
      user: req.user._id,
      content,
      tag,
      reply,
      postId,
      postUserId,
    });

    await Posts.findByIdAndUpdate(
      { _id: postId },
      { $push: { comments: newComment } },
      { new: true }
    );

    res.json({ newComment });
  }),

  updateComment: asyncHandler(async (req, res, next) => {
    const { content } = req.body;

    if (!content)
      return next(new ErrorResponse("Comment field cannot be empty", 400));

    const newComment = await Comments.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      { content },
      { new: true }
    );

    res.json({ msg: "Update Successfull", newComment });
  }),

  likeComment: asyncHandler(async (req, res, next) => {
    await Comments.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      { $push: { likes: req.user._id } },
      { new: true }
    );

    res.json({ msg: "Comment Liked" });
  }),

  unlikeComment: asyncHandler(async (req, res, next) => {
    const newComment = await Comments.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      { $pull: { likes: req.user._id } },
      { new: true }
    );

    res.json({ msg: "Comment unLiked", newComment });
  }),

  deleteComment: asyncHandler(async (req, res, next) => {
    const comment = await Comments.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { postUserId: req.user._id }],
    });

    await Posts.findOneAndUpdate(
      { _id: comment.postId },
      { $pull: { comments: req.params.id } }
    );

    res.json({ msg: "Comment deleted" });
  }),
};

module.exports = commentCtrl;
