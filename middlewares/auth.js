const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  console.log(req.headers.authorization);

  if (req.headers.authorization) {
    token = req.headers.authorization;
  }

  if (!token) {
    return next(new ErrorResponse("Not Authorized", 401));
  }
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  req.user = await Users.findById(decoded.id);

  next();
});
