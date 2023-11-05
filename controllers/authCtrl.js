const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

//api             /api/register
//@access         Public
const authCtrl = {
  register: asyncHandler(async (req, res, next) => {
    const { fullname, username, email, password, gender } = req.body;
    let newUserName = username?.toLowerCase().replace(/ /g, "");

    //create user
    const user = await Users.create({
      fullname,
      username: newUserName,
      email,
      password,
      gender,
    });

    sendTokenResponse(user, 200, res);
  }),

  //api             /api/login
  //@access         Public
  login: asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    //Validate inputs as they are not going thru model
    if (!email || !password)
      return next(
        new ErrorResponse("Please provide an email or a password", 400)
      );

    //check for user
    const user = await Users.findOne({ email })
      .populate("followers following")
      .select("+password");
    if (!user) return next(new ErrorResponse("Incorrect credentials", 401));

    //check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return next(new ErrorResponse("Incorrect credentials", 401));

    sendTokenResponse(user, 200, res);
  }),

  //api             GET /api/me
  //@access         Private
  getLoggedInUser: asyncHandler(async (req, res, next) => {
    const user = await Users.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  }),

  logout: asyncHandler(async (req, res, next) => {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.json({ success: true, msg: "Logged out Successfully" });
  }),

  generateAccessToken: asyncHandler(async (req, res, next) => {
    const rf_token = req.cookies.token;

    if (!rf_token) return next(new ErrorResponse("Please login now", 400));

    jwt.verify(
      rf_token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, result) => {
        if (err) return next(new ErrorResponse("Please login now", 400));

        const user = await Users.findById(result.id).populate(
          "followers following"
        );

        if (!user) return next(new ErrorResponse("User does not exists", 400));

        const access_token = createAccessToken({ id: result.id });

        res.json({
          access_token,
          ...user._doc,
        });
      }
    );
  }),
};

module.exports = authCtrl;

// Generate tokens
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const access_token = createAccessToken({ id: user._id });
  const refresh_token = createRefreshToken({ id: user._id });

  // res.cookie("refreshtoken", refresh_token, {
  //   httpOnly: true,
  //   // path: "/api/refreshtoken",
  //   maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
  // });

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", refresh_token, options)
    .json({
      success: true,
      access_token,
      ...user._doc,
      password: "",
    });
};
