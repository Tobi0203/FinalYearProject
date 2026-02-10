const { Server } = require("socket.io");
const onlineUsers = require("./onlineUsers");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://social-hub-connect.vercel.app",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // 🔥 USER COMES ONLINE
    socket.on("addUser", (userId) => {
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);

      // 🔥 THIS IS THE MISSING LINE
      socket.join(userId.toString());

      console.log("User joined room:", userId);


      socket.on("sendMessage", ({ receiverId, message }) => {
        const receiverSocketId = onlineUsers.get(receiverId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", message);
        }
      });

      // ✅ SEND FULL ONLINE USERS LIST TO THIS USER
      socket.emit(
        "onlineUsers",
        Array.from(onlineUsers.keys())
      );

      // ✅ NOTIFY OTHERS
      socket.broadcast.emit("onlineStatus", {
        userId,
        isOnline: true,
      });
    });

    // 🔥 USER GOES OFFLINE
    socket.on("disconnect", () => {
      const userId = socket.userId;

      if (userId) {
        onlineUsers.delete(userId);

        socket.broadcast.emit("onlineStatus", {
          userId,
          isOnline: false,
        });
      }

      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = { initSocket };
