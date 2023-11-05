require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const socketServer = require("./socketServer");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

io.on("connection", (socket) => {
  socketServer(socket);
});

app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api", require("./routes/authRouter"));
app.use("/api", require("./routes/userRouter"));
app.use("/api", require("./routes/postRouter"));
app.use("/api", require("./routes/commentRouter"));
app.use("/api", require("./routes/notifyRouter"));
app.use("/api", require("./routes/messageRouter"));

app.use(errorHandler);

const URI = process.env.MONGODB_URL;
mongoose.connect(
  URI,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to mongodb");
  }
);

const port = process.env.PORT || 9000;
http.listen(port, () => {
  console.log("Server is running on port", port);
});
