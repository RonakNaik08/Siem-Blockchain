import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});