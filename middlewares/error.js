const ErrorResponse = require("../utils/ErrorResponse");

const errorHandler = (err, req, res, next) => {
  console.log(err.stack);
  //enumerable
  let error = { ...err };
  error.message = err.message;

  // Mongp Bad object ID
  if (err.name === "CastError") {
    const message = `Resource not found with the id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //Mongo duplicate key ID
  if (err.code === 11000) {
    const message =
      err.keyValue[Object.keys(err.keyValue)] + " is already in use";
    error = new ErrorResponse(message, 400);
  }

  //Regular expression error for search bar
  if (err.code === 51091) {
    const message = "Not a valid search item";
    error = new ErrorResponse(message, 400);
  }

  //Mongoose Validation error
  if (err.name === "ValidationError") {
    const message = Object.values(error.errors).map((err) => err.message);
    error = new ErrorResponse(message, 400);
  }

  //JSON webtoken error
  if (err.name === "JsonWebTokenError") {
    const message = "Not Authorized";
    error = new ErrorResponse(message, 401);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, msg: error.message || "Server Error" });
};

module.exports = errorHandler;
