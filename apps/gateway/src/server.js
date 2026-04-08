import express from "express";
import http from "http";
import cors from "cors";
import { initSocket, emitEvent } from "./socket.js";

import logRoutes from "./routes/log.routes.js";
import verifyRoutes from "./routes/verify.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// ── Internal emit endpoint (called by stream-processor) ──────────────────
app.post("/internal/emit", (req, res) => {
  const { event, data } = req.body;
  emitEvent(event, data);
  res.sendStatus(200);
});

// ── Public API routes ────────────────────────────────────────────────────
app.use("/api/logs", logRoutes);
app.use("/api/verify", verifyRoutes);

// ── Health check ─────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

const server = http.createServer(app);
initSocket(server);

server.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Gateway running on port ${process.env.PORT || 5000}`);
});