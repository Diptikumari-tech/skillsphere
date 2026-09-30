import { Server } from "socket.io";

const onlineUsers = new Map(); // userId -> socketId

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Setup user personal socket room & online tracking
    socket.on("setup", (userData) => {
      if (userData && userData._id) {
        socket.userId = userData._id;
        socket.join(userData._id);
        onlineUsers.set(userData._id, socket.id);
        socket.emit("connected");
        io.emit("online_users", Array.from(onlineUsers.keys()));
        console.log(`👤 User ${userData._id} connected and joined room`);
      }
    });

    // Private Chat room join & leave
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`💬 Socket ${socket.id} joined chat room: ${chatId}`);
    });

    socket.on("leave_chat", (chatId) => {
      socket.leave(chatId);
      console.log(`💬 Socket ${socket.id} left chat room: ${chatId}`);
    });

    // Real-time message forwarding
    socket.on("new_message", (newMessageReceived) => {
      const chatId = typeof newMessageReceived.chat === "object" ? newMessageReceived.chat._id : newMessageReceived.chat;
      if (!chatId) return;

      socket.to(chatId).emit("message_received", newMessageReceived);
      if (newMessageReceived.receiver) {
        socket.to(newMessageReceived.receiver).emit("message_notification", newMessageReceived);
      }
    });

    // Typing indicators
    socket.on("typing", (data) => {
      const chatId = typeof data === "string" ? data : data?.chatId;
      if (chatId) socket.to(chatId).emit("typing", data);
    });

    socket.on("stop_typing", (data) => {
      const chatId = typeof data === "string" ? data : data?.chatId;
      if (chatId) socket.to(chatId).emit("stop_typing", data);
    });

    // WebRTC Signaling Events
    socket.on("join_call", (data) => {
      const { roomId, userId } = data || {};
      socket.join(roomId);
      console.log(`📹 User ${userId} joined video call room: ${roomId}`);
      socket.to(roomId).emit("user_joined_call", { userId, socketId: socket.id });
    });

    socket.on("call_user", (data) => {
      socket.to(data.userToCall).emit("call_user", {
        signal: data.signalData,
        from: data.from,
        name: data.name,
      });
    });

    socket.on("answer_call", (data) => {
      socket.to(data.to).emit("call_accepted", data.signal);
    });

    socket.on("ice_candidate", (data) => {
      socket.to(data.to).emit("ice_candidate", data.candidate);
    });

    socket.on("end_call", (data) => {
      const { roomId } = data || {};
      if (roomId) {
        socket.to(roomId).emit("user_left_call", { socketId: socket.id });
        socket.leave(roomId);
      }
    });

    // Handle Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
