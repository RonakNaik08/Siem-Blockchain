import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:5000");

export const broadcast = (data) => {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
};