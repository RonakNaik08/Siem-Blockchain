import { WebSocketServer } from "ws";

let wss;

export const initSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");
  });
};

export const broadcast = (data) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    client.send(JSON.stringify(data));
  });
};