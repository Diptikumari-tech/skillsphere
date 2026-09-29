import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";

dotenv.config();

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during local development testing
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SkillSphere MERN API Backend! 🚀",
    frontendUrl: process.env.CLIENT_URL || "http://localhost:5173",
    healthCheck: "/api/health",
    documentation: "/README.md",
  });
});

// API Root Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SkillSphere MERN API Server is running smoothly 🚀",
    timestamp: new Date(),
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on("setup", (userData) => {
    if (userData && userData._id) {
      socket.userId = userData._id;
      socket.join(userData._id);
      onlineUsers.set(userData._id, socket.id);
      socket.emit("connected");
      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log(`👤 User ${userData._id} joined personal socket room`);
    }
  });

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`💬 User joined chat room: ${chatId}`);
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    console.log(`💬 User left chat room: ${chatId}`);
  });

  socket.on("new_message", (newMessageReceived) => {
    const chat = typeof newMessageReceived.chat === "object" ? newMessageReceived.chat._id : newMessageReceived.chat;
    if (!chat) return;

    socket.to(chat).emit("message_received", newMessageReceived);
    if (newMessageReceived.receiver) {
      socket.to(newMessageReceived.receiver).emit("message_notification", newMessageReceived);
    }
  });

  socket.on("typing", (data) => {
    const chatId = typeof data === "string" ? data : data.chatId;
    socket.to(chatId).emit("typing", data);
  });

  socket.on("stop_typing", (data) => {
    const chatId = typeof data === "string" ? data : data.chatId;
    socket.to(chatId).emit("stop_typing", data);
  });

  socket.on("send_notification", (notification) => {
    if (notification && notification.recipient) {
      socket.to(notification.recipient).emit("new_notification", notification);
    }
  });

  socket.on("session_created", (session) => {
    if (session && session.participant) {
      socket.to(session.participant).emit("session_created", session);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    }
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const DEFAULT_PORT = parseInt(process.env.PORT || "5000", 10);

const startServer = (port) => {
  server.listen(port, "0.0.0.0", () => {
    console.log(`
    ======================================================
    🚀 SkillSphere Server is running in ${process.env.NODE_ENV || "development"} mode
    📡 Listening on: http://0.0.0.0:${port}
    🔗 API Health Check: http://localhost:${port}/api/health
    ======================================================
    `);
  });
};

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.warn(`⚠️ Port ${DEFAULT_PORT} is in use. Retrying on port ${DEFAULT_PORT + 1}...`);
    startServer(DEFAULT_PORT + 1);
  } else {
    console.error("Server error:", err);
  }
});

startServer(DEFAULT_PORT);
