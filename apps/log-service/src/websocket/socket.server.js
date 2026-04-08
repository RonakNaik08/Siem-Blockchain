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
    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => io;

/** Broadcast any event to all connected clients */
export const broadcast = (data) => {
  if (!io) return;
  io.emit("new-log", data);
};

/** Named emit for logs (alias used by log.service.js) */
export const emitLog = (data) => {
  if (!io) return;
  io.emit("new-log", data);
};