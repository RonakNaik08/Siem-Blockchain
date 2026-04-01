import express from "express";
import http from "http";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

// CONFIG
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

// KAFKA
import { connectProducer, sendLog } from "./kafka/producer.js";

// SOCKET
import { initSocket, broadcast } from "./websocket/socket.server.js";

// UTILS
import { logger } from "./utils/logger.util.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
const server = http.createServer(app);

// 🔥 INIT SOCKET
initSocket(server);

// 🔥 CONNECT KAFKA
await connectProducer();

// 🔥 CONNECT DB
await connectDB();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// REQUEST LOGGING
app.use((req, res, next) => {
  logger.info({ url: req.url, method: req.method });
  next();
});


// =====================================================
// 🔥 MAIN LOG INGESTION ROUTE (KAFKA + REAL-TIME)
// =====================================================

app.post("/api/logs", async (req, res) => {
  try {
    const log = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      source: req.body.source || "app",
      level: req.body.level || "info",
      message: req.body.message || "No message",
    };

    // ✅ SEND TO KAFKA
    await sendLog(log);

    // 🔥 OPTIONAL: instant UI push (without waiting for Kafka)
    broadcast({
      ...log,
      threat: detectThreat(log),
    });

    res.json({ success: true, log });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: "Failed to process log" });
  }
});


// =====================================================
// 🔥 SIMPLE DETECTION ENGINE
// =====================================================

function detectThreat(log) {
  if (log.message.includes("failed")) return "brute-force";
  if (log.message.includes("unauthorized")) return "intrusion";
  if (log.message.includes("sql")) return "sql-injection";
  return null;
}


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


// ERROR HANDLER
app.use(errorHandler);


// START SERVER
server.listen(ENV.PORT || 4000, () => {
  console.log(`🚀 Backend running on ${ENV.PORT || 4000}`);
});