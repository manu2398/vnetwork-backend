const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please add full name"],
      maxlength: 25,
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Please add username"],
      maxlength: 25,
      trim: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Please add email"],
      trim: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [6, "Minimum password length is 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dmiu93fth/image/upload/v1667409327/v-network/rbevmln1zfdbdsgifvgc.png",
    },
    website: {
      type: String,
      match: [
        /^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-\.@:%_\+~#=]+)+((\.[a-zA-Z]{2,3})+)(\/(.)*)?(\?(.)*)?/g,
        "Please add a valid url",
      ],
    },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    gender: { type: String, default: "male", enum: ["male", "female"] },
    alias: { type: String },
    bio: { type: String, maxlength: 255 },
    followers: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    following: [{ type: mongoose.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

//encrypt using bcrypt
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//match user entered password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("user", userSchema);
