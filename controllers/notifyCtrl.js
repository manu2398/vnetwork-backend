const Notify = require("../models/notifyModel");
const asyncHandler = require("../utils/asyncHandler");

const notifyCtrl = {
  createNotify: asyncHandler(async (req, res, next) => {
    const { id, recepients, text, url, content, image } = req.body;

    if (recepients.includes(req.user._id.toString())) return;

    //create user
    const newNotify = await Notify.create({
      id,
      recepients,
      text,
      url,
      content,
      image,
      user: req.user._id,
    });

    res.json({ newNotify });
  }),

  getNotify: asyncHandler(async (req, res, next) => {
    const notifies = await Notify.find({ recepients: req.user._id })
      .sort("-createdAt")
      .populate("user", "avatar username");

    return res.json({ notifies });
  }),

  deleteNotify: asyncHandler(async (req, res, next) => {
    const notify = await Notify.findOneAndDelete({
      id: req.params.id,
      url: req.query.url,
    });
    return res.json({ notify });
  }),
};

module.exports = notifyCtrl;
