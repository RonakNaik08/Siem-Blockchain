import http from "http";
import app from "./app.js"; // your express app
import { initSocket } from "./socket.js";

const server = http.createServer(app);

initSocket(server);

server.listen(4000, () => {
  console.log("🚀 API Gateway running on 4000");
});