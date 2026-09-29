import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL && import.meta.env.VITE_SOCKET_URL.startsWith("http")) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  return "";
};

export const socket = io(getSocketUrl(), {
  autoConnect: false,
});

export const connectSocket = (userData) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit("setup", userData);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
