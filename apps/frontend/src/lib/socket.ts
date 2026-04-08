import { io, Socket } from "socket.io-client";

const SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }
  return socket;
};