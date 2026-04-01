import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);
  });
};

// 🔥 REPLACE broadcast WITH THIS
export const broadcast = (data) => {
  if (!io) return;
  io.emit("new_log", data);
};