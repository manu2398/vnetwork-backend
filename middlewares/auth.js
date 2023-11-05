const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse("Not Authorized", 401));
  }
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  req.user = await Users.findById(decoded.id);

  next();
});
