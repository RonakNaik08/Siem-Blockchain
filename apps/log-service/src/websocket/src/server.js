import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 5000 });

let clients = [];

wss.on("connection", (ws) => {
  console.log("🔌 Client connected");

  clients.push(ws);

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
  });
});

export const broadcast = (data) => {
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
};

console.log("🚀 WebSocket Server running on 5000");