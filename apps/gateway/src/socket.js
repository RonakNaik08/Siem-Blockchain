import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
    });
  });
};

export const emitEvent = (event, data) => {
  if (io) io.emit(event, data);
};