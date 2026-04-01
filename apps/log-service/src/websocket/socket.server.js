import { Server } from "socket.io";

let io;

// ✅ INIT SOCKET
export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
}

// ✅ EMIT LOG
export function emitLog(log) {
  if (io) {
    io.emit("new_log", log);
  }
}

// ✅ EMIT ALERT
export function emitAlert(alert) {
  if (io) {
    io.emit("new_alert", alert);
  }
}