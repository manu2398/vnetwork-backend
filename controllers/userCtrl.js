const Users = require("../models/userModel");

const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

const userCtrl = {
  searchUser: asyncHandler(async (req, res, next) => {
    const users = await Users.find({ username: { $regex: req.query.username } })
      .limit(10)
      .select("fullname username avatar");

    res.json({ users });
  }),

  getUser: asyncHandler(async (req, res, next) => {
    const user = await Users.find({
      username: req.params.username,
    }).populate("followers following");

    if (user.length === 0)
      return next(
        new ErrorResponse(
          `Cannot find user with ${req.params.username} username`,
          400
        )
      );

    res.json({ user });
  }),

  updateUser: asyncHandler(async (req, res, next) => {
    const { avatar, fullname, bio, alias, website } = req.body;

    if (!fullname)
      return next(new ErrorResponse(`Please provide your full name`, 400));

    await Users.findOneAndUpdate(
      { _id: req.user._id },
      { avatar, fullname, bio, alias, website }
    );

    res.json({ msg: "Updated Successfully" });
  }),

  follow: asyncHandler(async (req, res, next) => {
    const user = await Users.find({
      username: req.params.username,
      followers: req.user._id,
    });

    if (user.length > 0)
      return next(
        new ErrorResponse(`You already follow ${user[0].username}`, 500)
      );

    const myUser = await Users.find({ username: req.params.username });

    await Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $push: { followers: req.user._id },
      },
      { new: true }
    );

    await Users.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: { following: myUser[0]._id },
      },
      { new: true }
    );

    res.json({ msg: `Followed ${req.params.username}` });
  }),

  unFollow: asyncHandler(async (req, res, next) => {
    const myUser = await Users.find({ username: req.params.username });

    await Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $pull: { followers: req.user._id },
      },
      { new: true }
    );

    await Users.findOneAndUpdate(
      { _id: req.user._id },
      {
        $pull: { following: myUser[0]._id },
      },
      { new: true }
    );

    res.json({ msg: `Unfollowed ${req.params.username}` });
  }),
};

module.exports = userCtrl;
