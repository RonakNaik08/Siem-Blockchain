import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  });
};

export const sendLogToUI = (log) => {
  if (io) {
    io.emit("new-log", log);
  }
};