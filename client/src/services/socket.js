import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL && import.meta.env.VITE_SOCKET_URL.startsWith("http")) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith("http")) {
    return import.meta.env.VITE_API_URL.replace("/api", "");
  }
  return "";
};

export const socket = io(getSocketUrl(), {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const connectSocket = (userData) => {
  if (!socket.connected) {
    socket.connect();
    if (userData) {
      socket.emit("setup", userData);
    }
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
