let users = [];

const socketServer = (socket) => {
  // Connect-Disconnect
  socket.on("joinUser", (id) => {
    users.push({ id, socketId: socket.id });
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
  });

  // Likes
  socket.on("likePost", (post) => {
    const ids = [...post.user.followers, post.user._id];
    const clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("likeToClient", post);
      });
    }
  });

  socket.on("unlikePost", (post) => {
    const ids = [...post.user.followers, post.user._id];
    const clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("unlikeToClient", post);
      });
    }
  });

  // create-delete notify
  socket.on("createNotify", (msg) => {
    const clients = users.filter((user) => msg.recepients.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("createNotifyToClient", msg);
      });
    }
  });

  socket.on("deleteNotify", (msg) => {
    const clients = users.filter((user) => msg?.recepients.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("deleteNotifyToClient", msg);
      });
    }
  });

  // message
  socket.on("addMessage", (msg) => {
    const user = users.find((user) => user.id === msg.recipient);

    user && socket.to(`${user.socketId}`).emit("addMessageToClient", msg);
  });
};

module.exports = socketServer;
