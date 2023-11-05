const Conversations = require("../models/conservationModel");
const Messages = require("../models/messageModel");
const asyncHandler = require("../utils/asyncHandler");

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  pagination = () => {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;

    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  };
}

const messageCtrl = {
  createMessage: asyncHandler(async (req, res, next) => {
    const { recipient, text, media } = req.body;

    if ((!text.trim() && media.length === 0) || !recipient) return;

    const newConversation = await Conversations.findOneAndUpdate(
      {
        $or: [
          { recipients: [req.user._id, recipient] },
          { recipients: [recipient, req.user._id] },
        ],
      },
      {
        recipients: [recipient, req.user._id],
        text,
        media,
      },
      { new: true, upsert: true }
    );

    const newMessage = new Messages({
      conversation: newConversation._id,
      sender: req.user._id,
      recipient,
      text,
      media,
    });

    await newMessage.save();

    res.json({ newConversation });
  }),

  getConversations: asyncHandler(async (req, res, next) => {
    const features = new APIFeatures(
      Conversations.find({
        recipients: req.user._id,
      }),
      req.query
    ).pagination();

    const conversations = await features.query
      .sort("-updatedAt")
      .populate("recipients", "fullname username avatar ");

    res.json({ conversations, result: conversations.length });
  }),

  getMessages: asyncHandler(async (req, res, next) => {
    const features = new APIFeatures(
      Messages.find({
        $or: [
          { sender: req.user._id, recipient: req.params.id },
          { sender: req.params.id, recipient: req.user._id },
        ],
      }),
      req.query
    ).pagination();

    const messages = await features.query.sort("-createdAt");

    res.json({ messages, result: messages.length });
  }),
};

module.exports = messageCtrl;
