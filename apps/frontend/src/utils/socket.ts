import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket: Socket;

if (!globalThis.__socket) {
  globalThis.__socket = io(SOCKET_URL, {
    transports: ["websocket"], // force websocket (no polling)
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
}

socket = globalThis.__socket;

export { socket };