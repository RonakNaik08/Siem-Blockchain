import express from "express";
import http from "http";
import cors from "cors";
import { initSocket } from "./socket.js";

import logRoutes from "./routes/log.routes.js";
import verifyRoutes from "./routes/verify.routes.js";
import { emitEvent } from "./socket.js";

app.post("/internal/emit", (req, res) => {
  const { event, data } = req.body;

  emitEvent(event, data);

  res.sendStatus(200);
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/logs", logRoutes);
app.use("/api/verify", verifyRoutes);

const server = http.createServer(app);
initSocket(server);

server.listen(5000, () => {
  console.log("Gateway running on port 5000");
});