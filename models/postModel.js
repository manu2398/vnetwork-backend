const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: String,
    images: {
      type: Array,
      required: [true, "Please add atleast one photo"],
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    link: { type: String },
    alias: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("post", postSchema);
